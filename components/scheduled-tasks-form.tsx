"use client";

import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

type Schedule = {
  id: string;
  prompt: string;
  dayOfWeek: number;
  hour: number;
  timezone: string;
  enabled: boolean;
  nextRunAt: string;
  lastRunAt: string | null;
  lastChatId: string | null;
  lastError: string | null;
};

const DAYS = [
  { value: -1, label: "Every day" },
  { value: 1, label: "Every Monday" },
  { value: 2, label: "Every Tuesday" },
  { value: 3, label: "Every Wednesday" },
  { value: 4, label: "Every Thursday" },
  { value: 5, label: "Every Friday" },
  { value: 6, label: "Every Saturday" },
  { value: 0, label: "Every Sunday" },
];

function describe(s: Schedule) {
  const day = DAYS.find((d) => d.value === s.dayOfWeek)?.label ?? "";
  return `${day} at ${String(s.hour).padStart(2, "0")}:00 (${s.timezone})`;
}

export function ScheduledTasksForm({
  initialPrompt = "",
}: {
  initialPrompt?: string;
}) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [paid, setPaid] = useState(true);
  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [hour, setHour] = useState(9);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/schedules");
      if (res.ok) {
        const data = await res.json();
        setSchedules(data.schedules);
        setPaid(data.paid);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function create() {
    setSaving(true);
    try {
      const timezone =
        Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, dayOfWeek, hour, timezone }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not save schedule");
        return;
      }
      setPrompt("");
      toast.success("Schedule saved");
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function toggle(id: string, enabled: boolean) {
    const res = await fetch("/api/schedules", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, enabled }),
    });
    if (!res.ok) {
      toast.error((await res.json()).error ?? "Could not update");
    }
    await load();
  }

  async function remove(id: string) {
    await fetch("/api/schedules", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await load();
  }

  if (loading) {
    return <p className="text-muted-foreground text-sm">Loading…</p>;
  }

  return (
    <div className="space-y-4" data-testid="scheduled-tasks">
      <p className="text-muted-foreground text-sm">
        Run a prompt on a schedule. Each run lands in a new chat and is emailed
        to you.
      </p>
      {paid ? (
        <div className="space-y-3 rounded-md border p-3">
          <textarea
            className="min-h-20 w-full rounded-md border bg-background p-2 text-sm"
            data-testid="schedule-prompt"
            maxLength={4000}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Summarise the most important AI news from last week"
            value={prompt}
          />
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="rounded-md border bg-background p-2 text-sm"
              data-testid="schedule-day"
              onChange={(e) => setDayOfWeek(Number(e.target.value))}
              value={dayOfWeek}
            >
              {DAYS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
            <select
              className="rounded-md border bg-background p-2 text-sm"
              data-testid="schedule-hour"
              onChange={(e) => setHour(Number(e.target.value))}
              value={hour}
            >
              {Array.from({ length: 24 }, (_, h) => (
                <option key={h} value={h}>
                  {String(h).padStart(2, "0")}:00
                </option>
              ))}
            </select>
            <Button
              data-testid="schedule-save"
              disabled={saving || prompt.trim().length < 3}
              onClick={create}
              size="sm"
            >
              Save schedule
            </Button>
          </div>
        </div>
      ) : (
        <p className="rounded-md border p-3 text-sm">
          Scheduled tasks are available on paid plans.{" "}
          <Link className="underline" href="/upgrade">
            Upgrade
          </Link>
        </p>
      )}

      {schedules.map((s) => (
        <div
          className="flex items-start justify-between gap-3 rounded-md border p-3"
          data-testid="schedule-item"
          key={s.id}
        >
          <div className="min-w-0 space-y-1">
            <p className="truncate font-medium text-sm">{s.prompt}</p>
            <p className="text-muted-foreground text-xs">
              {describe(s)} · next {new Date(s.nextRunAt).toLocaleString()}
            </p>
            {s.lastChatId && (
              <Link
                className="text-xs underline"
                href={`/chat/${s.lastChatId}`}
              >
                Last result
              </Link>
            )}
            {s.lastError && (
              <p className="text-destructive text-xs">{s.lastError}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={s.enabled}
              onCheckedChange={(v) => toggle(s.id, v)}
            />
            <Button
              aria-label="Delete schedule"
              onClick={() => remove(s.id)}
              size="icon"
              variant="ghost"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
