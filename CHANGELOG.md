# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

_No unreleased changes._

---

## [2.1.0] — 2026-07-26

### Models
- `c54b955` feat(models): add Claude Sonnet 4.6 and Opus 4.8 to model catalog (now 40+ models)

### Chat Experience
- `8bab916` feat(chat): add localStorage persistence for chat history (offline resilience)
- `cf817f8` feat(chat): add message grouping with tighter spacing and per-group timestamps
- `40548d8` feat(model-selector): add model health indicators from static status feed
- `7cf769e` feat(model-prefs): per-model preference persistence by use-case category

### Usage & Cost Transparency
- `f07bc27` feat(usage): show per-message cost for all models with internal pricing fallback
- `852f4e1` feat(usage): add /api/usage/daily endpoint for chat UI rate-limit display

### Knowledge Base
- `153b0b6` feat(knowledge-base): add PDF support via pdf-parse

### Growth & Retention
- `cf817f8` feat(growth): surface referral card, wire Sentry DSN, add near-limit nudge
- `6edb3db` feat: wire free-tier entitlements to proven free model APIs

### Security
- `04c4e8e` security: fix open redirect, timing-safe unsub token, and WorkOS CSRF
- `05139f9` fix(security): close three cost-guard gaps for guest/free tier

### Performance
- `75a96de` perf(models-cache): cache enriched models and deduplicate concurrent misses

---

## [2.0.0] — 2026-06-11

### Enterprise
- `0963117` feat(enterprise): org-level model allowlist/denylist + monthly cost cap per team
- `63ee351` feat(enterprise): add SAML/SSO via WorkOS (per-domain, enterprise-tier only)
- `12ee3fb` feat(enterprise): add audit_logs table with 8 action types and admin-gated paginated view
- `92511a2` feat: add admin dashboard at /admin with per-model latency, token, and error metrics

### Chat Platform Bots
- `bfbd39b` feat(whatsapp): add WhatsApp Cloud API bot
- `00b5656` feat(ms-teams): add Microsoft Teams Outgoing Webhook bot
- `5760650` feat(telegram): add Telegram bot via webhook API
- `dd05cc5` feat(github): add GitHub bot for PR review and issue response with @bedda mention
- `90a55e6` feat(discord): add Discord bot via Interactions API (/bedda slash command)
- `0016bfc` feat(slack): add thread conversation history and model selection prefix
- `8494216` feat(slack): add Slack bot integration with multi-workspace OAuth

### Plugins & Integrations
- `7b44545` feat(plugins): add plugin marketplace discovery page with 20 curated plugins
- `15e9f83` feat(plugins): add user-defined webhook plugin tools with AES-256-GCM credential encryption

### Knowledge & RAG
- `f02ed35` feat(rag): project-scoped knowledge bases
- `51e7bfc` feat(rag): add Google Drive + Notion import to knowledge base
- `b7949bf` feat: add RAG middleware for automatic KB context injection per chat
- `0c1d201` feat: add optional Cohere reranking to KB search tool
- `461dd5f` feat: hybrid RAG search using Reciprocal Rank Fusion (vector + BM25)

### Teams & Collaboration
- `775aff2` feat(teams): add real-time collaborative editing for shared team chat threads
- `73170da` feat: Team workspace Phase 2 — shared chat threads with team visibility
- `f96216a` feat(teams): add seat-based billing for Team plans via Stripe
- `099aebf` feat: Team workspace Phase 1 — create teams, invite members by email, role-based access

### Artifacts & Canvas
- `1ecb7c8` feat(artifacts): add Jupyter-style notebook artifact
- `43ab6e7` feat(artifacts): add slides/presentation artifact with Reveal.js
- `de51342` feat: add HTML artifact — render interactive web pages in sandboxed iframe
- `f3e4f19` feat: add Mermaid diagram artifact (flowcharts, sequence diagrams, ER diagrams)

### Video & Image Studio
- `c1b39ec` feat: add Video Studio at /studio/video (Kling AI via fal.ai)
- `fcb3297` feat(video-studio): add image-to-video mode via Kling v1.6
- `bdc6460` feat(video-studio): quality tier selector (standard 720p / pro 1080p)
- `01a233a` feat(video-studio): add video gallery with persistent job history
- `be95b4c` feat: add Image Studio page at /studio with multi-model side-by-side generation
- `d4ce8d8` feat: multi-model image generation (DALL-E 3, Imagen 3, Flux 1.1 Pro)

### AI Capabilities
- `85f667d` feat(generative-ui): add interactive UI components rendered by AI (table, checklist, stats, timeline)
- `4a8ee65` feat: add interactive chart generation tool
- `6b5356d` feat: cross-conversation user memory — AI remembers facts about you across sessions
- `76a6edd` feat: Notion integration — connect workspace, search and read pages in chat
- `9172609` feat: Google Drive OAuth connect/disconnect + RAG auto-injection
- `0d108a6` feat: Google Drive AI tool — search and read Drive files in chat
- `d6c0984` feat: add E2B sandboxed code execution (Python/JS)
- `54fce02` feat: add web search tool (DuckDuckGo + Brave Search) with citation UI

### Models & Routing
- `c54b955` feat(models): add Claude Sonnet 4.6 and Opus 4.8 to model catalog
- `64adfef` feat: cross-provider context sanitization for mid-thread model switching
- `715ea05` feat: per-message model badge in mixed-model threads
- `676c721` feat: inline model switcher in chat toolbar

