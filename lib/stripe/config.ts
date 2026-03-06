import Stripe from "stripe";

/**
 * Stripe client instance.
 * STRIPE_SECRET_KEY must be set in production — requests will fail without it.
 * We defer the check to runtime so Next.js can build without the key locally.
 */
// Fallback to a non-empty placeholder so the Stripe SDK initialises without
// throwing during `next build` (the key is required in production on Vercel).
export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY ?? "sk_placeholder_build_only",
  {
    apiVersion: "2025-10-29.clover",
    typescript: true,
    appInfo: {
      name: "Bedda Chat",
      version: "1.0.0",
    },
  }
);

/**
 * Stripe pricing plan configuration.
 *
 * Site-facing tier names map to internal DB tier values:
 *   Plus  ($12/mo) → DB tier "pro"
 *   Pro   ($25/mo) → DB tier "premium"
 *   Max   ($50/mo) → DB tier "enterprise"
 *
 * Required env vars (monthly):
 *   STRIPE_PLUS_PRICE_ID         — Stripe Price ID for Plus monthly ($12/mo)
 *   STRIPE_PRO_PRICE_ID          — Stripe Price ID for Pro monthly ($25/mo)
 *   STRIPE_MAX_PRICE_ID          — Stripe Price ID for Max monthly ($50/mo)
 *
 * Optional env vars (annual, 20% discount):
 *   STRIPE_PLUS_ANNUAL_PRICE_ID  — Stripe Price ID for Plus annual ($115.20/yr = $9.60/mo)
 *   STRIPE_PRO_ANNUAL_PRICE_ID   — Stripe Price ID for Pro annual ($240/yr = $20/mo)
 *   STRIPE_MAX_ANNUAL_PRICE_ID   — Stripe Price ID for Max annual ($480/yr = $40/mo)
 *
 * To create annual prices: run `STRIPE_SECRET_KEY=sk_live_... npx tsx scripts/setup-stripe.ts`
 */
export const STRIPE_PLANS = {
  FREE: {
    id: null,
    name: "Free",
    displayName: "Free",
    dbTier: "free" as const,
    price: 0,
    annualPrice: 0,
    messagesPerDay: 50,
    messagesPerMonth: 500,
  },
  PLUS: {
    id: process.env.STRIPE_PLUS_PRICE_ID,
    annualId: process.env.STRIPE_PLUS_ANNUAL_PRICE_ID,
    name: "plus",
    displayName: "Plus",
    dbTier: "pro" as const,
    price: 1200,       // $12.00/mo in cents
    annualPrice: 11520, // $115.20/yr ($9.60/mo) — 20% off
    messagesPerDay: 300,
    messagesPerMonth: 999_999_999,
  },
  PRO: {
    id: process.env.STRIPE_PRO_PRICE_ID,
    annualId: process.env.STRIPE_PRO_ANNUAL_PRICE_ID,
    name: "pro",
    displayName: "Pro",
    dbTier: "premium" as const,
    price: 2500,       // $25.00/mo in cents
    annualPrice: 24000, // $240/yr ($20/mo) — 20% off
    messagesPerDay: 1_500,
    messagesPerMonth: 999_999_999,
  },
  MAX: {
    id: process.env.STRIPE_MAX_PRICE_ID,
    annualId: process.env.STRIPE_MAX_ANNUAL_PRICE_ID,
    name: "max",
    displayName: "Max",
    dbTier: "enterprise" as const,
    price: 5000,       // $50.00/mo in cents
    annualPrice: 48000, // $480/yr ($40/mo) — 20% off
    messagesPerDay: 5_000,
    messagesPerMonth: 999_999_999,
  },
} as const;

export type PlanName = "plus" | "pro" | "max";
export type BillingPeriod = "monthly" | "annual";
export type DbTier = "free" | "pro" | "premium" | "enterprise";

/** Human-readable display names for DB tier values */
export const TIER_DISPLAY_NAMES: Record<DbTier, string> = {
  free: "Free",
  pro: "Plus",
  premium: "Pro",
  enterprise: "Max",
};

/**
 * Map a Stripe price ID to the internal DB tier.
 * Handles both monthly and annual price IDs.
 */
export function mapStripePriceToTier(priceId: string): DbTier {
  if (priceId === STRIPE_PLANS.PLUS.id || priceId === STRIPE_PLANS.PLUS.annualId) return "pro";
  if (priceId === STRIPE_PLANS.PRO.id || priceId === STRIPE_PLANS.PRO.annualId) return "premium";
  if (priceId === STRIPE_PLANS.MAX.id || priceId === STRIPE_PLANS.MAX.annualId) return "enterprise";
  return "free";
}

/**
 * Map a site-facing plan name (plus/pro/max) to a Stripe price ID.
 * If billingPeriod is "annual" and the annual price ID is configured, uses it.
 * Falls back to monthly if annual price ID is not set.
 */
export function mapPlanToStripePrice(plan: PlanName, billingPeriod: BillingPeriod = "monthly"): string | null {
  if (billingPeriod === "annual") {
    if (plan === "plus") return STRIPE_PLANS.PLUS.annualId || STRIPE_PLANS.PLUS.id || null;
    if (plan === "pro") return STRIPE_PLANS.PRO.annualId || STRIPE_PLANS.PRO.id || null;
    if (plan === "max") return STRIPE_PLANS.MAX.annualId || STRIPE_PLANS.MAX.id || null;
  }
  if (plan === "plus") return STRIPE_PLANS.PLUS.id || null;
  if (plan === "pro") return STRIPE_PLANS.PRO.id || null;
  if (plan === "max") return STRIPE_PLANS.MAX.id || null;
  return null;
}

/**
 * Map an internal DB tier to its Stripe price ID.
 */
export function mapTierToStripePrice(tier: DbTier | "enterprise"): string | null {
  if (tier === "pro") return STRIPE_PLANS.PLUS.id || null;
  if (tier === "premium") return STRIPE_PLANS.PRO.id || null;
  if (tier === "enterprise") return STRIPE_PLANS.MAX.id || null;
  return null;
}
