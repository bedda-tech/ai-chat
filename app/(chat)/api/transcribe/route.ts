import { openai } from "@ai-sdk/openai";
import { experimental_transcribe as transcribe } from "ai";
import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import {
  createRateLimitResponse,
  rateLimitMiddleware,
} from "@/lib/middleware/rate-limit";

export const maxDuration = 30;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const rateLimitResult = await rateLimitMiddleware(userId);
  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(rateLimitResult);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const audioFile = formData.get("audio");
  if (!audioFile || !(audioFile instanceof Blob)) {
    return NextResponse.json(
      { error: "No audio file provided" },
      { status: 400 }
    );
  }

  if (audioFile.size > 25 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Audio file too large (max 25MB)" },
      { status: 413 }
    );
  }

  try {
    const buffer = await audioFile.arrayBuffer();
    const audio = new Uint8Array(buffer);

    const { text } = await transcribe({
      model: openai.transcription("whisper-1"),
      audio,
    });

    return NextResponse.json({ text });
  } catch (err) {
    console.error("Transcription error:", err);
    return NextResponse.json(
      { error: "Transcription failed. Please try again." },
      { status: 500 }
    );
  }
}
