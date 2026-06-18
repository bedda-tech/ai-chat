"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ModelCapabilities = {
  vision: boolean;
  toolCalling: boolean;
  reasoning: boolean;
  imageGeneration: boolean;
};

type ModelEntry = {
  id: string;
  provider: string;
  name: string;
  description: string;
  contextWindow: number;
  capabilities: ModelCapabilities;
  idealFor: string[];
  isFree: boolean;
};

const PROVIDER_COLORS: Record<string, string> = {
  anthropic: "bg-[#c96442] text-white",
  openai: "bg-[#10a37f] text-white",
  google: "bg-[#4285f4] text-white",
  xai: "bg-black text-white",
  deepseek: "bg-[#1a56db] text-white",
  mistral: "bg-[#f7931e] text-white",
  groq: "bg-[#f55036] text-white",
  cerebras: "bg-[#0ea5e9] text-white",
  moonshotai: "bg-[#6366f1] text-white",
  zai: "bg-[#e11d48] text-white",
};

const PROVIDER_NAMES: Record<string, string> = {
  anthropic: "Anthropic",
  openai: "OpenAI",
  google: "Google",
  xai: "xAI",
  deepseek: "DeepSeek",
  mistral: "Mistral",
  groq: "Groq",
  cerebras: "Cerebras",
  moonshotai: "Moonshot AI",
  zai: "ZAI",
};

function formatContext(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(0)}M`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(0)}K`;
  return String(tokens);
}

