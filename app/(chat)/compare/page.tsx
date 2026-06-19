"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CompareColumn } from "@/components/compare-column";
import { PlusIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import modelsData from "@/lib/ai/models-data.json" with { type: "json" };

const ALL_MODELS = modelsData.models.map((m) => ({
  id: m.id,
  name: m.name,
  provider: m.provider,
}));

const DEFAULT_COLUMNS = ["anthropic-claude-sonnet-4.5", "openai-gpt-5"];

const MAX_COLUMNS = 4;

interface PendingSubmit {
  text: string;
  version: number;
}

interface SavedSession {
  id: string;
  title: string | null;
  modelIds: string[];
  prompts: string[];
  createdAt: string;
}

function BookmarkIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      width={size}
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function TrashIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      width={size}
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}

export default function ComparePage() {
  const [columnModels, setColumnModels] = useState<string[]>(DEFAULT_COLUMNS);
  const [input, setInput] = useState("");
  const [pendingSubmit, setPendingSubmit] = useState<PendingSubmit>({
    text: "",
    version: 0,
  });
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const [saving, setSaving] = useState(false);
  const promptHistory = useRef<string[]>([]);

  useEffect(() => {
    fetch("/api/compare")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.sessions) setSavedSessions(data.sessions);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    promptHistory.current = [...promptHistory.current, text];
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

  const saveSession = useCallback(async () => {
    if (promptHistory.current.length === 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelIds: columnModels,
          prompts: promptHistory.current,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSavedSessions((prev) => [data.session, ...prev]);
      }
    } finally {
      setSaving(false);
    }
  }, [columnModels]);

  const loadSession = useCallback((s: SavedSession) => {
    promptHistory.current = [];
    setColumnModels(s.modelIds);
    setPendingSubmit({ text: "", version: 0 });
  }, []);

  const deleteSession = useCallback(async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await fetch(`/api/compare/${id}`, { method: "DELETE" });
    setSavedSessions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const hasPrompts = pendingSubmit.version > 0;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-border border-b px-4 py-2">
        <div>
          <h1 className="font-semibold text-sm">Compare Models</h1>
          <p className="text-muted-foreground text-xs">
            Send the same prompt to multiple models simultaneously
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Save session */}
          <Button
            className="gap-1.5 text-xs"
            disabled={!hasPrompts || saving}
            onClick={saveSession}
            size="sm"
            title="Save this comparison session"
            variant="outline"
          >
            <BookmarkIcon size={12} />
            {saving ? "Saving…" : "Save"}
          </Button>

          {/* History dropdown */}
          {savedSessions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="text-xs" size="sm" variant="outline">
                  History
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                {savedSessions.map((s, i) => (
                  <div key={s.id}>
                    {i > 0 && <DropdownMenuSeparator />}
                    <DropdownMenuItem
                      className="flex cursor-pointer items-center justify-between gap-2"
                      onSelect={() => loadSession(s)}
                    >
                      <span className="truncate text-xs">
                        {s.title || "Untitled"}
                      </span>
                      <button
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={(e) => deleteSession(s.id, e)}
                        title="Delete session"
                      >
                        <TrashIcon />
                      </button>
                    </DropdownMenuItem>
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {columnModels.length < MAX_COLUMNS && (
            <Button
              className="gap-1.5 text-xs"
              onClick={addColumn}
              size="sm"
              variant="outline"
            >
              <PlusIcon size={12} />
              Add model
            </Button>
          )}
        </div>
      </div>

      {/* Columns */}
      <div className="flex min-h-0 flex-1 divide-x divide-border overflow-hidden">
        {columnModels.map((modelId, index) => (
          <div
            className="relative flex min-w-0 flex-1 flex-col"
            key={`${modelId}-${index}`}
          >
            {columnModels.length > 2 && (
              <button
                aria-label="Remove column"
                className="absolute top-2 right-2 z-10 rounded-sm p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground hover:opacity-100 group-hover:opacity-100"
                onClick={() => removeColumn(index)}
              >
                <svg
                  fill="none"
                  height="12"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                  width="12"
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
      <div className="shrink-0 border-border border-t bg-background px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-end gap-2">
          <Textarea
            className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl text-sm"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask all models the same question…"
            rows={1}
            value={input}
          />
          <Button
            className="h-11 shrink-0 px-4"
            disabled={!input.trim()}
            onClick={handleSubmit}
            size="sm"
          >
            Send
          </Button>
        </div>
        <p className="mt-1.5 text-center text-muted-foreground text-xs">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
