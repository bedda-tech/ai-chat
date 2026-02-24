# Bedda AI Pricing Strategy

> Last updated: February 24, 2026

## Executive Summary

Bedda's competitive advantage is access to **ALL frontier AI models** under a single subscription. Competitors force users to choose: $20/mo for Claude OR $20/mo for ChatGPT OR $20/mo for Gemini. Bedda gives you all of them for less.

**Core value proposition:** "Why pay $60/mo for three separate AI subscriptions when you can get ALL of them for $12?"

---

## Competitive Landscape (February 2026)

### Competitor Pricing

| Provider | Free | Entry Paid | Mid Tier | Top Tier |
|----------|------|------------|----------|----------|
| **Claude** | Sonnet 4.5, ~25 msgs/5hr | Pro $20/mo, ~45 msgs/5hr | Max 5x $100/mo | Max 20x $200/mo |
| **ChatGPT** | GPT-5.2 Instant, ~10 msgs/5hr | Go $8/mo (has ads) | Plus $20/mo | Pro $200/mo |
| **Gemini** | Limited | AI Plus $7.99/mo | AI Pro $19.99/mo | AI Ultra $249.99/mo |
| **Poe** | 300 pts/day | $4.99/mo | $49.99/mo | $249.99/mo |
| **Perplexity** | Basic search | Pro $20/mo | -- | Max $200/mo |
| **Grok** | Basic via X | SuperGrok $30/mo | -- | SuperGrok Heavy $300/mo |

### Key Observations

1. **$20/mo is the standard mid-tier price** across Claude, ChatGPT, and Perplexity
2. **$200-250/mo is the power user ceiling** for Claude Max, ChatGPT Pro, Gemini Ultra
3. **Google undercuts at $7.99-19.99** but with fewer models
4. **Poe is the closest competitor** (multi-model aggregator) but uses a confusing points system
5. **No competitor offers all frontier models at an affordable price point**
6. **Video generation is a premium differentiator** -- only ChatGPT (Sora) and Gemini (Veo) have it
7. **Image generation is table stakes** -- ChatGPT and Gemini include it; Claude does NOT

### Competitor Feature Gaps

| Feature | Claude | ChatGPT | Gemini | Bedda Opportunity |
|---------|--------|---------|--------|-------------------|
| Image gen | None | DALL-E | Imagen/Nano Banana | Already have (Gemini Flash Image) |
| Video gen | None | Sora ($20+) | Veo ($19.99+) | Add via Kling/Runway/Veo API |
| Multi-provider | No | No | No | **OUR KEY ADVANTAGE** |
| Web search | Yes | Yes | Yes | Must add (critical gap) |
| Code sandbox | CLI only | Browser | Browser | Must add |
| Context window | 200K (1M beta) | 400K | 1M | Gateway handles this |

---

## Recommended Pricing Tiers

### Free -- $0/mo
Target: Trial users, students, casual explorers

| Limit | Value |
|-------|-------|
| Messages/day | 50 |
| Messages/month | 500 |
| Rate limit | 5/minute |
| Models | Standard (Haiku 4.5, Gemini Flash, GPT-5 Nano, DeepSeek, Grok 3 Mini) |
| Image generation | 5/day |
| File uploads | 5/day, 10MB max |
| Artifacts | Basic (text only) |

**Why this works:** More generous than Claude Free (~25 msgs/5hr) and ChatGPT Free (~10 msgs/5hr). Gives users enough to get hooked, but standard models only -- they'll want frontier models.

### Plus -- $12/mo
Target: Individual users who want access to all AI models. **This is our main acquisition tier.**

| Limit | Value |
|-------|-------|
| Messages/day | 300 |
| Messages/month | Unlimited (daily cap is the limit) |
| Rate limit | 15/minute |
| Models | ALL models (Opus, Sonnet, GPT-5, Gemini Pro, Grok 4, DeepSeek, etc.) |
| Image generation | 100/day |
| Video generation | 5/day (when launched) |
| File uploads | 50/day, 25MB max |
| Artifacts | All types (text, code, image, sheet) |
| Web search | Included |
| Projects | 5 active projects |

**Why $12:**
- Cheaper than Claude Pro ($20), ChatGPT Plus ($20), Gemini Pro ($19.99)
- More models than any single competitor
- The pitch: "Get Claude + ChatGPT + Gemini + Grok for $12/mo instead of $80/mo"
- At 300 msgs/day, most users average ~50-80/day. Average cost ~$0.005/msg with caching = ~$6-12/mo in API costs. Sustainable.

### Pro -- $25/mo
Target: Power users, developers, professionals who need high throughput and advanced features

| Limit | Value |
|-------|-------|
| Messages/day | 1,500 |
| Messages/month | Unlimited |
| Rate limit | 30/minute |
| Models | ALL models + early access to new releases |
| Image Studio | Unlimited generations, editing, variations |
| Video Studio | 20/day |
| Code execution | Full sandbox (Python, JS, etc.) |
| File uploads | Unlimited, 50MB max |
| Artifacts | All types + advanced (diagrams, presentations) |
| Web search | Unlimited |
| Projects | 25 active projects with knowledge bases |
| Voice input | Included |
| Memory | Cross-conversation memory |

**Why $25:**
- Slightly more than individual competitors but with ALL models + features none of them have individually
- Competes with Claude Pro + ChatGPT Plus combined ($40) at 63% less
- At 1,500 msgs/day, power users might hit 500-800/day. Average cost ~$10-20/mo. Sustainable with the higher price.

### Max -- $50/mo
Target: Teams, agencies, heavy daily users who need unlimited everything

