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
      { feature: "Grok 3", bedda: true, competitor: false },
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
      "If you use Claude daily, bedda.ai is the better deal. You keep full Claude access and gain GPT-5, Gemini 2.5, Grok 3 and 25 more models — for 40% less.",
    switchReasons: [
      "Keep Claude Opus, Sonnet and Haiku access — unchanged",
      "Add GPT-5, Gemini 2.5, Grok 3 and DeepSeek R1 to your workflow",
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
      { feature: "Grok 3", bedda: true, competitor: false },
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
      "Add Claude 4, GPT-5, Grok 3 and DeepSeek to your toolkit",
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
      { feature: "Grok 3", bedda: true, competitor: false },
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
      "Compare bedda.ai and Grok SuperGrok. Get Grok 3 PLUS Claude 4, GPT-5, Gemini and 36+ more models for $12/mo — 60% cheaper than SuperGrok. 7-day free trial.",
    ogTitle: "bedda.ai vs Grok SuperGrok — Same Grok, 60% Lower Price",
    ogDescription:
      "Grok SuperGrok costs $30/mo. bedda.ai gives you Grok 3 PLUS Claude 4, GPT-5, Gemini and 36+ more models for just $12/mo.",
    heroHeadline:
      "Grok 3 access — plus Claude, GPT-5, Gemini and 25 more models",
    heroSubtext:
      "SuperGrok charges $30/mo for xAI models only. bedda.ai gives you Grok 3 alongside every other frontier model — for $18 less per month.",
    verdict:
      "bedda.ai costs 60% less than SuperGrok while giving you Grok 3 plus 36+ additional models. There's no scenario where SuperGrok alone makes sense.",
    switchReasons: [
      "Keep Grok 3 access — same model, same capability",
      "Add Claude 4, GPT-5, Gemini 2.5 and DeepSeek to your workflow",
      "Save $18/mo ($216/year) vs SuperGrok",
      "Web search, image generation, and video generation all included",
      "No X/Twitter account required",
    ],
    rows: [
      { feature: "Monthly price", bedda: "$12/mo", competitor: "$30/mo" },
      { feature: "Grok 3 access", bedda: true, competitor: true },
      { feature: "Grok 3 Mini", bedda: true, competitor: true },
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
        a: "Yes — bedda routes to Grok 3 via xAI's API, the same underlying model. You don't need an X (Twitter) account to use it on bedda.",
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
        a: "The free tier includes access to several models. Grok 3 requires a Plus plan ($12/mo with a 7-day free trial — no credit card required to start).",
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
      { feature: "Grok 3", bedda: true, competitor: false },
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
      { feature: "Grok 3", bedda: true, competitor: false },
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
      { feature: "Grok 3", bedda: true, competitor: true },
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

  "bedda-vs-you": {
    slug: "bedda-vs-you",
    competitor: "You.com Pro",
    competitorUrl: "https://you.com",
    competitorPrice: "$20/mo",
    beddaPrice: "$12/mo",
    title: "bedda.ai vs You.com Pro",
    metaTitle:
      "bedda.ai vs You.com Pro (2026) — More AI Models, Knowledge Base, $8 Cheaper",
    metaDescription:
      "Compare bedda.ai and You.com Pro. Get Claude, GPT-5, Gemini and 36+ AI models with web search, knowledge base, and video generation for $12/mo. 7-day free trial.",
    ogTitle:
      "bedda.ai vs You.com Pro — 36+ AI Models + Knowledge Base, 40% Cheaper",
    ogDescription:
      "You.com Pro costs $20/mo for AI search. bedda.ai gives you Claude 4, GPT-5, Gemini, Grok and 36+ models with web search and your own knowledge base for $12/mo.",
    heroHeadline:
      "AI search + every frontier model — plus knowledge base, video, and code execution",
    heroSubtext:
      "You.com Pro combines AI search with chat for $20/mo. bedda.ai gives you web search inside every frontier model — Claude, GPT-5, Gemini, Grok and 36+ more — for $8 less.",
    verdict:
      "You.com Pro is built around AI-powered web search. bedda.ai gives you the same web search capability but wraps it in 36+ frontier models, a personal knowledge base, image and video generation, and a multi-model comparison arena — for 40% less.",
    switchReasons: [
      "Web search included — works across Claude, GPT-5, Gemini and all models",
      "Save $8/mo ($96/year) vs You.com Pro",
      "Personal knowledge base: upload documents and query them alongside web results",
      "Image and video generation You.com doesn't offer",
      "Model comparison arena to run the same prompt through multiple AI at once",
    ],
    rows: [
      { feature: "Monthly price", bedda: "$12/mo", competitor: "$20/mo" },
      { feature: "Real-time web search", bedda: true, competitor: true },
      { feature: "Claude 4 Opus + Sonnet", bedda: true, competitor: true },
      { feature: "GPT-5 / GPT-4o", bedda: true, competitor: true },
      { feature: "Gemini 2.5 Pro", bedda: true, competitor: false },
      { feature: "Grok 3", bedda: true, competitor: false },
      { feature: "DeepSeek R1", bedda: true, competitor: false },
      { feature: "Mistral Large", bedda: true, competitor: false },
      { feature: "Image generation", bedda: true, competitor: false },
      { feature: "Video generation", bedda: true, competitor: false },
      { feature: "Code execution sandbox", bedda: true, competitor: false },
      { feature: "Audio transcription", bedda: true, competitor: false },
      { feature: "Knowledge base (upload your docs)", bedda: true, competitor: false },
      { feature: "Cross-conversation memory", bedda: true, competitor: false },
      { feature: "Model comparison arena", bedda: true, competitor: false },
      { feature: "Team workspaces", bedda: true, competitor: false },
      { feature: "OpenAI-compatible API", bedda: true, competitor: false },
      { feature: "Total AI models", bedda: "36+", competitor: "~5" },
    ],
    faq: [
      {
        q: "Does bedda.ai have web search like You.com?",
        a: "Yes. bedda.ai has built-in web search via Brave Search, available to all Plus subscribers. Any model — Claude, GPT-5, Gemini — can search the web and return cited results in real time.",
      },
      {
        q: "What makes bedda.ai different from You.com for research?",
        a: "You.com focuses on search-first AI. bedda.ai combines web search with a personal knowledge base (upload PDFs, docs, CSVs) so you can query your own documents alongside live web results — great for deep research workflows.",
      },
      {
        q: "Does You.com have a knowledge base for uploading documents?",
        a: "You.com allows file uploads within individual chats. bedda.ai's knowledge base persists across all conversations — upload once and every future chat can reference those documents via RAG.",
      },
      {
        q: "Can I compare AI models side by side on bedda.ai?",
        a: "Yes. bedda.ai's model comparison arena lets you run the same prompt through up to 4 models simultaneously and compare responses — a feature You.com doesn't offer.",
      },
    ],
  },

  "bedda-vs-notion-ai": {
    slug: "bedda-vs-notion-ai",
    competitor: "Notion AI",
    competitorUrl: "https://notion.so",
    competitorPrice: "$10/mo add-on",
    beddaPrice: "$12/mo",
    title: "bedda.ai vs Notion AI",
    metaTitle:
      "bedda.ai vs Notion AI (2026) — 36+ AI Models vs One Writing Tool",
    metaDescription:
      "Compare bedda.ai and Notion AI. Get Claude, GPT-5, Gemini and 36+ AI models for $12/mo — vs paying $10/mo extra just for AI inside Notion. 7-day free trial.",
    ogTitle: "bedda.ai vs Notion AI — Full AI Platform vs Add-on, Same Price",
    ogDescription:
      "Notion AI costs $10/mo on top of your Notion subscription ($16-18/mo). bedda.ai gives you Claude 4, GPT-5, Gemini and 36+ frontier models as a standalone app for $12/mo.",
    heroHeadline:
      "Claude, GPT-5, Gemini and 36+ AI models — for $2 more than just Notion AI",
    heroSubtext:
      "Notion AI is $10/mo extra on top of Notion ($16-18/mo base) — $26-28/mo total for AI writing in one tool. bedda.ai gives you every frontier AI model in a dedicated platform for $12/mo.",
    verdict:
      "If you use Notion primarily for AI features, you're overpaying significantly. bedda.ai is a dedicated AI platform that gives you 36+ frontier models, web search, image generation, video, and code execution — at less than half the effective cost of a full Notion + Notion AI stack.",
    switchReasons: [
      "Stop paying $26-28/mo (Notion + Notion AI) — switch to $12/mo for more AI power",
      "Access Claude 4, GPT-5, Gemini, Grok and 36+ models in one app",
      "Web search, image generation, and video generation not available in Notion AI",
      "Knowledge base: index your Notion-exported docs and query them in bedda",
      "Code execution, model comparison arena, and Slack/Discord/Telegram bots",
    ],
    rows: [
      { feature: "Standalone price", bedda: "$12/mo", competitor: "$10/mo add-on" },
      {
        feature: "Requires another subscription",
        bedda: false,
        competitor: true,
      },
      { feature: "Claude 4 Opus + Sonnet", bedda: true, competitor: false },
      { feature: "GPT-5 / GPT-4o", bedda: true, competitor: false },
      { feature: "Gemini 2.5 Pro", bedda: true, competitor: false },
      { feature: "Grok 3", bedda: true, competitor: false },
      { feature: "DeepSeek R1", bedda: true, competitor: false },
      { feature: "Image generation", bedda: true, competitor: false },
      { feature: "Video generation", bedda: true, competitor: false },
      { feature: "Code execution sandbox", bedda: true, competitor: false },
      { feature: "Real-time web search", bedda: true, competitor: false },
      { feature: "Audio transcription", bedda: true, competitor: false },
      { feature: "Knowledge base (RAG)", bedda: true, competitor: false },
      { feature: "Cross-conversation memory", bedda: true, competitor: false },
      { feature: "Model comparison arena", bedda: true, competitor: false },
      { feature: "Team workspaces", bedda: true, competitor: false },
      { feature: "OpenAI-compatible API", bedda: true, competitor: false },
      { feature: "AI writing inside your workspace", bedda: false, competitor: true },
      { feature: "Total AI models", bedda: "36+", competitor: "1" },
    ],
    faq: [
      {
        q: "Is Notion AI worth $10/mo extra?",
        a: "If you live in Notion and just need quick writing assistance, Notion AI is convenient. But if you use AI for research, coding, image generation, or multi-model reasoning, bedda.ai gives dramatically more capability for roughly the same incremental cost.",
      },
      {
        q: "Can I still use Notion with bedda.ai?",
        a: "Absolutely. Many users use bedda.ai for AI-heavy work (research, drafting, analysis) and Notion for organizing the results. You can paste content between them freely, or use bedda's knowledge base to index your Notion exports.",
      },
      {
        q: "Does bedda.ai have a writing assistant like Notion AI?",
        a: "Yes — Claude 4, GPT-5, and Gemini are all excellent writing assistants, often outperforming Notion AI's underlying model. You can also use custom instructions to set a writing style that persists across all sessions.",
      },
      {
        q: "What AI model does Notion AI use?",
        a: "Notion AI uses a combination of models (primarily Claude and GPT-4 class models) tuned for document editing tasks. bedda.ai lets you choose between 36+ models directly, including the same Claude and GPT variants.",
      },
    ],
  },

  "bedda-vs-github-copilot": {
    slug: "bedda-vs-github-copilot",
    competitor: "GitHub Copilot",
    competitorUrl: "https://github.com/features/copilot",
    competitorPrice: "$10/mo",
    beddaPrice: "$12/mo",
    title: "bedda.ai vs GitHub Copilot",
    metaTitle:
      "bedda.ai vs GitHub Copilot (2026) — AI Coding + 36 Models vs Code Only",
    metaDescription:
      "Compare bedda.ai and GitHub Copilot. Get AI coding help plus Claude 4, GPT-5, Gemini, web search, image generation and 36+ models for $12/mo. 7-day free trial.",
    ogTitle: "bedda.ai vs GitHub Copilot — Code + Every AI Model for $2 More",
    ogDescription:
      "GitHub Copilot is $10/mo for coding only. bedda.ai gives you AI coding conversations PLUS Claude 4, GPT-5, Gemini, Grok, web search, image gen and 36+ models for $12/mo.",
    heroHeadline:
      "AI coding plus research, writing, images and 36+ models — not just code completion",
    heroSubtext:
      "GitHub Copilot helps you write code at $10/mo. bedda.ai gives you AI coding conversations alongside Claude 4, GPT-5, Gemini, Grok and 36+ models for research, writing, images and more — for just $2 more.",
    verdict:
      "GitHub Copilot is the gold standard for IDE code completion. But if you also use AI for research, writing, or image generation, paying $10 for Copilot and $20 for ChatGPT adds up to $30/mo. bedda.ai covers coding conversations plus every other AI use case for $12/mo.",
    switchReasons: [
      "Stop paying $30/mo for Copilot + ChatGPT — bedda covers both for $12/mo",
      "Ask Claude 4 or GPT-5 to explain code, debug, review PRs and write tests in chat",
      "Switch to Gemini or DeepSeek R1 for different coding styles in the same session",
      "Web search, knowledge base, and image generation included — one subscription",
      "Model comparison arena: run the same coding question through 4 models at once",
    ],
    rows: [
      { feature: "Monthly price", bedda: "$12/mo", competitor: "$10/mo" },
      { feature: "AI coding assistance (chat)", bedda: true, competitor: true },
      { feature: "IDE autocomplete plugin", bedda: false, competitor: true },
      { feature: "Claude 4 Opus + Sonnet", bedda: true, competitor: false },
      { feature: "GPT-5 / GPT-4o", bedda: true, competitor: "GPT-4o" },
      { feature: "Gemini 2.5 Pro", bedda: true, competitor: false },
      { feature: "Grok 3", bedda: true, competitor: false },
      { feature: "DeepSeek R1 (reasoning)", bedda: true, competitor: false },
      { feature: "Mistral Large", bedda: true, competitor: false },
      { feature: "Real-time web search", bedda: true, competitor: false },
      { feature: "Image generation", bedda: true, competitor: false },
      { feature: "Video generation", bedda: true, competitor: false },
      { feature: "Code execution sandbox", bedda: true, competitor: false },
      { feature: "Knowledge base (RAG)", bedda: true, competitor: false },
      { feature: "Model comparison arena", bedda: true, competitor: false },
      { feature: "Team workspaces", bedda: true, competitor: true },
      { feature: "OpenAI-compatible API", bedda: true, competitor: false },
      { feature: "Total AI models", bedda: "36+", competitor: "1" },
    ],
    faq: [
      {
        q: "Can bedda.ai replace GitHub Copilot for coding?",
        a: "For chat-based coding help — explaining code, debugging, writing functions, PR reviews — bedda.ai is a strong alternative. Claude 4 and GPT-5 are excellent programmers. However, Copilot's inline IDE autocomplete is unique: if you rely on tab-completion inside VS Code or JetBrains, Copilot does that and bedda does not.",
      },
      {
        q: "What AI models does GitHub Copilot use?",
        a: "GitHub Copilot uses OpenAI GPT-4o for Copilot Chat. bedda.ai gives you GPT-4o and GPT-5, plus Claude 4 (Opus/Sonnet), Gemini 2.5 Pro, Grok 3, DeepSeek R1, Mistral Large and 30+ more models — each with different coding strengths.",
      },
      {
        q: "Does bedda.ai work for code reviews like Copilot Chat?",
        a: "Yes. Paste code into bedda.ai and ask Claude 4 or GPT-5 to review it, suggest improvements, write tests, or explain what it does — the same as Copilot Chat, but across more models with no IDE dependency.",
      },
      {
        q: "Is it worth paying for both Copilot and bedda.ai?",
        a: "If you need IDE tab-completion specifically, you might keep Copilot for that. But for coding chat, research, writing, images, and all other AI tasks, bedda.ai at $12/mo replaces ChatGPT Plus and most other chat subscriptions — saving you $20-30/mo versus running multiple subscriptions.",
      },
    ],
  },

  "bedda-vs-jasper": {
    slug: "bedda-vs-jasper",
    competitor: "Jasper",
    competitorUrl: "https://jasper.ai",
    competitorPrice: "$39/mo",
    beddaPrice: "$12/mo",
    title: "bedda.ai vs Jasper",
    metaTitle:
      "bedda.ai vs Jasper AI (2026) — 36+ Models vs AI Writing Tool, $27 Cheaper",
    metaDescription:
      "Compare bedda.ai and Jasper AI. Get Claude 4, GPT-5, Gemini and 36+ models with web search, image gen, code execution and video for $12/mo — vs Jasper at $39/mo. 7-day free trial.",
    ogTitle: "bedda.ai vs Jasper — Claude 4 + GPT-5 Writing for $27 Less Per Month",
    ogDescription:
      "Jasper is $39-59/mo for AI writing with one model. bedda.ai gives you Claude 4, GPT-5, Gemini and 36+ AI models for writing, coding, images and research for $12/mo.",
    heroHeadline:
      "Claude 4 and GPT-5 write better than Jasper — at a third of the price",
    heroSubtext:
      "Jasper charges $39/mo for AI writing powered by GPT-4 class models. bedda.ai gives you Claude 4 Opus, GPT-5, Gemini 2.5 Pro and 36+ models for writing, research, coding, image generation and more — for $27 less per month.",
    verdict:
      "Jasper is a polished content marketing tool with templates and brand voice features. But its underlying AI writing quality is matched or exceeded by Claude 4 and GPT-5 — both available on bedda.ai for $12/mo. Unless you specifically need Jasper's workflow templates and brand voice system, bedda.ai gives you better models at 70% less cost.",
    switchReasons: [
      "Save $27/mo ($324/year) vs Jasper Starter — same or better writing quality",
      "Claude 4 Opus produces longer, more nuanced writing than GPT-4-class models",
      "Switch between models mid-conversation to get multiple drafts in different voices",
      "Web search, knowledge base, code execution and video generation Jasper doesn't offer",
      "7-day free trial — compare Claude 4 and GPT-5 writing quality for yourself",
    ],
    rows: [
      { feature: "Monthly price", bedda: "$12/mo", competitor: "$39/mo" },
      { feature: "AI long-form writing", bedda: true, competitor: true },
      { feature: "Claude 4 Opus + Sonnet", bedda: true, competitor: false },
      { feature: "GPT-5 / GPT-4o", bedda: true, competitor: "GPT-4o" },
      { feature: "Gemini 2.5 Pro", bedda: true, competitor: false },
      { feature: "Grok 3", bedda: true, competitor: false },
      { feature: "DeepSeek R1", bedda: true, competitor: false },
      { feature: "Content templates library", bedda: false, competitor: true },
      {
        feature: "Brand voice (saved style guide)",
        bedda: "Via custom instructions",
        competitor: true,
      },
      { feature: "Real-time web search", bedda: true, competitor: false },
      {
        feature: "Image generation",
        bedda: true,
        competitor: "Limited (Jasper Art)",
      },
      { feature: "Video generation", bedda: true, competitor: false },
      { feature: "Code execution sandbox", bedda: true, competitor: false },
      { feature: "Knowledge base (RAG)", bedda: true, competitor: false },
      { feature: "Model comparison arena", bedda: true, competitor: false },
      { feature: "Team workspaces", bedda: true, competitor: true },
      { feature: "OpenAI-compatible API", bedda: true, competitor: false },
      { feature: "Total AI models", bedda: "36+", competitor: "1-2" },
    ],
    faq: [
      {
        q: "Is bedda.ai as good as Jasper for content writing?",
        a: "bedda.ai gives you Claude 4 Opus, GPT-5, and Gemini 2.5 Pro — the most capable AI writing models available. Jasper uses a similar underlying model (GPT-4 class) but with a writing-focused interface. Most writers find Claude 4 Opus produces more nuanced, long-form writing than Jasper's default output.",
      },
      {
        q: "Does bedda.ai have writing templates like Jasper?",
        a: "bedda.ai doesn't have Jasper's 80+ pre-built templates, but you can save custom system prompts via the Prompt Library that act as reusable writing templates. For brand voice consistency, bedda's Custom Instructions feature lets you set a persistent writing style for every session.",
      },
      {
        q: "Can I use bedda.ai for SEO writing like Jasper?",
        a: "Yes. bedda.ai's web search feature pulls real-time data for SEO content. Claude 4 and GPT-5 excel at writing keyword-optimized long-form content — pair them with a web search call to get up-to-date facts and competitor insights.",
      },
      {
        q: "Why does Jasper cost $39/mo when the same models are cheaper elsewhere?",
        a: "Jasper adds workflow features — templates, brand voice, document collaboration — on top of the underlying model. If those workflow features are critical to your team, Jasper may be worth the premium. If you primarily want the best AI writing quality, the same (or newer) models on bedda.ai cost 70% less.",
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
      "Mistral Le Chat Pro gives you Mistral's models for $14.99/mo. bedda.ai includes Mistral Large alongside Claude 4, GPT-5, Gemini 2.5 Pro, Grok 3 and 36+ models total — for $2.99 less per month.",
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
      { feature: "Grok 3", bedda: true, competitor: false },
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

  "bedda-vs-writesonic": {
    slug: "bedda-vs-writesonic",
    competitor: "Writesonic Pro",
    competitorUrl: "https://writesonic.com",
    competitorPrice: "$16/mo",
    beddaPrice: "$12/mo",
    title: "bedda.ai vs Writesonic",
    metaTitle:
      "bedda.ai vs Writesonic (2026) — 36+ AI Models vs AI Writing Tool",
    metaDescription:
      "Compare bedda.ai and Writesonic. bedda gives you Claude 4, GPT-5, Gemini, Grok and 36+ models for $12/mo — $4 cheaper than Writesonic Pro, with no word-count caps. 7-day free trial.",
    ogTitle:
      "bedda.ai vs Writesonic — More Models, Lower Price, No Word Limits",
    ogDescription:
      "Writesonic is built for marketing copy at $16-79/mo. bedda.ai gives you 36+ frontier AI models including GPT-5 and Claude 4 for $12/mo — better for general-purpose AI work.",
    heroHeadline:
      "36+ frontier AI models for less than Writesonic's entry plan",
    heroSubtext:
      "Writesonic focuses on AI-generated marketing copy with word-count limits. bedda.ai gives you Claude 4, GPT-5, Gemini 2.5 Pro, Grok 3 and 36+ more models for unlimited conversations — for $4 less per month.",
    verdict:
      "Writesonic is a specialized marketing copywriting tool. If you need a dedicated SEO content pipeline, it has templates built for that. But if you want frontier AI for general tasks — research, coding, analysis, writing — bedda.ai gives you better underlying models for less money and no word-count restrictions.",
    switchReasons: [
      "Access Claude 4, GPT-5, Gemini 2.5 Pro and Grok 3 — not just one AI engine",
      "Save $4/mo — no word-count caps, no credit system",
      "Image generation, video generation, and code execution in one app",
      "Knowledge base RAG for grounding responses in your own documents",
      "Chat across 36+ models without switching apps or subscriptions",
    ],
    rows: [
      { feature: "Monthly price", bedda: "$12/mo", competitor: "$16–79/mo" },
      { feature: "Claude 4 Opus + Sonnet", bedda: true, competitor: false },
      { feature: "GPT-5 / GPT-4o", bedda: true, competitor: "Via API key" },
      { feature: "Gemini 2.5 Pro", bedda: true, competitor: false },
      { feature: "Grok 3", bedda: true, competitor: false },
      { feature: "DeepSeek R1", bedda: true, competitor: false },
      {
        feature: "Word / credit limits",
        bedda: "None",
        competitor: "Yes (plan-based)",
      },
      { feature: "Real-time web search", bedda: true, competitor: true },
      { feature: "Image generation", bedda: true, competitor: true },
      { feature: "Video generation", bedda: true, competitor: false },
      { feature: "Code execution sandbox", bedda: true, competitor: false },
      { feature: "Knowledge base (RAG)", bedda: true, competitor: true },
      { feature: "Cross-conversation memory", bedda: true, competitor: false },
      { feature: "Model comparison arena", bedda: true, competitor: false },
      { feature: "Marketing copy templates", bedda: false, competitor: true },
      { feature: "SEO content optimizer", bedda: false, competitor: true },
      { feature: "Team workspaces", bedda: true, competitor: true },
      { feature: "OpenAI-compatible API", bedda: true, competitor: false },
      { feature: "Total AI models", bedda: "36+", competitor: "~2" },
    ],
    faq: [
      {
        q: "Is bedda.ai good for writing marketing copy?",
        a: "Yes. Claude 4 Opus and GPT-5 both excel at persuasive copy, email campaigns, and blog posts. You don't get Writesonic's pre-built SEO templates, but the underlying model quality is higher and you can switch models to find the tone that fits.",
      },
      {
        q: "Does bedda.ai have word limits like Writesonic?",
        a: "No. bedda.ai Plus ($12/mo) gives you unlimited messages — no word counts, no credits, no overage charges. Writesonic's entry plan caps output; heavier users need the $79+/mo Business plan.",
      },
      {
        q: "What does Writesonic have that bedda.ai doesn't?",
        a: "Writesonic's core strength is its library of 100+ marketing copy templates (landing pages, Google Ads, product descriptions) and its Surfer SEO integration. If you're running a content production workflow at scale, those purpose-built features add genuine value.",
      },
      {
        q: "Can I use bedda.ai for SEO content?",
        a: "Yes. You can use web search to pull in current SERP data, ask Claude 4 or GPT-5 to write optimized drafts, and use the knowledge base to feed in your brand guidelines. It's a manual workflow vs Writesonic's end-to-end pipeline, but the output quality from frontier models is competitive.",
      },
    ],
  },

  "bedda-vs-phind": {
    slug: "bedda-vs-phind",
    competitor: "Phind Pro",
    competitorUrl: "https://www.phind.com",
    competitorPrice: "$17/mo",
    beddaPrice: "$12/mo",
    title: "bedda.ai vs Phind",
    metaTitle:
      "bedda.ai vs Phind Pro (2026) — Full-Stack AI vs Coding-Only Search",
    metaDescription:
      "Compare bedda.ai and Phind Pro. bedda gives you Claude 4, GPT-5, Gemini, DeepSeek and 36+ models for $12/mo — $5 cheaper than Phind Pro, with writing, image gen, and video too. 7-day free trial.",
    ogTitle: "bedda.ai vs Phind — Same Coding AI + 35 More Models, $5 Cheaper",
    ogDescription:
      "Phind Pro is $17/mo for coding-focused AI search. bedda.ai gives you DeepSeek R1, Claude 4, GPT-5 and 36+ models for general coding AND writing AND research — for $12/mo.",
    heroHeadline: "DeepSeek, Claude 4, and GPT-5 for coding — plus everything else",
    heroSubtext:
      "Phind Pro is a great coding search tool at $17/mo. bedda.ai gives you DeepSeek R1, Claude 4 Sonnet, GPT-5, and Gemini for code — plus the same models for writing, research, images and video — for $5 less per month.",
    verdict:
      "Phind is purpose-built for developers who want AI-powered code search and explanation. If coding is your only use case, it's a solid tool. But if you write documentation, communicate with non-technical teammates, or need image generation alongside coding help, bedda.ai covers all of that with better frontier models at a lower price.",
    switchReasons: [
      "Save $5/mo — same DeepSeek R1 coding power plus 35 more models",
      "Claude 4 Sonnet and GPT-5 for code alongside DeepSeek R1",
      "Write docs, emails, and reports in the same app as your coding AI",
      "Code execution sandbox for testing Python and JavaScript directly",
      "No separate subscription — one $12/mo plan for everything",
    ],
    rows: [
      { feature: "Monthly price", bedda: "$12/mo", competitor: "$17/mo" },
      { feature: "DeepSeek R1 (coding)", bedda: true, competitor: true },
      { feature: "Claude 4 Sonnet", bedda: true, competitor: true },
      { feature: "GPT-5 / GPT-4o", bedda: true, competitor: true },
      { feature: "Gemini 2.5 Pro", bedda: true, competitor: false },
      { feature: "Grok 3", bedda: true, competitor: false },
      { feature: "Mistral Large", bedda: true, competitor: false },
      { feature: "Real-time web search", bedda: true, competitor: true },
      { feature: "Code execution sandbox", bedda: true, competitor: false },
      { feature: "Image generation", bedda: true, competitor: false },
      { feature: "Video generation", bedda: true, competitor: false },
      { feature: "Knowledge base (RAG)", bedda: true, competitor: false },
      { feature: "Cross-conversation memory", bedda: true, competitor: false },
      { feature: "Model comparison arena", bedda: true, competitor: false },
      { feature: "Team workspaces", bedda: true, competitor: false },
      { feature: "IDE plugin (VS Code)", bedda: false, competitor: true },
      { feature: "Codebase search", bedda: false, competitor: true },
      { feature: "OpenAI-compatible API", bedda: true, competitor: false },
      { feature: "Total AI models", bedda: "36+", competitor: "~4" },
    ],
    faq: [
      {
        q: "Does bedda.ai have the same coding models as Phind?",
        a: "Yes. bedda.ai includes DeepSeek R1 (which Phind uses heavily for coding), Claude 4 Sonnet, and GPT-5 — the same frontier models Phind routes to. You also get Gemini 2.5 Pro and Grok 3 for alternative perspectives on hard problems.",
      },
      {
        q: "Does bedda.ai have a VS Code extension like Phind?",
        a: "Not currently. Phind's VS Code plugin is a genuine advantage for developers who want inline AI assistance inside their editor. bedda.ai is browser-based — you tab over to it rather than using it in-editor.",
      },
      {
        q: "Is Phind better than bedda.ai for coding-only workflows?",
        a: "Phind's codebase search and IDE integration give it an edge for pure coding workflows. If you spend all day in VS Code and want AI inline, Phind's plugin is purpose-built for that. If you need AI for coding AND writing, research, and image work, bedda.ai covers more ground for less money.",
      },
      {
        q: "Can I use bedda.ai to run code?",
        a: "Yes. bedda.ai has a code execution sandbox powered by E2B — you can run Python and JavaScript directly in the chat and see the output. This is something Phind doesn't offer in its chat interface.",
      },
    ],
  },

  "bedda-vs-openrouter": {
    slug: "bedda-vs-openrouter",
    competitor: "OpenRouter",
    competitorUrl: "https://openrouter.ai",
    competitorPrice: "Pay-per-use",
    beddaPrice: "$12/mo",
    title: "bedda.ai vs OpenRouter",
    metaTitle:
      "bedda.ai vs OpenRouter (2026) — Flat Rate Chat vs Pay-Per-Token API",
    metaDescription:
      "Compare bedda.ai and OpenRouter. bedda gives you 36+ AI models with a chat interface for $12/mo flat — no token math, no API keys, no surprise bills. 7-day free trial.",
    ogTitle:
      "bedda.ai vs OpenRouter — $12/mo Flat vs Per-Token Billing for 36+ Models",
    ogDescription:
      "OpenRouter charges per token with no subscription. bedda.ai gives you 36+ models including Claude 4, GPT-5, Gemini and Grok via a full chat interface for $12/mo — predictable pricing, no API setup.",
    heroHeadline: "36+ AI models with a chat interface — no token math required",
    heroSubtext:
      "OpenRouter is a powerful API router for developers. bedda.ai gives you the same 36+ frontier models — Claude 4, GPT-5, Gemini 2.5 Pro, Grok 3 — with a full chat interface, artifacts, memory, and tools, for a flat $12/mo. No API key setup, no per-token billing.",
    verdict:
      "OpenRouter is the right choice if you're building an application and need programmatic access to many models with pay-as-you-go pricing. bedda.ai is the right choice if you're a user who wants to chat with all those models without writing code, tracking token costs, or managing API keys. Same model access, completely different use cases.",
    switchReasons: [
      "No token math — one flat $12/mo price for unlimited conversations",
      "Full chat interface with artifacts, memory, and tools — not just API calls",
      "Knowledge base, code execution, image & video generation built in",
      "No API key management — sign up and start chatting immediately",
      "Predictable monthly cost instead of variable per-use bills",
    ],
    rows: [
      {
        feature: "Pricing model",
        bedda: "$12/mo flat",
        competitor: "Pay-per-token",
      },
      { feature: "Claude 4 Opus + Sonnet", bedda: true, competitor: true },
      { feature: "GPT-5 / GPT-4o", bedda: true, competitor: true },
      { feature: "Gemini 2.5 Pro", bedda: true, competitor: true },
      { feature: "Grok 3", bedda: true, competitor: true },
      { feature: "DeepSeek R1", bedda: true, competitor: true },
      { feature: "Mistral Large", bedda: true, competitor: true },
      { feature: "Chat interface (no code)", bedda: true, competitor: false },
      { feature: "Image generation", bedda: true, competitor: false },
      { feature: "Video generation", bedda: true, competitor: false },
      { feature: "Code execution sandbox", bedda: true, competitor: false },
      { feature: "Web search tool", bedda: true, competitor: false },
      { feature: "Knowledge base (RAG)", bedda: true, competitor: false },
      { feature: "Cross-conversation memory", bedda: true, competitor: false },
      { feature: "Model comparison arena", bedda: true, competitor: false },
      { feature: "OpenAI-compatible API", bedda: true, competitor: true },
      { feature: "Programmatic API access", bedda: "Via API keys", competitor: true },
      { feature: "500+ model catalog", bedda: false, competitor: true },
      { feature: "Total AI models", bedda: "36+", competitor: "500+" },
    ],
    faq: [
      {
        q: "Who is OpenRouter built for?",
        a: "OpenRouter is an API aggregator built for developers and companies building AI-powered applications. You call one API endpoint and route to whichever model you want. It has no chat interface — you interact with it through code.",
      },
      {
        q: "Who is bedda.ai built for?",
        a: "bedda.ai is built for end users — researchers, writers, developers, and professionals who want to chat with frontier AI models without writing code. You get a polished chat interface, artifacts, tools, and team workspaces for a flat monthly price.",
      },
      {
        q: "Is OpenRouter cheaper than bedda.ai?",
        a: "It depends on usage. OpenRouter charges per token — at $3/M input + $15/M output tokens for Claude 4 Sonnet, 50 conversations at 4k tokens each costs roughly $4-5. At 200+ conversations per month, bedda.ai's $12/mo flat rate is almost certainly cheaper. Heavy users save significantly.",
      },
      {
        q: "Does bedda.ai have an API like OpenRouter?",
        a: "Yes. bedda.ai has an OpenAI-compatible API (available to paid subscribers) for programmatic access to its models. It's not as broad as OpenRouter's 500+ model catalog, but it covers all 36+ models bedda offers and uses the same OpenAI client libraries.",
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
      "T3 Chat is $8/mo for a handful of models. bedda.ai is $12/mo for 36+ models including Claude 4, GPT-5, Gemini 2.5 Pro, Grok 3, plus code execution, image gen, and team workspaces.",
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
      { feature: "Gemini 2.5 Pro (1M context)", bedda: true, competitor: false },
      { feature: "Grok 3", bedda: true, competitor: false },
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
        a: "T3 Chat is a well-designed, affordable AI chat app. At $8/mo it's a great deal if you primarily use Claude Sonnet and GPT-4o. If you want access to Gemini 2.5 Pro, Grok 3, DeepSeek R1, or tools like code execution and image generation, bedda.ai at $12/mo is the better fit.",
      },
      {
        q: "Who made T3 Chat?",
        a: "T3 Chat was built by Theo (Theodorus Browne), a popular developer and content creator known for the T3 stack (TypeScript, Tailwind, tRPC). It launched in 2025 and gained traction in developer circles for its clean UI and flat-rate pricing.",
      },
      {
        q: "Does bedda.ai have the same models as T3 Chat?",
        a: "bedda.ai includes all the models T3 Chat offers (Claude Sonnet, GPT-4o) plus many more: Claude 4 Opus, GPT-5, Gemini 2.5 Pro, Grok 3, DeepSeek R1, Mistral Large, Groq Llama, and Cerebras. You're getting a superset.",
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
    metaTitle: "bedda.ai vs Meta AI (2026) — Why Paid Beats Free for Serious Work",
    metaDescription:
      "Meta AI is free but limited to Llama models. bedda.ai gives you Claude 4, GPT-5, Gemini 2.5 Pro, Grok 3 and 36+ frontier models with code execution, RAG, and team workspaces — $12/mo.",
    ogTitle: "bedda.ai vs Meta AI — Claude + GPT-5 + Gemini vs Llama Only",
    ogDescription:
      "Meta AI is free and convenient for casual queries. bedda.ai gives you every frontier model — Claude 4, GPT-5, Gemini 2.5 Pro, Grok 3, DeepSeek R1 — plus tools like code execution, knowledge base, and video generation, for $12/mo.",
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
      { feature: "Grok 3", bedda: true, competitor: false },
      { feature: "Llama 3.3 / Llama 4", bedda: true, competitor: true },
      { feature: "DeepSeek R1", bedda: true, competitor: false },
      { feature: "Code execution sandbox", bedda: true, competitor: false },
      { feature: "Web search", bedda: true, competitor: true },
      { feature: "Image generation", bedda: true, competitor: "Basic (Imagine)" },
      { feature: "Video generation", bedda: true, competitor: false },
      { feature: "Knowledge base (RAG)", bedda: true, competitor: false },
      { feature: "Cross-conversation memory", bedda: true, competitor: false },
      { feature: "Model comparison arena", bedda: true, competitor: false },
      { feature: "Team workspaces", bedda: true, competitor: false },
      { feature: "OpenAI-compatible API", bedda: true, competitor: false },
      { feature: "Available in WhatsApp/Instagram", bedda: false, competitor: true },
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

  "bedda-vs-huggingchat": {
    slug: "bedda-vs-huggingchat",
    competitor: "HuggingChat",
    competitorUrl: "https://huggingface.co/chat",
    competitorPrice: "Free",
    beddaPrice: "$12/mo",
    title: "bedda.ai vs HuggingChat",
    metaTitle: "bedda.ai vs HuggingChat (2026) — Open-Source Models vs Frontier AI",
    metaDescription:
      "HuggingChat is free with open-source models. bedda.ai gives you Claude 4, GPT-5, Gemini 2.5 Pro, Grok 3 AND open-source models — plus code execution, image/video gen, RAG, and team workspaces. $12/mo.",
    ogTitle: "bedda.ai vs HuggingChat — Frontier AI vs Open-Source Only",
    ogDescription:
      "HuggingChat offers open-source models for free but has no Claude, GPT-5, or Gemini. bedda.ai gives you all 36+ frontier AND open-source models with professional tools for $12/mo.",
    heroHeadline: "Open-source models are great. Frontier models are better.",
    heroSubtext:
      "HuggingChat offers Llama, Mistral, and Qwen for free. bedda.ai gives you those same open-source models PLUS Claude 4, GPT-5, Gemini 2.5 Pro, and Grok 3 — with code execution, knowledge base, and team workspaces — for $12/mo.",
    verdict:
      "HuggingChat is a great way to try open-source AI for free. When you need Claude's reasoning, GPT-5's code generation, or Gemini's 1M token context — along with professional tools like code execution, RAG, and team workspaces — bedda.ai at $12/mo is where you graduate to.",
    switchReasons: [
      "Add Claude 4, GPT-5, and Gemini 2.5 Pro alongside open-source models",
      "Code execution in a real Python/JS sandbox — not just chat responses",
      "Knowledge base — upload PDFs, docs, and code for RAG retrieval",
      "Image and video generation (DALL-E 3, Imagen 3, Flux, Kling)",
      "Cross-conversation memory that persists across sessions",
      "Team workspaces for collaborative AI use at work",
    ],
    rows: [
      { feature: "Monthly price", bedda: "$12/mo", competitor: "Free" },
      { feature: "Claude 4 (Opus, Sonnet)", bedda: true, competitor: false },
      { feature: "GPT-5 / GPT-4o", bedda: true, competitor: false },
      { feature: "Gemini 2.5 Pro (1M context)", bedda: true, competitor: false },
      { feature: "Grok 3", bedda: true, competitor: false },
      { feature: "Llama 3.3 70B", bedda: true, competitor: true },
      { feature: "Mistral (Small / Large)", bedda: true, competitor: "Mistral 7B" },
      { feature: "Qwen models", bedda: false, competitor: true },
      { feature: "DeepSeek R1", bedda: true, competitor: true },
      { feature: "Code execution sandbox", bedda: true, competitor: false },
      { feature: "Web search", bedda: true, competitor: true },
      { feature: "Image generation", bedda: true, competitor: false },
      { feature: "Video generation", bedda: true, competitor: false },
      { feature: "Knowledge base (RAG)", bedda: true, competitor: false },
      { feature: "Cross-conversation memory", bedda: true, competitor: false },
      { feature: "Model comparison arena", bedda: true, competitor: false },
      { feature: "Team workspaces", bedda: true, competitor: false },
      { feature: "OpenAI-compatible API", bedda: true, competitor: false },
      { feature: "Total AI models", bedda: "36+", competitor: "~15 open-source" },
    ],
    faq: [
      {
        q: "What is HuggingChat?",
        a: "HuggingChat is a free chat interface from Hugging Face that lets you talk to open-source AI models including Llama, Mistral, Qwen, and others. It's a great way to try open-source models without API setup. It does not include commercial models like Claude, GPT-5, or Gemini.",
      },
      {
        q: "Are open-source models as good as Claude or GPT-5?",
        a: "Open-source models have improved dramatically and are excellent for many tasks. For coding, complex reasoning, very long documents, or tasks where output quality directly impacts your work, frontier commercial models (Claude 4, GPT-5, Gemini 2.5 Pro) still outperform open-source alternatives on most benchmarks.",
      },
      {
        q: "Can I use Llama on bedda.ai?",
        a: "Yes. bedda.ai includes Llama 3.3 70B via Groq (for fast inference) and Cerebras (for ultra-fast responses). You can use Llama inside bedda.ai alongside Claude, GPT-5, and Gemini — switching between them in the same conversation.",
      },
      {
        q: "Why pay for bedda.ai when HuggingChat is free?",
        a: "You're getting Claude 4 Opus, GPT-5, and Gemini 2.5 Pro — the top frontier models — plus professional tools: code execution, knowledge base RAG, image/video generation, team workspaces, and cross-conversation memory. If your work produces value, the quality difference from frontier models is worth $12/mo.",
      },
    ],
  },

  "bedda-vs-character-ai": {
    slug: "bedda-vs-character-ai",
    competitor: "Character.AI",
    competitorUrl: "https://character.ai",
    competitorPrice: "$9.99/mo",
    beddaPrice: "$12/mo",
    title: "bedda.ai vs Character.AI",
    metaTitle: "bedda.ai vs Character.AI (2026) — Frontier AI vs Entertainment Chat",
    metaDescription:
      "Character.AI is fun but limited to character roleplay. bedda.ai gives you Claude 4, GPT-5, Gemini 2.5 Pro, and 36+ frontier models for real work — coding, research, writing, analysis — for $12/mo. 7-day free trial.",
    ogTitle: "bedda.ai vs Character.AI — Serious AI vs Entertainment Bots",
    ogDescription:
      "Character.AI is great for roleplay at $9.99/mo. bedda.ai gives you Claude 4, GPT-5, Gemini 2.5 Pro, and 36+ frontier models for real productivity — coding, research, writing — at $12/mo.",
    heroHeadline: "Character.AI is for entertainment. bedda.ai is for work.",
    heroSubtext:
      "Character.AI is a great platform for creative roleplay and entertainment. When you need frontier AI to help you code, research, write, or analyze data, bedda.ai gives you Claude 4, GPT-5, Gemini 2.5 Pro, and 36+ professional models — for $2 more per month.",
    verdict:
      "Character.AI and bedda.ai serve different needs. Character.AI excels at entertainment, creative writing, and social roleplay. bedda.ai is built for productivity — professional AI models, code execution, knowledge base, and team workspaces. For serious work, bedda.ai is the clear choice.",
    switchReasons: [
      "Access Claude 4 Opus, GPT-5, and Gemini 2.5 Pro — state-of-the-art frontier models",
      "Run Python and JavaScript code in a real E2B sandbox",
      "Upload documents to a knowledge base and reference them in any conversation",
      "Generate images (DALL-E 3, Imagen 3, Flux) and videos (Kling) natively",
      "Web search integration for real-time information",
      "Team workspaces for collaborative AI workflows at work",
    ],
    rows: [
      { feature: "Monthly price", bedda: "$12/mo", competitor: "$9.99/mo" },
      { feature: "Claude 4 (Opus, Sonnet)", bedda: true, competitor: false },
      { feature: "GPT-5 / GPT-4o", bedda: true, competitor: false },
      { feature: "Gemini 2.5 Pro", bedda: true, competitor: false },
      { feature: "Grok 3", bedda: true, competitor: false },
      { feature: "Character roleplay bots", bedda: false, competitor: true },
      { feature: "Code execution sandbox", bedda: true, competitor: false },
      { feature: "Web search", bedda: true, competitor: false },
      { feature: "Image generation", bedda: true, competitor: false },
      { feature: "Video generation", bedda: true, competitor: false },
      { feature: "Knowledge base (RAG)", bedda: true, competitor: false },
      { feature: "Cross-conversation memory", bedda: true, competitor: false },
      { feature: "Model comparison arena", bedda: true, competitor: false },
      { feature: "Team workspaces", bedda: true, competitor: false },
      { feature: "OpenAI-compatible API", bedda: true, competitor: false },
      { feature: "Total AI models", bedda: "36+", competitor: "Proprietary only" },
    ],
    faq: [
      {
        q: "Is Character.AI good for serious work?",
        a: "Character.AI is designed for entertainment, creative roleplay, and social interaction — not professional productivity. It uses proprietary AI tuned for character simulation, not frontier reasoning models like Claude 4 or GPT-5. For coding, research, writing, or data analysis, bedda.ai with Claude 4 and GPT-5 will significantly outperform Character.AI.",
      },
      {
        q: "What do people use Character.AI for?",
        a: "Character.AI is primarily used for entertainment: roleplaying with AI characters, creative storytelling, social companionship, and casual conversation. It has a large teen and young adult user base. It's not a productivity tool and doesn't offer tools like code execution, knowledge base, or web search.",
      },
      {
        q: "Is bedda.ai $2 more worth it vs Character.AI?",
        a: "If your goal is entertainment and roleplay, Character.AI is the right choice at $9.99/mo. If you want to use AI for work — coding, research, writing, analysis — bedda.ai's $12/mo gives you Claude 4, GPT-5, Gemini 2.5 Pro, plus code execution, knowledge base, and image generation. That's a fundamentally different and more capable product.",
      },
      {
        q: "Does bedda.ai have roleplay or character features?",
        a: "bedda.ai is focused on productivity and professional AI use. It doesn't have built-in character personas or roleplay features like Character.AI. You can use custom system instructions to give any model a specific persona, but the platform is designed for serious work, not entertainment roleplay.",
      },
    ],
  },

  "bedda-vs-cursor": {
    slug: "bedda-vs-cursor",
    competitor: "Cursor",
    competitorUrl: "https://cursor.com",
    competitorPrice: "$20/mo",
    beddaPrice: "$12/mo",
    title: "bedda.ai vs Cursor",
    metaTitle: "bedda.ai vs Cursor AI (2026) — Full AI Suite vs Coding IDE",
    metaDescription:
      "Cursor is a $20/mo AI coding IDE. bedda.ai gives you 36+ frontier models for coding AND research, writing, image/video gen, and team workspaces — for $12/mo. 7-day free trial.",
    ogTitle: "bedda.ai vs Cursor — Broader AI for Less Money",
    ogDescription:
      "Cursor is an excellent coding IDE at $20/mo but it's limited to code. bedda.ai gives you Claude 4, GPT-5, Gemini 2.5 Pro and 36+ models for coding, research, writing, and image generation — all for $12/mo.",
    heroHeadline: "Cursor is great for code. bedda.ai works for everything.",
    heroSubtext:
      "Cursor is an AI-powered IDE that's genuinely excellent for coding. But at $20/mo it's 67% more expensive than bedda.ai, and it only does code. bedda.ai gives you 36+ frontier models for coding, research, writing, analysis, image generation, and team collaboration — all in one place.",
    verdict:
      "Cursor is the right choice if your AI use is almost entirely inside a code editor. If you want AI for more than just coding — research, writing, analysis, image generation, customer conversations — bedda.ai at $12/mo gives you a complete AI suite at a lower price. Many developers use both: Cursor for in-editor AI, bedda.ai for everything else.",
    switchReasons: [
      "Save $8/mo — bedda.ai is $12/mo vs Cursor's $20/mo",
      "Use AI for research, writing, and analysis outside the code editor",
      "36+ models vs Cursor's limited model selection (Claude and GPT only)",
      "Image and video generation for design and content work",
      "Knowledge base — upload docs, specs, and codebases for RAG retrieval",
      "Team workspaces with shared AI context and real-time collaboration",
    ],
    rows: [
      { feature: "Monthly price", bedda: "$12/mo", competitor: "$20/mo" },
      { feature: "Claude 4 (Opus, Sonnet)", bedda: true, competitor: true },
      { feature: "GPT-5 / GPT-4o", bedda: true, competitor: true },
      { feature: "Gemini 2.5 Pro", bedda: true, competitor: false },
      { feature: "Grok 3", bedda: true, competitor: false },
      { feature: "DeepSeek R1", bedda: true, competitor: false },
      { feature: "IDE integration (VS Code-style)", bedda: false, competitor: true },
      { feature: "Inline code suggestions", bedda: false, competitor: true },
      { feature: "Code execution sandbox", bedda: true, competitor: false },
      { feature: "Web search", bedda: true, competitor: true },
      { feature: "Image generation", bedda: true, competitor: false },
      { feature: "Video generation", bedda: true, competitor: false },
      { feature: "Knowledge base (RAG)", bedda: true, competitor: false },
      { feature: "Cross-conversation memory", bedda: true, competitor: false },
      { feature: "Model comparison arena", bedda: true, competitor: false },
      { feature: "Team workspaces", bedda: true, competitor: true },
      { feature: "Total AI models", bedda: "36+", competitor: "~4" },
    ],
    faq: [
      {
        q: "Is Cursor worth $20/mo?",
        a: "Cursor is excellent if you spend most of your day in a code editor. The inline suggestions, chat-in-editor experience, and multi-file context awareness are genuinely helpful for coding workflows. At $20/mo it's on the expensive side — bedda.ai is $12/mo and offers a superset of AI capabilities for everything outside the IDE.",
      },
      {
        q: "Can bedda.ai replace Cursor?",
        a: "Not fully. Cursor's in-editor experience (inline suggestions, file context, multi-file edits) is unique to IDE integration. bedda.ai doesn't run as a VS Code extension. However, bedda.ai's code execution sandbox, Claude 4 and GPT-5 access, and broader AI toolset complement Cursor well — many developers use both.",
      },
      {
        q: "What models does Cursor use?",
        a: "Cursor uses Claude Sonnet, GPT-4o, and a few other models. bedda.ai gives you all of those plus Claude 4 Opus, GPT-5, Gemini 2.5 Pro, Grok 3, DeepSeek R1, Mistral Large, and 30+ more — at $8/mo less.",
      },
      {
        q: "What do developers use bedda.ai for alongside Cursor?",
        a: "Developers use bedda.ai for tasks that don't fit in an IDE: researching APIs and libraries, writing technical documentation, comparing how different models explain a concept, generating images for projects, and collaborating with non-technical team members. The model comparison arena is popular for evaluating which model gives the best answer for a specific problem.",
      },
    ],
  },

  "bedda-vs-bolt": {
    slug: "bedda-vs-bolt",
    competitor: "Bolt.new",
    competitorUrl: "https://bolt.new",
    competitorPrice: "$20/mo",
    beddaPrice: "$12/mo",
    title: "bedda.ai vs Bolt.new",
    metaTitle: "bedda.ai vs Bolt.new (2026) — Full AI Suite vs App Generator",
    metaDescription:
      "Bolt.new generates web apps for $20/mo. bedda.ai gives you 36+ frontier models for coding, research, writing, image generation, and team workspaces — for $12/mo. 7-day free trial.",
    ogTitle: "bedda.ai vs Bolt.new — Broader AI for Less Money",
    ogDescription:
      "Bolt.new generates full-stack apps for $20/mo but is limited to app building. bedda.ai gives you Claude 4, GPT-5, Gemini 2.5 Pro, and 36+ models for coding, research, writing, and image/video generation — for $12/mo.",
    heroHeadline: "Bolt.new builds apps. bedda.ai powers your entire workflow.",
    heroSubtext:
      "Bolt.new is impressive for generating web apps quickly, but at $20/mo it's a single-purpose tool. bedda.ai gives you 36+ frontier models for every AI task — coding, research, writing, image and video generation, team workspaces, and more — for $8 less per month.",
    verdict:
      "Bolt.new is the right choice if you're specifically building web applications via natural language and want the visual editor experience. For broader AI productivity — coding help, research, writing, image generation, team collaboration — bedda.ai at $12/mo delivers more value. The two tools can complement each other: use Bolt for rapid prototyping, bedda for everything else.",
    switchReasons: [
      "Save $8/mo — bedda.ai is $12/mo vs Bolt.new's $20/mo",
      "Use Claude 4, GPT-5, and Gemini 2.5 Pro for research and writing beyond app building",
      "36+ models vs Bolt's limited model selection",
      "Knowledge base — upload project specs, APIs, and docs for reference",
      "Image and video generation for design and content alongside code",
      "Team workspaces with shared AI context for non-technical collaborators",
    ],
    rows: [
      { feature: "Monthly price", bedda: "$12/mo", competitor: "$20/mo" },
      { feature: "Claude 4 (Opus, Sonnet)", bedda: true, competitor: true },
      { feature: "GPT-5 / GPT-4o", bedda: true, competitor: true },
      { feature: "Gemini 2.5 Pro", bedda: true, competitor: false },
      { feature: "Grok 3", bedda: true, competitor: false },
      { feature: "Full-stack app generation", bedda: false, competitor: true },
      { feature: "Visual app editor", bedda: false, competitor: true },
      { feature: "One-click deploy", bedda: false, competitor: true },
      { feature: "Code execution sandbox", bedda: true, competitor: true },
      { feature: "Web search", bedda: true, competitor: false },
      { feature: "Image generation", bedda: true, competitor: false },
      { feature: "Video generation", bedda: true, competitor: false },
      { feature: "Knowledge base (RAG)", bedda: true, competitor: false },
      { feature: "Cross-conversation memory", bedda: true, competitor: false },
      { feature: "Model comparison arena", bedda: true, competitor: false },
      { feature: "Team workspaces", bedda: true, competitor: false },
      { feature: "Total AI models", bedda: "36+", competitor: "~3" },
    ],
    faq: [
      {
        q: "Is Bolt.new worth $20/mo?",
        a: "Bolt.new is impressive if you want to build web apps by describing them in natural language. The visual editor and one-click deploy are genuinely useful. At $20/mo, it's 67% more expensive than bedda.ai and is limited to app building — if you also need AI for research, writing, or image generation, you'd need to pay for additional tools.",
      },
      {
        q: "Can bedda.ai generate web apps like Bolt.new?",
        a: "bedda.ai can help you write and debug code, explain architecture, and generate UI components — but it doesn't have Bolt's visual editor or one-click deployment. bedda.ai's code execution sandbox runs Python and JavaScript but isn't a full web app builder. The two tools serve different needs and can work well together.",
      },
      {
        q: "What's the difference between Bolt, Lovable, and bedda.ai?",
        a: "Bolt.new and Lovable are specialized app-generation tools — they're excellent for quickly spinning up web applications by describing what you want. bedda.ai is a general-purpose AI suite with 36+ models, code execution, knowledge base, image/video generation, and team workspaces. Bedda handles the full range of AI productivity tasks that Bolt and Lovable don't cover.",
      },
      {
        q: "What do vibe coders use bedda.ai for?",
        a: "Developers using Bolt, Lovable, or Cursor often use bedda.ai alongside them for tasks that don't fit in those tools: researching libraries and APIs, writing product descriptions and docs, comparing how different AI models approach a problem, generating images and videos for their projects, and collaborating with non-technical teammates.",
      },
    ],
  },

  "bedda-vs-windsurf": {
    slug: "bedda-vs-windsurf",
    competitor: "Windsurf (Codeium)",
    competitorUrl: "https://windsurf.com",
    competitorPrice: "$15/mo",
    beddaPrice: "$12/mo",
    title: "bedda.ai vs Windsurf AI",
    metaTitle: "bedda.ai vs Windsurf AI (2026) — Full AI Suite vs Coding IDE",
    metaDescription:
      "Windsurf by Codeium is a $15/mo AI coding IDE. bedda.ai gives you 36+ frontier models for coding AND everything else — research, writing, image/video gen, team workspaces — for $12/mo. 7-day free trial.",
    ogTitle: "bedda.ai vs Windsurf — Cheaper and Broader AI",
    ogDescription:
      "Windsurf is a solid AI coding IDE at $15/mo. bedda.ai gives you Claude 4, GPT-5, Gemini 2.5 Pro, and 36+ models for coding, research, writing, and image/video generation — for $3 less per month.",
    heroHeadline: "Windsurf codes. bedda.ai does everything.",
    heroSubtext:
      "Windsurf by Codeium is a capable AI coding assistant. But at $15/mo it only handles code. bedda.ai gives you 36+ frontier models for coding, research, writing, analysis, image and video generation, and team collaboration — for $3 less per month.",
    verdict:
      "Windsurf is a solid AI coding IDE at a fair price. If your AI use is exclusively in the code editor, Windsurf is worth considering. If you want AI capabilities beyond coding — research, writing, image generation, team workspaces — bedda.ai at $12/mo covers everything Windsurf does (via its code execution sandbox) plus a full AI productivity suite.",
    switchReasons: [
      "Save $3/mo — bedda.ai is $12/mo vs Windsurf's $15/mo",
      "36+ frontier models including Gemini 2.5 Pro, Grok 3, and DeepSeek R1",
      "Research, writing, and analysis beyond the code editor",
      "Image and video generation for design alongside code",
      "Knowledge base — upload docs, specs, and API references for retrieval",
      "Team workspaces with shared AI context for mixed technical/non-technical teams",
    ],
    rows: [
      { feature: "Monthly price", bedda: "$12/mo", competitor: "$15/mo" },
      { feature: "Claude 4 (Opus, Sonnet)", bedda: true, competitor: true },
      { feature: "GPT-5 / GPT-4o", bedda: true, competitor: true },
      { feature: "Gemini 2.5 Pro", bedda: true, competitor: false },
      { feature: "Grok 3", bedda: true, competitor: false },
      { feature: "DeepSeek R1", bedda: true, competitor: false },
      { feature: "IDE integration (VS Code-style)", bedda: false, competitor: true },
      { feature: "Inline code completions", bedda: false, competitor: true },
      { feature: "Code execution sandbox", bedda: true, competitor: false },
      { feature: "Web search", bedda: true, competitor: false },
      { feature: "Image generation", bedda: true, competitor: false },
      { feature: "Video generation", bedda: true, competitor: false },
      { feature: "Knowledge base (RAG)", bedda: true, competitor: false },
      { feature: "Cross-conversation memory", bedda: true, competitor: false },
      { feature: "Model comparison arena", bedda: true, competitor: false },
      { feature: "Team workspaces", bedda: true, competitor: true },
      { feature: "Total AI models", bedda: "36+", competitor: "~4" },
    ],
    faq: [
      {
        q: "Is Windsurf better than Cursor?",
        a: "Both Windsurf and Cursor are capable AI coding IDEs with similar feature sets. Windsurf is $5/mo cheaper ($15 vs $20) and has a simpler flow state model. Cursor has broader model support and a slightly larger ecosystem. Both are specialized coding tools — for AI beyond coding, bedda.ai at $12/mo covers the rest.",
      },
      {
        q: "What is Codeium / Windsurf?",
        a: "Codeium was an AI code assistant that rebranded to Windsurf in 2025 after launching their AI IDE product. They offer both a free tier (autocomplete only) and a paid Pro plan at $15/mo for full chat, multi-file context, and access to premium models including Claude Sonnet and GPT-4o.",
      },
      {
        q: "Can bedda.ai replace Windsurf?",
        a: "Partially. bedda.ai doesn't run as a VS Code extension with inline suggestions. For in-editor AI, Windsurf has the native experience. For everything outside the editor — research, writing, image generation, team collaboration, model comparisons — bedda.ai covers what Windsurf can't. Many developers use both.",
      },
      {
        q: "What models does Windsurf use?",
        a: "Windsurf Pro includes Claude Sonnet, GPT-4o, and Codeium's own models. bedda.ai gives you all of those plus Claude 4 Opus, GPT-5, Gemini 2.5 Pro, Grok 3, DeepSeek R1, Mistral Large, and 30+ more — at $3/mo less.",
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
  if (!data) return {};
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
  if (!data) notFound();

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
