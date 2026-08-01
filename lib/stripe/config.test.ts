/**
 * Unit tests for lib/stripe/config.ts price/tier mapping helpers.
 * Run with: npx tsx lib/stripe/config.test.ts
 *
 * STRIPE_PLANS reads price IDs from process.env at module-load time, so the
 * env vars below are set once, before the single dynamic import, and the
 * fixture is designed so every branch (configured monthly, configured
 * annual, annual-falls-back-to-monthly, entirely unconfigured) is reachable
 * from that one fixed configuration.
 */
import assert from "node:assert/strict";

process.env.STRIPE_PLUS_PRICE_ID = "price_plus_monthly";
process.env.STRIPE_PLUS_ANNUAL_PRICE_ID = "price_plus_annual";
process.env.STRIPE_PRO_PRICE_ID = "price_pro_monthly";
delete process.env.STRIPE_PRO_ANNUAL_PRICE_ID; // exercises annual->monthly fallback
delete process.env.STRIPE_MAX_PRICE_ID; // exercises entirely-unconfigured -> null
delete process.env.STRIPE_MAX_ANNUAL_PRICE_ID;

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => void | Promise<void>) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err: unknown) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err instanceof Error ? err.message : String(err)}`);
    failed++;
  }
}

async function main() {
  const {
    mapStripePriceToTier,
    mapPlanToStripePrice,
    mapTierToStripePrice,
  } = await import("./config");

  console.log("mapStripePriceToTier");

  await test("maps a configured monthly price ID to its DB tier", () => {
    assert.equal(mapStripePriceToTier("price_plus_monthly"), "pro");
    assert.equal(mapStripePriceToTier("price_pro_monthly"), "premium");
  });

  await test("maps a configured annual price ID to the same DB tier as monthly", () => {
    assert.equal(mapStripePriceToTier("price_plus_annual"), "pro");
  });

  await test("returns free for an unrecognized or empty price ID", () => {
    assert.equal(mapStripePriceToTier("price_totally_unknown"), "free");
    assert.equal(mapStripePriceToTier(""), "free");
  });

  console.log("mapPlanToStripePrice");

  await test("returns the monthly price ID by default", () => {
    assert.equal(mapPlanToStripePrice("plus"), "price_plus_monthly");
    assert.equal(mapPlanToStripePrice("pro"), "price_pro_monthly");
  });

  await test("returns the annual price ID when requested and configured", () => {
    assert.equal(mapPlanToStripePrice("plus", "annual"), "price_plus_annual");
  });

  await test("falls back to monthly when annual is requested but not configured", () => {
    assert.equal(mapPlanToStripePrice("pro", "annual"), "price_pro_monthly");
  });

  await test("returns null when the plan has no price ID configured at all", () => {
    assert.equal(mapPlanToStripePrice("max"), null);
    assert.equal(mapPlanToStripePrice("max", "annual"), null);
  });

  console.log("mapTierToStripePrice");

  await test("maps each configured DB tier to its monthly Stripe price ID", () => {
    assert.equal(mapTierToStripePrice("pro"), "price_plus_monthly");
    assert.equal(mapTierToStripePrice("premium"), "price_pro_monthly");
  });

  await test("returns null for an unconfigured tier", () => {
    assert.equal(mapTierToStripePrice("enterprise"), null);
  });

  await test("returns null for the free tier", () => {
    assert.equal(mapTierToStripePrice("free"), null);
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main();
