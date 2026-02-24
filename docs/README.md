# bedda.ai Documentation

## Current Status (February 2026)

bedda.ai is a multi-model AI chat platform offering 135+ models from 7 providers (Anthropic, OpenAI, Google, xAI, DeepSeek, Mistral, Groq) under a single subscription.

### What's Built (Phase 1 - Complete)
- Multi-model chat with streaming via Vercel AI Gateway
- 135+ model discovery and routing
- Stripe subscription payments (Free / Plus / Pro / Max)
- Usage tracking and tier-based rate limiting
- Prompt caching (50-90% cost reduction)
- Artifacts (text, code, image, spreadsheet)
- Image generation (Gemini Flash Image)
- File uploads to Vercel Blob
- Audio transcription (Whisper)

### In Progress (Phase 2)
- Web search with citations
- Image Studio (multi-model generation, editing, variations)
- Video Studio (text-to-video, image-to-video)
- Code execution sandbox
- OAuth social login
- Voice input

### Planned (Phase 3-4)
- Projects & Knowledge bases (RAG)
- Cross-conversation memory
- Model comparison arena
- Deep research agent
- Team workspaces
- API access for subscribers
- Mobile PWA
- Enterprise features (SSO, audit logging)

## Key Documents

| Document | Description |
|----------|-------------|
| [PRICING_STRATEGY.md](./PRICING_STRATEGY.md) | Competitive analysis and pricing tiers |
| [PRODUCTION_DEPLOYMENT_CHECKLIST.md](./PRODUCTION_DEPLOYMENT_CHECKLIST.md) | Deploy checklist for production |
| [TESTING_SUBSCRIPTION_FLOW.md](./TESTING_SUBSCRIPTION_FLOW.md) | Stripe subscription testing guide |

### Completed Implementation Docs (Historical)
| Document | Description |
|----------|-------------|
| [PHASE_1_COMPLETE.md](./PHASE_1_COMPLETE.md) | Phase 1 completion summary |
| [DYNAMIC_MODEL_DISCOVERY_IMPLEMENTATION.md](./DYNAMIC_MODEL_DISCOVERY_IMPLEMENTATION.md) | Model discovery implementation |
| [IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md) | Stripe + caching implementation |

### Feature Ideas
See [`feature-ideas/`](./feature-ideas/) for detailed proposals. Note: some feature ideas are outdated (written Q4 2025) and have been superseded by the [PRICING_STRATEGY.md](./PRICING_STRATEGY.md) and updated roadmap.

## Architecture

```
Vercel AI Gateway
    ├── Anthropic (Claude Opus, Sonnet, Haiku)
    ├── OpenAI (GPT-5, GPT-5 Codex)
    ├── Google (Gemini 2.5 Pro, Flash)
    ├── xAI (Grok 4, Grok 3)
    ├── DeepSeek (Chat, Reasoner)
    ├── Mistral (Large, Medium, Small)
    └── Groq (Llama 4, Llama 3.3)

Next.js 15 App Router
    ├── PostgreSQL (Drizzle ORM) -- users, chats, usage, subscriptions
    ├── Vercel Blob -- file uploads
    ├── Redis -- resumable streams (optional)
    └── Stripe -- payments
```

---

Last Updated: 2026-02-24
