/**
 * Server-Side Model Cache
 * Caches AI Gateway model discovery results to reduce API calls
 */

import { gateway } from "ai";
import modelsData from "./models-data.json" with { type: "json" };

type AvailableModel = {
  id: string;
  name: string;
  description?: string | null;
  pricing?: {
    input: number;
    output: number;
    cachedInputTokens?: number;
    cacheCreationInputTokens?: number;
  };
};

// Cache enriched models directly to avoid re-running transformToEnrichedModels on every read
type CachedModels = {
  models: EnrichedModel[];
  timestamp: number;
};

type EnrichedModel = {
  id: string;
  gatewayId: string;
  name: string;
  description: string;
  provider: string;
  contextWindow?: number;
  pricing: {
    input: number;
    output: number;
    cachedInput?: number | null;
    cachedOutput?: number | null;
  };
  capabilities: {
    vision: boolean;
    toolCalling: boolean;
    reasoning: boolean;
    imageGeneration: boolean;
  };
  config: {
    maxSteps: number;
    temperature?: number;
    idealFor: string[];
  };
  disabled?: boolean;
  tags?: string[];
  warning?: string;
};

let cache: CachedModels | null = null;
// In-flight deduplication: concurrent cache-miss requests share one gateway call
let inflight: Promise<EnrichedModel[]> | null = null;
const CACHE_DURATION = 3_600_000; // 1 hour

// Live reachability cache for the KRAIN local-inference endpoint. Short TTL so the
// model picker recovers automatically once the GB10 node comes back up (model-lockout
// shape, not a permanent disable) without hammering the endpoint on every request.
let krainHealth: { healthy: boolean; timestamp: number } | null = null;
const KRAIN_HEALTH_CACHE_DURATION = 30_000; // 30s
const KRAIN_HEALTH_TIMEOUT = 3000; // 3s

/**
 * Live "is it actually up" check for KRAIN_BASE_URL, replacing the old static
 * env-var-only check. Hits the OpenAI-compatible /models endpoint with a short
 * timeout; failures (network error, timeout, non-2xx) mark the model unhealthy.
 * Exported so request-time dispatch (chat route) can gate krain-gemma before
 * streaming starts, not just the model picker.
 */
export async function checkKrainHealth(): Promise<boolean> {
  const baseUrl = process.env.KRAIN_BASE_URL;
  if (!baseUrl) {
    return false;
  }

  const now = Date.now();
  if (
    krainHealth &&
    now - krainHealth.timestamp < KRAIN_HEALTH_CACHE_DURATION
  ) {
    return krainHealth.healthy;
  }

  let healthy: boolean;
  try {
    const response = await fetch(`${baseUrl}/models`, {
      headers: process.env.KRAIN_API_KEY
        ? { Authorization: `Bearer ${process.env.KRAIN_API_KEY}` }
        : {},
      signal: AbortSignal.timeout(KRAIN_HEALTH_TIMEOUT),
    });
    healthy = response.ok;
  } catch {
    healthy = false;
  }

  krainHealth = { healthy, timestamp: now };
  return healthy;
}

/**
 * Infer capabilities from model ID
 */
function inferCapabilities(modelId: string): EnrichedModel["capabilities"] {
  return {
    vision:
      modelId.includes("gpt-4") ||
      modelId.includes("gemini") ||
      (modelId.includes("claude") && !modelId.includes("3-haiku")),
    toolCalling: true, // Most modern models support tools
    reasoning:
      modelId.includes("sonnet-4") ||
      modelId.includes("sonnet-3.7") ||
      modelId.includes("gpt-5") ||
      modelId.includes("gemini-2") ||
      modelId.includes("deepseek") ||
      modelId.includes("reasoning"),
    imageGeneration:
      modelId.includes("image") || modelId.includes("flash-image"),
  };
}

/**
 * Infer configuration from model ID
 */
function inferConfig(modelId: string): EnrichedModel["config"] {
  // Haiku/Fast models
  if (
    modelId.includes("haiku") ||
    modelId.includes("fast") ||
    modelId.includes("nano") ||
    modelId.includes("lite")
  ) {
    return {
      maxSteps: 5,
      temperature: 0.6,
      idealFor: ["fast responses", "efficient processing", "high throughput"],
    };
  }

  // Reasoning/Sonnet models
  if (
    modelId.includes("sonnet") ||
    modelId.includes("reasoning") ||
    modelId.includes("gpt-5")
  ) {
    return {
      maxSteps: 8,
      temperature: 0.7,
      idealFor: ["complex reasoning", "analysis", "advanced tasks"],
    };
  }

  // Pro/Advanced models
  if (modelId.includes("pro") || modelId.includes("gpt-4")) {
    return {
      maxSteps: 7,
      temperature: 0.7,
      idealFor: ["multimodal", "advanced tasks", "vision"],
    };
  }

  // Default
  return {
    maxSteps: 6,
    temperature: 0.7,
    idealFor: ["general purpose", "everyday tasks"],
  };
}

