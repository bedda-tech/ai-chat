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
  {
    slug: "best-free-ai-chatbot",
    title: "Best Free AI Chatbot in 2026 (No Credit Card Required)",
    description:
      "Looking for a free AI chatbot? We ranked the best options in 2026 — including ChatGPT free, Claude free tier, Gemini, and bedda.ai's free plan with 10+ models.",
    date: "June 2026",
    readingTime: "7 min read",
    category: "Guides",
  },
  {
    slug: "grok-4-review",
    title: "Grok 4 Review: Is xAI's Latest Model Worth It? (2026)",
    description:
      "An honest review of Grok 4 by xAI — strengths, weaknesses, pricing, and how it compares to ChatGPT, Claude, and Gemini in 2026.",
    date: "June 2026",
    readingTime: "7 min read",
    category: "Model Reviews",
  },
  {
    slug: "chatgpt-vs-gemini",
    title: "ChatGPT vs Google Gemini: Which Is Better in 2026?",
    description:
      "ChatGPT Plus vs Google Gemini Advanced — a detailed 2026 comparison covering writing, coding, accuracy, multimodal tasks, and pricing.",
    date: "June 2026",
    readingTime: "8 min read",
    category: "Model Comparisons",
  },
  {
    slug: "ai-for-productivity",
    title: "How to Use AI to 10x Your Productivity in 2026",
    description:
      "Practical guide to using AI for work productivity — which models to use for writing, coding, research, email, and analysis. With real examples.",
    date: "June 2026",
    readingTime: "9 min read",
    category: "Guides",
  },
  {
    slug: "grok-vs-chatgpt",
    title: "Grok 4 vs ChatGPT: Which AI Is Better in 2026?",
    description:
      "Grok 4 by xAI vs ChatGPT (GPT-5) by OpenAI — a head-to-head comparison on reasoning, coding, real-time search, pricing, and which AI to use in 2026.",
    date: "June 2026",
    readingTime: "8 min read",
    category: "Model Comparisons",
  },
  {
    slug: "perplexity-vs-chatgpt",
    title: "Perplexity AI vs ChatGPT: Which Is Better for Research in 2026?",
    description:
      "Perplexity AI vs ChatGPT — comparing two very different tools. Perplexity is a research engine; ChatGPT is a general AI assistant. Here's when to use each.",
    date: "June 2026",
    readingTime: "7 min read",
    category: "Model Comparisons",
  },
  {
    slug: "deepseek-vs-chatgpt",
    title: "DeepSeek vs ChatGPT: Is the Free Alternative Actually Better?",
    description:
      "DeepSeek V3 and R1 vs ChatGPT GPT-5 — comparing capabilities, pricing, privacy, and when the open-source alternative is worth choosing over OpenAI in 2026.",
    date: "June 2026",
    readingTime: "7 min read",
    category: "Model Comparisons",
  },
  {
    slug: "claude-opus-4-review",
    title: "Claude Opus 4.8 Review: Is Anthropic's AI the Best in 2026?",
    description:
      "An honest review of Claude Opus 4.8 — strengths, weaknesses, pricing, and how it compares to GPT-5 and Gemini 2.5 Pro for writing, coding, and research.",
    date: "June 2026",
    readingTime: "8 min read",
    category: "Model Reviews",
  },
  {
    slug: "best-ai-subscription-2026",
    title: "Best AI Subscription in 2026: ChatGPT Plus vs Claude Pro vs All-in-One",
    description:
      "Comparing the top AI subscriptions in 2026 — ChatGPT Plus ($20/mo), Claude Pro ($20/mo), Gemini Advanced ($19.99/mo), and multi-model alternatives. Which gives you the best value?",
    date: "June 2026",
    readingTime: "8 min read",
    category: "Guides",
  },
  {
    slug: "openai-o3-review",
    title: "OpenAI o3 Review: The Reasoning Model That Changes Everything",
    description:
      "OpenAI o3 is the most capable reasoning model ever released. How does it compare to Claude's extended thinking and DeepSeek R1? An honest review with real benchmarks.",
    date: "June 2026",
    readingTime: "7 min read",
    category: "Model Reviews",
  },
  {
    slug: "gemini-25-pro-review",
    title: "Gemini 2.5 Pro Review: Is Google's AI Worth Using in 2026?",
    description:
      "Google Gemini 2.5 Pro is the most capable Gemini model ever. Does it finally match GPT-5 and Claude Opus? An honest review of its strengths, weaknesses, and best use cases.",
    date: "June 2026",
    readingTime: "7 min read",
    category: "Model Reviews",
  },
  {
    slug: "how-to-use-multiple-ai-models",
    title: "How to Use Multiple AI Models (Without Paying for 3 Subscriptions)",
    description:
      "A practical guide to using GPT-5, Claude, and Gemini together — when to switch models, which excels at what, and how to access all of them without spending $60/month.",
    date: "June 2026",
    readingTime: "6 min read",
    category: "Guides",
  },
  {
    slug: "gpt-5-review",
    title: "GPT-5 Review: Benchmarks, Pricing, and Who Should Use It",
    description:
      "A thorough review of OpenAI GPT-5 — what it can do, how it performs on real tasks, and whether it's worth $20/month compared to the alternatives.",
    date: "June 2026",
    readingTime: "7 min read",
    category: "Model Reviews",
  },
  {
    slug: "best-ai-assistant-2026",
    title: "Best AI Assistants in 2026: Ranked and Reviewed",
    description:
      "We tested every major AI assistant in 2026 — ChatGPT, Claude, Gemini, Grok, Copilot, and more. Here's how they compare on real tasks.",
    date: "June 2026",
    readingTime: "9 min read",
    category: "AI Guides",
  },
  {
    slug: "llama-4-review",
    title: "Llama 4 Review: Meta's Open-Source AI in 2026",
    description:
      "Meta's Llama 4 brings open-source AI to a competitive level with GPT-4o. Here's what it can do, how to use it, and whether it beats the closed models.",
    date: "June 2026",
    readingTime: "6 min read",
    category: "Model Reviews",
  },
  {
    slug: "ai-for-email",
    title: "Best AI Email Assistants in 2026: Write Faster, Reply Smarter",
    description:
      "AI has transformed email. Here's how to use Claude, GPT-5, and other AI models to draft emails, manage replies, and cut your inbox time in half.",
    date: "June 2026",
    readingTime: "6 min read",
    category: "AI Guides",
  },
  {
    slug: "chatgpt-vs-claude-vs-gemini",
    title: "ChatGPT vs Claude vs Gemini: The Ultimate 3-Way AI Comparison (2026)",
    description:
      "A definitive comparison of ChatGPT (GPT-5), Claude Opus 4.8, and Gemini 2.5 Pro — benchmarks, pricing, strengths, and which AI wins for each task in 2026.",
    date: "June 2026",
    readingTime: "10 min read",
    category: "Model Comparisons",
  },
  {
    slug: "best-ai-image-generator-2026",
    title: "Best AI Image Generators in 2026: DALL-E 3, Imagen 3, Flux, and More",
    description:
      "Comparing the top AI image generation tools in 2026 — DALL-E 3, Google Imagen 3, Flux 1.1 Pro, and Midjourney. What each excels at and where to access them.",
    date: "June 2026",
    readingTime: "7 min read",
    category: "AI Guides",
  },
  {
    slug: "claude-sonnet-4-review",
    title: "Claude Sonnet 4.6 Review: Anthropic's Best Value Model in 2026",
    description:
      "A complete review of Claude Sonnet 4.6 — how it compares to Claude Opus 4.8, when to use it over GPT-4o, and why it's the workhorse model for most users.",
    date: "June 2026",
    readingTime: "6 min read",
    category: "Model Reviews",
  },
  {
    slug: "ai-tools-for-teams",
    title: "Best AI Tools for Teams in 2026: Collaborate Smarter with AI",
    description:
      "How teams use AI together — shared knowledge bases, real-time collaboration, model access policies, and the best platforms for team AI workflows in 2026.",
    date: "June 2026",
    readingTime: "7 min read",
    category: "AI Guides",
  },
  {
    slug: "is-chatgpt-plus-worth-it-2026",
    title: "Is ChatGPT Plus Worth $20/Month in 2026? An Honest Answer",
    description:
      "ChatGPT Plus costs $20/month for GPT-5, o3, and DALL-E 3. Is it worth it — or are there better options? An honest breakdown for 2026.",
    date: "June 2026",
    readingTime: "7 min read",
    category: "Guides",
  },
  {
    slug: "best-ai-for-marketers",
    title: "Best AI for Marketing in 2026: Tools, Models & Workflows",
    description:
      "Which AI models work best for marketing teams in 2026? A practical guide to using Claude, GPT-5, and Gemini for copy, content strategy, SEO, and social media.",
    date: "June 2026",
    readingTime: "8 min read",
    category: "AI Guides",
  },
  {
    slug: "mistral-vs-chatgpt",
    title: "Mistral vs ChatGPT in 2026: Is the European AI Worth It?",
    description:
      "Mistral Large vs ChatGPT GPT-5 — comparing the European open-weight AI against OpenAI on coding, writing, pricing, and privacy. Which should you use in 2026?",
    date: "June 2026",
    readingTime: "7 min read",
    category: "Model Comparisons",
  },
  {
    slug: "ai-for-social-media",
    title: "How to Use AI for Social Media in 2026: Content, Strategy & Posting",
    description:
      "A practical guide to using AI for social media in 2026 — writing posts, planning content, generating captions, and choosing the right AI model for each platform.",
    date: "June 2026",
    readingTime: "7 min read",
    category: "AI Guides",
  },
  {
    slug: "gpt-4o-vs-gpt-5",
    title: "GPT-4o vs GPT-5: Should You Upgrade in 2026?",
    description:
      "GPT-4o vs GPT-5 — a detailed comparison of OpenAI's two flagship models on performance, speed, cost, and real-world tasks. Is GPT-5 worth the upgrade?",
    date: "June 2026",
    readingTime: "7 min read",
    category: "Model Comparisons",
  },
  {
    slug: "best-ai-for-students-2026",
    title: "Best AI for Students in 2026: Study Smarter, Write Better, Research Faster",
    description:
      "The best AI tools for students in 2026 — for essay writing, research, exam prep, summarizing papers, and coding. Ranked by use case with pricing.",
    date: "June 2026",
    readingTime: "8 min read",
    category: "AI Guides",
  },
  {
    slug: "is-perplexity-pro-worth-it",
    title: "Is Perplexity Pro Worth It in 2026? An Honest Review",
    description:
      "Is Perplexity Pro worth $20/month in 2026? We review what you get, where it falls short, and whether there's a better value option for AI-powered research.",
    date: "June 2026",
    readingTime: "7 min read",
    category: "Guides",
  },
  {
    slug: "ai-for-legal-professionals",
    title: "Best AI Tools for Lawyers and Legal Professionals in 2026",
    description:
      "How lawyers are using AI in 2026 — contract review, legal research, drafting, and due diligence. Best models, workflows, and what to avoid.",
    date: "June 2026",
    readingTime: "9 min read",
    category: "Professional Guides",
  },
  {
    slug: "kimi-k2-review",
    title: "Kimi K2 Review: Is MoonshotAI's Model Worth Using in 2026?",
    description:
      "MoonshotAI's Kimi K2 is one of the fastest and most capable AI models of 2026. How does it compare to GPT-5, Claude Opus 4.8, and Gemini 2.5 Pro? An honest review.",
    date: "June 2026",
    readingTime: "7 min read",
    category: "Model Reviews",
  },
  {
    slug: "deepseek-v3-review",
    title: "DeepSeek V3 Review: The Best Open-Source AI Model in 2026?",
    description:
      "DeepSeek V3 is the most capable open-source AI model in 2026. How does it compare to GPT-5, Claude, and what makes it different from DeepSeek R1? An honest review.",
    date: "June 2026",
    readingTime: "8 min read",
    category: "Model Reviews",
  },
  {
    slug: "best-ai-for-healthcare",
    title: "Best AI for Healthcare Professionals in 2026: Doctors, Nurses & Researchers",
    description:
      "Which AI models should healthcare professionals use in 2026? A guide to using Claude, GPT-5, and Gemini for clinical notes, research, patient education, and medical writing.",
    date: "June 2026",
    readingTime: "9 min read",
    category: "Professional Guides",
  },
  {
    slug: "ai-for-hr-professionals",
    title: "Best AI for HR Professionals in 2026: Hiring, Onboarding & HR Tasks",
    description:
      "How HR teams are using AI in 2026 — writing job descriptions, screening guidance, employee onboarding, policy creation, and performance reviews. Best models and workflows.",
    date: "June 2026",
    readingTime: "8 min read",
    category: "Professional Guides",
  },
  {
    slug: "best-ai-for-teachers-2026",
    title: "Best AI for Teachers in 2026: Lesson Plans, Rubrics & Student Feedback",
    description:
      "How educators are using AI in 2026 — generating lesson plans in minutes, creating differentiated materials, writing rubrics, and giving better student feedback faster.",
    date: "June 2026",
    readingTime: "8 min read",
    category: "Professional Guides",
  },
  {
    slug: "chatgpt-teams-vs-bedda",
    title: "ChatGPT Teams vs Bedda: Which AI Platform Is Better for Teams in 2026?",
    description:
      "ChatGPT Teams is $30/user/month for GPT models only. Bedda gives your whole team 36+ models (GPT-5, Claude, Gemini, Grok) for less. A complete comparison.",
    date: "June 2026",
    readingTime: "7 min read",
    category: "Model Comparisons",
  },
  {
    slug: "best-ai-for-startups-2026",
    title: "Best AI Tools for Startups in 2026: Cut Costs Without Cutting Corners",
    description:
      "Most startups pay $60+/mo for ChatGPT Plus AND Claude Pro. There's a smarter way. The best AI tools for founders — pitches, code, research, and legal — for less.",
    date: "June 2026",
    readingTime: "8 min read",
    category: "Guides",
  },
  {
    slug: "ai-for-content-creators",
    title: "Best AI for Content Creators in 2026: YouTube, Newsletters & Social Media",
    description:
      "How top creators are using AI in 2026 — scripting YouTube videos, writing newsletters, repurposing content across platforms, and finding trending topics before they peak.",
    date: "June 2026",
    readingTime: "8 min read",
    category: "Professional Guides",
  },
  {
    slug: "is-chatgpt-pro-worth-it",
    title: "Is ChatGPT Pro Worth $200/Month? (Honest 2026 Review)",
    description:
      "ChatGPT Pro costs $200/month for OpenAI's highest reasoning model access. We break down who it's for, what you get, and whether there's a smarter way to spend $200 on AI.",
    date: "June 2026",
    readingTime: "7 min read",
    category: "Value Guides",
  },
  {
    slug: "gpt-5-vs-gemini-2-5-pro",
    title: "GPT-5 vs Gemini 2.5 Pro: Which Is Better in 2026?",
    description:
      "A detailed comparison of OpenAI GPT-5 and Google Gemini 2.5 Pro — benchmarks, real-world performance, context windows, pricing, and which model to use for specific tasks.",
    date: "June 2026",
    readingTime: "8 min read",
    category: "Model Comparisons",
  },
  {
    slug: "best-ai-for-freelancers",
    title: "Best AI Tools for Freelancers in 2026: The Complete Guide",
    description:
      "The best AI models for freelancers in 2026 — for writing, coding, design, client communication, and more. Which AI subscriptions are actually worth it when you're self-employed?",
    date: "June 2026",
    readingTime: "9 min read",
    category: "Professional Guides",
  },
  {
    slug: "ai-writing-assistant-2026",
    title: "Best AI Writing Assistant in 2026: Ranked and Reviewed",
    description:
      "The best AI writing assistants in 2026 — ranked by writing quality, instruction-following, pricing, and use case. From Claude and GPT-5 to Jasper, Grammarly, and Copy.ai.",
    date: "June 2026",
    readingTime: "9 min read",
    category: "Guides",
  },
  {
    slug: "microsoft-copilot-vs-chatgpt",
    title: "Microsoft Copilot vs ChatGPT in 2026: Which AI Is Worth Paying For?",
    description:
      "Microsoft Copilot ($30/mo with M365) vs ChatGPT Plus ($20/mo) — a full comparison of features, models, pricing, and real-world usefulness in 2026.",
    date: "June 2026",
    readingTime: "8 min read",
    category: "Model Comparisons",
  },
  {
    slug: "is-gemini-advanced-worth-it",
    title: "Is Gemini Advanced Worth $19.99/Month? (Honest 2026 Review)",
    description:
      "An honest look at whether Gemini Advanced is worth $19.99/month in 2026 — what you get, what you don't, and how it stacks up against ChatGPT Plus and bedda.ai.",
    date: "June 2026",
    readingTime: "7 min read",
    category: "Value Guides",
  },
  {
    slug: "best-ai-for-research-2026",
    title: "Best AI for Research in 2026: Academic, Market & Professional",
    description:
      "The best AI tools for research in 2026 — academic literature, market research, competitive intelligence, and professional research workflows.",
    date: "June 2026",
    readingTime: "9 min read",
    category: "Professional Guides",
  },
  {
    slug: "ai-for-data-analysis",
    title: "Best AI for Data Analysis in 2026: A Practical Guide",
    description:
      "How to use AI for data analysis in 2026 — from CSV interpretation and SQL generation to chart creation and statistical analysis.",
    date: "June 2026",
    readingTime: "9 min read",
    category: "Professional Guides",
  },
  {
    slug: "best-ai-for-customer-service",
    title: "Best AI for Customer Service in 2026: Tools, Models & Real Workflows",
    description:
      "From live chat support to ticket summarization and tone coaching — here's how to use AI models to cut handle time, boost CSAT, and scale your support team.",
    date: "June 2026",
    readingTime: "8 min read",
    category: "Professional Guides",
  },
  {
    slug: "anthropic-vs-openai-vs-google",
    title: "Anthropic vs OpenAI vs Google: Which AI Company Wins in 2026?",
    description:
      "Claude vs ChatGPT vs Gemini — a deep look at the companies, their models, safety philosophies, pricing, and which AI lab is ahead in 2026.",
    date: "June 2026",
    readingTime: "9 min read",
    category: "AI Guides",
  },
  {
    slug: "best-ai-for-designers-2026",
    title: "Best AI Tools for Designers in 2026: UI, Branding & Creative Workflows",
    description:
      "From generating design briefs to creating image assets and writing UX copy — here's how UI/UX designers, brand designers, and creative directors are using AI in 2026.",
    date: "June 2026",
    readingTime: "8 min read",
    category: "Professional Guides",
  },
  {
    slug: "chatgpt-vs-google-gemini-vs-claude",
    title: "ChatGPT vs Google Gemini vs Claude: Full Comparison 2026",
    description:
      "An honest head-to-head comparison of ChatGPT Plus, Google Gemini Advanced, and Claude Pro — pricing, capability, context window, and which to choose.",
    date: "June 2026",
    readingTime: "9 min read",
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