function ProviderInitial({ provider }: { provider: string }) {
  const color = PROVIDER_COLORS[provider] ?? "bg-muted text-muted-foreground";
  const initial = (PROVIDER_NAMES[provider] ?? provider).charAt(0).toUpperCase();
  return (
    <span
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${color}`}
    >
      {initial}
    </span>
  );
}

function ModelCard({ model }: { model: ModelEntry }) {
  const tierLabel = model.isFree ? "Free" : "Plus+";
  const tierClass = model.isFree
    ? "border-green-500 text-green-600 dark:text-green-400"
    : "border-primary text-primary";

  return (
    <div className="group flex flex-col rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <ProviderInitial provider={model.provider} />
          <div className="min-w-0">
            <p className="truncate font-semibold text-sm">{model.name}</p>
            <p className="text-muted-foreground text-xs">
              {PROVIDER_NAMES[model.provider] ?? model.provider}
            </p>
          </div>
        </div>
        <Badge className={`shrink-0 text-xs ${tierClass}`} variant="outline">
          {tierLabel}
        </Badge>
      </div>

      <p className="mb-3 line-clamp-2 text-muted-foreground text-xs leading-relaxed">
        {model.description}
      </p>

      <div className="mb-3 flex flex-wrap gap-1">
        {model.capabilities.vision && (
          <Badge className="text-xs" variant="secondary">Vision</Badge>
        )}
        {model.capabilities.reasoning && (
          <Badge className="text-xs" variant="secondary">Reasoning</Badge>
        )}
        {model.capabilities.toolCalling && (
          <Badge className="text-xs" variant="secondary">Tools</Badge>
        )}
        {model.capabilities.imageGeneration && (
          <Badge className="text-xs" variant="secondary">Image Gen</Badge>
        )}
      </div>

      {model.idealFor.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1">
          {model.idealFor.slice(0, 3).map((use) => (
            <span
              className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground text-xs"
              key={use}
            >
              {use}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between pt-2">
        <span className="text-muted-foreground text-xs">
          {formatContext(model.contextWindow)} ctx
        </span>
        <Button asChild className="h-7 px-3 text-xs" size="sm" variant="outline">
          <Link href={`/register?model=${model.id}`}>Try free →</Link>
        </Button>
      </div>
    </div>
  );
}

type Props = {
  models: ModelEntry[];
};

const ALL_PROVIDERS = "all";
const ALL_CAPS = "all";
const ALL_TIERS = "all";

export function ModelsExplorer({ models }: Props) {
  const [search, setSearch] = useState("");
  const [provider, setProvider] = useState(ALL_PROVIDERS);
  const [capability, setCapability] = useState(ALL_CAPS);
  const [tier, setTier] = useState(ALL_TIERS);

  const providers = useMemo(
    () => Array.from(new Set(models.map((m) => m.provider))).sort(),
    [models]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return models.filter((m) => {
      if (q && !m.name.toLowerCase().includes(q) && !m.description.toLowerCase().includes(q) && !m.provider.toLowerCase().includes(q)) {
        return false;
      }
      if (provider !== ALL_PROVIDERS && m.provider !== provider) return false;
      if (tier === "free" && !m.isFree) return false;
      if (tier === "paid" && m.isFree) return false;
      if (capability === "vision" && !m.capabilities.vision) return false;
      if (capability === "reasoning" && !m.capabilities.reasoning) return false;
      if (capability === "tools" && !m.capabilities.toolCalling) return false;
      if (capability === "image" && !m.capabilities.imageGeneration) return false;
      return true;
    });
  }, [models, search, provider, capability, tier]);

  return (
    <div className="container py-10">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <h1 className="mb-3 font-bold text-3xl md:text-5xl">
          36+ AI Models, One Subscription
        </h1>
        <p className="text-lg text-muted-foreground">
          Claude, GPT-5, Gemini, Grok, DeepSeek and more — all accessible from
          a single chat interface starting at $12/mo.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/register">Start free trial</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/pricing">See pricing</Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Input
          className="h-9 w-48"
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search models…"
          value={search}
        />

        <select
          className="h-9 rounded-md border bg-background px-3 text-sm"
          onChange={(e) => setProvider(e.target.value)}
          value={provider}
        >
          <option value={ALL_PROVIDERS}>All providers</option>
          {providers.map((p) => (
            <option key={p} value={p}>
              {PROVIDER_NAMES[p] ?? p}
            </option>
          ))}
        </select>

        <select
          className="h-9 rounded-md border bg-background px-3 text-sm"
          onChange={(e) => setTier(e.target.value)}
          value={tier}
        >
          <option value={ALL_TIERS}>All tiers</option>
          <option value="free">Free tier</option>
          <option value="paid">Plus+ only</option>
        </select>

        <select
          className="h-9 rounded-md border bg-background px-3 text-sm"
          onChange={(e) => setCapability(e.target.value)}
          value={capability}
        >
          <option value={ALL_CAPS}>All capabilities</option>
          <option value="vision">Vision</option>
          <option value="reasoning">Reasoning</option>
          <option value="tools">Tool calling</option>
          <option value="image">Image generation</option>
        </select>

        {(search || provider !== ALL_PROVIDERS || tier !== ALL_TIERS || capability !== ALL_CAPS) && (
          <button
            className="text-muted-foreground text-sm underline underline-offset-2 hover:text-foreground"
            onClick={() => {
              setSearch("");
              setProvider(ALL_PROVIDERS);
              setTier(ALL_TIERS);
              setCapability(ALL_CAPS);
            }}
          >
            Clear
          </button>
        )}

        <span className="ml-auto text-muted-foreground text-sm">
          {filtered.length} model{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          No models match your filters.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((model) => (
            <ModelCard key={model.id} model={model} />
          ))}
        </div>
      )}

      {/* Bottom CTA */}
      <div className="mx-auto mt-16 max-w-xl rounded-lg border bg-muted/30 p-8 text-center">
        <h2 className="mb-2 font-bold text-xl">
          All {models.length} models, one subscription
        </h2>
        <p className="mb-6 text-muted-foreground text-sm">
          Stop managing multiple AI subscriptions. Bedda Plus at $12/mo gives
          you every model listed above — with a 7-day free trial, no credit card
          required.
        </p>
        <Button asChild>
          <Link href="/register">Start free — no card needed</Link>
        </Button>
      </div>
    </div>
  );
}
