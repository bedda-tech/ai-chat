import { openai } from "@ai-sdk/openai";
import { embed } from "ai";
import { NextResponse } from "next/server";

import { auth } from "@/app/(auth)/auth";
import { saveSearchQuery, searchKBChunks } from "@/lib/db/queries";
import { getUserTier } from "@/lib/usage/tracking";

/**
 * POST /api/knowledge-base/search
 * Semantic search over the user's knowledge base using vector similarity + BM25 hybrid RRF.
 * Records each query in SearchQuery for analytics.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tier = await getUserTier(session.user.id);
  if (tier === "free") {
    return NextResponse.json(
      {
        error:
          "Knowledge Base requires a paid subscription. Upgrade at /upgrade.",
        upgrade: true,
      },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    query,
    projectId,
    limit = 5,
    similarityThreshold = 0.25,
  } = body as {
    query?: string;
    projectId?: string | null;
    limit?: number;
    similarityThreshold?: number;
  };

  if (!query || typeof query !== "string" || query.trim().length === 0) {
    return NextResponse.json(
      { error: "query is required and must be a non-empty string" },
      { status: 400 }
    );
  }

  const clampedLimit = Math.min(Math.max(1, limit), 20);
  const startTime = Date.now();

  // Generate query embedding
  let queryEmbedding: number[];
  try {
    const { embedding } = await embed({
      model: openai.textEmbeddingModel("text-embedding-3-small"),
      value: query.trim(),
    });
    queryEmbedding = embedding;
  } catch (err) {
    console.error("[kb/search] embedding error:", err);
    return NextResponse.json(
      { error: "Failed to generate query embedding" },
      { status: 500 }
    );
  }

  // Hybrid vector + BM25 search
  let results: Array<{
    content: string;
    documentTitle: string;
    similarity: number;
  }>;
  try {
    results = await searchKBChunks({
      userId: session.user.id,
      projectId: projectId ?? undefined,
      queryEmbedding,
      queryText: query.trim(),
      limit: clampedLimit,
      similarityThreshold,
    });
  } catch (err) {
    console.error("[kb/search] search error:", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }

  const responseTimeMs = Date.now() - startTime;

  // Record analytics — fire-and-forget, never fail the request
  saveSearchQuery({
    userId: session.user.id,
    query: query.trim(),
    resultsCount: results.length,
    responseTimeMs,
  }).catch((err) => console.warn("[kb/search] analytics save failed:", err));

  return NextResponse.json({
    query: query.trim(),
    results: results.map((r) => ({
      content: r.content,
      source: r.documentTitle,
      score: Math.round(r.similarity * 10_000) / 10_000,
    })),
    count: results.length,
    responseTimeMs,
  });
}
