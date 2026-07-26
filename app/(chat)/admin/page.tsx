import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { auth } from "@/app/(auth)/auth";
import { getCacheAnalytics } from "@/lib/ai/cache-analytics";
import { getModelMetrics, resetMetrics } from "@/lib/ai/middleware";

const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

type FeatureRow = {
  name: string;
  free: number;
  pro: number;
  premium: number;
  enterprise: number;
  total: number;
};

async function getFeatureAnalytics(): Promise<FeatureRow[]> {
  try {
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

    const byTool: Record<string, FeatureRow> = {};
    for (const row of rows as unknown as Array<{
      tool_name: string;
      tier: string;
      usage_count: string;
    }>) {
      const name = row.tool_name;
      const tier = row.tier as "free" | "pro" | "premium" | "enterprise";
      const count = parseInt(row.usage_count, 10);
      if (!byTool[name]) {
        byTool[name] = { name, free: 0, pro: 0, premium: 0, enterprise: 0, total: 0 };
      }
      const validTiers = ["free", "pro", "premium", "enterprise"] as const;
      if (validTiers.includes(tier)) {
        byTool[name][tier] += count;
      }
      byTool[name].total += count;
    }

    return Object.values(byTool).sort((a, b) => b.total - a.total);
  } catch {
    return [];
  }
}

function isAdmin(email: string | null | undefined): boolean {
  if (!email) {
    return false;
  }
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes(email.toLowerCase());
}

async function resetMetricsAction() {
  "use server";
  resetMetrics();
  revalidatePath("/admin");
}

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    redirect("/");
  }

  const metrics = getModelMetrics();
  const entries = Object.entries(metrics).sort(
    (a, b) => b[1].calls - a[1].calls
  );
  const cache24h = getCacheAnalytics("24h");
  const featureRows = await getFeatureAnalytics();

  return (
    <div className="container mx-auto max-w-6xl p-8">
      <h1 className="mb-2 font-bold text-2xl">Admin: Model Performance</h1>
      <p className="mb-6 text-muted-foreground text-sm">
        In-memory metrics — resets on server restart.
      </p>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border p-4">
          <p className="text-muted-foreground text-xs uppercase tracking-wide">
            Requests (24h)
          </p>
          <p className="mt-1 font-bold text-2xl">
            {cache24h.totalRequests.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-muted-foreground text-xs uppercase tracking-wide">
            Cache Hit Rate
          </p>
          <p className="mt-1 font-bold text-2xl">{cache24h.hitRate}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-muted-foreground text-xs uppercase tracking-wide">
            Cached Tokens
          </p>
          <p className="mt-1 font-bold text-2xl">
            {cache24h.cachedTokens.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-muted-foreground text-xs uppercase tracking-wide">
            Est. Cost Savings
          </p>
          <p className="mt-1 font-bold text-2xl">{cache24h.totalSavings}</p>
        </div>
      </div>

      {entries.length === 0 ? (
        <p className="text-muted-foreground">
          No metrics yet. Send some chat messages to collect data.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 text-left font-semibold">Model</th>
                <th className="p-3 text-right font-semibold">Requests</th>
                <th className="p-3 text-right font-semibold">Avg Latency</th>
                <th className="p-3 text-right font-semibold">P95 Latency</th>
                <th className="p-3 text-right font-semibold">Total Tokens</th>
                <th className="p-3 text-right font-semibold">Error Rate</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(([modelId, m]) => (
                <tr className="border-t hover:bg-muted/30" key={modelId}>
                  <td className="p-3 font-mono text-xs">{modelId}</td>
                  <td className="p-3 text-right">{m.calls.toLocaleString()}</td>
                  <td className="p-3 text-right">
                    {m.avgLatencyMs.toLocaleString()} ms
                  </td>
                  <td className="p-3 text-right">
                    {m.p95LatencyMs != null
                      ? `${m.p95LatencyMs.toLocaleString()} ms`
                      : "—"}
                  </td>
                  <td className="p-3 text-right">
                    {m.totalTokens.toLocaleString()}
                  </td>
                  <td className="p-3 text-right">
                    {m.calls > 0
                      ? `${((m.errors / m.calls) * 100).toFixed(1)}%`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6">
        <form action={resetMetricsAction}>
          <button
            className="rounded-md bg-destructive px-4 py-2 font-medium text-destructive-foreground text-sm hover:bg-destructive/90"
            type="submit"
          >
            Reset Metrics
          </button>
        </form>
      </div>

      <div className="mt-10">
        <h2 className="mb-1 font-bold text-xl">Feature Usage (Last 30 Days)</h2>
        <p className="mb-4 text-muted-foreground text-sm">
          Tool invocations per feature broken down by subscription tier.
          Data populates as users trigger tool calls.
        </p>
        {featureRows.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No feature usage data yet. Tool calls will appear here once users start using premium features.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-3 text-left font-semibold">Feature / Tool</th>
                  <th className="p-3 text-right font-semibold">Total</th>
                  <th className="p-3 text-right font-semibold">Free</th>
                  <th className="p-3 text-right font-semibold">Plus (pro)</th>
                  <th className="p-3 text-right font-semibold">Pro (premium)</th>
                  <th className="p-3 text-right font-semibold">Max (enterprise)</th>
                </tr>
              </thead>
              <tbody>
                {featureRows.map((row) => (
                  <tr className="border-t hover:bg-muted/30" key={row.name}>
                    <td className="p-3 font-mono text-xs">{row.name}</td>
                    <td className="p-3 text-right font-semibold">{row.total.toLocaleString()}</td>
                    <td className="p-3 text-right text-muted-foreground">{row.free > 0 ? row.free.toLocaleString() : "—"}</td>
                    <td className="p-3 text-right">{row.pro > 0 ? row.pro.toLocaleString() : "—"}</td>
                    <td className="p-3 text-right">{row.premium > 0 ? row.premium.toLocaleString() : "—"}</td>
                    <td className="p-3 text-right">{row.enterprise > 0 ? row.enterprise.toLocaleString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
