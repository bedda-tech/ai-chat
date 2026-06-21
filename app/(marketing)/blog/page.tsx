import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Blog — bedda.ai | AI Model Guides & Comparisons",
  description:
    "Practical guides on choosing AI models, comparing GPT-5 vs Claude, and getting the most from your AI subscription. From the bedda.ai team.",
  openGraph: {
    title: "bedda.ai Blog — AI Guides & Model Comparisons",
    description:
      "Deep-dive guides on GPT-5 vs Claude Opus 4.8, the best AI for coding, and how to pick the right model for each task.",
  },
  alternates: {
    canonical: "https://bedda.ai/blog",
  },
};

const posts = [
  {
    slug: "gpt-5-vs-claude-opus-4",
    title: "GPT-5 vs Claude Opus 4.8: Which AI Is Better in 2026?",
    description:
      "A deep comparison of OpenAI GPT-5 and Anthropic Claude Opus 4.8 — benchmarks, pricing, coding ability, writing quality, and which to use for each task.",
    date: "June 2026",
    readingTime: "8 min read",
    category: "Model Comparisons",
  },
  {
    slug: "best-ai-models-2026",
    title: "Best AI Models in 2026: The Complete Guide",
    description:
      "Ranking the top 36 AI models available in 2026 — from GPT-5 and Claude Opus 4.8 to Gemini 2.5 Pro, Grok 4, DeepSeek R1, and Mistral Large.",
    date: "June 2026",
    readingTime: "10 min read",
    category: "Guides",
  },
  {
    slug: "chatgpt-plus-alternatives",
    title: "ChatGPT Plus Alternatives in 2026: Which Is Worth $20/Month?",
    description:
      "ChatGPT Plus costs $20/month for GPT models only. Here are the best alternatives — including options that give you more models for less money.",
    date: "June 2026",
    readingTime: "7 min read",
    category: "Guides",
  },
  {
    slug: "ai-models-for-coding",
    title: "Best AI Models for Coding in 2026: A Developer's Guide",
    description:
      "Which AI model should developers use in 2026? We rank GPT-5, Claude Opus 4.8, Gemini 2.5 Pro, DeepSeek R1, and more on coding benchmarks and real-world performance.",
    date: "June 2026",
    readingTime: "9 min read",
    category: "Developer Guides",
  },
  {
    slug: "claude-vs-chatgpt",
    title: "Claude vs ChatGPT in 2026: Which AI Should You Use?",
    description:
      "Claude vs ChatGPT — a detailed comparison of Anthropic Claude and OpenAI ChatGPT on writing, coding, reasoning, and instruction-following. Which is better for your work?",
    date: "June 2026",
    readingTime: "9 min read",
    category: "Model Comparisons",
  },
  {
    slug: "deepseek-r1-review",
    title: "DeepSeek R1 Review: Is It Really Better Than GPT-5?",
    description:
      "DeepSeek R1 made headlines with its open-source reasoning model. How does it compare to GPT-5 and Claude Opus 4.8 on math, coding, and real-world tasks in 2026?",
    date: "June 2026",
    readingTime: "7 min read",
    category: "Model Reviews",
  },
  {
    slug: "best-ai-for-writing",
    title: "Best AI for Writing in 2026: A Practical Guide",
    description:
      "Which AI is best for writing in 2026? Claude, ChatGPT, Gemini, and Jasper compared for long-form writing, marketing copy, creative fiction, and content creation.",
    date: "June 2026",
    readingTime: "8 min read",
    category: "Guides",
  },
  {
    slug: "gemini-vs-claude",
    title: "Gemini 2.5 Pro vs Claude Opus 4.8: Head-to-Head Comparison",
    description:
      "Google Gemini 2.5 Pro vs Anthropic Claude Opus 4.8 — which AI model is better for coding, writing, multimodal tasks, and long-context processing in 2026?",
    date: "June 2026",
    readingTime: "8 min read",
    category: "Model Comparisons",
  },
];

const categories = [...new Set(posts.map((p) => p.category))];

export default function BlogPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="mb-4 font-bold text-4xl tracking-tight">
          bedda.ai Blog
        </h1>
        <p className="mx-auto max-w-2xl text-muted-foreground text-xl">
          Practical guides on AI models, comparisons, and how to get more from
          your AI subscription.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          All Posts
        </span>
        {categories.map((cat) => (
          <span
            key={cat}
            className="rounded-full border px-3 py-1 text-xs text-muted-foreground"
          >
            {cat}
          </span>
        ))}
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block rounded-xl border bg-card p-6 transition-colors hover:border-primary/50 hover:bg-muted/30"
          >
            <div className="mb-3 flex flex-wrap items-center gap-3 text-muted-foreground text-sm">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {post.category}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {post.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {post.readingTime}
              </span>
            </div>
            <h2 className="mb-2 font-semibold text-xl leading-snug group-hover:text-primary">
              {post.title}
            </h2>
            <p className="mb-4 text-muted-foreground">{post.description}</p>
            <span className="flex items-center gap-1 text-sm font-medium text-primary">
              Read article
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-16 rounded-xl border bg-muted/30 p-8 text-center">
        <h2 className="mb-2 font-semibold text-2xl">
          Try all 36 models free
        </h2>
        <p className="mb-6 text-muted-foreground">
          Every model covered in this blog — GPT-5, Claude Opus 4.8, Gemini 2.5
          Pro, Grok 4, DeepSeek R1, and 31 more — available in one subscription.
          Start with a 7-day free trial.
        </p>
        <div className="flex justify-center gap-3">
          <Button asChild>
            <Link href="/register">Start Free Trial</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/pricing">See Pricing</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
