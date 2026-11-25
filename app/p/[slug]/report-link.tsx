"use client";

import { useState } from "react";

export function ReportLink({ slug }: { slug: string }) {
  const [state, setState] = useState<"idle" | "sent">("idle");
  if (state === "sent") {
    return <span className="text-muted-foreground">Thanks, reported.</span>;
  }
  return (
    <button
      className="text-muted-foreground underline"
      onClick={async () => {
        const reason = window.prompt("What's wrong with this page?") ?? "";
        await fetch("/api/publish/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, reason }),
        });
        setState("sent");
      }}
      type="button"
    >
      Report
    </button>
  );
}
