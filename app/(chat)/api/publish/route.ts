import { auth } from "@/app/(auth)/auth";
import {
  countRecentPublishes,
  getActivePageForDocument,
  MAX_PUBLISHED_CONTENT_BYTES,
  MAX_PUBLISHES_PER_HOUR,
  PUBLISHABLE_KINDS,
  publishDocument,
  unpublishPage,
} from "@/lib/db/published-pages";
import { getDocumentsById } from "@/lib/db/queries";

function pageJson(slug: string) {
  return { slug, url: `/p/${slug}` };
}

/** GET ?documentId= — current publish status for one of the user's documents. */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const documentId = new URL(request.url).searchParams.get("documentId");
  if (!documentId) {
    return Response.json({ error: "documentId required" }, { status: 400 });
  }
  const page = await getActivePageForDocument(session.user.id, documentId);
  return Response.json({ published: page ? pageJson(page.slug) : null });
}

/** POST {documentId} — publish (or refresh) the latest version as a public page. */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const documentId: unknown = body?.documentId;
  if (typeof documentId !== "string") {
    return Response.json({ error: "documentId required" }, { status: 400 });
  }

  const docs = await getDocumentsById({ id: documentId });
  const doc = docs.at(-1);
  if (!doc || doc.userId !== session.user.id) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  if (!(PUBLISHABLE_KINDS as readonly string[]).includes(doc.kind)) {
    return Response.json(
      { error: `${doc.kind} artifacts can't be published yet` },
      { status: 400 }
    );
  }
  const content = doc.content ?? "";
  if (
    !content.trim() ||
    Buffer.byteLength(content) > MAX_PUBLISHED_CONTENT_BYTES
  ) {
    return Response.json(
      { error: "Content is empty or too large to publish" },
      { status: 400 }
    );
  }
  if ((await countRecentPublishes(session.user.id)) >= MAX_PUBLISHES_PER_HOUR) {
    return Response.json(
      { error: "Publish limit reached. Try again in an hour." },
      { status: 429, headers: { "Retry-After": "3600" } }
    );
  }

  const page = await publishDocument({
    userId: session.user.id,
    documentId,
    title: doc.title,
    kind: doc.kind,
    content,
  });
  return Response.json({ published: pageJson(page.slug) });
}

/** DELETE ?slug= — unpublish. */
export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const slug = new URL(request.url).searchParams.get("slug");
  if (!slug) {
    return Response.json({ error: "slug required" }, { status: 400 });
  }
  const ok = await unpublishPage(session.user.id, slug);
  return Response.json({ ok }, { status: ok ? 200 : 404 });
}
