import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { and, eq, gte, lt } from "drizzle-orm";
import * as schema from "@/lib/db/schema";
import { sendDripEmailDay3, sendDripEmailDay7 } from "@/lib/email/send-drip-email";

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

  const day3Window = dayWindowAgo(3);
  const day7Window = dayWindowAgo(7);

  // Fetch free, non-guest users who signed up in each window
  const [day3Users, day7Users] = await Promise.all([
    db
      .select({ email: schema.user.email })
      .from(schema.userTier)
      .innerJoin(schema.user, eq(schema.userTier.userId, schema.user.id))
      .where(
        and(
          eq(schema.userTier.tier, "free"),
          gte(schema.userTier.createdAt, day3Window.start),
          lt(schema.userTier.createdAt, day3Window.end)
        )
      ),
    db
      .select({ email: schema.user.email })
      .from(schema.userTier)
      .innerJoin(schema.user, eq(schema.userTier.userId, schema.user.id))
      .where(
        and(
          eq(schema.userTier.tier, "free"),
          gte(schema.userTier.createdAt, day7Window.start),
          lt(schema.userTier.createdAt, day7Window.end)
        )
      ),
  ]);

  // Filter out guest accounts (they have no real email)
  const guestPattern = /^guest-/i;
  const realDay3 = day3Users.filter((u) => !guestPattern.test(u.email));
  const realDay7 = day7Users.filter((u) => !guestPattern.test(u.email));

  const results = { day3: 0, day7: 0, errors: 0 };

  await Promise.all([
    ...realDay3.map(async (u) => {
      try {
        await sendDripEmailDay3(u.email);
        results.day3++;
      } catch {
        results.errors++;
      }
    }),
    ...realDay7.map(async (u) => {
      try {
        await sendDripEmailDay7(u.email);
        results.day7++;
      } catch {
        results.errors++;
      }
    }),
  ]);

  await client.end();

  return NextResponse.json({
    sent: results,
    windows: {
      day3: { start: day3Window.start, end: day3Window.end },
      day7: { start: day7Window.start, end: day7Window.end },
    },
  });
}
