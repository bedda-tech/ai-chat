import { and, eq, gte, lt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { type NextRequest, NextResponse } from "next/server";
import postgres from "postgres";
import * as schema from "@/lib/db/schema";
import {
  sendDripEmailDay1,
  sendDripEmailDay3,
  sendDripEmailDay7,
  sendDripEmailDay14,
  sendDripEmailDay21,
  sendDripEmailDay30,
} from "@/lib/email/send-drip-email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;

function dayWindowAgo(daysAgo: number): { start: Date; end: Date } {
  const now = Date.now();
  return {
    start: new Date(now - daysAgo * DAY_MS - 12 * 60 * 60 * 1000),
    end: new Date(now - daysAgo * DAY_MS + 12 * 60 * 60 * 1000),
  };
}

export async function GET(req: NextRequest) {
  // Vercel cron jobs send this header; reject unauthorized callers
  const secret = req.headers.get("authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.POSTGRES_URL || !process.env.RESEND_API_KEY) {
    return NextResponse.json({ skipped: true, reason: "missing env vars" });
  }

  const client = postgres(process.env.POSTGRES_URL);
  const db = drizzle(client, { schema });

  const day1Window = dayWindowAgo(1);
  const day3Window = dayWindowAgo(3);
  const day7Window = dayWindowAgo(7);
  const day14Window = dayWindowAgo(14);
  const day21Window = dayWindowAgo(21);
  const day30Window = dayWindowAgo(30);

  // Fetch free, non-unsubscribed users who signed up in each window
  const [day1Users, day3Users, day7Users, day14Users, day21Users, day30Users] =
    await Promise.all([
      db
        .select({ email: schema.user.email, userId: schema.user.id })
        .from(schema.userTier)
        .innerJoin(schema.user, eq(schema.userTier.userId, schema.user.id))
        .where(
          and(
            eq(schema.userTier.tier, "free"),
            eq(schema.user.emailUnsubscribed, false),
            gte(schema.userTier.createdAt, day1Window.start),
            lt(schema.userTier.createdAt, day1Window.end)
          )
        ),
      db
        .select({ email: schema.user.email, userId: schema.user.id })
        .from(schema.userTier)
        .innerJoin(schema.user, eq(schema.userTier.userId, schema.user.id))
        .where(
          and(
            eq(schema.userTier.tier, "free"),
            eq(schema.user.emailUnsubscribed, false),
            gte(schema.userTier.createdAt, day3Window.start),
            lt(schema.userTier.createdAt, day3Window.end)
          )
        ),
      db
        .select({ email: schema.user.email, userId: schema.user.id })
        .from(schema.userTier)
        .innerJoin(schema.user, eq(schema.userTier.userId, schema.user.id))
        .where(
          and(
            eq(schema.userTier.tier, "free"),
            eq(schema.user.emailUnsubscribed, false),
            gte(schema.userTier.createdAt, day7Window.start),
            lt(schema.userTier.createdAt, day7Window.end)
          )
        ),
      db
        .select({ email: schema.user.email, userId: schema.user.id })
        .from(schema.userTier)
        .innerJoin(schema.user, eq(schema.userTier.userId, schema.user.id))
        .where(
          and(
            eq(schema.userTier.tier, "free"),
            eq(schema.user.emailUnsubscribed, false),
            gte(schema.userTier.createdAt, day14Window.start),
            lt(schema.userTier.createdAt, day14Window.end)
          )
        ),
      db
        .select({ email: schema.user.email, userId: schema.user.id })
        .from(schema.userTier)
        .innerJoin(schema.user, eq(schema.userTier.userId, schema.user.id))
        .where(
          and(
            eq(schema.userTier.tier, "free"),
            eq(schema.user.emailUnsubscribed, false),
            gte(schema.userTier.createdAt, day21Window.start),
            lt(schema.userTier.createdAt, day21Window.end)
          )
        ),
      db
        .select({ email: schema.user.email, userId: schema.user.id })
        .from(schema.userTier)
        .innerJoin(schema.user, eq(schema.userTier.userId, schema.user.id))
        .where(
          and(
            eq(schema.userTier.tier, "free"),
            eq(schema.user.emailUnsubscribed, false),
            gte(schema.userTier.createdAt, day30Window.start),
            lt(schema.userTier.createdAt, day30Window.end)
          )
        ),
    ]);

  // Filter out guest accounts (they have no real email)
  const guestPattern = /^guest-/i;
  const realDay1 = day1Users.filter((u) => !guestPattern.test(u.email));
  const realDay3 = day3Users.filter((u) => !guestPattern.test(u.email));
  const realDay7 = day7Users.filter((u) => !guestPattern.test(u.email));
  const realDay14 = day14Users.filter((u) => !guestPattern.test(u.email));
  const realDay21 = day21Users.filter((u) => !guestPattern.test(u.email));
  const realDay30 = day30Users.filter((u) => !guestPattern.test(u.email));

  const results = { day1: 0, day3: 0, day7: 0, day14: 0, day21: 0, day30: 0, errors: 0 };

  await Promise.all([
    ...realDay1.map(async (u) => {
      try {
        await sendDripEmailDay1(u.email, u.userId);
        results.day1++;
      } catch {
        results.errors++;
      }
    }),
    ...realDay3.map(async (u) => {
      try {
        await sendDripEmailDay3(u.email, u.userId);
        results.day3++;
      } catch {
        results.errors++;
      }
    }),
    ...realDay7.map(async (u) => {
      try {
        await sendDripEmailDay7(u.email, u.userId);
        results.day7++;
      } catch {
        results.errors++;
      }
    }),
    ...realDay14.map(async (u) => {
      try {
        await sendDripEmailDay14(u.email, u.userId);
        results.day14++;
      } catch {
        results.errors++;
      }
    }),
    ...realDay21.map(async (u) => {
      try {
        await sendDripEmailDay21(u.email, u.userId);
        results.day21++;
      } catch {
        results.errors++;
      }
    }),
    ...realDay30.map(async (u) => {
      try {
        await sendDripEmailDay30(u.email, u.userId);
        results.day30++;
      } catch {
        results.errors++;
      }
    }),
  ]);

  await client.end();

  return NextResponse.json({
    sent: results,
    windows: {
      day1: { start: day1Window.start, end: day1Window.end },
      day3: { start: day3Window.start, end: day3Window.end },
      day7: { start: day7Window.start, end: day7Window.end },
      day14: { start: day14Window.start, end: day14Window.end },
      day21: { start: day21Window.start, end: day21Window.end },
      day30: { start: day30Window.start, end: day30Window.end },
    },
  });
}
