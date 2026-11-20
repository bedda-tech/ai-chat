"use client";

import { Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type DbTier = "free" | "pro" | "premium" | "enterprise";

// DB tier → display info mapping
// DB "pro" = Plus plan, DB "premium" = Pro plan, DB "enterprise" = Max plan
const PLAN_INFO: Record<
  DbTier,
  {
    displayName: string;
    price: string;
    nextPlan?: { name: string; planKey: string; price: string };
  }
> = {
  free: {
    displayName: "Free",
    price: "$0/mo",
    nextPlan: { name: "Plus", planKey: "plus", price: "$12/mo" },
  },
  pro: {
    displayName: "Plus",
    price: "$12/mo",
    nextPlan: { name: "Pro", planKey: "pro", price: "$25/mo" },
  },
  premium: {
    displayName: "Pro",
    price: "$25/mo",
    nextPlan: { name: "Max", planKey: "max", price: "$50/mo" },
  },
  enterprise: {
    displayName: "Max",
    price: "$50/mo",
  },
};

type SubscriptionManagementProps = {
  currentTier: DbTier;
  isTrial?: boolean;
  trialDaysLeft?: number | null;
  trialEndDate?: string | null;
};

export function SubscriptionManagement({
  currentTier,
  isTrial = false,
  trialDaysLeft = null,
  trialEndDate = null,
}: SubscriptionManagementProps) {
  const planInfo = PLAN_INFO[currentTier];
  const isPaid = currentTier !== "free";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
        <CardDescription>
          Current plan:{" "}
          <strong>
            {planInfo.displayName} ({planInfo.price}){isTrial ? " — Trial" : ""}
          </strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isTrial && (
          <div
            className={`flex items-start gap-2 rounded-md p-3 text-sm ${
              trialDaysLeft !== null && trialDaysLeft <= 1
                ? "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                : trialDaysLeft !== null && trialDaysLeft <= 3
                  ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                  : "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
            }`}
          >
            <Clock className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium">
                {trialDaysLeft !== null && trialDaysLeft <= 0
                  ? "Your trial ends today"
                  : trialDaysLeft === 1
                    ? "1 day left in your trial"
                    : trialDaysLeft !== null
                      ? `${trialDaysLeft} days left in your trial`
                      : "Free trial active"}
              </p>
              {trialEndDate && (
                <p className="text-xs opacity-80">Trial ends {trialEndDate}</p>
              )}
            </div>
          </div>
        )}

        {currentTier === "enterprise" && (
          <p className="text-muted-foreground text-sm">
            You&apos;re on the Max plan — the highest tier available.
          </p>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start space-y-1">
        <p className="text-muted-foreground text-xs">
          All plans include automatic billing. Cancel anytime.
        </p>
        {isPaid && (
          <p className="text-muted-foreground text-xs">
            Upgrades and downgrades are prorated.
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
