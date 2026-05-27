import "server-only";
import { embed } from "ai";
import { openai } from "@ai-sdk/openai";
import type { LanguageModelMiddleware } from "ai";
import { hasKBDocuments, searchKBChunks } from "@/lib/db/queries";

const ragEnabled = () => process.env.RAG_MIDDLEWARE_ENABLED !== "false";

/**
 * RAG middleware — automatically injects relevant KB chunks into the last user
 * message as a safety net when the model might skip the explicit queryKnowledgeBase
 * tool call. Requires userId to be set in providerOptions.bedda.userId at the call site.
 * Disable via RAG_MIDDLEWARE_ENABLED=false env var.
 * Must be applied server-side only (e.g. via wrapLanguageModel in the chat route).
 */
export const ragMiddleware: LanguageModelMiddleware = {
  specificationVersion: "v3",

  transformParams: async ({ params, type }) => {
    if (!ragEnabled()) return params;

    const userId = (params.providerOptions as Record<string, any>)?.bedda
      ?.userId as string | undefined;
    if (!userId) return params;

    // Zero overhead for users with no KB documents
    const hasKB = await hasKBDocuments(userId).catch(() => false);
    if (!hasKB) return params;

    // Find the last user message and extract its text
    const prompt = params.prompt;
    let lastUserIdx = -1;
    for (let i = prompt.length - 1; i >= 0; i--) {
      if (prompt[i].role === "user") {
        lastUserIdx = i;
        break;
      }
    }
    if (lastUserIdx === -1) return params;

    const lastUserMsg = prompt[lastUserIdx];
    const content = lastUserMsg.content;
    let textContent = "";
    if (typeof content === "string") {
      textContent = content;
    } else {
      textContent = (content as Array<{ type: string; text?: string }>)
        .filter((p) => p.type === "text" && typeof p.text === "string")
        .map((p) => p.text as string)
        .join(" ")
        .trim();
    }
    if (!textContent || textContent.length < 3) return params;

    // Embed the query and search KB chunks
    let chunks: Array<{ content: string; documentTitle: string; similarity: number }>;
    try {
      const { embedding } = await embed({
        model: openai.textEmbeddingModel("text-embedding-3-small"),
        value: textContent,
      });
      chunks = await searchKBChunks({
        userId,
        queryEmbedding: embedding,
        queryText: textContent,
        limit: 5,
        similarityThreshold: 0.35,
      });
    } catch (err) {
      console.error("[rag] middleware search error:", err);
      return params;
    }

    // Only inject when we have meaningful signal (≥ 3 relevant chunks)
    if (chunks.length < 3) return params;

    const contextBlock =
      "\n\nRelevant context from your documents:\n" +
      chunks
        .map((c, i) => `[${i + 1}] ${c.documentTitle}:\n${c.content}`)
        .join("\n\n");

    // Append context to the last text part of the user message (or add one)
    let updatedContent: typeof content;
    if (typeof content === "string") {
      updatedContent = content + contextBlock;
    } else {
      const parts = [...(content as unknown as Array<{ type: string; [k: string]: unknown }>)];
      let lastTextPartIdx = -1;
      for (let i = parts.length - 1; i >= 0; i--) {
        if (parts[i].type === "text") {
          lastTextPartIdx = i;
          break;
        }
      }
      if (lastTextPartIdx >= 0) {
        parts[lastTextPartIdx] = {
          ...parts[lastTextPartIdx],
          text: (parts[lastTextPartIdx].text as string) + contextBlock,
        };
      } else {
        parts.push({ type: "text", text: contextBlock });
      }
      updatedContent = parts as unknown as typeof content;
    }

    const updatedPrompt = [
      ...prompt.slice(0, lastUserIdx),
      { ...lastUserMsg, content: updatedContent },
      ...prompt.slice(lastUserIdx + 1),
    ] as typeof prompt;

    if (process.env.LOG_AI_CALLS !== "false") {
      console.log(
        `[rag] Injected ${chunks.length} KB chunks for userId=${userId} (${type})`
      );
    }

    return { ...params, prompt: updatedPrompt };
  },
};
