"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import type { McpServer } from "@/lib/db/schema";

export function McpServersForm() {
  const [servers, setServers] = useState<McpServer[]>([]);
  const [loading, setLoading] = useState(true);
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
      if (res.ok) {
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
      s.map((srv) => (srv.id === server.id ? { ...srv, enabled: !srv.enabled } : srv))
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
      const res = await fetch(`/api/mcp-servers?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("MCP server removed");
    } catch {
      setServers(prev);
      toast.error("Failed to remove server");
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">MCP Servers</Label>
        <p className="mt-1 text-muted-foreground text-xs">
          Connect to Model Context Protocol servers to give the AI access to external tools and data sources.
        </p>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : servers.length === 0 && !showForm ? (
        <p className="text-muted-foreground text-sm">No MCP servers configured.</p>
      ) : (
        <div className="space-y-2">
          {servers.map((server) => (
            <div
              key={server.id}
              className="flex items-center justify-between rounded-md border p-3 text-sm"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{server.name}</p>
                <p className="truncate text-muted-foreground text-xs">{server.url}</p>
              </div>
              <div className="ml-3 flex items-center gap-3">
                <Switch
                  checked={server.enabled}
                  onCheckedChange={() => handleToggle(server)}
                  aria-label={`Toggle ${server.name}`}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(server.id)}
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
            <Label htmlFor="mcp-name" className="text-xs">Name</Label>
            <Input
              id="mcp-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="My MCP Server"
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="mcp-url" className="text-xs">URL</Label>
            <Input
              id="mcp-url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://mcp.example.com/sse"
              className="h-8 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} disabled={adding}>
              {adding ? "Adding..." : "Add Server"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowForm(false);
                setNewName("");
                setNewUrl("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
          Add MCP Server
        </Button>
      )}
    </div>
  );
}
