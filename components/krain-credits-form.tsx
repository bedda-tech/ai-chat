"use client";

import { Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KRAIN_COPY } from "@/lib/krain/spend-rules";

export function KrainCreditsForm() {
  const [key, setKey] = useState("");
  const [configured, setConfigured] = useState(false);
  const [keyPrefix, setKeyPrefix] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/krain-credits")
      .then((r) => r.json())
      .then((data) => {
        setConfigured(data.configured);
        setKeyPrefix(data.keyPrefix ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    if (!key.trim()) {
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/krain-credits", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: key.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to save key");
      }
      const data = await res.json();
      setConfigured(true);
      setKeyPrefix(data.keyPrefix);
      setKey("");
      toast.success("Testnet KRAIN key saved");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save key");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    setSaving(true);
    try {
      await fetch("/api/krain-credits", { method: "DELETE" });
      setConfigured(false);
      setKeyPrefix(null);
      setKey("");
      toast.success("Testnet KRAIN key removed");
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
        Paste the API key you created at app.krain.ai to spend testnet KRAIN on
        zero-cost models. {KRAIN_COPY}
      </p>

      {configured && keyPrefix && (
        <div className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2 text-sm">
          <span className="font-mono">
            {keyPrefix}
            {"•".repeat(24)}
          </span>
          <Button
            disabled={saving}
            onClick={handleRemove}
            size="sm"
            variant="ghost"
          >
            <Trash2 className="size-4" />
            <span className="sr-only">Remove key</span>
          </Button>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="krain-key">
          {configured ? "Replace KRAIN API key" : "KRAIN API key"}
        </Label>
        <div className="flex gap-2">
          <Input
            className="flex-1 font-mono text-sm"
            id="krain-key"
            onChange={(e) => setKey(e.target.value)}
            placeholder="Paste your app.krain.ai API key"
            type="password"
            value={key}
          />
          <Button
            disabled={!key.trim() || saving}
            onClick={handleSave}
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
