"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAnalytics } from "@/hooks/use-analytics";

type PlanName = "plus" | "pro" | "max";
type BillingPeriod = "monthly" | "annual";

const PLAN_LABELS: Record<PlanName, Record<BillingPeriod, string>> = {
  plus: { monthly: "Plus ($12/mo)", annual: "Plus Annual ($9.60/mo)" },
  pro: { monthly: "Pro ($25/mo)", annual: "Pro Annual ($20/mo)" },
  max: { monthly: "Max ($50/mo)", annual: "Max Annual ($40/mo)" },
};

export function UpgradeInitiator({
  plan,
  billingPeriod = "monthly",
}: {
  plan: PlanName;
  billingPeriod?: BillingPeriod;
}) {
  const [error, setError] = useState<string | null>(null);
  const { track } = useAnalytics();

  useEffect(() => {
    async function startCheckout() {
      track("checkout_started", { plan, billingPeriod });
      try {
        const res = await fetch("/api/subscription/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan, billingPeriod }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to start checkout");
          return;
        }

        if (data.url) {
          window.location.href = data.url;
        }
      } catch {
        setError("Something went wrong. Please try again.");
      }
    }

    startCheckout();
  }, [plan, billingPeriod, track]);

  if (error) {
    return (
      <div className="text-center space-y-4 max-w-sm">
        <p className="text-sm text-destructive">{error}</p>
        <div className="flex flex-col gap-2">
          <Button asChild>
            <Link href="/settings">Go to Settings</Link>
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
      <p className="text-muted-foreground text-sm">
        Setting up {PLAN_LABELS[plan][billingPeriod]} checkout&hellip;
      </p>
    </div>
  );
}
