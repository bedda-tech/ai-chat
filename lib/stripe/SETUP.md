# Stripe Setup Guide

This guide explains how to set up Stripe for the Bedda Chat subscription system.

## Prerequisites

1. Create a Stripe account at https://stripe.com
2. Get your API keys from https://dashboard.stripe.com/apikeys

## Step 1: Configure Environment Variables

Add the following to your `.env.local` file:

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_... # Use sk_live_... for production
STRIPE_PUBLISHABLE_KEY=pk_test_... # Use pk_live_... for production

# These will be filled in after creating products in Step 2
STRIPE_PLUS_PRICE_ID=
STRIPE_PRO_PRICE_ID=
STRIPE_MAX_PRICE_ID=
STRIPE_PLUS_ANNUAL_PRICE_ID=
STRIPE_PRO_ANNUAL_PRICE_ID=
STRIPE_MAX_ANNUAL_PRICE_ID=

# Webhook secret (filled in Step 3)
STRIPE_WEBHOOK_SECRET=
```

## Step 2: Create Products and Prices

### Option A: Automated Script (Recommended)

Run the setup script to create all products and prices in one step:

```bash
STRIPE_SECRET_KEY=sk_live_... npx tsx scripts/setup-stripe.ts
```

This creates three products (Plus, Pro, Max) with both monthly and annual pricing.

### Option B: Using Stripe Dashboard (Manual)

1. Go to https://dashboard.stripe.com/products
2. Click "Add product" for each tier:

#### Plus Plan ($12/month)
- **Name**: Bedda Plus
- **Description**: All 30+ AI models. 300 messages/day. One subscription.
- **Pricing**: $12.00 USD/month
- **Recurring**: Yes
- Copy the Price ID → `STRIPE_PLUS_PRICE_ID`

#### Plus Annual ($115.20/year)
- **Name**: Bedda Plus Annual
- **Pricing**: $115.20 USD/year
- **Recurring**: Yes
- Copy the Price ID → `STRIPE_PLUS_ANNUAL_PRICE_ID`

#### Pro Plan ($25/month)
- **Name**: Bedda Pro
- **Description**: Power user plan. 1,500 messages/day. Priority model access.
- **Pricing**: $25.00 USD/month
- **Recurring**: Yes
- Copy the Price ID → `STRIPE_PRO_PRICE_ID`

#### Pro Annual ($240/year)
- **Name**: Bedda Pro Annual
- **Pricing**: $240.00 USD/year
- **Recurring**: Yes
- Copy the Price ID → `STRIPE_PRO_ANNUAL_PRICE_ID`

#### Max Plan ($50/month)
- **Name**: Bedda Max
- **Description**: Unlimited everything. 5,000 messages/day. Team workspace.
- **Pricing**: $50.00 USD/month
- **Recurring**: Yes
- Copy the Price ID → `STRIPE_MAX_PRICE_ID`

#### Max Annual ($480/year)
- **Name**: Bedda Max Annual
- **Pricing**: $480.00 USD/year
- **Recurring**: Yes
- Copy the Price ID → `STRIPE_MAX_ANNUAL_PRICE_ID`

## Step 3: Set Up Webhooks

Webhooks are required to sync subscription events with your database.

### Local Development

1. Install Stripe CLI (if not already): https://stripe.com/docs/stripe-cli
2. Forward webhooks to your local server:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

3. Copy the webhook signing secret (starts with `whsec_`) to `STRIPE_WEBHOOK_SECRET`

### Production

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter your endpoint URL: `https://www.bedda.tech/api/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed` (Primary event - payment successful)
   - `checkout.session.expired` (Checkout abandonment recovery)
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `customer.subscription.trial_will_end` (Trial ending reminders)
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

## Step 4: Test the Integration

1. Start your local development server
2. Create a test checkout session
3. Use Stripe test card: `4242 4242 4242 4242` (any future expiry, any CVC)
4. Verify subscription created in Stripe Dashboard
5. Verify user tier updated in your database

## Pricing Tiers Summary

| Tier | Price | Annual (20% off) | Messages/Day | Messages/Month | Features |
|------|-------|-------------------|--------------|----------------|----------|
| Free | $0 | — | 50 | 500 | Standard models, rate limits |
| Plus | $12/mo | $115.20/yr ($9.60/mo) | 300 | Unlimited | ALL 30+ models, web search, code execution, image/video gen, KB RAG |
| Pro | $25/mo | $240/yr ($20/mo) | 1,500 | Unlimited | Everything in Plus + 5× daily capacity + priority model access |
| Max | $50/mo | $480/yr ($40/mo) | 5,000 | Unlimited | Everything in Pro + team workspace + enterprise features |

## Stripe Configuration in Code

The Stripe configuration is located in:
- `lib/stripe/config.ts` - Client setup and plan definitions
- `lib/stripe/subscriptions.ts` - Subscription management functions
- `lib/stripe/index.ts` - Public exports

## Internal DB Tier Mapping

Site-facing names map to internal DB tier values:

| Site Name | DB Tier | Monthly | Annual |
|-----------|---------|---------|--------|
| Plus | `pro` | $12/mo | $115.20/yr |
| Pro | `premium` | $25/mo | $240/yr |
| Max | `enterprise` | $50/mo | $480/yr |

## Deployment Script

For production setup, use the one-shot deployment script:

```bash
STRIPE_SECRET_KEY=sk_live_... STRIPE_PUBLISHABLE_KEY=pk_live_... VERCEL_TOKEN=... bash scripts/deploy-production.sh
```

This creates Stripe products, registers the webhook, sets Vercel env vars, and redeploys.

## Resources

- Stripe Dashboard: https://dashboard.stripe.com
- Stripe API Docs: https://stripe.com/docs/api
- Stripe Testing: https://stripe.com/docs/testing
- Stripe CLI: https://stripe.com/docs/stripe-cli
