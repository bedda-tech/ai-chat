"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type PlanName = "plus" | "pro" | "max";

const PLAN_LABELS: Record<PlanName, string> = {
  plus: "Plus ($12/mo)",
  pro: "Pro ($25/mo)",
  max: "Max ($50/mo)",
};

export function UpgradeInitiator({ plan }: { plan: PlanName }) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function startCheckout() {
      try {
        const res = await fetch("/api/subscription/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan }),
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
  }, [plan]);

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
        Setting up {PLAN_LABELS[plan]} checkout&hellip;
      </p>
    </div>
  );
}
