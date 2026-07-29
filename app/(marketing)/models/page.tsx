import type { Metadata } from "next";
import { ModelsExplorer } from "@/components/models-explorer";
import { FREE_TIER_MODEL_IDS } from "@/lib/ai/entitlements";
import modelsData from "@/lib/ai/models-data.json" with { type: "json" };

export const metadata: Metadata = {
  title: "AI Models — bedda.ai | 36+ Models, One Subscription",
  description:
    "Explore 36+ AI models on bedda.ai — Claude Opus, GPT-5, Gemini 2.5 Pro, Grok 4, DeepSeek R1, Mistral and more. One $12/mo subscription unlocks them all. 7-day free trial.",
  openGraph: {
    title: "36+ AI Models, One Bedda Subscription",
    description:
      "Claude, GPT-5, Gemini, Grok, DeepSeek — all in one place for $12/mo. Compare capabilities, filter by provider, and try any model free.",
  },
  alternates: {
    canonical: "https://bedda.ai/models",
  },
};

export default function ModelsPage() {
  const models = modelsData.models.map((m) => ({
    id: m.id,
    provider: m.provider,
    name: m.name,
    description: m.description,
    contextWindow: m.contextWindow,
    capabilities: m.capabilities,
    idealFor: m.config.idealFor,
    isFree: FREE_TIER_MODEL_IDS.includes(m.id),
  }));

  return <ModelsExplorer models={models} />;
}
