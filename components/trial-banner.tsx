"use client";

import { Clock, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type TrialStatus = {
  isTrial: boolean;
  trialDaysLeft: number | null;
};

export function TrialBanner() {
  const [status, setStatus] = useState<TrialStatus | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/subscription/status")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.isTrial) {
          setStatus({ isTrial: true, trialDaysLeft: data.trialDaysLeft });
        }
      })
      .catch(() => {});
  }, []);

  if (!status?.isTrial || dismissed) {
    return null;
  }

  const days = status.trialDaysLeft ?? 0;
  const urgency =
    days <= 1
      ? "text-red-700 bg-red-50 border-red-200"
      : days <= 3
        ? "text-amber-700 bg-amber-50 border-amber-200"
        : "text-blue-700 bg-blue-50 border-blue-200";
  const label =
    days === 0
      ? "Trial expires today"
      : days === 1
        ? "1 day left in your trial"
        : `${days} days left in your trial`;

  return (
    <div
      className={`flex items-center justify-between gap-3 border-b px-4 py-2 text-sm ${urgency}`}
    >
      <div className="flex items-center gap-2">
        <Clock className="size-4 shrink-0" />
        <span className="font-medium">{label}</span>
        <span className="hidden opacity-75 sm:inline">
          — add a payment method to keep access.
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button asChild className="h-7 px-3 text-xs" size="sm">
          <Link href="/settings">Add payment method</Link>
        </Button>
        <button
          aria-label="Dismiss"
          className="rounded p-0.5 hover:opacity-70"
          onClick={() => setDismissed(true)}
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
