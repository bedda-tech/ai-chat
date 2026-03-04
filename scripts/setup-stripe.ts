/**
 * Setup Stripe products and prices for Bedda Chat.
 *
 * Run with: STRIPE_SECRET_KEY=sk_live_... npx tsx scripts/setup-stripe.ts
 *
 * This creates three products:
 *   - Bedda Plus  ($12/mo) → set STRIPE_PLUS_PRICE_ID in Vercel env
 *   - Bedda Pro   ($25/mo) → set STRIPE_PRO_PRICE_ID in Vercel env
 *   - Bedda Max   ($50/mo) → set STRIPE_MAX_PRICE_ID in Vercel env
 */

import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("Error: STRIPE_SECRET_KEY environment variable is required.");
  process.exit(1);
}

const stripe = new Stripe(key, {
  apiVersion: "2025-10-29.clover",
  typescript: true,
});

async function createPlan(
  name: string,
  description: string,
  amountCents: number,
  envVarName: string
) {
  console.log(`\nCreating product: ${name}...`);

  const product = await stripe.products.create({
    name: `Bedda ${name}`,
    description,
    metadata: { bedda_plan: name.toLowerCase() },
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: amountCents,
    currency: "usd",
    recurring: { interval: "month" },
    metadata: { bedda_plan: name.toLowerCase() },
  });

  console.log(`  Product ID: ${product.id}`);
  console.log(`  Price ID:   ${price.id}`);
  console.log(`  → Add to Vercel: ${envVarName}=${price.id}`);

  return { product, price };
}

async function main() {
  console.log("Setting up Stripe products for Bedda Chat...");
  console.log(
    `Using ${key!.startsWith("sk_live") ? "LIVE" : "TEST"} Stripe key`
  );

  try {
    const plus = await createPlan(
      "Plus",
      "All 135+ AI models. 300 messages/day. One subscription.",
      1200,
      "STRIPE_PLUS_PRICE_ID"
    );

    const pro = await createPlan(
      "Pro",
      "Power user plan. 1,500 messages/day. Priority model access.",
      2500,
      "STRIPE_PRO_PRICE_ID"
    );

    const max = await createPlan(
      "Max",
      "Unlimited everything. 5,000 messages/day. Team workspace.",
      5000,
      "STRIPE_MAX_PRICE_ID"
    );

    console.log("\n=== Setup Complete ===");
    console.log(
      "Add these environment variables to Vercel (Settings → Environment Variables):\n"
    );
    console.log(`STRIPE_PLUS_PRICE_ID=${plus.price.id}`);
    console.log(`STRIPE_PRO_PRICE_ID=${pro.price.id}`);
    console.log(`STRIPE_MAX_PRICE_ID=${max.price.id}`);
    console.log("\nAlso make sure these are set:");
    console.log("  STRIPE_SECRET_KEY=sk_live_...");
    console.log("  STRIPE_WEBHOOK_SECRET=whsec_...");
    console.log(
      "  (Configure webhook at https://dashboard.stripe.com/webhooks)"
    );
    console.log(
      "  Webhook URL: https://bedda.ai/api/webhooks/stripe"
    );
    console.log("  Webhook events to enable:");
    console.log("    - checkout.session.completed");
    console.log("    - customer.subscription.created");
    console.log("    - customer.subscription.updated");
    console.log("    - customer.subscription.deleted");
    console.log("    - invoice.payment_succeeded");
    console.log("    - invoice.payment_failed");
  } catch (err) {
    console.error("Error creating Stripe products:", err);
    process.exit(1);
  }
}

main();
