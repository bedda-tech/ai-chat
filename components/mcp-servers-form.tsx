"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { McpServer } from "@/lib/db/schema";

export function McpServersForm() {
  const [servers, setServers] = useState<McpServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaidUser, setIsPaidUser] = useState<boolean | null>(null);
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");

  useEffect(() => {
    fetchServers();
  }, []);

  async function fetchServers() {
    try {
      const res = await fetch("/api/mcp-servers");
      if (res.status === 403) {
        setIsPaidUser(false);
        return;
      }
      if (res.ok) {
        setIsPaidUser(true);
        const data = await res.json();
        setServers(data.servers ?? []);
      }
    } catch {
      toast.error("Failed to load MCP servers");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    if (!newName.trim() || !newUrl.trim()) {
      toast.error("Name and URL are required");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/mcp-servers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), url: newUrl.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to add server");
      }
      const data = await res.json();
      setServers((prev) => [...prev, data.server]);
      setNewName("");
      setNewUrl("");
      setShowForm(false);
      toast.success("MCP server added");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to add MCP server");
    } finally {
      setAdding(false);
    }
  }

  async function handleToggle(server: McpServer) {
    const prev = servers;
    setServers((s) =>
      s.map((srv) =>
        srv.id === server.id ? { ...srv, enabled: !srv.enabled } : srv
      )
    );
    try {
      const res = await fetch(`/api/mcp-servers?id=${server.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !server.enabled }),
      });
      if (!res.ok) throw new Error("Failed to update");
    } catch {
      setServers(prev);
      toast.error("Failed to update server");
    }
  }

  async function handleDelete(id: string) {
    const prev = servers;
    setServers((s) => s.filter((srv) => srv.id !== id));
    try {
      const res = await fetch(`/api/mcp-servers?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("MCP server removed");
    } catch {
      setServers(prev);
      toast.error("Failed to remove server");
    }
  }

  if (!loading && isPaidUser === false) {
    return (
      <div className="space-y-4">
        <div>
          <Label className="font-medium text-sm">MCP Servers</Label>
          <p className="mt-1 text-muted-foreground text-xs">
            Connect to Model Context Protocol servers to give the AI access to
            external tools and data sources.
          </p>
        </div>
        <div className="rounded-md border border-amber-500/40 bg-amber-50 p-4 dark:bg-amber-950/20">
          <p className="font-medium text-amber-800 text-sm dark:text-amber-300">
            MCP integration requires a paid subscription
          </p>
          <p className="mt-1 text-amber-700 text-xs dark:text-amber-400">
            Connect external tools and data sources via MCP servers. Available
            on Plus, Pro, and Max plans.
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
      <div>
        <Label className="font-medium text-sm">MCP Servers</Label>
        <p className="mt-1 text-muted-foreground text-xs">
          Connect to Model Context Protocol servers to give the AI access to
          external tools and data sources.
        </p>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : servers.length === 0 && !showForm ? (
        <p className="text-muted-foreground text-sm">
          No MCP servers configured.
        </p>
      ) : (
        <div className="space-y-2">
          {servers.map((server) => (
            <div
              className="flex items-center justify-between rounded-md border p-3 text-sm"
              key={server.id}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{server.name}</p>
                <p className="truncate text-muted-foreground text-xs">
                  {server.url}
                </p>
              </div>
              <div className="ml-3 flex items-center gap-3">
                <Switch
                  aria-label={`Toggle ${server.name}`}
                  checked={server.enabled}
                  onCheckedChange={() => handleToggle(server)}
                />
                <Button
                  className="h-7 px-2 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(server.id)}
                  size="sm"
                  variant="ghost"
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm ? (
        <div className="space-y-3 rounded-md border p-3">
          <div className="space-y-1">
            <Label className="text-xs" htmlFor="mcp-name">
              Name
            </Label>
            <Input
              className="h-8 text-sm"
              id="mcp-name"
              onChange={(e) => setNewName(e.target.value)}
              placeholder="My MCP Server"
              value={newName}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs" htmlFor="mcp-url">
              URL
            </Label>
            <Input
              className="h-8 text-sm"
              id="mcp-url"
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://mcp.example.com/sse"
              value={newUrl}
            />
          </div>
          <div className="flex gap-2">
            <Button disabled={adding} onClick={handleAdd} size="sm">
              {adding ? "Adding..." : "Add Server"}
            </Button>
            <Button
              onClick={() => {
                setShowForm(false);
                setNewName("");
                setNewUrl("");
              }}
              size="sm"
              variant="ghost"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => setShowForm(true)} size="sm" variant="outline">
          Add MCP Server
        </Button>
      )}
    </div>
  );
}
