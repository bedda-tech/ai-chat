import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "API Documentation — OpenAI-Compatible API | bedda.ai",
  description:
    "Access 36+ AI models (GPT-5, Claude 4, Gemini 2.5, Grok 4) through a single OpenAI-compatible REST API. Drop-in replacement for OpenAI with flat-rate pricing from $12/mo.",
  keywords: [
    "openai api alternative",
    "cheap gpt api",
    "openai compatible api",
    "claude api alternative",
    "multi-model api",
    "bedda api",
    "ai api cheap",
  ],
  openGraph: {
    title: "OpenAI-Compatible API — 36+ Models, One Key | bedda.ai",
    description:
      "Drop-in OpenAI API replacement. Access GPT-5, Claude 4, Gemini 2.5, Grok 4, and 32 more models with a single API key. Flat-rate $12/mo.",
    url: "https://bedda.ai/developers",
  },
  alternates: { canonical: "https://bedda.ai/developers" },
};

const CURL_EXAMPLE = `curl https://www.bedda.tech/api/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "model": "anthropic-claude-sonnet-4.5",
    "messages": [
      {"role": "user", "content": "Explain quantum computing in one paragraph."}
    ]
  }'`;

const PYTHON_EXAMPLE = `from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://www.bedda.tech/api/v1",
)

response = client.chat.completions.create(
    model="anthropic-claude-sonnet-4.5",
    messages=[
        {"role": "user", "content": "Explain quantum computing in one paragraph."}
    ],
)

print(response.choices[0].message.content)`;

const NODE_EXAMPLE = `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.BEDDA_API_KEY,
  baseURL: "https://www.bedda.tech/api/v1",
});

const response = await client.chat.completions.create({
  model: "openai-gpt-5",
  messages: [
    { role: "user", content: "Explain quantum computing in one paragraph." },
  ],
  stream: true,
});

for await (const chunk of response) {
  process.stdout.write(chunk.choices[0]?.delta?.content ?? "");
}`;

const STREAM_EXAMPLE = `curl https://www.bedda.tech/api/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "google-gemini-2.5-pro",
    "messages": [{"role": "user", "content": "Write a haiku about AI."}],
    "stream": true
  }'`;

const MODELS: {
  id: string;
  label: string;
  provider: string;
  tier: "free" | "plus" | "pro";
  context: string;
}[] = [
  {
    id: "openai-gpt-5",
    label: "GPT-5",
    provider: "OpenAI",
    tier: "plus",
    context: "128K",
  },
  {
    id: "openai-gpt-5-mini",
    label: "GPT-5 mini",
    provider: "OpenAI",
    tier: "plus",
    context: "128K",
  },
  {
    id: "openai-gpt-4o",
    label: "GPT-4o",
    provider: "OpenAI",
    tier: "plus",
    context: "128K",
  },
  {
    id: "openai-gpt-4o-mini",
    label: "GPT-4o mini",
    provider: "OpenAI",
    tier: "free",
    context: "128K",
  },
  {
    id: "anthropic-claude-opus-4-8",
    label: "Claude Opus 4.8",
    provider: "Anthropic",
    tier: "pro",
    context: "200K",
  },
  {
    id: "anthropic-claude-sonnet-4-6",
    label: "Claude Sonnet 4.6",
    provider: "Anthropic",
    tier: "plus",
    context: "200K",
  },
  {
    id: "anthropic-claude-sonnet-4.5",
    label: "Claude Sonnet 4.5",
    provider: "Anthropic",
    tier: "plus",
    context: "200K",
  },
  {
    id: "anthropic-claude-haiku-4.5",
    label: "Claude Haiku 4.5",
    provider: "Anthropic",
    tier: "free",
    context: "200K",
  },
  {
    id: "google-gemini-2.5-pro",
    label: "Gemini 2.5 Pro",
    provider: "Google",
    tier: "plus",
    context: "1M",
  },
  {
    id: "google-gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    provider: "Google",
    tier: "free",
    context: "1M",
  },
  {
    id: "google-gemini-2.0-flash",
    label: "Gemini 2.0 Flash",
    provider: "Google",
    tier: "free",
    context: "1M",
  },
  {
    id: "xai-grok-4",
    label: "Grok 4",
    provider: "xAI",
    tier: "plus",
    context: "128K",
  },
  {
    id: "xai-grok-4-fast-non-reasoning",
    label: "Grok 4 Fast",
    provider: "xAI",
    tier: "free",
    context: "128K",
  },
  {
    id: "deepseek-deepseek-r1",
    label: "DeepSeek R1",
    provider: "DeepSeek",
    tier: "free",
    context: "64K",
  },
  {
    id: "deepseek-deepseek-v3.1",
    label: "DeepSeek V3.1",
    provider: "DeepSeek",
    tier: "free",
    context: "64K",
  },
  {
    id: "mistral-mistral-large-latest",
    label: "Mistral Large",
    provider: "Mistral AI",
    tier: "plus",
    context: "128K",
  },
  {
    id: "mistral-mistral-small-latest",
    label: "Mistral Small",
    provider: "Mistral AI",
    tier: "free",
    context: "128K",
  },
  {
    id: "moonshotai-kimi-k2-turbo",
    label: "Kimi K2 Turbo",
    provider: "Moonshot AI",
    tier: "plus",
    context: "128K",
  },
  {
    id: "groq-llama-3.3-70b-versatile",
    label: "Llama 3.3 70B (Groq)",
    provider: "Groq",
    tier: "free",
    context: "128K",
  },
  {
    id: "cerebras-llama3.3-70b",
    label: "Llama 3.3 70B (Cerebras)",
    provider: "Cerebras",
    tier: "free",
    context: "8K",
  },
];

