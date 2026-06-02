/**
 * AI SDK Middleware for logging, monitoring, and observability
 * Uses LanguageModelMiddleware (v3) from AI SDK
 */

import crypto from "crypto";
import { createClient } from "redis";
import type { LanguageModelMiddleware } from "ai";

// In-memory performance metrics per model
type ModelMetrics = {
  calls: number;
  totalLatencyMs: number;
  totalTokens: number;
  errors: number;
  latencySamples: number[]; // bounded ring buffer, last 200 calls
};

const metricsStore = new Map<string, ModelMetrics>();

function getMetrics(modelId: string): ModelMetrics {
  if (!metricsStore.has(modelId)) {
    metricsStore.set(modelId, {
      calls: 0,
      totalLatencyMs: 0,
      totalTokens: 0,
      errors: 0,
      latencySamples: [],
    });
  }
  return metricsStore.get(modelId)!;
}

const logEnabled = () => process.env.LOG_AI_CALLS !== "false";

/**
 * Logging middleware — logs model, latency, finish reason, and token usage per call.
 * Disable by setting LOG_AI_CALLS=false in env.
 */
export const loggingMiddleware: LanguageModelMiddleware = {
  specificationVersion: "v3",

  wrapGenerate: async ({ doGenerate, model }) => {
    const start = Date.now();
    const modelId = model.modelId;
    try {
      const result = await doGenerate();
      if (logEnabled()) {
        const latency = Date.now() - start;
        const inputTokens = result.usage?.inputTokens?.total ?? 0;
        const outputTokens = result.usage?.outputTokens?.total ?? 0;
        const finishReason = result.finishReason ?? "unknown";
        console.log(
          `[AI] model=${modelId} latency=${latency}ms finishReason=${finishReason} inputTokens=${inputTokens} outputTokens=${outputTokens}`
        );
      }
      return result;
    } catch (err) {
      if (logEnabled()) {
        console.error(`[AI] model=${modelId} error after ${Date.now() - start}ms`, err);
      }
      throw err;
    }
  },

  wrapStream: async ({ doStream, model }) => {
    const start = Date.now();
    const modelId = model.modelId;
    if (logEnabled()) console.log(`[AI] model=${modelId} stream=start`);
    try {
      const result = await doStream();
      if (logEnabled()) {
        console.log(`[AI] model=${modelId} stream=ready latency=${Date.now() - start}ms`);
      }
      return result;
    } catch (err) {
      if (logEnabled()) {
        console.error(`[AI] model=${modelId} stream=error after ${Date.now() - start}ms`, err);
      }
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
      const latency = Date.now() - start;
      metrics.totalLatencyMs += latency;
      metrics.totalTokens +=
        (result.usage?.inputTokens?.total ?? 0) +
        (result.usage?.outputTokens?.total ?? 0);
      if (metrics.latencySamples.length >= 200) metrics.latencySamples.shift();
      metrics.latencySamples.push(latency);
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
      const latency = Date.now() - start;
      metrics.totalLatencyMs += latency;
      if (metrics.latencySamples.length >= 200) metrics.latencySamples.shift();
      metrics.latencySamples.push(latency);
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
export function getModelMetrics(): Record<string, ModelMetrics & { avgLatencyMs: number; p95LatencyMs: number | null }> {
  const out: Record<string, ModelMetrics & { avgLatencyMs: number; p95LatencyMs: number | null }> = {};
  for (const [modelId, m] of metricsStore.entries()) {
    const sorted = [...m.latencySamples].sort((a, b) => a - b);
    const p95 = sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.95)] ?? null : null;
    out[modelId] = {
      ...m,
      avgLatencyMs: m.calls > 0 ? Math.round(m.totalLatencyMs / m.calls) : 0,
      p95LatencyMs: p95,
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

// ─── Redis-backed AI Response Cache ──────────────────────────────────────────

type RedisClient = ReturnType<typeof createClient>;
let _redis: RedisClient | null = null;
let _redisConnecting = false;

async function getRedis(): Promise<RedisClient | null> {
  if (typeof window !== "undefined") return null; // server-only
  if (!process.env.REDIS_URL) return null;
  if (_redis?.isReady) return _redis;
  if (_redisConnecting) return null;
  try {
    _redisConnecting = true;
    const client = createClient({ url: process.env.REDIS_URL });
    client.on("error", (err) => console.error("[cache] Redis error:", err));
    await client.connect();
    _redis = client;
    return _redis;
  } catch (err) {
    console.error("[cache] Redis connection failed:", err);
    return null;
  } finally {
    _redisConnecting = false;
  }
}

const CACHE_PREFIX = "ai:cache:";
const cacheEnabled = () => process.env.CACHE_AI_RESPONSES !== "false";
const cacheTTLSeconds = () => parseInt(process.env.CACHE_AI_TTL_SECONDS ?? "3600", 10);

function buildCacheKey(modelId: string, prompt: unknown): string {
  const hash = crypto
    .createHash("sha256")
    .update(JSON.stringify({ modelId, prompt }))
    .digest("hex");
  return CACHE_PREFIX + hash;
}

function syntheticStream(cachedResult: {
  content?: Array<{ type: string; text?: string }>;
  finishReason?: string;
  usage?: unknown;
  warnings?: unknown[];
}) {
  const textParts = (cachedResult.content ?? []).filter(
    (p): p is { type: "text"; text: string } => p.type === "text" && typeof p.text === "string"
  );

  return new ReadableStream({
    start(controller) {
      controller.enqueue({ type: "stream-start", warnings: cachedResult.warnings ?? [] });
      for (let i = 0; i < textParts.length; i++) {
        const id = `cached-${i}`;
        controller.enqueue({ type: "text-start", id });
        controller.enqueue({ type: "text-delta", id, delta: textParts[i].text });
        controller.enqueue({ type: "text-end", id });
      }
      controller.enqueue({
        type: "finish",
        finishReason: cachedResult.finishReason ?? "stop",
        usage: cachedResult.usage ?? { inputTokens: { total: 0 }, outputTokens: { total: 0 } },
      });
      controller.close();
    },
  });
}

/**
 * Response caching middleware — caches generate results in Redis by prompt hash.
 * On stream cache hit, returns a synthetic stream from the cached generate result.
 * Disable by setting CACHE_AI_RESPONSES=false; TTL via CACHE_AI_TTL_SECONDS (default 3600).
 */
export const cachingMiddleware: LanguageModelMiddleware = {
  specificationVersion: "v3",

  wrapGenerate: async ({ doGenerate, params, model }) => {
    if (!cacheEnabled()) return doGenerate();
    const redis = await getRedis().catch(() => null);
    if (!redis) return doGenerate();

    const cacheKey = buildCacheKey(model.modelId, params.prompt);
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log(`[cache] HIT generate model=${model.modelId}`);
        return JSON.parse(cached);
      }
    } catch (err) {
      console.error("[cache] Redis get error:", err);
    }

    const result = await doGenerate();
    try {
      await redis.set(cacheKey, JSON.stringify(result), { EX: cacheTTLSeconds() });
    } catch (err) {
      console.error("[cache] Redis set error:", err);
    }
    return result;
  },

  wrapStream: async ({ doStream, params, model }) => {
    if (!cacheEnabled()) return doStream();
    const redis = await getRedis().catch(() => null);
    if (!redis) return doStream();

    const cacheKey = buildCacheKey(model.modelId, params.prompt);
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log(`[cache] HIT stream model=${model.modelId}`);
        return { stream: syntheticStream(JSON.parse(cached)) } as Awaited<ReturnType<typeof doStream>>;
      }
    } catch (err) {
      console.error("[cache] Redis get error:", err);
    }

    return doStream();
  },
};

