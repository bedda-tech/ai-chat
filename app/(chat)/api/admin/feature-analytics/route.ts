import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";

const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes(email.toLowerCase());
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/feature-analytics
 * Returns tool/feature usage aggregated over the last 30 days, broken down by user tier.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Unnest the toolsUsed JSON array and count per tool, joined with user tier.
  // Falls back to "free" for users with no UserTier row.
  const rows = await db.execute(sql`
    SELECT
      tool_name,
      COALESCE(ut.tier, 'free') AS tier,
      COUNT(*) AS usage_count
    FROM "UsageEvent" ue
    CROSS JOIN LATERAL jsonb_array_elements_text(
      CASE
        WHEN ue."toolsUsed" IS NULL THEN '[]'::jsonb
        WHEN jsonb_typeof(ue."toolsUsed"::jsonb) = 'array' THEN ue."toolsUsed"::jsonb
        ELSE '[]'::jsonb
      END
    ) AS tool_name
    LEFT JOIN "UserTier" ut ON ut."userId" = ue."userId"
    WHERE ue."createdAt" >= NOW() - INTERVAL '30 days'
      AND tool_name <> ''
    GROUP BY tool_name, tier
    ORDER BY usage_count DESC
  `);

  // Aggregate into { toolName -> { free, pro, premium, enterprise, total } }
  const byTool: Record<
    string,
    { free: number; pro: number; premium: number; enterprise: number; total: number }
  > = {};

  for (const row of rows as unknown as Array<{
    tool_name: string;
    tier: string;
    usage_count: string;
  }>) {
    const name = row.tool_name;
    const tier = row.tier as "free" | "pro" | "premium" | "enterprise";
    const count = parseInt(row.usage_count, 10);
    if (!byTool[name]) {
      byTool[name] = { free: 0, pro: 0, premium: 0, enterprise: 0, total: 0 };
    }
    const validTiers = ["free", "pro", "premium", "enterprise"] as const;
    if (validTiers.includes(tier)) {
      byTool[name][tier] += count;
    }
    byTool[name].total += count;
  }

  const features = Object.entries(byTool)
    .map(([name, counts]) => ({ name, ...counts }))
    .sort((a, b) => b.total - a.total);

  // Total requests in the window for context
  const totalResult = await db.execute(sql`
    SELECT COUNT(*) AS total
    FROM "UsageEvent"
    WHERE "createdAt" >= NOW() - INTERVAL '30 days'
  `);
  const totalRequests = parseInt(
    (totalResult[0] as { total: string }).total,
    10
  );

  return NextResponse.json({
    features,
    totalRequests,
    windowDays: 30,
    timestamp: new Date().toISOString(),
  });
}
