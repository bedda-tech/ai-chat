"use client";

import { AlertCircle } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Settings page error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8">
      <div className="mb-8">
        <h1 className="font-bold text-3xl tracking-tight">Settings</h1>
      </div>
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-destructive/30 bg-destructive/5 p-12 text-center">
        <AlertCircle className="size-10 text-destructive" />
        <div>
          <h2 className="font-semibold text-lg">Something went wrong</h2>
          <p className="mt-1 text-muted-foreground text-sm">
            The settings page failed to load. Please try again.
          </p>
          {error.digest && (
            <p className="mt-2 font-mono text-muted-foreground text-xs">
              Error code: {error.digest}
            </p>
          )}
        </div>
        <Button onClick={reset} size="sm" variant="outline">
          Try again
        </Button>
      </div>
    </div>
  );
}
