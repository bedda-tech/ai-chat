import { ArrowRight, Check, Zap, Eye, Wrench, Brain, Image } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import modelsData from "@/lib/ai/models-data.json" with { type: "json" };
import { FREE_TIER_MODEL_IDS } from "@/lib/ai/entitlements";

type Model = (typeof modelsData.models)[number];

const PROVIDER_LABELS: Record<string, string> = {
  anthropic: "Anthropic",
  openai: "OpenAI",
  google: "Google",
  xai: "xAI",
  deepseek: "DeepSeek",
  mistral: "Mistral AI",
  groq: "Groq",
  cerebras: "Cerebras",
  moonshotai: "Moonshot AI",
  zai: "ZAI",
};

const PROVIDER_COLORS: Record<string, string> = {
  anthropic: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  openai: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  google: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  xai: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  deepseek: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  mistral: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  groq: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  cerebras: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  moonshotai: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
  zai: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
};

function formatContextWindow(tokens: number): string {
  if (tokens >= 1_000_000) return `${tokens / 1_000_000}M tokens`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(0)}K tokens`;
  return `${tokens} tokens`;
}

function getTierInfo(modelId: string): { label: string; plan: string; price: string } {
  if (FREE_TIER_MODEL_IDS.includes(modelId)) {
    return { label: "Free", plan: "Available on all plans", price: "Free forever" };
  }
  return { label: "Plus+", plan: "Plus, Pro, or Max plan", price: "from $12/mo" };
}

function getModelFaq(model: Model, isFree: boolean): { q: string; a: string }[] {
  const providerLabel = PROVIDER_LABELS[model.provider] ?? model.provider;
  return [
    {
      q: `Is ${model.name} available on bedda.ai?`,
      a: `Yes. ${model.name} is fully available on bedda.ai${isFree ? " on the free plan" : " on Plus, Pro, and Max plans"}. You can start chatting with it right now${isFree ? " — no credit card required" : " with a 7-day free trial"}.`,
    },
    {
      q: `How much does it cost to use ${model.name}?`,
      a: isFree
        ? `${model.name} is included in bedda.ai's free tier — you can use it with 500 messages per month at no cost. Upgrade to Plus ($12/mo) to remove limits and unlock all 36+ models.`
        : `${model.name} is included in bedda.ai's Plus plan at $12/month. That's a flat rate — no per-message or per-token billing. Compare that to using ${providerLabel}'s API directly, where you'd pay $${model.pricing.input.toFixed(2)}/1M input tokens.`,
    },
    {
      q: `What's ${model.name}'s context window?`,
      a: `${model.name} supports a ${formatContextWindow(model.contextWindow)} context window${model.contextWindow >= 200000 ? ", which means it can process entire codebases, lengthy documents, and long conversation histories in a single prompt" : model.contextWindow >= 32000 ? ", suitable for most documents and long coding tasks" : ", optimized for fast responses on shorter tasks"}.`,
    },
    {
      q: `Can I switch from ${model.name} to another model mid-conversation?`,
      a: `Yes. On bedda.ai you can switch between all 36+ models at any point in a conversation. Start with ${model.name}, then switch to GPT-5, Claude, or Gemini — all in the same interface with no app switching.`,
    },
  ];
}

type Params = Promise<{ id: string }>;

