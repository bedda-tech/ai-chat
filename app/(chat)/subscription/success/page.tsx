import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import postgres from "postgres";
import { auth } from "@/app/(auth)/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { userTier } from "@/lib/db/schema";
import { getSubscriptionTier, stripe } from "@/lib/stripe";
import { type DbTier, TIER_DISPLAY_NAMES } from "@/lib/stripe/config";

const connectionString = process.env.POSTGRES_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

export default async function SubscriptionSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { session_id } = await searchParams;

  let planName = "your plan";
  let isTrial = false;
  let trialEndDate: Date | null = null;

  // Process checkout session if provided
  if (session_id) {
    try {
      const checkoutSession =
        await stripe.checkout.sessions.retrieve(session_id);

      if (checkoutSession.subscription) {
        const subscription = await stripe.subscriptions.retrieve(
          checkoutSession.subscription as string
        );

        const tier = await getSubscriptionTier(subscription);
        planName = TIER_DISPLAY_NAMES[tier as DbTier] ?? tier;
        isTrial = subscription.status === "trialing";
        if (isTrial && subscription.trial_end) {
          trialEndDate = new Date(subscription.trial_end * 1000);
        }

        const userId = session.user.id;

        // Get period from the first subscription item (Stripe v19+)
        const firstItem = subscription.items.data[0];
        const periodStart = firstItem
          ? new Date(firstItem.current_period_start * 1000)
          : new Date();
        const periodEnd = firstItem
          ? new Date(firstItem.current_period_end * 1000)
          : new Date();

        // Update user tier immediately
        const existing = await db
          .select()
          .from(userTier)
          .where(eq(userTier.userId, userId))
          .limit(1);

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
      }
    } catch (error) {
      console.error("Error processing checkout session:", error);
      // Continue to show success page even if processing fails
      // Webhook will handle it eventually
    }
  }

  const trialEndFormatted = trialEndDate
    ? trialEndDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl">
            {isTrial ? `${planName} trial started!` : `Welcome to ${planName}!`}
          </CardTitle>
          <CardDescription>
            {isTrial
              ? "Your 7-day free trial is active"
              : `Your ${planName} subscription is active`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          {isTrial && trialEndFormatted ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 text-sm">
              Your trial runs until <strong>{trialEndFormatted}</strong>. No
              charge until then — cancel anytime.
            </div>
          ) : null}
          <p className="text-sm">
            Your account is now upgraded. You have access to all 30+ AI models
            and everything included in {planName}.
          </p>
          <p className="text-muted-foreground text-sm">
            Check your email for a confirmation with everything that&apos;s now
            unlocked.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 sm:flex-row">
          <Button asChild className="w-full">
            <Link href="/">Start Chatting</Link>
          </Button>
          <Button asChild className="w-full" variant="outline">
            <Link href="/settings">View Settings</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
