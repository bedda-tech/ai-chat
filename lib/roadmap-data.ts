export type FeatureStatus = "planned" | "in-progress" | "completed";
export type FeaturePriority = "critical" | "high" | "medium" | "low";

export type Feature = {
  id: string;
  title: string;
  description: string;
  status: FeatureStatus;
  priority: FeaturePriority;
  effort: string;
  impact?: string;
  roi?: string;
  documentLink?: string;
  keyFeatures?: string[];
};

export type RoadmapPhase = {
  id: string;
  title: string;
  description: string;
  timeline: string;
  features: Feature[];
};

export const roadmapData: RoadmapPhase[] = [
  {
    id: "phase-1",
    title: "Phase 1: Foundation",
    description: "Core infrastructure, payments, and multi-model access",
    timeline: "Completed (Q4 2025)",
    features: [
      {
        id: "multi-model-access",
        title: "40+ AI Models from 9 Providers",
        description:
          "Access Claude, GPT, Gemini, Grok, DeepSeek, and more from a single interface with automatic model discovery",
        status: "completed",
        priority: "critical",
        effort: "Completed",
        impact: "Core product differentiator",
        keyFeatures: [
          "Anthropic (Claude Opus 4.8, Sonnet 4.6, Haiku)",
          "OpenAI (GPT-5, GPT-5 Codex)",
          "Google (Gemini 2.5 Pro, Flash, Flash Image)",
          "xAI (Grok 4, Grok 3)",
          "DeepSeek, Mistral, Groq, Cerebras, and more",
        ],
      },
      {
        id: "usage-analytics",
        title: "Usage Analytics & Rate Limiting",
        description:
          "Per-user usage tracking, tier-based rate limiting, and cost monitoring",
        status: "completed",
        priority: "critical",
        effort: "Completed",
        keyFeatures: [
          "Per-user message and token tracking",
          "Tier-based rate limits (per-minute, daily, monthly)",
          "Real-time cost calculation with TokenLens",
          "Usage dashboard in settings",
        ],
      },
      {
        id: "stripe-payments",
        title: "Stripe Subscription Payments",
        description:
          "Full subscription lifecycle with checkout, billing portal, and webhook handling",
        status: "completed",
        priority: "critical",
        effort: "Completed",
        keyFeatures: [
          "Stripe Checkout for upgrades",
          "Self-service billing portal",
          "Webhook-driven tier management",
          "Subscription upgrade/downgrade/cancel",
          "Annual billing with savings",
        ],
      },
      {
        id: "prompt-caching",
        title: "Prompt Caching (50-90% Cost Reduction)",
        description:
          "Intelligent prompt caching for Anthropic and OpenAI models to dramatically reduce API costs",
        status: "completed",
        priority: "high",
        effort: "Completed",
        keyFeatures: [
          "System prompt caching for Anthropic models",
          "Automatic caching for OpenAI models",
          "Cache hit tracking and savings calculation",
        ],
      },
      {
        id: "artifacts",
        title: "Artifacts (Text, Code, Image, Spreadsheet)",
        description:
          "Interactive content creation with real-time previews and editing",
        status: "completed",
        priority: "high",
        effort: "Completed",
        keyFeatures: [
          "Rich text editor (ProseMirror)",
          "Code editor with syntax highlighting (CodeMirror)",
          "Image generation and display",
          "Spreadsheet editing (react-data-grid)",
          "Canvas mode for collaborative editing",
        ],
      },
      {
        id: "image-generation",
        title: "AI Image Generation",
        description:
          "Text-to-image generation using Gemini Flash Image with multiple aspect ratios",
        status: "completed",
        priority: "high",
        effort: "Completed",
        keyFeatures: [
          "Text-to-image via Gemini 2.5 Flash",
          "Multiple aspect ratios (1:1, 16:9, 9:16, 3:4, 4:3)",
          "Inline image display in chat",
          "Image artifact for full-screen view",
        ],
      },
    ],
  },
  {
    id: "phase-2",
    title: "Phase 2: Competitive Parity",
    description:
      "Critical features to match and exceed ChatGPT, Claude, and Gemini",
    timeline: "Completed (Q1 2026)",
    features: [
      {
        id: "web-search",
        title: "Web Search with Citations",
        description:
          "Real-time web search integrated into chat responses with source attribution",
        status: "completed",
        priority: "critical",
        effort: "Completed",
        impact: "Every major competitor has this -- critical gap closed",
        keyFeatures: [
          "Real-time web search via Tavily API",
          "Source citations with clickable links",
          "Search result summarization",
          "Toggleable search mode per message",
        ],
      },
      {
        id: "code-execution",
        title: "Code Execution Sandbox",
        description:
          "Server-side code execution for Python and JavaScript in a secure E2B sandbox",
        status: "completed",
        priority: "critical",
        effort: "Completed",
        impact: "Matches ChatGPT Code Interpreter and Claude Analysis Tool",
        keyFeatures: [
          "Python execution with data analysis libraries (pandas, numpy, matplotlib)",
          "JavaScript/TypeScript execution",
          "Chart and visualization output (inline images)",
          "Rich execution results with stdout, stderr, and rich media",
        ],
      },
      {
        id: "oauth-social-login",
        title: "OAuth & Social Login",
        description:
          "Sign in with Google or GitHub for frictionless onboarding alongside email/password",
        status: "completed",
        priority: "critical",
        effort: "Completed",
        impact: "Major onboarding friction reducer",
        keyFeatures: [
          "Google OAuth",
          "GitHub OAuth",
          "Account linking for existing email users",
          "Password reset via email",
        ],
      },
      {
        id: "voice-input",
        title: "Voice Input & Text-to-Speech",
        description:
          "Microphone input with real-time transcription and text-to-speech responses",
        status: "completed",
        priority: "high",
        effort: "Completed",
        keyFeatures: [
          "Push-to-talk microphone button",
          "Real-time Web Speech API transcription",
          "Text-to-speech for AI responses",
          "Audio message playback",
        ],
      },
      {
        id: "knowledge-base",
        title: "Knowledge Base & RAG Search",
        description:
          "Upload documents and files to a personal knowledge base; AI automatically retrieves relevant context",
        status: "completed",
        priority: "critical",
        effort: "Completed",
        impact: "Matches Claude Projects knowledge base, ChatGPT file uploads",
        keyFeatures: [
          "PDF, text, and code file uploads",
          "Vector search with pgvector (1536-dim embeddings)",
          "Hybrid semantic + full-text search (Reciprocal Rank Fusion)",
          "Auto-injected context from knowledge base",
          "Knowledge base management page",
        ],
      },
      {
        id: "interactive-charts",
        title: "Interactive Data Visualization",
        description:
          "AI-generated interactive charts and graphs directly in chat responses",
        status: "completed",
        priority: "high",
        effort: "Completed",
        keyFeatures: [
          "Line, bar, area, and pie charts via Recharts",
          "AI autonomously generates charts from data",
          "Responsive and interactive (hover, zoom)",
          "Works alongside code execution for data analysis",
        ],
      },
      {
        id: "prompt-library",
        title: "Prompt Library",
        description:
          "Curated and custom prompt templates for common tasks to jumpstart any conversation",
        status: "completed",
        priority: "medium",
        effort: "Completed",
        keyFeatures: [
          "Built-in templates for writing, coding, research, and more",
          "Quick-access modal from the chat toolbar",
          "One-click prompt insertion",
        ],
      },
      {
        id: "chat-sharing",
        title: "Chat Sharing",
        description:
          "Share any conversation via a public link — anyone can view without an account",
        status: "completed",
        priority: "medium",
        effort: "Completed",
        keyFeatures: [
          "Per-chat visibility toggle (private/public)",
          "Shareable public URLs",
          "Read-only view for non-owners",
          "One-click copy share link",
        ],
      },
      {
        id: "image-studio",
        title: "Image Studio",
        description:
          "Dedicated image generation workspace with multi-model support, aspect ratio controls, and negative prompts",
        status: "completed",
        priority: "critical",
        effort: "Completed",
        impact:
          "Multi-model image gen (DALL-E 3, Imagen 3, Flux 1.1) — beats Claude (no image gen)",
        keyFeatures: [
          "Multi-model image generation (DALL-E 3, Imagen 3 Fast, Flux 1.1 Pro)",
          "Aspect ratio controls (1:1, 16:9, 9:16, 3:4, 4:3)",
          "Negative prompt support",
          "Side-by-side multi-model comparison",
          "Dedicated /studio workspace",
        ],
      },
      {
        id: "video-studio",
        title: "Video Studio",
        description:
          "AI video generation powered by Kling — text-to-video, image-to-video, quality tiers, and a persistent gallery",
        status: "completed",
        priority: "high",
        effort: "Completed",
        impact:
          "Matches Sora (ChatGPT $20+) and Veo (Gemini $19.99+), beats Claude (none)",
        keyFeatures: [
          "Text-to-video generation (Kling v1.6)",
          "Image-to-video animation",
          "Standard (720p) and Pro (1080p) quality tiers",
          "Queue-based async processing with polling",
          "Video gallery with persistent job history",
          "Download links for generated videos",
        ],
      },
    ],
  },
  {
    id: "phase-3",
    title: "Phase 3: Competitive Advantage",
    description:
      "Features that make Bedda the clear choice over any single AI provider",
    timeline: "Completed (Q2-Q3 2026)",
    features: [
      {
        id: "projects",
        title: "Projects & Workspaces",
        description:
          "Persistent project workspaces with custom instructions, RAG search, and organized conversations",
        status: "completed",
        priority: "critical",
        effort: "Completed",
        impact: "Matches Claude Projects, ChatGPT Custom GPTs, Gemini Gems",
        keyFeatures: [
          "Project-scoped conversations",
          "Custom system instructions per project",
          "Project-scoped knowledge base (separate from account-wide KB)",
          "Google Drive + Notion import into knowledge base",
          "Project management page with KB and New Chat deeplinks",
        ],
      },
      {
        id: "custom-instructions",
        title: "Custom System Instructions",
        description:
          "Persistent custom instructions that shape AI behavior across all conversations",
        status: "completed",
        priority: "medium",
        effort: "Completed",
        keyFeatures: [
          "Global custom instructions saved in settings",
          "Per-project instructions",
          "Applied automatically to every conversation",
        ],
      },
      {
        id: "integrations",
        title: "Google Drive & Notion Integration",
        description:
          "Connect your Google Drive and Notion workspace — AI can search and read files directly in chat",
        status: "completed",
        priority: "high",
        effort: "Completed",
        keyFeatures: [
          "Google Drive OAuth connect/disconnect",
          "Search and read Drive files in chat",
          "Notion workspace OAuth connect",
          "Search and read Notion pages in chat",
          "Auto token refresh",
        ],
      },
      {
        id: "model-comparison",
        title: "Model Comparison & Arena",
        description:
          "Send the same prompt to multiple models and compare responses side-by-side",
        status: "completed",
        priority: "high",
        effort: "Completed",
        impact: "Unique feature -- no competitor has this natively",
        keyFeatures: [
          "Side-by-side model comparison (up to 4 models)",
          "Independent conversation threads per model",
          "Add/remove models dynamically",
          "Shared prompt submission across all columns",
        ],
      },
      {
        id: "deep-research",
        title: "Deep Research Agent",
        description:
          "Autonomous multi-step research that browses the web, synthesizes sources, and produces reports",
        status: "completed",
        priority: "high",
        effort: "Completed",
        impact: "Matches ChatGPT Deep Research, Perplexity Deep Research",
        keyFeatures: [
          "Agent mode with up to 20 reasoning steps",
          "Web search + synthesis in a single run",
          "Cites sources inline",
          "Toggle Deep Research mode in the chat toolbar",
        ],
      },
      {
        id: "mcp-integration",
        title: "MCP Server Integration",
        description:
          "Connect any Model Context Protocol (MCP) server to extend AI capabilities with custom tools",
        status: "completed",
        priority: "medium",
        effort: "Completed",
        keyFeatures: [
          "SSE and HTTP transport support",
          "Per-user MCP server management",
          "Dynamic tool discovery",
          "Custom auth headers per server",
        ],
      },
      {
        id: "memory",
        title: "Cross-Conversation Memory",
        description:
          "AI remembers user preferences, context, and facts across conversations",
        status: "completed",
        priority: "high",
        effort: "Completed",
        impact: "Matches ChatGPT Memory, Claude Memory",
        keyFeatures: [
          "Automatic memory extraction from conversations",
          "User-editable memory bank in settings",
          "Delete individual memories or clear all",
          "Memory injected into every conversation",
        ],
      },
      {
        id: "advanced-artifacts",
        title: "Advanced Artifacts",
        description:
          "New artifact types: diagrams, presentations, interactive HTML, notebooks, and generative UI",
        status: "completed",
        priority: "medium",
        effort: "Completed",
        keyFeatures: [
          "Mermaid diagrams (flowcharts, sequence, ER, class, state)",
          "Interactive charts (Recharts — line, bar, area, pie)",
          "HTML/CSS/JS sandboxed preview",
          "Slide presentations (Reveal.js)",
          "Jupyter-style notebooks (code + markdown cells)",
          "Generative UI (AI-rendered tables, checklists, stats, timelines)",
        ],
      },
    ],
  },
  {
    id: "phase-4",
    title: "Phase 4: Platform & Scale",
    description: "Team features, API access, and enterprise capabilities",
    timeline: "In Progress (Q3-Q4 2026)",
    features: [
      {
        id: "mobile-pwa",
        title: "Mobile App (PWA)",
        description:
          "Progressive Web App with offline support, push notifications, and native-like experience",
        status: "completed",
        priority: "high",
        effort: "Completed",
        keyFeatures: [
          "Service worker for offline support",
          "Add to home screen on iOS and Android",
          "Camera/microphone integration",
          "Responsive mobile-first UI",
        ],
      },
      {
        id: "team-workspaces",
        title: "Team Workspaces & Collaboration",
        description:
          "Shared workspaces with role-based access, team invites, shared chat threads, and real-time collaborative editing",
        status: "completed",
        priority: "high",
        effort: "Completed",
        keyFeatures: [
          "Team creation and management",
          "Email invite system",
          "Role-based permissions (owner, admin, member)",
          "Shared chat threads",
          "Real-time collaborative editing (Redis pub/sub + SSE)",
          "Live typing indicators",
          "Seat-based billing and subscription management",
        ],
      },
      {
        id: "chat-platform-bots",
        title:
          "Chat Platform Integrations (Slack, Discord, GitHub, Telegram, WhatsApp, Teams)",
        description:
          "Native bots for Slack, Discord, GitHub, Telegram, WhatsApp, and Microsoft Teams — bring multi-model AI access to where teams already work",
        status: "completed",
        priority: "high",
        effort: "Completed",
        impact:
          "B2B channel — sticky team installs, per-seat revenue, no competitor offers multi-model access inside Slack/Discord",
        keyFeatures: [
          "Slack bot with multi-workspace OAuth install flow",
          "Thread history and model selection via [alias] prefix",
          "Discord bot via Interactions API (/bedda slash command)",
          "GitHub bot for PR review, issue triage, and comment responses",
          "Telegram bot for private chats and group @mentions",
          "WhatsApp Cloud API bot",
          "Microsoft Teams Outgoing Webhook bot",
          "Model aliases: claude, gpt, gemini, grok, mistral, deepseek, and more",
          "HMAC/Ed25519 signature verification on all webhook endpoints",
        ],
      },
      {
        id: "api-access",
        title: "API Access for Subscribers",
        description:
          "OpenAI-compatible REST API for programmatic access to all models, gated to paid subscribers",
        status: "completed",
        priority: "high",
        effort: "Completed",
        keyFeatures: [
          "OpenAI-compatible REST API (/v1/chat/completions)",
          "API key management in settings",
          "Usage tracking and rate limiting",
          "Gated to Plus/Pro/Max subscribers",
        ],
      },
      {
        id: "enterprise",
        title: "Enterprise Features",
        description:
          "SSO, audit logging, compliance, and dedicated support for organizations",
        status: "completed",
        priority: "medium",
        effort: "Completed",
        keyFeatures: [
          "Audit logging for all key user actions",
          "Admin dashboard with per-model latency, token, and error metrics",
          "SAML/SSO via WorkOS (per-domain, enterprise-tier only)",
          "Org-level model allowlist/denylist + monthly cost cap per team",
          "Data residency controls (planned)",
          "SLA guarantees (planned)",
          "Dedicated support (planned)",
        ],
      },
      {
        id: "plugin-system",
        title: "Plugin & Extension System",
        description:
          "User-defined webhook plugins and integrations that extend AI with custom tools",
        status: "completed",
        priority: "medium",
        effort: "Completed",
        keyFeatures: [
          "User-defined webhook plugin tools",
          "AES-256-GCM encrypted API key storage",
          "Plugin tool dispatch with 5s timeout",
          "Plugin marketplace with 20 curated plugins",
          "Community-built extensions (planned)",
          "Third-party integrations (Linear) (planned)",
        ],
      },
    ],
  },
];

export const roadmapStats = {
  totalFeatures: 30,
  completedFeatures: 30,
  inProgressFeatures: 0,
  plannedFeatures: 0,
  estimatedValue: "$500k+/month (at 100k users)",
  targetMargins: "50-55% gross profit",
};

export const expectedImpact = {
  competitiveAdvantages: {
    multiModel: "40+ models from 9 providers under one subscription",
    pricing: "40-60% cheaper than subscribing to individual providers",
    imageStudio: "Multi-model image gen (beats Claude which has none)",
    videoStudio: "Video gen at $12/mo (competitors charge $20-250/mo)",
    modelComparison: "Side-by-side model arena (unique to Bedda)",
    platformBots:
      "Slack/Discord/GitHub/Telegram bots — multi-model AI inside team workspaces",
  },
  revenueProjections: {
    "10k users": "~$130k/month",
    "50k users": "~$650k/month",
    "100k users": "~$1.3M/month",
  },
};
