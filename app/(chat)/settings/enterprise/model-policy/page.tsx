"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import modelsData from "@/lib/ai/models-data.json" with { type: "json" };

type ModelInfo = {
  id: string;
  name: string;
  provider: string;
};

const ALL_MODELS: ModelInfo[] = (
  modelsData as { models: ModelInfo[] }
).models.map((m) => ({
  id: m.id,
  name: m.name,
  provider: m.provider,
}));

type OrgPolicy = {
  allowedModelIds: string[] | null;
  deniedModelIds: string[] | null;
  monthlyCostCapUsdCents: number;
};

export default function ModelPolicyPage() {
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [allowedIds, setAllowedIds] = useState<Set<string>>(new Set());
  const [deniedIds, setDeniedIds] = useState<Set<string>>(new Set());
  const [capDollars, setCapDollars] = useState("0");
  const [mode, setMode] = useState<"allowlist" | "denylist" | "none">("none");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/org/model-policy")
      .then((r) => {
        if (r.status === 403) {
          setForbidden(true);
          setLoading(false);
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (!data) {
          return;
        }
        setIsAdmin(data.isAdmin);
        setTeamId(data.teamId);
        const p: OrgPolicy | null = data.policy;
        if (p) {
          if (p.allowedModelIds && p.allowedModelIds.length > 0) {
            setMode("allowlist");
            setAllowedIds(new Set(p.allowedModelIds));
          } else if (p.deniedModelIds && p.deniedModelIds.length > 0) {
            setMode("denylist");
            setDeniedIds(new Set(p.deniedModelIds));
          }
          setCapDollars(
            p.monthlyCostCapUsdCents > 0
              ? (p.monthlyCostCapUsdCents / 100).toFixed(2)
              : "0"
          );
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load policy");
        setLoading(false);
      });
  }, []);

  function toggleModel(
    id: string,
    set: Set<string>,
    setter: (s: Set<string>) => void
  ) {
    const next = new Set(set);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setter(next);
  }

  async function handleSave() {
    if (!teamId) {
      return;
    }
    setSaving(true);
    setError("");
    setSaved(false);
    const capCents = Math.round(Number.parseFloat(capDollars || "0") * 100);
    const body = {
      teamId,
      allowedModelIds: mode === "allowlist" ? [...allowedIds] : null,
      deniedModelIds: mode === "denylist" ? [...deniedIds] : null,
      monthlyCostCapUsdCents: capCents,
    };
    try {
      const r = await fetch("/api/org/model-policy", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (r.ok) {
        setSaved(true);
      } else {
        const d = await r.json();
        setError(d.error ?? "Save failed");
      }
    } catch {
      setError("Network error");
    }
    setSaving(false);
  }

  if (loading) {
    return <div className="p-8 text-muted-foreground text-sm">Loading…</div>;
  }

  if (forbidden || !isAdmin) {
    return (
      <div className="space-y-2 p-8">
        <h1 className="font-semibold text-lg">Model Policy</h1>
        <p className="text-muted-foreground text-sm">
          This feature is available to team admins.{" "}
          {!teamId && (
            <>
              You are not part of a team.{" "}
              <Link className="underline" href="/settings">
                Manage teams in Settings.
              </Link>
            </>
          )}
        </p>
      </div>
    );
  }

  const activeSet = mode === "allowlist" ? allowedIds : deniedIds;
  const activeSetter = mode === "allowlist" ? setAllowedIds : setDeniedIds;

  const byProvider = ALL_MODELS.reduce<Record<string, ModelInfo[]>>(
    (acc, m) => {
      if (!acc[m.provider]) {
        acc[m.provider] = [];
      }
      acc[m.provider].push(m);
      return acc;
    },
    {}
  );

  return (
    <div className="max-w-2xl space-y-6 p-8">
      <div>
        <h1 className="font-semibold text-lg">Model Policy</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Control which AI models your team members can access, and set a
          monthly spending cap per user.
        </p>
      </div>

      {/* Mode selector */}
      <div className="space-y-2">
        <label className="font-medium text-sm">Restriction mode</label>
        <div className="flex gap-3">
          {(["none", "allowlist", "denylist"] as const).map((m) => (
            <button
              className={`rounded border px-3 py-1.5 text-sm transition-colors ${
                mode === m
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input hover:bg-accent"
              }`}
              key={m}
              onClick={() => setMode(m)}
              type="button"
            >
              {m === "none"
                ? "No restriction"
                : m === "allowlist"
                  ? "Allowlist (permit only)"
                  : "Denylist (block these)"}
            </button>
          ))}
        </div>
      </div>

      {/* Model checkboxes */}
      {mode !== "none" && (
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">
            {mode === "allowlist"
              ? "Check the models team members ARE allowed to use."
              : "Check the models team members are NOT allowed to use."}
          </p>
          {Object.entries(byProvider).map(([provider, models]) => (
            <div key={provider}>
              <p className="mb-1 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                {provider}
              </p>
              <div className="grid grid-cols-1 gap-1">
                {models.map((m) => (
                  <label
                    className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-accent"
                    key={m.id}
                  >
                    <input
                      checked={activeSet.has(m.id)}
                      className="h-4 w-4"
                      onChange={() =>
                        toggleModel(m.id, activeSet, activeSetter)
                      }
                      type="checkbox"
                    />
                    {m.name}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cost cap */}
      <div className="space-y-2">
        <label className="font-medium text-sm" htmlFor="cost-cap">
          Monthly cost cap per user (USD)
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm">$</span>
          <input
            className="w-28 rounded border border-input bg-background px-3 py-1.5 text-sm"
            id="cost-cap"
            min="0"
            onChange={(e) => setCapDollars(e.target.value)}
            placeholder="0 = unlimited"
            step="1"
            type="number"
            value={capDollars}
          />
          <span className="text-muted-foreground text-xs">
            per user / month (0 = unlimited)
          </span>
        </div>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}
      {saved && (
        <p className="text-green-600 text-sm">
          Policy saved. Changes take effect on next page load.
        </p>
      )}

      <button
        className="rounded bg-primary px-4 py-2 font-medium text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50"
        disabled={saving}
        onClick={handleSave}
        type="button"
      >
        {saving ? "Saving…" : "Save Policy"}
      </button>
    </div>
  );
}
