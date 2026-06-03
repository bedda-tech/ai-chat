"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserMinus, Plus, Loader2, Users, CreditCard } from "lucide-react";
import { toast } from "sonner";

interface Team {
  id: string;
  name: string;
  ownerId: string;
  role: string;
  createdAt: string;
}

interface BillingInfo {
  seatLimit: number;
  memberCount: number;
  hasSubscription: boolean;
  billingPortalUrl: string | null;
}

interface TeamMember {
  userId: string;
  email: string;
  role: string;
  joinedAt: string;
}

interface PendingInvite {
  id: string;
  email: string;
  expiresAt: string;
}

export function TeamManagement({ userId }: { userId: string }) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTeamName, setNewTeamName] = useState("");
  const [creating, setCreating] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [pending, setPending] = useState<PendingInvite[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [loadingBilling, setLoadingBilling] = useState(false);
  const [upgradingBilling, setUpgradingBilling] = useState(false);

  useEffect(() => {
    fetch("/api/teams")
      .then((r) => r.json())
      .then((data) => setTeams(data.teams ?? []))
      .catch(() => toast.error("Failed to load teams"))
      .finally(() => setLoading(false));
  }, []);

  async function loadTeamMembers(team: Team) {
    setSelectedTeam(team);
    setBilling(null);
    setLoadingMembers(true);
    try {
      const r = await fetch(`/api/teams/${team.id}/members`);
      const data = await r.json();
      setMembers(data.members ?? []);
      setPending(data.pendingInvites ?? []);
    } catch {
      toast.error("Failed to load members");
    } finally {
      setLoadingMembers(false);
    }

    if (team.role === "admin") {
      setLoadingBilling(true);
      try {
        const r = await fetch(`/api/teams/${team.id}/billing`);
        if (r.ok) setBilling(await r.json());
      } catch {
        // Billing info is optional
      } finally {
        setLoadingBilling(false);
      }
    }
  }

  async function upgradeBilling() {
    if (!selectedTeam) return;
    setUpgradingBilling(true);
    try {
      const r = await fetch(`/api/teams/${selectedTeam.id}/billing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: members.length || 1 }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Failed to start billing");
      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start billing");
    } finally {
      setUpgradingBilling(false);
    }
  }

  async function createTeam() {
    if (!newTeamName.trim()) return;
    setCreating(true);
    try {
      const r = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTeamName.trim() }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Failed to create team");
      setTeams((prev) => [...prev, { ...data.team, role: "admin" }]);
      setNewTeamName("");
      toast.success("Team created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create team");
    } finally {
      setCreating(false);
    }
  }

  async function inviteMember() {
    if (!inviteEmail.trim() || !selectedTeam) return;
    setInviting(true);
    try {
      const r = await fetch(`/api/teams/${selectedTeam.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });
      const data = await r.json();
      if (!r.ok) {
        if (data.error === "seat_limit_reached") {
          toast.error(data.message ?? "Seat limit reached. Upgrade your plan to invite more members.");
        } else {
          throw new Error(data.error ?? "Failed to send invite");
        }
        return;
      }
      setPending((prev) => [...prev, data.invite]);
      setInviteEmail("");
      toast.success("Invitation sent");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send invite");
    } finally {
      setInviting(false);
    }
  }

  async function removeMember(memberId: string) {
    if (!selectedTeam) return;
    try {
      const r = await fetch(
        `/api/teams/${selectedTeam.id}/members?userId=${memberId}`,
        { method: "DELETE" }
      );
      if (!r.ok) throw new Error("Failed to remove member");
      setMembers((prev) => prev.filter((m) => m.userId !== memberId));
      toast.success("Member removed");
    } catch {
      toast.error("Failed to remove member");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading teams…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create team */}
      <div>
        <p className="mb-2 text-sm text-muted-foreground">Create a new team workspace</p>
        <div className="flex gap-2">
          <Input
            placeholder="Team name"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createTeam()}
            disabled={creating}
            className="max-w-xs"
          />
          <Button onClick={createTeam} disabled={creating || !newTeamName.trim()} size="sm">
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Create
          </Button>
        </div>
      </div>

      {/* Team list */}
      {teams.length === 0 ? (
        <p className="text-sm text-muted-foreground">You are not a member of any teams yet.</p>
      ) : (
        <div className="space-y-2">
          <p className="text-sm font-medium">Your teams</p>
          <div className="divide-y rounded-lg border">
            {teams.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 cursor-pointer"
                onClick={() => loadTeamMembers(t)}
              >
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">{t.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {t.role}
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" className="text-xs">
                  Manage
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team members panel */}
      {selectedTeam && (
        <div className="rounded-lg border p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm">{selectedTeam.name} — Members</h3>
            {selectedTeam.role === "admin" && (
              <div className="flex items-center gap-2">
                {loadingBilling ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : billing ? (
                  <>
                    <span className="text-xs text-muted-foreground">
                      {billing.memberCount}/{billing.seatLimit} seats
                    </span>
                    {billing.billingPortalUrl ? (
                      <a href={billing.billingPortalUrl} target="_blank" rel="noreferrer">
                        <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                          <CreditCard className="h-3 w-3" />
                          Manage billing
                        </Button>
                      </a>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={upgradeBilling}
                        disabled={upgradingBilling}
                      >
                        {upgradingBilling ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <CreditCard className="h-3 w-3" />
                        )}
                        Upgrade seats
                      </Button>
                    )}
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={upgradeBilling}
                    disabled={upgradingBilling}
                  >
                    {upgradingBilling ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <CreditCard className="h-3 w-3" />
                    )}
                    Upgrade seats
                  </Button>
                )}
              </div>
            )}
          </div>

          {loadingMembers ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading…
            </div>
          ) : (
            <>
              <div className="divide-y rounded border">
                {members.map((m) => (
                  <div key={m.userId} className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{m.email}</span>
                      <Badge variant="outline" className="text-xs">{m.role}</Badge>
                    </div>
                    {m.userId !== userId && selectedTeam.role === "admin" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        onClick={() => removeMember(m.userId)}
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {pending.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Pending invites
                  </p>
                  <div className="divide-y rounded border">
                    {pending.map((inv) => (
                      <div key={inv.id} className="flex items-center justify-between px-3 py-2">
                        <span className="text-sm text-muted-foreground">{inv.email}</span>
                        <Badge variant="secondary" className="text-xs">Pending</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTeam.role === "admin" && (
                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Invite by email
                  </p>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="colleague@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && inviteMember()}
                      disabled={inviting}
                      className="max-w-xs"
                    />
                    <Button
                      onClick={inviteMember}
                      disabled={inviting || !inviteEmail.trim()}
                      size="sm"
                    >
                      {inviting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      Invite
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
