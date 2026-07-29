import { openai } from "@ai-sdk/openai";
import { embedMany } from "ai";
import { NextResponse } from "next/server";

import { auth } from "@/app/(auth)/auth";
import { chunkText } from "@/lib/ai/chunker";
import {
  createKBDocument,
  getDriveConnection,
  saveDriveConnection,
  saveKBChunks,
} from "@/lib/db/queries";

const DRIVE_API = "https://www.googleapis.com/drive/v3";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

async function refreshToken(
  userId: string,
  refreshTok: string
): Promise<string | null> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      refresh_token: refreshTok,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    return null;
  }
  const data = await res.json();
  await saveDriveConnection(userId, {
    accessToken: data.access_token,
    refreshToken: refreshTok,
    expiresAt: data.expires_in
      ? Math.floor(Date.now() / 1000) + data.expires_in
      : null,
    scope: null,
  });
  return data.access_token;
}

async function getValidToken(userId: string): Promise<string | null> {
  const conn = await getDriveConnection(userId);
  if (!conn) {
    return null;
  }
  if (conn.expiresAt && conn.expiresAt < Math.floor(Date.now() / 1000) + 60) {
    if (!conn.refreshToken) {
      return null;
    }
    return refreshToken(userId, conn.refreshToken);
  }
  return conn.accessToken;
}

/** GET /api/knowledge-base/import/drive?q=<query> — list recent Drive files */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = await getValidToken(session.user.id);
  if (!token) {
    return NextResponse.json({ connected: false, files: [] });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";

  const query = q
    ? `fullText contains '${q.replace(/'/g, "\\'")}' and trashed=false`
    : "trashed=false";

  const params = new URLSearchParams({
    q: query,
    orderBy: "modifiedTime desc",
    pageSize: "20",
    fields: "files(id,name,mimeType,modifiedTime,size)",
  });

  const res = await fetch(`${DRIVE_API}/files?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Drive API error" }, { status: 502 });
  }

  const data = await res.json();
  const files = (
    data.files as Array<{
      id: string;
      name: string;
      mimeType: string;
      modifiedTime: string;
      size?: string;
    }>
  ).map((f) => ({
    id: f.id,
    name: f.name,
    type: f.mimeType
      .replace("application/vnd.google-apps.", "Google ")
      .replace("application/", ""),
    modified: f.modifiedTime,
    size: f.size ? Number.parseInt(f.size, 10) : null,
  }));

  return NextResponse.json({ connected: true, files });
}

/** POST /api/knowledge-base/import/drive — import a Drive file into the KB */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { fileId?: string; title?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { fileId, title: providedTitle } = body;
  if (!fileId) {
    return NextResponse.json({ error: "Missing fileId" }, { status: 400 });
  }

  const token = await getValidToken(session.user.id);
  if (!token) {
    return NextResponse.json(
      { error: "Google Drive not connected. Connect at /drive first." },
      { status: 400 }
    );
  }

  // Get file metadata
  const metaRes = await fetch(
    `${DRIVE_API}/files/${fileId}?fields=name,mimeType,size`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!metaRes.ok) {
    return NextResponse.json(
      { error: "File not found or access denied." },
      { status: 404 }
    );
  }
  const meta = await metaRes.json();

  let content: string;

  if (meta.mimeType?.startsWith("application/vnd.google-apps.")) {
    // Google Workspace files — export to plain text
    const exportMime =
      meta.mimeType === "application/vnd.google-apps.spreadsheet"
        ? "text/csv"
        : "text/plain";
    const exportRes = await fetch(
      `${DRIVE_API}/files/${fileId}/export?mimeType=${encodeURIComponent(exportMime)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!exportRes.ok) {
      return NextResponse.json(
        { error: "Failed to export file content." },
        { status: 502 }
      );
    }
    content = await exportRes.text();
  } else {
    // Binary/text — download media
    const dlRes = await fetch(`${DRIVE_API}/files/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!dlRes.ok) {
      return NextResponse.json(
        { error: "Failed to download file content." },
        { status: 502 }
      );
    }
    content = await dlRes.text();
  }

  if (content.trim().length < 20) {
    return NextResponse.json(
      { error: "File appears to be empty or contains no readable text." },
      { status: 400 }
    );
  }

  try {
    const title = providedTitle ?? meta.name.replace(/\.[^.]+$/, "");
    const doc = await createKBDocument({
      userId: session.user.id,
      title,
      fileName: meta.name,
      fileType: "text/plain",
      fileSize: content.length,
    });

    const textChunks = chunkText(content);
    if (textChunks.length === 0) {
      return NextResponse.json(
        { error: "Could not extract any text from the file." },
        { status: 400 }
      );
    }

    const BATCH_SIZE = 100;
    const allEmbeddings: number[][] = [];
    for (let i = 0; i < textChunks.length; i += BATCH_SIZE) {
      const batch = textChunks.slice(i, i + BATCH_SIZE);
      const { embeddings } = await embedMany({
        model: openai.textEmbeddingModel("text-embedding-3-small"),
        values: batch,
      });
      allEmbeddings.push(...embeddings);
    }

    await saveKBChunks({
      documentId: doc.id,
      userId: session.user.id,
      chunks: textChunks.map((c, idx) => ({
        content: c,
        chunkIndex: idx,
        embedding: allEmbeddings[idx],
      })),
    });

    return NextResponse.json({
      success: true,
      document: { id: doc.id, title: doc.title, chunkCount: textChunks.length },
    });
  } catch (error) {
    console.error("Drive KB import error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to import document",
      },
      { status: 500 }
    );
  }
}
