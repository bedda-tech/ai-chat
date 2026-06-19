"use client";

import { useState } from "react";

export function SsoLoginButton() {
  const [showInput, setShowInput] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    window.location.href = `/api/auth/sso?email=${encodeURIComponent(email)}`;
  }

  if (!showInput) {
    return (
      <button
        className="flex w-full items-center justify-center gap-2 rounded-md border px-4 py-2 font-medium text-sm transition-colors hover:bg-muted"
        onClick={() => setShowInput(true)}
        type="button"
      >
        Sign in with SSO
      </button>
    );
  }

  return (
    <form className="flex w-full flex-col gap-2" onSubmit={handleContinue}>
      <input
        autoFocus
        className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Work email address"
        required
        type="email"
        value={email}
      />
      <div className="flex gap-2">
        <button
          className="flex-1 rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50"
          disabled={loading}
          type="submit"
        >
          {loading ? "Redirecting…" : "Continue with SSO"}
        </button>
        <button
          className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
          onClick={() => {
            setShowInput(false);
            setEmail("");
          }}
          type="button"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
