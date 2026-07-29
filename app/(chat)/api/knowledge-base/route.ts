import { openai } from "@ai-sdk/openai";
import { embedMany } from "ai";
import { NextResponse } from "next/server";

import { auth } from "@/app/(auth)/auth";
import { chunkText, extractText } from "@/lib/ai/chunker";
import {
  createKBDocument,
  deleteKBDocument,
  listKBDocuments,
  saveKBChunks,
  updateKBDocumentStatus,
} from "@/lib/db/queries";
import { getUserTier } from "@/lib/usage/tracking";

const UPGRADE_ERROR = {
  error: "Knowledge Base requires a paid subscription. Upgrade at /upgrade.",
  upgrade: true,
};

const SUPPORTED_TYPES = [
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/json",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB (PDFs can be larger)

/** GET /api/knowledge-base?projectId=X — list documents (project-scoped or account-wide) */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tier = await getUserTier(session.user.id);
  if (tier === "free") {
    return NextResponse.json(UPGRADE_ERROR, { status: 403 });
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

  const tier = await getUserTier(session.user.id);
  if (tier === "free") {
    return NextResponse.json(UPGRADE_ERROR, { status: 403 });
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
        error:
          "Unsupported file type. Supported formats: PDF, Word (.docx), TXT, Markdown, CSV, JSON.",
      },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File too large. Maximum 25MB." },
      { status: 400 }
    );
  }

  // Optional project scope — associate this doc with a project if provided
  const projectId = (formData.get("projectId") as string | null) ?? null;

  // 1. Extract text before creating DB record (validate content first)
  let text: string;
  const buffer = await file.arrayBuffer();
  try {
    text = await extractText(buffer, file.type);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to extract text from file",
      },
      { status: 400 }
    );
  }

  if (text.trim().length < 20) {
    return NextResponse.json(
      { error: "File appears to be empty or too short to process." },
      { status: 400 }
    );
  }

  // 2. Create document record with status="processing"
  const title = file.name.replace(/\.[^.]+$/, ""); // strip extension
  const doc = await createKBDocument({
    userId: session.user.id,
    projectId,
    title,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    status: "processing",
  });

  try {
    // 3. Chunk the text
    const textChunks = chunkText(text);
    if (textChunks.length === 0) {
      await updateKBDocumentStatus({
        id: doc.id,
        userId: session.user.id,
        status: "error",
        errorMessage: "Could not extract any text from the file.",
      });
      return NextResponse.json(
        { error: "Could not extract any text from the file." },
        { status: 400 }
      );
    }

    console.log(
      `[kb] chunking "${file.name}": ${text.length} chars → ${textChunks.length} chunks` +
        (projectId ? ` (project: ${projectId})` : " (account-wide)")
    );

    // Estimate token count (~4 chars per token)
    const estimatedTokens = Math.ceil(text.length / 4);

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

    // 6. Mark document as ready with final metadata
    await updateKBDocumentStatus({
      id: doc.id,
      userId: session.user.id,
      status: "ready",
      chunkCount: textChunks.length,
      tokenCount: estimatedTokens,
    });

    return NextResponse.json({
      success: true,
      document: {
        id: doc.id,
        title: doc.title,
        fileName: doc.fileName,
        chunkCount: textChunks.length,
        tokenCount: estimatedTokens,
        projectId,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to process document";
    console.error("Knowledge base upload error:", error);
    // Mark document as failed so it doesn't appear as processing indefinitely
    await updateKBDocumentStatus({
      id: doc.id,
      userId: session.user.id,
      status: "error",
      errorMessage: message,
    }).catch(() => {}); // best-effort cleanup
    return NextResponse.json({ error: message }, { status: 500 });
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
