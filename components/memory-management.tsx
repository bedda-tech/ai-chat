"use client";

import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type Memory = {
  id: string;
  content: string;
  category: string;
  createdAt: string;
};

const CATEGORY_COLORS: Record<string, string> = {
  preference: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  goal: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  background:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  technical:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  general: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

export function MemoryManagement() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [clearingAll, setClearingAll] = useState(false);
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [togglingMemory, setTogglingMemory] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/memory")
        .then((r) => r.json())
        .then((data) => setMemories(data.memories ?? [])),
      fetch("/api/user/preferences")
        .then((r) => r.json())
        .then((data) => setMemoryEnabled(data.memoryEnabled ?? true)),
    ])
      .catch(() => toast.error("Failed to load memory settings"))
      .finally(() => setLoading(false));
  }, []);

  async function toggleMemory(enabled: boolean) {
    setTogglingMemory(true);
    try {
      const res = await fetch("/api/user/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memoryEnabled: enabled }),
      });
      if (!res.ok) {
        throw new Error("Failed to save");
      }
      setMemoryEnabled(enabled);
      toast.success(enabled ? "Memory enabled" : "Memory disabled");
    } catch {
      toast.error("Failed to update memory setting");
    } finally {
      setTogglingMemory(false);
    }
  }

  async function deleteMemory(id: string) {
    setDeleting(id);
    try {
      const res = await fetch("/api/memory", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        throw new Error("Failed to delete");
      }
      setMemories((prev) => prev.filter((m) => m.id !== id));
      toast.success("Memory deleted");
    } catch {
      toast.error("Failed to delete memory");
    } finally {
      setDeleting(null);
    }
  }

  async function clearAll() {
    if (!window.confirm("Delete all memories? This cannot be undone.")) {
      return;
    }
    setClearingAll(true);
    try {
      const res = await fetch("/api/memory", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      if (!res.ok) {
        throw new Error("Failed to clear");
      }
      setMemories([]);
      toast.success("All memories cleared");
    } catch {
      toast.error("Failed to clear memories");
    } finally {
      setClearingAll(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-sm">AI Memory</p>
          <p className="mt-1 text-muted-foreground text-xs">
            Facts the AI has learned about you across conversations. These are
            injected into every chat to personalize responses.
          </p>
        </div>
        {memories.length > 0 && (
          <Button
            className="shrink-0 text-destructive hover:text-destructive"
            disabled={clearingAll}
            onClick={clearAll}
            size="sm"
            variant="outline"
          >
            {clearingAll ? "Clearing..." : "Clear all"}
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3 rounded-lg border px-3 py-2">
        <Switch
          checked={memoryEnabled}
          disabled={togglingMemory || loading}
          id="memory-toggle"
          onCheckedChange={toggleMemory}
        />
        <Label className="cursor-pointer text-sm" htmlFor="memory-toggle">
          {memoryEnabled
            ? "Memory enabled — AI learns from your conversations"
            : "Memory disabled — AI will not remember anything (incognito)"}
        </Label>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : memories.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No memories yet. The AI will automatically save relevant facts as you
          chat.
        </p>
      ) : (
        <ul className="space-y-2">
          {memories.map((m) => (
            <li
              className="flex items-start justify-between gap-3 rounded-lg border px-3 py-2 text-sm"
              key={m.id}
            >
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="leading-snug">{m.content}</span>
                <Badge
                  className={`w-fit text-xs ${CATEGORY_COLORS[m.category] ?? CATEGORY_COLORS.general}`}
                  variant="secondary"
                >
                  {m.category}
                </Badge>
              </div>
              <Button
                aria-label="Delete memory"
                className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                disabled={deleting === m.id}
                onClick={() => deleteMemory(m.id)}
                size="icon"
                variant="ghost"
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
