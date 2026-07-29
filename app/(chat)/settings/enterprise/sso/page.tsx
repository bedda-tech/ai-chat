"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SsoConfig = {
  id: string;
  organizationName: string;
  emailDomain: string;
  workosOrganizationId: string | null;
  workosConnectionId: string | null;
  idpMetadataUrl: string | null;
  createdAt: string;
};

export default function EnterpriseSsoPage() {
  const [configs, setConfigs] = useState<SsoConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [form, setForm] = useState({
    organizationName: "",
    emailDomain: "",
    workosOrganizationId: "",
    workosConnectionId: "",
    idpMetadataUrl: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/sso-config")
      .then(async (res) => {
        if (res.status === 403) {
          setForbidden(true);
          return;
        }
        const data = await res.json();
        setConfigs(data.configs ?? []);
      })
      .catch(() => setError("Failed to load SSO configurations"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/sso-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Save failed");
        return;
      }
      const data = await res.json();
      setConfigs((prev) => {
        const idx = prev.findIndex(
          (c) => c.emailDomain === data.config.emailDomain
        );
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = data.config;
          return next;
        }
        return [...prev, data.config];
      });
      setForm({
        organizationName: "",
        emailDomain: "",
        workosOrganizationId: "",
        workosConnectionId: "",
        idpMetadataUrl: "",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch("/api/sso-config", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setConfigs((prev) => prev.filter((c) => c.id !== id));
  }

  if (loading) {
    return <div className="p-8 text-muted-foreground">Loading…</div>;
  }

  if (forbidden) {
    return (
      <div className="mx-auto max-w-2xl p-8 text-center">
        <h1 className="mb-2 font-bold text-2xl">Enterprise SSO</h1>
        <p className="text-muted-foreground">
          SAML/SSO configuration requires an{" "}
          <Link className="underline" href="/upgrade">
            Enterprise (Max) subscription
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-8">
      <div className="mb-6">
        <Link
          className="text-muted-foreground text-sm hover:underline"
          href="/settings"
        >
          ← Settings
        </Link>
        <h1 className="mt-2 font-bold text-2xl tracking-tight">
          Enterprise SSO
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Map email domains to SAML identity providers via WorkOS. Members with
          matching domains will see "Sign in with SSO" on the login page.
        </p>
      </div>

      <form className="mb-8 rounded-lg border p-6" onSubmit={handleSave}>
        <h2 className="mb-4 font-semibold text-lg">
          Add / Update Domain Mapping
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block font-medium text-sm">
              Organization name *
            </label>
            <input
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              onChange={(e) =>
                setForm((f) => ({ ...f, organizationName: e.target.value }))
              }
              placeholder="Acme Corp"
              required
              value={form.organizationName}
            />
          </div>
          <div>
            <label className="mb-1 block font-medium text-sm">
              Email domain *
            </label>
            <input
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              onChange={(e) =>
                setForm((f) => ({ ...f, emailDomain: e.target.value }))
              }
              placeholder="acme.com"
              required
              value={form.emailDomain}
            />
          </div>
          <div>
            <label className="mb-1 block font-medium text-sm">
              WorkOS Organization ID
            </label>
            <input
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              onChange={(e) =>
                setForm((f) => ({ ...f, workosOrganizationId: e.target.value }))
              }
              placeholder="org_01HXZ…"
              value={form.workosOrganizationId}
            />
          </div>
          <div>
            <label className="mb-1 block font-medium text-sm">
              WorkOS Connection ID
            </label>
            <input
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              onChange={(e) =>
                setForm((f) => ({ ...f, workosConnectionId: e.target.value }))
              }
              placeholder="conn_01HXZ…"
              value={form.workosConnectionId}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block font-medium text-sm">
              IdP Metadata URL (optional)
            </label>
            <input
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              onChange={(e) =>
                setForm((f) => ({ ...f, idpMetadataUrl: e.target.value }))
              }
              placeholder="https://your-idp.com/saml/metadata"
              value={form.idpMetadataUrl}
            />
          </div>
        </div>
        {error && <p className="mt-3 text-destructive text-sm">{error}</p>}
        <button
          className="mt-4 rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50"
          disabled={saving}
          type="submit"
        >
          {saving ? "Saving…" : "Save configuration"}
        </button>
      </form>

      <div>
        <h2 className="mb-3 font-semibold text-lg">Configured Domains</h2>
        {configs.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No SSO domains configured yet.
          </p>
        ) : (
          <div className="space-y-3">
            {configs.map((config) => (
              <div
                className="flex items-start justify-between rounded-lg border p-4"
                key={config.id}
              >
                <div>
                  <p className="font-medium">{config.organizationName}</p>
                  <p className="text-muted-foreground text-sm">
                    @{config.emailDomain}
                  </p>
                  {config.workosOrganizationId && (
                    <p className="mt-1 font-mono text-muted-foreground text-xs">
                      Org: {config.workosOrganizationId}
                    </p>
                  )}
                </div>
                <button
                  className="ml-4 text-destructive text-sm hover:underline"
                  onClick={() => handleDelete(config.id)}
                  type="button"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 rounded-lg border bg-muted/30 p-4">
        <h3 className="mb-2 font-medium text-sm">Setup instructions</h3>
        <ol className="list-decimal space-y-1 pl-4 text-muted-foreground text-sm">
          <li>
            Create a WorkOS Organization and SAML/SSO connection in the WorkOS
            dashboard.
          </li>
          <li>Copy the Organization ID and Connection ID from WorkOS.</li>
          <li>
            Add your email domain above so users with that domain see "Sign in
            with SSO".
          </li>
          <li>
            Set the WorkOS callback URL in your IdP and WorkOS dashboard to:{" "}
            <code className="rounded bg-muted px-1 font-mono text-xs">
              {typeof window !== "undefined" ? window.location.origin : ""}
              /api/auth/workos/callback
            </code>
          </li>
        </ol>
      </div>
    </div>
  );
}
