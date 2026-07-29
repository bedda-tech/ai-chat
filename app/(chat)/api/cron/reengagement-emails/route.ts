import { and, eq, gt, lt, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { type NextRequest, NextResponse } from "next/server";
import postgres from "postgres";
import { createClient } from "redis";
import * as schema from "@/lib/db/schema";
import { sendReengagementEmail } from "@/lib/email/send-drip-email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getRedis() {
  if (!process.env.REDIS_URL) {
    return null;
  }
  try {
    const client = createClient({ url: process.env.REDIS_URL });
    client.on("error", () => {});
    await client.connect();
    return client;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.POSTGRES_URL || !process.env.RESEND_API_KEY) {
    return NextResponse.json({ skipped: true, reason: "missing env vars" });
  }

  const client = postgres(process.env.POSTGRES_URL);
  const db = drizzle(client, { schema });
  const redis = await getRedis();

  const now = new Date();
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  // Find free users who have usage events but went inactive 14-30 days ago.
  // Uses a GROUP BY + HAVING to filter by max(usageEvent.createdAt) efficiently.
  const candidates = await db
    .select({
      userId: schema.user.id,
      email: schema.user.email,
      lastActivity: sql<Date>`max(${schema.usageEvent.createdAt})`.as(
        "lastActivity"
      ),
    })
    .from(schema.user)
    .innerJoin(schema.userTier, eq(schema.userTier.userId, schema.user.id))
    .innerJoin(schema.usageEvent, eq(schema.usageEvent.userId, schema.user.id))
    .where(
      and(
        eq(schema.userTier.tier, "free"),
        eq(schema.user.emailUnsubscribed, false),
        // Registered within last 90 days — skip very cold accounts
        gt(schema.userTier.createdAt, ninetyDaysAgo)
      )
    )
    .groupBy(schema.user.id, schema.user.email)
    .having(
      and(
        // Last activity was more than 14 days ago
        lt(sql<Date>`max(${schema.usageEvent.createdAt})`, fourteenDaysAgo),
        // But not more than 30 days ago (beyond that they're truly churned)
        gt(sql<Date>`max(${schema.usageEvent.createdAt})`, thirtyDaysAgo)
      )
    );

  const guestPattern = /^guest-/i;
  const eligible = candidates.filter((u) => !guestPattern.test(u.email));

  let sent = 0;
  let skipped = 0;
  let errors = 0;

  for (const u of eligible) {
    const redisKey = `reengagement_sent:${u.userId}`;

    if (redis?.isReady) {
      const alreadySent = await redis.get(redisKey).catch(() => null);
      if (alreadySent) {
        skipped++;
        continue;
      }
    }

    try {
      await sendReengagementEmail(u.email, u.userId);
      // 30-day TTL — one re-engagement email per month per user
      if (redis?.isReady) {
        await redis
          .set(redisKey, "1", { EX: 30 * 24 * 60 * 60 })
          .catch(() => {});
      }
      sent++;
    } catch {
      errors++;
    }
  }

  if (redis?.isReady) {
    await redis.disconnect().catch(() => {});
  }
  await client.end();

  return NextResponse.json({
    sent,
    skipped,
    errors,
    total: eligible.length,
  });
}
