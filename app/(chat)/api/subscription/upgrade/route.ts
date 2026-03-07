import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { stripe, updateSubscription, getSubscriptionTier } from "@/lib/stripe";
import { mapPlanToStripePrice, type PlanName, type BillingPeriod } from "@/lib/stripe/config";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import postgres from "postgres";
import { userTier } from "@/lib/db/schema";

const connectionString = process.env.POSTGRES_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

const VALID_PLANS: PlanName[] = ["plus", "pro", "max"];

/**
 * POST /api/subscription/upgrade
 *
 * Upgrades or downgrades an existing subscriber's plan in-place via Stripe's
 * subscription update API (with proration). This avoids creating a second
 * Stripe subscription for users who are already subscribed.
 *
 * Free users should use /api/subscription/checkout instead.
 */
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { plan } = body as { plan?: string };

    if (!plan || !VALID_PLANS.includes(plan as PlanName)) {
      return NextResponse.json(
        { error: "Invalid plan. Must be one of: plus, pro, max" },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // Look up existing subscription
    const existing = await db
      .select()
      .from(userTier)
      .where(eq(userTier.userId, userId))
      .limit(1);

    if (!existing.length || !existing[0].subscriptionId) {
      return NextResponse.json(
        { error: "No active subscription found. Please use the checkout flow." },
        { status: 400 }
      );
    }

    const subscriptionId = existing[0].subscriptionId;

    // Detect the current billing period (monthly vs annual) from Stripe
    const currentSubscription = await stripe.subscriptions.retrieve(subscriptionId);
    const currentPriceId = currentSubscription.items.data[0]?.price.id;

    let billingPeriod: BillingPeriod = "monthly";
    if (currentPriceId) {
      const price = await stripe.prices.retrieve(currentPriceId);
      if (price.recurring?.interval === "year") {
        billingPeriod = "annual";
      }
    }

    // Map new plan + same billing period to a Stripe price ID
    const newPriceId = mapPlanToStripePrice(plan as PlanName, billingPeriod);

    if (!newPriceId) {
      return NextResponse.json(
        { error: `Price not configured for plan: ${plan} (${billingPeriod})` },
        { status: 500 }
      );
    }

    // Update the subscription in Stripe (with proration)
    const updatedSubscription = await updateSubscription({
      subscriptionId,
      newPriceId,
    });

    // Map the new Stripe price to our DB tier and persist
    const newTier = await getSubscriptionTier(updatedSubscription);

    await db
      .update(userTier)
      .set({ tier: newTier, updatedAt: new Date() })
      .where(eq(userTier.userId, userId));

    return NextResponse.json({ success: true, tier: newTier });
  } catch (error) {
    console.error("Error upgrading subscription:", error);
    return NextResponse.json(
      { error: "Failed to upgrade subscription" },
      { status: 500 }
    );
  }
}
