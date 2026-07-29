import { and, eq, isNotNull, ne, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { type NextRequest, NextResponse } from "next/server";
import postgres from "postgres";
import { createClient } from "redis";
import * as schema from "@/lib/db/schema";
import { sendAnnualUpgradeEmail } from "@/lib/email/send-subscription-email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Annual plan prices in cents (20% off monthly × 12)
const PLAN_META: Record<
  string,
  { name: string; monthlyCents: number; annualCents: number }
> = {
  pro: { name: "Plus", monthlyCents: 1200, annualCents: 11_520 },
  premium: { name: "Pro", monthlyCents: 2500, annualCents: 24_000 },
  enterprise: { name: "Max", monthlyCents: 5000, annualCents: 48_000 },
};

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

  // Find active paid subscribers on monthly plans.
  // Monthly plans have a billing period < 60 days (annual plans are ~365 days).
  // We detect this by comparing currentPeriodEnd - currentPeriodStart.
  const candidates = await db
    .select({
      userId: schema.userTier.userId,
      email: schema.user.email,
      tier: schema.userTier.tier,
    })
    .from(schema.userTier)
    .innerJoin(schema.user, eq(schema.userTier.userId, schema.user.id))
    .where(
      and(
        ne(schema.userTier.tier, "free"),
        eq(schema.userTier.subscriptionStatus, "active"),
        eq(schema.user.emailUnsubscribed, false),
        isNotNull(schema.userTier.subscriptionId),
        isNotNull(schema.userTier.currentPeriodStart),
        isNotNull(schema.userTier.currentPeriodEnd),
        // Billing period < 60 days → monthly plan (annual ≈ 365 days)
        sql`(${schema.userTier.currentPeriodEnd} - ${schema.userTier.currentPeriodStart}) < interval '60 days'`
      )
    );

  const guestPattern = /^guest-/i;
  const eligible = candidates.filter((u) => !guestPattern.test(u.email));

  let sent = 0;
  let skipped = 0;
  let errors = 0;

  for (const u of eligible) {
    const redisKey = `annual_offer_sent:${u.userId}`;

    if (redis?.isReady) {
      const alreadySent = await redis.get(redisKey).catch(() => null);
      if (alreadySent) {
        skipped++;
        continue;
      }
    } else if (!redis) {
      // Redis unavailable — skip to avoid repeat sends across cron runs
      skipped++;
      continue;
    }

    const plan = PLAN_META[u.tier];
    if (!plan) {
      skipped++;
      continue;
    }

    try {
      await sendAnnualUpgradeEmail(
        u.email,
        u.userId,
        plan.name,
        plan.monthlyCents,
        plan.annualCents
      );
      // 300-day TTL: just under a year so the offer can re-fire next year
      await redis
        .set(redisKey, "1", { EX: 300 * 24 * 60 * 60 })
        .catch(() => {});
      sent++;
    } catch {
      errors++;
    }
  }

  if (redis?.isReady) {
    await redis.disconnect().catch(() => {});
  }
  await client.end();

  return NextResponse.json({ sent, skipped, errors, total: eligible.length });
}
