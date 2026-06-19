"use client";

import { toast } from "sonner";
import { Artifact } from "@/components/create-artifact";
import { CopyIcon, RedoIcon, UndoIcon } from "@/components/icons";

type NotebookCell = {
  type: "markdown" | "code";
  language?: string;
  content: string;
};

type NotebookContent = {
  cells: NotebookCell[];
};

type NotebookProps = {
  content: string;
  status: "streaming" | "idle";
};

function parseNotebook(content: string): NotebookContent | null {
  try {
    return JSON.parse(content) as NotebookContent;
  } catch {
    return null;
  }
}

function MarkdownCell({ content }: { content: string }) {
  return (
    <div className="whitespace-pre-wrap px-4 py-3 font-sans text-sm leading-relaxed">
      {content}
    </div>
  );
}

function CodeCell({
  content,
  language = "python",
}: {
  content: string;
  language?: string;
}) {
  return (
    <div className="relative">
      <div className="absolute top-2 right-2 font-mono text-[10px] text-muted-foreground uppercase tracking-wide">
        {language}
      </div>
      <pre className="overflow-x-auto border-blue-500/40 border-l-2 bg-muted/50 px-4 py-3 font-mono text-xs leading-relaxed">
        <code>{content}</code>
      </pre>
    </div>
  );
}

function NotebookRenderer({ content, status }: NotebookProps) {
  if (status === "streaming") {
    return (
      <div className="flex h-full min-h-48 items-center justify-center text-muted-foreground text-sm">
        Generating notebook...
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex h-full min-h-48 items-center justify-center text-muted-foreground text-sm">
        Empty notebook
      </div>
    );
  }

  const notebook = parseNotebook(content);
  if (!notebook?.cells?.length) {
    return (
      <div className="p-4">
        <pre className="whitespace-pre-wrap font-mono text-muted-foreground text-xs">
          {content}
        </pre>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {notebook.cells.map((cell, i) => (
        <div className="group relative" key={i}>
          <div className="absolute top-2 left-2 font-mono text-[10px] text-muted-foreground/50">
            {cell.type === "code" ? "[ ]" : "MD"}
          </div>
          <div className="pl-8">
            {cell.type === "markdown" ? (
              <MarkdownCell content={cell.content} />
            ) : (
              <CodeCell content={cell.content} language={cell.language} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function exportAsIpynb(content: string): void {
  const notebook = parseNotebook(content);
  if (!notebook) {
    toast.error("Could not parse notebook content");
    return;
  }

  const ipynb = {
    nbformat: 4,
    nbformat_minor: 5,
    metadata: {
      kernelspec: {
        display_name: "Python 3",
        language: "python",
        name: "python3",
      },
      language_info: { name: "python", version: "3.10.0" },
    },
    cells: notebook.cells.map((cell) => {
      if (cell.type === "markdown") {
        return {
          cell_type: "markdown",
          metadata: {},
          source: cell.content
            .split("\n")
            .map((line, i, arr) => (i < arr.length - 1 ? `${line}\n` : line)),
        };
      }
      return {
        cell_type: "code",
        execution_count: null,
        metadata: {},
        outputs: [],
        source: cell.content
          .split("\n")
          .map((line, i, arr) => (i < arr.length - 1 ? `${line}\n` : line)),
      };
    }),
  };

  const blob = new Blob([JSON.stringify(ipynb, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "notebook.ipynb";
  a.click();
  URL.revokeObjectURL(url);
  toast.success("Notebook exported as .ipynb");
}

export const notebookArtifact = new Artifact<"notebook">({
  kind: "notebook",
  description:
    "Useful for Jupyter-style notebooks with code and markdown cells. Creates structured notebooks with Python (or other language) code cells and explanatory markdown.",
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === "data-notebookDelta") {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: streamPart.data,
        isVisible:
          draftArtifact.status === "streaming" &&
          draftArtifact.content.length > 30 &&
          draftArtifact.content.length < 80
            ? true
            : draftArtifact.isVisible,
        status: "streaming",
      }));
    }
  },
  content: ({ content, status }) => (
    <NotebookRenderer content={content} status={status} />
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
      description: "Copy notebook JSON",
      onClick: ({ content }) => {
        navigator.clipboard.writeText(content);
        toast.success("Copied notebook JSON!");
      },
    },
    {
      icon: (
        <svg
          fill="none"
          height="18"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="18"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" x2="12" y1="15" y2="3" />
        </svg>
      ),
      description: "Export as .ipynb",
      onClick: ({ content }) => exportAsIpynb(content),
    },
  ],
  toolbar: [],
});
