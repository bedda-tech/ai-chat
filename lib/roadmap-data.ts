export type FeatureStatus = "planned" | "in-progress" | "completed";
export type FeaturePriority = "critical" | "high" | "medium" | "low";

export interface Feature {
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
}

export interface RoadmapPhase {
  id: string;
  title: string;
  description: string;
  timeline: string;
  features: Feature[];
}

export const roadmapData: RoadmapPhase[] = [
  {
    id: "phase-1",
    title: "Phase 1: Foundation",
    description: "Core infrastructure, payments, and multi-model access",
    timeline: "Completed (Q4 2025)",
    features: [
      {
        id: "multi-model-access",
        title: "30+ AI Models from 7 Providers",
        description:
          "Access Claude, GPT, Gemini, Grok, DeepSeek, and more from a single interface with automatic model discovery",
        status: "completed",
        priority: "critical",
        effort: "Completed",
        impact: "Core product differentiator",
        keyFeatures: [
          "Anthropic (Claude Opus, Sonnet, Haiku)",
          "OpenAI (GPT-5, GPT-5 Codex)",
          "Google (Gemini 2.5 Pro, Flash)",
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
          "Dedicated image generation workspace with editing, variations, upscaling, and style transfer",
        status: "planned",
        priority: "critical",
        effort: "2-3 weeks",
        impact: "Matches DALL-E (ChatGPT) and Imagen (Gemini), beats Claude (no image gen)",
        keyFeatures: [
          "Multi-model image generation (Gemini, DALL-E, Flux)",
          "Image editing and inpainting",
          "Style transfer and variations",
          "Upscaling and enhancement",
          "Image gallery and history",
          "Batch generation",
        ],
      },
      {
        id: "video-studio",
        title: "Video Studio",
        description:
          "AI video generation and editing powered by Kling, Runway, and Veo APIs",
        status: "planned",
        priority: "high",
        effort: "3-4 weeks",
        impact: "Matches Sora (ChatGPT $20+) and Veo (Gemini $19.99+), beats Claude (none)",
        keyFeatures: [
          "Text-to-video generation",
          "Image-to-video animation",
          "Multiple quality tiers (720p, 1080p, 4K)",
          "Video editing and trimming",
          "Queue-based processing with status updates",
          "Video gallery and downloads",
        ],
      },
    ],
  },
  {
    id: "phase-3",
    title: "Phase 3: Competitive Advantage",
    description:
      "Features that make Bedda the clear choice over any single AI provider",
    timeline: "In Progress (Q2 2026)",
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
          "Knowledge base per project",
          "Project management page",
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
        status: "in-progress",
        priority: "high",
        effort: "2 weeks",
        impact: "Matches ChatGPT Memory, Claude Memory",
        keyFeatures: [
          "Automatic memory extraction from conversations",
          "User-editable memory bank",
          "Memory toggle per conversation",
          "Privacy controls for stored memories",
        ],
      },
      {
        id: "advanced-artifacts",
        title: "Advanced Artifacts",
        description:
          "New artifact types: diagrams, presentations, charts, interactive HTML, and notebooks",
        status: "in-progress",
        priority: "medium",
        effort: "4-6 weeks",
        keyFeatures: [
          "Mermaid diagrams",
          "Interactive charts (Recharts) -- shipped",
          "HTML/CSS/JS preview",
          "Slide presentations",
          "Jupyter-style notebooks",
        ],
      },
    ],
  },
  {
    id: "phase-4",
    title: "Phase 4: Platform & Scale",
    description: "Team features, API access, and enterprise capabilities",
    timeline: "Q3-Q4 2026",
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
          "Shared workspaces with real-time collaboration, role-based access, and team billing",
        status: "planned",
        priority: "high",
        effort: "6-8 weeks",
        keyFeatures: [
          "Team billing and seat management",
          "Shared conversations and projects",
          "Role-based permissions (admin, member, viewer)",
          "Team usage analytics",
          "Real-time collaborative editing",
        ],
      },
      {
        id: "api-access",
        title: "API Access for Subscribers",
        description:
          "REST API for programmatic access to all models, included with Max tier",
        status: "planned",
        priority: "high",
        effort: "3-4 weeks",
        keyFeatures: [
          "REST API with OpenAI-compatible format",
          "API key management",
          "Usage tracking and rate limiting",
          "Included credits with Max tier",
        ],
      },
      {
        id: "enterprise",
        title: "Enterprise Features",
        description:
          "SSO, audit logging, compliance, and dedicated support for organizations",
        status: "planned",
        priority: "medium",
        effort: "6-8 weeks",
        keyFeatures: [
          "SAML/SSO integration",
          "Audit logging",
          "Data residency controls",
          "Custom model routing",
          "SLA guarantees",
          "Dedicated support",
        ],
      },
      {
        id: "plugin-system",
        title: "Plugin & Extension System",
        description:
          "User-created plugins and integrations similar to ChatGPT GPTs and Chrome extensions",
        status: "planned",
        priority: "medium",
        effort: "8-12 weeks",
        keyFeatures: [
          "Custom tool definitions",
          "Plugin marketplace",
          "Third-party integrations (Slack, Teams, Linear)",
          "Webhook-based actions",
          "Community-built extensions",
        ],
      },
    ],
  },
];

export const roadmapStats = {
  totalFeatures: 31,
  completedFeatures: 22,
  inProgressFeatures: 2,
  plannedFeatures: 7,
  estimatedValue: "$500k+/month (at 100k users)",
  targetMargins: "50-55% gross profit",
};

export const expectedImpact = {
  competitiveAdvantages: {
    multiModel: "30+ models from 7 providers under one subscription",
    pricing: "40-60% cheaper than subscribing to individual providers",
    imageStudio: "Multi-model image gen (beats Claude which has none)",
    videoStudio: "Video gen at $12/mo (competitors charge $20-250/mo)",
    modelComparison: "Side-by-side model arena (unique to Bedda)",
  },
  revenueProjections: {
    "10k users": "~$130k/month",
    "50k users": "~$650k/month",
    "100k users": "~$1.3M/month",
  },
};
