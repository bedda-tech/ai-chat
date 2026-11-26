import { generateText } from "ai";
import { and, eq, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { type NextRequest, NextResponse } from "next/server";
import postgres from "postgres";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import { myProvider } from "@/lib/ai/providers";
import * as schema from "@/lib/db/schema";
import { sendScheduledTaskEmail } from "@/lib/email/send-scheduled-task-email";
import { computeNextRun } from "@/lib/schedules/next-run";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const BATCH = 10;

export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.POSTGRES_URL) {
    return NextResponse.json({ skipped: true, reason: "missing env vars" });
  }

  const client = postgres(process.env.POSTGRES_URL, { max: 1 });
  const db = drizzle(client, { schema });
  const now = new Date();
  let ran = 0;
  let failed = 0;

  try {
    const due = await db
      .select()
      .from(schema.scheduledTask)
      .where(
        and(
          eq(schema.scheduledTask.enabled, true),
          lte(schema.scheduledTask.nextRunAt, now)
        )
      )
      .limit(BATCH);

    for (const task of due) {
      // Advance first so a crash or slow model never re-runs the same slot.
      const nextRunAt = computeNextRun(
        now,
        task.dayOfWeek,
        task.hour,
        task.timezone
      );
      const claimed = await db
        .update(schema.scheduledTask)
        .set({ nextRunAt })
        .where(
          and(
            eq(schema.scheduledTask.id, task.id),
            eq(schema.scheduledTask.nextRunAt, task.nextRunAt)
          )
        )
        .returning({ id: schema.scheduledTask.id });
      if (claimed.length === 0) {
        continue;
      }

      try {
        const [tierRow] = await db
          .select({ tier: schema.userTier.tier })
          .from(schema.userTier)
          .where(eq(schema.userTier.userId, task.userId))
          .limit(1);
        if (!tierRow || tierRow.tier === "free") {
          await db
            .update(schema.scheduledTask)
            .set({
              enabled: false,
              lastError: "Paused: scheduled tasks need a paid plan.",
            })
            .where(eq(schema.scheduledTask.id, task.id));
          continue;
        }

        const { text } = await generateText({
          model: myProvider.languageModel(task.modelId ?? DEFAULT_CHAT_MODEL),
          system:
            "You are Bedda running a scheduled task for the user. Answer the request directly and completely; there is no chance to ask follow-up questions.",
          messages: [{ role: "user", content: task.prompt }],
          maxOutputTokens: 3000,
        });

        const chatId = crypto.randomUUID();
        const stamp = new Date();
        await db.insert(schema.chat).values({
          id: chatId,
          createdAt: stamp,
          userId: task.userId,
          title: `Scheduled: ${task.prompt.slice(0, 60)}`,
          visibility: "private",
        });
        await db.insert(schema.message).values([
          {
            id: crypto.randomUUID(),
            chatId,
            role: "user",
            parts: [{ type: "text", text: task.prompt }],
            attachments: [],
            createdAt: stamp,
          },
          {
            id: crypto.randomUUID(),
            chatId,
            role: "assistant",
            parts: [{ type: "text", text }],
            attachments: [],
            createdAt: new Date(stamp.getTime() + 1),
            modelId: task.modelId ?? DEFAULT_CHAT_MODEL,
          },
        ]);
        await db
          .update(schema.scheduledTask)
          .set({ lastRunAt: stamp, lastChatId: chatId, lastError: null })
          .where(eq(schema.scheduledTask.id, task.id));
        ran++;

        const [u] = await db
          .select({
            email: schema.user.email,
            unsub: schema.user.emailUnsubscribed,
          })
          .from(schema.user)
          .where(eq(schema.user.id, task.userId))
          .limit(1);
        if (u && !u.unsub && process.env.RESEND_API_KEY) {
          await sendScheduledTaskEmail({
            email: u.email,
            userId: task.userId,
            prompt: task.prompt,
            answer: text,
            chatId,
          }).catch((e) => console.error("[scheduled-tasks] email failed", e));
        }
      } catch (err) {
        failed++;
        console.error("[scheduled-tasks] run failed", task.id, err);
        await db
          .update(schema.scheduledTask)
          .set({
            lastError: (err instanceof Error ? err.message : String(err)).slice(
              0,
              500
            ),
          })
          .where(eq(schema.scheduledTask.id, task.id));
      }
    }
    return NextResponse.json({ due: due.length, ran, failed });
  } finally {
    await client.end();
  }
}
