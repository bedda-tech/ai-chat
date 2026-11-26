import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { chatModels, DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import { scheduledTask, userTier } from "@/lib/db/schema";
import { computeNextRun, isValidTimezone } from "@/lib/schedules/next-run";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_SCHEDULES = 10;

const db = drizzle(postgres(process.env.POSTGRES_URL!));

const createSchema = z.object({
  prompt: z.string().trim().min(3).max(4000),
  dayOfWeek: z.number().int().min(-1).max(6),
  hour: z.number().int().min(0).max(23),
  timezone: z.string().default("UTC"),
  modelId: z.string().optional(),
});

async function isPaid(userId: string): Promise<boolean> {
  const [row] = await db
    .select({ tier: userTier.tier })
    .from(userTier)
    .where(eq(userTier.userId, userId))
    .limit(1);
  return !!row && row.tier !== "free";
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const schedules = await db
    .select()
    .from(scheduledTask)
    .where(eq(scheduledTask.userId, session.user.id))
    .orderBy(desc(scheduledTask.createdAt));
  return Response.json({
    schedules,
    paid: await isPaid(session.user.id),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  if (!(await isPaid(userId))) {
    return Response.json(
      { error: "Scheduled tasks are available on paid plans." },
      { status: 403 }
    );
  }

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid schedule" }, { status: 400 });
  }
  const { prompt, dayOfWeek, hour, timezone, modelId } = parsed.data;
  if (!isValidTimezone(timezone)) {
    return Response.json({ error: "Invalid timezone" }, { status: 400 });
  }
  if (modelId && !chatModels.some((m) => m.id === modelId)) {
    return Response.json({ error: "Unknown model" }, { status: 400 });
  }

  const existing = await db
    .select({ id: scheduledTask.id })
    .from(scheduledTask)
    .where(eq(scheduledTask.userId, userId));
  if (existing.length >= MAX_SCHEDULES) {
    return Response.json(
      { error: `You can have up to ${MAX_SCHEDULES} schedules.` },
      { status: 400 }
    );
  }

  const [created] = await db
    .insert(scheduledTask)
    .values({
      userId,
      prompt,
      dayOfWeek,
      hour,
      timezone,
      modelId: modelId ?? DEFAULT_CHAT_MODEL,
      nextRunAt: computeNextRun(new Date(), dayOfWeek, hour, timezone),
    })
    .returning();
  return Response.json({ schedule: created });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  if (!body?.id || typeof body.enabled !== "boolean") {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  const [row] = await db
    .select()
    .from(scheduledTask)
    .where(
      and(
        eq(scheduledTask.id, body.id),
        eq(scheduledTask.userId, session.user.id)
      )
    )
    .limit(1);
  if (!row) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  if (body.enabled && !(await isPaid(session.user.id))) {
    return Response.json(
      { error: "Scheduled tasks are available on paid plans." },
      { status: 403 }
    );
  }
  await db
    .update(scheduledTask)
    .set({
      enabled: body.enabled,
      nextRunAt: body.enabled
        ? computeNextRun(new Date(), row.dayOfWeek, row.hour, row.timezone)
        : row.nextRunAt,
    })
    .where(eq(scheduledTask.id, row.id));
  return Response.json({ success: true });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await request.json().catch(() => ({ id: null }));
  if (!id) {
    return Response.json({ error: "Missing id" }, { status: 400 });
  }
  await db
    .delete(scheduledTask)
    .where(
      and(eq(scheduledTask.id, id), eq(scheduledTask.userId, session.user.id))
    );
  return Response.json({ success: true });
}
