import { tool } from "ai";
import { z } from "zod";
import { createUserMemory } from "@/lib/db/queries";

export const saveMemoryTool = (userId: string, chatId?: string) =>
  tool({
    description:
      "Save a fact or piece of information about the user to long-term memory. Use this proactively when you learn something meaningful about the user — their preferences, goals, background, technical expertise, or important context that would be useful to remember in future conversations. Do not save trivial, ephemeral, or task-specific details.",
    inputSchema: z.object({
      content: z
        .string()
        .describe(
          "The fact to remember about the user, written in third person (e.g. 'User prefers TypeScript over JavaScript'). Keep it concise, 1-2 sentences."
        ),
      category: z
        .enum(["preference", "goal", "background", "technical", "general"])
        .optional()
        .default("general")
        .describe("Category for the memory"),
    }),
    execute: async ({ content, category = "general" }) => {
      try {
        await createUserMemory(userId, {
          content,
          category,
          sourceChat: chatId,
        });
        return { success: true, saved: content };
      } catch (error) {
        console.error("Save memory error:", error);
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to save memory",
        };
      }
    },
  });
