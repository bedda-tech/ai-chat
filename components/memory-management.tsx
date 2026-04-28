"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Memory {
  id: string;
  content: string;
  category: string;
  createdAt: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  preference: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  goal: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  background: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  technical: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  general: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

export function MemoryManagement() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [clearingAll, setClearingAll] = useState(false);

  useEffect(() => {
    fetch("/api/memory")
      .then((r) => r.json())
      .then((data) => setMemories(data.memories ?? []))
      .catch(() => toast.error("Failed to load memories"))
      .finally(() => setLoading(false));
  }, []);

  async function deleteMemory(id: string) {
    setDeleting(id);
    try {
      const res = await fetch("/api/memory", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to delete");
      setMemories((prev) => prev.filter((m) => m.id !== id));
      toast.success("Memory deleted");
    } catch {
      toast.error("Failed to delete memory");
    } finally {
      setDeleting(null);
    }
  }

  async function clearAll() {
    if (!window.confirm("Delete all memories? This cannot be undone.")) return;
    setClearingAll(true);
    try {
      const res = await fetch("/api/memory", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      if (!res.ok) throw new Error("Failed to clear");
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
          <p className="text-sm font-medium">AI Memory</p>
          <p className="mt-1 text-muted-foreground text-xs">
            Facts the AI has learned about you across conversations. These are
            injected into every chat to personalize responses.
          </p>
        </div>
        {memories.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAll}
            disabled={clearingAll}
            className="shrink-0 text-destructive hover:text-destructive"
          >
            {clearingAll ? "Clearing..." : "Clear all"}
          </Button>
        )}
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
              key={m.id}
              className="flex items-start justify-between gap-3 rounded-lg border px-3 py-2 text-sm"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="leading-snug">{m.content}</span>
                <Badge
                  variant="secondary"
                  className={`w-fit text-xs ${CATEGORY_COLORS[m.category] ?? CATEGORY_COLORS.general}`}
                >
                  {m.category}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                disabled={deleting === m.id}
                onClick={() => deleteMemory(m.id)}
                aria-label="Delete memory"
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
