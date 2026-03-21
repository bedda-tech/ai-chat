import { embed, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { searchKBChunks } from "@/lib/db/queries";

/**
 * RAG tool: searches the user's uploaded knowledge base documents
 * using vector similarity search (pgvector on Neon).
 */
export const queryKnowledgeBaseTool = (userId: string) =>
  tool({
    description:
      "Search your personal knowledge base of uploaded documents. Use this when the user asks about content from files they have uploaded, or when you need to retrieve specific information from their documents. Returns the most relevant text passages.",
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
      try {
        // Embed the query using the same model used during ingestion
        const { embedding } = await embed({
          model: openai.textEmbeddingModel("text-embedding-3-small"),
          value: query,
        });

        const chunks = await searchKBChunks({
          userId,
          queryEmbedding: embedding,
          queryText: query,
          limit,
          similarityThreshold: 0.25,
        });

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
