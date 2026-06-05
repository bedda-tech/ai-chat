import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getUserTier } from "@/lib/usage/tracking";
import { createVideoJob, updateVideoJob } from "@/lib/db/queries";

const FAL_API_KEY = process.env.FAL_API_KEY;
const TEXT_TO_VIDEO_APP_ID = "fal-ai/kling-video/v1.6/standard/text-to-video";
const IMAGE_TO_VIDEO_APP_ID = "fal-ai/kling-video/v1.6/standard/image-to-video";
const FAL_QUEUE_BASE = "https://queue.fal.run";

const UPGRADE_RESPONSE = NextResponse.json(
  { error: "Video generation requires a paid subscription.", upgrade: true },
  { status: 403 }
);

// Submit a video generation job, return { requestId, appId }
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tier = await getUserTier(session.user.id);
  if (tier === "free") {
    return UPGRADE_RESPONSE;
  }

  if (!FAL_API_KEY) {
    return NextResponse.json(
      { error: "Video generation is not configured on this server." },
      { status: 503 }
    );
  }

  let body: { prompt: string; duration?: number; aspectRatio?: string; imageUrl?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { prompt, duration = 5, aspectRatio = "16:9", imageUrl } = body;

  if (!prompt?.trim()) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  const validDuration = duration === 10 ? "10" : "5";
  const validAspect = ["16:9", "9:16", "1:1"].includes(aspectRatio) ? aspectRatio : "16:9";

  const appId = imageUrl ? IMAGE_TO_VIDEO_APP_ID : TEXT_TO_VIDEO_APP_ID;
  const falBase = `${FAL_QUEUE_BASE}/${appId}`;

  const requestBody = imageUrl
    ? { image_url: imageUrl, prompt: prompt.trim(), duration: validDuration, aspect_ratio: validAspect }
    : { prompt: prompt.trim(), duration: validDuration, aspect_ratio: validAspect };

  const submitRes = await fetch(falBase, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Key ${FAL_API_KEY}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!submitRes.ok) {
    const errText = await submitRes.text().catch(() => "Unknown error");
    return NextResponse.json({ error: `Submission failed: ${errText}` }, { status: 502 });
  }

  const { request_id } = await submitRes.json();

  const mode = imageUrl ? "image-to-video" : "text-to-video";
  const job = await createVideoJob({
    userId: session.user.id,
    mode,
    quality: "standard",
    prompt: prompt.trim(),
    sourceImageUrl: imageUrl ?? null,
    status: "processing",
    durationSeconds: Number(validDuration),
  });

  return NextResponse.json({ requestId: request_id, appId, jobId: job.id });
}

// Poll for job status/result
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!FAL_API_KEY) {
    return NextResponse.json(
      { error: "Video generation is not configured on this server." },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const requestId = searchParams.get("id");
  const appId = searchParams.get("appId") ?? TEXT_TO_VIDEO_APP_ID;
  const jobId = searchParams.get("jobId");
  if (!requestId) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
  }

  const falBase = `${FAL_QUEUE_BASE}/${appId}`;

  const statusRes = await fetch(`${falBase}/requests/${requestId}/status`, {
    headers: { Authorization: `Key ${FAL_API_KEY}` },
  });

  if (!statusRes.ok) {
    return NextResponse.json({ error: "Failed to check status" }, { status: 502 });
  }

  const statusData = await statusRes.json();
  const status = statusData.status as string;

  if (status === "COMPLETED") {
    const resultRes = await fetch(`${falBase}/requests/${requestId}`, {
      headers: { Authorization: `Key ${FAL_API_KEY}` },
    });
    if (!resultRes.ok) {
      return NextResponse.json({ error: "Failed to fetch result" }, { status: 502 });
    }
    const result = await resultRes.json();
    const videoUrl = result.video?.url ?? null;

    if (jobId) {
      updateVideoJob(jobId, {
        status: "completed",
        videoUrl,
        completedAt: new Date(),
      }).catch(() => {});
    }

    return NextResponse.json({ status: "completed", videoUrl });
  }

  if (status === "FAILED") {
    const errorMessage = statusData.error ?? "Generation failed";

    if (jobId) {
      updateVideoJob(jobId, {
        status: "failed",
        errorMessage,
        completedAt: new Date(),
      }).catch(() => {});
    }

    return NextResponse.json({ status: "failed", error: errorMessage });
  }

  return NextResponse.json({ status: "processing" });
}
