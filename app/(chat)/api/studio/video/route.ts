import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getUserTier } from "@/lib/usage/tracking";

const FAL_API_KEY = process.env.FAL_API_KEY;
const APP_ID = "fal-ai/kling-video/v1.6/standard/text-to-video";
const FAL_BASE = `https://queue.fal.run/${APP_ID}`;

const UPGRADE_RESPONSE = NextResponse.json(
  { error: "Video generation requires a paid subscription.", upgrade: true },
  { status: 403 }
);

// Submit a video generation job, return { requestId }
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

  let body: { prompt: string; duration?: number; aspectRatio?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { prompt, duration = 5, aspectRatio = "16:9" } = body;

  if (!prompt?.trim()) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  const validDuration = duration === 10 ? "10" : "5";
  const validAspect = ["16:9", "9:16", "1:1"].includes(aspectRatio) ? aspectRatio : "16:9";

  const submitRes = await fetch(FAL_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Key ${FAL_API_KEY}`,
    },
    body: JSON.stringify({
      prompt: prompt.trim(),
      duration: validDuration,
      aspect_ratio: validAspect,
    }),
  });

  if (!submitRes.ok) {
    const errText = await submitRes.text().catch(() => "Unknown error");
    return NextResponse.json({ error: `Submission failed: ${errText}` }, { status: 502 });
  }

  const { request_id } = await submitRes.json();
  return NextResponse.json({ requestId: request_id });
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
  if (!requestId) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
  }

  const statusRes = await fetch(`${FAL_BASE}/requests/${requestId}/status`, {
    headers: { Authorization: `Key ${FAL_API_KEY}` },
  });

  if (!statusRes.ok) {
    return NextResponse.json({ error: "Failed to check status" }, { status: 502 });
  }

  const statusData = await statusRes.json();
  const status = statusData.status as string;

  if (status === "COMPLETED") {
    const resultRes = await fetch(`${FAL_BASE}/requests/${requestId}`, {
      headers: { Authorization: `Key ${FAL_API_KEY}` },
    });
    if (!resultRes.ok) {
      return NextResponse.json({ error: "Failed to fetch result" }, { status: 502 });
    }
    const result = await resultRes.json();
    return NextResponse.json({
      status: "completed",
      videoUrl: result.video?.url ?? null,
    });
  }

  if (status === "FAILED") {
    return NextResponse.json({
      status: "failed",
      error: statusData.error ?? "Generation failed",
    });
  }

  return NextResponse.json({ status: "processing" });
}
