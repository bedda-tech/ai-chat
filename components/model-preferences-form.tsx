"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAvailableModels } from "@/hooks/use-available-models";
import { chatModels } from "@/lib/ai/models";

const CATEGORIES = [
  { id: "general" as const, label: "General (new chat default)" },
  { id: "coding" as const, label: "Coding" },
  { id: "writing" as const, label: "Writing" },
  { id: "analysis" as const, label: "Analysis" },
  { id: "casual" as const, label: "Casual chat" },
];

type Prefs = Record<string, string>;

function fetcher(url: string) {
  return fetch(url).then((r) => r.json());
}

export function ModelPreferencesForm() {
  const { data: prefsData, mutate } = useSWR<{ modelPreferences: Prefs }>(
    "/api/user/preferences",
    fetcher,
    { revalidateOnFocus: false }
  );

  const { models: dynamicModels } = useAvailableModels();

  const allModels = (() => {
    if (dynamicModels.length > 0) {
      const seen = new Set<string>();
      const merged = [...dynamicModels, ...chatModels].filter((m) => {
        if (seen.has(m.id)) {
          return false;
        }
        seen.add(m.id);
        return true;
      });
      return merged;
    }
    return chatModels;
  })();

  const [prefs, setPrefs] = useState<Prefs>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (prefsData?.modelPreferences) {
      setPrefs(prefsData.modelPreferences);
    }
  }, [prefsData]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/user/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelPreferences: prefs }),
      });
      if (!res.ok) {
        throw new Error("Failed to save");
      }
      await mutate();
      toast.success("Model preferences saved");
    } catch {
      toast.error("Failed to save model preferences");
    } finally {
      setSaving(false);
    }
  }

  function clearCategory(catId: string) {
    setPrefs((p) => {
      const next = { ...p };
      delete next[catId];
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-muted-foreground text-xs">
          Set a default model for each use-case. The <strong>General</strong>{" "}
          default is used for new chats when no model is pinned.
        </p>
      </div>

      {CATEGORIES.map((cat) => (
        <div className="flex items-center gap-3" key={cat.id}>
          <Label className="w-44 shrink-0 font-medium text-sm">
            {cat.label}
          </Label>
          <Select
            onValueChange={(v) => setPrefs((p) => ({ ...p, [cat.id]: v }))}
            value={prefs[cat.id] ?? ""}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="No default set" />
            </SelectTrigger>
            <SelectContent>
              {allModels
                .filter((m) => !("disabled" in m && m.disabled))
                .map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {prefs[cat.id] && (
            <Button
              className="shrink-0"
              onClick={() => clearCategory(cat.id)}
              size="sm"
              variant="ghost"
            >
              Clear
            </Button>
          )}
        </div>
      ))}

      <div className="flex justify-end pt-2">
        <Button disabled={saving} onClick={handleSave} size="sm">
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
