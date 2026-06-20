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