/**
 * Inject krain-gemma into the model list with a live-reachability-aware disabled state.
 * Evaluated at request time (health check itself cached for KRAIN_HEALTH_CACHE_DURATION)
 * so the model locks out within ~30s of the endpoint going down and unlocks automatically
 * once it responds again.
 */
async function injectKrainModel(
  models: EnrichedModel[]
): Promise<EnrichedModel[]> {
  const krainStatic = (modelsData.models as EnrichedModel[]).find(
    (m) => m.id === "krain-gemma"
  );
  if (!krainStatic) {
    return models;
  }

  const healthy = await checkKrainHealth();

  const krainEntry: EnrichedModel = {
    id: krainStatic.id,
    gatewayId: krainStatic.gatewayId,
    name: krainStatic.name,
    description: krainStatic.description,
    provider: krainStatic.provider,
    contextWindow: krainStatic.contextWindow,
    pricing: krainStatic.pricing,
    capabilities: krainStatic.capabilities,
    config: krainStatic.config,
    disabled: !healthy,
    tags: krainStatic.tags ?? [],
    warning: krainStatic.warning,
  };

  return [...models.filter((m) => m.id !== "krain-gemma"), krainEntry];
}

/**
 * Get available models with caching.
 * Enriched models are stored in the cache so the transform is never re-run on a hit.
 * Concurrent cache-miss requests share a single in-flight gateway call.
 */
export async function getAvailableModels(
  forceRefresh = false
): Promise<EnrichedModel[]> {
  const now = Date.now();

  // Fast path: return pre-enriched cache immediately
  if (!forceRefresh && cache && now - cache.timestamp < CACHE_DURATION) {
    return await injectKrainModel(cache.models);
  }

  // Deduplicate concurrent misses: reuse the existing promise if one is in flight
  if (!forceRefresh && inflight) {
    const models = await inflight;
    return await injectKrainModel(models);
  }

  const fetchModels = async (): Promise<EnrichedModel[]> => {
    try {
      console.log("🔄 Fetching models from AI Gateway...");
      const availableModels = await gateway.getAvailableModels();
      const raw = availableModels.models as unknown as AvailableModel[];
      const enriched = transformToEnrichedModels(raw);

      cache = { models: enriched, timestamp: Date.now() };
      console.log(`✅ Fetched ${raw.length} models from AI Gateway`);
      return enriched;
    } catch (error) {
      console.error("❌ Failed to fetch dynamic models:", error);

      if (cache) {
        console.warn("⚠️ Returning stale cached models");
        return cache.models;
      }

      console.warn("⚠️ Falling back to static models configuration");
      return modelsData.models as EnrichedModel[];
    } finally {
      inflight = null;
    }
  };

  inflight = fetchModels();
  const models = await inflight;
  return await injectKrainModel(models);
}

/**
 * Transform gateway models to enriched format with static metadata
 */
function transformToEnrichedModels(
  gatewayModels: AvailableModel[]
): EnrichedModel[] {
  return gatewayModels.map((model) => {
    // Find matching static model for custom metadata
    const staticModel = modelsData.models.find(
      (m) => m.gatewayId === model.id || m.id === model.id.replace("/", "-")
    );

    // Extract provider from gateway ID (e.g., "anthropic/claude-sonnet-4" -> "anthropic")
    const provider = model.id.split("/")[0];

    // Use static metadata if available, otherwise infer
    const capabilities = staticModel
      ? staticModel.capabilities
      : inferCapabilities(model.id);

    const config = staticModel ? staticModel.config : inferConfig(model.id);

    return {
      id: staticModel?.id || model.id.replace("/", "-"),
      gatewayId: model.id,
      name: model.name || staticModel?.name || model.id,
      description:
        model.description ||
        staticModel?.description ||
        `${model.name} model from ${provider}`,
      provider,
      contextWindow: staticModel?.contextWindow,
      pricing: {
        input: model.pricing?.input || staticModel?.pricing?.input || 0,
        output: model.pricing?.output || staticModel?.pricing?.output || 0,
        cachedInput:
          model.pricing?.cachedInputTokens ||
          staticModel?.pricing?.cachedInput ||
          null,
        cachedOutput: staticModel?.pricing?.cachedOutput || null,
      },
      capabilities,
      config,
      tags: staticModel?.tags,
      warning: staticModel?.warning,
    };
  });
}

/**
 * Clear the model cache (useful for admin actions or deployment)
 */
export function clearModelsCache() {
  cache = null;
  inflight = null;
  console.log("🗑️ Model cache cleared");
}

/**
 * Get cache status for debugging
 */
export function getCacheStatus() {
  if (!cache) {
    return { cached: false, age: 0, count: 0 };
  }

  const age = Date.now() - cache.timestamp;
  return {
    cached: true,
    age,
    count: cache.models.length,
    isStale: age > CACHE_DURATION,
  };
}
