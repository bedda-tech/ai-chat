import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Zap, Search, Code2, Image, Database, GitCompare, Bot, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "bedda.ai — All AI Models, One Subscription",
  description:
    "Access Claude, GPT-5, Gemini, Grok, Mistral, DeepSeek and 30+ AI models with one subscription starting at $12/month. 7-day free trial, no credit card required.",
  openGraph: {
    title: "bedda.ai — One Subscription. Every AI Model.",
    description:
      "Stop paying $20+ for each AI separately. bedda.ai gives you Claude, GPT-5, Gemini, Grok and 30+ models for $12/month. Start free today.",
    url: "https://bedda.ai",
    images: [
      {
        url: "https://bedda.ai/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "bedda.ai — All AI Models, One Subscription",
      },
    ],
  },
  alternates: {
    canonical: "https://bedda.ai",
  },
};

const models = [
  { name: "Claude", provider: "Anthropic", tag: "Best for writing" },
  { name: "GPT-5", provider: "OpenAI", tag: "Best for coding" },
  { name: "Gemini", provider: "Google", tag: "Best for research" },
  { name: "Grok", provider: "xAI", tag: "Best for current events" },
  { name: "Mistral", provider: "Mistral AI", tag: "Fast & efficient" },
  { name: "DeepSeek", provider: "DeepSeek", tag: "Deep reasoning" },
  { name: "Llama", provider: "Meta", tag: "Open source" },
  { name: "Cerebras", provider: "Cerebras", tag: "Ultra-fast inference" },
];

const features = [
  {
    icon: GitCompare,
    title: "Model Arena",
    description: "Compare responses from multiple models side-by-side to find which works best for your task.",
  },
  {
    icon: Search,
    title: "Web Search",
    description: "Any model can search the web in real time and cite sources — no outdated training cutoffs.",
  },
  {
    icon: Code2,
    title: "Code Execution",
    description: "Run Python and JavaScript in a secure sandbox. Debug, test, and iterate without leaving the chat.",
  },
  {
    icon: Image,
    title: "Image & Video Generation",
    description: "Generate images with DALL-E 3, Imagen 3, and Flux. Create AI videos with Kling.",
  },
  {
    icon: Database,
    title: "Knowledge Base",
    description: "Upload your documents and let any AI model search them with RAG. Your data, every model.",
  },
  {
    icon: Bot,
    title: "Bots on Slack, Discord & More",
    description: "Access all models directly in Slack, Discord, Telegram, Teams, and WhatsApp — where you already work.",
  },
];

const stats = [
  { value: "30+", label: "AI models" },
  { value: "$12", label: "per month" },
  { value: "7-day", label: "free trial" },
  { value: "No card", label: "required to start" },
];

