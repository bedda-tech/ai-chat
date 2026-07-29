import { ArrowRight, Check, X } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";

type ComparisonRow = {
  feature: string;
  bedda: boolean | string;
  competitor: boolean | string;
};

type ComparisonData = {
  slug: string;
  competitor: string;
  competitorUrl: string;
  competitorPrice: string;
  beddaPrice: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  heroHeadline: string;
  heroSubtext: string;
  verdict: string;
  switchReasons: string[];
  rows: ComparisonRow[];
  faq: { q: string; a: string }[];
};

const COMPARISONS: Record<string, ComparisonData> = {
  "bedda-vs-chatgpt": {
    slug: "bedda-vs-chatgpt",
    competitor: "ChatGPT Plus",
    competitorUrl: "https://chat.openai.com",
    competitorPrice: "$20/mo",
    beddaPrice: "$12/mo",
    title: "bedda.ai vs ChatGPT Plus",
    metaTitle: "bedda.ai vs ChatGPT Plus (2026) — More Models, Less Money",
    metaDescription:
      "Compare bedda.ai and ChatGPT Plus. bedda gives you GPT-5, Claude 4, Gemini, Grok and 36+ models for $12/mo — 40% cheaper than ChatGPT Plus alone. 7-day free trial.",
    ogTitle: "bedda.ai vs ChatGPT Plus — Save $8/mo, Get 36+ AI Models",
    ogDescription:
      "ChatGPT Plus locks you into GPT models at $20/mo. bedda.ai gives you GPT-5 PLUS Claude, Gemini, Grok, DeepSeek and 36+ models for $12/mo.",
    heroHeadline: "Everything ChatGPT Plus offers — plus 25 more AI models",
    heroSubtext:
      "ChatGPT Plus gives you one company's models. bedda.ai gives you every major AI — Claude, GPT-5, Gemini, Grok, DeepSeek and 36+ more — for $8 less per month.",
    verdict:
      "bedda.ai includes GPT-5 access alongside every other frontier model. If you're paying $20/mo for ChatGPT Plus, you're paying 67% more for fewer models.",
    switchReasons: [
      "Access Claude 4, Gemini, Grok and DeepSeek in the same app as GPT-5",
      "Save $8/mo — $96/year back in your pocket",
      "Switch models mid-conversation to pick the best one for each task",
      "Run side-by-side model comparisons in the arena",
      "No separate subscriptions to manage",
    ],
    rows: [
      { feature: "Monthly price", bedda: "$12/mo", competitor: "$20/mo" },
      { feature: "GPT-5 access", bedda: true, competitor: true },
      { feature: "Claude 4 (Opus, Sonnet)", bedda: true, competitor: false },
      { feature: "Gemini 2.5 Pro", bedda: true, competitor: false },
      { feature: "Grok 4", bedda: true, competitor: false },
      { feature: "DeepSeek R1", bedda: true, competitor: false },
      { feature: "Mistral Large", bedda: true, competitor: false },
      { feature: "Image generation", bedda: true, competitor: true },
      { feature: "Video generation", bedda: true, competitor: true },
      { feature: "Code execution", bedda: true, competitor: true },
      { feature: "Web search", bedda: true, competitor: true },
      { feature: "Audio transcription", bedda: true, competitor: true },
      { feature: "Knowledge base (RAG)", bedda: true, competitor: false },
      { feature: "Cross-conversation memory", bedda: true, competitor: true },
      { feature: "Model comparison arena", bedda: true, competitor: false },
      { feature: "Team workspaces", bedda: true, competitor: false },
      { feature: "OpenAI-compatible API", bedda: true, competitor: false },
      { feature: "Total AI models", bedda: "36+", competitor: "5" },
    ],
    faq: [
      {
        q: "Does bedda.ai include GPT-5?",
        a: "Yes. bedda.ai routes to GPT-5 (and GPT-4o, GPT-4o-mini) via the Vercel AI Gateway. You get the same OpenAI models as ChatGPT Plus, plus every other frontier model.",
      },
      {
        q: "Is the GPT-5 on bedda.ai the same as ChatGPT Plus?",
        a: "You're talking to the same underlying model (gpt-5 via OpenAI's API). The difference is bedda wraps it in a multi-model interface so you can switch to Claude or Gemini whenever you want.",
      },
      {
        q: "Can I import my ChatGPT conversation history?",
        a: "Not directly — ChatGPT exports to JSON, which you can upload to bedda's knowledge base and reference in any conversation. Native import is on our roadmap.",
      },
      {
        q: "Does bedda.ai have DALL-E image generation?",
        a: "Yes. DALL-E 3 is available for image generation alongside Google Imagen 3 and Flux 1.1 Pro.",
      },
    ],
  },

  "bedda-vs-claude": {
    slug: "bedda-vs-claude",
    competitor: "Claude Pro",
    competitorUrl: "https://claude.ai",
    competitorPrice: "$20/mo",
    beddaPrice: "$12/mo",
    title: "bedda.ai vs Claude Pro",
    metaTitle: "bedda.ai vs Claude Pro (2026) — All Claude Models + 25 More",
    metaDescription:
      "Compare bedda.ai and Claude Pro. Get Claude Opus, Sonnet, and Haiku PLUS GPT-5, Gemini, Grok and 36+ more models — all for $12/mo. 7-day free trial.",
    ogTitle: "bedda.ai vs Claude Pro — Same Claude, More Models, Lower Price",
    ogDescription:
      "Claude Pro costs $20/mo for Anthropic models only. bedda.ai gives you Claude 4 Opus + Sonnet + Haiku PLUS GPT-5, Gemini, Grok and 36+ models for $12/mo.",
    heroHeadline: "All of Claude Pro's models — plus GPT-5, Gemini and 25 more",
    heroSubtext:
      "Claude Pro gives you Anthropic's models for $20/mo. bedda.ai gives you Claude 4 Opus, Sonnet and Haiku alongside every other frontier model — for $8 less per month.",
    verdict:
      "If you use Claude daily, bedda.ai is the better deal. You keep full Claude access and gain GPT-5, Gemini 2.5, Grok 4 and 25 more models — for 40% less.",
    switchReasons: [
      "Keep Claude Opus, Sonnet and Haiku access — unchanged",
      "Add GPT-5, Gemini 2.5, Grok 4 and DeepSeek R1 to your workflow",
      "Save $8/mo ($96/year) vs Claude Pro alone",
      "Choose the right model for each task instead of being locked in",
      "Image and video generation Claude doesn't offer",
    ],
    rows: [
      { feature: "Monthly price", bedda: "$12/mo", competitor: "$20/mo" },
      { feature: "Claude 4 Opus", bedda: true, competitor: true },
      { feature: "Claude 4 Sonnet", bedda: true, competitor: true },
      { feature: "Claude 3.5 Haiku", bedda: true, competitor: true },
      { feature: "GPT-5 access", bedda: true, competitor: false },
      { feature: "Gemini 2.5 Pro", bedda: true, competitor: false },
      { feature: "Grok 4", bedda: true, competitor: false },
      { feature: "DeepSeek R1", bedda: true, competitor: false },
      { feature: "Image generation", bedda: true, competitor: false },
      { feature: "Video generation", bedda: true, competitor: false },
      { feature: "Code execution", bedda: true, competitor: true },
      { feature: "Web search", bedda: true, competitor: true },
      { feature: "Audio transcription", bedda: true, competitor: false },
      { feature: "Knowledge base (RAG)", bedda: true, competitor: false },
      { feature: "Cross-conversation memory", bedda: true, competitor: true },
      { feature: "Model comparison arena", bedda: true, competitor: false },
      { feature: "Team workspaces", bedda: true, competitor: false },
      { feature: "OpenAI-compatible API", bedda: true, competitor: false },
      { feature: "Total AI models", bedda: "36+", competitor: "4" },
    ],
    faq: [
      {
        q: "Is the Claude on bedda.ai the same as Claude Pro?",
        a: "Yes — you're talking to the same Claude 4 Opus, Sonnet and Haiku models via Anthropic's API. The same intelligence, same safety, same writing quality.",
      },
      {
        q: "Does bedda.ai have Claude's Projects feature?",
        a: "bedda.ai has Projects too — you can create workspaces with custom system instructions and a dedicated knowledge base, similar to Claude's Projects.",
      },
      {
        q: "What about Claude's artifact / canvas feature?",
        a: "bedda.ai has a full artifacts system: code with live preview, markdown, spreadsheets, Mermaid diagrams, HTML preview, Reveal.js slides, and Jupyter notebooks.",
      },
      {
        q: "Can I import Claude chat history?",
        a: "Claude exports conversations to JSON. You can upload these to bedda's knowledge base for reference. Direct import is on our roadmap.",
      },
    ],
  },

  "bedda-vs-gemini": {
    slug: "bedda-vs-gemini",
    competitor: "Gemini Advanced",
    competitorUrl: "https://gemini.google.com",
    competitorPrice: "$19.99/mo",
    beddaPrice: "$12/mo",
    title: "bedda.ai vs Gemini Advanced",
    metaTitle:
      "bedda.ai vs Gemini Advanced (2026) — All Gemini Models + 25 More",
    metaDescription:
      "Compare bedda.ai and Gemini Advanced. Get Gemini 2.5 Pro, Flash and Ultra PLUS Claude, GPT-5, Grok and 36+ more models for $12/mo. 7-day free trial.",
    ogTitle:
      "bedda.ai vs Gemini Advanced — Same Gemini, More Models, Lower Cost",
    ogDescription:
      "Gemini Advanced costs $20/mo for Google models only. bedda.ai gives you Gemini 2.5 Pro + Flash PLUS Claude 4, GPT-5, Grok and 36+ models for $12/mo.",
    heroHeadline: "All Gemini models — plus Claude 4, GPT-5, Grok and 25 more",
    heroSubtext:
      "Gemini Advanced locks you into Google's AI for $20/mo. bedda.ai gives you Gemini 2.5 Pro and Flash alongside every other frontier model — for $8 less per month.",
    verdict:
      "bedda.ai includes full Gemini 2.5 access alongside Claude, GPT-5 and Grok. You lose nothing and gain everything — at 40% lower cost.",
    switchReasons: [
      "Keep Gemini 2.5 Pro and Flash access — unchanged",
      "Add Claude 4, GPT-5, Grok 4 and DeepSeek to your toolkit",
      "Save $8/mo ($96/year) vs Gemini Advanced alone",
      "Gemini excels at long-context; Claude excels at writing; use both",
      "Image and video generation including Google Imagen 3",
    ],
    rows: [
      { feature: "Monthly price", bedda: "$12/mo", competitor: "$19.99/mo" },
      { feature: "Gemini 2.5 Pro", bedda: true, competitor: true },
      { feature: "Gemini 2.5 Flash", bedda: true, competitor: true },
      { feature: "Claude 4 Opus + Sonnet", bedda: true, competitor: false },
      { feature: "GPT-5 access", bedda: true, competitor: false },
      { feature: "Grok 4", bedda: true, competitor: false },
      { feature: "DeepSeek R1", bedda: true, competitor: false },
      { feature: "Image generation (Imagen 3)", bedda: true, competitor: true },
      { feature: "Video generation", bedda: true, competitor: true },
      { feature: "Code execution", bedda: true, competitor: true },
      { feature: "Web search", bedda: true, competitor: true },
      { feature: "Audio transcription", bedda: true, competitor: false },
      { feature: "Knowledge base (RAG)", bedda: true, competitor: false },
      { feature: "Cross-conversation memory", bedda: true, competitor: true },
      { feature: "Model comparison arena", bedda: true, competitor: false },
      { feature: "Team workspaces", bedda: true, competitor: false },
      { feature: "OpenAI-compatible API", bedda: true, competitor: false },
      { feature: "Total AI models", bedda: "36+", competitor: "6" },
    ],
    faq: [
      {
        q: "Is the Gemini on bedda.ai the same as Gemini Advanced?",
        a: "Yes — bedda.ai routes to Gemini 2.5 Pro and Flash via Google's API (the same models that power Gemini Advanced). Same context window, same capabilities.",
      },
      {
        q: "What about Google Workspace integration?",
        a: "bedda.ai has Google Drive integration — connect your Drive and import documents directly into your knowledge base or chat context. Sheets and Docs are both supported.",
      },
      {
        q: "Does bedda.ai have Gemini's image generation?",
        a: "Yes — Imagen 3 Fast is available for image generation alongside DALL-E 3 and Flux 1.1 Pro.",
      },
      {
        q: "Can Gemini on bedda.ai search the web?",
        a: "Yes. bedda.ai has built-in web search (via Brave Search) available to all paid users, regardless of which model you're using.",
      },
    ],
  },

  "bedda-vs-grok": {
    slug: "bedda-vs-grok",
    competitor: "Grok SuperGrok",
    competitorUrl: "https://x.ai",
    competitorPrice: "$30/mo",
    beddaPrice: "$12/mo",
    title: "bedda.ai vs Grok (SuperGrok)",
    metaTitle: "bedda.ai vs Grok SuperGrok (2026) — More Models, 60% Cheaper",
    metaDescription:
      "Compare bedda.ai and Grok SuperGrok. Get Grok 4 PLUS Claude 4, GPT-5, Gemini and 36+ more models for $12/mo — 60% cheaper than SuperGrok. 7-day free trial.",
    ogTitle: "bedda.ai vs Grok SuperGrok — Same Grok, 60% Lower Price",
    ogDescription:
      "Grok SuperGrok costs $30/mo. bedda.ai gives you Grok 4 PLUS Claude 4, GPT-5, Gemini and 36+ more models for just $12/mo.",
    heroHeadline:
      "Grok 4 access — plus Claude, GPT-5, Gemini and 25 more models",
    heroSubtext:
      "SuperGrok charges $30/mo for xAI models only. bedda.ai gives you Grok 4 alongside every other frontier model — for $18 less per month.",
    verdict:
      "bedda.ai costs 60% less than SuperGrok while giving you Grok 4 plus 36+ additional models. There's no scenario where SuperGrok alone makes sense.",
    switchReasons: [
      "Keep Grok 4 access — same model, same capability",
      "Add Claude 4, GPT-5, Gemini 2.5 and DeepSeek to your workflow",
      "Save $18/mo ($216/year) vs SuperGrok",
      "Web search, image generation, and video generation all included",
      "No X/Twitter account required",
    ],
    rows: [
      { feature: "Monthly price", bedda: "$12/mo", competitor: "$30/mo" },
      { feature: "Grok 4 access", bedda: true, competitor: true },
      { feature: "Grok 4 Mini", bedda: true, competitor: true },
      { feature: "Claude 4 Opus + Sonnet", bedda: true, competitor: false },
      { feature: "GPT-5 access", bedda: true, competitor: false },
      { feature: "Gemini 2.5 Pro", bedda: true, competitor: false },
      { feature: "DeepSeek R1", bedda: true, competitor: false },
      { feature: "Image generation", bedda: true, competitor: true },
      { feature: "Video generation", bedda: true, competitor: false },
      { feature: "Code execution", bedda: true, competitor: true },
      { feature: "Web search", bedda: true, competitor: true },
      { feature: "Audio transcription", bedda: true, competitor: false },
      { feature: "Knowledge base (RAG)", bedda: true, competitor: false },
      { feature: "Cross-conversation memory", bedda: true, competitor: false },
      { feature: "Model comparison arena", bedda: true, competitor: false },
      { feature: "X/Twitter account required", bedda: false, competitor: true },
      { feature: "Total AI models", bedda: "36+", competitor: "3" },
    ],
    faq: [
      {
        q: "Is the Grok on bedda.ai the same as SuperGrok?",
        a: "Yes — bedda routes to Grok 4 via xAI's API, the same underlying model. You don't need an X (Twitter) account to use it on bedda.",
      },
      {
        q: "Does bedda.ai have Grok's real-time X/Twitter data?",
        a: "bedda.ai includes general web search via Brave Search. Real-time X/Twitter trending data is a SuperGrok-specific feature tied to X's platform.",
      },
      {
        q: "Why is bedda so much cheaper than SuperGrok?",
        a: "We route via the Vercel AI Gateway at API rates and apply prompt caching (50–90% cost reduction). We pass those savings on instead of charging for platform lock-in.",
      },
      {
        q: "Is there a free tier to try Grok on bedda?",
        a: "The free tier includes access to several models. Grok 4 requires a Plus plan ($12/mo with a 7-day free trial — no credit card required to start).",
      },
    ],
  },

  "bedda-vs-perplexity": {
    slug: "bedda-vs-perplexity",
    competitor: "Perplexity Pro",
    competitorUrl: "https://perplexity.ai",
    competitorPrice: "$20/mo",
    beddaPrice: "$12/mo",
    title: "bedda.ai vs Perplexity Pro",
    metaTitle:
      "bedda.ai vs Perplexity Pro (2026) — AI Chat + Search, 40% Cheaper",
    metaDescription:
      "Compare bedda.ai and Perplexity Pro. Get web search PLUS Claude, GPT-5, Gemini, Grok and 36+ AI models for $12/mo — 40% cheaper than Perplexity Pro. 7-day free trial.",
    ogTitle:
      "bedda.ai vs Perplexity Pro — Web Search + Every AI Model, $8 Less",
    ogDescription:
      "Perplexity Pro costs $20/mo and focuses on AI search. bedda.ai gives you web search PLUS Claude 4, GPT-5, Gemini, Grok and 36+ models for $12/mo.",
    heroHeadline:
      "Perplexity's web search — plus Claude, GPT-5, Gemini and 25 more AI models",
    heroSubtext:
      "Perplexity Pro specializes in AI-powered search at $20/mo. bedda.ai gives you web search inside every frontier AI model — for $8 less per month.",
    verdict:
      "If you use Perplexity for research, bedda.ai gives you the same web search capability inside Claude, GPT-5, and Gemini — plus image generation, code execution, and 36+ models — for 40% less.",
    switchReasons: [
      "Keep real-time web search — available across all models on bedda",
      "Add open-ended chat with Claude 4, GPT-5, Gemini and Grok",
      "Save $8/mo ($96/year) vs Perplexity Pro",
      "Image and video generation Perplexity doesn't offer",
      "Build a personal knowledge base and query your own documents",
    ],
    rows: [
      { feature: "Monthly price", bedda: "$12/mo", competitor: "$20/mo" },
      { feature: "Real-time web search", bedda: true, competitor: true },
      { feature: "Claude 4 Opus + Sonnet", bedda: true, competitor: false },
      { feature: "GPT-5 access", bedda: true, competitor: false },
      { feature: "Gemini 2.5 Pro", bedda: true, competitor: false },
      { feature: "Grok 4", bedda: true, competitor: false },
      { feature: "DeepSeek R1", bedda: true, competitor: false },
      { feature: "Image generation", bedda: true, competitor: false },
      { feature: "Video generation", bedda: true, competitor: false },
      { feature: "Code execution sandbox", bedda: true, competitor: false },
      { feature: "Audio transcription", bedda: true, competitor: false },
      {
        feature: "Knowledge base (upload your docs)",
        bedda: true,
        competitor: false,
      },
      { feature: "Cross-conversation memory", bedda: true, competitor: false },
      { feature: "Model comparison arena", bedda: true, competitor: false },
      { feature: "Team workspaces", bedda: true, competitor: false },
      { feature: "OpenAI-compatible API", bedda: true, competitor: false },
      { feature: "Total AI models", bedda: "36+", competitor: "4" },
    ],
    faq: [
      {
        q: "Does bedda.ai have web search like Perplexity?",
        a: "Yes. bedda.ai has built-in web search (via Brave Search) available to all paid users. Any model — Claude, GPT-5, Gemini — can search the web and cite sources in real time.",
      },
      {
        q: "Is Perplexity better for research?",
        a: "Perplexity is optimized for quick factual lookups with citations. bedda.ai gives you the same web search but also lets you do deep research with Claude or Gemini 2.5 Pro's long-context windows — often producing more nuanced analysis.",
      },
      {
        q: "Can I use multiple AI models on bedda like I can on Perplexity?",
        a: "Yes — bedda.ai gives you 36+ models including Claude, GPT-5, Gemini, Grok, DeepSeek, Mistral and more. Perplexity Pro lets you pick between a limited set of models for their search interface.",
      },
      {
        q: "Does bedda.ai have citations like Perplexity?",
        a: "When using web search on bedda.ai, the AI cites sources inline with links. The format is clean and readable, similar to Perplexity's approach.",
      },
    ],
  },

  "bedda-vs-copilot": {
    slug: "bedda-vs-copilot",
    competitor: "Microsoft Copilot Pro",
    competitorUrl: "https://copilot.microsoft.com",
    competitorPrice: "$20/mo",
    beddaPrice: "$12/mo",
    title: "bedda.ai vs Microsoft Copilot Pro",
    metaTitle:
      "bedda.ai vs Microsoft Copilot Pro (2026) — No Microsoft 365 Required",
    metaDescription:
      "Compare bedda.ai and Copilot Pro. Get Claude, GPT-5, Gemini, Grok and 36+ AI models for $12/mo — no Microsoft 365 subscription needed. 7-day free trial.",
    ogTitle:
      "bedda.ai vs Copilot Pro — More AI Models, Lower Cost, No Office Required",
    ogDescription:
      "Copilot Pro costs $20/mo and ties you to Microsoft's ecosystem. bedda.ai gives you GPT-5 PLUS Claude 4, Gemini, Grok and 36+ models for $12/mo — no Microsoft account needed.",
    heroHeadline:
      "GPT-5 access — plus Claude, Gemini, Grok and 25 more models, no Microsoft required",
    heroSubtext:
      "Copilot Pro costs $20/mo and works best if you already pay for Microsoft 365. bedda.ai gives you GPT-5, Claude, Gemini and every other frontier model — standalone, for $8 less.",
    verdict:
      "Copilot Pro shines for Word and Excel users already in Microsoft's ecosystem. If you want the best AI models for general use without a Microsoft 365 dependency, bedda.ai gives you more for less.",
    switchReasons: [
      "No Microsoft 365 subscription required to get value",
      "Access Claude 4, Gemini 2.5, Grok and DeepSeek alongside GPT-5",
      "Save $8/mo ($96/year) vs Copilot Pro",
      "Video generation, code execution sandbox, and knowledge base built in",
      "Switch models mid-conversation to find the best one for each task",
    ],
    rows: [
      { feature: "Monthly price", bedda: "$12/mo", competitor: "$20/mo" },
      {
        feature: "Microsoft 365 required for full value",
        bedda: false,
        competitor: true,
      },
      { feature: "GPT-5 / GPT-4o access", bedda: true, competitor: true },
      { feature: "Claude 4 Opus + Sonnet", bedda: true, competitor: false },
      { feature: "Gemini 2.5 Pro", bedda: true, competitor: false },
      { feature: "Grok 4", bedda: true, competitor: false },
      { feature: "DeepSeek R1", bedda: true, competitor: false },
      { feature: "Image generation (DALL-E 3)", bedda: true, competitor: true },
      { feature: "Video generation", bedda: true, competitor: false },
      { feature: "Code execution sandbox", bedda: true, competitor: false },
      { feature: "Web search", bedda: true, competitor: true },
      { feature: "Audio transcription", bedda: true, competitor: false },
      { feature: "Knowledge base (RAG)", bedda: true, competitor: false },
      { feature: "Cross-conversation memory", bedda: true, competitor: false },
      { feature: "Model comparison arena", bedda: true, competitor: false },
      { feature: "Team workspaces", bedda: true, competitor: false },
      { feature: "OpenAI-compatible API", bedda: true, competitor: false },
      { feature: "Total AI models", bedda: "36+", competitor: "2" },
    ],
    faq: [
      {
        q: "Does bedda.ai work without a Microsoft account?",
        a: "Yes. bedda.ai is completely standalone — no Microsoft account, no Microsoft 365, no Outlook required. Sign up with any email and start chatting immediately.",
      },
      {
        q: "Can bedda.ai integrate with Word and Excel like Copilot?",
        a: "bedda.ai doesn't plug into the Office ribbon, but you can paste content from Word/Excel into the chat or upload files directly. For teams, bedda has shared workspaces with custom knowledge bases.",
      },
      {
        q: "Is bedda.ai's GPT-5 access the same as Copilot Pro?",
        a: "Yes — bedda routes to GPT-5 via OpenAI's API, the same model. You get the same intelligence without the Microsoft 365 requirement.",
      },
      {
        q: "Does Copilot Pro have a free trial?",
        a: "Microsoft occasionally offers trial periods for Copilot Pro. bedda.ai always offers a 7-day free trial with no credit card required.",
      },
    ],
  },

  "bedda-vs-poe": {
    slug: "bedda-vs-poe",
    competitor: "Poe (Quora)",
    competitorUrl: "https://poe.com",
    competitorPrice: "$19.99/mo",
    beddaPrice: "$12/mo",
    title: "bedda.ai vs Poe (Quora)",
    metaTitle: "bedda.ai vs Poe AI (2026) — No Message Credits, More Models",
    metaDescription:
      "Compare bedda.ai and Poe by Quora. Get Claude, GPT-5, Gemini and 36+ AI models with unlimited messages for $12/mo — no compute credits to burn. 7-day free trial.",
    ogTitle: "bedda.ai vs Poe — Unlimited Messages, 36+ Models, 40% Cheaper",
    ogDescription:
      "Poe Pro costs $19.99/mo and limits premium model usage with compute credits. bedda.ai gives you unlimited access to 36+ frontier models for $12/mo — no credits, no limits.",
    heroHeadline:
      "Every frontier AI model — unlimited, no compute credits, $8 cheaper than Poe",
    heroSubtext:
      "Poe Pro charges $19.99/mo and rations premium models via a compute credit system. bedda.ai gives you unlimited Claude, GPT-5, Gemini, Grok and 36+ models — for $8 less per month.",
    verdict:
      "Poe is a discovery platform for AI bots; bedda.ai is a productivity platform for getting real work done. If you're hitting Poe's credit limits or tired of tracking usage, bedda.ai gives you more models for less money with no metering.",
    switchReasons: [
      "No compute credits — unlimited messages to premium models every month",
      "Save $8/mo ($96/year) vs Poe Pro",
      "Access models Poe doesn't have: DeepSeek R1, Mistral Large, Cerebras Llama",
      "Knowledge base: upload your own documents and query them in any chat",
      "Video generation, code execution, and team workspaces built in",
    ],
    rows: [
      { feature: "Monthly price", bedda: "$12/mo", competitor: "$19.99/mo" },
      {
        feature: "Premium model usage limits",
        bedda: "Unlimited",
        competitor: "Credit-based",
      },
      { feature: "Claude 4 Opus + Sonnet", bedda: true, competitor: true },
      { feature: "GPT-5 / GPT-4o", bedda: true, competitor: true },
      { feature: "Gemini 2.5 Pro", bedda: true, competitor: true },
      { feature: "Grok 4", bedda: true, competitor: true },
      { feature: "DeepSeek R1", bedda: true, competitor: false },
      { feature: "Mistral Large", bedda: true, competitor: false },
      { feature: "Cerebras Llama 3.3", bedda: true, competitor: false },
      { feature: "Image generation", bedda: true, competitor: false },
      { feature: "Video generation", bedda: true, competitor: false },
      { feature: "Code execution sandbox", bedda: true, competitor: false },
      { feature: "Web search", bedda: true, competitor: false },
      { feature: "Audio transcription", bedda: true, competitor: false },
      { feature: "Knowledge base (RAG)", bedda: true, competitor: false },
      { feature: "Cross-conversation memory", bedda: true, competitor: false },
      { feature: "Model comparison arena", bedda: true, competitor: false },
      { feature: "Team workspaces", bedda: true, competitor: false },
      { feature: "OpenAI-compatible API", bedda: true, competitor: false },
      { feature: "Total AI models", bedda: "36+", competitor: "100s (bots)" },
    ],
    faq: [
      {
        q: "Does bedda.ai have a compute credit system like Poe?",
        a: "No. bedda.ai charges a flat monthly fee with no compute credits, no daily caps on premium models, and no surprise overages. $12/mo is $12/mo.",
      },
      {
        q: "Poe has hundreds of AI bots — does bedda have that?",
        a: "bedda.ai focuses on the 36+ best frontier models (Claude, GPT-5, Gemini, Grok, Mistral, DeepSeek, etc.) rather than a bot marketplace. You also get the Plugin Marketplace to add custom tools.",
      },
      {
        q: "Can I use Claude on bedda.ai without compute credit limits?",
        a: "Yes. Claude 4 Opus and Sonnet are available to Plus subscribers with no per-message credit system — just a reasonable daily usage tier that resets every 24 hours.",
      },
      {
        q: "Does bedda.ai have a free tier like Poe?",
        a: "Yes. bedda.ai has a free tier with 500 messages/month across a selection of models. The Plus plan ($12/mo) unlocks all 36+ models and premium features with a 7-day free trial.",
      },
    ],
  },

  "bedda-vs-mistral": {
    slug: "bedda-vs-mistral",
    competitor: "Mistral Le Chat Pro",
    competitorUrl: "https://chat.mistral.ai",
    competitorPrice: "$14.99/mo",
    beddaPrice: "$12/mo",
    title: "bedda.ai vs Mistral Le Chat",
    metaTitle:
      "bedda.ai vs Mistral Le Chat Pro (2026) — 36+ Models vs Mistral Only",
    metaDescription:
      "Compare bedda.ai and Mistral Le Chat Pro. Get Mistral Large PLUS Claude 4, GPT-5, Gemini, Grok and 36+ models for $12/mo — $3 cheaper than Le Chat Pro alone. 7-day free trial.",
    ogTitle:
      "bedda.ai vs Mistral Le Chat — Same Mistral + 35 More Models, $3 Cheaper",
    ogDescription:
      "Mistral Le Chat Pro is $14.99/mo for Mistral models only. bedda.ai gives you Mistral Large + Claude 4, GPT-5, Gemini, Grok and 36+ models for $12/mo.",
    heroHeadline:
      "Mistral Large plus every other frontier AI — for $3 less than Le Chat Pro",
    heroSubtext:
      "Mistral Le Chat Pro gives you Mistral's models for $14.99/mo. bedda.ai includes Mistral Large alongside Claude 4, GPT-5, Gemini 2.5 Pro, Grok 4 and 36+ models total — for $2.99 less per month.",
    verdict:
      "Le Chat Pro is a fast, clean chat experience built around Mistral's own models — great if you specifically want Mistral's European-hosted inference. But if you want Mistral's models AND the ability to switch to Claude 4, GPT-5, or Gemini mid-conversation, bedda.ai gives you all of that for $3 less per month.",
    switchReasons: [
      "Access Mistral Large + Claude 4, GPT-5, Gemini, Grok and 36+ models in one app",
      "Save $3/mo ($36/year) vs Le Chat Pro — more models for less",
      "Switch models mid-conversation: start with Mistral, continue with Claude 4",
      "Video generation, knowledge base, code execution and model comparison arena",
      "7-day free trial — no credit card required to test all 36+ models",
    ],
    rows: [
      { feature: "Monthly price", bedda: "$12/mo", competitor: "$14.99/mo" },
      { feature: "Mistral Large", bedda: true, competitor: true },
      { feature: "Mistral Small (fast)", bedda: true, competitor: true },
      { feature: "Claude 4 Opus + Sonnet", bedda: true, competitor: false },
      { feature: "GPT-5 / GPT-4o", bedda: true, competitor: false },
      { feature: "Gemini 2.5 Pro", bedda: true, competitor: false },
      { feature: "Grok 4", bedda: true, competitor: false },
      { feature: "DeepSeek R1", bedda: true, competitor: false },
      { feature: "Real-time web search", bedda: true, competitor: true },
      {
        feature: "Image generation",
        bedda: true,
        competitor: "Limited",
      },
      { feature: "Video generation", bedda: true, competitor: false },
      { feature: "Code execution sandbox", bedda: true, competitor: false },
      { feature: "Knowledge base (RAG)", bedda: true, competitor: false },
      { feature: "Cross-conversation memory", bedda: true, competitor: false },
      { feature: "Model comparison arena", bedda: true, competitor: false },
      { feature: "Team workspaces", bedda: true, competitor: false },
      { feature: "OpenAI-compatible API", bedda: true, competitor: false },
      { feature: "European data hosting", bedda: false, competitor: true },
      { feature: "Total AI models", bedda: "36+", competitor: "~4" },
    ],
    faq: [
      {
        q: "Does bedda.ai include Mistral models?",
        a: "Yes. bedda.ai includes Mistral Large and Mistral Small via the Vercel AI Gateway. You get the same Mistral models as Le Chat Pro, plus Claude 4, GPT-5, Gemini, Grok, DeepSeek and 30+ more — all in one interface.",
      },
      {
        q: "Is Mistral Le Chat better than bedda.ai for European privacy?",
        a: "Mistral hosts inference infrastructure in Europe, which makes Le Chat a strong choice if EU data residency is a strict requirement. bedda.ai routes through the Vercel AI Gateway and does not currently offer EU-region data residency guarantees — so for GDPR-sensitive enterprise workloads, Le Chat has an advantage.",
      },
      {
        q: "Why use bedda.ai over Le Chat if both have Mistral?",
        a: "Le Chat is optimized for Mistral's own models. bedda.ai lets you use Mistral as one of 36+ options — switch to Claude 4 for nuanced reasoning, GPT-5 for coding, or Gemini for multimodal tasks, all within the same conversation history.",
      },
      {
        q: "Does bedda.ai have a free tier like Le Chat?",
        a: "Yes. bedda.ai's free tier includes 500 messages/month across a selection of models including Mistral Small and other fast models. The Plus plan ($12/mo) unlocks all 36+ models including Mistral Large, Claude 4 Opus, and GPT-5.",
      },
    ],
  },

  "bedda-vs-t3chat": {
    slug: "bedda-vs-t3chat",
    competitor: "T3 Chat",
    competitorUrl: "https://t3.gg/chat",
    competitorPrice: "$8/mo",
    beddaPrice: "$12/mo",
    title: "bedda.ai vs T3 Chat",
    metaTitle: "bedda.ai vs T3 Chat (2026) — More Models, More Tools",
    metaDescription:
      "Compare bedda.ai and T3 Chat. Both offer flat-rate unlimited AI chat. bedda adds 36+ models, code execution, image/video generation, knowledge base, and team workspaces — for $4 more. 7-day free trial.",
    ogTitle: "bedda.ai vs T3 Chat — Flat-Rate AI with More Models and Tools",
    ogDescription:
      "T3 Chat is $8/mo for a handful of models. bedda.ai is $12/mo for 36+ models including Claude 4, GPT-5, Gemini 2.5 Pro, Grok 4, plus code execution, image gen, and team workspaces.",
    heroHeadline: "Same flat-rate idea — 4× more models and a full toolset",
    heroSubtext:
      "T3 Chat is a clean, fast AI chat app. bedda.ai does the same thing and adds 36+ models, code execution, image and video generation, a knowledge base, and team workspaces — for $4 more per month.",
    verdict:
      "T3 Chat is a solid, affordable option if you mainly need Claude Sonnet or GPT-4o in a fast interface. bedda.ai is the better pick if you want to mix models, run code, generate images and video, or collaborate with a team — the $4/mo difference pays for itself quickly.",
    switchReasons: [
      "Access 36+ frontier models — not just Claude and GPT-4o",
      "Built-in code execution sandbox (Python and JavaScript via E2B)",
      "Image generation (DALL-E 3, Imagen 3, Flux) and video generation",
      "Knowledge base — upload docs and reference them across all conversations",
      "Team workspaces with shared chat threads and real-time collaboration",
      "Model comparison arena — run your prompt against 4 models simultaneously",
    ],
    rows: [
      { feature: "Monthly price", bedda: "$12/mo", competitor: "$8/mo" },
      { feature: "Claude 4 Sonnet", bedda: true, competitor: true },
      { feature: "Claude 4 Opus", bedda: true, competitor: false },
      { feature: "GPT-5 / GPT-4o", bedda: true, competitor: true },
      {
        feature: "Gemini 2.5 Pro (1M context)",
        bedda: true,
        competitor: false,
      },
      { feature: "Grok 4", bedda: true, competitor: false },
      { feature: "DeepSeek R1", bedda: true, competitor: false },
      { feature: "Mistral Large", bedda: true, competitor: false },
      { feature: "Groq (fast inference)", bedda: true, competitor: false },
      { feature: "Code execution sandbox", bedda: true, competitor: false },
      { feature: "Image generation", bedda: true, competitor: false },
      { feature: "Video generation", bedda: true, competitor: false },
      { feature: "Web search", bedda: true, competitor: true },
      { feature: "Knowledge base (RAG)", bedda: true, competitor: false },
      { feature: "Cross-conversation memory", bedda: true, competitor: false },
      { feature: "Model comparison arena", bedda: true, competitor: false },
      { feature: "Team workspaces", bedda: true, competitor: false },
      { feature: "OpenAI-compatible API", bedda: true, competitor: false },
      { feature: "Total AI models", bedda: "36+", competitor: "~6" },
    ],
    faq: [
      {
        q: "Is T3 Chat worth it?",
        a: "T3 Chat is a well-designed, affordable AI chat app. At $8/mo it's a great deal if you primarily use Claude Sonnet and GPT-4o. If you want access to Gemini 2.5 Pro, Grok 4, DeepSeek R1, or tools like code execution and image generation, bedda.ai at $12/mo is the better fit.",
      },
      {
        q: "Who made T3 Chat?",
        a: "T3 Chat was built by Theo (Theodorus Browne), a popular developer and content creator known for the T3 stack (TypeScript, Tailwind, tRPC). It launched in 2025 and gained traction in developer circles for its clean UI and flat-rate pricing.",
      },
      {
        q: "Does bedda.ai have the same models as T3 Chat?",
        a: "bedda.ai includes all the models T3 Chat offers (Claude Sonnet, GPT-4o) plus many more: Claude 4 Opus, GPT-5, Gemini 2.5 Pro, Grok 4, DeepSeek R1, Mistral Large, Groq Llama, and Cerebras. You're getting a superset.",
      },
      {
        q: "What does bedda.ai have that T3 Chat doesn't?",
        a: "Code execution (Python/JS sandbox), image generation (DALL-E 3, Imagen 3, Flux), video generation (Kling), knowledge base RAG, cross-conversation memory, model comparison arena, team workspaces with real-time collaboration, and an OpenAI-compatible API.",
      },
    ],
  },

  "bedda-vs-meta-ai": {
    slug: "bedda-vs-meta-ai",
    competitor: "Meta AI",
    competitorUrl: "https://meta.ai",
    competitorPrice: "Free",
    beddaPrice: "$12/mo",
    title: "bedda.ai vs Meta AI",
    metaTitle:
      "bedda.ai vs Meta AI (2026) — Why Paid Beats Free for Serious Work",
    metaDescription:
      "Meta AI is free but limited to Llama models. bedda.ai gives you Claude 4, GPT-5, Gemini 2.5 Pro, Grok 4 and 36+ frontier models with code execution, RAG, and team workspaces — $12/mo.",
    ogTitle: "bedda.ai vs Meta AI — Claude + GPT-5 + Gemini vs Llama Only",
    ogDescription:
      "Meta AI is free and convenient for casual queries. bedda.ai gives you every frontier model — Claude 4, GPT-5, Gemini 2.5 Pro, Grok 4, DeepSeek R1 — plus tools like code execution, knowledge base, and video generation, for $12/mo.",
    heroHeadline: "Meta AI is free. bedda.ai gives you every frontier model.",
    heroSubtext:
      "Meta AI is convenient for quick questions inside WhatsApp or Instagram. For serious work — research, coding, writing, analysis — you need Claude 4, GPT-5, and Gemini 2.5 Pro. bedda.ai gives you all 36+ frontier models for $12/mo.",
    verdict:
      "Meta AI is excellent for quick, casual queries and it costs nothing. If you're doing serious work — coding, research, content creation, data analysis — you'll hit its limits quickly. bedda.ai's $12/mo gives you every frontier model with professional tools that Meta AI simply doesn't offer.",
    switchReasons: [
      "Access Claude 4 Opus, GPT-5, and Gemini 2.5 Pro — not just Llama",
      "Run code in a real E2B sandbox — not simulated output",
      "Upload documents to a knowledge base and reference across conversations",
      "Generate images with DALL-E 3, Imagen 3, or Flux (not just text)",
      "Compare models side-by-side in the arena for important decisions",
      "Team workspaces for collaborative AI workflows",
    ],
    rows: [
      { feature: "Monthly price", bedda: "$12/mo", competitor: "Free" },
      { feature: "Claude 4 (Opus, Sonnet)", bedda: true, competitor: false },
      { feature: "GPT-5 / GPT-4o", bedda: true, competitor: false },
      { feature: "Gemini 2.5 Pro", bedda: true, competitor: false },
      { feature: "Grok 4", bedda: true, competitor: false },
      { feature: "Llama 3.3 / Llama 4", bedda: true, competitor: true },
      { feature: "DeepSeek R1", bedda: true, competitor: false },
      { feature: "Code execution sandbox", bedda: true, competitor: false },
      { feature: "Web search", bedda: true, competitor: true },
      {
        feature: "Image generation",
        bedda: true,
        competitor: "Basic (Imagine)",
      },
      { feature: "Video generation", bedda: true, competitor: false },
      { feature: "Knowledge base (RAG)", bedda: true, competitor: false },
      { feature: "Cross-conversation memory", bedda: true, competitor: false },
      { feature: "Model comparison arena", bedda: true, competitor: false },
      { feature: "Team workspaces", bedda: true, competitor: false },
      { feature: "OpenAI-compatible API", bedda: true, competitor: false },
      {
        feature: "Available in WhatsApp/Instagram",
        bedda: false,
        competitor: true,
      },
      { feature: "Total AI models", bedda: "36+", competitor: "1 (Llama)" },
    ],
    faq: [
      {
        q: "Is Meta AI good enough for serious work?",
        a: "Meta AI is great for casual questions, quick lookups, and social integrations. For professional work — coding, research, long-form writing, data analysis — you'll want access to Claude 4, GPT-5, or Gemini 2.5 Pro, which offer significantly higher reasoning, context windows, and accuracy.",
      },
      {
        q: "Why would I pay $12/mo when Meta AI is free?",
        a: "You're paying for Claude 4 Opus, GPT-5, Gemini 2.5 Pro, and 33 other frontier models — plus code execution, knowledge base RAG, team workspaces, and video generation. If your work depends on AI output quality, the productivity gain from better models easily justifies the cost.",
      },
      {
        q: "Can bedda.ai access Meta's Llama models?",
        a: "Yes. bedda.ai includes Llama 3.3 70B (via Groq for fast inference and Cerebras for ultra-fast responses) alongside all commercial frontier models. You can use Llama inside bedda.ai too.",
      },
      {
        q: "Will Meta AI ever have a paid plan with better models?",
        a: "Meta has not announced a paid AI subscription as of 2026. Meta AI is bundled with Meta's social platforms. If you want frontier models beyond Llama, you need a separate service like bedda.ai.",
      },
    ],
  },

  "bedda-vs-chatgpt-team": {
    slug: "bedda-vs-chatgpt-team",
    competitor: "ChatGPT Team",
    competitorUrl: "https://openai.com/chatgpt/team",
    competitorPrice: "$25–$30/user/mo",
    beddaPrice: "$12/mo",
    title: "bedda.ai vs ChatGPT Team",
    metaTitle:
      "bedda.ai vs ChatGPT Team (2026) — Full AI Suite vs OpenAI Team Plan",
    metaDescription:
      "Compare bedda.ai and ChatGPT Team. ChatGPT Team gives you GPT-5 for $25–$30/user/mo. bedda.ai gives you GPT-5, Claude Opus, Gemini and 33 more models plus team features — for $12/mo.",
    ogTitle:
      "bedda.ai vs ChatGPT Team — 36+ Models for $12 vs OpenAI Only for $25–$30/user",
    ogDescription:
      "ChatGPT Team costs $25–$30/user/month and locks you into OpenAI. bedda.ai Teams gives your whole team Claude Opus 4.8, GPT-5, Gemini 2.5 Pro, and 33 more models — with a shared knowledge base and team workspaces — for a fraction of the cost.",
    heroHeadline: "Team AI with every model — not just ChatGPT",
    heroSubtext:
      "ChatGPT Team is $25–$30/user/month and limited to OpenAI&apos;s models. bedda.ai Teams gives your team GPT-5, Claude Opus 4.8, Gemini 2.5 Pro, Grok 4, and 32 more models — plus a shared knowledge base, team workspaces, and usage analytics — starting at $12/mo per user.",
    verdict:
      "ChatGPT Team is the right choice if your team is fully standardized on OpenAI and wants GPT-5 with data privacy guarantees and team-level admin controls within the OpenAI ecosystem. bedda.ai Teams is the right choice when you want multi-model access, a shared knowledge base, and team collaboration features — at roughly half the per-user price.",
    switchReasons: [
      "Save $13–$18/user/mo — bedda.ai at $12/mo vs ChatGPT Team at $25–$30/user",
      "Not locked into OpenAI — use Claude, Gemini, Grok, and 33 more models",
      "Shared team knowledge base (RAG) for consistent context across the team",
      "Model arena to compare outputs from multiple models simultaneously",
      "Team usage analytics and role-based model access controls",
    ],
    rows: [
      {
        feature: "Monthly price per user",
        bedda: "$12/mo",
        competitor: "$25–$30/user",
      },
      { feature: "GPT-5 access", bedda: true, competitor: true },
      {
        feature: "Claude Opus 4.8 / Gemini 2.5 Pro / Grok 4",
        bedda: true,
        competitor: false,
      },
      {
        feature: "Total AI models",
        bedda: "36+",
        competitor: "OpenAI models only",
      },
      {
        feature: "Shared team knowledge base (RAG)",
        bedda: true,
        competitor: false,
      },
      { feature: "Team chat sharing", bedda: true, competitor: true },
      {
        feature: "Admin controls & usage analytics",
        bedda: true,
        competitor: true,
      },
      { feature: "Model comparison arena", bedda: true, competitor: false },
      { feature: "Image generation (DALL-E 3)", bedda: true, competitor: true },
      { feature: "Web search", bedda: true, competitor: true },
      { feature: "OpenAI-compatible API", bedda: true, competitor: true },
      {
        feature: "Custom GPTs / system prompts",
        bedda: true,
        competitor: true,
      },
    ],
    faq: [
      {
        q: "What is ChatGPT Team?",
        a: "ChatGPT Team is OpenAI&apos;s business plan at $25/user/month (annual) or $30/user/month (monthly). It provides GPT-5 access, higher message limits, data privacy (conversations not used for training), team workspaces, and admin controls. It&apos;s limited to OpenAI&apos;s own model family.",
      },
      {
        q: "Does bedda.ai include GPT-5?",
        a: "Yes. bedda.ai includes GPT-5 along with Claude Opus 4.8, Gemini 2.5 Pro, Grok 4, DeepSeek R1, Mistral Large, and 30+ more models. bedda.ai Teams adds shared workspaces, a team knowledge base, and usage analytics.",
      },
      {
        q: "How do bedda.ai Teams features compare to ChatGPT Team?",
        a: "Both offer team workspaces, admin controls, and shared resources. bedda.ai Teams adds a shared knowledge base (RAG) so your team&apos;s AI can reference your company documents, model comparison arena for side-by-side outputs, and access to 36+ models from multiple providers instead of just OpenAI.",
      },
      {
        q: "Is my data private on bedda.ai?",
        a: "bedda.ai passes requests directly to model providers (OpenAI, Anthropic, Google, etc.) via their API — API requests are not used to train any models. Your team&apos;s conversations are stored for chat history and are not used for AI training.",
      },
    ],
  },

  "bedda-vs-typingmind": {
    slug: "bedda-vs-typingmind",
    competitor: "TypingMind",
    competitorUrl: "https://typingmind.com",
    competitorPrice: "$9-39/mo",
    beddaPrice: "$12/mo",
    title: "bedda.ai vs TypingMind",
    metaTitle:
      "bedda.ai vs TypingMind (2026) — Multi-Model AI Platform vs ChatGPT UI Wrapper",
    metaDescription:
      "Compare bedda.ai and TypingMind. bedda.ai is a $12/mo multi-model AI subscription with 36+ models, billing included. TypingMind ($9-39/mo) is a ChatGPT interface that requires your own OpenAI API key on top of the subscription fee.",
    ogTitle:
      "bedda.ai vs TypingMind — $12/mo All-Inclusive vs $9-39/mo + Your Own API Key",
    ogDescription:
      "TypingMind is a polished ChatGPT interface — but you need to supply your own OpenAI API key, so you pay TypingMind PLUS your OpenAI usage costs. bedda.ai includes 36+ models in the $12/mo subscription with no API keys needed.",
    heroHeadline:
      "All-inclusive multi-model subscription vs a UI wrapper that requires your own API key",
    heroSubtext:
      "TypingMind is a well-designed ChatGPT and Claude interface — great UI, personas, chat organization, and prompt templates. But it&apos;s a bring-your-own-API-key product, which means you pay the TypingMind subscription fee AND your OpenAI or Anthropic API usage costs separately. bedda.ai includes 36+ models in the $12/mo price — no API keys, no per-token billing, no surprise invoices.",
    verdict:
      "TypingMind is a good product for power users who already have API keys and want a better interface than ChatGPT.com. But the total cost of TypingMind + API usage often exceeds bedda.ai&apos;s $12/mo flat rate — especially for heavy users. bedda.ai also includes models TypingMind doesn&apos;t support natively (Grok 4, Cerebras, Groq) and features like image generation, video generation, knowledge base RAG, and team workspaces. For most users who want to simply pay one price and use frontier AI, bedda.ai is the cleaner, lower-cost choice.",
    switchReasons: [
      "No API key required — all 36+ models included in the $12/mo subscription",
      "No per-token API costs on top of your subscription fee",
      "Grok 4, Cerebras, Groq, and image/video generation not available in TypingMind",
      "Knowledge base RAG, team workspaces, and platform bots (Slack, Discord, etc.)",
      "Total cost is lower for heavy users vs TypingMind + API bill",
    ],
    rows: [
      {
        feature: "Monthly price",
        bedda: "$12/mo all-in",
        competitor: "$9-39/mo + API costs",
      },
      { feature: "API key required", bedda: false, competitor: true },
      { feature: "36+ AI models included", bedda: true, competitor: false },
      {
        feature: "GPT-5 / Claude / Gemini access",
        bedda: true,
        competitor: "BYOK only",
      },
      { feature: "Grok 4 / Groq / Cerebras", bedda: true, competitor: false },
      { feature: "Image generation", bedda: true, competitor: false },
      { feature: "Video generation", bedda: true, competitor: false },
      { feature: "Knowledge base RAG", bedda: true, competitor: false },
      { feature: "Team workspaces", bedda: true, competitor: true },
      { feature: "Prompt library", bedda: true, competitor: true },
      { feature: "Persona / character mode", bedda: false, competitor: true },
      {
        feature: "Platform bots (Slack, Discord)",
        bedda: true,
        competitor: false,
      },
    ],
    faq: [
      {
        q: "What is TypingMind?",
        a: "TypingMind is a third-party web interface for ChatGPT and other AI models. It provides a more organized and feature-rich chat experience than ChatGPT.com — with folders, personas, prompt templates, and better chat history management. TypingMind requires you to bring your own OpenAI, Anthropic, or other API key. You pay TypingMind a monthly subscription ($9-39/mo) AND your API provider for actual usage (OpenAI charges per token). The two costs are separate.",
      },
      {
        q: "Is TypingMind cheaper than bedda.ai?",
        a: "At face value, TypingMind Personal ($9/mo) looks cheaper than bedda.ai ($12/mo). But TypingMind doesn't include any AI usage — you need to pay OpenAI or Anthropic separately for every message you send. A moderate ChatGPT user spending ~$10-15/mo on API costs is actually paying $19-24/mo total for TypingMind + API. bedda.ai's $12/mo includes all AI usage with no per-token billing.",
      },
      {
        q: "Does TypingMind include Grok or other models besides OpenAI and Anthropic?",
        a: "TypingMind supports any OpenAI-compatible API endpoint, so you can connect it to various providers. However, you need API access and keys for each provider separately. bedda.ai includes Grok 4, Groq Llama, Cerebras, Mistral, DeepSeek, Google Gemini, and more natively — no separate API accounts required.",
      },
      {
        q: "What does bedda.ai have that TypingMind doesn't?",
        a: "bedda.ai includes image generation (DALL-E 3, Imagen 3), video generation (Kling), knowledge base RAG for uploading documents, cross-conversation memory, team workspaces with shared projects, platform bots for Slack, Discord, GitHub, and Telegram, and an Image Studio and Video Studio. TypingMind focuses on chat organization and personas but doesn't include these adjacent AI capabilities.",
      },
    ],
  },
  "bedda-vs-le-chat": {
    slug: "bedda-vs-le-chat",
    competitor: "Le Chat (Mistral)",
    competitorUrl: "https://chat.mistral.ai",
    competitorPrice: "$14.99/mo",
    beddaPrice: "$12/mo",
    title: "bedda.ai vs Le Chat",
    metaTitle:
      "bedda.ai vs Le Chat by Mistral (2026) — 36+ Models vs Mistral-Only",
    metaDescription:
      "Compare bedda.ai and Le Chat Pro. Le Chat is Mistral's consumer product at $14.99/mo — Mistral models only. bedda.ai gives you Mistral PLUS GPT-5, Claude, Gemini, and 36+ models for $12/mo.",
    ogTitle: "bedda.ai vs Le Chat — 36+ Models for $12 vs Mistral-Only for $15",
    ogDescription:
      "Le Chat Pro costs $14.99/mo and locks you into Mistral models only. bedda.ai is $12/mo with Mistral Large, Mistral Small, PLUS GPT-5, Claude Opus 4.8, Gemini 2.5 Pro, Grok 4, and 32+ more.",
    heroHeadline:
      "36+ frontier models for $12/mo vs Mistral-only subscription for $14.99/mo",
    heroSubtext:
      "Le Chat Pro is Mistral AI's official consumer product — a polished interface for Mistral Large, Mistral Small, and Pixtral models. At $14.99/mo, it's a solid option if you only need Mistral models. bedda.ai is $12/mo and gives you Mistral Large and Mistral Small alongside GPT-5, Claude Opus 4.8, Gemini 2.5 Pro, Grok 4, DeepSeek R1, and 30+ other frontier models.",
    verdict:
      "Le Chat Pro is the right choice if you're a committed Mistral user who prefers Mistral's European AI principles and privacy approach. bedda.ai is the better value if you want Mistral PLUS the best models from every other provider — at $2.99/mo less.",
    switchReasons: [
      "$12/mo vs $14.99/mo — save $36/year",
      "Mistral Large + Small included, PLUS 34+ other models",
      "GPT-5, Claude Opus 4.8, Gemini 2.5 Pro, Grok 4 in one subscription",
      "Web search, image generation, code execution, and knowledge base RAG",
      "Model comparison arena to benchmark Mistral vs GPT-5 vs Claude",
      "7-day free trial, no credit card required",
    ],
    rows: [
      { feature: "Monthly price", bedda: "$12/mo", competitor: "$14.99/mo" },
      { feature: "GPT-5 access", bedda: true, competitor: false },
      { feature: "Claude Opus 4.8", bedda: true, competitor: false },
      { feature: "Gemini 2.5 Pro", bedda: true, competitor: false },
      { feature: "Mistral Large", bedda: true, competitor: true },
      { feature: "Mistral Small", bedda: true, competitor: true },
      { feature: "36+ total models", bedda: true, competitor: false },
      { feature: "Web search", bedda: true, competitor: true },
      { feature: "Image generation", bedda: true, competitor: true },
      { feature: "Knowledge base RAG", bedda: true, competitor: false },
      { feature: "Model comparison arena", bedda: true, competitor: false },
      { feature: "7-day free trial", bedda: true, competitor: false },
    ],
    faq: [
      {
        q: "What is Le Chat?",
        a: "Le Chat is Mistral AI's official consumer-facing chat product. Le Chat Pro ($14.99/mo) gives unlimited access to Mistral's models — Mistral Large 2, Mistral Small, Pixtral (vision), and Codestral (coding). It also includes web search and image generation via Black Forest Labs' Flux model. Le Chat is popular in Europe and appeals to users who value Mistral's EU-based AI principles.",
      },
      {
        q: "Does bedda.ai include Mistral models?",
        a: "Yes. bedda.ai includes Mistral Large and Mistral Small — the same flagship models you get in Le Chat Pro — alongside GPT-5, Claude Opus 4.8, Gemini 2.5 Pro, Grok 4, and 30+ other frontier models. bedda.ai is $2.99/mo cheaper than Le Chat Pro while giving you access to every major provider.",
      },
      {
        q: "Is Le Chat or bedda.ai better for European privacy?",
        a: "Le Chat processes data on Mistral's EU-based infrastructure, which appeals to users with EU data residency requirements. bedda.ai routes requests through Vercel's AI Gateway with Anthropic, OpenAI, and Google as providers — data handling varies by model provider. If strict EU data residency is a legal requirement for your organization, Le Chat's EU-first infrastructure is a meaningful differentiator.",
      },
      {
        q: "Which has better image generation?",
        a: "Both platforms offer image generation. bedda.ai provides DALL-E 3 (OpenAI), Imagen 3 (Google), and Flux 1.1 Pro (Black Forest Labs). Le Chat Pro uses Flux for image generation. bedda.ai gives you more model options for image generation.",
      },
    ],
  },

  "bedda-vs-magai": {
    slug: "bedda-vs-magai",
    competitor: "Magai",
    competitorUrl: "https://magai.co",
    competitorPrice: "$9–$25/mo",
    beddaPrice: "$12/mo",
    title: "bedda.ai vs Magai",
    metaTitle:
      "bedda.ai vs Magai (2026) — More Models, Better Tools, Same Price Range",
    metaDescription:
      "Compare bedda.ai and Magai — both offer multi-model AI chat. bedda adds code execution, video generation, team workspaces, and a knowledge base at $12/mo. 7-day free trial.",
    ogTitle: "bedda.ai vs Magai — Flat-Rate Multi-Model AI Compared",
    ogDescription:
      "Magai is $9-25/mo for multi-model AI chat. bedda.ai is $12/mo with 36+ models, code execution, image & video generation, knowledge base RAG, and team workspaces.",
    heroHeadline: "Both are flat-rate multi-model chat — bedda has more tools",
    heroSubtext:
      "Magai and bedda.ai both offer flat-rate access to multiple frontier models. bedda adds code execution, video generation, a knowledge base, team workspaces, and platform bots (Slack, Discord, Telegram) — all for $12/mo.",
    verdict:
      "Magai is a solid multi-model chat interface, especially if you want persona management and a personal assistant feel. bedda.ai has more frontier models, more tools (code execution, video gen, RAG), and team collaboration features — at a similar price point. If you need more than chat, bedda wins clearly.",
    switchReasons: [
      "36+ frontier models including Grok 4, o3, Gemini 2.5 Pro, and DeepSeek R1",
      "Real code execution sandbox (Python and JavaScript via E2B)",
      "Image generation (DALL-E 3, Imagen 3, Flux) and video generation (Kling)",
      "Knowledge base — upload and search documents across all chats",
      "Team workspaces with real-time collaboration and shared threads",
      "Platform bots — Slack, Discord, Telegram, GitHub, Microsoft Teams, WhatsApp",
    ],
    rows: [
      { feature: "Monthly price", bedda: "$12/mo", competitor: "$9–$25/mo" },
      { feature: "Claude 4 (Opus, Sonnet)", bedda: true, competitor: true },
      { feature: "GPT-5 / GPT-4o", bedda: true, competitor: true },
      {
        feature: "Gemini 2.5 Pro (1M context)",
        bedda: true,
        competitor: "Limited",
      },
      { feature: "Grok 4", bedda: true, competitor: false },
      { feature: "o3 reasoning model", bedda: true, competitor: false },
      { feature: "DeepSeek R1", bedda: true, competitor: false },
      { feature: "Mistral Large", bedda: true, competitor: true },
      { feature: "Code execution sandbox", bedda: true, competitor: false },
      { feature: "Image generation", bedda: true, competitor: false },
      { feature: "Video generation", bedda: true, competitor: false },
      { feature: "Web search", bedda: true, competitor: true },
      { feature: "Knowledge base (RAG)", bedda: true, competitor: false },
      { feature: "Cross-conversation memory", bedda: true, competitor: true },
      { feature: "Model comparison arena", bedda: true, competitor: false },
      { feature: "Team workspaces", bedda: true, competitor: false },
      {
        feature: "Platform bots (Slack, Discord, etc.)",
        bedda: true,
        competitor: false,
      },
      { feature: "OpenAI-compatible API", bedda: true, competitor: false },
      { feature: "Total AI models", bedda: "36+", competitor: "~20" },
    ],
    faq: [
      {
        q: "What is Magai?",
        a: "Magai (magai.co) is a multi-model AI chat platform that offers access to models from OpenAI, Anthropic, Google, and others via a single subscription. It's known for its persona management system (creating named AI assistants with custom system prompts) and a clean chat interface. Plans start at $9/mo.",
      },
      {
        q: "Is Magai cheaper than bedda.ai?",
        a: "Magai's entry plan starts at $9/mo versus bedda.ai's $12/mo. However, Magai's $9 plan has usage limits and fewer models. bedda.ai's $12/mo plan includes all 36+ models with no per-message caps, plus tools (code execution, image gen, video gen, knowledge base) that Magai doesn't offer.",
      },
      {
        q: "Does bedda.ai have the same models as Magai?",
        a: "bedda.ai includes all the major models Magai offers (Claude 4, GPT-5, Gemini) plus additional ones: Grok 4, OpenAI o3, DeepSeek R1, Cerebras, Groq, and more. bedda's 36+ model count is broader than Magai's lineup.",
      },
      {
        q: "Which is better for teams — Magai or bedda.ai?",
        a: "bedda.ai is better for teams. It has dedicated team workspaces, real-time collaborative editing, shared knowledge bases, model access policies, and platform bots for Slack, Discord, and Microsoft Teams. Magai is primarily designed for individual users.",
      },
    ],
  },

  "bedda-vs-deepseek": {
    slug: "bedda-vs-deepseek",
    competitor: "DeepSeek",
    competitorUrl: "https://chat.deepseek.com",
    competitorPrice: "Free",
    beddaPrice: "$12/mo",
    title: "bedda.ai vs DeepSeek",
    metaTitle:
      "bedda.ai vs DeepSeek (2026) — Multi-Model Platform vs Single Model Chat",
    metaDescription:
      "DeepSeek Chat is free but limited to one model. bedda.ai is $12/mo for 36+ frontier models including GPT-5, Claude Opus, Gemini 2.5 Pro, Grok 4, and DeepSeek itself.",
    ogTitle: "bedda.ai vs DeepSeek — One Model vs 36+ Frontier Models",
    ogDescription:
      "DeepSeek offers a free chat interface for its own models. bedda.ai gives you DeepSeek R1, DeepSeek V3, GPT-5, Claude Opus 4.8, Gemini 2.5 Pro, and 30+ more — all in one subscription for $12/mo.",
    heroHeadline: "One model for free vs every top model for $12/mo",
    heroSubtext:
      "DeepSeek Chat is impressive and free — but it only gives you DeepSeek's models. bedda.ai includes DeepSeek R1, DeepSeek V3, plus GPT-5, Claude Opus 4.8, Gemini 2.5 Pro, and 30+ frontier models in one $12/month subscription.",
    verdict:
      "DeepSeek is a great free option if you only need DeepSeek's models. But for serious work, you'll quickly find yourself needing Claude's nuance for writing, GPT-5's coding ability, or Gemini's multimodal power. bedda.ai at $12/mo gives you all of them — including both DeepSeek R1 and V3 — in one place. For anyone who bounces between AI tools, bedda.ai pays for itself in convenience alone.",
    switchReasons: [
      "Access DeepSeek R1 and V3 alongside GPT-5, Claude, Gemini, and Grok — all in one tab",
      "36+ frontier models — not locked into one provider's lineup",
      "Web search, knowledge base, and code execution built in",
      "Team workspaces and chat history across all models",
      "Model comparison arena — run the same prompt across 4 models side by side",
      "No data sent to a single provider — route sensitive prompts to your preferred model",
    ],
    rows: [
      { feature: "Monthly price", bedda: "$12/mo", competitor: "Free" },
      { feature: "DeepSeek R1", bedda: true, competitor: true },
      { feature: "DeepSeek V3", bedda: true, competitor: true },
      { feature: "GPT-5", bedda: true, competitor: false },
      { feature: "Claude Opus 4.8", bedda: true, competitor: false },
      { feature: "Gemini 2.5 Pro", bedda: true, competitor: false },
      { feature: "Grok 4", bedda: true, competitor: false },
      { feature: "Web search", bedda: true, competitor: true },
      { feature: "Code execution sandbox", bedda: true, competitor: false },
      { feature: "Knowledge base (RAG)", bedda: true, competitor: false },
      { feature: "Model comparison arena", bedda: true, competitor: false },
      { feature: "Team workspaces", bedda: true, competitor: false },
      { feature: "File uploads and analysis", bedda: true, competitor: true },
      { feature: "API access", bedda: true, competitor: "Via DeepSeek API" },
      {
        feature: "Total AI models",
        bedda: "36+",
        competitor: "2 (DeepSeek only)",
      },
    ],
    faq: [
      {
        q: "Is DeepSeek Chat really free?",
        a: "Yes. DeepSeek Chat at chat.deepseek.com is free to use with generous daily limits. It provides access to DeepSeek R1 (reasoning) and DeepSeek V3 (general) models. Heavy users may hit rate limits during peak hours due to high demand from the global user base.",
      },
      {
        q: "Does bedda.ai include DeepSeek models?",
        a: "Yes. bedda.ai Plus includes both DeepSeek R1 and DeepSeek V3 alongside GPT-5, Claude Opus 4.8, Gemini 2.5 Pro, Grok 4, and 30+ other frontier models. You get DeepSeek plus everything else for $12/mo.",
      },
      {
        q: "Why pay for bedda.ai when DeepSeek is free?",
        a: "DeepSeek Chat is excellent for DeepSeek-specific tasks. But most people need multiple AI models for different tasks — Claude for writing, GPT-5 for coding, Gemini for multimodal work. bedda.ai consolidates everything at $12/mo so you're not switching between 5 different AI tabs. If you only ever use DeepSeek, the free tier works great.",
      },
      {
        q: "Which is better for coding — DeepSeek or bedda.ai?",
        a: "DeepSeek R1 is one of the best open-weight coding models available. On bedda.ai you can access DeepSeek R1 alongside GPT-5, Claude Sonnet 4.6, and o3 — letting you pick the right model for each coding task. For complex architecture questions, Claude Opus; for fast debugging, DeepSeek R1 or GPT-5 Mini; for reasoning-heavy algorithms, o3.",
      },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(COMPARISONS).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = COMPARISONS[slug];
  if (!data) {
    return {};
  }
  return {
    title: data.metaTitle,
    description: data.metaDescription,
    openGraph: {
      title: data.ogTitle,
      description: data.ogDescription,
    },
    alternates: {
      canonical: `https://bedda.ai/compare/${slug}`,
    },
  };
}

function Cell({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return <span className="font-medium text-sm">{value}</span>;
  }
  return value ? (
    <Check className="mx-auto h-5 w-5 text-green-500" />
  ) : (
    <X className="mx-auto h-5 w-5 text-red-400" />
  );
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = COMPARISONS[slug];
  if (!data) {
    notFound();
  }

  return (
    <div className="container py-12 md:py-24">
      {/* Hero */}
      <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
        <div className="inline-flex items-center rounded-full border bg-muted px-3 py-1 text-sm">
          bedda.ai vs {data.competitor}
        </div>
        <h1 className="font-bold text-3xl leading-[1.1] sm:text-4xl md:text-5xl">
          {data.heroHeadline}
        </h1>
        <p className="max-w-[85%] text-muted-foreground leading-normal sm:text-lg sm:leading-7">
          {data.heroSubtext}
        </p>
        <div className="flex gap-4 pt-2">
          <Button asChild size="lg">
            <Link href="/register">
              Start free trial <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/pricing">See pricing</Link>
          </Button>
        </div>
        <p className="text-muted-foreground text-xs">
          7-day free trial · No credit card required
        </p>
      </div>

      {/* Price callout */}
      <div className="mx-auto mt-16 max-w-2xl">
        <div className="grid grid-cols-2 gap-6">
          <div className="rounded-lg border bg-primary/5 p-6 text-center">
            <p className="mb-1 text-muted-foreground text-sm">bedda.ai Plus</p>
            <p className="font-bold text-4xl">{data.beddaPrice}</p>
            <p className="mt-1 text-muted-foreground text-sm">36+ AI models</p>
          </div>
          <div className="rounded-lg border p-6 text-center">
            <p className="mb-1 text-muted-foreground text-sm">
              {data.competitor}
            </p>
            <p className="font-bold text-4xl text-muted-foreground">
              {data.competitorPrice}
            </p>
            <p className="mt-1 text-muted-foreground text-sm">
              1 company&apos;s models
            </p>
          </div>
        </div>
      </div>

      {/* Comparison table */}
      <div className="mx-auto mt-16 max-w-3xl">
        <h2 className="mb-8 text-center font-bold text-2xl">
          Feature comparison
        </h2>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left font-medium">Feature</th>
                <th className="p-3 text-center font-bold text-primary">
                  bedda.ai Plus
                </th>
                <th className="p-3 text-center font-medium">
                  {data.competitor}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row) => (
                <tr className="border-b" key={row.feature}>
                  <td className="p-3 font-medium">{row.feature}</td>
                  <td className="bg-primary/5 p-3 text-center">
                    <Cell value={row.bedda} />
                  </td>
                  <td className="p-3 text-center">
                    <Cell value={row.competitor} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Switch reasons */}
      <div className="mx-auto mt-20 max-w-2xl">
        <h2 className="mb-6 text-center font-bold text-2xl">
          Why people switch from {data.competitor}
        </h2>
        <ul className="space-y-3">
          {data.switchReasons.map((reason) => (
            <li className="flex items-start gap-3" key={reason}>
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
              <span className="text-muted-foreground">{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Verdict */}
      <div className="mx-auto mt-16 max-w-2xl rounded-lg border bg-muted/30 p-8 text-center">
        <h2 className="mb-3 font-bold text-xl">Our verdict</h2>
        <p className="text-muted-foreground">{data.verdict}</p>
        <div className="mt-6 flex flex-col items-center gap-2">
          <Button asChild size="lg">
            <Link href="/register">
              Try bedda.ai free for 7 days{" "}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="text-muted-foreground text-xs">
            No credit card required
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div className="mx-auto mt-20 max-w-2xl">
        <h2 className="mb-8 text-center font-bold text-2xl">
          Common questions
        </h2>
        <div className="space-y-6">
          {data.faq.map(({ q, a }) => (
            <div key={q}>
              <h3 className="mb-2 font-semibold">{q}</h3>
              <p className="text-muted-foreground">{a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Other comparisons */}
      <div className="mx-auto mt-16 max-w-2xl text-center">
        <p className="mb-4 text-muted-foreground text-sm">Also compare:</p>
        <div className="flex flex-wrap justify-center gap-3">
          {Object.values(COMPARISONS)
            .filter((c) => c.slug !== slug)
            .map((c) => (
              <Link
                className="rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
                href={`/compare/${c.slug}`}
                key={c.slug}
              >
                {c.title}
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
