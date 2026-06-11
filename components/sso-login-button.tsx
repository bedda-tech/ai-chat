"use client"

import { useState } from "react"

export function SsoLoginButton() {
  const [showInput, setShowInput] = useState(false)
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  function handleContinue(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    window.location.href = `/api/auth/sso?email=${encodeURIComponent(email)}`
  }

  if (!showInput) {
    return (
      <button
        type="button"
        onClick={() => setShowInput(true)}
        className="flex w-full items-center justify-center gap-2 rounded-md border px-4 py-2 font-medium text-sm transition-colors hover:bg-muted"
      >
        Sign in with SSO
      </button>
    )
  }

  return (
    <form onSubmit={handleContinue} className="flex w-full flex-col gap-2">
      <input
        type="email"
        autoFocus
        placeholder="Work email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? "Redirecting…" : "Continue with SSO"}
        </button>
        <button
          type="button"
          onClick={() => { setShowInput(false); setEmail("") }}
          className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