export async function getCacheStats(): Promise<{
  size: number;
  entries: Array<{ key: string; age: number }>;
}> {
  const redis = await getRedis().catch(() => null);
  if (!redis) return { size: 0, entries: [] };
  try {
    const keys = await redis.keys(CACHE_PREFIX + "*");
    const ttl = cacheTTLSeconds();
    const entries = await Promise.all(
      keys.slice(0, 20).map(async (key) => {
        const remaining = await redis.ttl(key).catch(() => ttl);
        return { key: key.replace(CACHE_PREFIX, ""), age: Math.max(0, ttl - remaining) };
      })
    );
    return { size: keys.length, entries };
  } catch {
    return { size: 0, entries: [] };
  }
}

export async function clearCache(): Promise<void> {
  const redis = await getRedis().catch(() => null);
  if (!redis) return;
  try {
    const keys = await redis.keys(CACHE_PREFIX + "*");
    if (keys.length > 0) await redis.del(keys);
    console.log(`[cache] Cleared ${keys.length} cache entries`);
  } catch (err) {
    console.error("[cache] clearCache error:", err);
  }
}

// ─── Guardrails ──────────────────────────────────────────────────────────────

const REDACTED_RESPONSE =
  "I can't share my internal instructions or configuration. Is there something else I can help you with?";

/**
 * Fragments that, if present in a model response, indicate system prompt leakage.
 * These are stable strings from prompts.ts that the model should never repeat verbatim.
 */
const SYSTEM_PROMPT_FRAGMENTS = [
  // regularPrompt
  "You are a friendly assistant! Keep your responses concise",
  // artifactsPrompt
  "Artifacts is a special user interface mode",
  "DO NOT UPDATE DOCUMENTS IMMEDIATELY AFTER CREATING THEM",
  // agentPrompt
  "You are running in Deep Research mode",
  // systemPrompt XML wrappers
  "<custom_instructions>",
  "<knowledge_base_context>",
  "<project_instructions>",
  // internal tool names that should never be narrated
  "webSearch tool",
  "artifactsPrompt",
];

function containsSystemPromptLeak(text: string): boolean {
  const lower = text.toLowerCase();
  return SYSTEM_PROMPT_FRAGMENTS.some((fragment) =>
    lower.includes(fragment.toLowerCase())
  );
}

/**
 * Guardrails middleware — Phase 1.
 * Detects system prompt leakage in non-streaming (generate) responses and replaces
 * the output with a safe fallback message. Streaming responses pass through — buffering
 * full streams to intercept is a Phase 2 concern.
 */
export const guardrailsMiddleware: LanguageModelMiddleware = {
  specificationVersion: "v3",

  wrapGenerate: async ({ doGenerate, model }) => {
    const result = await doGenerate();

    // In AI SDK v6, text content lives in result.content (array of parts)
    const textContent = result.content
      .filter((p): p is Extract<typeof p, { type: "text" }> => p.type === "text")
      .map((p) => p.text)
      .join("");

    if (containsSystemPromptLeak(textContent)) {
      console.warn(
        `[guardrails] System prompt leakage detected in generate response (model: ${model.modelId})`
      );
      const sanitizedContent = result.content.map((p) =>
        p.type === "text" ? { ...p, text: REDACTED_RESPONSE } : p
      );
      return { ...result, content: sanitizedContent };
    }

    return result;
  },

  // Phase 2: accumulate stream chunks and intercept mid-stream.
  // For now, pass through — buffering degrades perceived latency.
  wrapStream: async ({ doStream }) => {
    return doStream();
  },
};
