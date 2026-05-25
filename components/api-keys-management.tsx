"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Copy, Check, Plus, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface ApiKeyRecord {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  createdAt: string;
}

interface NewKeyResult extends ApiKeyRecord {
  key: string;
}

function formatDate(iso: string | null) {
  if (!iso) return "Never";
  return new Date(iso).toLocaleDateString();
}

function CopyableKey({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2 rounded-md border bg-muted/40 p-2 font-mono text-sm">
      <span className="flex-1 overflow-hidden text-ellipsis">
        {visible ? value : `${value.slice(0, 12)}${"•".repeat(20)}`}
      </span>
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="text-muted-foreground hover:text-foreground"
        aria-label="Toggle visibility"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
      <button
        type="button"
        onClick={copy}
        className="text-muted-foreground hover:text-foreground"
        aria-label="Copy key"
      >
        {copied ? (
          <Check className="size-4 text-green-500" />
        ) : (
          <Copy className="size-4" />
        )}
      </button>
    </div>
  );
}

export function ApiKeysManagement() {
  const [keys, setKeys] = useState<ApiKeyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newKey, setNewKey] = useState<NewKeyResult | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/api-keys")
      .then((r) => r.json())
      .then((data) => setKeys(Array.isArray(data) ? data : []))
      .catch(() => toast.error("Failed to load API keys"))
      .finally(() => setLoading(false));
  }, []);

  async function createKey() {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (!res.ok) throw new Error("Failed to create");
      const data: NewKeyResult = await res.json();
      setKeys((prev) => [data, ...prev]);
      setNewKey(data);
      setNewName("");
      setShowForm(false);
    } catch {
      toast.error("Failed to create API key");
    } finally {
      setCreating(false);
    }
  }

  async function revokeKey(id: string) {
    if (!window.confirm("Revoke this API key? It will stop working immediately.")) return;
    setRevoking(id);
    try {
      const res = await fetch("/api/api-keys", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to revoke");
      setKeys((prev) => prev.filter((k) => k.id !== id));
      toast.success("API key revoked");
    } catch {
      toast.error("Failed to revoke API key");
    } finally {
      setRevoking(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium">API Keys</p>
          <p className="mt-1 text-muted-foreground text-xs">
            Use these keys to access Bedda via the OpenAI-compatible API at{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              /api/v1/chat/completions
            </code>
          </p>
        </div>
        {!showForm && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowForm(true)}
          >
            <Plus className="mr-1 size-3" />
            New key
          </Button>
        )}
      </div>

      {showForm && (
        <div className="flex gap-2">
          <Input
            placeholder="Key name (e.g. My App)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createKey()}
            className="max-w-xs"
          />
          <Button size="sm" onClick={createKey} disabled={creating || !newName.trim()}>
            {creating ? "Creating…" : "Create"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { setShowForm(false); setNewName(""); }}>
            Cancel
          </Button>
        </div>
      )}

      {newKey && (
        <div className="rounded-md border border-green-500/40 bg-green-50 p-3 dark:bg-green-950/20">
          <p className="mb-1 text-sm font-medium text-green-800 dark:text-green-300">
            API key created — copy it now, it won't be shown again
          </p>
          <CopyableKey value={newKey.key} />
          <Button
            size="sm"
            variant="ghost"
            className="mt-2 text-xs"
            onClick={() => setNewKey(null)}
          >
            Dismiss
          </Button>
        </div>
      )}

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading…</p>
      ) : keys.length === 0 ? (
        <p className="text-muted-foreground text-sm">No API keys yet.</p>
      ) : (
        <div className="space-y-2">
          {keys.map((key) => (
            <div
              key={key.id}
              className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
            >
              <div className="min-w-0">
                <span className="font-medium">{key.name}</span>
                <span className="ml-2 font-mono text-muted-foreground text-xs">
                  {key.keyPrefix}
                </span>
                <p className="text-muted-foreground text-xs">
                  Created {formatDate(key.createdAt)} · Last used{" "}
                  {formatDate(key.lastUsedAt)}
                </p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="ml-2 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                disabled={revoking === key.id}
                onClick={() => revokeKey(key.id)}
                aria-label="Revoke key"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <p className="text-muted-foreground text-xs">
        Example:{" "}
        <code className="rounded bg-muted px-1 py-0.5">
          curl https://www.bedda.tech/api/v1/chat/completions -H
          &quot;Authorization: Bearer bai_...&quot; -d &apos;&#123;&quot;model&quot;:
          &quot;anthropic-claude-sonnet-4.5&quot;,&quot;messages&quot;:
          [&#123;&quot;role&quot;:&quot;user&quot;,&quot;content&quot;:&quot;Hello&quot;&#125;]&#125;&apos;
        </code>
      </p>
    </div>
  );
}