| Limit | Value |
|-------|-------|
| Messages/day | 5,000 (effectively unlimited) |
| Messages/month | Unlimited |
| Rate limit | 60/minute |
| Models | ALL models + priority access + beta models |
| Image Studio | Unlimited + batch generation |
| Video Studio | 50/day + longer clips |
| Code execution | Unlimited |
| File uploads | Unlimited, 100MB max |
| Everything in Pro | Included |
| Team workspace | Up to 5 members |
| API access | 50,000 credits/mo |
| Custom instructions | Persistent custom system prompts |
| Priority support | Direct support channel |

**Why $50:**
- Same price as our old "Premium" tier but with massively more value
- Competes with Claude Max 5x ($100) at 50% less
- Competes with ChatGPT Pro ($200) at 75% less
- Team features justify the price for small teams
- Heavy users at 2,000+ msgs/day cost ~$30-60/mo in API. Break-even to slight loss on heaviest users, subsidized by lighter users.

### Enterprise -- Custom ($15+/seat/mo)
Target: Companies, organizations with compliance needs

- Everything in Max
- SSO/SAML
- Admin dashboard
- Audit logging
- Custom model routing
- SLA guarantees
- Dedicated support
- Volume pricing

---

## Unit Economics Analysis

### Cost Per Message (with prompt caching)

| Model Tier | Avg Input | Avg Output | Cost/Message | With Caching |
|-----------|-----------|------------|-------------|-------------|
| Standard (Haiku, Flash, DeepSeek) | 500 tok | 800 tok | $0.002 | $0.001 |
| Mid-tier (Sonnet, GPT-5, Gemini Pro) | 500 tok | 800 tok | $0.015 | $0.008 |
| Premium (Opus, GPT-5 Pro) | 500 tok | 800 tok | $0.025 | $0.015 |

### Revenue vs Cost Per User (Monthly)

| Tier | Price | Avg Daily Use | Monthly Msgs | Avg Cost/Mo | Gross Margin |
|------|-------|--------------|-------------|-------------|-------------|
| Free | $0 | 15 msgs | 450 | $1.35 | -100% (acquisition cost) |
| Plus | $12 | 60 msgs | 1,800 | $5.40 | 55% |
| Pro | $25 | 200 msgs | 6,000 | $12.00 | 52% |
| Max | $50 | 500 msgs | 15,000 | $30.00 | 40% |

**Key assumptions:**
- 60% of messages use mid-tier models, 30% standard, 10% premium
- Prompt caching reduces input costs by ~50%
- Average message: 500 input tokens, 800 output tokens
- Not all users hit their daily cap (average is ~30-40% of limit)

### Break-Even Analysis

At 10,000 paid users (80% Plus, 15% Pro, 5% Max):
- Monthly revenue: ~$148,000
- Monthly API costs: ~$72,000
- Gross margin: ~51%
- After infrastructure (Vercel, DB, etc.): ~45% net margin

---

## Pricing Page Messaging

### Headline
"All the world's best AI models. One simple subscription."

### Subheadline
"Access Claude, ChatGPT, Gemini, Grok, DeepSeek, and 100+ more models. Starting at $12/mo."

### Key Selling Points (comparison table on pricing page)
1. "Claude Pro gives you Claude for $20. ChatGPT Plus gives you GPT for $20. Gemini Pro gives you Gemini for $20. Bedda Plus gives you ALL of them for $12."
2. "135+ AI models from 7 providers"
3. "Image generation, video generation, code execution -- all included"
4. "Switch between models mid-conversation"
5. "No per-model limits -- use any model you want"

---

## Migration from Current Pricing

### Current (Outdated)
- Free: 200/month, 50/day
- Pro: $20/mo, 1,500/day
- Premium: $50/mo, 5,000/day

### New
- Free: 500/month, 50/day (more generous monthly)
- Plus: $12/mo, 300/day (NEW tier -- cheaper entry point)
- Pro: $25/mo, 1,500/day (slight price increase, more features)
- Max: $50/mo, 5,000/day (renamed from Premium, team features added)

### Stripe Migration Plan
1. Create new Plus product + price ($12/mo)
2. Keep existing Pro price but update to $25/mo for new subscribers
3. Rename Premium to Max in Stripe
4. Grandfather existing subscribers at their current rate for 3 months
5. Update pricing page, checkout flows, and rate limiting code

---

## Competitive Advantages to Highlight

### vs Claude ($20/mo Pro)
- Bedda Plus ($12): Same Claude models + GPT-5 + Gemini + Grok + DeepSeek
- Image generation (Claude has none)
- Video generation (Claude has none)
- Web search with citations

### vs ChatGPT ($20/mo Plus)
- Bedda Plus ($12): Same GPT-5 + Claude + Gemini + Grok + DeepSeek
- No ads (ChatGPT Go has ads, Plus might get them)
- More model variety for different tasks
- Better artifacts system

### vs Gemini ($19.99/mo Pro)
- Bedda Plus ($12): Same Gemini + Claude + GPT-5 + Grok + DeepSeek
- Better code artifacts
- More powerful reasoning models (Claude Opus, GPT-5 Thinking)

### vs Poe ($19.99/mo Standard)
- Bedda Plus ($12): Similar multi-model access but cheaper
- Better UI/UX (not a points system)
- Native artifacts, code execution, image/video studio
- Simpler pricing (no confusing points)

---

## Next Steps

1. [ ] Update Stripe products (create Plus $12, update Pro to $25, rename Premium to Max)
2. [ ] Update pricing page with new tiers and competitor comparison
3. [ ] Update rate limiting code with new tier limits
4. [ ] Add model-tier restrictions (standard models only for free users)
5. [ ] Build features to justify pricing (web search, code execution, video gen)
6. [ ] Create marketing landing page with competitor comparison
7. [ ] Set up analytics to track conversion and churn by tier
