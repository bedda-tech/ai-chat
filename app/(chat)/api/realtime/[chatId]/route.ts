export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Keep SSE connection alive up to 60 s on Vercel Pro; auto-reconnect handles the rest
export const maxDuration = 60;

import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getTeamsForChat, isTeamMember } from "@/lib/db/team-queries";
import {
  createSubscriber,
  publishChatEvent,
  REALTIME_CHANNEL,
  setTyping,
} from "@/lib/realtime";

// ── GET /api/realtime/[chatId]  ── SSE stream ──────────────────────────────
export async function GET(
  request: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { chatId } = await params;
  const userId = session.user.id;

  // Verify chat is team-shared and user is a member
  const teams = await getTeamsForChat(chatId);
  if (teams.length === 0) {
    return NextResponse.json({ error: "Not a team chat" }, { status: 403 });
  }

  const memberChecks = await Promise.all(
    teams.map((t) => isTeamMember(t.teamId, userId))
  );
  if (!memberChecks.some(Boolean)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const subscriber = await createSubscriber();

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const send = (data: string) => {
        try {
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        } catch {
          // connection closed
        }
      };

      // Send initial connection event
      send(JSON.stringify({ type: "connected" }));

      // Heartbeat every 25 s to prevent proxy timeouts
      const heartbeat = setInterval(() => send(":heartbeat\n"), 25_000);

      if (subscriber) {
        await subscriber.subscribe(REALTIME_CHANNEL(chatId), (message) => {
          send(message);
        });
      }

      request.signal.addEventListener("abort", async () => {
        clearInterval(heartbeat);
        if (subscriber) {
          try {
            await subscriber.unsubscribe();
            await subscriber.disconnect();
          } catch {
            // ignore cleanup errors
          }
        }
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

// ── POST /api/realtime/[chatId]  ── typing indicator ──────────────────────
export async function POST(
  request: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { chatId } = await params;
  const userId = session.user.id;
  const userName =
    (session.user as { name?: string }).name ||
    (session.user as { email?: string }).email ||
    "Someone";

  const teams = await getTeamsForChat(chatId);
  if (teams.length === 0) {
    return NextResponse.json({ error: "Not a team chat" }, { status: 403 });
  }

  const memberChecks = await Promise.all(
    teams.map((t) => isTeamMember(t.teamId, userId))
  );
  if (!memberChecks.some(Boolean)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Store typing key with TTL + broadcast event to channel
  await Promise.all([
    setTyping(chatId, userId, userName),
    publishChatEvent(chatId, { type: "typing", userId, userName }),
  ]);

  return NextResponse.json({ ok: true });
}
