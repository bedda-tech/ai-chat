"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { TryColumn } from "@/components/try-column";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FREE_PROVIDER_MODEL_IDS } from "@/lib/ai/entitlements";
import modelsData from "@/lib/ai/models-data.json" with { type: "json" };

type PendingSubmit = {
  text: string;
  version: number;
};

const PROVIDER_COLORS: Record<string, string> = {
  google: "text-blue-500",
  deepseek: "text-indigo-500",
  groq: "text-yellow-500",
};

// The 3 free-tier models shown in the no-account trial funnel.
// Sourced from FREE_PROVIDER_MODEL_IDS (guest entitlements) — genuinely free
// provider APIs, no metered cost to Bedda.
const TRY_MODEL_IDS = FREE_PROVIDER_MODEL_IDS.filter((id) =>
  [
    "google-gemini-2.5-flash",
    "deepseek-deepseek-r1",
    "groq-llama-4-scout-17b-16e-instruct",
  ].includes(id)
);

const TRY_MODELS = TRY_MODEL_IDS.map((id) => {
  const data = modelsData.models.find((m) => m.id === id);
  return {
    id,
    name: data?.name ?? id,
    provider: data?.provider ?? id.split("-")[0],
  };
});

const TERMINAL_STATUSES = new Set(["ready", "error"]);

export default function TryPage() {
  const [input, setInput] = useState("");
  const [pendingSubmit, setPendingSubmit] = useState<PendingSubmit>({
    text: "",
    version: 0,
  });
  const [columnStatuses, setColumnStatuses] = useState<Record<string, string>>(
    {}
  );

  const handleStatusChange = useCallback((modelId: string, status: string) => {
    setColumnStatuses((prev) =>
      prev[modelId] === status ? prev : { ...prev, [modelId]: status }
    );
  }, []);

  const handleSubmit = useCallback(() => {
    const text = input.trim();
    if (!text || pendingSubmit.version > 0) {
      return;
    }
    setPendingSubmit((prev) => ({ text, version: prev.version + 1 }));
    setInput("");
  }, [input, pendingSubmit.version]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const hasSubmitted = pendingSubmit.version > 0;
  const allSettled = useMemo(
    () =>
      hasSubmitted &&
      TRY_MODELS.every((m) => TERMINAL_STATUSES.has(columnStatuses[m.id])),
    [hasSubmitted, columnStatuses]
  );

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <div className="flex shrink-0 flex-col gap-1 border-border border-b px-4 py-3 text-center">
        <h1 className="font-semibold text-lg">
          Try 3 AI models side-by-side — no account needed
        </h1>
        <p className="text-muted-foreground text-sm">
          Send one message and compare Gemini, DeepSeek, and Llama in real time.
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto md:flex-row md:divide-x md:divide-border">
        {TRY_MODELS.map((model) => (
          <TryColumn
            key={model.id}
            modelId={model.id}
            modelName={model.name}
            onStatusChange={handleStatusChange}
            pendingSubmit={pendingSubmit}
            providerColorClass={
              PROVIDER_COLORS[model.provider] ?? "text-foreground"
            }
          />
        ))}
      </div>

      <div className="relative shrink-0 border-border border-t bg-background px-4 py-3">
        {allSettled && (
          <div className="-top-px absolute inset-x-0 flex translate-y-[-100%] justify-center pb-3">
            <div className="mx-4 flex max-w-md flex-col items-center gap-2 rounded-xl border bg-background/95 px-5 py-4 text-center shadow-lg backdrop-blur">
              <p className="font-medium text-sm">
                Like what you see? Create a free account to keep chatting.
              </p>
              <Button asChild className="gap-1.5" size="sm">
                <Link href="/register">
                  Create a free account
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        )}
        <div className="mx-auto flex max-w-4xl items-end gap-2">
          <Textarea
            className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl text-sm"
            disabled={hasSubmitted}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              hasSubmitted
                ? "Sign up to send another message"
                : "Ask all three models the same question…"
            }
            rows={1}
            value={input}
          />
          <Button
            className="h-11 shrink-0 px-4"
            disabled={!input.trim() || hasSubmitted}
            onClick={handleSubmit}
            size="sm"
          >
            Send
          </Button>
        </div>
        <p className="mt-1.5 text-center text-muted-foreground text-xs">
          {hasSubmitted
            ? "One free message per visit — create an account to continue."
            : "Press Enter to send · Shift+Enter for new line"}
        </p>
      </div>
    </div>
  );
}
