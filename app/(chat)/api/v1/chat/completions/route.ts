import { createHash } from "node:crypto";
import { generateText, streamText, type ModelMessage } from "ai";
import { isModelAllowedForTier } from "@/lib/ai/entitlements";
import { myProvider } from "@/lib/ai/providers";
import { validateApiKey } from "@/lib/db/queries";
import { getUserTier } from "@/lib/usage/tracking";
import { generateUUID } from "@/lib/utils";

export const maxDuration = 60;

// Common OpenAI model aliases → bedda model IDs
const MODEL_ALIASES: Record<string, string> = {
  "gpt-4o": "openai-gpt-4o",
  "gpt-4o-mini": "openai-gpt-4o-mini",
  "gpt-4-turbo": "openai-gpt-4-turbo",
  "gpt-4": "openai-gpt-4o",
  "gpt-3.5-turbo": "openai-gpt-4o-mini",
  "claude-3-5-sonnet-20241022": "anthropic-claude-sonnet-4.5",
  "claude-3-opus-20240229": "anthropic-claude-opus-4.5",
  "claude-3-5-haiku-20241022": "anthropic-claude-haiku-4.5",
  "gemini-1.5-pro": "google-gemini-2.5-pro-preview",
  "gemini-1.5-flash": "google-gemini-2.5-flash",
  "grok-2": "xai-grok-2-1212",
};

type OpenAIMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

function extractBearerToken(authorization: string | null): string | null {
  if (!authorization?.startsWith("Bearer ")) return null;
  return authorization.slice(7).trim();
}

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization");
  const rawKey = extractBearerToken(authorization);

  if (!rawKey) {
    return Response.json(
      { error: { message: "Missing or invalid Authorization header", type: "invalid_request_error", code: "invalid_api_key" } },
      { status: 401 }
    );
  }

  const keyHash = createHash("sha256").update(rawKey).digest("hex");
  const keyRecord = await validateApiKey(keyHash);

  if (!keyRecord) {
    return Response.json(
      { error: { message: "Invalid or revoked API key", type: "invalid_request_error", code: "invalid_api_key" } },
      { status: 401 }
    );
  }

  let body: {
    model?: string;
    messages?: OpenAIMessage[];
    stream?: boolean;
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
  };

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: { message: "Invalid JSON body", type: "invalid_request_error" } },
      { status: 400 }
    );
  }

  const { model: rawModel, messages, stream = false, temperature, max_tokens } = body;

  if (!rawModel || !messages || messages.length === 0) {
    return Response.json(
      { error: { message: "model and messages are required", type: "invalid_request_error" } },
      { status: 400 }
    );
  }

  // Resolve model ID (accept bedda IDs directly or OpenAI aliases)
  const modelId: string = MODEL_ALIASES[rawModel] ?? rawModel;

  // Check model access
  let tier: "free" | "pro" | "premium" | "enterprise" = "free";
  try {
    tier = await getUserTier(keyRecord.userId);
  } catch {}

  if (!isModelAllowedForTier(modelId, tier)) {
    return Response.json(
      { error: { message: `Model ${rawModel} requires a higher subscription tier`, type: "invalid_request_error", code: "model_not_available" } },
      { status: 403 }
    );
  }

  // Separate system messages from conversation
  const systemMessages = messages.filter((m) => m.role === "system");
  const conversationMessages = messages.filter((m) => m.role !== "system");
  const system = systemMessages.map((m) => m.content).join("\n") || undefined;

  const id = `chatcmpl-${generateUUID()}`;
  const created = Math.floor(Date.now() / 1000);

  let model: ReturnType<typeof myProvider.languageModel>;
  try {
    model = myProvider.languageModel(modelId);
  } catch {
    return Response.json(
      { error: { message: `Unknown model: ${rawModel}`, type: "invalid_request_error", code: "model_not_found" } },
      { status: 404 }
    );
  }

  if (stream) {
    const result = streamText({
      model,
      system,
      messages: conversationMessages as ModelMessage[],
      temperature: temperature ?? 0.7,
      ...(max_tokens ? { maxOutputTokens: max_tokens } : {}),
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        const enqueue = (data: string) =>
          controller.enqueue(encoder.encode(data));

        enqueue(
          `data: ${JSON.stringify({
            id,
            object: "chat.completion.chunk",
            created,
            model: modelId,
            choices: [{ index: 0, delta: { role: "assistant", content: "" }, finish_reason: null }],
          })}\n\n`
        );

        try {
          for await (const chunk of result.textStream) {
            enqueue(
              `data: ${JSON.stringify({
                id,
                object: "chat.completion.chunk",
                created,
                model: modelId,
                choices: [{ index: 0, delta: { content: chunk }, finish_reason: null }],
              })}\n\n`
            );
          }
        } catch (err) {
          console.error("[v1/chat/completions] stream error:", err);
        }

        enqueue(
          `data: ${JSON.stringify({
            id,
            object: "chat.completion.chunk",
            created,
            model: modelId,
            choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
          })}\n\n`
        );
        enqueue("data: [DONE]\n\n");
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  // Non-streaming
  const { text, usage } = await generateText({
    model,
    system,
    messages: conversationMessages as ModelMessage[],
    temperature: temperature ?? 0.7,
    maxOutputTokens: max_tokens,
  });

  return Response.json({
    id,
    object: "chat.completion",
    created,
    model: modelId,
    choices: [
      {
        index: 0,
        message: { role: "assistant", content: text },
        finish_reason: "stop",
      },
    ],
    usage: {
      prompt_tokens: usage?.inputTokens ?? 0,
      completion_tokens: usage?.outputTokens ?? 0,
      total_tokens: (usage?.inputTokens ?? 0) + (usage?.outputTokens ?? 0),
    },
  });
}
