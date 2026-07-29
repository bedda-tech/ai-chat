import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import postgres from "postgres";
import type Stripe from "stripe";
import { logAuditEvent } from "@/lib/audit";
import { user, userTier } from "@/lib/db/schema";
import { updateTeamBilling } from "@/lib/db/team-queries";
import {
  sendCancellationEmail,
  sendCheckoutAbandonedEmail,
  sendPaymentFailedEmail,
  sendSubscriptionActivatedEmail,
  sendTrialEndingEmail,
  sendTrialExpiredEmail,
} from "@/lib/email/send-subscription-email";
import { getSubscriptionTier, stripe } from "@/lib/stripe";
import { type DbTier, TIER_DISPLAY_NAMES } from "@/lib/stripe/config";

const connectionString = process.env.POSTGRES_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

/**
 * Stripe webhook handler
 * Handles subscription lifecycle events and syncs user tier to database
 */
export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 }
    );
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutExpired(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        if (subscription.metadata.teamId) {
          await handleTeamSubscriptionChange(subscription);
        } else {
          await handleSubscriptionChange(subscription);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      case "customer.subscription.trial_will_end": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleTrialWillEnd(subscription);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Error processing webhook:", err);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

/**
 * Handle team seat subscription creation or update
 */
async function handleTeamSubscriptionChange(
  subscription: Stripe.Subscription
): Promise<void> {
  const teamId = subscription.metadata.teamId;
  if (!teamId) {
    return;
  }

  const firstItem = subscription.items.data[0];
  const seatLimit = firstItem?.quantity ?? 5;

  console.log(
    `Updating team ${teamId} subscription ${subscription.id}, seatLimit: ${seatLimit}`
  );

  await updateTeamBilling(teamId, {
    stripeCustomerId: subscription.customer as string,
    stripeSubscriptionId: subscription.id,
    seatLimit,
  });
}

/**
 * Handle successful checkout session completion
 * This is the first event fired when a customer completes payment
 */
async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  const userId = session.metadata?.userId;

  if (!userId) {
    console.error("No userId in checkout session metadata:", session.id);
    return;
  }

  // Checkout successful - subscription is being created
  // The subscription.created event will handle the actual provisioning
  console.log(`Checkout completed for user ${userId}, session: ${session.id}`);

  // Store customer ID immediately for billing portal access
  if (session.customer) {
    const existing = await db
      .select()
      .from(userTier)
      .where(eq(userTier.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(userTier)
        .set({
          stripeCustomerId: session.customer as string,
          updatedAt: new Date(),
        })
        .where(eq(userTier.userId, userId));
    } else {
      // Create user tier record if it doesn't exist
      await db.insert(userTier).values({
        userId,
        tier: "free", // Will be updated by subscription.created event
        stripeCustomerId: session.customer as string,
      });
    }
  }
}

/**
 * Handle subscription creation or update
 */
async function handleSubscriptionChange(
  subscription: Stripe.Subscription
): Promise<void> {
  const userId = subscription.metadata.userId;

  if (!userId) {
    console.error("No userId in subscription metadata:", subscription.id);
    return;
  }

  // Get the tier from the subscription
  const tier = await getSubscriptionTier(subscription);

  console.log(`Updating user ${userId} to tier: ${tier}`);

  // Get period from the first subscription item (Stripe v19+ moved period to items)
  const firstItem = subscription.items.data[0];
  const periodStart = firstItem
    ? new Date(firstItem.current_period_start * 1000)
    : new Date();
  const periodEnd = firstItem
    ? new Date(firstItem.current_period_end * 1000)
    : new Date();

  // Update or create user tier
  const existing = await db
    .select()
    .from(userTier)
    .where(eq(userTier.userId, userId))
    .limit(1);
  const fromTier = existing[0]?.tier ?? "free";

  if (existing.length > 0) {
    await db
      .update(userTier)
      .set({
        tier,
        subscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        stripeCustomerId: subscription.customer as string,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        updatedAt: new Date(),
      })
      .where(eq(userTier.userId, userId));
  } else {
    await db.insert(userTier).values({
      userId,
      tier,
      subscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      stripeCustomerId: subscription.customer as string,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });
  }

  void logAuditEvent(userId, "subscription.changed", {
    from_tier: fromTier,
    to_tier: tier,
    subscriptionId: subscription.id,
  });

  // Send activation email when a user first subscribes (free → paid)
  if (fromTier === "free" && tier !== "free") {
    const users = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);
    const email = users[0]?.email;
    if (email && !email.startsWith("guest-")) {
      const planName = TIER_DISPLAY_NAMES[tier as DbTier] ?? tier;
      const trialEnd =
        subscription.status === "trialing" && subscription.trial_end
          ? new Date(subscription.trial_end * 1000)
          : undefined;
      void sendSubscriptionActivatedEmail(email, planName, trialEnd).catch(
        (err) =>
          console.error("Failed to send subscription activation email:", err)
      );
    }
  }
}

/**
 * Handle subscription deletion (downgrade to free tier)
 */
async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<void> {
  const userId = subscription.metadata.userId;

  if (!userId) {
    console.error("No userId in subscription metadata:", subscription.id);
    return;
  }

  console.log(`Downgrading user ${userId} to free tier`);

  // Downgrade to free tier
  await db
    .update(userTier)
    .set({
      tier: "free",
      subscriptionId: null,
      subscriptionStatus: null,
      cancelAtPeriodEnd: false,
      updatedAt: new Date(),
    })
    .where(eq(userTier.userId, userId));

  const tier = await getSubscriptionTier(subscription);
  const planName = TIER_DISPLAY_NAMES[tier as DbTier] ?? "Plus";
  const users = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  const email = users[0]?.email;

  if (email && !email.startsWith("guest-")) {
    if (subscription.trial_end) {
      // Trial expired without converting — send trial win-back email
      void sendTrialExpiredEmail(email, planName).catch((err) =>
        console.error("Failed to send trial expired email:", err)
      );
    } else {
      // Regular paying subscriber canceled — send cancellation confirmation
      const firstItem = subscription.items.data[0];
      const periodEnd = firstItem
        ? new Date(firstItem.current_period_end * 1000)
        : new Date();
      void sendCancellationEmail(email, planName, periodEnd).catch((err) =>
        console.error("Failed to send cancellation email:", err)
      );
    }
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
  console.log(`Payment succeeded for invoice: ${invoice.id}`);
  // Can be used to send payment confirmation emails, update payment history, etc.
}

/**
 * Handle trial ending reminder (Stripe fires 3 days before trial_end)
 */
async function handleTrialWillEnd(
  subscription: Stripe.Subscription
): Promise<void> {
  const userId = subscription.metadata.userId;
  if (!userId) {
    return;
  }

  const trialEnd = subscription.trial_end;
  if (!trialEnd) {
    return;
  }

  const trialEndDate = new Date(trialEnd * 1000);
  const msLeft = trialEndDate.getTime() - Date.now();
  const daysLeft = Math.max(1, Math.round(msLeft / (1000 * 60 * 60 * 24)));

  const users = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  const email = users[0]?.email;
  if (!email || email.startsWith("guest-")) {
    return;
  }

  const tier = await getSubscriptionTier(subscription);
  const planName = TIER_DISPLAY_NAMES[tier as DbTier] ?? tier;

  void sendTrialEndingEmail(email, planName, trialEndDate, daysLeft).catch(
    (err) => console.error("Failed to send trial ending email:", err)
  );
}

/**
 * Handle abandoned checkout (session expired without payment)
 * Send a recovery email to bring the user back to complete their upgrade.
 */
async function handleCheckoutExpired(
  session: Stripe.Checkout.Session
): Promise<void> {
  const userId = session.metadata?.userId;
  if (!userId) {
    return;
  }

  const users = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  const email = users[0]?.email;
  if (!email || email.startsWith("guest-")) {
    return;
  }

  void sendCheckoutAbandonedEmail(email).catch((err) =>
    console.error("Failed to send checkout abandoned email:", err)
  );
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  console.error(`Payment failed for invoice: ${invoice.id}`);

  // Look up user via Stripe customer ID stored in userTier
  const customerId = invoice.customer as string | null;
  if (!customerId) {
    return;
  }

  const tierRecords = await db
    .select()
    .from(userTier)
    .where(eq(userTier.stripeCustomerId, customerId))
    .limit(1);
  const userId = tierRecords[0]?.userId;
  const tier = tierRecords[0]?.tier;
  if (!userId || !tier || tier === "free") {
    return;
  }

  const users = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  const email = users[0]?.email;
  if (!email || email.startsWith("guest-")) {
    return;
  }

  const planName = TIER_DISPLAY_NAMES[tier as DbTier] ?? tier;
  const invoiceUrl =
    typeof invoice.hosted_invoice_url === "string"
      ? invoice.hosted_invoice_url
      : undefined;
  void sendPaymentFailedEmail(email, planName, invoiceUrl).catch((err) =>
    console.error("Failed to send payment failure email:", err)
  );
}
