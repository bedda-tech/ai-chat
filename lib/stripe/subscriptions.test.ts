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

  console.log("createCheckoutSession");

  await test("requests 3D Secure on every card payment", async () => {
    const { stripe } = await import("./config");
    const { createCheckoutSession } = await import("./subscriptions");
    // Stub the two Stripe calls createCheckoutSession makes.
    const loose = stripe as unknown as {
      customers: { list: unknown };
      checkout: { sessions: { create: unknown } };
    };
    let captured: Record<string, unknown> | undefined;
    loose.customers.list = async () => ({ data: [{ id: "cus_test" }] });
    loose.checkout.sessions.create = async (
      params: Record<string, unknown>
    ) => {
      captured = params;
      return { url: "https://checkout.stripe.test" };
    };

    await createCheckoutSession({
      userId: "u1",
      userEmail: "alice@example.com",
      priceId: "price_plus_monthly",
      successUrl: "https://x.test/success",
      cancelUrl: "https://x.test/canceled",
    });

    assert.deepEqual(captured?.payment_method_options, {
      card: { request_three_d_secure: "any" },
    });
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

main();
