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
        title: "135+ AI Models from 7 Providers",
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
          "DeepSeek, Mistral, Groq, and more",
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
    timeline: "Q1 2026 (In Progress)",
    features: [
      {
        id: "web-search",
        title: "Web Search with Citations",
        description:
          "Real-time web search integrated into chat responses with source attribution",
        status: "in-progress",
        priority: "critical",
        effort: "1-2 weeks",
        impact: "Every major competitor has this -- critical gap",
        keyFeatures: [
          "Real-time web search via Tavily/Serper API",
          "Source citations with links",
          "Search result summarization",
          "User-togglable search mode",
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
      {
        id: "code-execution",
        title: "Code Execution Sandbox",
        description:
          "Server-side code execution for Python, JavaScript, and more with secure sandboxing",
        status: "planned",
        priority: "critical",
        effort: "2-3 weeks",
        impact: "Matches ChatGPT Code Interpreter and Claude Analysis Tool",
        keyFeatures: [
          "Python execution with data analysis libraries",
          "JavaScript/TypeScript execution",
          "File I/O within sandbox",
          "Chart and visualization output",
          "Package installation",
          "Execution timeout and resource limits",
        ],
      },
      {
        id: "oauth-social-login",
        title: "OAuth & Social Login",
        description:
          "Sign in with Google, GitHub, Apple, and other providers for frictionless onboarding",
        status: "planned",
        priority: "critical",
        effort: "1 week",
        impact: "Major onboarding friction reducer",
        keyFeatures: [
          "Google OAuth",
          "GitHub OAuth",
          "Apple Sign In",
          "Account linking for existing users",
        ],
      },
      {
        id: "voice-input",
        title: "Voice Input & Audio",
        description:
          "Microphone input with real-time transcription and text-to-speech responses",
        status: "planned",
        priority: "high",
        effort: "1-2 weeks",
        keyFeatures: [
          "Push-to-talk microphone button",
          "Real-time Whisper transcription",
          "Text-to-speech for AI responses",
          "Audio message playback",
        ],
      },
    ],
  },
  {
    id: "phase-3",
    title: "Phase 3: Competitive Advantage",
    description:
      "Features that make Bedda the clear choice over any single AI provider",
    timeline: "Q2 2026",
    features: [
      {
        id: "projects",
        title: "Projects & Knowledge Bases",
        description:
          "Persistent project workspaces with document uploads, RAG search, and custom instructions",
        status: "planned",
        priority: "critical",
        effort: "3-4 weeks",
        impact: "Matches Claude Projects, ChatGPT Custom GPTs, Gemini Gems",
        keyFeatures: [
          "Project-scoped conversations",
          "Document upload and indexing (PDF, DOCX, CSV, code)",
          "Vector search with pgvector",
          "Custom system instructions per project",
          "Project sharing and collaboration",
          "Knowledge base management",
        ],
      },
      {
        id: "memory",
        title: "Cross-Conversation Memory",
        description:
          "AI remembers user preferences, context, and facts across conversations",
        status: "planned",
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
        id: "model-comparison",
        title: "Model Comparison & Arena",
        description:
          "Send the same prompt to multiple models and compare responses side-by-side",
        status: "planned",
        priority: "high",
        effort: "2 weeks",
        impact: "Unique feature -- no competitor has this natively",
        keyFeatures: [
          "Side-by-side model comparison",
          "Blind comparison mode (arena)",
          "Response quality voting",
          "Cost/speed/quality analysis",
          "Model recommendation engine",
        ],
      },
      {
        id: "deep-research",
        title: "Deep Research Agent",
        description:
          "Autonomous multi-step research that browses the web, synthesizes sources, and produces reports",
        status: "planned",
        priority: "high",
        effort: "3-4 weeks",
        impact: "Matches ChatGPT Deep Research, Perplexity Deep Research, Gemini Deep Research",
        keyFeatures: [
          "Multi-site web browsing",
          "Source synthesis and citation",
          "Long-form report generation",
          "Research progress tracking",
          "Export to PDF/Markdown",
        ],
      },
      {
        id: "custom-instructions",
        title: "Custom System Instructions",
        description:
          "Persistent custom instructions that shape AI behavior across all conversations",
        status: "planned",
        priority: "medium",
        effort: "1 week",
        keyFeatures: [
          "Global custom instructions",
          "Per-project instructions",
          "Instruction templates and sharing",
          "Model-specific instructions",
        ],
      },
      {
        id: "advanced-artifacts",
        title: "Advanced Artifacts",
        description:
          "New artifact types: diagrams, presentations, charts, interactive HTML, and notebooks",
        status: "planned",
        priority: "medium",
        effort: "4-6 weeks",
        keyFeatures: [
          "Mermaid diagrams",
          "Interactive charts (D3/Chart.js)",
          "HTML/CSS/JS preview",
          "Slide presentations",
          "Jupyter-style notebooks",
          "3D model viewer",
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
        id: "mobile-pwa",
        title: "Mobile App (PWA)",
        description:
          "Progressive Web App with offline support, push notifications, and native-like experience",
        status: "planned",
        priority: "high",
        effort: "3-4 weeks",
        keyFeatures: [
          "Service worker for offline support",
          "Push notifications",
          "Add to home screen",
          "Camera/microphone integration",
          "Responsive mobile-first UI",
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
          "Third-party integrations (Slack, Notion, Google Workspace)",
          "Webhook-based actions",
          "Community-built extensions",
        ],
      },
    ],
  },
];

export const roadmapStats = {
  totalFeatures: 23,
  completedFeatures: 6,
  inProgressFeatures: 1,
  plannedFeatures: 16,
  estimatedValue: "$500k+/month (at 100k users)",
  targetMargins: "50-55% gross profit",
};

export const expectedImpact = {
  competitiveAdvantages: {
    multiModel: "135+ models from 7 providers under one subscription",
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
