"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const QUALITY_OPTIONS = [
  { value: "standard", label: "Standard", detail: "720p" },
  { value: "pro", label: "Pro", detail: "1080p" },
] as const;

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
type Mode = "text" | "image";
type Quality = "standard" | "pro";

type HistoryJob = {
  id: string;
  prompt: string;
  videoUrl: string | null;
  status: string;
  createdAt: string;
  mode: string;
};

export function VideoStudio() {
  const [mode, setMode] = useState<Mode>("text");
  const [quality, setQuality] = useState<Quality>("standard");
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [duration, setDuration] = useState(5);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus>("idle");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [upgradeRequired, setUpgradeRequired] = useState(false);
  const [history, setHistory] = useState<HistoryJob[]>([]);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const requestIdRef = useRef<string | null>(null);
  const appIdRef = useRef<string | null>(null);
  const jobIdRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => () => stopPolling(), [stopPolling]);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/studio/video/history");
      if (!res.ok) {
        return;
      }
      const data = await res.json();
      setHistory(data.jobs ?? []);
    } catch {
      // Non-critical; ignore errors
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const pollStatus = useCallback(
    async (requestId: string, appId: string) => {
      try {
        const jobId = jobIdRef.current;
        const params = new URLSearchParams({ id: requestId, appId });
        if (jobId) {
          params.set("jobId", jobId);
        }
        const res = await fetch(`/api/studio/video?${params.toString()}`);
        const data = await res.json();

        if (data.status === "completed") {
          stopPolling();
          setVideoUrl(data.videoUrl);
          setJobStatus("completed");
          fetchHistory();
        } else if (data.status === "failed") {
          stopPolling();
          setError(data.error ?? "Generation failed");
          setJobStatus("failed");
          fetchHistory();
        }
      } catch {
        // Transient network error — keep polling
      }
    },
    [stopPolling, fetchHistory]
  );

  const handleImageUpload = useCallback(async (file: File) => {
    setImageError(null);
    setImageUploading(true);
    setImageUrl(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setImageError(data.error ?? "Upload failed");
        return;
      }
      const data = await res.json();
      setImageUrl(data.url);
    } catch {
      setImageError("Network error during upload");
    } finally {
      setImageUploading(false);
    }
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleImageUpload(file);
      }
    },
    [handleImageUpload]
  );

  const handleGenerate = useCallback(async () => {
    const busy = jobStatus === "submitting" || jobStatus === "processing";
    if (!prompt.trim() || busy) {
      return;
    }
    if (mode === "image" && !imageUrl) {
      return;
    }

    setJobStatus("submitting");
    setError(null);
    setVideoUrl(null);
    setUpgradeRequired(false);

    try {
      const res = await fetch("/api/studio/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          duration,
          aspectRatio,
          quality,
          ...(mode === "image" && imageUrl ? { imageUrl } : {}),
        }),
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

      const { requestId, appId, jobId } = await res.json();
      requestIdRef.current = requestId;
      appIdRef.current = appId;
      jobIdRef.current = jobId ?? null;
      setJobStatus("processing");

      pollRef.current = setInterval(() => {
        pollStatus(requestId, appId);
      }, 4000);
    } catch {
      setError("Network error. Please try again.");
      setJobStatus("failed");
    }
  }, [
    prompt,
    duration,
    aspectRatio,
    quality,
    mode,
    imageUrl,
    jobStatus,
    pollStatus,
  ]);

  const handleDownload = useCallback(() => {
    if (!videoUrl) {
      return;
    }
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `bedda-video-${Date.now()}.mp4`;
    a.target = "_blank";
    a.click();
  }, [videoUrl]);

  const handleModeChange = useCallback((newMode: Mode) => {
    setMode(newMode);
    setImageUrl(null);
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const isGenerating = jobStatus === "submitting" || jobStatus === "processing";
  const canGenerate =
    prompt.trim() && !isGenerating && (mode === "text" || !!imageUrl);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <div className="shrink-0 border-border border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-sm">Video Studio</h1>
            <p className="text-muted-foreground text-xs">
              Generate videos with Kling AI — powered by fal.ai
            </p>
          </div>
          <Link
            className="text-muted-foreground text-xs transition-colors hover:text-foreground"
            href="/studio"
          >
            Image Studio →
          </Link>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 overflow-auto">
        <div className="flex w-full flex-col gap-6 p-4 md:flex-row">
          {/* Controls panel */}
          <div className="w-full shrink-0 space-y-4 md:w-64">
            {/* Mode toggle */}
            <div>
              <p className="mb-2 font-medium text-foreground text-xs">Mode</p>
              <div className="flex gap-1 rounded-md border border-border p-0.5">
                {(["text", "image"] as const).map((m) => (
                  <button
                    className={`flex-1 rounded px-2 py-1 font-medium text-xs transition-colors ${
                      mode === m
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    disabled={isGenerating}
                    key={m}
                    onClick={() => handleModeChange(m)}
                    type="button"
                  >
                    {m === "text" ? "Text to Video" : "Image to Video"}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality toggle */}
            <div>
              <p className="mb-2 font-medium text-foreground text-xs">
                Quality
              </p>
              <div className="flex gap-1 rounded-md border border-border p-0.5">
                {QUALITY_OPTIONS.map((q) => (
                  <button
                    className={`flex-1 rounded px-2 py-1 font-medium text-xs transition-colors ${
                      quality === q.value
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    disabled={isGenerating}
                    key={q.value}
                    onClick={() => setQuality(q.value)}
                    type="button"
                  >
                    {q.label} <span className="opacity-70">{q.detail}</span>
                  </button>
                ))}
              </div>
              {quality === "pro" && (
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Pro renders at 1080p and takes longer to generate.
                </p>
              )}
            </div>

            {/* Image upload (image mode only) */}
            {mode === "image" && (
              <div>
                <p className="mb-1.5 font-medium text-foreground text-xs">
                  Source Image
                </p>
                <input
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  disabled={isGenerating}
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  type="file"
                />
                {imageUrl ? (
                  <div className="space-y-2">
                    <div className="relative overflow-hidden rounded-md border border-border">
                      <Image
                        alt="Source image"
                        className="w-full object-cover"
                        height={144}
                        src={imageUrl}
                        unoptimized
                        width={256}
                      />
                    </div>
                    <Button
                      className="w-full text-xs"
                      disabled={isGenerating}
                      onClick={() => {
                        setImageUrl(null);
                        setImageError(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                      size="sm"
                      variant="outline"
                    >
                      Change Image
                    </Button>
                  </div>
                ) : (
                  <button
                    className="flex w-full flex-col items-center justify-center gap-1.5 rounded-md border border-border border-dashed bg-muted/30 px-3 py-6 text-muted-foreground text-xs transition-colors hover:bg-muted/50 disabled:opacity-50"
                    disabled={isGenerating || imageUploading}
                    onClick={() => fileInputRef.current?.click()}
                    type="button"
                  >
                    {imageUploading ? (
                      <span>Uploading…</span>
                    ) : (
                      <>
                        <svg
                          fill="none"
                          height="20"
                          stroke="currentColor"
                          strokeWidth={1.5}
                          viewBox="0 0 24 24"
                          width="20"
                        >
                          <path
                            d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span>Click to upload image</span>
                        <span className="text-[10px]">
                          JPEG, PNG, WebP, GIF
                        </span>
                      </>
                    )}
                  </button>
                )}
                {imageError && (
                  <p className="mt-1 text-[10px] text-destructive">
                    {imageError}
                  </p>
                )}
              </div>
            )}

            <div>
              <p className="mb-2 font-medium text-foreground text-xs">
                Duration
              </p>
              <div className="space-y-1">
                {DURATIONS.map((d) => (
                  <label
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-2 py-1.5 transition-colors hover:bg-accent/40"
                    key={d.value}
                  >
                    <input
                      checked={duration === d.value}
                      className="h-3.5 w-3.5"
                      name="duration"
                      onChange={() => setDuration(d.value)}
                      type="radio"
                      value={d.value}
                    />
                    <span className="text-xs">{d.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 font-medium text-foreground text-xs">
                Aspect Ratio
              </p>
              <div className="space-y-1">
                {ASPECT_RATIOS.map((r) => (
                  <label
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-2 py-1.5 transition-colors hover:bg-accent/40"
                    key={r.value}
                  >
                    <input
                      checked={aspectRatio === r.value}
                      className="h-3.5 w-3.5"
                      name="aspectRatio"
                      onChange={() => setAspectRatio(r.value)}
                      type="radio"
                      value={r.value}
                    />
                    <span className="text-xs">{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1.5 font-medium text-foreground text-xs">
                Prompt
              </p>
              <Textarea
                className="min-h-[100px] resize-none text-xs"
                disabled={isGenerating}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  mode === "image"
                    ? "Describe the motion or animation…"
                    : "Describe the video you want to generate…"
                }
                rows={5}
                value={prompt}
              />
            </div>

            <Button
              className="w-full"
              disabled={!canGenerate}
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
                <p className="font-medium text-amber-800 text-xs dark:text-amber-400">
                  Paid plan required
                </p>
                <p className="mt-0.5 text-[10px] text-amber-700 dark:text-amber-500">
                  Video generation is available on Plus and above.
                </p>
                <Link
                  className="mt-1.5 inline-block font-medium text-[10px] text-amber-800 underline dark:text-amber-400"
                  href="/upgrade"
                >
                  Upgrade →
                </Link>
              </div>
            )}

            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-destructive text-xs">
                {error}
              </p>
            )}
          </div>

          {/* Result area + gallery */}
          <div className="min-w-0 flex-1 space-y-6">
            {jobStatus === "idle" && !videoUrl && (
              <div className="flex h-full min-h-[200px] items-center justify-center text-muted-foreground text-sm">
                {mode === "image" && !imageUrl
                  ? "Upload an image and enter a prompt to animate it"
                  : "Enter a prompt and click Generate"}
              </div>
            )}

            {isGenerating && (
              <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-3 text-muted-foreground text-sm">
                <svg
                  className="h-6 w-6 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
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
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    fill="currentColor"
                  />
                </svg>
                <span>
                  {jobStatus === "submitting"
                    ? "Submitting job…"
                    : "Generating video…"}
                </span>
                <span className="text-muted-foreground/70 text-xs">
                  Video generation typically takes 1-3 minutes
                </span>
              </div>
            )}

            {jobStatus === "completed" && videoUrl && (
              <div className="space-y-3">
                <div className="overflow-hidden rounded-lg border border-border bg-card">
                  <div className="flex items-center justify-between border-border border-b px-3 py-2">
                    <span className="font-medium text-xs">
                      Kling AI — Generated Video
                    </span>
                    <Button
                      className="h-6 gap-1 px-2 text-[10px]"
                      onClick={handleDownload}
                      size="sm"
                      variant="ghost"
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
                    className="w-full"
                    controls
                    playsInline
                    src={videoUrl}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    setJobStatus("idle");
                    setVideoUrl(null);
                  }}
                  size="sm"
                  variant="outline"
                >
                  Generate Another
                </Button>
              </div>
            )}

            {jobStatus === "failed" && (
              <div className="flex h-full min-h-[200px] items-center justify-center">
                <div className="text-center">
                  <p className="text-destructive text-sm">Generation failed</p>
                  <Button
                    className="mt-3"
                    onClick={() => setJobStatus("idle")}
                    size="sm"
                    variant="outline"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            )}

            {/* Video gallery */}
            {history.length > 0 && (
              <div>
                <h2 className="mb-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                  Recent Videos
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {history.map((job) => (
                    <div
                      className="overflow-hidden rounded-lg border border-border bg-card"
                      key={job.id}
                    >
                      {job.videoUrl ? (
                        <video
                          className="aspect-video w-full object-cover"
                          loop
                          muted
                          onMouseEnter={(e) =>
                            (e.currentTarget as HTMLVideoElement).play()
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget as HTMLVideoElement).pause()
                          }
                          playsInline
                          src={job.videoUrl}
                        />
                      ) : (
                        <div className="flex aspect-video w-full items-center justify-center bg-muted text-muted-foreground text-xs">
                          {job.status === "processing"
                            ? "Processing…"
                            : "Failed"}
                        </div>
                      )}
                      <div className="p-2">
                        <p className="line-clamp-2 text-[11px] text-foreground leading-snug">
                          {job.prompt}
                        </p>
                        <div className="mt-1.5 flex items-center justify-between gap-2">
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(job.createdAt).toLocaleDateString()}
                          </span>
                          {job.videoUrl && (
                            <a
                              className="font-medium text-[10px] text-primary underline-offset-2 hover:underline"
                              download
                              href={job.videoUrl}
                              rel="noopener noreferrer"
                              target="_blank"
                            >
                              Download
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
