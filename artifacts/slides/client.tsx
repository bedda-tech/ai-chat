"use client";

import { toast } from "sonner";
import { Artifact } from "@/components/create-artifact";
import { CopyIcon, RedoIcon, UndoIcon } from "@/components/icons";

type SlidesContent = {
  content: string;
  status: "streaming" | "idle";
};

function buildRevealHTML(markdown: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5/dist/reveal.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5/dist/theme/black.css">
  <style>body{margin:0;}.reveal{font-size:32px;}</style>
</head>
<body>
  <div class="reveal">
    <div class="slides">
      <section data-markdown>
        <textarea data-template>
${markdown}
        </textarea>
      </section>
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@5/dist/reveal.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@5/plugin/markdown/markdown.js"></script>
  <script>
    Reveal.initialize({
      plugins:[RevealMarkdown],
      hash:false,
      controls:true,
      progress:true,
      center:true,
      transition:'slide',
    });
  </script>
</body>
</html>`;
}

function SlidesRenderer({ content, status }: SlidesContent) {
  if (status === "streaming") {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px] text-muted-foreground text-sm">
        Generating slides...
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
      srcDoc={buildRevealHTML(content)}
      sandbox="allow-scripts allow-same-origin"
      className="w-full border-0"
      style={{ minHeight: "500px", height: "100%" }}
      title="Slide Presentation"
    />
  );
}

export const slidesArtifact = new Artifact<"slides">({
  kind: "slides",
  description:
    "Useful for slide presentations and decks. Creates multi-slide presentations with navigation arrows using Reveal.js.",
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === "data-slidesDelta") {
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
    <SlidesRenderer content={content} status={status} />
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
      description: "Copy slide markdown",
      onClick: ({ content }) => {
        navigator.clipboard.writeText(content);
        toast.success("Copied slide content!");
      },
    },
  ],
  toolbar: [],
});
