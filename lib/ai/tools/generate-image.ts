import { gateway } from "@ai-sdk/gateway";
import { experimental_generateImage as generateImage, tool } from "ai";
import { z } from "zod";

const SIZE_MAP = {
  square: { dalleSize: "1024x1024", aspectRatio: "1:1" },
  landscape: { dalleSize: "1792x1024", aspectRatio: "16:9" },
  portrait: { dalleSize: "1024x1792", aspectRatio: "9:16" },
} as const;

const MODEL_META: Record<
  string,
  { gatewayId: string; label: string; useSize: boolean }
> = {
  dalle3: { gatewayId: "openai/dall-e-3", label: "DALL-E 3", useSize: true },
  imagen3: {
    gatewayId: "google/imagen-3-fast",
    label: "Imagen 3 Fast",
    useSize: false,
  },
  flux: {
    gatewayId: "black-forest-labs/flux-1.1-pro",
    label: "Flux 1.1 Pro",
    useSize: false,
  },
};

export const generateImageTool = () =>
  tool({
    description:
      "Generate an image based on a text prompt using AI image generation models. Use this when the user asks to create, generate, draw, or make an image, picture, photo, or illustration.",
    inputSchema: z.object({
      prompt: z
        .string()
        .describe(
          "A detailed, descriptive prompt for the image. Be specific about style, composition, colors, mood, and subjects."
        ),
      model: z
        .enum(["dalle3", "imagen3", "flux"])
        .optional()
        .default("dalle3")
        .describe(
          "Image generation model: dalle3 (DALL-E 3, photorealistic), imagen3 (Google Imagen 3, fast), flux (Flux 1.1 Pro, artistic)"
        ),
      size: z
        .enum(["square", "landscape", "portrait"])
        .optional()
        .default("square")
        .describe(
          "Image dimensions: square (1:1), landscape (16:9), portrait (9:16)"
        ),
      style: z
        .enum(["vivid", "natural"])
        .optional()
        .describe(
          "DALL-E 3 only: vivid (hyper-real) or natural (more subdued). Ignored for other models."
        ),
    }),
    execute: async ({ prompt, model = "dalle3", size = "square", style }) => {
      const meta = MODEL_META[model] ?? MODEL_META["dalle3"];
      const sizeConfig = SIZE_MAP[size];

      try {
        const imageModel = gateway.imageModel(meta.gatewayId);
        const { image } = await generateImage({
          model: imageModel,
          prompt,
          ...(meta.useSize
            ? { size: sizeConfig.dalleSize }
            : { aspectRatio: sizeConfig.aspectRatio }),
          ...(model === "dalle3" && style
            ? { providerOptions: { openai: { style } } }
            : {}),
        } as any);

        return {
          success: true,
          image: {
            base64: image.base64,
            mediaType: "image/png",
          },
          prompt,
          model: meta.label,
          size,
        };
      } catch (error) {
        console.error("Image generation error:", error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to generate image. Please try a different prompt or model.",
        };
      }
    },
  });
