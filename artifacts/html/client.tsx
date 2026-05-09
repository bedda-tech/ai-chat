"use client";

import { useRef } from "react";
import { toast } from "sonner";
import { Artifact } from "@/components/create-artifact";
import { CopyIcon, RedoIcon, UndoIcon } from "@/components/icons";

type HtmlContent = {
  content: string;
  status: "streaming" | "idle";
};

function HtmlRenderer({ content, status }: HtmlContent) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  if (status === "streaming") {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px] text-muted-foreground text-sm">
        Generating HTML...
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px] text-muted-foreground text-sm">
        No content yet
      </div>
    );
  }

  return (
    <iframe
      ref={iframeRef}
      srcDoc={content}
      sandbox="allow-scripts allow-same-origin allow-forms"
      className="w-full border-0"
      style={{ minHeight: "500px", height: "100%" }}
      title="HTML Preview"
    />
  );
}

export const htmlArtifact = new Artifact<"html">({
  kind: "html",
  description:
    "Useful for interactive web pages, UI components, data visualizations, games, and creative demos using HTML, CSS, and JavaScript.",
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === "data-htmlDelta") {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: streamPart.data,
        isVisible:
          draftArtifact.status === "streaming" &&
          draftArtifact.content.length > 100 &&
          draftArtifact.content.length < 200
            ? true
            : draftArtifact.isVisible,
        status: "streaming",
      }));
    }
  },
  content: ({ content, status }) => (
    <HtmlRenderer content={content} status={status} />
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
      description: "Copy HTML source",
      onClick: ({ content }) => {
        navigator.clipboard.writeText(content);
        toast.success("Copied HTML source!");
      },
    },
  ],
  toolbar: [],
});
