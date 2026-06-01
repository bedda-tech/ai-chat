"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Team = { id: string; name: string };

export function ShareToTeamButton({ chatId }: { chatId: string }) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [sharedTeamIds, setSharedTeamIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/teams");
        if (!res.ok) return;
        const data = await res.json();
        const userTeams: Team[] = data.teams ?? [];
        if (cancelled) return;
        setTeams(userTeams);

        const shared = new Set<string>();
        await Promise.all(
          userTeams.map(async (t) => {
            const r = await fetch(`/api/teams/${t.id}/chats`);
            if (!r.ok) return;
            const d = await r.json();
            if ((d.chats ?? []).some((c: { chatId: string }) => c.chatId === chatId)) {
              shared.add(t.id);
            }
          })
        );
        if (!cancelled) setSharedTeamIds(shared);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [chatId]);

  async function toggle(teamId: string) {
    const isShared = sharedTeamIds.has(teamId);
    const method = isShared ? "DELETE" : "POST";
    const res = await fetch(`/api/teams/${teamId}/chats`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId }),
    });
    if (res.ok) {
      setSharedTeamIds((prev) => {
        const next = new Set(prev);
        if (isShared) next.delete(teamId);
        else next.add(teamId);
        return next;
      });
    }
  }

  if (loading || teams.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline">
          <svg
            className="mr-1.5 size-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            viewBox="0 0 24 24"
          >
            <path
              d="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Share to team</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {teams.map((t) => (
          <DropdownMenuItem
            key={t.id}
            className="flex items-center gap-2 cursor-pointer"
            onSelect={(e) => {
              e.preventDefault();
              toggle(t.id);
            }}
          >
            <span
              className={`size-2 rounded-full ${sharedTeamIds.has(t.id) ? "bg-green-500" : "bg-muted-foreground/30"}`}
            />
            {t.name}
            {sharedTeamIds.has(t.id) && (
              <span className="ml-auto text-xs text-muted-foreground">
                Shared
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
