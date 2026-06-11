"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  MARKETPLACE_CATEGORIES,
  MARKETPLACE_PLUGINS,
  type MarketplaceCategory,
  type MarketplacePlugin,
} from "@/lib/plugins/marketplace-data";

function PluginCard({
  plugin,
  onInstall,
}: {
  plugin: MarketplacePlugin;
  onInstall: (plugin: MarketplacePlugin) => void;
}) {
  return (
    <div className="flex flex-col rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-center gap-3">
        <span className="text-2xl" role="img" aria-label={plugin.name}>
          {plugin.icon}
        </span>
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-sm">{plugin.name}</h3>
          <p className="text-muted-foreground text-xs">by {plugin.author}</p>
        </div>
      </div>
      <p className="mb-4 flex-1 text-muted-foreground text-sm leading-snug">
        {plugin.description}
      </p>
      <Button
        size="sm"
        className="w-full"
        onClick={() => onInstall(plugin)}
      >
        Install
      </Button>
    </div>
  );
}

function InstallDrawer({
  plugin,
  open,
  onClose,
}: {
  plugin: MarketplacePlugin | null;
  open: boolean;
  onClose: () => void;
}) {
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  if (!plugin) return null;

  async function handleInstall() {
    if (!plugin) return;
    for (const p of plugin.params) {
      if (p.required && !paramValues[p.name]?.trim()) {
        toast.error(`${p.label} is required`);
        return;
      }
    }

    setSaving(true);
    try {
      const authParam = plugin.params.find((p) => p.secret);
      const authNameParam = plugin.params.find(
        (p) => !p.secret && p.name.toLowerCase().includes("header")
      );

      const res = await fetch("/api/plugin-tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: plugin.webhookToolName,
          description: plugin.webhookToolDescription,
          webhookUrl: plugin.webhookUrlTemplate,
          parametersSchema: plugin.parametersSchema,
          authHeaderName: authNameParam ? paramValues[authNameParam.name] || undefined : undefined,
          authHeaderValue: authParam ? paramValues[authParam.name] || undefined : undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to install plugin");
      }

      toast.success(`${plugin.name} installed! Configure the webhook URL in Settings → Plugin Tools.`);
      setParamValues({});
      onClose();
    } catch (e: any) {
      toast.error(e.message ?? "Failed to install plugin");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader className="mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{plugin.icon}</span>
            <div>
              <SheetTitle>{plugin.name}</SheetTitle>
              <SheetDescription>by {plugin.author}</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-5">
          <p className="text-muted-foreground text-sm">{plugin.description}</p>

          {plugin.params.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Configuration</h4>
              {plugin.params.map((param) => (
                <div key={param.name} className="space-y-1.5">
                  <Label htmlFor={`param-${param.name}`} className="text-xs">
                    {param.label}
                    {param.required && <span className="ml-1 text-destructive">*</span>}
                  </Label>
                  <Input
                    id={`param-${param.name}`}
                    type={param.secret ? "password" : "text"}
                    placeholder={param.placeholder}
                    value={paramValues[param.name] ?? ""}
                    onChange={(e) =>
                      setParamValues((prev) => ({
                        ...prev,
                        [param.name]: e.target.value,
                      }))
                    }
                    className="h-9 text-sm"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="space-y-1.5">
            <h4 className="font-medium text-sm">Webhook URL Template</h4>
            <p className="break-all rounded-md bg-muted px-3 py-2 font-mono text-xs">
              {plugin.webhookUrlTemplate}
            </p>
            <p className="text-muted-foreground text-xs">
              You can update the exact URL after installation in Settings → Plugin Tools.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-medium text-sm">Tool Name</h4>
            <p className="rounded-md bg-muted px-3 py-2 font-mono text-xs">
              {plugin.webhookToolName}
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              className="flex-1"
              onClick={handleInstall}
              disabled={saving}
            >
              {saving ? "Installing..." : "Install Plugin"}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function PluginsMarketplacePage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<MarketplaceCategory | "All">("All");
  const [selectedPlugin, setSelectedPlugin] = useState<MarketplacePlugin | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = MARKETPLACE_PLUGINS.filter((p) => {
    const matchesCategory =
      activeCategory === "All" || p.category === activeCategory;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.author.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  function handleInstall(plugin: MarketplacePlugin) {
    setSelectedPlugin(plugin);
    setDrawerOpen(true);
  }

  function handleClose() {
    setDrawerOpen(false);
    setSelectedPlugin(null);
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="font-bold text-2xl">Plugin Marketplace</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Browse and install community-curated webhook plugins to extend your AI with external tools.
        </p>
      </div>

      {/* Search */}
      <div className="mb-5">
        <Input
          placeholder="Search plugins..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Category tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {(["All", ...MARKETPLACE_CATEGORIES] as const).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              activeCategory === cat
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground text-sm">
          No plugins found for &ldquo;{search}&rdquo;.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((plugin) => (
            <PluginCard key={plugin.id} plugin={plugin} onInstall={handleInstall} />
          ))}
        </div>
      )}

      <InstallDrawer plugin={selectedPlugin} open={drawerOpen} onClose={handleClose} />
    </div>
  );
}
