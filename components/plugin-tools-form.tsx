"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { PluginTool } from "@/lib/db/schema";

export function PluginToolsForm() {
  const [tools, setTools] = useState<PluginTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    webhookUrl: "",
    parametersSchema: '{\n  "type": "object",\n  "properties": {}\n}',
    authHeaderName: "",
    authHeaderValue: "",
  });

  useEffect(() => {
    fetchTools();
  }, []);

  async function fetchTools() {
    try {
      const res = await fetch("/api/plugin-tools");
      if (res.ok) {
        const data = await res.json();
        setTools(data.tools ?? []);
      }
    } catch {
      toast.error("Failed to load plugin tools");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({
      name: "",
      description: "",
      webhookUrl: "",
      parametersSchema: '{\n  "type": "object",\n  "properties": {}\n}',
      authHeaderName: "",
      authHeaderValue: "",
    });
    setShowForm(false);
  }

  async function handleAdd() {
    if (!form.name.trim() || !form.description.trim() || !form.webhookUrl.trim()) {
      toast.error("Name, description, and webhook URL are required");
      return;
    }
    if (!form.webhookUrl.startsWith("https://")) {
      toast.error("Webhook URL must use HTTPS");
      return;
    }
    let parametersSchema: Record<string, any>;
    try {
      parametersSchema = JSON.parse(form.parametersSchema);
    } catch {
      toast.error("Parameters schema must be valid JSON");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/plugin-tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim(),
          webhookUrl: form.webhookUrl.trim(),
          parametersSchema,
          authHeaderName: form.authHeaderName.trim() || undefined,
          authHeaderValue: form.authHeaderValue.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to add tool");
      }
      const data = await res.json();
      setTools((prev) => [...prev, data.tool]);
      resetForm();
      toast.success("Plugin tool added");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to add plugin tool");
    } finally {
      setAdding(false);
    }
  }

  async function handleToggle(pt: PluginTool) {
    const prev = tools;
    setTools((s) =>
      s.map((t) => (t.id === pt.id ? { ...t, enabled: !t.enabled } : t))
    );
    try {
      const res = await fetch(`/api/plugin-tools?id=${pt.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !pt.enabled }),
      });
      if (!res.ok) throw new Error("Failed to update");
    } catch {
      setTools(prev);
      toast.error("Failed to update plugin tool");
    }
  }

  async function handleDelete(id: string) {
    const prev = tools;
    setTools((s) => s.filter((t) => t.id !== id));
    try {
      const res = await fetch(`/api/plugin-tools?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Plugin tool removed");
    } catch {
      setTools(prev);
      toast.error("Failed to remove plugin tool");
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Plugin Tools</Label>
        <p className="mt-1 text-muted-foreground text-xs">
          Add custom webhook tools the AI can call during chat. Define a name, description, and HTTPS endpoint.
        </p>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : tools.length === 0 && !showForm ? (
        <p className="text-muted-foreground text-sm">No plugin tools configured.</p>
      ) : (
        <div className="space-y-2">
          {tools.map((pt) => (
            <div
              key={pt.id}
              className="flex items-center justify-between rounded-md border p-3 text-sm"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium font-mono">{pt.name}</p>
                <p className="truncate text-muted-foreground text-xs">{pt.description}</p>
                <p className="truncate text-muted-foreground text-xs">{pt.webhookUrl}</p>
              </div>
              <div className="ml-3 flex items-center gap-3">
                <Switch
                  checked={pt.enabled}
                  onCheckedChange={() => handleToggle(pt)}
                  aria-label={`Toggle ${pt.name}`}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(pt.id)}
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="pt-name" className="text-xs">Tool Name (alphanumeric + _)</Label>
              <Input
                id="pt-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="my_webhook_tool"
                className="h-8 font-mono text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="pt-url" className="text-xs">Webhook URL (HTTPS)</Label>
              <Input
                id="pt-url"
                value={form.webhookUrl}
                onChange={(e) => setForm((f) => ({ ...f, webhookUrl: e.target.value }))}
                placeholder="https://hooks.example.com/tool"
                className="h-8 text-sm"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="pt-desc" className="text-xs">Description</Label>
            <Input
              id="pt-desc"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="What this tool does..."
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="pt-schema" className="text-xs">Parameters Schema (JSON Schema)</Label>
            <Textarea
              id="pt-schema"
              value={form.parametersSchema}
              onChange={(e) => setForm((f) => ({ ...f, parametersSchema: e.target.value }))}
              className="font-mono text-xs"
              rows={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="pt-header-name" className="text-xs">Auth Header Name (optional)</Label>
              <Input
                id="pt-header-name"
                value={form.authHeaderName}
                onChange={(e) => setForm((f) => ({ ...f, authHeaderName: e.target.value }))}
                placeholder="Authorization"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="pt-header-value" className="text-xs">Auth Header Value (optional)</Label>
              <Input
                id="pt-header-value"
                type="password"
                value={form.authHeaderValue}
                onChange={(e) => setForm((f) => ({ ...f, authHeaderValue: e.target.value }))}
                placeholder="Bearer sk-..."
                className="h-8 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} disabled={adding}>
              {adding ? "Adding..." : "Add Tool"}
            </Button>
            <Button size="sm" variant="ghost" onClick={resetForm}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
          Add Plugin Tool
        </Button>
      )}
    </div>
  );
}
