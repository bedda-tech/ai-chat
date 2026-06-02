"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

const IMAGE_MODELS = [
  { key: "dalle3", label: "DALL-E 3", description: "OpenAI — photorealistic" },
  { key: "imagen3", label: "Imagen 3 Fast", description: "Google — fast generation" },
  { key: "flux", label: "Flux 1.1 Pro", description: "Black Forest Labs — artistic" },
] as const;

const ASPECT_RATIOS = [
  { value: "1:1", label: "Square (1:1)" },
  { value: "16:9", label: "Landscape (16:9)" },
  { value: "9:16", label: "Portrait (9:16)" },
] as const;

interface GenerationResult {
  modelKey: string;
  label: string;
  success: boolean;
  base64?: string;
  mediaType?: string;
  error?: string;
}

export function ImageStudio() {
  const [selectedModels, setSelectedModels] = useState<string[]>(["dalle3"]);
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const toggleModel = useCallback((key: string) => {
    setSelectedModels((prev) =>
      prev.includes(key) ? prev.filter((m) => m !== key) : [...prev, key]
    );
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || selectedModels.length === 0 || loading) return;
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const res = await fetch("/api/studio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          models: selectedModels,
          prompt: prompt.trim(),
          negativePrompt: negativePrompt.trim() || undefined,
          aspectRatio,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.cause ?? data.error ?? "Generation failed. Please try again.");
        return;
      }

      const data = await res.json();
      setResults(data.results ?? []);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [prompt, negativePrompt, aspectRatio, selectedModels, loading]);

  const handleDownload = useCallback((base64: string, label: string) => {
    const a = document.createElement("a");
    a.href = `data:image/png;base64,${base64}`;
    a.download = `${label.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.png`;
    a.click();
  }, []);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <div className="shrink-0 border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold">Image Studio</h1>
            <p className="text-xs text-muted-foreground">
              Generate images with DALL-E 3, Imagen 3, and Flux 1.1 Pro side-by-side
            </p>
          </div>
          <Link
            href="/studio/video"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Video Studio →
          </Link>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 overflow-auto">
        <div className="flex w-full flex-col gap-6 p-4 md:flex-row">
          {/* Controls panel */}
          <div className="w-full shrink-0 space-y-4 md:w-64">
            <div>
              <p className="mb-2 text-xs font-medium text-foreground">Models</p>
              <div className="space-y-1.5">
                {IMAGE_MODELS.map((m) => (
                  <label
                    key={m.key}
                    className="flex cursor-pointer items-start gap-2 rounded-md border border-border p-2 transition-colors hover:bg-accent/40"
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 h-3.5 w-3.5 shrink-0"
                      checked={selectedModels.includes(m.key)}
                      onChange={() => toggleModel(m.key)}
                    />
                    <div>
                      <p className="text-xs font-medium">{m.label}</p>
                      <p className="text-[10px] text-muted-foreground">{m.description}</p>
                    </div>
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
                className="min-h-[80px] resize-none text-xs"
                placeholder="Describe the image you want to generate…"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
              />
            </div>

            <div>
              <p className="mb-1.5 text-xs font-medium text-foreground">
                Negative Prompt{" "}
                <span className="font-normal text-muted-foreground">(optional)</span>
              </p>
              <Textarea
                className="min-h-[56px] resize-none text-xs"
                placeholder="What to avoid in the image…"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                rows={2}
              />
              <p className="mt-1 text-[10px] text-muted-foreground">
                Supported by Imagen 3 and Flux. Ignored by DALL-E 3.
              </p>
            </div>

            <Button
              className="w-full"
              disabled={!prompt.trim() || selectedModels.length === 0 || loading}
              onClick={handleGenerate}
              size="sm"
            >
              {loading ? "Generating…" : "Generate"}
            </Button>

            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </p>
            )}
          </div>

          {/* Results grid */}
          <div className="min-w-0 flex-1">
            {results.length === 0 && !loading && (
              <div className="flex h-full min-h-[200px] items-center justify-center text-sm text-muted-foreground">
                Select models, enter a prompt, and click Generate
              </div>
            )}

            {loading && (
              <div className="flex h-full min-h-[200px] items-center justify-center gap-2 text-sm text-muted-foreground">
                <svg
                  className="h-4 w-4 animate-spin"
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
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Generating with {selectedModels.length} model
                {selectedModels.length !== 1 ? "s" : ""}…
              </div>
            )}

            {results.length > 0 && (
              <div
                className={`grid gap-4 ${
                  results.length === 1
                    ? "grid-cols-1 max-w-lg"
                    : results.length === 2
                      ? "grid-cols-1 sm:grid-cols-2"
                      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                }`}
              >
                {results.map((result) => (
                  <div
                    key={result.modelKey}
                    className="overflow-hidden rounded-lg border border-border bg-card"
                  >
                    <div className="flex items-center justify-between border-b border-border px-3 py-2">
                      <span className="text-xs font-medium">{result.label}</span>
                      {result.success && result.base64 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 gap-1 px-2 text-[10px]"
                          onClick={() => handleDownload(result.base64!, result.label)}
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
                      )}
                    </div>

                    {result.success && result.base64 ? (
                      <img
                        src={`data:image/png;base64,${result.base64}`}
                        alt={`Generated by ${result.label}`}
                        className="w-full object-contain"
                      />
                    ) : (
                      <div className="flex min-h-[120px] items-center justify-center p-4">
                        <p className="text-center text-xs text-destructive">
                          {result.error ?? "Generation failed"}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
