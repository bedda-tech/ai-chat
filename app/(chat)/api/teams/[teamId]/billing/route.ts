import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { stripe } from "@/lib/stripe";
import {
  getTeamById,
  getTeamMemberCount,
  isTeamAdmin,
  updateTeamBilling,
} from "@/lib/db/team-queries";

const SEAT_PRICE_ID = process.env.STRIPE_TEAM_SEAT_PRICE_ID;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { teamId } = await params;

  const [team, memberCount] = await Promise.all([
    getTeamById(teamId),
    getTeamMemberCount(teamId),
  ]);

  if (!team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  const isAdmin = await isTeamAdmin(teamId, session.user.id);
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let billingPortalUrl: string | null = null;
  if (team.stripeCustomerId) {
    try {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: team.stripeCustomerId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://www.bedda.tech"}/settings`,
      });
      billingPortalUrl = portalSession.url;
    } catch {
      // Portal URL is optional — don't fail the request
    }
  }

  return NextResponse.json({
    seatLimit: team.seatLimit,
    memberCount,
    hasSubscription: !!team.stripeSubscriptionId,
    billingPortalUrl,
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!SEAT_PRICE_ID) {
    return NextResponse.json(
      { error: "Team billing not configured" },
      { status: 503 }
    );
  }

  const { teamId } = await params;

  const isAdmin = await isTeamAdmin(teamId, session.user.id);
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [team, memberCount] = await Promise.all([
    getTeamById(teamId),
    getTeamMemberCount(teamId),
  ]);

  if (!team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  let body: { quantity?: number } = {};
  try {
    body = await request.json();
  } catch {
    // quantity is optional — defaults to current member count
  }

  const quantity = body.quantity ?? memberCount;

  // Find or create a Stripe customer for this team
  let customerId = team.stripeCustomerId ?? undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      name: team.name,
      email: session.user.email,
      metadata: { teamId },
    });
    customerId = customer.id;
    await updateTeamBilling(teamId, { stripeCustomerId: customerId });
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://www.bedda.tech";

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: SEAT_PRICE_ID, quantity }],
    success_url: `${baseUrl}/settings?team_billing=success`,
    cancel_url: `${baseUrl}/settings`,
    subscription_data: {
      metadata: { teamId },
    },
    metadata: { teamId },
  });

  return NextResponse.json({ checkoutUrl: checkoutSession.url });
}
