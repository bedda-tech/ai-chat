"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";

const PUBLISHABLE = ["html", "mermaid", "text", "code"];

type Published = { slug: string; url: string } | null;

export function ArtifactPublishButton({
  documentId,
  kind,
  disabled,
}: {
  documentId: string;
  kind: string;
  disabled: boolean;
}) {
  const [published, setPublished] = useState<Published>(null);
  const [busy, setBusy] = useState(false);
  const supported = PUBLISHABLE.includes(kind) && documentId !== "init";

  useEffect(() => {
    if (!supported) {
      return;
    }
    let cancelled = false;
    fetch(`/api/publish?documentId=${documentId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled) {
          setPublished(d?.published ?? null);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [documentId, supported]);

  if (!supported) {
    return null;
  }

  const publish = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to publish");
        return;
      }
      setPublished(data.published);
      const full = `${window.location.origin}${data.published.url}`;
      await navigator.clipboard?.writeText(full).catch(() => {});
      toast.success("Published. Link copied.");
    } finally {
      setBusy(false);
    }
  };

  const unpublish = async () => {
    if (!published) {
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/publish?slug=${published.slug}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setPublished(null);
        toast.success("Unpublished");
      } else {
        toast.error("Failed to unpublish");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-row items-center gap-1">
      {published && (
        <a
          className="px-1 text-muted-foreground text-xs underline"
          href={published.url}
          rel="noreferrer"
          target="_blank"
        >
          Live page
        </a>
      )}
      <Button
        className="h-fit px-2 py-1.5"
        data-testid="artifact-publish"
        disabled={busy || disabled}
        onClick={published ? unpublish : publish}
        variant="outline"
      >
        {published ? "Unpublish" : "Publish"}
      </Button>
      {published && (
        <Button
          className="h-fit px-2 py-1.5"
          disabled={busy || disabled}
          onClick={publish}
          variant="outline"
        >
          Update
        </Button>
      )}
    </div>
  );
}
