import { and, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { type NextRequest, NextResponse } from "next/server";
import postgres from "postgres";
import { createClient } from "redis";
import * as schema from "@/lib/db/schema";
import { sendNearLimitEmail } from "@/lib/email/send-drip-email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FREE_TIER_LIMIT = 500;
const NOTIFY_THRESHOLD = Math.floor(FREE_TIER_LIMIT * 0.8); // 400

async function getRedis() {
  if (!process.env.REDIS_URL) return null;
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

  const now = new Date();
  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
  );
  const monthKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

  const redis = await getRedis();

  // Find free users at or above 80% of their monthly limit this month
  const nearLimitUsers = await db
    .select({
      userId: schema.userUsage.userId,
      email: schema.user.email,
      messageCount: schema.userUsage.messageCount,
    })
    .from(schema.userUsage)
    .innerJoin(schema.user, eq(schema.userUsage.userId, schema.user.id))
    .innerJoin(
      schema.userTier,
      eq(schema.userUsage.userId, schema.userTier.userId)
    )
    .where(
      and(
        eq(schema.userUsage.month, monthStart),
        eq(schema.userTier.tier, "free"),
        sql`CAST(${schema.userUsage.messageCount} AS INTEGER) >= ${NOTIFY_THRESHOLD}`
      )
    );

  const guestPattern = /^guest-/i;
  const realUsers = nearLimitUsers.filter((u) => !guestPattern.test(u.email));

  let sent = 0;
  let skipped = 0;
  let errors = 0;

  for (const u of realUsers) {
    const redisKey = `near_limit_notified:${u.userId}:${monthKey}`;

    if (redis?.isReady) {
      const alreadySent = await redis.get(redisKey).catch(() => null);
      if (alreadySent) {
        skipped++;
        continue;
      }
    } else if (!redis) {
      // Redis unavailable — skip to avoid spamming users across cron runs
      skipped++;
      continue;
    }

    try {
      const used = parseInt(u.messageCount, 10);
      await sendNearLimitEmail(u.email, used, FREE_TIER_LIMIT);
      await redis.set(redisKey, "1", { EX: 35 * 24 * 60 * 60 }).catch(() => {});
      sent++;
    } catch {
      errors++;
    }
  }

  if (redis?.isReady) await redis.disconnect().catch(() => {});
  await client.end();

  return NextResponse.json({ sent, skipped, errors, total: realUsers.length });
}
