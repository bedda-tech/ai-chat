import { embedMany } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextResponse } from "next/server";

import { auth } from "@/app/(auth)/auth";
import { extractText, chunkText } from "@/lib/ai/chunker";
import {
  createKBDocument,
  deleteKBDocument,
  listKBDocuments,
  saveKBChunks,
} from "@/lib/db/queries";

const SUPPORTED_TYPES = [
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/json",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/** GET /api/knowledge-base?projectId=X — list documents (project-scoped or account-wide) */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId") ?? undefined;

  const docs = await listKBDocuments(session.user.id, projectId);
  return NextResponse.json({ documents: docs });
}

/** POST /api/knowledge-base — upload + process a document */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!SUPPORTED_TYPES.includes(file.type)) {
    return NextResponse.json(
      {
        error: `Unsupported file type. Supported: ${SUPPORTED_TYPES.join(", ")}`,
      },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File too large. Maximum 10MB." },
      { status: 400 }
    );
  }

  // Optional project scope — associate this doc with a project if provided
  const projectId = (formData.get("projectId") as string | null) ?? null;

  try {
    // 1. Extract text from the file
    const buffer = await file.arrayBuffer();
    const text = await extractText(buffer, file.type);

    if (text.trim().length < 20) {
      return NextResponse.json(
        { error: "File appears to be empty or too short to process." },
        { status: 400 }
      );
    }

    // 2. Create document record
    const title = file.name.replace(/\.[^.]+$/, ""); // strip extension
    const doc = await createKBDocument({
      userId: session.user.id,
      projectId,
      title,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    });

    // 3. Chunk the text
    const textChunks = chunkText(text);
    if (textChunks.length === 0) {
      return NextResponse.json(
        { error: "Could not extract any text from the file." },
        { status: 400 }
      );
    }

    console.log(
      `[kb] chunking "${file.name}": ${text.length} chars → ${textChunks.length} chunks` +
        (projectId ? ` (project: ${projectId})` : " (account-wide)")
    );

    // 4. Generate embeddings in batches of 100
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

    // 5. Store chunks with embeddings
    await saveKBChunks({
      documentId: doc.id,
      userId: session.user.id,
      projectId,
      chunks: textChunks.map((content, idx) => ({
        content,
        chunkIndex: idx,
        embedding: allEmbeddings[idx],
      })),
    });

    return NextResponse.json({
      success: true,
      document: {
        id: doc.id,
        title: doc.title,
        fileName: doc.fileName,
        chunkCount: textChunks.length,
        projectId,
      },
    });
  } catch (error) {
    console.error("Knowledge base upload error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to process document",
      },
      { status: 500 }
    );
  }
}

/** DELETE /api/knowledge-base?id=xxx — delete a document */
export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  await deleteKBDocument({ id, userId: session.user.id });
  return NextResponse.json({ success: true });
}
