"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Artifact } from "@/components/create-artifact";
import { CopyIcon, RedoIcon, UndoIcon } from "@/components/icons";

type MermaidContent = {
  content: string;
  status: "streaming" | "idle";
};

function MermaidRenderer({ content, status }: MermaidContent) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const idRef = useRef(`mermaid-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    if (!content || status === "streaming") {
      return;
    }

    let cancelled = false;

    async function render() {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "neutral",
          securityLevel: "loose",
          fontFamily: "inherit",
        });

        const { svg: rendered } = await mermaid.render(idRef.current, content);
        if (!cancelled) {
          setSvg(rendered);
          setError(null);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to render diagram"
          );
          setSvg(null);
        }
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [content, status]);

  if (status === "streaming") {
    return (
      <div className="flex h-full min-h-48 items-center justify-center text-muted-foreground text-sm">
        Generating diagram...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="mb-2 font-medium text-destructive text-sm">
          Diagram error
        </p>
        <pre className="whitespace-pre-wrap rounded bg-muted p-3 font-mono text-muted-foreground text-xs">
          {error}
        </pre>
        <pre className="mt-4 whitespace-pre-wrap rounded bg-muted p-3 font-mono text-xs">
          {content}
        </pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="flex h-full min-h-48 items-center justify-center text-muted-foreground text-sm">
        Loading...
      </div>
    );
  }

  return (
    <div
      className="flex min-h-48 items-center justify-center overflow-auto p-8"
      dangerouslySetInnerHTML={{ __html: svg }}
      ref={containerRef}
    />
  );
}

export const mermaidArtifact = new Artifact<"mermaid">({
  kind: "mermaid",
  description:
    "Useful for diagrams: flowcharts, sequence diagrams, entity-relationship diagrams, class diagrams, state machines, and more.",
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === "data-mermaidDelta") {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: streamPart.data,
        isVisible:
          draftArtifact.status === "streaming" &&
          draftArtifact.content.length > 50 &&
          draftArtifact.content.length < 100
            ? true
            : draftArtifact.isVisible,
        status: "streaming",
      }));
    }
  },
  content: ({ content, status }) => (
    <MermaidRenderer content={content} status={status} />
  ),
  actions: [
    {
      icon: <UndoIcon size={18} />,
      description: "View Previous version",
      onClick: ({ handleVersionChange }) => {
        handleVersionChange("prev");
      },
      isDisabled: ({ currentVersionIndex }) => currentVersionIndex === 0,
    },
    {
      icon: <RedoIcon size={18} />,
      description: "View Next version",
      onClick: ({ handleVersionChange }) => {
        handleVersionChange("next");
      },
      isDisabled: ({ isCurrentVersion }) => isCurrentVersion,
    },
    {
      icon: <CopyIcon size={18} />,
      description: "Copy diagram source",
      onClick: ({ content }) => {
        navigator.clipboard.writeText(content);
        toast.success("Copied diagram source!");
      },
    },
  ],
  toolbar: [],
});
