"use client";

import { useState } from "react";
import useSWR from "swr";
import { toast } from "@/components/toast";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function ReferralCard() {
  const { data, isLoading } = useSWR<{
    referralCode: string | null;
    referralCount: number;
    referralUrl: string | null;
  }>("/api/referral", fetcher);

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!data?.referralUrl) {
      return;
    }
    await navigator.clipboard.writeText(data.referralUrl);
    setCopied(true);
    toast({ type: "success", description: "Referral link copied!" });
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <p className="text-muted-foreground text-sm">Loading referral info…</p>
    );
  }

  if (!data?.referralCode) {
    return (
      <p className="text-muted-foreground text-sm">
        Sign in to get your referral link.
      </p>
    );
  }

  const count = data.referralCount;

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        Share your link with friends. Anyone who signs up gets a{" "}
        <strong>14-day free trial</strong> of Plus (double the standard 7 days).
        Every referral helps us grow — we&apos;ll reach out with a thank-you
        bonus for active referrers.
      </p>

      <div className="flex items-center gap-2">
        <input
          className="flex-1 rounded-md border bg-muted px-3 py-2 font-mono text-sm"
          readOnly
          value={data.referralUrl ?? ""}
        />
        <button
          className="shrink-0 rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50"
          onClick={handleCopy}
          type="button"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      <p className="text-sm">
        <span className="font-semibold">{count}</span>{" "}
        {count === 1 ? "person has" : "people have"} signed up using your link.
      </p>
    </div>
  );
}
