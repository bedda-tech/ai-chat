"use client";

import { Eye, EyeOff, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ByokForm() {
  const [key, setKey] = useState("");
  const [visible, setVisible] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [keyPrefix, setKeyPrefix] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/byok?provider=openai")
      .then((r) => r.json())
      .then((data) => {
        setConfigured(data.configured);
        setKeyPrefix(data.keyPrefix ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    if (!key.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/byok", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: "openai", key: key.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to save key");
      }
      const data = await res.json();
      setConfigured(true);
      setKeyPrefix(data.keyPrefix);
      setKey("");
      toast.success("OpenAI key saved — your requests will now use it");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save key");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    setSaving(true);
    try {
      await fetch("/api/byok?provider=openai", { method: "DELETE" });
      setConfigured(false);
      setKeyPrefix(null);
      setKey("");
      toast.success("OpenAI key removed — using Bedda's shared key");
    } catch {
      toast.error("Failed to remove key");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-muted-foreground text-sm">Loading…</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        Supply your own OpenAI API key to use it instead of Bedda&apos;s shared
        key. Your key is encrypted at rest and never logged.
      </p>

      {configured && keyPrefix && (
        <div className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2 text-sm">
          <span className="font-mono">
            {keyPrefix}{"•".repeat(24)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={saving}
          >
            <Trash2 className="size-4" />
            <span className="sr-only">Remove key</span>
          </Button>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="byok-key">
          {configured ? "Replace OpenAI key" : "OpenAI API key"}
        </Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              id="byok-key"
              type={visible ? "text" : "password"}
              placeholder="sk-..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="pr-10 font-mono text-sm"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setVisible((v) => !v)}
              tabIndex={-1}
            >
              {visible ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          <Button
            onClick={handleSave}
            disabled={!key.trim() || saving}
            size="sm"
          >
            <Save className="mr-1 size-4" />
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
