# Stripe Billing Setup

The Bedda AI billing system is fully implemented but requires proper Stripe configuration to function. This document explains what needs to be done to enable billing.

## Current Status

The application has:
- Complete pricing pages with correct pricing ($12/Plus, $25/Pro, $50/Max)
- Full Stripe integration including:
  - Checkout sessions
  - Webhooks handling
  - Subscription management
  - Billing portal access
- Team billing functionality for workspace subscriptions

## Missing Configuration

The following environment variables are required but currently empty in `.env.example`:

```env
# ─── Stripe ──────────────────────────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PLUS_PRICE_ID=price_...
STRIPE_PLUS_ANNUAL_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_PRO_ANNUAL_PRICE_ID=price_...
STRIPE_MAX_PRICE_ID=price_...
STRIPE_MAX_ANNUAL_PRICE_ID=price_...
STRIPE_TEAM_SEAT_PRICE_ID=price_...
```

## Setup Instructions

1. **Create Stripe Account** at https://dashboard.stripe.com/
2. **Create Products and Prices**:
   - Run the setup script: `STRIPE_SECRET_KEY=sk_live_... npx tsx scripts/setup-stripe.ts`
   - This will create three products (Plus, Pro, Max) with both monthly and annual prices
3. **Configure Environment Variables**:
   - Set `STRIPE_SECRET_KEY` to your live secret key
   - Set `STRIPE_WEBHOOK_SECRET` (create a secure random secret)
   - Set all the price IDs returned by the setup script
4. **Configure Webhook Endpoint**:
   - Add webhook URL: `https://yourdomain.com/api/webhooks/stripe`
   - Enable these events:
     - checkout.session.completed
     - customer.subscription.created
     - customer.subscription.updated
     - customer.subscription.deleted
     - invoice.payment_succeeded
     - invoice.payment_failed
     - customer.subscription.trial_will_end

## Testing

Once configured, test the billing flow by:
1. Navigating to `/upgrade`
2. Selecting a plan (Plus/Pro/Max)
3. Completing checkout process
4. Verifying webhook events are processed correctly