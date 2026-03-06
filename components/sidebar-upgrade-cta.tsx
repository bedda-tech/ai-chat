"use client";

import { Zap } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { guestRegex } from "@/lib/constants";
import { fetcher } from "@/lib/utils";

type StatusResponse = { tier: string };

export function SidebarUpgradeCTA() {
  const { data: session, status: sessionStatus } = useSession();

  const isGuest = guestRegex.test(session?.user?.email ?? "");
  const isLoggedIn = sessionStatus === "authenticated" && !isGuest;

  const { data } = useSWR<StatusResponse>(
    isLoggedIn ? "/api/subscription/status" : null,
    fetcher
  );

  // Only render for free registered users
  if (!isLoggedIn || !data || data.tier !== "free") {
    return null;
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
        <Link href="/upgrade?plan=plus">Upgrade — $12/mo</Link>
      </Button>
    </div>
  );
}
