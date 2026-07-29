/**
 * Setup Stripe products and prices for Bedda Chat.
 *
 * Run with: STRIPE_SECRET_KEY=sk_live_... npx tsx scripts/setup-stripe.ts
 *
 * This creates three products with both monthly and annual prices:
 *   - Bedda Plus  ($12/mo or $115.20/yr) → set STRIPE_PLUS_PRICE_ID + STRIPE_PLUS_ANNUAL_PRICE_ID
 *   - Bedda Pro   ($25/mo or $240/yr)    → set STRIPE_PRO_PRICE_ID  + STRIPE_PRO_ANNUAL_PRICE_ID
 *   - Bedda Max   ($50/mo or $480/yr)    → set STRIPE_MAX_PRICE_ID  + STRIPE_MAX_ANNUAL_PRICE_ID
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
  monthlyAmountCents: number,
  annualAmountCents: number,
  monthlyEnvVar: string,
  annualEnvVar: string
) {
  console.log(`\nCreating product: ${name}...`);

  const product = await stripe.products.create({
    name: `Bedda ${name}`,
    description,
    metadata: { bedda_plan: name.toLowerCase() },
  });

  const monthlyPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: monthlyAmountCents,
    currency: "usd",
    recurring: { interval: "month" },
    metadata: { bedda_plan: name.toLowerCase(), billing: "monthly" },
  });

  const annualPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: annualAmountCents,
    currency: "usd",
    recurring: { interval: "year" },
    metadata: { bedda_plan: name.toLowerCase(), billing: "annual" },
  });

  console.log(`  Product ID:      ${product.id}`);
  console.log(
    `  Monthly Price:   ${monthlyPrice.id}  ($${monthlyAmountCents / 100}/mo)`
  );
  console.log(
    `  Annual Price:    ${annualPrice.id}  ($${annualAmountCents / 100}/yr)`
  );
  console.log(`  → ${monthlyEnvVar}=${monthlyPrice.id}`);
  console.log(`  → ${annualEnvVar}=${annualPrice.id}`);

  return { product, monthlyPrice, annualPrice };
}

async function main() {
  console.log("Setting up Stripe products for Bedda Chat...");
  console.log(
    `Using ${key?.startsWith("sk_live") ? "LIVE" : "TEST"} Stripe key`
  );

  try {
    const plus = await createPlan(
      "Plus",
      "All 36+ AI models. 300 messages/day. One subscription.",
      1200, // $12/mo
      11_520, // $115.20/yr (20% off)
      "STRIPE_PLUS_PRICE_ID",
      "STRIPE_PLUS_ANNUAL_PRICE_ID"
    );

    const pro = await createPlan(
      "Pro",
      "Power user plan. 1,500 messages/day. Priority model access.",
      2500, // $25/mo
      24_000, // $240/yr (20% off)
      "STRIPE_PRO_PRICE_ID",
      "STRIPE_PRO_ANNUAL_PRICE_ID"
    );

    const max = await createPlan(
      "Max",
      "Unlimited everything. 5,000 messages/day. Team workspace.",
      5000, // $50/mo
      48_000, // $480/yr (20% off)
      "STRIPE_MAX_PRICE_ID",
      "STRIPE_MAX_ANNUAL_PRICE_ID"
    );

    console.log("\n=== Setup Complete ===");
    console.log(
      "Add these environment variables to Vercel (Settings → Environment Variables):\n"
    );
    console.log("# Monthly prices");
    console.log(`STRIPE_PLUS_PRICE_ID=${plus.monthlyPrice.id}`);
    console.log(`STRIPE_PRO_PRICE_ID=${pro.monthlyPrice.id}`);
    console.log(`STRIPE_MAX_PRICE_ID=${max.monthlyPrice.id}`);
    console.log("\n# Annual prices (20% discount)");
    console.log(`STRIPE_PLUS_ANNUAL_PRICE_ID=${plus.annualPrice.id}`);
    console.log(`STRIPE_PRO_ANNUAL_PRICE_ID=${pro.annualPrice.id}`);
    console.log(`STRIPE_MAX_ANNUAL_PRICE_ID=${max.annualPrice.id}`);
    console.log("\nAlso make sure these are set:");
    console.log("  STRIPE_SECRET_KEY=sk_live_...");
    console.log("  STRIPE_WEBHOOK_SECRET=whsec_...");
    console.log(
      "  (Configure webhook at https://dashboard.stripe.com/webhooks)"
    );
    console.log("  Webhook URL: https://www.bedda.tech/api/webhooks/stripe");
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
