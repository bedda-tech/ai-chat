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
