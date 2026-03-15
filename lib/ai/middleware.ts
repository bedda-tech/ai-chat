/**
 * AI SDK Middleware for logging, monitoring, and observability
 * Uses LanguageModelMiddleware (v3) from AI SDK
 */

import type { LanguageModelMiddleware } from "ai";

// In-memory performance metrics per model
type ModelMetrics = {
  calls: number;
  totalLatencyMs: number;
  totalTokens: number;
  errors: number;
};

const metricsStore = new Map<string, ModelMetrics>();

function getMetrics(modelId: string): ModelMetrics {
  if (!metricsStore.has(modelId)) {
    metricsStore.set(modelId, {
      calls: 0,
      totalLatencyMs: 0,
      totalTokens: 0,
      errors: 0,
    });
  }
  return metricsStore.get(modelId)!;
}

/**
 * Logging middleware — logs model, latency, and token usage for every call.
 */
export const loggingMiddleware: LanguageModelMiddleware = {
  specificationVersion: "v3",

  wrapGenerate: async ({ doGenerate, model }) => {
    const start = Date.now();
    const modelId = model.modelId;
    try {
      const result = await doGenerate();
      const latency = Date.now() - start;
      const totalTokens =
        (result.usage?.inputTokens?.total ?? 0) +
        (result.usage?.outputTokens?.total ?? 0);
      console.log(
        `[AI] generate ${modelId} — ${latency}ms, ${totalTokens} tokens`
      );
      return result;
    } catch (err) {
      console.error(`[AI] generate ${modelId} — error after ${Date.now() - start}ms`, err);
      throw err;
    }
  },

  wrapStream: async ({ doStream, model }) => {
    const start = Date.now();
    const modelId = model.modelId;
    console.log(`[AI] stream ${modelId} — start`);
    try {
      const result = await doStream();
      console.log(`[AI] stream ${modelId} — first chunk after ${Date.now() - start}ms`);
      return result;
    } catch (err) {
      console.error(`[AI] stream ${modelId} — error after ${Date.now() - start}ms`, err);
      throw err;
    }
  },
};

/**
 * Performance tracking middleware — records per-model latency + token usage in memory.
 * Accessible via getModelMetrics() for dashboards or health checks.
 */
export const performanceMiddleware: LanguageModelMiddleware = {
  specificationVersion: "v3",

  wrapGenerate: async ({ doGenerate, model }) => {
    const start = Date.now();
    const metrics = getMetrics(model.modelId);
    metrics.calls++;
    try {
      const result = await doGenerate();
      metrics.totalLatencyMs += Date.now() - start;
      metrics.totalTokens +=
        (result.usage?.inputTokens?.total ?? 0) +
        (result.usage?.outputTokens?.total ?? 0);
      return result;
    } catch (err) {
      metrics.errors++;
      throw err;
    }
  },

  wrapStream: async ({ doStream, model }) => {
    const start = Date.now();
    const metrics = getMetrics(model.modelId);
    metrics.calls++;
    try {
      const result = await doStream();
      metrics.totalLatencyMs += Date.now() - start;
      return result;
    } catch (err) {
      metrics.errors++;
      throw err;
    }
  },
};

/**
 * Returns per-model performance metrics snapshot.
 */
export function getModelMetrics(): Record<string, ModelMetrics & { avgLatencyMs: number }> {
  const out: Record<string, ModelMetrics & { avgLatencyMs: number }> = {};
  for (const [modelId, m] of metricsStore.entries()) {
    out[modelId] = {
      ...m,
      avgLatencyMs: m.calls > 0 ? Math.round(m.totalLatencyMs / m.calls) : 0,
    };
  }
  return out;
}

/**
 * Reset all in-memory metrics (useful for testing or manual resets via admin API).
 */
export function resetMetrics(): void {
  metricsStore.clear();
}

/** @deprecated no-op kept for backward compat */
export function clearCache(): void {}

/** @deprecated no-op kept for backward compat */
export function getCacheStats(): { size: number; entries: Array<{ key: string; age: number }> } {
  return { size: 0, entries: [] };
}
