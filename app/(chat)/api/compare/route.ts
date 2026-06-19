import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import {
  getCompareSessions,
  saveCompareSession,
} from "@/lib/db/compare-queries";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessions = await getCompareSessions(session.user.id);
  return NextResponse.json({ sessions });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { modelIds: string[]; prompts: string[]; title?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { modelIds, prompts, title } = body;
  if (!Array.isArray(modelIds) || modelIds.length === 0) {
    return NextResponse.json({ error: "modelIds required" }, { status: 400 });
  }

  const autoTitle =
    title ||
    (prompts[0] ? prompts[0].slice(0, 60) : null) ||
    "Comparison session";

  const saved = await saveCompareSession({
    userId: session.user.id,
    title: autoTitle,
    modelIds,
    prompts: prompts ?? [],
  });

  return NextResponse.json({ session: saved }, { status: 201 });
}
