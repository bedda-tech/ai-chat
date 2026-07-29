import { and, desc, eq, gte, lt, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { type NextRequest, NextResponse } from "next/server";
import postgres from "postgres";
import modelsData from "@/lib/ai/models-data.json" with { type: "json" };
import * as schema from "@/lib/db/schema";
import { sendMonthlyUsageReportEmail } from "@/lib/email/send-monthly-report";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL_NAMES: Record<string, string> = {};
for (const model of modelsData.models) {
  MODEL_NAMES[model.id] = model.name;
}

function getPreviousMonth(): { start: Date; end: Date; label: string } {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth(); // 0-indexed current month
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const start = new Date(Date.UTC(prevYear, prevMonth, 1));
  const end = new Date(Date.UTC(prevYear, prevMonth + 1, 1));
  const label = start.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  return { start, end, label };
}

export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.POSTGRES_URL || !process.env.RESEND_API_KEY) {
    return NextResponse.json({ skipped: true, reason: "missing env vars" });
  }

  const { start, end, label } = getPreviousMonth();

  const client = postgres(process.env.POSTGRES_URL);
  const db = drizzle(client, { schema });

  // All users with at least 1 message in the previous month, excluding unsubscribed
  const usageRows = await db
    .select({
      userId: schema.userUsage.userId,
      email: schema.user.email,
      tier: schema.userTier.tier,
      messageCount: schema.userUsage.messageCount,
      inputTokens: schema.userUsage.inputTokens,
      outputTokens: schema.userUsage.outputTokens,
      totalCost: schema.userUsage.totalCost,
    })
    .from(schema.userUsage)
    .innerJoin(schema.user, eq(schema.userUsage.userId, schema.user.id))
    .innerJoin(
      schema.userTier,
      eq(schema.userUsage.userId, schema.userTier.userId)
    )
    .where(
      and(
        eq(schema.userUsage.month, start),
        eq(schema.user.emailUnsubscribed, false)
      )
    );

  let sent = 0;
  const errors: string[] = [];

  for (const row of usageRows) {
    if (!row.email) {
      continue;
    }
    const messageCount = Number.parseInt(row.messageCount, 10);
    if (messageCount === 0) {
      continue;
    }

    // Top 3 models by number of requests this month
    const topModels = await db
      .select({
        modelId: schema.usageEvent.modelId,
        count: sql<number>`cast(count(*) as int)`.as("count"),
      })
      .from(schema.usageEvent)
      .where(
        and(
          eq(schema.usageEvent.userId, row.userId),
          gte(schema.usageEvent.createdAt, start),
          lt(schema.usageEvent.createdAt, end)
        )
      )
      .groupBy(schema.usageEvent.modelId)
      .orderBy(desc(sql`count(*)`))
      .limit(3);

    try {
      await sendMonthlyUsageReportEmail({
        email: row.email,
        tier: row.tier,
        month: label,
        messageCount,
        totalTokens:
          Number.parseInt(row.inputTokens, 10) +
          Number.parseInt(row.outputTokens, 10),
        totalCostUsd: Number.parseFloat(row.totalCost ?? "0"),
        topModels: topModels.map((m) => ({
          modelId: m.modelId,
          displayName: MODEL_NAMES[m.modelId] ?? m.modelId,
          count: m.count,
        })),
      });
      sent++;
    } catch (e) {
      errors.push(`${row.email}: ${String(e)}`);
    }
  }

  await client.end();

  return NextResponse.json({
    sent,
    total: usageRows.length,
    month: label,
    ...(errors.length > 0 && { errors }),
  });
}
