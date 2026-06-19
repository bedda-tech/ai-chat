import type Stripe from "stripe";
import { type DbTier, mapStripePriceToTier, stripe } from "./config";

/**
 * Create a Stripe Checkout session for subscription
 */
export async function createCheckoutSession({
  userId,
  userEmail,
  priceId,
  successUrl,
  cancelUrl,
  trialDays,
}: {
  userId: string;
  userEmail: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  trialDays?: number;
}): Promise<Stripe.Checkout.Session> {
  // Find or create customer
  const customers = await stripe.customers.list({
    email: userEmail,
    limit: 1,
  });

  let customerId: string;

  if (customers.data.length > 0) {
    customerId = customers.data[0].id;
  } else {
    const customer = await stripe.customers.create({
      email: userEmail,
      metadata: {
        userId,
      },
    });
    customerId = customer.id;
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    allow_promotion_codes: true,
    // Don't require a card upfront when the session includes a free trial —
    // this matches the "no credit card required" copy on the pricing page.
    // If no card is added by trial end, Stripe will cancel the subscription
    // and our customer.subscription.deleted webhook downgrades the user to free.
    ...(trialDays ? { payment_method_collection: "if_required" } : {}),
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: {
      metadata: {
        userId,
      },
      ...(trialDays
        ? {
            trial_period_days: trialDays,
            trial_settings: {
              end_behavior: {
                missing_payment_method: "cancel",
              },
            },
          }
        : {}),
    },
    metadata: {
      userId,
    },
  });

  return session;
}

/**
 * Create a Stripe Billing Portal session
 */
export async function createBillingPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}): Promise<Stripe.BillingPortal.Session> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

/**
 * Get customer's active subscription
 */
export async function getCustomerSubscription(
  customerId: string
): Promise<Stripe.Subscription | null> {
  // Include trialing subscriptions so trial users are recognized
  const [active, trialing] = await Promise.all([
    stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    }),
    stripe.subscriptions.list({
      customer: customerId,
      status: "trialing",
      limit: 1,
    }),
  ]);

  return active.data[0] || trialing.data[0] || null;
}

/**
 * Get customer by user email
 */
export async function getCustomerByEmail(
  email: string
): Promise<Stripe.Customer | null> {
  const customers = await stripe.customers.list({
    email,
    limit: 1,
  });

  return customers.data[0] || null;
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.cancel(subscriptionId);
}

/**
 * Get subscription tier from Stripe subscription
 */
export async function getSubscriptionTier(
  subscription: Stripe.Subscription
): Promise<DbTier> {
  if (!subscription.items.data[0]) {
    return "free";
  }

  const priceId = subscription.items.data[0].price.id;
  return mapStripePriceToTier(priceId);
}

/**
 * Update subscription to new price
 */
export async function updateSubscription({
  subscriptionId,
  newPriceId,
}: {
  subscriptionId: string;
  newPriceId: string;
}): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  return await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    proration_behavior: "create_prorations",
  });
}
