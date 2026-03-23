/**
 * API Route: AI Model Performance Metrics
 * Returns per-model latency, token usage, and error rates collected by
 * the performance middleware in lib/ai/middleware.ts.
 */

import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getModelMetrics, resetMetrics } from "@/lib/ai/middleware";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/metrics
 * Returns current model performance snapshot.
 * Requires authenticated session.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const metrics = getModelMetrics();

  return NextResponse.json({
    metrics,
    modelCount: Object.keys(metrics).length,
    timestamp: new Date().toISOString(),
  });
}

/**
 * DELETE /api/admin/metrics
 * Resets all in-memory performance metrics.
 * Requires authenticated session.
 */
export async function DELETE() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  resetMetrics();

  return NextResponse.json({ success: true, message: "Metrics reset" });
}
