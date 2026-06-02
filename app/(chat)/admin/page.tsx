import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { getModelMetrics, resetMetrics } from "@/lib/ai/middleware";

function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
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
  const entries = Object.entries(metrics).sort((a, b) => b[1].calls - a[1].calls);

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <h1 className="text-2xl font-bold mb-2">Admin: Model Performance</h1>
      <p className="text-sm text-muted-foreground mb-6">
        In-memory metrics — resets on server restart.
      </p>

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
                <tr key={modelId} className="border-t hover:bg-muted/30">
                  <td className="p-3 font-mono text-xs">{modelId}</td>
                  <td className="p-3 text-right">{m.calls.toLocaleString()}</td>
                  <td className="p-3 text-right">{m.avgLatencyMs.toLocaleString()} ms</td>
                  <td className="p-3 text-right">
                    {m.p95LatencyMs != null ? `${m.p95LatencyMs.toLocaleString()} ms` : "—"}
                  </td>
                  <td className="p-3 text-right">{m.totalTokens.toLocaleString()}</td>
                  <td className="p-3 text-right">
                    {m.calls > 0 ? `${((m.errors / m.calls) * 100).toFixed(1)}%` : "—"}
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
            type="submit"
            className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
          >
            Reset Metrics
          </button>
        </form>
      </div>
    </div>
  );
}
