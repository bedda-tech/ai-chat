import { openai } from "@ai-sdk/openai";
import { experimental_generateSpeech as generateSpeech, tool } from "ai";
import { z } from "zod";

/**
 * Text-to-speech tool using OpenAI TTS
 * Converts text to audio and returns base64-encoded audio data
 */
export const generateSpeechTool = () =>
  tool({
    description:
      "Convert text to speech audio. Use when users ask to read text aloud, generate audio narration, or want to hear a response. Returns playable audio.",
    inputSchema: z.object({
      text: z
        .string()
        .max(4096)
        .describe("Text to convert to speech (max 4096 characters)"),
      voice: z
        .enum(["alloy", "echo", "fable", "onyx", "nova", "shimmer"])
        .default("nova")
        .describe(
          "Voice to use: alloy (neutral), echo (male), fable (British), onyx (deep male), nova (female), shimmer (soft female)"
        ),
    }),
    execute: async ({ text, voice }) => {
      try {
        const result = await generateSpeech({
          model: openai.speech("tts-1"),
          text,
          voice,
        });

        return {
          success: true,
          audio: {
            base64: result.audio.base64,
            mediaType: "audio/mp3",
          },
          voice,
          characterCount: text.length,
        };
      } catch (error) {
        console.error("Speech generation error:", error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to generate speech. Please try again.",
        };
      }
    },
  });
