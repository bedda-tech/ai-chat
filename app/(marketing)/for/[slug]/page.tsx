import { ArrowRight, Check, Star } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";

type UseCase = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  heroHeadline: string;
  heroSubtext: string;
  tagline: string;
  bestModels: { name: string; reason: string }[];
  features: { title: string; description: string }[];
  useCaseExamples: string[];
  testimonials: { quote: string; author: string; role: string }[];
  faq: { q: string; a: string }[];
  ctaHeadline: string;
};

const USE_CASES: Record<string, UseCase> = {
  developers: {
    slug: "developers",
    title: "AI for Developers",
    metaTitle: "Best AI for Developers (2026) — 36+ Models, One Subscription",
    metaDescription:
      "Get GPT-5, Claude 4, Gemini 2.5 and 36+ AI models for coding, code review, debugging, and architecture — all for $12/mo. Try free for 7 days.",
    heroHeadline: "The AI coding assistant that doesn't lock you in",
    heroSubtext:
      "GPT-5 for code generation. Claude for code review. Gemini for large codebases. DeepSeek for reasoning. Get every AI coding model in one place — $12/mo.",
    tagline: "Used by developers who refuse to be stuck with one model",
    bestModels: [
      { name: "GPT-5", reason: "Code generation and autocomplete" },
      { name: "Claude 4 Sonnet", reason: "Code review and refactoring" },
      { name: "Gemini 2.5 Pro", reason: "Large codebase analysis (1M token context)" },
      { name: "DeepSeek R1", reason: "Complex algorithmic reasoning" },
      { name: "Phind / Groq Llama", reason: "Fast iteration and quick lookups" },
    ],
    features: [
      {
        title: "Code execution sandbox",
        description:
          "Run Python and JavaScript in a secure E2B sandbox — test snippets, debug output, prototype algorithms without leaving the chat.",
      },
      {
        title: "Switch models mid-task",
        description:
          "Start a PR review with Claude, verify edge cases with GPT-5, then run the algorithm through DeepSeek R1 — no app switching, no separate subscriptions.",
      },
      {
        title: "Knowledge base for your codebase",
        description:
          "Upload docs, architecture notes, or API specs. Every model in your chat can reference them via RAG — no copy-pasting context every session.",
      },
      {
        title: "Model arena for code review",
        description:
          "Paste a function and get side-by-side feedback from Claude, GPT-5 and Gemini simultaneously. See which model catches more bugs.",
      },
      {
        title: "OpenAI-compatible API",
        description:
          "One API key, 36+ models. Swap between GPT-5, Claude, and Gemini programmatically — no provider-specific SDKs required.",
      },
      {
        title: "Web search for current docs",
        description:
          "Ask about a library released last week — bedda searches the web in real-time so models have current documentation, not stale training data.",
      },
    ],
    useCaseExamples: [
      "Review this PR for security vulnerabilities",
      "Explain this algorithm and suggest optimizations",
      "Write unit tests for this React component",
      "Debug this Rust ownership error",
      "Design the database schema for this feature",
      "Translate this Python script to TypeScript",
    ],
    testimonials: [
      {
        quote:
          "I use Claude for code reviews and GPT-5 for generation. bedda lets me switch in one click instead of juggling two tabs.",
        author: "Alex T.",
        role: "Senior Backend Engineer",
      },
      {
        quote:
          "The model arena is genuinely useful — I paste a tricky SQL query and see which model gets the optimization right.",
        author: "Jamie L.",
        role: "Data Engineer",
      },
      {
        quote:
          "Saved $28/mo canceling ChatGPT Plus and Claude Pro. bedda gives me both plus Gemini's 1M token context for long files.",
        author: "Morgan K.",
        role: "Staff Software Engineer",
      },
    ],
    faq: [
      {
        q: "Which AI model is best for coding?",
        a: "It depends on the task. GPT-5 leads for code generation. Claude excels at code review and explanation. Gemini 2.5 Pro handles massive codebases with its 1M token context. DeepSeek R1 is best for algorithmic reasoning. bedda lets you use all of them.",
      },
      {
        q: "Does bedda have GitHub Copilot-style autocomplete?",
        a: "bedda is a chat interface, not an IDE plugin. For inline autocomplete, keep your IDE plugin. Use bedda for everything else: code review, architecture discussions, debugging sessions, explaining unfamiliar code.",
      },
      {
        q: "Can I use bedda via API in my own tools?",
        a: "Yes. bedda exposes an OpenAI-compatible API endpoint so you can route to any of our 36+ models using the same SDK you already use.",
      },
      {
        q: "How does the code execution sandbox work?",
        a: "When you ask bedda to run code, it executes in a secure E2B cloud sandbox. Python and JavaScript are supported. Results come back in the same chat thread.",
      },
      {
        q: "Is my code shared or used for training?",
        a: "No. bedda passes your messages directly to model providers (Anthropic, OpenAI, Google, etc.) under their API terms, which exclude training on API data. Your code stays private.",
      },
    ],
    ctaHeadline: "Stop juggling coding AI tools. Get all of them.",
  },

  writers: {
    slug: "writers",
    title: "AI for Writers",
    metaTitle: "Best AI Writing Assistant (2026) — 36+ Models for $12/mo",
    metaDescription:
      "Claude for tone and style, GPT-5 for structure, Gemini for research — get every AI writing model for $12/mo. No per-model subscriptions. 7-day free trial.",
    heroHeadline: "Every AI writing model. One affordable subscription.",
    heroSubtext:
      "Claude for nuanced prose. GPT-5 for structured content. Gemini for research-backed writing. Mistral for fast drafts. All 36+ models, one place, $12/mo.",
    tagline: "Writers who use the right model for each job",
    bestModels: [
      { name: "Claude 4 Opus", reason: "Long-form prose, tone, and voice" },
      { name: "GPT-5", reason: "Structured articles and copywriting" },
      { name: "Gemini 2.5 Pro", reason: "Research synthesis and fact-checking" },
      { name: "Mistral Large", reason: "Fast first drafts" },
      { name: "DeepSeek R1", reason: "Analytical and argument-driven writing" },
    ],
    features: [
      {
        title: "Switch models by content type",
        description:
          "Use Claude for literary essays, GPT-5 for marketing copy, Gemini for research articles. Different writing tasks need different models.",
      },
      {
        title: "Knowledge base for your research",
        description:
          "Upload PDFs, notes, and source documents. Any model can reference them via RAG — stop re-pasting context into every session.",
      },
      {
        title: "Artifacts for long documents",
        description:
          "Work on blog posts, essays, and reports in bedda's document editor. Save versions, export to markdown, and keep iterating without losing history.",
      },
      {
        title: "Web search for current facts",
        description:
          "Ask about a news story from yesterday or a statistic from this quarter — bedda searches the web so your writing is grounded in current information.",
      },
      {
        title: "Model comparison for A/B copy",
        description:
          "Generate the same headline or intro paragraph from 2-4 models simultaneously and pick the best one — faster than iteration.",
      },
      {
        title: "Custom instructions per project",
        description:
          "Save your brand voice, target audience, and style guide once. Every chat in that project starts with the right context automatically.",
      },
    ],
    useCaseExamples: [
      "Write a 1,500-word blog post about sustainable investing",
      "Rewrite this product description to target Gen Z",
      "Generate 10 headline variations for this article",
      "Edit this paragraph for clarity without changing the voice",
      "Create a content calendar for Q3 with 12 topic ideas",
      "Write a cold email sequence for SaaS onboarding",
    ],
    testimonials: [
      {
        quote:
          "Claude writes with better voice than anything else. But I use GPT-5 when I need structured listicles. bedda lets me pick without switching apps.",
        author: "Sarah M.",
        role: "Content Strategist",
      },
      {
        quote:
          "I upload my client's brand guidelines once and every model in that project understands the tone automatically.",
        author: "David R.",
        role: "Freelance Copywriter",
      },
      {
        quote:
          "The model arena changed how I write headlines. I generate 4 variations from different models and pick the winner in 30 seconds.",
        author: "Chen W.",
        role: "Newsletter Author",
      },
    ],
    faq: [
      {
        q: "Which AI model is best for writing?",
        a: "Claude 4 is widely regarded as the best for natural, nuanced prose and long-form content. GPT-5 excels at structured writing like listicles and email copy. Gemini 2.5 Pro is excellent for research-heavy content. bedda lets you use all three.",
      },
      {
        q: "Is bedda better than Jasper or Writesonic?",
        a: "bedda uses the same frontier models (Claude, GPT-5, Gemini) that power those tools — without the 3x markup. Jasper Pro starts at $39/mo; bedda Plus is $12/mo with access to every model Jasper uses.",
      },
      {
        q: "Can I save my writing style preferences?",
        a: "Yes. Custom instructions let you save your voice, audience, and tone guidelines. Projects let you store style guides in the knowledge base for each client or publication.",
      },
      {
        q: "Does bedda have a document editor?",
        a: "Yes. bedda's artifacts system lets you create and iterate on long documents in-app. You can export to markdown, view version history, and share with others.",
      },
      {
        q: "Can I do SEO writing with bedda?",
        a: "Yes — combine web search (for current data and competitor research) with the model of your choice. You can also paste briefs and outlines directly into the knowledge base for consistent context.",
      },
    ],
    ctaHeadline: "The AI writing assistant that uses the best model for each job.",
  },

  students: {
    slug: "students",
    title: "AI for Students",
    metaTitle: "Best AI for Students (2026) — 36+ Models for $12/mo",
    metaDescription:
      "Use Claude for essays, GPT-5 for problem-solving, Gemini for research — all 36+ AI models for $12/mo. Perfect for university students. 7-day free trial.",
    heroHeadline: "Study smarter with every AI model — not just one",
    heroSubtext:
      "Claude for writing. GPT-5 for math and problem-solving. Gemini for research synthesis. DeepSeek for logical reasoning. All 36+ AI models, one subscription.",
    tagline: "Students who want the right AI for each assignment",
    bestModels: [
      { name: "Claude 4 Sonnet", reason: "Essay writing and academic prose" },
      { name: "GPT-5", reason: "Math, physics, and problem sets" },
      { name: "Gemini 2.5 Pro", reason: "Research synthesis and long PDFs" },
      { name: "DeepSeek R1", reason: "Step-by-step logical reasoning" },
      { name: "Claude 3.5 Haiku", reason: "Quick explanations and definitions" },
    ],
    features: [
      {
        title: "Upload course materials to your knowledge base",
        description:
          "Upload lecture notes, textbooks, and papers. Ask any model questions and get answers grounded in your actual course materials.",
      },
      {
        title: "Cross-conversation memory",
        description:
          "bedda remembers facts across sessions — your major, your courses, preferred explanation style. No re-introducing yourself every time.",
      },
      {
        title: "Switch models for different subjects",
        description:
          "Use GPT-5 for technical problem-solving, Claude for humanities essays, Gemini for science research. The right tool for each assignment.",
      },
      {
        title: "Web search for current sources",
        description:
          "Ask about recent studies, news events, or current statistics — bedda searches the web so answers reference real, up-to-date sources.",
      },
      {
        title: "Deep research agent",
        description:
          "Turn on agent mode and bedda runs multi-step research: searching, reading, cross-referencing, and synthesizing — like having a research assistant.",
      },
      {
        title: "Explain like I'm a beginner",
        description:
          "Tell bedda your background once and it calibrates explanations automatically — no more copy-pasting 'explain this simply' every time.",
      },
    ],
    useCaseExamples: [
      "Explain the central limit theorem with examples",
      "Help me outline a 10-page essay on climate policy",
      "Summarize these 3 research papers for my literature review",
      "Solve this differential equation step-by-step",
      "Write a thesis statement for this argument",
      "Quiz me on the French Revolution until I get it right",
    ],
    testimonials: [
      {
        quote:
          "GPT-5 is better at math proofs. Claude is better at history essays. bedda lets me pick instead of paying for both.",
        author: "Priya K.",
        role: "Computer Science student",
      },
      {
        quote:
          "I uploaded my entire semester's lecture notes. Now any AI model can answer questions based on what my professor actually said.",
        author: "Marcus T.",
        role: "Biology student",
      },
      {
        quote:
          "The deep research agent is wild — I asked it to compare three competing theories for my thesis and it came back with a full synthesis.",
        author: "Emma S.",
        role: "Political Science PhD student",
      },
    ],
    faq: [
      {
        q: "Which AI model is best for students?",
        a: "It depends on the subject. Claude 4 is best for writing-heavy assignments like essays and literary analysis. GPT-5 excels at STEM problem-solving. Gemini handles long PDFs and research synthesis well. bedda gives you all three.",
      },
      {
        q: "Is using AI for studying allowed?",
        a: "Policies vary by institution. Many schools permit AI for research, brainstorming, and explanation — but not for submitting AI-written work as your own. Always check your academic integrity policy.",
      },
      {
        q: "Can bedda help with math and coding?",
        a: "Yes. GPT-5 and DeepSeek R1 are particularly strong at math. For coding, bedda can run code in a sandbox and explain errors step-by-step.",
      },
      {
        q: "How is bedda different from Khan Academy or Chegg?",
        a: "bedda is a general-purpose AI platform that happens to be excellent for studying — it's not courseware. Think of it as a private tutor who knows every subject and can explain things in your own terms.",
      },
      {
        q: "Is there a student discount?",
        a: "bedda Plus starts at $12/mo — already cheaper than Chegg ($15.95/mo), ChatGPT Plus ($20/mo), or Claude Pro ($20/mo). No student ID required.",
      },
    ],
    ctaHeadline: "The only AI subscription built for every subject.",
  },

  researchers: {
    slug: "researchers",
    title: "AI for Researchers",
    metaTitle: "Best AI for Research (2026) — 36+ Models, One Subscription",
    metaDescription:
      "Gemini 2.5 Pro for long documents, Claude for synthesis, GPT-5 for analysis — 36+ AI research tools for $12/mo. Knowledge base RAG included. 7-day free trial.",
    heroHeadline: "AI that handles million-token documents and deep synthesis",
    heroSubtext:
      "Gemini 2.5 Pro for 1M-token literature reviews. Claude for synthesis and nuance. DeepSeek for logical analysis. All in one place — knowledge base included.",
    tagline: "Researchers who need AI that reads entire papers, not summaries",
    bestModels: [
      { name: "Gemini 2.5 Pro", reason: "1M token context for full papers and datasets" },
      { name: "Claude 4 Opus", reason: "Nuanced synthesis and argument analysis" },
      { name: "DeepSeek R1", reason: "Logical reasoning and hypothesis testing" },
      { name: "GPT-5", reason: "Structured analysis and data interpretation" },
      { name: "Gemini 2.5 Flash", reason: "Fast pass through large document sets" },
    ],
    features: [
      {
        title: "Knowledge base with RAG",
        description:
          "Upload papers, datasets, and notes. bedda embeds them with pgvector and retrieves relevant passages in every conversation — across all 36+ models.",
      },
      {
        title: "Google Drive and Notion import",
        description:
          "Connect your Drive or Notion workspace and import documents directly to your knowledge base — no manual uploading of every paper.",
      },
      {
        title: "Deep research agent (multi-step)",
        description:
          "Turn on agent mode to run multi-step research loops: searching the web, reading sources, cross-referencing papers, and synthesizing findings automatically.",
      },
      {
        title: "Project-scoped knowledge base",
        description:
          "Create a Project for each research topic with its own knowledge base. Switch between projects and the right context loads automatically.",
      },
      {
        title: "Model comparison for hypothesis testing",
        description:
          "Run the same research question through multiple models simultaneously and compare reasoning quality — useful for sanity-checking interpretations.",
      },
      {
        title: "Custom instructions per project",
        description:
          "Save your domain vocabulary, research questions, and methodology notes per project. Every model session starts with full context.",
      },
    ],
    useCaseExamples: [
      "Summarize the key findings across these 5 papers on CRISPR delivery",
      "What are the methodological limitations in this study?",
      "Find contradictions between these two meta-analyses",
      "Generate a research question based on this literature gap",
      "Translate this technical report for a non-specialist audience",
      "Structure a literature review outline from these 20 papers",
    ],
    testimonials: [
      {
        quote:
          "Gemini's 1M context window is the only reason I can load an entire dissertation into one chat. bedda is the only way I can access it without paying Google separately.",
        author: "Dr. Ananya P.",
        role: "Postdoctoral Researcher, Biomedical Engineering",
      },
      {
        quote:
          "I use Claude for synthesis and GPT-5 for structured analysis. Switching between them in bedda saves me hours of copy-pasting between tabs.",
        author: "Omar F.",
        role: "PhD Candidate, Political Science",
      },
      {
        quote:
          "The project-scoped knowledge base is underrated. I have separate projects for each grant proposal, each with their own uploaded background literature.",
        author: "Lisa B.",
        role: "Research Scientist",
      },
    ],
    faq: [
      {
        q: "Which AI model is best for academic research?",
        a: "Gemini 2.5 Pro is unmatched for large documents with its 1M token context. Claude 4 Opus is best for nuanced synthesis and writing. DeepSeek R1 handles logical reasoning and hypothesis analysis well. bedda gives you all of them.",
      },
      {
        q: "Can I upload full research papers?",
        a: "Yes. Upload PDFs, Word docs, or plain text files to your knowledge base. bedda chunks and embeds them — any model can then answer questions grounded in your uploaded papers.",
      },
      {
        q: "Does bedda have web search for recent publications?",
        a: "Yes. bedda has built-in web search (Brave Search API) so models can find recent papers, preprints, and news — not just their training data.",
      },
      {
        q: "How is bedda different from Elicit or Consensus?",
        a: "Those tools are specialized for academic paper search. bedda is a multi-model AI assistant that can search papers AND synthesize them, write sections, run code analysis, and switch models as needed — a broader research workflow tool.",
      },
      {
        q: "Is my research data private?",
        a: "Yes. bedda passes queries directly to model providers' APIs, which exclude API data from training. Your uploaded documents are stored in your private knowledge base and never shared.",
      },
    ],
    ctaHeadline: "The only AI platform built for the depth research demands.",
  },

  business: {
    slug: "business",
    title: "AI for Business",
    metaTitle: "Best AI for Business Teams (2026) — 36+ Models for $12/mo",
    metaDescription:
      "Claude for client comms, GPT-5 for analysis, Gemini for presentations — all 36+ AI models for $12/mo per seat. Team workspaces included. 7-day free trial.",
    heroHeadline: "The AI platform your whole team can actually afford",
    heroSubtext:
      "Claude for emails and reports. GPT-5 for data analysis. Gemini for presentations. Team workspaces, shared knowledge base, and custom instructions — $12/mo per user.",
    tagline: "Teams who need AI for every department, not just one",
    bestModels: [
      { name: "Claude 4 Sonnet", reason: "Client communications and reports" },
      { name: "GPT-5", reason: "Data analysis and structured summaries" },
      { name: "Gemini 2.5 Pro", reason: "Large document review and presentations" },
      { name: "Mistral Large", reason: "Fast drafting and internal comms" },
      { name: "Grok 3", reason: "Real-time market and news analysis" },
    ],
    features: [
      {
        title: "Team workspaces with shared context",
        description:
          "Create team workspaces where members share a knowledge base, conversation history, and custom instructions. Everyone works from the same context.",
      },
      {
        title: "Custom instructions per team",
        description:
          "Set company voice, brand guidelines, and department-specific context once. Every AI session starts with the right business context automatically.",
      },
      {
        title: "Knowledge base for company docs",
        description:
          "Upload product docs, brand guidelines, pricing sheets, and internal policies. Every model in every team chat can reference them via RAG.",
      },
      {
        title: "Bot integrations for your workflow",
        description:
          "bedda's Slack, Teams, Discord, and GitHub bots bring AI into your existing workflow — your team doesn't need to learn a new app.",
      },
      {
        title: "OpenAI-compatible API",
        description:
          "Integrate bedda's 36+ models into your internal tools with one API key. No need to manage separate keys for each model provider.",
      },
      {
        title: "Enterprise model policies",
        description:
          "Control which models your team can use, set monthly cost caps, and audit all AI activity from the admin dashboard.",
      },
    ],
    useCaseExamples: [
      "Draft a client proposal based on this RFP",
      "Summarize yesterday's earnings call transcript",
      "Create a slide deck outline for the Q3 all-hands",
      "Write 5 variations of this product announcement email",
      "Analyze this customer feedback dataset for themes",
      "Review this contract for unusual clauses",
    ],
    testimonials: [
      {
        quote:
          "We replaced 3 separate AI subscriptions with bedda. Our whole team gets Claude, GPT-5 and Gemini at a fraction of the cost.",
        author: "Rachel L.",
        role: "Head of Operations",
      },
      {
        quote:
          "The Slack bot integration means our team doesn't even need to learn another tool. They just @bedda in any channel.",
        author: "James O.",
        role: "CTO, Series A Startup",
      },
      {
        quote:
          "We uploaded our brand guidelines and product docs once. Now every AI response is on-brand by default — no more correcting off-voice copy.",
        author: "Nina T.",
        role: "Marketing Director",
      },
    ],
    faq: [
      {
        q: "How does bedda compare to Microsoft Copilot for business?",
        a: "Copilot Pro costs $20/user/mo and integrates with Microsoft 365. bedda is $12/user/mo and gives you Claude, GPT-5, Gemini, Grok and 25+ additional models — no Microsoft 365 subscription required.",
      },
      {
        q: "Can I control which models my team uses?",
        a: "Yes. Enterprise model policies let admins allowlist/denylist specific models and set monthly cost caps per team.",
      },
      {
        q: "Is there SSO support?",
        a: "Yes. bedda supports SAML-based SSO via WorkOS, which integrates with Okta, Azure AD, Google Workspace and other major identity providers.",
      },
      {
        q: "How does team billing work?",
        a: "Each team member gets their own Plus or Pro subscription, managed from a central team admin dashboard. Annual billing is available for a 20% discount.",
      },
      {
        q: "Is there an API for internal integrations?",
        a: "Yes. bedda exposes an OpenAI-compatible API endpoint. Use your existing OpenAI SDK — just point the base URL at bedda to access all 36+ models with one key.",
      },
    ],
    ctaHeadline: "One AI platform. Every model. Every department.",
  },

  marketing: {
    slug: "marketing",
    title: "AI for Marketers",
    metaTitle: "Best AI for Marketing (2026) — 36+ Models for Campaigns, Copy & Strategy",
    metaDescription:
      "Claude for brand voice, GPT-5 for copy, Gemini for research — get every AI marketing model for $12/mo. Web search for trend research, knowledge base for brand docs, team workspaces. 7-day free trial.",
    heroHeadline: "Every AI marketing model. One affordable subscription.",
    heroSubtext:
      "Claude for brand-consistent copy. GPT-5 for high-volume content. Gemini for competitive research. Mistral for fast first drafts. All 36+ models, built-in web search, and team workspaces — $12/mo.",
    tagline: "Marketing teams that use the right model for every campaign",
    bestModels: [
      { name: "Claude 4 Opus", reason: "Brand voice, tone consistency, long-form campaigns" },
      { name: "GPT-5", reason: "Ad copy, email sequences, high-volume content" },
      { name: "Gemini 2.5 Pro", reason: "Competitive research and trend analysis" },
      { name: "Mistral Large", reason: "Fast first drafts and content variations" },
      { name: "Grok 3", reason: "Social media copy and real-time trend angles" },
    ],
    features: [
      {
        title: "Web search for real-time research",
        description:
          "Research competitors, trending topics, and industry news in real-time. Ask bedda to find what's trending in your niche and get citation-backed summaries — no separate browser tab needed.",
      },
      {
        title: "Knowledge base for brand assets",
        description:
          "Upload your brand guidelines, tone-of-voice docs, product specs, and past campaigns. Every model references them automatically — so output is always on-brand, even for new team members.",
      },
      {
        title: "Team workspaces for campaign collaboration",
        description:
          "Share chat threads with your team. A copywriter and strategist can iterate on the same campaign brief, with shared context and real-time collaboration.",
      },
      {
        title: "Model comparison arena for A/B testing copy",
        description:
          "Paste your ad brief and get 4 different copy angles from Claude, GPT-5, Gemini, and Grok simultaneously. Pick the best performer without writing 4 separate prompts.",
      },
      {
        title: "Image generation for campaign visuals",
        description:
          "Generate concept images, mood boards, and social media visuals with DALL-E 3, Imagen 3, or Flux — all in the same conversation where you're writing the copy.",
      },
      {
        title: "Custom instructions for your brand",
        description:
          "Set your brand voice, target audience, and style preferences once. Every conversation with every model follows them automatically — no re-briefing every session.",
      },
    ],
    useCaseExamples: [
      "Write 10 Facebook ad variations for this product launch",
      "Research what our top 3 competitors are saying about this topic",
      "Create a 6-email drip campaign for new trial users",
      "Summarize this 50-page market research report",
      "Write LinkedIn posts for our CEO's thought leadership calendar",
      "Generate 30-day content calendar ideas for our Instagram",
    ],
    testimonials: [
      {
        quote:
          "I use Claude for long-form blog posts and GPT-5 for email sequences. bedda lets me run both in one place — saves me two separate subscriptions.",
        author: "Sarah M.",
        role: "Content Marketing Manager",
      },
      {
        quote:
          "The model arena is my new A/B test tool. I paste an ad headline brief and get 4 versions instantly. The team picks the best one before we test it.",
        author: "Daniel R.",
        role: "Paid Acquisition Lead",
      },
      {
        quote:
          "We uploaded our brand guidelines to the knowledge base. Every model follows our voice now. New contractors are instantly on-brand.",
        author: "Priya K.",
        role: "Brand Director",
      },
    ],
    faq: [
      {
        q: "Which AI model is best for marketing copy?",
        a: "It depends on the task. GPT-5 excels at high-volume copy — ads, emails, CTAs. Claude 4 Opus is best for brand-consistent long-form content and nuanced tone. Gemini 2.5 Pro handles competitive research and data synthesis. bedda gives you all three for $12/mo.",
      },
      {
        q: "Can bedda search the web for marketing research?",
        a: "Yes. bedda's web search tool lets any model pull real-time data — competitor analysis, trending topics, recent news, SEO keywords — and synthesize it into actionable insights in the same conversation.",
      },
      {
        q: "How do team workspaces work for marketing teams?",
        a: "Team members share a workspace where chat threads are visible to the whole team. You can share a campaign brief thread so copywriters, designers, and strategists all have the same AI context. No re-explaining the brief to each person's AI.",
      },
      {
        q: "Can I use bedda for social media content at scale?",
        a: "Yes. Use GPT-5 for volume — generating 30 post variations from a brief. Use Claude for quality-checking tone. Use the model arena to compare angles. bedda's unlimited Plus plan means no per-message cost for high-volume workflows.",
      },
      {
        q: "Is my marketing data private?",
        a: "Yes. Messages go directly to model providers (Anthropic, OpenAI, Google) under their API terms, which exclude training on API data. bedda does not read, use, or sell your marketing content.",
      },
    ],
    ctaHeadline: "Stop paying for three AI tools. Get all of them in one.",
  },

  finance: {
    slug: "finance",
    title: "AI for Finance Professionals",
    metaTitle: "Best AI for Finance (2026) — Analysis, Modeling & Research at $12/mo",
    metaDescription:
      "DeepSeek R1 for quantitative reasoning, GPT-5 for financial analysis, Claude for report writing — get every AI finance model for $12/mo. Code execution for Python modeling. 7-day free trial.",
    heroHeadline: "The AI assistant that handles numbers, not just words.",
    heroSubtext:
      "GPT-5 for financial analysis and modeling. DeepSeek R1 for quantitative reasoning. Claude 4 for clear, precise report writing. Gemini 2.5 Pro for processing massive documents. All in one place — $12/mo.",
    tagline: "Finance professionals who trust models that show their work",
    bestModels: [
      { name: "GPT-5", reason: "Financial analysis, modeling guidance, and data interpretation" },
      { name: "DeepSeek R1", reason: "Quantitative reasoning, math-heavy problems, and step-by-step derivations" },
      { name: "Claude 4 Opus", reason: "Clear financial writing, board reports, and client-facing documents" },
      { name: "Gemini 2.5 Pro", reason: "Processing lengthy 10-Ks, contracts, and multi-hundred-page reports" },
      { name: "Groq Llama 3.3", reason: "Fast lookups and quick calculations" },
    ],
    features: [
      {
        title: "Code execution for Python financial modeling",
        description:
          "Run Python directly in the chat — calculate IRR, build DCF models, run Monte Carlo simulations, and plot results. No Jupyter notebook required. E2B sandbox, clean and isolated.",
      },
      {
        title: "1M token context for long documents",
        description:
          "Gemini 2.5 Pro handles 1 million tokens — that's a full 10-K filing, multiple earnings transcripts, or a 500-page legal agreement in one conversation without truncation.",
      },
      {
        title: "Knowledge base for internal docs",
        description:
          "Upload valuation models, internal guidelines, industry data, or proprietary research. Every model references them in conversation — your institutional knowledge embedded in every query.",
      },
      {
        title: "Structured data extraction",
        description:
          "Extract tables, financial figures, and key metrics from uploaded PDFs and documents. Ask models to structure the output as JSON or CSV for downstream use.",
      },
      {
        title: "Web search for market research",
        description:
          "Pull real-time price data, earnings releases, regulatory filings, and analyst commentary. Models synthesize the findings with citations — faster than manual research.",
      },
      {
        title: "Model comparison for high-stakes analysis",
        description:
          "Run the same valuation question through DeepSeek R1, GPT-5, and Claude simultaneously. Use the arena to spot where models agree — and disagree — before committing to a view.",
      },
    ],
    useCaseExamples: [
      "Build a DCF model for this company using these assumptions",
      "Summarize the risk factors from this 10-K filing",
      "Calculate the blended discount rate for this portfolio",
      "Explain the variance between Q3 and Q4 EBITDA in plain English",
      "Write an investment memo based on these financial statements",
      "Find recent analyst reports on this sector and summarize the consensus",
    ],
    testimonials: [
      {
        quote:
          "DeepSeek R1 shows its reasoning step-by-step on quantitative problems. I can actually see where the logic goes — critical for any number I'm putting in a deck.",
        author: "Marcus T.",
        role: "Investment Analyst",
      },
      {
        quote:
          "I upload a 200-page offering memorandum and ask Gemini to extract the key terms table. What used to take 2 hours takes 3 minutes.",
        author: "Jen L.",
        role: "M&A Associate",
      },
      {
        quote:
          "Using Claude to write the narrative sections of client reports. The tone is consistently professional. I spend time on judgment calls, not sentence structure.",
        author: "David K.",
        role: "Portfolio Manager",
      },
    ],
    faq: [
      {
        q: "Which AI is best for financial analysis?",
        a: "For quantitative reasoning and showing math step-by-step: DeepSeek R1. For broad financial analysis, scenario modeling, and data interpretation: GPT-5. For processing very long documents (full 10-Ks, contracts): Gemini 2.5 Pro. For precise professional writing: Claude 4. bedda gives you all four.",
      },
      {
        q: "Can I run Python for financial modeling in bedda?",
        a: "Yes. bedda's code execution sandbox lets you run Python — import pandas, numpy, scipy, and matplotlib. Build DCF models, run simulations, and plot charts, all within the conversation.",
      },
      {
        q: "Is my financial data private?",
        a: "Yes. Messages are sent directly to model providers (Anthropic, OpenAI, Google) via their API. API data is excluded from training under provider terms. bedda does not store, read, or use your financial data beyond serving your query.",
      },
      {
        q: "Can bedda read a full 10-K filing?",
        a: "Yes, via Gemini 2.5 Pro with a 1 million token context window. A typical 10-K is 100-150 pages — well within Gemini's capacity. Upload it to the knowledge base or paste the text, and ask any question about the document.",
      },
      {
        q: "Is bedda suitable for a finance team?",
        a: "Yes. Team workspaces let multiple analysts share research threads, knowledge bases, and workflows. Enterprise model policies let admins control which models are available and set monthly cost caps.",
      },
    ],
    ctaHeadline: "Sharper analysis. Faster research. All the models you need.",
  },

  legal: {
    slug: "legal",
    title: "AI for Legal Professionals",
    metaTitle: "Best AI for Legal Work (2026) — Contract Review, Research & Drafting",
    metaDescription:
      "Claude 4 for careful legal reasoning, Gemini for long contracts, GPT-5 for drafting — get every AI legal model for $12/mo. Knowledge base for case law. 7-day free trial.",
    heroHeadline: "Legal-grade AI reasoning. Frontier models. One subscription.",
    heroSubtext:
      "Claude 4 for careful, precise legal reasoning. Gemini 2.5 Pro for reading 500-page contracts without truncation. GPT-5 for fast drafting. Knowledge base for your firm's precedents and playbooks — all for $12/mo.",
    tagline: "Legal professionals who demand precision, not just fluency",
    bestModels: [
      { name: "Claude 4 Opus", reason: "Careful legal reasoning, precise contract analysis, privileged communication drafting" },
      { name: "Gemini 2.5 Pro", reason: "1M token context — entire contracts, case files, and discovery documents" },
      { name: "GPT-5", reason: "Fast clause drafting, brief writing, and document summarization" },
      { name: "DeepSeek R1", reason: "Step-by-step logical analysis of complex statutory questions" },
      { name: "Mistral Large", reason: "Quick cross-reference lookups during document review" },
    ],
    features: [
      {
        title: "1M token context for full contracts",
        description:
          "Gemini 2.5 Pro reads 1 million tokens in a single context — that's a 500-page contract or a full deposition transcript. Ask any question about any section without re-uploading.",
      },
      {
        title: "Knowledge base for firm playbooks and precedents",
        description:
          "Upload standard clauses, past agreements, firm templates, and internal guidelines. Every AI conversation can reference them — so output matches your firm's style and precedent.",
      },
      {
        title: "Precise reasoning with step-by-step analysis",
        description:
          "Claude 4 and DeepSeek R1 can walk through complex statutory interpretation or contract clause analysis step-by-step — showing the logic, not just the conclusion.",
      },
      {
        title: "Document drafting and redlining support",
        description:
          "Draft NDAs, MSAs, employment agreements, and demand letters. Ask models to identify unusual clauses, flag missing standard protections, or compare two contract versions.",
      },
      {
        title: "Research synthesis with web search",
        description:
          "Pull recent case law, regulatory guidance, and legislative updates. Models synthesize findings with citations, flagging the most relevant precedents for your matter.",
      },
      {
        title: "Team workspaces for matter collaboration",
        description:
          "Share research threads with colleagues. A partner and associate can work from the same AI context on a matter — shared knowledge base, shared conversation history.",
      },
    ],
    useCaseExamples: [
      "Review this SaaS agreement and flag non-standard clauses",
      "Summarize the key obligations in this 200-page supply agreement",
      "Draft a cease and desist letter based on these facts",
      "Compare these two versions of the indemnification clause",
      "Find recent cases interpreting this GDPR provision",
      "Write a plain-English summary of this judgment for the client",
    ],
    testimonials: [
      {
        quote:
          "I upload an entire contract to Gemini and ask it to flag anything that deviates from our standard terms. It catches things I'd miss on a first read.",
        author: "Rebecca T.",
        role: "Corporate Partner",
      },
      {
        quote:
          "Claude's reasoning on contract interpretation is remarkably careful. It hedges appropriately and asks clarifying questions — more like a thoughtful junior associate than an autocomplete engine.",
        author: "James L.",
        role: "M&A Attorney",
      },
      {
        quote:
          "We uploaded our entire clause library to the knowledge base. Now every associate pulls from the same approved language — instantly, without emailing templates around.",
        author: "Anita K.",
        role: "General Counsel",
      },
    ],
    faq: [
      {
        q: "Is AI reliable enough for legal work?",
        a: "AI models are powerful drafting, research, and analysis tools — but they are not lawyers and can make errors. Use bedda.ai to accelerate your work: first-pass contract review, research starting points, draft language — always reviewed and approved by a qualified attorney before use.",
      },
      {
        q: "Which AI model is best for contract review?",
        a: "Gemini 2.5 Pro for large documents (1M token context handles entire agreements without truncation). Claude 4 Opus for precise, careful analysis and spotting unusual clauses. GPT-5 for fast redlining and clause drafting. bedda.ai gives you all three in one interface.",
      },
      {
        q: "Are my client matters confidential when using bedda?",
        a: "Messages are sent to model providers (Anthropic, OpenAI, Google) via API under their terms, which exclude training on API data. Treat bedda like any other cloud tool — apply your firm's data security and confidentiality policies. Do not upload highly sensitive client data without reviewing your firm's AI policy.",
      },
      {
        q: "Can bedda help with legal research?",
        a: "bedda's web search can pull recent case summaries, regulatory updates, and legislative changes. It's useful for getting oriented on a topic quickly. For authoritative research with full case law databases, bedda complements (not replaces) tools like Westlaw or LexisNexis.",
      },
      {
        q: "Is there a team plan for law firms?",
        a: "Yes. bedda team workspaces let multiple attorneys share knowledge bases, workflows, and research threads. Enterprise model policies let firm admins control which models junior associates can use and set usage cost caps.",
      },
    ],
    ctaHeadline: "Faster research. Tighter drafts. Every frontier model.",
  },
};

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return Object.keys(USE_CASES).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = USE_CASES[slug];
  if (!data) return {};
  return {
    title: data.metaTitle,
    description: data.metaDescription,
    openGraph: {
      title: data.metaTitle,
      description: data.metaDescription,
      url: `https://bedda.ai/for/${slug}`,
    },
    alternates: {
      canonical: `https://bedda.ai/for/${slug}`,
    },
  };
}

