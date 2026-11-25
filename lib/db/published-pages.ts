import "server-only";

import { randomBytes } from "node:crypto";
import { and, count, eq, gte, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { publishedPage, publishedPageReport } from "./schema";

const db = drizzle(postgres(process.env.POSTGRES_URL!));

export const PUBLISHABLE_KINDS = ["html", "mermaid", "text", "code"] as const;
export const MAX_PUBLISHES_PER_HOUR = 10;
export const MAX_PUBLISHED_CONTENT_BYTES = 500_000;
/** Distinct reports after which a page is hidden until an admin reviews it. */
export const REPORTS_TO_HIDE = 3;

export function newSlug() {
  return randomBytes(6).toString("base64url");
}

export async function getPublishedPageBySlug(slug: string) {
  const [page] = await db
    .select()
    .from(publishedPage)
    .where(eq(publishedPage.slug, slug))
    .limit(1);
  if (!page || page.unpublishedAt || page.hiddenByReports) {
    return null;
  }
  return page;
}

export async function getActivePageForDocument(
  userId: string,
  documentId: string
) {
  const [page] = await db
    .select()
    .from(publishedPage)
    .where(
      and(
        eq(publishedPage.userId, userId),
        eq(publishedPage.documentId, documentId),
        isNull(publishedPage.unpublishedAt)
      )
    )
    .limit(1);
  return page ?? null;
}

export async function countRecentPublishes(userId: string) {
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const [row] = await db
    .select({ n: count() })
    .from(publishedPage)
    .where(
      and(eq(publishedPage.userId, userId), gte(publishedPage.updatedAt, since))
    );
  return row?.n ?? 0;
}

export async function publishDocument(input: {
  userId: string;
  documentId: string;
  title: string;
  kind: string;
  content: string;
}) {
  const existing = await getActivePageForDocument(
    input.userId,
    input.documentId
  );
  if (existing) {
    const [updated] = await db
      .update(publishedPage)
      .set({
        title: input.title,
        kind: input.kind,
        content: input.content,
        updatedAt: new Date(),
      })
      .where(eq(publishedPage.id, existing.id))
      .returning();
    return updated;
  }
  const [created] = await db
    .insert(publishedPage)
    .values({ ...input, slug: newSlug() })
    .returning();
  return created;
}

export async function unpublishPage(userId: string, slug: string) {
  const rows = await db
    .update(publishedPage)
    .set({ unpublishedAt: new Date() })
    .where(and(eq(publishedPage.slug, slug), eq(publishedPage.userId, userId)))
    .returning({ id: publishedPage.id });
  return rows.length > 0;
}

export async function reportPage(slug: string, reason: string) {
  const [page] = await db
    .select()
    .from(publishedPage)
    .where(eq(publishedPage.slug, slug))
    .limit(1);
  if (!page) {
    return false;
  }
  await db.insert(publishedPageReport).values({ pageId: page.id, reason });
  const [row] = await db
    .select({ n: count() })
    .from(publishedPageReport)
    .where(eq(publishedPageReport.pageId, page.id));
  if ((row?.n ?? 0) >= REPORTS_TO_HIDE && !page.reviewedClean) {
    await db
      .update(publishedPage)
      .set({ hiddenByReports: true })
      .where(eq(publishedPage.id, page.id));
  }
  return true;
}
