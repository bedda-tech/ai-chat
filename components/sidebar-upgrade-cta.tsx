"use client";

import { LogIn, Zap, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { guestRegex } from "@/lib/constants";
import { fetcher } from "@/lib/utils";
import { useAnalytics } from "@/hooks/use-analytics";

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
          <Button asChild size="sm" className="h-7 w-full text-xs">
            <Link href="/register">Sign up free</Link>
          </Button>
          <Button asChild size="sm" variant="ghost" className="h-7 w-full text-xs">
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
      <div className="mx-2 mb-2 rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-900/50 dark:bg-orange-950/30 p-3">
        <div className="mb-2 flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
          <span className="font-semibold text-xs text-orange-700 dark:text-orange-400">Almost at your limit</span>
        </div>
        {dailyPct >= 80 && (
          <div className="mb-2 space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Today</span>
              <span>{daily}/{dailyLimit} messages</span>
            </div>
            <Progress value={dailyPct} className="h-1.5" />
          </div>
        )}
        {monthlyPct >= 80 && (
          <div className="mb-2 space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>This month</span>
              <span>{monthly}/{monthlyLimit} messages</span>
            </div>
            <Progress value={monthlyPct} className="h-1.5" />
          </div>
        )}
        <Button asChild size="sm" className="h-7 w-full text-xs bg-orange-500 hover:bg-orange-600">
          <Link
            href="/upgrade?plan=plus"
            onClick={() =>
              track("upgrade_cta_clicked", { source: "sidebar_urgent", plan: "plus" })
            }
          >
            Upgrade now — $12/mo
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
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{dailyPct >= 50 ? "Today" : "This month"}</span>
            <span>
              {dailyPct >= 50
                ? `${daily}/${dailyLimit} messages`
                : `${monthly}/${monthlyLimit} messages`}
            </span>
          </div>
          <Progress value={Math.max(dailyPct, monthlyPct)} className="h-1.5" />
        </div>
        <p className="mb-2 text-muted-foreground text-xs leading-relaxed">
          Unlock unlimited messages and all 30+ AI models.
        </p>
        <Button asChild size="sm" className="h-7 w-full text-xs">
          <Link
            href="/upgrade?plan=plus"
            onClick={() =>
              track("upgrade_cta_clicked", { source: "sidebar_warning", plan: "plus" })
            }
          >
            Upgrade — $12/mo
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-2 mb-2 rounded-lg border border-border bg-muted/50 p-3">
      <div className="mb-2 flex items-center gap-1.5">
        <Zap className="h-3.5 w-3.5 text-yellow-500" />
        <span className="font-semibold text-xs">Upgrade to Plus</span>
      </div>
      <p className="mb-3 text-muted-foreground text-xs leading-relaxed">
        Unlock all 30+ AI models including Claude Opus, GPT-5, and Gemini Pro.
      </p>
      <Button asChild size="sm" className="h-7 w-full text-xs">
        <Link
          href="/upgrade?plan=plus"
          onClick={() =>
            track("upgrade_cta_clicked", { source: "sidebar_default", plan: "plus" })
          }
        >
          Upgrade — $12/mo
        </Link>
      </Button>
    </div>
  );
}
