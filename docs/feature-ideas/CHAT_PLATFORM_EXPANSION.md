# Chat Platform Expansion via Vercel Chat SDK

> Added: 2026-02-25
> Status: Research / Evaluation
> Reference: https://github.com/vercel/chat

## Context

Vercel open-sourced a Chat SDK (public beta, Feb 2026) -- a unified TypeScript library for building chatbots across multiple messaging platforms with a single codebase. Currently supports Slack, Microsoft Teams, Google Chat, Discord, GitHub, and Linear.

Package: `npm i chat`

## How It Works

- Adapter pattern: write bot logic against a common API, plug in platform adapters
- Event-driven: type-safe handlers for mentions, messages, reactions, button clicks, slash commands
- JSX-based cards/modals that render natively on each platform
- AI streaming support: native Slack streaming + post+edit fallback for other platforms
- Distributed state via pluggable adapters (Redis, ioredis, in-memory)

## Opportunity for bedda.ai

bedda.ai is currently a web-only Next.js chat product. The Chat SDK opens a path to **deploy bedda's multi-model AI access directly into team workspaces**:

### Product: "bedda for Teams"

Instead of users coming to bedda.ai in a browser, bring bedda to where they already work:

1. **Slack bot**: `/bedda ask claude-opus "review this PR"` or just @bedda in any channel
2. **Discord bot**: community servers get multi-model AI access
3. **Teams bot**: enterprise teams get bedda inside Microsoft Teams
4. **GitHub bot**: AI code review, issue triage, PR summaries

### Why This Matters for Revenue

- **B2B channel**: team/workspace installs are stickier than individual web users
- **Per-seat pricing**: charge per workspace member with access ($5-10/seat/mo)
- **Enterprise upsell**: Teams/Slack integrations are table stakes for enterprise procurement
- **Lower churn**: embedded in daily workflow vs. "another tab to open"
- **Differentiation**: competitors (ChatGPT, Claude) have their own chat UIs but don't offer multi-model access inside Slack/Teams

### Implementation Approach

bedda already has:
- Multi-model routing (Claude, GPT, Gemini, etc.)
- Stripe billing
- Usage tracking
- Conversation history

What we'd add:
- Chat SDK adapters for Slack + Discord (start with 2)
- Workspace registration flow (OAuth install for Slack/Discord)
- Per-workspace billing (link Slack workspace -> Stripe subscription)
- Model selection via slash commands or thread context
- Artifact rendering adapted to each platform (code blocks, cards)

### Effort Estimate

- Phase 1 (Slack MVP): ~1 week. Slack adapter + bedda model router + basic commands
- Phase 2 (Discord): ~3 days. Second adapter, shared bot logic
- Phase 3 (Teams): ~1 week. Microsoft auth is more complex
- Phase 4 (GitHub): ~3 days. PR review bot, issue triage

### Risks

- Vercel Chat SDK is public beta -- API may change
- Each platform has its own OAuth/permissions model (especially Teams)
- Message rate limits per platform
- Cost control: team users could blow through API credits fast without per-user limits

## Competitive Landscape

| Product | Web UI | Slack | Discord | Teams |
|---------|--------|-------|---------|-------|
| ChatGPT | Yes | No | No | No |
| Claude | Yes | No | No | No |
| Gemini | Yes | No | No | No |
| Poe | Yes | No | No | No |
| **bedda (proposed)** | **Yes** | **Yes** | **Yes** | **Yes** |

No major competitor offers multi-model AI access as a native chat platform integration. This is a real gap.

## Next Steps

1. Spike: build a minimal Slack bot using Chat SDK + bedda's model router (~1 day)
2. Test with our own Slack workspace
3. If promising, design the billing model for workspace installs
4. Ship Slack beta, then Discord
