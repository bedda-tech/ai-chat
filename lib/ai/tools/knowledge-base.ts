import { createCohere } from "@ai-sdk/cohere";
import { openai } from "@ai-sdk/openai";
import { embed, rerank, tool } from "ai";
import { z } from "zod";
import { saveSearchQuery, searchKBChunks } from "@/lib/db/queries";

/**
 * RAG tool: searches the user's uploaded knowledge base documents
 * using vector similarity search (pgvector on Neon).
 */
export const queryKnowledgeBaseTool = (
  userId: string,
  projectId?: string | null
) =>
  tool({
    description:
      "Search your knowledge base of uploaded documents. Use this when the user asks about content from files they have uploaded, or when you need to retrieve specific information from their documents. Returns the most relevant text passages.",
    inputSchema: z.object({
      query: z
        .string()
        .describe(
          "The search query to find relevant passages in the knowledge base"
        ),
      limit: z
        .number()
        .min(1)
        .max(10)
        .optional()
        .default(5)
        .describe("Number of relevant passages to retrieve (default: 5)"),
    }),
    execute: async ({ query, limit = 5 }) => {
      const startMs = Date.now();
      try {
        // Embed the query using the same model used during ingestion
        const { embedding } = await embed({
          model: openai.textEmbeddingModel("text-embedding-3-small"),
          value: query,
        });

        // Fetch wider candidate set when reranking is available
        const cohereApiKey = process.env.COHERE_API_KEY;
        const candidateLimit = cohereApiKey ? 20 : limit;
        const candidates = await searchKBChunks({
          userId,
          projectId: projectId ?? undefined,
          queryEmbedding: embedding,
          queryText: query,
          limit: candidateLimit,
          similarityThreshold: 0.25,
        });

        let chunks = candidates;
        if (cohereApiKey && candidates.length > 0) {
          try {
            const cohereClient = createCohere({ apiKey: cohereApiKey });
            const rerankStart = Date.now();
            const { ranking } = await rerank({
              model: cohereClient.reranking("rerank-v3.5"),
              query,
              documents: candidates.map((c) => c.content),
              topN: limit,
            });
            console.log(
              `[kb] rerank: ${candidates.length} → ${ranking.length} results in ${Date.now() - rerankStart}ms`
            );
            chunks = ranking.map((item) => candidates[item.originalIndex]);
          } catch (rerankError) {
            console.warn(
              "[kb] rerank failed, falling back to vector search:",
              rerankError
            );
            chunks = candidates.slice(0, limit);
          }
        }

        // Record analytics — fire-and-forget
        saveSearchQuery({
          userId,
          query,
          resultsCount: chunks.length,
          responseTimeMs: Date.now() - startMs,
        }).catch((err) => console.warn("[kb] analytics save failed:", err));

        if (chunks.length === 0) {
          return {
            success: true,
            found: false,
            message:
              "No relevant content found in your knowledge base for this query. You may need to upload relevant documents first.",
            results: [],
          };
        }

        return {
          success: true,
          found: true,
          query,
          results: chunks.map((c) => ({
            content: c.content,
            source: c.documentTitle,
            similarity: Math.round(c.similarity * 100) / 100,
          })),
          count: chunks.length,
        };
      } catch (error) {
        console.error("Knowledge base search error:", error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to search knowledge base",
        };
      }
    },
  });
