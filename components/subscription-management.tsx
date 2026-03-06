"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

type DbTier = "free" | "pro" | "premium" | "enterprise";

// DB tier → display info mapping
// DB "pro" = Plus plan, DB "premium" = Pro plan, DB "enterprise" = Max plan
const PLAN_INFO: Record<DbTier, { displayName: string; price: string; nextPlan?: { name: string; planKey: string; price: string } }> = {
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
};

export function SubscriptionManagement({
  currentTier,
}: SubscriptionManagementProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const planInfo = PLAN_INFO[currentTier];

  const handleUpgrade = async (planKey: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan: planKey }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create checkout session");
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/subscription/portal", {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create portal session");
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const isPaid = currentTier !== "free";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
        <CardDescription>
          Current plan:{" "}
          <strong>
            {planInfo.displayName} ({planInfo.price})
          </strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
            {error}
          </div>
        )}

        {currentTier === "free" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Upgrade to unlock all 30+ AI models, more messages, and advanced
              features.
            </p>
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => handleUpgrade("plus")}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</>
                ) : (
                  "Upgrade to Plus — $12/mo"
                )}
              </Button>
              <Button
                onClick={() => handleUpgrade("pro")}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</>
                ) : (
                  "Upgrade to Pro — $25/mo"
                )}
              </Button>
              <Button
                onClick={() => handleUpgrade("max")}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</>
                ) : (
                  "Upgrade to Max — $50/mo"
                )}
              </Button>
            </div>
          </div>
        )}

        {planInfo.nextPlan && currentTier !== "free" && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Upgrade to {planInfo.nextPlan.name} for more messages and features.
            </p>
            <Button
              onClick={() => handleUpgrade(planInfo.nextPlan!.planKey)}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</>
              ) : (
                `Upgrade to ${planInfo.nextPlan.name} — ${planInfo.nextPlan.price}`
              )}
            </Button>
          </div>
        )}

        {currentTier === "enterprise" && (
          <p className="text-sm text-muted-foreground">
            You&apos;re on the Max plan — the highest tier available.
          </p>
        )}

        {isPaid && (
          <Button
            onClick={handleManageBilling}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading...</>
            ) : (
              "Manage Billing"
            )}
          </Button>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start space-y-1">
        <p className="text-xs text-muted-foreground">
          All plans include automatic billing. Cancel anytime.
        </p>
        {isPaid && (
          <p className="text-xs text-muted-foreground">
            Upgrades and downgrades are prorated.
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
