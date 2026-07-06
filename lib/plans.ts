/**
 * Client-safe plan display data — single source of truth for UI pricing.
 *
 * These values MUST stay in sync with lib/stripe/config.ts STRIPE_PLANS.
 * This file has no external dependencies so it can be imported in client components.
 */

export type DbTier = "free" | "pro" | "premium" | "enterprise";
export type PlanKey = "free" | "plus" | "pro" | "max";

/** Map DB tier → site-facing display name.
 *  DB "pro" = Plus plan, DB "premium" = Pro plan, DB "enterprise" = Max plan.
 */
export const TIER_DISPLAY_NAMES: Record<DbTier, string> = {
  free: "Free",
  pro: "Plus",
  premium: "Pro",
  enterprise: "Max",
};

/** Site-facing monthly prices in dollars (matches STRIPE_PLANS amounts / 100) */
export const PLAN_MONTHLY_PRICE: Record<PlanKey, number> = {
  free: 0,
  plus: 12,
  pro: 25,
  max: 50,
};

/** Site-facing annual prices in dollars (billed as yearly lump sum) */
export const PLAN_ANNUAL_PRICE: Record<PlanKey, number> = {
  free: 0,
  plus: 115.2,
  pro: 240,
  max: 480,
};

/** Effective monthly cost on annual plan */
export const PLAN_ANNUAL_PER_MONTH: Record<PlanKey, number> = {
  free: 0,
  plus: 9.6,
  pro: 20,
  max: 40,
};