export default async function UseCasePage({ params }: { params: Params }) {
  const { slug } = await params;
  const data = USE_CASES[slug];
  if (!data) notFound();

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Hero */}
      <section className="px-4 py-20 text-center max-w-4xl mx-auto">
        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-4 uppercase tracking-wider">
          {data.tagline}
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-50 mb-6 leading-tight">
          {data.heroHeadline}
        </h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-10 max-w-2xl mx-auto">
          {data.heroSubtext}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8">
            <Link href="/register">
              Start free 7-day trial <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/pricing">See pricing</Link>
          </Button>
        </div>
        <p className="text-sm text-zinc-500 mt-4">No credit card required · Cancel anytime</p>
      </section>

      {/* Best models for this use case */}
      <section className="bg-zinc-50 dark:bg-zinc-900 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2 text-center">
            Best models for {data.title.toLowerCase().replace("ai for ", "")}
          </h2>
          <p className="text-zinc-500 text-center mb-8">
            All included in your subscription. Switch any time.
          </p>
          <div className="grid gap-3">
            {data.bestModels.map((m) => (
              <div
                key={m.name}
                className="flex items-center gap-4 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 px-5 py-4"
              >
                <Check className="h-5 w-5 text-green-500 shrink-0" />
                <span className="font-semibold text-zinc-900 dark:text-zinc-50 w-40 shrink-0">
                  {m.name}
                </span>
                <span className="text-zinc-600 dark:text-zinc-400 text-sm">{m.reason}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-10 text-center">
            Everything you need in one place
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {data.features.map((f) => (
              <div
                key={f.title}
                className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-6"
              >
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-2">{f.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use case examples */}
      <section className="bg-zinc-50 dark:bg-zinc-900 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-8">
            What people actually ask
          </h2>
          <div className="grid gap-3">
            {data.useCaseExamples.map((example) => (
              <div
                key={example}
                className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-5 py-3 text-zinc-700 dark:text-zinc-300 text-sm text-left"
              >
                &ldquo;{example}&rdquo;
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-10 text-center">
            What users say
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {data.testimonials.map((t) => (
              <div
                key={t.author}
                className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-6"
              >
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-zinc-700 dark:text-zinc-300 text-sm mb-4">&ldquo;{t.quote}&rdquo;</p>
                <p className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm">{t.author}</p>
                <p className="text-zinc-500 text-xs">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-zinc-50 dark:bg-zinc-900 py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-8 text-center">
            Frequently asked questions
          </h2>
          <div className="space-y-6">
            {data.faq.map((item) => (
              <div key={item.q}>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-2">{item.q}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
            {data.ctaHeadline}
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-8">
            36+ AI models. One subscription. Start your 7-day free trial — no credit card required.
          </p>
          <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-10">
            <Link href="/register">
              Start free trial <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="text-sm text-zinc-500 mt-4">
            Plus $12/mo after trial · Cancel anytime
          </p>
        </div>
      </section>

      {/* Cross-links */}
      <section className="border-t border-zinc-200 dark:border-zinc-800 py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-zinc-500 text-sm mb-4">More use cases</p>
          <div className="flex flex-wrap justify-center gap-3">
            {Object.values(USE_CASES)
              .filter((uc) => uc.slug !== slug)
              .map((uc) => (
                <Link
                  key={uc.slug}
                  href={`/for/${uc.slug}`}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {uc.title}
                </Link>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}