### Voice & Accessibility
- `2a3fed4` feat: voice input via MediaRecorder + Whisper (cross-browser, replaces Web Speech API)
- `e76eb19` feat: add text-to-speech tool
- `3b6f907` feat: read-aloud button on assistant messages

### Auth & Onboarding
- `af33f75` feat(onboarding): add driver.js feature tour for new users (6 steps, DB-tracked)
- `7d6a36c` feat: add Google and GitHub social login (OAuth with email account linking)
- `3dddaec` feat: add forgot password / password reset flow (Resend, SHA-256 token, 1hr expiry)
- `7d05c37` feat: send welcome email on signup (email/password + OAuth new users)

### Developer & API
- `942388a` feat: OpenAI-compatible REST API for subscribers + API key management
- `342027b` feat: add MCP (Model Context Protocol) integration — connect external MCP servers
- `585895b` feat: canvas mode toolbar button + CanvasModeButton dropdown

### Projects & Workspaces
- `b4e7246` feat: add Projects / Workspaces (per-project KB, instructions, chat grouping)
- `f02ed35` feat(rag): project-scoped knowledge bases

### Infrastructure & Observability
- `3f0c683` feat: add Sentry error monitoring (gated on NEXT_PUBLIC_SENTRY_DSN)
- `3cdac60` feat(analytics): add Google Analytics 4 integration
- `7c191a1` feat: add Umami analytics with first-party proxy
- `5330569` feat: enable prompt caching for Anthropic and OpenAI (50–90% cost reduction)
- `fceb8f9` fix: use per-model pricing from models-data.json in calculateCost
- `ca7e295` feat: track request latency in chat and persist to usageEvent
- `4d8821e` feat: gate API key creation to paid subscribers (free → 403)
- `648475d` feat: add PWA support — installable on mobile, service worker, offline shell

### Fixes
- `208db94` fix(stripe): make deploy-production.sh idempotent + add NEXT_PUBLIC_APP_URL
- `a6ce90b` fix: break infinite redirect loop for cookieless clients (bots, monitors) in guest auth
- `bce0d0b` fix: correct Project.userId type from varchar(255) to uuid
- `5e46f35` fix: remove Pyodide script causing server-side exception and hydration mismatch
- `f256d32` fix: add /chat route redirect to fix 404 for unauthenticated users (issue #34)
- `264dfb2` fix: gate Umami analytics rewrites on NEXT_PUBLIC_UMAMI_HOST to prevent Vercel build failures

---

## [1.0.0] — 2026-02-24

### Added
- Multi-model chat with streaming via Vercel AI Gateway
- 28 models from 7 providers
- Stripe subscription billing (Free / Plus / Pro / Max) — monthly and annual
- Usage tracking and tier-based rate limiting (daily + monthly limits)
- Prompt caching for 50–90% cost reduction
- Artifacts: text, code, image, spreadsheet
- Image generation (Gemini Flash Image)
- File uploads to Vercel Blob
- Audio transcription (Whisper)
- Knowledge Base (RAG with pgvector, IVFFlat index)
- Custom instructions / user preferences
- Chat sharing with public links
- Prompt library (30 templates)
- Upgrade dialog with tier-aware messaging
- Sidebar upgrade CTA for free users
- Usage display in settings
- Guest mode with automatic session creation
- Social login (Google + GitHub OAuth)
- Forgot password / password reset
- Tier display mapping (Free / Plus / Pro / Max)
- Daily rate limit enforcement
- Annual subscription price support
- Free tier model entitlements for guests
- Multi-model comparison view (issue #2)
- Deep Research agent mode (maxSteps=20)
- Web search with citation UI (DuckDuckGo + Brave)
- Sandboxed code execution (E2B)
- Projects / Workspaces with per-project context
- MCP integration (external MCP servers)
- Voice input (Web Speech API, Chrome/Edge)
- Text-to-speech on assistant messages
- Prompt library rendered in toolbar
- PWA manifest and service worker
- Hybrid RAG with Reciprocal Rank Fusion
- Generative diagrams (Mermaid artifact)
- Google Drive OAuth + file access in chat
- Notion OAuth + page access in chat
- Cross-conversation user memory
- Canvas mode (text/code/sheet/mermaid/html)
- Admin model metrics API
- Chat history export as Markdown
- Per-message model switching UI
- Cross-provider context sanitization
- AI SDK v5 → v6 upgrade
- Prompt caching via providerOptions (AI SDK v6)
- Logging and performance middleware
- Health endpoint at /api/health
- Roadmap page with live status

### Infrastructure
- **Usage Analytics & Rate Limiting** — database schema for tier management, usage tracking, rate limits
  - Free: 3 msgs/min, 30 msgs/day, 75 msgs/month
  - Pro: 10 msgs/min, 300 msgs/day, 750 msgs/month
  - Premium: 20 msgs/min, 1,000 msgs/day, 3,000 msgs/month
  - Enterprise: 100 msgs/min, 10k msgs/day, 100k msgs/month

[Unreleased]: https://github.com/bedda-tech/ai-chat/compare/HEAD...HEAD
[2.0.0]: https://github.com/bedda-tech/ai-chat/compare/54fce02...0963117
[1.0.0]: https://github.com/bedda-tech/ai-chat/commits/54fce02
