"use client";

import { useState, useCallback } from "react";
import { CompareColumn } from "@/components/compare-column";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PlusIcon } from "@/components/icons";
import modelsData from "@/lib/ai/models-data.json";

const ALL_MODELS = modelsData.models.map((m) => ({
  id: m.id,
  name: m.name,
  provider: m.provider,
}));

const DEFAULT_COLUMNS = [
  "anthropic-claude-sonnet-4.5",
  "openai-gpt-5",
];

const MAX_COLUMNS = 4;

interface PendingSubmit {
  text: string;
  version: number;
}

export default function ComparePage() {
  const [columnModels, setColumnModels] = useState<string[]>(DEFAULT_COLUMNS);
  const [input, setInput] = useState("");
  const [pendingSubmit, setPendingSubmit] = useState<PendingSubmit>({
    text: "",
    version: 0,
  });

  const handleSubmit = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    setPendingSubmit((prev) => ({ text, version: prev.version + 1 }));
    setInput("");
  }, [input]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const addColumn = useCallback(() => {
    const usedIds = new Set(columnModels);
    const next = ALL_MODELS.find((m) => !usedIds.has(m.id));
    if (next) {
      setColumnModels((prev) => [...prev, next.id]);
    }
  }, [columnModels]);

  const removeColumn = useCallback((index: number) => {
    setColumnModels((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-2">
        <div>
          <h1 className="text-sm font-semibold">Compare Models</h1>
          <p className="text-xs text-muted-foreground">
            Send the same prompt to multiple models simultaneously
          </p>
        </div>
        {columnModels.length < MAX_COLUMNS && (
          <Button
            onClick={addColumn}
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs"
          >
            <PlusIcon size={12} />
            Add model
          </Button>
        )}
      </div>

      {/* Columns */}
      <div className="flex min-h-0 flex-1 divide-x divide-border overflow-hidden">
        {columnModels.map((modelId, index) => (
          <div key={`${modelId}-${index}`} className="relative flex min-w-0 flex-1 flex-col">
            {columnModels.length > 2 && (
              <button
                onClick={() => removeColumn(index)}
                className="absolute right-2 top-2 z-10 rounded-sm p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground group-hover:opacity-100 hover:opacity-100"
                aria-label="Remove column"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            )}
            <CompareColumn
              initialModelId={modelId}
              models={ALL_MODELS}
              pendingSubmit={pendingSubmit}
            />
          </div>
        ))}
      </div>

      {/* Shared input */}
      <div className="shrink-0 border-t border-border bg-background px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-end gap-2">
          <Textarea
            className="min-h-[44px] max-h-32 flex-1 resize-none rounded-xl text-sm"
            placeholder="Ask all models the same question…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <Button
            onClick={handleSubmit}
            disabled={!input.trim()}
            size="sm"
            className="h-11 shrink-0 px-4"
          >
            Send
          </Button>
        </div>
        <p className="mt-1.5 text-center text-xs text-muted-foreground">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
