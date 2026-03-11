"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "./toast";

export function SharedChatBanner({ chatId }: { chatId: string }) {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    const url = `${window.location.origin}/chat/${chatId}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    toast({ type: "success", description: "Link copied to clipboard!" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex w-full items-center justify-between border-b bg-muted/50 px-4 py-2 text-sm">
      <span className="text-muted-foreground">
        Shared conversation &mdash; powered by{" "}
        <Link
          className="font-medium text-foreground underline-offset-2 hover:underline"
          href="/"
        >
          Bedda AI
        </Link>
      </span>
      <div className="flex items-center gap-2">
        <Button
          className="h-7 text-xs"
          onClick={copyLink}
          size="sm"
          variant="outline"
        >
          {copied ? "Copied!" : "Copy link"}
        </Button>
        <Button asChild className="h-7 text-xs" size="sm">
          <Link href="/register">Try Bedda AI free</Link>
        </Button>
      </div>
    </div>
  );
}
