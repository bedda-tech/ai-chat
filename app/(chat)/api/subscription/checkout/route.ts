import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { createCheckoutSession } from "@/lib/stripe";
import { mapPlanToStripePrice, type BillingPeriod, type PlanName } from "@/lib/stripe/config";

const VALID_PLANS: PlanName[] = ["plus", "pro", "max"];
const VALID_PERIODS: BillingPeriod[] = ["monthly", "annual"];

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { plan, billingPeriod } = body as { plan?: string; billingPeriod?: string };

    if (!plan || !VALID_PLANS.includes(plan as PlanName)) {
      return NextResponse.json(
        { error: "Invalid plan. Must be one of: plus, pro, max" },
        { status: 400 }
      );
    }

    const period: BillingPeriod =
      billingPeriod && VALID_PERIODS.includes(billingPeriod as BillingPeriod)
        ? (billingPeriod as BillingPeriod)
        : "monthly";

    const priceId = mapPlanToStripePrice(plan as PlanName, period);

    if (!priceId) {
      return NextResponse.json(
        { error: `Price ID not configured for plan: ${plan}. Set STRIPE_${plan.toUpperCase()}_PRICE_ID.` },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const checkoutSession = await createCheckoutSession({
      userId: session.user.id,
      userEmail: session.user.email,
      priceId,
      successUrl: `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/subscription/canceled`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
