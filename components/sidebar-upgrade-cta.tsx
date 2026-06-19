"use client";

import { AlertTriangle, LogIn, Zap } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAnalytics } from "@/hooks/use-analytics";
import { guestRegex } from "@/lib/constants";
import { fetcher } from "@/lib/utils";

type StatusResponse = {
  tier: string;
  usage: {
    messageCount: number;
    dailyCount: number;
  };
  limits: {
    messagesPerMonth: number;
    messagesPerDay: number;
  };
  percentUsed: number;
  dailyPercentUsed: number;
};

export function SidebarUpgradeCTA() {
  const { data: session, status: sessionStatus } = useSession();
  const { track } = useAnalytics();

  const isGuest = guestRegex.test(session?.user?.email ?? "");
  const isLoggedIn = sessionStatus === "authenticated" && !isGuest;

  const { data } = useSWR<StatusResponse>(
    isLoggedIn ? "/api/subscription/status" : null,
    fetcher
  );

  // Guest users: show sign-up CTA
  if (sessionStatus === "authenticated" && isGuest) {
    return (
      <div className="mx-2 mb-2 rounded-lg border border-border bg-muted/50 p-3">
        <div className="mb-2 flex items-center gap-1.5">
          <LogIn className="h-3.5 w-3.5 text-blue-500" />
          <span className="font-semibold text-xs">Save your chats</span>
        </div>
        <p className="mb-3 text-muted-foreground text-xs leading-relaxed">
          Create a free account to save chat history and unlock more models.
        </p>
        <div className="flex flex-col gap-1.5">
          <Button asChild className="h-7 w-full text-xs" size="sm">
            <Link href="/register">Sign up free</Link>
          </Button>
          <Button
            asChild
            className="h-7 w-full text-xs"
            size="sm"
            variant="ghost"
          >
            <Link href="/pricing">See pricing</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !data || data.tier !== "free") {
    return null;
  }

  const dailyPct = data.dailyPercentUsed ?? 0;
  const monthlyPct = data.percentUsed ?? 0;
  const isUrgent = dailyPct >= 80 || monthlyPct >= 80;
  const isWarning = dailyPct >= 50 || monthlyPct >= 50;

  const daily = data.usage.dailyCount ?? 0;
  const dailyLimit = data.limits.messagesPerDay ?? 50;
  const monthly = data.usage.messageCount ?? 0;
  const monthlyLimit = data.limits.messagesPerMonth ?? 500;

  if (isUrgent) {
    return (
      <div className="mx-2 mb-2 rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-900/50 dark:bg-orange-950/30">
        <div className="mb-2 flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
          <span className="font-semibold text-orange-700 text-xs dark:text-orange-400">
            Almost at your limit
          </span>
        </div>
        {dailyPct >= 80 && (
          <div className="mb-2 space-y-1">
            <div className="flex justify-between text-muted-foreground text-xs">
              <span>Today</span>
              <span>
                {daily}/{dailyLimit} messages
              </span>
            </div>
            <Progress className="h-1.5" value={dailyPct} />
          </div>
        )}
        {monthlyPct >= 80 && (
          <div className="mb-2 space-y-1">
            <div className="flex justify-between text-muted-foreground text-xs">
              <span>This month</span>
              <span>
                {monthly}/{monthlyLimit} messages
              </span>
            </div>
            <Progress className="h-1.5" value={monthlyPct} />
          </div>
        )}
        <Button
          asChild
          className="h-7 w-full bg-orange-500 text-xs hover:bg-orange-600"
          size="sm"
        >
          <Link
            href="/upgrade?plan=plus"
            onClick={() =>
              track("upgrade_cta_clicked", {
                source: "sidebar_urgent",
                plan: "plus",
              })
            }
          >
            Start free trial — 7 days free
          </Link>
        </Button>
      </div>
    );
  }

  if (isWarning) {
    return (
      <div className="mx-2 mb-2 rounded-lg border border-border bg-muted/50 p-3">
        <div className="mb-2 flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-yellow-500" />
          <span className="font-semibold text-xs">Upgrade to Plus</span>
        </div>
        <div className="mb-2 space-y-1">
          <div className="flex justify-between text-muted-foreground text-xs">
            <span>{dailyPct >= 50 ? "Today" : "This month"}</span>
            <span>
              {dailyPct >= 50
                ? `${daily}/${dailyLimit} messages`
                : `${monthly}/${monthlyLimit} messages`}
            </span>
          </div>
          <Progress className="h-1.5" value={Math.max(dailyPct, monthlyPct)} />
        </div>
        <p className="mb-2 text-muted-foreground text-xs leading-relaxed">
          Unlock unlimited messages and all 30+ AI models. First 7 days free.
        </p>
        <Button asChild className="h-7 w-full text-xs" size="sm">
          <Link
            href="/upgrade?plan=plus"
            onClick={() =>
              track("upgrade_cta_clicked", {
                source: "sidebar_warning",
                plan: "plus",
              })
            }
          >
            Start free trial
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-2 mb-2 rounded-lg border border-border bg-muted/50 p-3">
      <div className="mb-2 flex items-center gap-1.5">
        <Zap className="h-3.5 w-3.5 text-yellow-500" />
        <span className="font-semibold text-xs">7 days free</span>
      </div>
      <p className="mb-3 text-muted-foreground text-xs leading-relaxed">
        Try Claude Opus, GPT-5, Gemini Pro, and 30+ models free for 7 days. Then just $12/mo.
      </p>
      <Button asChild className="h-7 w-full text-xs" size="sm">
        <Link
          href="/upgrade?plan=plus"
          onClick={() =>
            track("upgrade_cta_clicked", {
              source: "sidebar_default",
              plan: "plus",
            })
          }
        >
          Start free trial
        </Link>
      </Button>
    </div>
  );
}
