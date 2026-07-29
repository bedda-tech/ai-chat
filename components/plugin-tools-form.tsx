"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
  }, [fetchTools]);

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
    if (
      !form.name.trim() ||
      !form.description.trim() ||
      !form.webhookUrl.trim()
    ) {
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
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to add plugin tool");
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
      if (!res.ok) {
        throw new Error("Failed to update");
      }
    } catch {
      setTools(prev);
      toast.error("Failed to update plugin tool");
    }
  }

  async function handleDelete(id: string) {
    const prev = tools;
    setTools((s) => s.filter((t) => t.id !== id));
    try {
      const res = await fetch(`/api/plugin-tools?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete");
      }
      toast.success("Plugin tool removed");
    } catch {
      setTools(prev);
      toast.error("Failed to remove plugin tool");
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="font-medium text-sm">Plugin Tools</Label>
        <p className="mt-1 text-muted-foreground text-xs">
          Add custom webhook tools the AI can call during chat. Define a name,
          description, and HTTPS endpoint.
        </p>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : tools.length === 0 && !showForm ? (
        <p className="text-muted-foreground text-sm">
          No plugin tools configured.
        </p>
      ) : (
        <div className="space-y-2">
          {tools.map((pt) => (
            <div
              className="flex items-center justify-between rounded-md border p-3 text-sm"
              key={pt.id}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium font-mono">{pt.name}</p>
                <p className="truncate text-muted-foreground text-xs">
                  {pt.description}
                </p>
                <p className="truncate text-muted-foreground text-xs">
                  {pt.webhookUrl}
                </p>
              </div>
              <div className="ml-3 flex items-center gap-3">
                <Switch
                  aria-label={`Toggle ${pt.name}`}
                  checked={pt.enabled}
                  onCheckedChange={() => handleToggle(pt)}
                />
                <Button
                  className="h-7 px-2 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(pt.id)}
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs" htmlFor="pt-name">
                Tool Name (alphanumeric + _)
              </Label>
              <Input
                className="h-8 font-mono text-sm"
                id="pt-name"
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="my_webhook_tool"
                value={form.name}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs" htmlFor="pt-url">
                Webhook URL (HTTPS)
              </Label>
              <Input
                className="h-8 text-sm"
                id="pt-url"
                onChange={(e) =>
                  setForm((f) => ({ ...f, webhookUrl: e.target.value }))
                }
                placeholder="https://hooks.example.com/tool"
                value={form.webhookUrl}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs" htmlFor="pt-desc">
              Description
            </Label>
            <Input
              className="h-8 text-sm"
              id="pt-desc"
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="What this tool does..."
              value={form.description}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs" htmlFor="pt-schema">
              Parameters Schema (JSON Schema)
            </Label>
            <Textarea
              className="font-mono text-xs"
              id="pt-schema"
              onChange={(e) =>
                setForm((f) => ({ ...f, parametersSchema: e.target.value }))
              }
              rows={4}
              value={form.parametersSchema}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs" htmlFor="pt-header-name">
                Auth Header Name (optional)
              </Label>
              <Input
                className="h-8 text-sm"
                id="pt-header-name"
                onChange={(e) =>
                  setForm((f) => ({ ...f, authHeaderName: e.target.value }))
                }
                placeholder="Authorization"
                value={form.authHeaderName}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs" htmlFor="pt-header-value">
                Auth Header Value (optional)
              </Label>
              <Input
                className="h-8 text-sm"
                id="pt-header-value"
                onChange={(e) =>
                  setForm((f) => ({ ...f, authHeaderValue: e.target.value }))
                }
                placeholder="Bearer sk-..."
                type="password"
                value={form.authHeaderValue}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button disabled={adding} onClick={handleAdd} size="sm">
              {adding ? "Adding..." : "Add Tool"}
            </Button>
            <Button onClick={resetForm} size="sm" variant="ghost">
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => setShowForm(true)} size="sm" variant="outline">
          Add Plugin Tool
        </Button>
      )}
    </div>
  );
}