const TIER_COLORS: Record<string, string> = {
  free: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  plus: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  pro: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
};

export default function DevelopersPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-muted/50 to-background py-16 text-center">
        <div className="container max-w-4xl">
          <Badge className="mb-4" variant="secondary">
            OpenAI-Compatible API
          </Badge>
          <h1 className="mb-4 font-bold text-4xl tracking-tight md:text-5xl">
            Access 36+ AI Models with One API Key
          </h1>
          <p className="mb-8 text-muted-foreground text-xl">
            Drop-in replacement for the OpenAI API. Same{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-sm">
              /v1/chat/completions
            </code>{" "}
            endpoint. Works with any OpenAI SDK.
            <br className="hidden md:block" />
            Flat-rate pricing from{" "}
            <span className="font-semibold text-foreground">$12/mo</span>{" "}
            instead of paying per token.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/register">Get API Key — Free Trial</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
          <p className="mt-3 text-muted-foreground text-sm">
            7-day free trial. API access requires Plus plan ($12/mo).
          </p>
        </div>
      </section>

      <div className="container max-w-5xl py-12">
        {/* Quick comparison */}
        <section className="mb-16">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                metric: "Models available",
                bedda: "36+",
                openai: "~10",
                win: true,
              },
              {
                metric: "Monthly cost",
                bedda: "$12 flat",
                openai: "Pay per token",
                win: true,
              },
              {
                metric: "SDK compatibility",
                bedda: "OpenAI SDK",
                openai: "OpenAI SDK",
                win: false,
              },
            ].map((row) => (
              <div
                key={row.metric}
                className="rounded-lg border bg-card p-4 text-center"
              >
                <p className="mb-2 text-muted-foreground text-sm">
                  {row.metric}
                </p>
                <div className="flex items-center justify-center gap-4">
                  <div>
                    <p
                      className={`font-bold text-lg ${row.win ? "text-green-600 dark:text-green-400" : "text-foreground"}`}
                    >
                      {row.bedda}
                    </p>
                    <p className="text-muted-foreground text-xs">bedda.ai</p>
                  </div>
                  <span className="text-muted-foreground">vs</span>
                  <div>
                    <p className="font-bold text-lg text-muted-foreground">
                      {row.openai}
                    </p>
                    <p className="text-muted-foreground text-xs">OpenAI API</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Start */}
        <section className="mb-16">
          <h2 className="mb-6 font-bold text-2xl">Quick Start</h2>
          <p className="mb-6 text-muted-foreground">
            The bedda API is a drop-in replacement for the OpenAI API. Change
            the{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-sm">
              base_url
            </code>{" "}
            and swap your API key — everything else stays the same.
          </p>

          {/* Tabs — static, no JS */}
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 font-semibold text-muted-foreground text-sm uppercase tracking-wide">
                cURL
              </h3>
              <div className="rounded-lg bg-zinc-900 p-4 dark:bg-zinc-950">
                <pre className="overflow-x-auto text-sm text-zinc-100">
                  <code>{CURL_EXAMPLE}</code>
                </pre>
              </div>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-muted-foreground text-sm uppercase tracking-wide">
                Python (openai SDK)
              </h3>
              <div className="rounded-lg bg-zinc-900 p-4 dark:bg-zinc-950">
                <pre className="overflow-x-auto text-sm text-zinc-100">
                  <code>{PYTHON_EXAMPLE}</code>
                </pre>
              </div>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-muted-foreground text-sm uppercase tracking-wide">
                Node.js / TypeScript (openai SDK)
              </h3>
              <div className="rounded-lg bg-zinc-900 p-4 dark:bg-zinc-950">
                <pre className="overflow-x-auto text-sm text-zinc-100">
                  <code>{NODE_EXAMPLE}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Authentication */}
        <section className="mb-16">
          <h2 className="mb-4 font-bold text-2xl">Authentication</h2>
          <p className="mb-4 text-muted-foreground">
            All requests must include an{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-sm">
              Authorization
            </code>{" "}
            header with your API key:
          </p>
          <div className="rounded-lg bg-zinc-900 p-4 dark:bg-zinc-950">
            <pre className="text-sm text-zinc-100">
              <code>Authorization: Bearer bda_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</code>
            </pre>
          </div>
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
            <p className="text-amber-800 text-sm dark:text-amber-200">
              <strong>API keys require a Plus plan or higher.</strong> Generate
              your key at{" "}
              <Link
                className="underline hover:no-underline"
                href="/settings"
              >
                Settings → API Keys
              </Link>
              . Free trial users can create keys during their 7-day trial.
            </p>
          </div>
        </section>

        {/* Endpoint */}
        <section className="mb-16">
          <h2 className="mb-4 font-bold text-2xl">Endpoint</h2>
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Method</th>
                  <th className="px-4 py-3 text-left font-medium">URL</th>
                  <th className="px-4 py-3 text-left font-medium">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="px-4 py-3">
                    <span className="rounded bg-green-100 px-2 py-0.5 font-mono font-semibold text-green-800 text-xs dark:bg-green-900/30 dark:text-green-300">
                      POST
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    https://www.bedda.tech/api/v1/chat/completions
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Create a chat completion (streaming supported)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-muted-foreground text-sm">
            <strong>Base URL:</strong>{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              https://www.bedda.tech/api/v1
            </code>
          </p>
        </section>

        {/* Parameters */}
        <section className="mb-16">
          <h2 className="mb-4 font-bold text-2xl">Request Parameters</h2>
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">
                    Parameter
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Type</th>
                  <th className="px-4 py-3 text-left font-medium">Required</th>
                  <th className="px-4 py-3 text-left font-medium">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  {
                    param: "model",
                    type: "string",
                    required: "Yes",
                    desc: "Model ID (see table below) or OpenAI alias",
                  },
                  {
                    param: "messages",
                    type: "array",
                    required: "Yes",
                    desc: 'Array of {role: "system"|"user"|"assistant", content: string}',
                  },
                  {
                    param: "stream",
                    type: "boolean",
                    required: "No",
                    desc: "Enable SSE streaming (default: false)",
                  },
                  {
                    param: "temperature",
                    type: "number",
                    required: "No",
                    desc: "Sampling temperature 0–1 (default: 0.7)",
                  },
                  {
                    param: "max_tokens",
                    type: "integer",
                    required: "No",
                    desc: "Maximum tokens to generate",
                  },
                ].map((row) => (
                  <tr key={row.param}>
                    <td className="px-4 py-3 font-mono font-medium text-xs">
                      {row.param}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {row.type}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          row.required === "Yes"
                            ? "text-red-600 dark:text-red-400"
                            : "text-muted-foreground"
                        }
                      >
                        {row.required}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {row.desc}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Streaming */}
        <section className="mb-16">
          <h2 className="mb-4 font-bold text-2xl">Streaming</h2>
          <p className="mb-4 text-muted-foreground">
            Set{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-sm">
              "stream": true
            </code>{" "}
            to receive Server-Sent Events (SSE) in OpenAI format. Works with
            any OpenAI-compatible streaming client.
          </p>
          <div className="rounded-lg bg-zinc-900 p-4 dark:bg-zinc-950">
            <pre className="overflow-x-auto text-sm text-zinc-100">
              <code>{STREAM_EXAMPLE}</code>
            </pre>
          </div>
        </section>

        {/* Models */}
        <section className="mb-16">
          <h2 className="mb-4 font-bold text-2xl">Available Models</h2>
          <p className="mb-6 text-muted-foreground">
            Use the model ID directly, or any OpenAI-compatible alias (
            <code className="rounded bg-muted px-1 py-0.5 text-sm">
              gpt-4o
            </code>
            ,{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-sm">
              claude-3-5-sonnet-20241022
            </code>
            , etc.) which maps to the equivalent bedda model.
          </p>
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Model ID</th>
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Provider</th>
                  <th className="px-4 py-3 text-left font-medium">Context</th>
                  <th className="px-4 py-3 text-left font-medium">
                    Min. Tier
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {MODELS.map((m) => (
                  <tr key={m.id} className="hover:bg-muted/30">
                    <td className="px-4 py-2.5 font-mono text-xs">{m.id}</td>
                    <td className="px-4 py-2.5 font-medium text-sm">
                      {m.label}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground text-xs">
                      {m.provider}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground text-xs">
                      {m.context}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium capitalize ${TIER_COLORS[m.tier]}`}
                      >
                        {m.tier === "free" ? "Free+" : m.tier === "plus" ? "Plus+" : "Pro+"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-muted-foreground text-sm">
            Full model list available at{" "}
            <Link className="underline hover:no-underline" href="/models">
              bedda.ai/models
            </Link>
            . 36 models total. New models added regularly.
          </p>
        </section>

        {/* OpenAI Aliases */}
        <section className="mb-16">
          <h2 className="mb-4 font-bold text-2xl">OpenAI Aliases</h2>
          <p className="mb-4 text-muted-foreground">
            For zero-config migration, these OpenAI model names are
            automatically remapped:
          </p>
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">
                    OpenAI alias
                  </th>
                  <th className="px-4 py-3 text-left font-medium">
                    Routes to
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { alias: "gpt-4o", routes: "openai-gpt-4o" },
                  { alias: "gpt-4o-mini", routes: "openai-gpt-4o-mini" },
                  { alias: "gpt-4-turbo", routes: "openai-gpt-4-turbo" },
                  { alias: "gpt-3.5-turbo", routes: "openai-gpt-4o-mini" },
                  {
                    alias: "claude-3-5-sonnet-20241022",
                    routes: "anthropic-claude-sonnet-4.5",
                  },
                  {
                    alias: "claude-3-opus-20240229",
                    routes: "anthropic-claude-opus-4.5",
                  },
                  {
                    alias: "claude-3-5-haiku-20241022",
                    routes: "anthropic-claude-haiku-4.5",
                  },
                  {
                    alias: "gemini-1.5-pro",
                    routes: "google-gemini-2.5-pro-preview",
                  },
                  {
                    alias: "gemini-1.5-flash",
                    routes: "google-gemini-2.5-flash",
                  },
                  { alias: "grok-2", routes: "xai-grok-2-1212" },
                ].map((row) => (
                  <tr key={row.alias}>
                    <td className="px-4 py-2.5 font-mono text-xs">
                      {row.alias}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-muted-foreground text-xs">
                      {row.routes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Rate Limits */}
        <section className="mb-16">
          <h2 className="mb-4 font-bold text-2xl">Rate Limits</h2>
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Plan</th>
                  <th className="px-4 py-3 text-left font-medium">
                    Messages / day
                  </th>
                  <th className="px-4 py-3 text-left font-medium">
                    Messages / month
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  {
                    plan: "Free",
                    day: "50",
                    month: "500",
                    price: "$0",
                    note: "No API keys",
                  },
                  {
                    plan: "Plus",
                    day: "300",
                    month: "Unlimited",
                    price: "$12/mo",
                    note: "API access included",
                  },
                  {
                    plan: "Pro",
                    day: "1,000",
                    month: "Unlimited",
                    price: "$25/mo",
                    note: "Higher limits",
                  },
                  {
                    plan: "Max",
                    day: "Unlimited",
                    month: "Unlimited",
                    price: "$50/mo",
                    note: "No limits",
                  },
                ].map((row) => (
                  <tr key={row.plan}>
                    <td className="px-4 py-3 font-semibold">{row.plan}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {row.day}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {row.month}
                    </td>
                    <td className="px-4 py-3 font-medium">{row.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-muted-foreground text-sm">
            Rate limit headers are returned on each response. Exceeding limits
            returns a{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">429</code>{" "}
            status with retry information.
          </p>
        </section>

        {/* Error Codes */}
        <section className="mb-16">
          <h2 className="mb-4 font-bold text-2xl">Error Codes</h2>
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">HTTP</th>
                  <th className="px-4 py-3 text-left font-medium">Code</th>
                  <th className="px-4 py-3 text-left font-medium">Meaning</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  {
                    status: "400",
                    code: "invalid_request_error",
                    meaning: "Missing or malformed parameters",
                  },
                  {
                    status: "401",
                    code: "invalid_api_key",
                    meaning: "Missing, invalid, or revoked API key",
                  },
                  {
                    status: "403",
                    code: "model_not_available",
                    meaning: "Model requires a higher subscription tier",
                  },
                  {
                    status: "404",
                    code: "model_not_found",
                    meaning: "Unknown model ID",
                  },
                  {
                    status: "429",
                    code: "rate_limit_exceeded",
                    meaning: "Daily or monthly message limit reached",
                  },
                ].map((row) => (
                  <tr key={row.status}>
                    <td className="px-4 py-2.5">
                      <span className="rounded bg-red-100 px-2 py-0.5 font-mono text-red-800 text-xs dark:bg-red-900/30 dark:text-red-300">
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs">
                      {row.code}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground text-xs">
                      {row.meaning}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-muted-foreground text-sm">
            All errors return a JSON body:{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              {`{ "error": { "message": "...", "type": "...", "code": "..." } }`}
            </code>
          </p>
        </section>

        {/* FAQ */}
        <section className="mb-16">
          <h2 className="mb-6 font-bold text-2xl">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "Is this a true drop-in OpenAI replacement?",
                a: "Yes. Change base_url to https://www.bedda.tech/api/v1 and your API key. The request/response format is identical to OpenAI's chat completions API. Works with openai-python, openai-node, LangChain, LlamaIndex, and any other OpenAI-compatible client.",
              },
              {
                q: "How does flat-rate pricing work vs pay-per-token?",
                a: "With OpenAI, GPT-5 costs ~$15/M input tokens + $60/M output tokens — a typical developer usage of 1M tokens/month would cost $75+. With bedda Plus at $12/mo, you get 300 requests/day with no per-token billing. Heavy users save 80-90% vs OpenAI's API pricing.",
              },
              {
                q: "Can I use bedda models I can't access directly?",
                a: "Yes. Claude Opus 4.8, GPT-5, Gemini 2.5 Pro, and Grok 4 can all be accessed through the bedda API as long as your plan tier allows it. This is especially useful for models with waitlists or restricted API access.",
              },
              {
                q: "Does streaming work?",
                a: 'Yes. Set "stream": true in the request body to receive SSE chunks in OpenAI format. The openai SDK handles this automatically when you pass stream=True (Python) or stream: true (Node.js).',
              },
              {
                q: "Are API requests counted against my chat message limit?",
                a: "Yes, all requests (chat UI + API) share the same daily and monthly limits. Max plan ($50/mo) has unlimited requests.",
              },
              {
                q: "How do I generate an API key?",
                a: "Sign in → Settings → API Keys tab. You can create up to 5 keys, label them by project, and revoke them individually. API key creation requires Plus plan or higher.",
              },
            ].map((item) => (
              <div key={item.q} className="rounded-lg border p-5">
                <h3 className="mb-2 font-semibold">{item.q}</h3>
                <p className="text-muted-foreground text-sm">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl bg-primary px-8 py-12 text-center text-primary-foreground">
          <h2 className="mb-3 font-bold text-3xl">
            Ready to integrate? Start free.
          </h2>
          <p className="mb-6 text-primary-foreground/80 text-lg">
            7-day free trial. No credit card required.
            <br />
            API access, 36+ models, flat-rate $12/mo after trial.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              className="bg-white text-primary hover:bg-white/90"
              size="lg"
            >
              <Link href="/register">Get Your API Key</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              <Link href="/pricing">Compare Plans</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
