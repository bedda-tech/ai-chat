import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { stripe } from "@/lib/stripe";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import postgres from "postgres";
import { userTier } from "@/lib/db/schema";
import { getSubscriptionTier } from "@/lib/stripe";

const connectionString = process.env.POSTGRES_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

export default async function SubscriptionSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Process checkout session if provided
  if (searchParams.session_id) {
    try {
      const checkoutSession = await stripe.checkout.sessions.retrieve(
        searchParams.session_id
      );

      if (checkoutSession.subscription) {
        const subscription = await stripe.subscriptions.retrieve(
          checkoutSession.subscription as string
        );

        const tier = await getSubscriptionTier(subscription);
        const userId = session.user.id;

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
              currentPeriodStart: new Date(
                subscription.current_period_start * 1000
              ),
              currentPeriodEnd: new Date(
                subscription.current_period_end * 1000
              ),
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
            currentPeriodStart: new Date(
              subscription.current_period_start * 1000
            ),
            currentPeriodEnd: new Date(
              subscription.current_period_end * 1000
            ),
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

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Subscription Successful!</CardTitle>
          <CardDescription>
            Your subscription has been activated
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm">
            Thank you for subscribing! Your account has been upgraded and you
            now have access to all the features of your plan.
          </p>
          <p className="text-muted-foreground text-sm">
            You can view your usage and manage your subscription in your
            settings.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 sm:flex-row">
          <Button asChild className="w-full">
            <Link href="/">Start Chatting</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/settings">View Settings</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
