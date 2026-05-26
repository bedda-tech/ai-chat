import { experimental_generateImage as generateImage } from "ai";
import { gateway } from "@ai-sdk/gateway";
import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { rateLimitMiddleware, createRateLimitResponse } from "@/lib/middleware/rate-limit";

const MODEL_META: Record<string, { gatewayId: string; label: string; useSize: boolean }> = {
  dalle3: { gatewayId: "openai/dall-e-3", label: "DALL-E 3", useSize: true },
  imagen3: { gatewayId: "google/imagen-3-fast", label: "Imagen 3 Fast", useSize: false },
  flux: { gatewayId: "black-forest-labs/flux-1.1-pro", label: "Flux 1.1 Pro", useSize: false },
};

const SIZE_MAP = {
  "1:1": { dalleSize: "1024x1024", aspectRatio: "1:1" },
  "16:9": { dalleSize: "1792x1024", aspectRatio: "16:9" },
  "9:16": { dalleSize: "1024x1792", aspectRatio: "9:16" },
} as const;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimitResult = await rateLimitMiddleware(session.user.id);
  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(rateLimitResult);
  }

  let body: { models: string[]; prompt: string; negativePrompt?: string; aspectRatio?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { models, prompt, negativePrompt, aspectRatio = "1:1" } = body;

  if (!prompt?.trim()) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  const validModels = (models ?? []).filter((m) => MODEL_META[m]);
  if (validModels.length === 0) {
    return NextResponse.json({ error: "At least one valid model required" }, { status: 400 });
  }

  const sizeConfig = SIZE_MAP[aspectRatio as keyof typeof SIZE_MAP] ?? SIZE_MAP["1:1"];

  const results = await Promise.all(
    validModels.map(async (modelKey) => {
      const meta = MODEL_META[modelKey];
      try {
        const imageModel = gateway.imageModel(meta.gatewayId);
        const { image } = await generateImage({
          model: imageModel,
          prompt,
          ...(meta.useSize
            ? { size: sizeConfig.dalleSize }
            : { aspectRatio: sizeConfig.aspectRatio }),
          ...(negativePrompt && !meta.useSize ? { negativePrompt } : {}),
        } as any);

        return {
          modelKey,
          label: meta.label,
          success: true,
          base64: image.base64,
          mediaType: "image/png",
        };
      } catch (error) {
        return {
          modelKey,
          label: meta.label,
          success: false,
          error: error instanceof Error ? error.message : "Generation failed",
        };
      }
    })
  );

  return NextResponse.json({ results });
}
