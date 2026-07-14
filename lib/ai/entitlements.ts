import type { UserType } from "@/app/(auth)/auth";
import type { UserTierType } from "@/lib/usage/tracking";
import type { ChatModel } from "./models";

type Entitlements = {
  maxMessagesPerDay: number;
  availableChatModelIds: ChatModel["id"][];
};

export const entitlementsByUserType: Record<UserType, Entitlements> = {
  /*
   * For users without an account
   */
  guest: {
    maxMessagesPerDay: 20,
    availableChatModelIds: [
      // Legacy/Default Models
      "chat-model",
      "chat-model-reasoning",
      // Fast Google Models (cheap, good for demos)
      "google-gemini-2.5-flash",
      "google-gemini-2.5-flash-lite",
      "google-gemini-2.0-flash-lite",
      // OpenAI Nano (cheapest OpenAI model)
      "openai-gpt-5-nano",
      // Anthropic Haiku (fast, affordable Anthropic)
      "anthropic-claude-haiku-4.5",
      "anthropic-claude-3.5-haiku",
      // xAI Grok 4 Fast (affordable Grok)
      "xai-grok-4-fast-non-reasoning",
      // Mistral Small (affordable)
      "mistral-mistral-small-latest",
      // DeepSeek (cheap, capable)
      "deepseek-deepseek-v3",
      "deepseek-deepseek-r1",
      // Fast inference providers (Groq + Cerebras)
      "groq-llama-3.3-70b-versatile",
      "cerebras-llama3.3-70b",
    ],
  },

  /*
   * For users with an account
   */
  regular: {
    maxMessagesPerDay: 100,
    availableChatModelIds: [
      // xAI Grok Models
      "xai-grok-4",
      "xai-grok-3",
      "xai-grok-3-fast",
      "xai-grok-3-mini",
      "xai-grok-3-mini-fast",
      "xai-grok-2-1212",
      "xai-grok-2-vision-1212",
      "xai-grok-beta",
      "xai-grok-vision-beta",
      // Vercel Models
      "vercel-v0-1.0-md",
      // OpenAI Models
      "openai-gpt-5",
      "openai-gpt-5-mini",
      "openai-gpt-5-nano",
      "openai-gpt-5-codex",
      "openai-gpt-5-chat-latest",
      // Anthropic Models
      "anthropic-claude-opus-4-1",
      "anthropic-claude-opus-4-0",
      "anthropic-claude-sonnet-4-0",
      "anthropic-claude-3-7-sonnet-latest",
      "anthropic-claude-3-5-haiku-latest",
      // Mistral Models
      "mistral-pixtral-large-latest",
      "mistral-large-latest",
      "mistral-medium-latest",
      "mistral-medium-2505",
      "mistral-small-latest",
      "mistral-pixtral-12b-2409",
      // Google Generative AI Models
      "google-gemini-2.0-flash-exp",
      "google-gemini-1.5-flash",
      "google-gemini-1.5-pro",
      // Google Vertex Models
      "google-vertex-gemini-2.0-flash-exp",
      "google-vertex-gemini-1.5-flash",
      "google-vertex-gemini-1.5-pro",
      // DeepSeek Models
      "deepseek-chat",
      "deepseek-reasoner",
      // Cerebras Models
      "cerebras-llama3.1-8b",
      "cerebras-llama3.1-70b",
      "cerebras-llama3.3-70b",
      // Groq Models
      "groq-llama-4-scout-17b-16e-instruct",
      "groq-llama-3.3-70b-versatile",
      "groq-llama-3.1-8b-instant",
      "groq-mixtral-8x7b-32768",
      "groq-gemma2-9b-it",
      // Legacy/Default Models
      "chat-model",
      "chat-model-reasoning",
    ],
  },
};

/**
 * Anchor models from providers with free public APIs (Google AI Studio, Groq, DeepSeek).
 * These are the showcase models that demonstrate multi-model value to free/guest users.
 * Tagged with "free" in models-data.json and shown with a "Free" badge in the model selector.
 * Rate limits are governed by Bedda's own free-tier caps (50 msg/day), which are well
 * within each provider's free quota.
 */
export const FREE_PROVIDER_MODEL_IDS: readonly string[] = [
  "google-gemini-2.5-flash",      // Google AI Studio — 1,500 req/day free
  "groq-llama-3.3-70b-versatile", // Groq — very generous free tier
  "deepseek-deepseek-r1",         // DeepSeek — free API tier
];

/**
 * Models available to free registered users (DB tier: "free").
 * Matches the pricing page "Standard AI models" description:
 * Haiku, Flash, GPT-5 Nano, DeepSeek + fast inference providers.
 *
 * DB tier "pro" / "premium" / "enterprise" (Plus/Pro/Max plans) unlock ALL models.
 */
export const FREE_TIER_MODEL_IDS: readonly string[] = [
  // Legacy/Default Models
  "chat-model",
  "chat-model-reasoning",
  // xAI Grok (fast non-reasoning variant, affordable)
  "xai-grok-4-fast-non-reasoning",
  // Anthropic Haiku (cheapest Anthropic tier)
  "anthropic-claude-3-haiku",
  "anthropic-claude-3.5-haiku",
  "anthropic-claude-haiku-4.5",
  "anthropic-claude-3-5-haiku-latest",
  // OpenAI mini / nano models
  "openai-gpt-5-nano",
  "openai-gpt-5-mini",
  "openai-gpt-4o-mini",
  "openai-gpt-4.1-mini",
  // Google Flash / Flash Lite
  "google-gemini-2.0-flash",
  "google-gemini-2.0-flash-lite",
  "google-gemini-2.5-flash",
  "google-gemini-2.5-flash-lite",
  // DeepSeek (cheap)
  "deepseek-deepseek-v3",
  "deepseek-deepseek-v3.1",
  "deepseek-deepseek-r1",
  // Groq (fast inference, very cheap)
  "groq-llama-3.3-70b-versatile",
  // Cerebras (fast inference, very cheap)
  "cerebras-llama3.3-70b",
  // Mistral Small (affordable)
  "mistral-mistral-small-latest",
  // Moonshot / ZAI
  "zai-glm-4.6",
  "moonshotai-kimi-k2-turbo",
];

/**
 * Returns true if the given model is accessible for the user's DB tier.
 * - Paid tiers (pro/premium/enterprise = Plus/Pro/Max) get all models.
 * - Free tier users are limited to FREE_TIER_MODEL_IDS.
 * - Guest users are checked via entitlementsByUserType separately (in the UI),
 *   but this function uses the same free-tier list as a safe fallback.
 */
export function isModelAllowedForTier(
  modelId: string,
  tier: UserTierType
): boolean {
  // Paid subscribers (Plus / Pro / Max) get all models
  if (tier === "pro" || tier === "premium" || tier === "enterprise") {
    return true;
  }
  // Free tier: only standard models
  return FREE_TIER_MODEL_IDS.includes(modelId);
}
