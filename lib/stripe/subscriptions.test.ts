/**
 * Unit tests for lib/stripe/subscriptions.ts getSubscriptionTier.
 * Run with: npx tsx lib/stripe/subscriptions.test.ts
 *
 * getSubscriptionTier takes an already-fetched Stripe.Subscription object and
 * derives a DB tier from it — no network call of its own — so it's testable
 * with a hand-built fixture. STRIPE_PLANS reads price IDs from process.env at
 * module-load time, so they're set once before the single dynamic import.
 */
import assert from "node:assert/strict";
import type Stripe from "stripe";

process.env.STRIPE_PLUS_PRICE_ID = "price_plus_monthly";
process.env.STRIPE_PRO_PRICE_ID = "price_pro_monthly";
delete process.env.STRIPE_PLUS_ANNUAL_PRICE_ID;
delete process.env.STRIPE_PRO_ANNUAL_PRICE_ID;
delete process.env.STRIPE_MAX_PRICE_ID;
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

function subscriptionWithPriceId(priceId: string | undefined) {
  return {
    items: {
      data: priceId ? [{ price: { id: priceId } }] : [],
    },
  } as unknown as Stripe.Subscription;
}

async function main() {
  const { getSubscriptionTier } = await import("./subscriptions");

  console.log("getSubscriptionTier");

  await test("returns free when the subscription has no items", async () => {
    const tier = await getSubscriptionTier(subscriptionWithPriceId(undefined));
    assert.equal(tier, "free");
  });

  await test("returns the mapped tier for a configured price id", async () => {
    const tier = await getSubscriptionTier(
      subscriptionWithPriceId("price_plus_monthly")
    );
    assert.equal(tier, "pro");
  });

  await test("returns the mapped tier for a different configured price id", async () => {
    const tier = await getSubscriptionTier(
      subscriptionWithPriceId("price_pro_monthly")
    );
    assert.equal(tier, "premium");
  });

  await test("returns free for an unrecognized price id", async () => {
    const tier = await getSubscriptionTier(
      subscriptionWithPriceId("price_totally_unknown")
    );
    assert.equal(tier, "free");
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

main();
