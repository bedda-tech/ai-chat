import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { isValidReferralCode } from "@/lib/db/queries";
import { Button } from "@/components/ui/button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  return {
    title: "You've been invited to bedda.ai",
    description:
      "Get a 14-day free trial of bedda.ai Plus — access Claude, GPT-5, Gemini, Grok, and 30+ AI models for one low price.",
    openGraph: {
      title: "You've been invited to bedda.ai",
      description:
        "Access 30+ AI models (Claude, GPT-5, Gemini, Grok, DeepSeek) in one place — from $12/mo. Your friend shared a 14-day free trial with you.",
      url: `https://www.bedda.tech/join/${code}`,
    },
  };
}

const MODELS = [
  { name: "Claude", provider: "Anthropic", color: "bg-orange-100 text-orange-800" },
  { name: "GPT-5", provider: "OpenAI", color: "bg-green-100 text-green-800" },
  { name: "Gemini", provider: "Google", color: "bg-blue-100 text-blue-800" },
  { name: "Grok", provider: "xAI", color: "bg-purple-100 text-purple-800" },
  { name: "DeepSeek", provider: "DeepSeek", color: "bg-indigo-100 text-indigo-800" },
  { name: "Mistral", provider: "Mistral AI", color: "bg-yellow-100 text-yellow-800" },
];

const FEATURES = [
  { icon: "🤖", title: "30+ AI models", desc: "Claude, GPT-5, Gemini, Grok, DeepSeek & more" },
  { icon: "🖼️", title: "Image generation", desc: "DALL-E 3, Imagen 3, and Flux in one place" },
  { icon: "🔍", title: "Web search", desc: "Real-time answers powered by live search" },
  { icon: "🧠", title: "Deep research", desc: "Multi-step reasoning with agent mode" },
  { icon: "📂", title: "Knowledge base", desc: "Upload docs and chat with your own files" },
  { icon: "💬", title: "Slack & Discord bots", desc: "Bring bedda into your team workspace" },
];

export default async function JoinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const valid = await isValidReferralCode(code);
  if (!valid) {
    redirect(`/register`);
  }

  const registerUrl = `/register?ref=${code}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 max-w-5xl items-center px-4">
          <Link className="flex items-center space-x-2" href="/">
            <Image
              alt="Bedda Logo"
              className="h-6 w-6"
              height={24}
              src="/images/bedda-coral-icon-background-transparent.png"
              unoptimized
              width={24}
            />
            <span className="font-bold">bedda.ai</span>
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <Link
              className="text-sm text-muted-foreground hover:text-foreground"
              href="/login"
            >
              Sign in
            </Link>
            <Button asChild size="sm">
              <Link href={registerUrl}>Get started free</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="container mx-auto max-w-5xl px-4 py-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <span>🎁</span> You&apos;ve been invited — exclusive 14-day free trial
          </div>

          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            All AI models.{" "}
            <span className="text-primary">One subscription.</span>
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Your friend is sharing their secret: stop paying $20/mo for each AI
            separately. bedda.ai gives you Claude, GPT-5, Gemini, Grok, and 30+
            more models — starting at just $12/month.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="text-base px-8">
              <Link href={registerUrl}>Start your 14-day free trial →</Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              No credit card required
            </p>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            Free trial applies to Plus plan ($12/mo). Cancel anytime.
          </p>
        </section>

        {/* Model logos */}
        <section className="border-y bg-muted/30 py-8">
          <div className="container mx-auto max-w-5xl px-4">
            <p className="mb-5 text-center text-sm font-medium text-muted-foreground">
              ACCESS ALL OF THESE — AND MORE — WITH ONE ACCOUNT
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {MODELS.map((m) => (
                <div
                  key={m.name}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium ${m.color}`}
                >
                  {m.name}
                  <span className="ml-1.5 opacity-60 text-xs">{m.provider}</span>
                </div>
              ))}
              <div className="rounded-full bg-gray-100 px-4 py-1.5 text-sm font-medium text-gray-600">
                +24 more models
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto max-w-5xl px-4 py-16">
          <h2 className="mb-10 text-center text-2xl font-bold sm:text-3xl">
            Everything you need to get work done with AI
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border bg-card p-5"
              >
                <div className="mb-3 text-2xl">{f.icon}</div>
                <h3 className="mb-1 font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing comparison */}
        <section className="border-t bg-muted/30 py-16">
          <div className="container mx-auto max-w-3xl px-4 text-center">
            <h2 className="mb-3 text-2xl font-bold sm:text-3xl">
              Why pay for each AI separately?
            </h2>
            <p className="mb-10 text-muted-foreground">
              Most people spend $40–60/mo on multiple AI subscriptions.
              bedda.ai replaces them all.
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border bg-destructive/5 p-5">
                <p className="text-sm text-muted-foreground">Competitors</p>
                <p className="mt-2 text-3xl font-bold text-destructive">$60+/mo</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Claude ($20) + GPT ($20) + Gemini ($20)
                </p>
              </div>
              <div className="rounded-xl border-2 border-primary bg-primary/5 p-5 ring-2 ring-primary/20">
                <p className="text-sm font-medium text-primary">bedda.ai Plus</p>
                <p className="mt-2 text-3xl font-bold">$12/mo</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  All 30+ models included
                </p>
                <div className="mt-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  Your invite: first 14 days free
                </div>
              </div>
              <div className="rounded-xl border bg-muted p-5">
                <p className="text-sm text-muted-foreground">You save</p>
                <p className="mt-2 text-3xl font-bold text-green-600">$48/mo</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  80% less than subscribing separately
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto max-w-5xl px-4 py-16 text-center">
          <h2 className="mb-3 text-2xl font-bold sm:text-3xl">
            Ready to try bedda.ai?
          </h2>
          <p className="mb-8 text-muted-foreground">
            Your 14-day free trial is waiting. No credit card needed to start.
          </p>
          <Button asChild size="lg" className="text-base px-10">
            <Link href={registerUrl}>Create your free account →</Link>
          </Button>
          <p className="mt-3 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} bedda.ai — All AI models, one subscription.
          </p>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
