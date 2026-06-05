import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { compareSession } from "./schema";

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

export async function saveCompareSession({
  userId,
  title,
  modelIds,
  prompts,
}: {
  userId: string;
  title: string | null;
  modelIds: string[];
  prompts: string[];
}) {
  const [session] = await db
    .insert(compareSession)
    .values({ userId, title, modelIds, prompts })
    .returning();
  return session;
}

export async function getCompareSessions(userId: string) {
  return db
    .select()
    .from(compareSession)
    .where(eq(compareSession.userId, userId))
    .orderBy(desc(compareSession.createdAt))
    .limit(20);
}

export async function getCompareSession(id: string, userId: string) {
  const [session] = await db
    .select()
    .from(compareSession)
    .where(and(eq(compareSession.id, id), eq(compareSession.userId, userId)));
  return session ?? null;
}

export async function deleteCompareSession(id: string, userId: string) {
  await db
    .delete(compareSession)
    .where(and(eq(compareSession.id, id), eq(compareSession.userId, userId)));
}
