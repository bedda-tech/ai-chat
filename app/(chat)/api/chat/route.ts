import { createMCPClient } from "@ai-sdk/mcp";
import { createOpenAI, openai } from "@ai-sdk/openai";
import * as Sentry from "@sentry/nextjs";
import { geolocation } from "@vercel/functions";
import {
  convertToModelMessages,
  createUIMessageStream,
  embed,
  JsonToSseTransformStream,
  jsonSchema,
  smoothStream,
  stepCountIs,
  streamText,
  tool,
  wrapLanguageModel,
} from "ai";
import { unstable_cache as cache } from "next/cache";
import { after } from "next/server";
import {
  createResumableStreamContext,
  type ResumableStreamContext,
} from "resumable-stream";
import type { ModelCatalog } from "tokenlens/core";
import { fetchModels } from "tokenlens/fetch";
import { getUsage } from "tokenlens/helpers";
import { auth, type UserType } from "@/app/(auth)/auth";
import type { VisibilityType } from "@/components/visibility-selector";
import { sanitizeMessagesForProvider } from "@/lib/ai/cross-provider-context";
import { isModelAllowedForTier } from "@/lib/ai/entitlements";
import { buildGatewayConfig, getThinkingBudget } from "@/lib/ai/gateway-config";
import { getModelConfig, getModelContextWindow } from "@/lib/ai/model-config";
import type { ChatModel } from "@/lib/ai/models";
import { dispatchPluginTool } from "@/lib/ai/plugin-tool-dispatcher";
import { getCacheableSystemPrompt, type RequestHints } from "@/lib/ai/prompts";
import { myProvider } from "@/lib/ai/providers";
import { ragMiddleware } from "@/lib/ai/rag-middleware";
import { analyzeDataTool } from "@/lib/ai/tools/analyze-data";
import { createDocument } from "@/lib/ai/tools/create-document";
import { executeCodeTool } from "@/lib/ai/tools/execute-code";
import { generateChartTool } from "@/lib/ai/tools/generate-chart";
import { generateImageTool } from "@/lib/ai/tools/generate-image";
import { generateSpeechTool } from "@/lib/ai/tools/generate-speech";
import { generateStructuredDataTool } from "@/lib/ai/tools/generate-structured-data";
import { getWeather } from "@/lib/ai/tools/get-weather";
import { googleDriveTool } from "@/lib/ai/tools/google-drive";
import { queryKnowledgeBaseTool } from "@/lib/ai/tools/knowledge-base";
import { notionTool } from "@/lib/ai/tools/notion";
import { renderUITool } from "@/lib/ai/tools/render-ui";
import { requestSuggestions } from "@/lib/ai/tools/request-suggestions";
import { saveMemoryTool } from "@/lib/ai/tools/save-memory";
import {
  compareTextSimilarityTool,
  generateTextEmbeddingsTool,
} from "@/lib/ai/tools/text-embeddings";
import { transcribeAudioTool } from "@/lib/ai/tools/transcribe-audio";
import { updateDocument } from "@/lib/ai/tools/update-document";
import { webSearchTool } from "@/lib/ai/tools/web-search";
import { recordCacheStats } from "@/lib/ai/cache-analytics";
import { logAuditEvent } from "@/lib/audit";
import { isProductionEnvironment } from "@/lib/constants";
import {
  createStreamId,
  deleteChatById,
  getChatById,
  getEnabledMcpServers,
  getEnabledPluginTools,
  getMessagesByChatId,
  getProjectById,
  getUserMemories,
  getUserPreferences,
  getUserProviderKey,
  hasKBDocuments,
  saveChat,
  saveMessages,
  searchKBChunks,
  updateChatLastContextById,
} from "@/lib/db/queries";
import { decryptValue } from "@/lib/ai/plugin-encrypt";
import { getOrgModelPolicyForUser } from "@/lib/db/team-queries";
import { ChatSDKError } from "@/lib/errors";
import {
  createRateLimitResponse,
  rateLimitMiddleware,
} from "@/lib/middleware/rate-limit";
import { publishChatEvent } from "@/lib/realtime";
import type { ChatMessage } from "@/lib/types";
import type { AppUsage } from "@/lib/usage";
import { getCurrentMonthUsage, recordUsage } from "@/lib/usage/tracking";
import {
  convertToUIMessages,
  generateUUID,
  pruneUIMessages,
} from "@/lib/utils";
import { generateTitleFromUserMessage } from "../../actions";
import { type PostRequestBody, postRequestBodySchema } from "./schema";