const testimonials = [
  {
    quote: "I was paying $60/month for Claude, ChatGPT, and Gemini separately. Bedda cut that to $12. I use it every day.",
    author: "Software engineer",
    role: "Switched from 3 subscriptions",
  },
  {
    quote: "The model comparison feature alone is worth it. I can ask the same question to Claude and GPT-5 and pick the better answer.",
    author: "Content strategist",
    role: "Plus plan subscriber",
  },
  {
    quote: "Having web search and code execution in every model is a game changer. I use Gemini for research and Claude for writing in the same conversation.",
    author: "Product manager",
    role: "Pro plan subscriber",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="container py-20 md:py-32 text-center">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
            <Zap className="h-3.5 w-3.5 text-yellow-500" />
            <span>30+ AI models. One subscription.</span>
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-7xl">
            Stop paying $20
            <br />
            for each AI.
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Claude, GPT-5, Gemini, Grok, Mistral, DeepSeek — all in one place for{" "}
            <strong className="text-foreground">$12/month</strong>. Switch between
            models mid-conversation. 7-day free trial, no card required.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="h-12 px-8 text-base">
              <Link href="/register">
                Start free trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base">
              <Link href="/pricing">See all plans</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            7 days free. Then $12/mo. Cancel anytime.{" "}
            <Link href="/api/auth/guest?redirectUrl=/" className="underline underline-offset-4 hover:text-foreground transition-colors">
              Or try without an account →
            </Link>
          </p>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y bg-muted/30">
        <div className="container py-8">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Model showcase */}
      <section className="container py-20">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Every major AI model, in one place</h2>
          <p className="text-muted-foreground text-lg">
            Switch models anytime. Compare responses. Use the right tool for each task.
          </p>
        </div>
        <div className="mx-auto max-w-5xl grid grid-cols-2 gap-4 sm:grid-cols-4">
          {models.map((model) => (
            <div
              key={model.name}
              className="rounded-lg border bg-card p-4 text-center hover:border-primary/50 transition-colors"
            >
              <div className="text-xl font-bold mb-1">{model.name}</div>
              <div className="text-xs text-muted-foreground mb-2">{model.provider}</div>
              <div className="text-xs bg-muted rounded-full px-2 py-0.5 inline-block">
                {model.tag}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Plus Llama, Falcon, Command R, Gemma, Phi, Qwen, and many more.
        </p>
      </section>

      {/* Cost comparison */}
      <section className="border-y bg-muted/20">
        <div className="container py-20">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-12">
              The math is simple
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border bg-background p-8">
                <div className="text-muted-foreground text-sm font-medium mb-4 uppercase tracking-wide">
                  Without bedda
                </div>
                <div className="space-y-3">
                  {[
                    ["Claude Pro", "$20/mo"],
                    ["ChatGPT Plus", "$20/mo"],
                    ["Gemini Advanced", "$19.99/mo"],
                  ].map(([name, price]) => (
                    <div key={name} className="flex items-center justify-between">
                      <span className="text-muted-foreground">{name}</span>
                      <span className="font-medium">{price}</span>
                    </div>
                  ))}
                  <div className="border-t pt-3 flex items-center justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="text-2xl font-bold text-red-500">$59.99/mo</span>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-primary bg-primary/5 p-8 relative">
                <div className="absolute top-3 right-3 text-xs font-semibold bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                  Best value
                </div>
                <div className="text-primary text-sm font-medium mb-4 uppercase tracking-wide">
                  With bedda Plus
                </div>
                <div className="space-y-3">
                  {[
                    ["Claude (all models)", "✓ Included"],
                    ["GPT-5 + all GPT models", "✓ Included"],
                    ["Gemini + Grok + Mistral + 27 more", "✓ Included"],
                  ].map(([name, price]) => (
                    <div key={name} className="flex items-center justify-between">
                      <span className="text-muted-foreground">{name}</span>
                      <span className="font-medium text-green-600">{price}</span>
                    </div>
                  ))}
                  <div className="border-t pt-3 flex items-center justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="text-2xl font-bold text-primary">$12/mo</span>
                  </div>
                </div>
                <Button asChild className="w-full mt-6">
                  <Link href="/register">Start free trial</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-20">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Not just model access</h2>
          <p className="text-muted-foreground text-lg">
            Every plan includes tools that single-vendor subscriptions don&apos;t offer.
          </p>
        </div>
        <div className="mx-auto max-w-5xl grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-lg border bg-card p-6">
              <feature.icon className="h-8 w-8 mb-4 text-primary" />
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t bg-muted/20">
        <div className="container py-20">
          <h2 className="text-3xl font-bold text-center mb-12">What users say</h2>
          <div className="mx-auto max-w-5xl grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.author} className="rounded-lg border bg-card p-6">
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <div className="font-medium text-sm">{t.author}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="border-t">
        <div className="container py-12">
          <div className="mx-auto max-w-3xl grid grid-cols-1 gap-6 sm:grid-cols-3 text-center">
            <div className="flex flex-col items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <div className="font-medium">7-day money-back guarantee</div>
              <div className="text-sm text-muted-foreground">Not happy? Full refund, no questions.</div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Clock className="h-6 w-6 text-primary" />
              <div className="font-medium">Cancel anytime</div>
              <div className="text-sm text-muted-foreground">No lock-in. Cancel from your account settings.</div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              <div className="font-medium">New models added automatically</div>
              <div className="text-sm text-muted-foreground">When a new model releases, it&apos;s added to your plan.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t bg-primary text-primary-foreground">
        <div className="container py-20 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to switch?</h2>
          <p className="mb-8 text-primary-foreground/80 text-lg">
            Join users who cancelled their $60/month AI stack and switched to bedda for $12.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" variant="secondary" className="h-12 px-8 text-base">
              <Link href="/register">
                Start free trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              <Link href="/pricing">Compare plans</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-primary-foreground/60">
            7 days free. No credit card required.{" "}
            <Link href="/api/auth/guest?redirectUrl=/" className="underline underline-offset-4 hover:text-primary-foreground/80 transition-colors">
              Or try without an account →
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
