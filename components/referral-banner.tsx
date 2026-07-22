"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { toast } from "@/components/toast";

const DISMISSED_KEY = "referral-banner-dismissed";
const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function ReferralBanner() {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data } = useSWR<{
    referralCode: string | null;
    referralCount: number;
    referralUrl: string | null;
  }>("/api/referral", fetcher);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setVisible(!localStorage.getItem(DISMISSED_KEY));
    }
  }, []);

  if (!visible || !data?.referralUrl) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setVisible(false);
  };

  const copy = async () => {
    if (!data.referralUrl) return;
    await navigator.clipboard.writeText(data.referralUrl);
    setCopied(true);
    toast({ type: "success", description: "Referral link copied!" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto mb-2 flex w-full max-w-4xl items-center gap-3 rounded-lg border border-border bg-muted/60 px-3 py-2 text-sm">
      <span className="min-w-0 flex-1 text-muted-foreground">
        <span className="font-medium text-foreground">Know someone?</span>{" "}
        Refer a friend — they get a{" "}
        <span className="font-medium">14-day free trial</span> (double the
        standard).
      </span>
      <button
        className="shrink-0 rounded-md bg-primary px-3 py-1 font-medium text-primary-foreground text-xs hover:bg-primary/90"
        onClick={copy}
        type="button"
      >
        {copied ? "Copied!" : "Copy link"}
      </button>
      <button
        aria-label="Dismiss referral banner"
        className="shrink-0 text-muted-foreground hover:text-foreground"
        onClick={dismiss}
        type="button"
      >
        <X size={14} />
      </button>
    </div>
  );
}