export const maxDuration = 60;

let globalStreamContext: ResumableStreamContext | null = null;

const getTokenlensCatalog = cache(
  async (): Promise<ModelCatalog | undefined> => {
    try {
      return await fetchModels();
    } catch (err) {
      console.warn(
        "TokenLens: catalog fetch failed, using default catalog",
        err
      );
      return; // tokenlens helpers will fall back to defaultCatalog
    }
  },
  ["tokenlens-catalog"],
  { revalidate: 24 * 60 * 60 } // 24 hours
);

export function getStreamContext() {
  if (!globalStreamContext) {
    try {
      globalStreamContext = createResumableStreamContext({
        waitUntil: after,
      });
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes("REDIS_URL")) {
        console.log(
          " > Resumable streams are disabled due to missing REDIS_URL"
        );
      } else {
        console.error(error);
      }
    }
  }

  return globalStreamContext;
}

export async function POST(request: Request) {
  let requestBody: PostRequestBody;

  try {
    const json = await request.json();
    requestBody = postRequestBodySchema.parse(json);
  } catch (_) {
    return new ChatSDKError("bad_request:api").toResponse();
  }

  try {
    const {
      id,
      message,
      selectedChatModel,
      selectedVisibilityType,
      agentMode,
      webSearchEnabled,
      projectId: requestProjectId,
    }: {
      id: string;
      message: ChatMessage;
      selectedChatModel: ChatModel["id"];
      selectedVisibilityType: VisibilityType;
      agentMode?: boolean;
      webSearchEnabled?: boolean;
      projectId?: string | null;
    } = requestBody;

    const session = await auth();

    if (!session?.user) {
      return new ChatSDKError("unauthorized:chat").toResponse();
    }

    // Check rate limits (new tier-based system)
    const rateLimitResult = await rateLimitMiddleware(session.user.id);
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult);
    }

    // Fetch user preferences and memories in parallel with model access check
    const userPrefsPromise = getUserPreferences(session.user.id);
    const userMemoriesPromise = getUserMemories(session.user.id);
    // BYOK: fetch user's own OpenAI key if they've stored one (only for OpenAI models)
    const byokKeyPromise = selectedChatModel.startsWith("openai-")
      ? getUserProviderKey(session.user.id, "openai")
      : Promise.resolve(null);

    // Enforce model access by subscription tier.
    // rateLimitResult.tier comes from the same DB call — no extra round-trip.
    const userDbTier = rateLimitResult.tier ?? "free";
    if (!isModelAllowedForTier(selectedChatModel, userDbTier)) {
      return Response.json(
        {
          code: "forbidden:model",
          cause:
            "This model requires a Plus plan or higher. Upgrade to access all 36+ AI models.",
          upgrade: true,
          upgradeUrl: "/upgrade?plan=plus",
        },
        { status: 403 }
      );
    }

    // Enforce org-level monthly cost cap if set
    const orgPolicy = await getOrgModelPolicyForUser(session.user.id);
    if (
      orgPolicy?.monthlyCostCapUsdCents &&
      orgPolicy.monthlyCostCapUsdCents > 0
    ) {
      const monthUsage = await getCurrentMonthUsage(session.user.id);
      if (
        Math.round(monthUsage.totalCost * 100) >=
        orgPolicy.monthlyCostCapUsdCents
      ) {
        const capDollars = (orgPolicy.monthlyCostCapUsdCents / 100).toFixed(2);
        return Response.json(
          {
            code: "forbidden:cost_cap",
            cause: `Your organization's monthly spending limit of $${capDollars} has been reached. Contact your admin to increase the cap.`,
          },
          { status: 402 }
        );
      }
    }

    const _userType: UserType = session.user.type;

    const [chat, userPrefs, userMemoriesRaw, byokKeyRow] = await Promise.all([
      getChatById({ id }),
      userPrefsPromise,
      userMemoriesPromise,
      byokKeyPromise,
    ]);

    // Resolve the language model — use the user's own OpenAI key if stored
    const byokDecryptedKey = byokKeyRow
      ? decryptValue(byokKeyRow.encryptedKey)
      : null;
    function resolveLanguageModel(modelId: string) {
      if (byokDecryptedKey && modelId.startsWith("openai-")) {
        const openaiModelName = modelId.slice("openai-".length);
        const byokOpenAI = createOpenAI({ apiKey: byokDecryptedKey });
        return byokOpenAI(openaiModelName);
      }
      return myProvider.languageModel(modelId);
    }
    const userMemories =
      userPrefs?.memoryEnabled !== false
        ? userMemoriesRaw.map((m) => ({
            content: m.content,
            category: m.category,
          }))
        : [];

    // Fetch project instructions if chat belongs to a project
    let projectInstructions: string | undefined;
    if (chat?.projectId) {
      const proj = await getProjectById(chat.projectId, session.user.id);
      projectInstructions = proj?.instructions ?? undefined;
    }

    // Auto-inject relevant KB context into every prompt (issue #26)
    // KB is scoped to the active project when chat.projectId is set; otherwise account-wide docs (projectId IS NULL)
    // For new chats, use requestProjectId (passed from client on first message)
    const chatProjectId = chat?.projectId ?? requestProjectId ?? null;
    let kbContext: string | undefined;
    const userHasKB = await hasKBDocuments(session.user.id, chatProjectId);
    if (userHasKB) {
      try {
        const lastUserText = message.parts
          .filter((p: { type: string }) => p.type === "text")
          .map(
            (p: { type: string; text?: string }) =>
              (p as { type: string; text: string }).text
          )
          .join(" ")
          .trim();
        if (lastUserText) {
          const { embedding } = await embed({
            model: openai.textEmbeddingModel("text-embedding-3-small"),
            value: lastUserText,
          });
          const chunks = await searchKBChunks({
            userId: session.user.id,
            projectId: chatProjectId,
            queryEmbedding: embedding,
            queryText: lastUserText,
            limit: 3,
            similarityThreshold: 0.4,
          });
          if (chunks.length > 0) {
            kbContext = chunks
              .map((c) => `[${c.documentTitle}]: ${c.content}`)
              .join("\n---\n");
          }
        }
      } catch (err) {
        console.error("[chat] KB auto-injection failed:", err);
      }
    }

    if (chat) {
      if (chat.userId !== session.user.id) {
        return new ChatSDKError("forbidden:chat").toResponse();
      }
    } else {
      const title = await generateTitleFromUserMessage({
        message,
      });

      await saveChat({
        id,
        userId: session.user.id,
        title,
        visibility: selectedVisibilityType,
        projectId: requestProjectId,
      });
      void logAuditEvent(session.user.id, "chat.created", {
        chatId: id,
        modelId: selectedChatModel,
      });
    }

    const messagesFromDb = await getMessagesByChatId({ id });
    const allUiMessages = [...convertToUIMessages(messagesFromDb), message];

    // Prune history to 80% of model context window to prevent overflow on long conversations
    const contextWindow = getModelContextWindow(selectedChatModel);
    const uiMessages = pruneUIMessages(
      allUiMessages,
      Math.floor(contextWindow * 0.8)
    );
    if (uiMessages.length < allUiMessages.length) {
      console.log(
        `[chat] pruned ${allUiMessages.length - uiMessages.length} messages for model ${selectedChatModel} (context: ${contextWindow})`
      );
    }

    const { longitude, latitude, city, country } = geolocation(request);

    const requestHints: RequestHints = {
      longitude,
      latitude,
      city,
      country,
    };

    await saveMessages({
      messages: [
        {
          chatId: id,
          id: message.id,
          role: "user",
          parts: message.parts,
          attachments: [],
          createdAt: new Date(),
          modelId: null,
        },
      ],
    });

    const streamId = generateUUID();
    await createStreamId({ streamId, chatId: id });

    let finalMergedUsage: AppUsage | undefined;

    // Build active tools list based on model capabilities
    // All tools go through Vercel AI Gateway which handles provider credentials
    const isGemini25FlashImage =
      selectedChatModel === "google-gemini-2.5-flash-image-preview";

    const allTools = [
      "getWeather",
      ...(webSearchEnabled !== false ? ["webSearch"] : []),
      "createDocument",
      "updateDocument",
      "requestSuggestions",
      "analyzeData",
      "generateStructuredData",
      "transcribeAudio",
      "generateTextEmbeddings",
      "compareTextSimilarity",
      "executeCode",
      "queryKnowledgeBase",
      "googleDrive",
      "notion",
      "generateSpeech",
      "generateChart",
      "saveMemory",
      "renderUI",
    ];

    // Check model capabilities from static config (handles internal model IDs)
    const selectedModelCapabilities = getModelConfig(selectedChatModel);

    // Disable tools for models that don't support function calling
    // (e.g. deepseek-deepseek-r1, cerebras-llama3.3-70b) and image-only models
    const baseActiveTools =
      selectedChatModel === "chat-model-reasoning" ||
      isGemini25FlashImage ||
      !selectedModelCapabilities.supportsToolCalling
        ? []
        : [...allTools, "generateImage"];

    // Load plugin tools for authenticated users with tool-capable models
    const pluginToolMap: Record<string, any> = {};
    if (baseActiveTools.length > 0 && session.user.type !== "guest") {
      const enabledPluginTools = await getEnabledPluginTools(session.user.id);
      for (const pt of enabledPluginTools) {
        pluginToolMap[pt.name] = tool({
          description: pt.description,
          inputSchema: jsonSchema(pt.parametersSchema as any),
          execute: async (args) =>
            dispatchPluginTool(pt, args as Record<string, unknown>),
        });
      }
    }

    // Load MCP tools for authenticated users with tool-capable models
    const mcpClients: Array<{ close: () => Promise<void> }> = [];
    const mcpToolMap: Record<string, any> = {};

    if (baseActiveTools.length > 0 && session.user.type !== "guest") {
      const enabledServers = await getEnabledMcpServers(session.user.id);
      await Promise.all(
        enabledServers.map(async (server) => {
          try {
            const client = await createMCPClient({
              transport: {
                type: "sse",
                url: server.url,
                headers: (server.headers as Record<string, string>) ?? {},
              },
            });
            const serverTools = await client.tools();
            Object.assign(mcpToolMap, serverTools);
            mcpClients.push(client);
          } catch (err) {
            console.warn(`MCP server "${server.name}" unavailable:`, err);
          }
        })
      );
      if (mcpClients.length > 0) {
        after(async () => {
          await Promise.all(mcpClients.map((c) => c.close().catch(() => {})));
        });
      }
    }

    const mcpToolNames = Object.keys(mcpToolMap);
    const pluginToolNames = Object.keys(pluginToolMap);
    const activeTools =
      mcpToolNames.length > 0 || pluginToolNames.length > 0
        ? [...baseActiveTools, ...mcpToolNames, ...pluginToolNames]
        : baseActiveTools;

    const stream = createUIMessageStream({
      execute: async ({ writer: dataStream }) => {
        // Build tools object - all tools use Vercel AI Gateway
        const tools: Record<string, any> = {
          getWeather,
          webSearch: webSearchTool,
          createDocument: createDocument({ session, dataStream }),
          updateDocument: updateDocument({ session, dataStream }),
          requestSuggestions: requestSuggestions({
            session,
            dataStream,
          }),
          analyzeData: analyzeDataTool(),
          generateImage: generateImageTool(),
          generateStructuredData: generateStructuredDataTool(),
          transcribeAudio: transcribeAudioTool(),
          generateTextEmbeddings: generateTextEmbeddingsTool(),
          compareTextSimilarity: compareTextSimilarityTool(),
          executeCode: executeCodeTool(),
          queryKnowledgeBase: queryKnowledgeBaseTool(
            session.user.id,
            chatProjectId
          ),
          googleDrive: googleDriveTool(session.user.id),
          notion: notionTool(session.user.id),
          generateSpeech: generateSpeechTool(),
          generateChart: generateChartTool(),
          saveMemory: saveMemoryTool(session.user.id, id),
          renderUI: renderUITool,
          ...mcpToolMap,
          ...pluginToolMap,
        };

        // Get the actual gateway model ID
        const gatewayModelId =
          myProvider.languageModel(selectedChatModel).modelId || "";

        // Get model-specific configuration
        const modelConfig = getModelConfig(gatewayModelId);

        // Build provider options with gateway config and fallback
        const gatewayConfig = buildGatewayConfig(gatewayModelId);
        const providerOptions: Record<string, any> = {
          gateway: gatewayConfig,
          bedda: { userId: session.user.id, projectId: chatProjectId },
        };

        // Add image generation for Gemini 2.5 Flash Image
        if (isGemini25FlashImage) {
          providerOptions.google = {
            responseModalities: ["TEXT", "IMAGE"],
          };
        }

        // Add thinking budget for Anthropic models (helps control extended reasoning)
        const thinkingBudget = getThinkingBudget(gatewayModelId);
        if (thinkingBudget) {
          providerOptions.anthropic = {
            thinkingBudget,
          };
        }

        // Agent mode: boost maxSteps for multi-step reasoning chains
        const effectiveMaxSteps = agentMode
          ? Math.max(modelConfig.maxSteps, 20)
          : modelConfig.maxSteps;

        // Convert UI messages to model format, then sanitize for cross-provider compatibility.
        // This strips Anthropic reasoning blocks for non-Anthropic models and images for
        // vision-impaired models, preventing silent provider rejections on mid-thread model switches.
        const rawModelMessages = await convertToModelMessages(uiMessages);
        const { messages: sanitizedModelMessages, warnings: contextWarnings } =
          sanitizeMessagesForProvider(rawModelMessages, gatewayModelId);
        if (contextWarnings.length > 0) {
          contextWarnings.forEach((w) =>
            console.warn("[chat] cross-provider context:", w)
          );
          dataStream.write({
            type: "data-context-warnings" as any,
            data: contextWarnings,
          });
        }

        // Notify client which model is handling this turn (enables real-time model badge)
        dataStream.write({ type: "data-active-model" as any, data: selectedChatModel });

        const requestStart = Date.now();
        const result = streamText({
          model: wrapLanguageModel({
            model: resolveLanguageModel(selectedChatModel),
            middleware: ragMiddleware,
          }),
          system: getCacheableSystemPrompt({
            selectedChatModel,
            requestHints,
            projectInstructions,
            customInstructions: userPrefs?.customInstructions ?? undefined,
            kbContext,
            agentMode,
            userMemories: userMemories.length > 0 ? userMemories : undefined,
          }),
          messages: sanitizedModelMessages,
          // Use model-specific maxSteps configuration (boosted in agent mode)
          stopWhen: stepCountIs(effectiveMaxSteps),
          // Use model-specific temperature if available
          ...(modelConfig.temperature && {
            temperature: modelConfig.temperature,
          }),
          // Only pass tools if model supports them
          ...(activeTools.length > 0 && {
            experimental_activeTools: activeTools,
            tools,
          }),
          experimental_transform: smoothStream({ chunking: "word" }),
          providerOptions,
          experimental_telemetry: {
            isEnabled: isProductionEnvironment,
            functionId: "stream-text",
            metadata: {
              chatId: id,
              userId: session.user.id,
              selectedModel: selectedChatModel,
              visibilityType: selectedVisibilityType,
              toolsEnabled: selectedChatModel !== "chat-model-reasoning",
              imageGenerationEnabled: isGemini25FlashImage,
            },
          },
          onFinish: async ({ usage, response }) => {
            const latency = Date.now() - requestStart;
            try {
              const providers = await getTokenlensCatalog();
              const modelId =
                myProvider.languageModel(selectedChatModel).modelId;

              // Extract provider metadata from response
              const providerMetadata =
                response.headers?.["x-vercel-ai-provider-metadata"];
              let gatewayMetadata: { cost?: number; routing?: Record<string, unknown> } | null = null;

              if (providerMetadata) {
                try {
                  const metadata = JSON.parse(providerMetadata);
                  gatewayMetadata = metadata.gateway;

                  // Log gateway routing and cost info for debugging
                  if (gatewayMetadata) {
                    console.log("AI Gateway Metadata:", {
                      cost: gatewayMetadata.cost,
                      routing: gatewayMetadata.routing,
                    });
                  }
                } catch (parseErr) {
                  console.warn("Failed to parse provider metadata", parseErr);
                }
              }

              if (!modelId) {
                finalMergedUsage = {
                  ...usage,
                  ...(gatewayMetadata?.cost && {
                    gatewayCost: gatewayMetadata.cost,
                  }),
                };
                dataStream.write({
                  type: "data-usage",
                  data: finalMergedUsage,
                });
                return;
              }

              if (!providers) {
                finalMergedUsage = {
                  ...usage,
                  ...(gatewayMetadata?.cost && {
                    gatewayCost: gatewayMetadata.cost,
                  }),
                };
                dataStream.write({
                  type: "data-usage",
                  data: finalMergedUsage,
                });
                return;
              }

              const summary = getUsage({ modelId, usage, providers });
              finalMergedUsage = {
                ...usage,
                ...summary,
                modelId,
                ...(gatewayMetadata?.cost && {
                  gatewayCost: gatewayMetadata.cost,
                }),
              } as AppUsage;
              dataStream.write({ type: "data-usage", data: finalMergedUsage });

              // Track usage in new analytics system
              try {
                // Extract cache information from AI SDK usage object
                // Anthropic models return cacheReadInputTokens, cacheCreationInputTokens
                // OpenAI models have automatic caching (no explicit fields)
                const cachedTokens = (usage as any).cacheReadInputTokens || 0;
                const cacheHit = cachedTokens > 0;

                await recordUsage({
                  userId: session.user.id,
                  modelId: selectedChatModel,
                  provider: selectedChatModel.split("-")[0] || "unknown",
                  sessionId: id,
                  inputTokens: usage.inputTokens || 0,
                  outputTokens: usage.outputTokens || 0,
                  cachedTokens,
                  latency,
                  cacheHit,
                  toolsUsed: [],
                  success: true,
                });

                recordCacheStats({
                  requestId: id,
                  timestamp: new Date(),
                  modelId: selectedChatModel,
                  cacheHit,
                  cachedTokens,
                  totalTokens: (usage.inputTokens || 0) + (usage.outputTokens || 0),
                  costSavings: (cachedTokens / 1_000_000) * 2.7,
                });
              } catch (trackingErr) {
                console.error("Failed to record usage:", trackingErr);
                // Don't fail the request if tracking fails
              }
            } catch (err) {
              console.warn("TokenLens enrichment failed", err);
              finalMergedUsage = usage;
              dataStream.write({ type: "data-usage", data: finalMergedUsage });

              // Track failed request
              try {
                await recordUsage({
                  userId: session.user.id,
                  modelId: selectedChatModel,
                  provider: selectedChatModel.split("-")[0] || "unknown",
                  sessionId: id,
                  inputTokens: 0,
                  outputTokens: 0,
                  cachedTokens: 0,
                  success: false,
                  errorType: err instanceof Error ? err.name : "UnknownError",
                });
              } catch (trackingErr) {
                console.error("Failed to record failed usage:", trackingErr);
              }
            }
          },
        });

        result.consumeStream();

        dataStream.merge(
          result.toUIMessageStream({
            sendReasoning: true,
          })
        );
      },
      generateId: generateUUID,
      onFinish: async ({ messages }) => {
        await saveMessages({
          messages: messages.map((currentMessage) => ({
            id: currentMessage.id,
            role: currentMessage.role,
            parts: currentMessage.parts,
            createdAt: new Date(),
            attachments: [],
            chatId: id,
            modelId:
              currentMessage.role === "assistant" ? selectedChatModel : null,
          })),
        });

        if (finalMergedUsage) {
          try {
            await updateChatLastContextById({
              chatId: id,
              context: finalMergedUsage,
            });
          } catch (err) {
            console.warn("Unable to persist last usage for chat", id, err);
          }
        }

        // Notify team members in real-time (fire-and-forget; no-ops when Redis is absent)
        after(async () => {
          await publishChatEvent(id, { type: "new_message" });
        });
      },
      onError: () => "Oops, an error occurred!",
    });

    // Enable resumable streams if Redis is configured
    const streamContext = getStreamContext();

    if (streamContext) {
      return new Response(
        await streamContext.resumableStream(streamId, () =>
          stream.pipeThrough(new JsonToSseTransformStream())
        )
      );
    }

    // Fallback to regular streaming if resumable streams are not available
    return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
  } catch (error) {
    const vercelId = request.headers.get("x-vercel-id");

    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }

    // Check for Vercel AI Gateway credit card error
    if (
      error instanceof Error &&
      error.message?.includes(
        "AI Gateway requires a valid credit card on file to service requests"
      )
    ) {
      return new ChatSDKError("bad_request:activate_gateway").toResponse();
    }

    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(error, { extra: { vercelId } });
    }
    console.error("Unhandled error in chat API:", error, { vercelId });
    return new ChatSDKError("offline:chat").toResponse();
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new ChatSDKError("bad_request:api").toResponse();
  }

  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError("unauthorized:chat").toResponse();
  }

  const chat = await getChatById({ id });

  if (chat?.userId !== session.user.id) {
    return new ChatSDKError("forbidden:chat").toResponse();
  }

  const deletedChat = await deleteChatById({ id });

  return Response.json(deletedChat, { status: 200 });
}
