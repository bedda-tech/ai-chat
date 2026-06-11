# bedda.ai Documentation

## Current Status (June 2026)

bedda.ai is a multi-model AI chat platform with 36+ models from 8 providers (Anthropic, OpenAI, Google, xAI, DeepSeek, Mistral, Groq, Cerebras) under a single subscription. The platform is live at [bedda.ai](https://bedda.ai) with all core, enterprise, and integration features shipped.

---

## Features

### Core Chat
- Multi-model chat with streaming via Vercel AI Gateway
- 36+ models — switch mid-conversation with per-message model badge
- Multi-model comparison view (up to 4 models side by side)
- Deep Research agent mode (multi-step reasoning, up to 20 tool calls)
- Chat sharing (public shareable links)
- Chat export as Markdown download
- Onboarding tour for new users

### Artifacts & Canvas
- **Text** — rich document editor
- **Code** — syntax-highlighted with copy/run actions
- **Image** — generated images embedded inline
- **Spreadsheet** — grid/CSV view
- **Mermaid** — flowcharts, sequence diagrams, ER diagrams
- **Jupyter Notebook** — cell-based output
- **Slides** — Reveal.js presentations
- **HTML** — sandboxed interactive web pages

### AI Capabilities
- Web search with citations (DuckDuckGo + Brave Search)
- Sandboxed code execution (E2B — Python and JavaScript)
- Image generation (DALL-E 3, Imagen 3 Fast, Flux 1.1 Pro)
- Image Studio — generate side-by-side from multiple models
- Video Studio — text-to-video and image-to-video (Kling AI via fal.ai)
- Audio transcription (OpenAI Whisper)
- Voice input (MediaRecorder + Whisper, cross-browser)
- Text-to-speech (Web Speech API — read aloud any message)
- Generative UI — AI renders interactive tables, checklists, stat cards, timelines
- Chart generation (bar, line, pie, etc.)
- Google Drive file access in chat
- Notion page search and read in chat

### Knowledge & Memory
- Knowledge Base with hybrid vector + BM25 search (Reciprocal Rank Fusion)
- Project-scoped knowledge bases
- Google Drive → KB import
- Notion → KB import
- Cross-conversation user memory (AI remembers facts across sessions)
- Custom instructions (system-level per-user preferences)
- Prompt library (30 templates across 6 categories)
- Projects / Workspaces with per-project KB and custom context

### Chat Bots (Platform Integrations)
- **Slack** — multi-workspace OAuth, thread history, model alias prefix
- **Discord** — slash command `/bedda` via Interactions API
- **GitHub** — PR review and issue response, `@bedda` mention or auto-review
- **Telegram** — webhook-based, group mention support
- **Microsoft Teams** — Outgoing Webhook, 5-second response window
- **WhatsApp** — Cloud API via Meta webhook

### Enterprise
- Team workspaces — invite members, role-based permissions (admin/member)
- Real-time collaborative editing on shared team chat threads (Redis pub/sub + SSE)
- Shared chat threads (any team member can view and continue)
- Seat-based team billing via Stripe
- SAML/SSO via WorkOS (per-domain config, enterprise-tier users)
- Audit logging — 8 action types, admin-gated paginated view
- Org-level model allowlist / denylist / monthly cost cap
- Admin dashboard with per-model latency, token, and error metrics
- OpenAI-compatible REST API for subscribers (API key management)
- Plugin marketplace + user-defined webhook tools (AES-256-GCM encrypted credentials)

### Infrastructure
- Auth.js — email/password, Google OAuth, GitHub OAuth, WorkOS SSO
- Stripe billing — monthly + annual pricing, 3 paid tiers (Plus/Pro/Max)
- Usage tracking with per-model pricing from models-data.json
- Sentry error monitoring (gated on NEXT_PUBLIC_SENTRY_DSN)
- Google Analytics 4 + Umami self-hosted + Vercel Analytics
- Prompt caching for Anthropic and OpenAI (50–90% cost reduction)
- Redis caching middleware + RAG auto-injection middleware
- MCP (Model Context Protocol) — connect external MCP servers
- PWA support — installable on mobile, service worker offline shell
- Vercel Blob for file uploads, Neon Postgres, Redis (optional)

---

## Subscription Tiers

| Tier | Price | Daily Msgs | Monthly Msgs | Key Features |
|------|-------|-----------|--------------|--------------|
| Free | $0 | 50 | 500 | Chat, 9 free models, 1 image gen/day |
| Plus | $12/mo | 300 | 3,000 | All models, Image Studio, Video Studio |
| Pro | $25/mo | 1,000 | 10,000 | API access, priority models |
| Max | $50/mo | Unlimited | Unlimited | Enterprise features, SSO, org policies |

Annual pricing: 20% discount.

---

## Architecture

```
Vercel AI Gateway
    ├── Anthropic  (Claude Opus 4.8, Sonnet 4.6, Haiku 4.5)
    ├── OpenAI     (GPT-5, GPT-5 Nano, GPT-4o, DALL-E 3, Whisper)
    ├── Google     (Gemini 2.5 Pro/Flash, Imagen 3, Gemini Flash Lite)
    ├── xAI        (Grok 4, Grok 3, Grok 3 Mini)
    ├── DeepSeek   (DeepSeek Chat, DeepSeek R1)
    ├── Mistral    (Mistral Large, Mistral Small)
    ├── Groq       (Llama 3.3 70B)
    └── Cerebras   (Llama 3.3 70B)

Next.js 15 App Router
    ├── Neon Postgres (Drizzle ORM) — users, chats, usage, subscriptions, teams, KB
    ├── Vercel Blob  — file uploads
    ├── Redis         — resumable streams, pub/sub for real-time collab, response cache
    └── Stripe        — subscription billing (monthly + annual)

External Services
    ├── fal.ai        — video generation (Kling AI)
    ├── E2B           — sandboxed code execution
    ├── Resend        — transactional email (welcome, password reset, team invites)
    ├── WorkOS        — SAML/SSO for enterprise
    ├── Sentry        — error monitoring
    └── Cohere        — optional KB reranking
```

---

## Key Documents

| Document | Description |
|----------|-------------|
| [PRICING_STRATEGY.md](./PRICING_STRATEGY.md) | Competitive analysis and pricing tiers |
| [PRODUCTION_DEPLOYMENT_CHECKLIST.md](./PRODUCTION_DEPLOYMENT_CHECKLIST.md) | Full production setup checklist |
| [TESTING_SUBSCRIPTION_FLOW.md](./TESTING_SUBSCRIPTION_FLOW.md) | Stripe subscription testing guide |

---

Last Updated: 2026-06-11