export async function generateStaticParams() {
  return modelsData.models.map((m) => ({ id: m.id }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const model = modelsData.models.find((m) => m.id === id);
  if (!model) return {};

  const isFree = FREE_TIER_MODEL_IDS.includes(id);
  const providerLabel = PROVIDER_LABELS[model.provider] ?? model.provider;
  const tierStr = isFree ? "Free" : "from $12/mo";

  return {
    title: `${model.name} — Access ${providerLabel}'s ${model.name} on bedda.ai`,
    description: `Use ${model.name} on bedda.ai — ${model.description}. ${isFree ? "Available free." : "Included in Plus ($12/mo) with 36+ other AI models."} 7-day free trial.`,
    openGraph: {
      title: `${model.name} on bedda.ai — ${tierStr}`,
      description: `${model.description}. Context: ${formatContextWindow(model.contextWindow)}. ${isFree ? "Free on bedda.ai." : "Included in Plus ($12/mo) alongside Claude, GPT-5, Gemini, and 33 more models."}`,
    },
    alternates: {
      canonical: `https://bedda.ai/models/${id}`,
    },
  };
}

export default async function ModelPage({ params }: { params: Params }) {
  const { id } = await params;
  const model = modelsData.models.find((m) => m.id === id);
  if (!model) notFound();

  const isFree = FREE_TIER_MODEL_IDS.includes(id);
  const tierInfo = getTierInfo(id);
  const providerLabel = PROVIDER_LABELS[model.provider] ?? model.provider;
  const providerColor = PROVIDER_COLORS[model.provider] ?? "bg-gray-100 text-gray-800";
  const faq = getModelFaq(model, isFree);

  const relatedModels = modelsData.models
    .filter((m) => m.provider === model.provider && m.id !== id)
    .slice(0, 4);

  const capabilities = [
    { key: "vision", label: "Vision", icon: Eye, enabled: model.capabilities.vision },
    { key: "toolCalling", label: "Tool use", icon: Wrench, enabled: model.capabilities.toolCalling },
    { key: "reasoning", label: "Reasoning", icon: Brain, enabled: model.capabilities.reasoning },
    { key: "imageGeneration", label: "Image gen", icon: Image, enabled: model.capabilities.imageGeneration },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-muted/30 to-background px-4 py-16 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 flex items-center justify-center gap-2">
            <span className={`rounded-full px-3 py-1 text-sm font-medium ${providerColor}`}>
              {providerLabel}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                isFree
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                  : "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300"
              }`}
            >
              {tierInfo.label}
            </span>
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">{model.name}</h1>
          <p className="mb-8 text-xl text-muted-foreground">{model.description}</p>

          {/* Quick stats */}
          <div className="mb-8 flex flex-wrap items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 rounded-lg border px-3 py-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="font-medium">{formatContextWindow(model.contextWindow)} context</span>
            </div>
            {capabilities
              .filter((c) => c.enabled)
              .map((c) => (
                <div key={c.key} className="flex items-center gap-1.5 rounded-lg border px-3 py-2">
                  <c.icon className="h-4 w-4 text-primary" />
                  <span className="font-medium">{c.label}</span>
                </div>
              ))}
          </div>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Try {model.name} free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/models">
              <Button size="lg" variant="outline">
                Browse all 36+ models
              </Button>
            </Link>
          </div>
          {!isFree && (
            <p className="mt-3 text-sm text-muted-foreground">7-day free trial · No credit card required</p>
          )}
          {isFree && (
            <p className="mt-3 text-sm text-muted-foreground">Free forever · 500 messages/month</p>
          )}
        </div>
      </section>

      {/* Ideal for */}
      {model.config.idealFor && model.config.idealFor.length > 0 && (
        <section className="px-4 py-14">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-2xl font-bold">What {model.name} is best at</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {model.config.idealFor.map((use) => (
                <div
                  key={use}
                  className="flex items-start gap-3 rounded-xl border bg-card p-4"
                >
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                  <span className="font-medium capitalize">{use}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing callout */}
      <section className="border-y bg-muted/30 px-4 py-14">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-2xl font-bold">
            {isFree ? `${model.name} is free on bedda.ai` : `Access ${model.name} for $12/mo`}
          </h2>
          <p className="mb-6 text-muted-foreground">
            {isFree
              ? `Use ${model.name} with 500 messages/month at no cost. Upgrade to Plus to remove limits and unlock all 36+ models including Claude Opus, GPT-5, Gemini 2.5 Pro, Grok 4, and more.`
              : `${model.name} is included in bedda.ai's Plus plan — $12/month flat. No per-token billing. That gets you ${model.name} plus 35 other models including GPT-5, Claude Opus, Gemini 2.5 Pro, and Grok 4.`}
          </p>
          <div className="mx-auto mb-8 max-w-sm rounded-xl border bg-card p-6 text-left">
            <div className="mb-4 flex items-baseline justify-between">
              <span className="text-3xl font-bold">{isFree ? "$0" : "$12"}</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                {isFree ? "500 messages/month free" : "Unlimited messages"}
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                {model.name} {isFree ? "included" : "access"}
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                {isFree ? "Switch to 36+ models when needed" : "36+ models included (no extra charge)"}
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                Web search, code execution, image generation
              </li>
              {!isFree && (
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  7-day free trial
                </li>
              )}
            </ul>
          </div>
          <Link href="/register">
            <Button size="lg" className="gap-2">
              {isFree ? "Start for free" : "Start 7-day free trial"} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Technical specs */}
      <section className="px-4 py-14">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center text-2xl font-bold">{model.name} specifications</h2>
          <div className="overflow-hidden rounded-xl border">
            <table className="w-full text-sm">
              <tbody className="divide-y">
                <tr className="bg-muted/30">
                  <td className="px-6 py-4 font-medium">Provider</td>
                  <td className="px-6 py-4 text-muted-foreground">{providerLabel}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium">Context window</td>
                  <td className="px-6 py-4 text-muted-foreground">{formatContextWindow(model.contextWindow)}</td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="px-6 py-4 font-medium">Vision / image input</td>
                  <td className="px-6 py-4 text-muted-foreground">{model.capabilities.vision ? "Yes" : "No"}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium">Tool / function calling</td>
                  <td className="px-6 py-4 text-muted-foreground">{model.capabilities.toolCalling ? "Yes" : "No"}</td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="px-6 py-4 font-medium">Extended reasoning</td>
                  <td className="px-6 py-4 text-muted-foreground">{model.capabilities.reasoning ? "Yes" : "No"}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium">Image generation</td>
                  <td className="px-6 py-4 text-muted-foreground">{model.capabilities.imageGeneration ? "Yes" : "No"}</td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="px-6 py-4 font-medium">API pricing (input)</td>
                  <td className="px-6 py-4 text-muted-foreground">${model.pricing.input.toFixed(2)}/1M tokens</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium">API pricing (output)</td>
                  <td className="px-6 py-4 text-muted-foreground">${model.pricing.output.toFixed(2)}/1M tokens</td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="px-6 py-4 font-medium">Bedda.ai access</td>
                  <td className="px-6 py-4 text-muted-foreground">{tierInfo.plan}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Related models */}
      {relatedModels.length > 0 && (
        <section className="border-t px-4 py-14">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-2xl font-bold">Other {providerLabel} models on bedda.ai</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {relatedModels.map((m) => {
                const mIsFree = FREE_TIER_MODEL_IDS.includes(m.id);
                return (
                  <Link
                    key={m.id}
                    href={`/models/${m.id}`}
                    className="group rounded-xl border bg-card p-5 transition-colors hover:border-primary/50 hover:bg-muted/30"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-semibold group-hover:text-primary">{m.name}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          mIsFree
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
                        }`}
                      >
                        {mIsFree ? "Free" : "Plus+"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{m.description}</p>
                  </Link>
                );
              })}
            </div>
            <div className="mt-6 text-center">
              <Link href="/models">
                <Button variant="outline">View all 36+ models</Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="border-t bg-muted/30 px-4 py-14">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-8 text-center text-2xl font-bold">Frequently asked questions</h2>
          <div className="space-y-4">
            {faq.map((item) => (
              <div key={item.q} className="rounded-xl border bg-card p-6">
                <h3 className="mb-2 font-semibold">{item.q}</h3>
                <p className="text-sm text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-4 py-16 text-center">
        <div className="mx-auto max-w-xl">
          <h2 className="mb-4 text-2xl font-bold">
            Ready to try {model.name}?
          </h2>
          <p className="mb-8 text-muted-foreground">
            {isFree
              ? `Start chatting with ${model.name} right now — free forever, no credit card needed.`
              : `Get ${model.name} and 35 other AI models for $12/month. Start with a 7-day free trial.`}
          </p>
          <Link href="/register">
            <Button size="lg" className="gap-2">
              {isFree ? "Start for free" : "Start free trial"} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
