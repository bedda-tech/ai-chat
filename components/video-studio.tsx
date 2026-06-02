"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

const ASPECT_RATIOS = [
  { value: "16:9", label: "Landscape (16:9)" },
  { value: "9:16", label: "Portrait (9:16)" },
  { value: "1:1", label: "Square (1:1)" },
] as const;

const DURATIONS = [
  { value: 5, label: "5 seconds" },
  { value: 10, label: "10 seconds" },
] as const;

type JobStatus = "idle" | "submitting" | "processing" | "completed" | "failed";

export function VideoStudio() {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [duration, setDuration] = useState(5);
  const [jobStatus, setJobStatus] = useState<JobStatus>("idle");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [upgradeRequired, setUpgradeRequired] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const requestIdRef = useRef<string | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => () => stopPolling(), [stopPolling]);

  const pollStatus = useCallback(async (requestId: string) => {
    try {
      const res = await fetch(`/api/studio/video?id=${encodeURIComponent(requestId)}`);
      const data = await res.json();

      if (data.status === "completed") {
        stopPolling();
        setVideoUrl(data.videoUrl);
        setJobStatus("completed");
      } else if (data.status === "failed") {
        stopPolling();
        setError(data.error ?? "Generation failed");
        setJobStatus("failed");
      }
    } catch {
      // Transient network error — keep polling
    }
  }, [stopPolling]);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || jobStatus === "submitting" || jobStatus === "processing") return;

    setJobStatus("submitting");
    setError(null);
    setVideoUrl(null);
    setUpgradeRequired(false);

    try {
      const res = await fetch("/api/studio/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), duration, aspectRatio }),
      });

      if (res.status === 403) {
        setUpgradeRequired(true);
        setJobStatus("idle");
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Submission failed. Please try again.");
        setJobStatus("failed");
        return;
      }

      const { requestId } = await res.json();
      requestIdRef.current = requestId;
      setJobStatus("processing");

      // Poll every 4 seconds
      pollRef.current = setInterval(() => {
        pollStatus(requestId);
      }, 4000);
    } catch {
      setError("Network error. Please try again.");
      setJobStatus("failed");
    }
  }, [prompt, duration, aspectRatio, jobStatus, pollStatus]);

  const handleDownload = useCallback(() => {
    if (!videoUrl) return;
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `bedda-video-${Date.now()}.mp4`;
    a.target = "_blank";
    a.click();
  }, [videoUrl]);

  const isGenerating = jobStatus === "submitting" || jobStatus === "processing";

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <div className="shrink-0 border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold">Video Studio</h1>
            <p className="text-xs text-muted-foreground">
              Generate videos with Kling AI — powered by fal.ai
            </p>
          </div>
          <Link
            href="/studio"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Image Studio →
          </Link>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 overflow-auto">
        <div className="flex w-full flex-col gap-6 p-4 md:flex-row">
          {/* Controls panel */}
          <div className="w-full shrink-0 space-y-4 md:w-64">
            <div>
              <p className="mb-2 text-xs font-medium text-foreground">Duration</p>
              <div className="space-y-1">
                {DURATIONS.map((d) => (
                  <label
                    key={d.value}
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-2 py-1.5 transition-colors hover:bg-accent/40"
                  >
                    <input
                      type="radio"
                      name="duration"
                      value={d.value}
                      checked={duration === d.value}
                      onChange={() => setDuration(d.value)}
                      className="h-3.5 w-3.5"
                    />
                    <span className="text-xs">{d.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-foreground">Aspect Ratio</p>
              <div className="space-y-1">
                {ASPECT_RATIOS.map((r) => (
                  <label
                    key={r.value}
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-2 py-1.5 transition-colors hover:bg-accent/40"
                  >
                    <input
                      type="radio"
                      name="aspectRatio"
                      value={r.value}
                      checked={aspectRatio === r.value}
                      onChange={() => setAspectRatio(r.value)}
                      className="h-3.5 w-3.5"
                    />
                    <span className="text-xs">{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-xs font-medium text-foreground">Prompt</p>
              <Textarea
                className="min-h-[100px] resize-none text-xs"
                placeholder="Describe the video you want to generate…"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={5}
                disabled={isGenerating}
              />
            </div>

            <Button
              className="w-full"
              disabled={!prompt.trim() || isGenerating}
              onClick={handleGenerate}
              size="sm"
            >
              {jobStatus === "submitting"
                ? "Submitting…"
                : jobStatus === "processing"
                  ? "Generating… (1-3 min)"
                  : "Generate"}
            </Button>

            {upgradeRequired && (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-800 dark:bg-amber-950/20">
                <p className="text-xs font-medium text-amber-800 dark:text-amber-400">
                  Paid plan required
                </p>
                <p className="mt-0.5 text-[10px] text-amber-700 dark:text-amber-500">
                  Video generation is available on Plus and above.
                </p>
                <Link
                  href="/upgrade"
                  className="mt-1.5 inline-block text-[10px] font-medium text-amber-800 underline dark:text-amber-400"
                >
                  Upgrade →
                </Link>
              </div>
            )}

            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </p>
            )}
          </div>

          {/* Result area */}
          <div className="min-w-0 flex-1">
            {jobStatus === "idle" && !videoUrl && (
              <div className="flex h-full min-h-[200px] items-center justify-center text-sm text-muted-foreground">
                Enter a prompt and click Generate
              </div>
            )}

            {isGenerating && (
              <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
                <svg className="h-6 w-6 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                <span>
                  {jobStatus === "submitting" ? "Submitting job…" : "Generating video…"}
                </span>
                <span className="text-xs text-muted-foreground/70">
                  Video generation typically takes 1-3 minutes
                </span>
              </div>
            )}

            {jobStatus === "completed" && videoUrl && (
              <div className="space-y-3">
                <div className="overflow-hidden rounded-lg border border-border bg-card">
                  <div className="flex items-center justify-between border-b border-border px-3 py-2">
                    <span className="text-xs font-medium">Kling AI — Generated Video</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 gap-1 px-2 text-[10px]"
                      onClick={handleDownload}
                    >
                      <svg
                        fill="none"
                        height="12"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                        width="12"
                      >
                        <path
                          d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Download
                    </Button>
                  </div>
                  <video
                    src={videoUrl}
                    controls
                    className="w-full"
                    playsInline
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setJobStatus("idle");
                    setVideoUrl(null);
                  }}
                >
                  Generate Another
                </Button>
              </div>
            )}

            {jobStatus === "failed" && (
              <div className="flex h-full min-h-[200px] items-center justify-center">
                <div className="text-center">
                  <p className="text-sm text-destructive">Generation failed</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => setJobStatus("idle")}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
