import { NextResponse } from "next/server";

import { auth } from "@/app/(auth)/auth";
import {
  assignDocumentToCollection,
  createCollection,
  deleteCollection,
  listCollections,
} from "@/lib/db/queries";
import { getUserTier } from "@/lib/usage/tracking";

const UPGRADE_ERROR = {
  error: "Knowledge Base requires a paid subscription. Upgrade at /upgrade.",
  upgrade: true,
};

/** GET /api/knowledge-base/collections — list user's collections */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tier = await getUserTier(session.user.id);
  if (tier === "free") {
    return NextResponse.json(UPGRADE_ERROR, { status: 403 });
  }

  const collections = await listCollections(session.user.id);
  return NextResponse.json({ collections });
}

/** POST /api/knowledge-base/collections — create a new collection */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tier = await getUserTier(session.user.id);
  if (tier === "free") {
    return NextResponse.json(UPGRADE_ERROR, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, description } = body as {
    name?: string;
    description?: string;
  };
  if (!name?.trim()) {
    return NextResponse.json(
      { error: "Collection name is required" },
      { status: 400 }
    );
  }

  const collection = await createCollection({
    userId: session.user.id,
    name: name.trim(),
    description: description?.trim(),
  });
  return NextResponse.json({ collection }, { status: 201 });
}

/** DELETE /api/knowledge-base/collections?id=... — delete a collection */
export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { error: "Collection id is required" },
      { status: 400 }
    );
  }

  await deleteCollection({ id, userId: session.user.id });
  return NextResponse.json({ success: true });
}

/** PATCH /api/knowledge-base/collections — assign a document to a collection */
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { documentId, collectionId } = body as {
    documentId?: string;
    collectionId?: string | null;
  };
  if (!documentId) {
    return NextResponse.json(
      { error: "documentId is required" },
      { status: 400 }
    );
  }

  await assignDocumentToCollection({
    documentId,
    userId: session.user.id,
    collectionId: collectionId ?? null,
  });
  return NextResponse.json({ success: true });
}
