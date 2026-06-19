"use client";

import { Check, Copy, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
        aria-label="Toggle visibility"
        className="text-muted-foreground hover:text-foreground"
        onClick={() => setVisible((v) => !v)}
        type="button"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
      <button
        aria-label="Copy key"
        className="text-muted-foreground hover:text-foreground"
        onClick={copy}
        type="button"
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
  const [isPaidUser, setIsPaidUser] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newKey, setNewKey] = useState<NewKeyResult | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/api-keys")
      .then(async (r) => {
        if (r.status === 403) {
          setIsPaidUser(false);
          return;
        }
        const data = await r.json();
        setKeys(Array.isArray(data) ? data : []);
      })
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
    if (
      !window.confirm("Revoke this API key? It will stop working immediately.")
    )
      return;
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

  if (!loading && !isPaidUser) {
    return (
      <div className="space-y-4">
        <div>
          <p className="font-medium text-sm">API Keys</p>
          <p className="mt-1 text-muted-foreground text-xs">
            Use these keys to access Bedda via the OpenAI-compatible API.
          </p>
        </div>
        <div className="rounded-md border border-amber-500/40 bg-amber-50 p-4 dark:bg-amber-950/20">
          <p className="font-medium text-amber-800 text-sm dark:text-amber-300">
            API access requires a paid subscription
          </p>
          <p className="mt-1 text-amber-700 text-xs dark:text-amber-400">
            Upgrade to Plus, Pro, or Max to create and use API keys.
          </p>
          <a
            className="mt-3 inline-flex items-center rounded-md bg-amber-600 px-3 py-1.5 font-medium text-white text-xs hover:bg-amber-700"
            href="/upgrade"
          >
            Upgrade now
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-sm">API Keys</p>
          <p className="mt-1 text-muted-foreground text-xs">
            Use these keys to access Bedda via the OpenAI-compatible API at{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              /api/v1/chat/completions
            </code>
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} size="sm" variant="outline">
            <Plus className="mr-1 size-3" />
            New key
          </Button>
        )}
      </div>

      {showForm && (
        <div className="flex gap-2">
          <Input
            className="max-w-xs"
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createKey()}
            placeholder="Key name (e.g. My App)"
            value={newName}
          />
          <Button
            disabled={creating || !newName.trim()}
            onClick={createKey}
            size="sm"
          >
            {creating ? "Creating…" : "Create"}
          </Button>
          <Button
            onClick={() => {
              setShowForm(false);
              setNewName("");
            }}
            size="sm"
            variant="ghost"
          >
            Cancel
          </Button>
        </div>
      )}

      {newKey && (
        <div className="rounded-md border border-green-500/40 bg-green-50 p-3 dark:bg-green-950/20">
          <p className="mb-1 font-medium text-green-800 text-sm dark:text-green-300">
            API key created — copy it now, it won't be shown again
          </p>
          <CopyableKey value={newKey.key} />
          <Button
            className="mt-2 text-xs"
            onClick={() => setNewKey(null)}
            size="sm"
            variant="ghost"
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
              className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
              key={key.id}
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
                aria-label="Revoke key"
                className="ml-2 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                disabled={revoking === key.id}
                onClick={() => revokeKey(key.id)}
                size="icon"
                variant="ghost"
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
          &quot;Authorization: Bearer bai_...&quot; -d
          &apos;&#123;&quot;model&quot;:
          &quot;anthropic-claude-sonnet-4.5&quot;,&quot;messages&quot;:
          [&#123;&quot;role&quot;:&quot;user&quot;,&quot;content&quot;:&quot;Hello&quot;&#125;]&#125;&apos;
        </code>
      </p>
    </div>
  );
}
