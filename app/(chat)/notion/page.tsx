"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface NotionStatus {
  connected: boolean;
  workspaceName?: string;
  connectedAt?: string;
}

export default function NotionPage() {
  const [status, setStatus] = useState<NotionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    fetch("/api/notion")
      .then((r) => r.json())
      .then((data) => setStatus(data))
      .catch(() => setStatus({ connected: false }))
      .finally(() => setLoading(false));

    const params = new URLSearchParams(window.location.search);
    if (params.get("connected") === "true") {
      toast.success("Notion connected");
      window.history.replaceState({}, "", "/notion");
    } else if (params.get("error")) {
      toast.error(`Connection failed: ${params.get("error")}`);
      window.history.replaceState({}, "", "/notion");
    }
  }, []);

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      const res = await fetch("/api/notion", { method: "DELETE" });
      if (res.ok) {
        setStatus({ connected: false });
        toast.success("Notion disconnected");
      } else {
        toast.error("Failed to disconnect");
      }
    } catch {
      toast.error("Failed to disconnect");
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8">
        <h1 className="font-bold text-2xl tracking-tight">Notion</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Connect your Notion workspace to search and read pages in chat.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Checking connection...
          </div>
        ) : status?.connected ? (
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-500/10">
                <svg
                  className="size-5 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium text-sm">
                  {status.workspaceName
                    ? `${status.workspaceName} connected`
                    : "Notion connected"}
                </p>
                {status.connectedAt && (
                  <p className="text-muted-foreground text-xs">
                    Since{" "}
                    {new Date(status.connectedAt).toLocaleDateString(
                      undefined,
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </p>
                )}
              </div>
            </div>
            <Button
              disabled={disconnecting}
              onClick={handleDisconnect}
              size="sm"
              variant="outline"
            >
              {disconnecting ? "Disconnecting..." : "Disconnect"}
            </Button>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                <svg
                  className="size-5 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium text-sm">Not connected</p>
                <p className="text-muted-foreground text-xs">
                  Connect to search and read your Notion pages in chat
                </p>
              </div>
            </div>
            <Button asChild size="sm">
              <a href="/api/notion/auth">Connect Notion</a>
            </Button>
          </div>
        )}
      </div>

      <div className="mt-6 space-y-3 text-muted-foreground text-sm">
        <p className="font-medium text-foreground">
          What you can do with Notion connected:
        </p>
        <ul className="ml-4 list-disc space-y-1">
          <li>Search across all pages in your workspace</li>
          <li>Read page content as context for AI responses</li>
          <li>Ask the AI to summarize or analyze your notes</li>
          <li>Reference Notion docs while working on projects</li>
        </ul>
        <p className="text-xs">
          Bedda requests read access to the pages you select during setup. You
          control exactly which pages are shared.
        </p>
      </div>
    </div>
  );
}
