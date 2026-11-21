"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { Button } from "@/components/ui/button";
import { useAnalytics } from "@/hooks/use-analytics";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

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
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [challengeFailed, setChallengeFailed] = useState(false);
  const startedRef = useRef(false);
  const { track } = useAnalytics();

  useEffect(() => {
    // Create the session once, and only after the bot challenge (when enabled) has passed.
    if (startedRef.current) {
      return;
    }
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      return;
    }
    startedRef.current = true;

    async function startCheckout() {
      track("checkout_started", { plan, billingPeriod });
      try {
        const res = await fetch("/api/subscription/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plan,
            billingPeriod,
            turnstileToken: turnstileToken ?? undefined,
          }),
        });

        if (res.status === 403) {
          const body = await res.json().catch(() => ({}));
          if (
            body.code === "email_verification_required" ||
            body.code === "bot_check_failed"
          ) {
            setError(body.error);
            return;
          }
          // Guest sessions cannot check out; send them to create an account.
          window.location.href = "/register";
          return;
        }

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
  }, [plan, billingPeriod, track, turnstileToken]);

  if (error) {
    return (
      <div className="max-w-sm space-y-4 text-center">
        <p className="text-destructive text-sm">{error}</p>
        <div className="flex flex-col gap-2">
          <Button asChild>
            <Link href="/settings">Go to Settings</Link>
          </Button>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (challengeFailed) {
    return (
      <div className="max-w-sm space-y-4 text-center">
        <p className="text-destructive text-sm">
          The security check could not load. Disable content blockers for
          bedda.ai and try again.
        </p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-center">
      {TURNSTILE_SITE_KEY && !turnstileToken ? (
        <div className="flex justify-center">
          <TurnstileWidget
            onError={() => setChallengeFailed(true)}
            onToken={setTurnstileToken}
            siteKey={TURNSTILE_SITE_KEY}
          />
        </div>
      ) : (
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
      )}
      <p className="text-muted-foreground text-sm">
        Setting up {PLAN_LABELS[plan][billingPeriod]} checkout&hellip;
      </p>
    </div>
  );
}
