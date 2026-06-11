"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import modelsData from "@/lib/ai/models-data.json"

interface ModelInfo {
  id: string
  name: string
  provider: string
}

const ALL_MODELS: ModelInfo[] = (modelsData as { models: ModelInfo[] }).models.map((m) => ({
  id: m.id,
  name: m.name,
  provider: m.provider,
}))

interface OrgPolicy {
  allowedModelIds: string[] | null
  deniedModelIds: string[] | null
  monthlyCostCapUsdCents: number
}

export default function ModelPolicyPage() {
  const [loading, setLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [teamId, setTeamId] = useState<string | null>(null)
  const [allowedIds, setAllowedIds] = useState<Set<string>>(new Set())
  const [deniedIds, setDeniedIds] = useState<Set<string>>(new Set())
  const [capDollars, setCapDollars] = useState("0")
  const [mode, setMode] = useState<"allowlist" | "denylist" | "none">("none")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/org/model-policy")
      .then((r) => {
        if (r.status === 403) { setForbidden(true); setLoading(false); return null }
        return r.json()
      })
      .then((data) => {
        if (!data) return
        setIsAdmin(data.isAdmin)
        setTeamId(data.teamId)
        const p: OrgPolicy | null = data.policy
        if (p) {
          if (p.allowedModelIds && p.allowedModelIds.length > 0) {
            setMode("allowlist")
            setAllowedIds(new Set(p.allowedModelIds))
          } else if (p.deniedModelIds && p.deniedModelIds.length > 0) {
            setMode("denylist")
            setDeniedIds(new Set(p.deniedModelIds))
          }
          setCapDollars(p.monthlyCostCapUsdCents > 0 ? (p.monthlyCostCapUsdCents / 100).toFixed(2) : "0")
        }
        setLoading(false)
      })
      .catch(() => { setError("Failed to load policy"); setLoading(false) })
  }, [])

  function toggleModel(id: string, set: Set<string>, setter: (s: Set<string>) => void) {
    const next = new Set(set)
    if (next.has(id)) next.delete(id); else next.add(id)
    setter(next)
  }

  async function handleSave() {
    if (!teamId) return
    setSaving(true); setError(""); setSaved(false)
    const capCents = Math.round(Number.parseFloat(capDollars || "0") * 100)
    const body = {
      teamId,
      allowedModelIds: mode === "allowlist" ? [...allowedIds] : null,
      deniedModelIds: mode === "denylist" ? [...deniedIds] : null,
      monthlyCostCapUsdCents: capCents,
    }
    try {
      const r = await fetch("/api/org/model-policy", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!r.ok) { const d = await r.json(); setError(d.error ?? "Save failed") }
      else setSaved(true)
    } catch { setError("Network error") }
    setSaving(false)
  }

  if (loading) return <div className="p-8 text-sm text-muted-foreground">Loading…</div>

  if (forbidden || !isAdmin) {
    return (
      <div className="p-8 space-y-2">
        <h1 className="text-lg font-semibold">Model Policy</h1>
        <p className="text-sm text-muted-foreground">
          This feature is available to team admins.{" "}
          {!teamId && (
            <>
              You are not part of a team.{" "}
              <Link href="/settings" className="underline">Manage teams in Settings.</Link>
            </>
          )}
        </p>
      </div>
    )
  }

  const activeSet = mode === "allowlist" ? allowedIds : deniedIds
  const activeSetter = mode === "allowlist" ? setAllowedIds : setDeniedIds

  const byProvider = ALL_MODELS.reduce<Record<string, ModelInfo[]>>((acc, m) => {
    ;(acc[m.provider] = acc[m.provider] ?? []).push(m)
    return acc
  }, {})

  return (
    <div className="p-8 max-w-2xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Model Policy</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Control which AI models your team members can access, and set a monthly spending cap per user.
        </p>
      </div>

      {/* Mode selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Restriction mode</label>
        <div className="flex gap-3">
          {(["none", "allowlist", "denylist"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 rounded text-sm border transition-colors ${
                mode === m
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-input hover:bg-accent"
              }`}
            >
              {m === "none" ? "No restriction" : m === "allowlist" ? "Allowlist (permit only)" : "Denylist (block these)"}
            </button>
          ))}
        </div>
      </div>

      {/* Model checkboxes */}
      {mode !== "none" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {mode === "allowlist"
              ? "Check the models team members ARE allowed to use."
              : "Check the models team members are NOT allowed to use."}
          </p>
          {Object.entries(byProvider).map(([provider, models]) => (
            <div key={provider}>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">{provider}</p>
              <div className="grid grid-cols-1 gap-1">
                {models.map((m) => (
                  <label key={m.id} className="flex items-center gap-2 cursor-pointer text-sm hover:bg-accent rounded px-2 py-1">
                    <input
                      type="checkbox"
                      checked={activeSet.has(m.id)}
                      onChange={() => toggleModel(m.id, activeSet, activeSetter)}
                      className="h-4 w-4"
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
        <label className="text-sm font-medium" htmlFor="cost-cap">
          Monthly cost cap per user (USD)
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm">$</span>
          <input
            id="cost-cap"
            type="number"
            min="0"
            step="1"
            value={capDollars}
            onChange={(e) => setCapDollars(e.target.value)}
            className="w-28 rounded border border-input bg-background px-3 py-1.5 text-sm"
            placeholder="0 = unlimited"
          />
          <span className="text-xs text-muted-foreground">per user / month (0 = unlimited)</span>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {saved && <p className="text-sm text-green-600">Policy saved. Changes take effect on next page load.</p>}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="px-4 py-2 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save Policy"}
      </button>
    </div>
  )
}
