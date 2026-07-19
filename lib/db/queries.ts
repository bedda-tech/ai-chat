import "server-only";

import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  isNull,
  lt,
  type SQL,
  sql,
} from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import type { ArtifactKind } from "@/components/artifact";
import type { VisibilityType } from "@/components/visibility-selector";
import { ChatSDKError } from "../errors";
import type { AppUsage } from "../usage";
import { generateUUID } from "../utils";
import {
  type ApiKey,
  account,
  apiKey,
  type Chat,
  chat,
  type DBMessage,
  type DriveConnection,
  document,
  driveConnection,
  type KnowledgeBaseDocument,
  knowledgeBaseChunk,
  knowledgeBaseDocument,
  type McpServer,
  mcpServer,
  message,
  type NotionConnection,
  notionConnection,
  type OrganizationSsoConfig,
  organizationSsoConfig,
  type PluginTool,
  type Project,
  passwordResetToken,
  pluginTool,
  project,
  type SlackWorkspace,
  type Suggestion,
  slackWorkspace,
  stream,
  suggestion,
  type User,
  type UserMemory,
  type UserPreferences,
  user,
  userMemory,
  userPreferences,
  type UserProviderKey,
  type VideoJob,
  userProviderKey,
  videoJob,
  vote,
} from "./schema";
import { generateHashedPassword } from "./utils";

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

/** Fetch all user records matching the given email address. */
export async function getUser(email: string): Promise<User[]> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get user by email"
    );
  }
}

export async function createUser(
  email: string,
  password: string,
  referredByCode?: string
) {
  const hashedPassword = generateHashedPassword(password);
  const referralCode = generateUUID().replace(/-/g, "").slice(0, 8);

  let referredBy: string | undefined;
  if (referredByCode) {
    const [referrer] = await db
      .select({ referralCode: user.referralCode })
      .from(user)
      .where(eq(user.referralCode, referredByCode));
    if (referrer) {
      referredBy = referredByCode;
    }
  }

  try {
    return await db
      .insert(user)
      .values({ email, password: hashedPassword, referralCode, referredBy });
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to create user");
  }
}

export async function getUserReferralInfo(
  userId: string
): Promise<{ referralCode: string | null; referralCount: number }> {
  const [found] = await db
    .select({ referralCode: user.referralCode })
    .from(user)
    .where(eq(user.id, userId));

  if (!found?.referralCode) {
    return { referralCode: null, referralCount: 0 };
  }

  const [countResult] = await db
    .select({ count: count() })
    .from(user)
    .where(eq(user.referredBy, found.referralCode));

  return {
    referralCode: found.referralCode,
    referralCount: Number(countResult?.count ?? 0),
  };
}

export async function createPasswordResetToken(
  userId: string,
  tokenHash: string,
  expiresAt: Date
) {
  try {
    return await db
      .insert(passwordResetToken)
      .values({ userId, tokenHash, expiresAt })
      .returning({ id: passwordResetToken.id });
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to create password reset token"
    );
  }
}

export async function getPasswordResetToken(tokenHash: string) {
  try {
    return await db
      .select()
      .from(passwordResetToken)
      .where(eq(passwordResetToken.tokenHash, tokenHash));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get password reset token"
    );
  }
}

export async function markPasswordResetTokenUsed(id: string) {
  try {
    return await db
      .update(passwordResetToken)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetToken.id, id));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to mark password reset token as used"
    );
  }
}

export async function updateUserPassword(userId: string, newPassword: string) {
  const hashedPassword = generateHashedPassword(newPassword);
  try {
    return await db
      .update(user)
      .set({ password: hashedPassword })
      .where(eq(user.id, userId));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to update user password"
    );
  }
}

/** Creates an ephemeral user with a timestamp-based synthetic email (no real email address). Used for unauthenticated browser sessions. */
export async function createGuestUser() {
  const email = `guest-${Date.now()}`;
  const password = generateHashedPassword(generateUUID());

  try {
    return await db.insert(user).values({ email, password }).returning({
      id: user.id,
      email: user.email,
    });
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to create guest user"
    );
  }
}

export async function saveChat({
  id,
  userId,
  title,
  visibility,
  projectId,
}: {
  id: string;
  userId: string;
  title: string;
  visibility: VisibilityType;
  projectId?: string | null;
}) {
  try {
    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      userId,
      title,
      visibility,
      projectId: projectId ?? null,
    });
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to save chat");
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    await db.delete(vote).where(eq(vote.chatId, id));
    await db.delete(message).where(eq(message.chatId, id));
    await db.delete(stream).where(eq(stream.chatId, id));

    const [chatsDeleted] = await db
      .delete(chat)
      .where(eq(chat.id, id))
      .returning();
    return chatsDeleted;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete chat by id"
    );
  }
}

export async function deleteAllChatsByUserId({ userId }: { userId: string }) {
  try {
    const userChats = await db
      .select({ id: chat.id })
      .from(chat)
      .where(eq(chat.userId, userId));

    if (userChats.length === 0) {
      return { deletedCount: 0 };
    }

    const chatIds = userChats.map((c) => c.id);

    await db.delete(vote).where(inArray(vote.chatId, chatIds));
    await db.delete(message).where(inArray(message.chatId, chatIds));
    await db.delete(stream).where(inArray(stream.chatId, chatIds));

    const deletedChats = await db
      .delete(chat)
      .where(eq(chat.userId, userId))
      .returning();

    return { deletedCount: deletedChats.length };
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete all chats by user id"
    );
  }
}

export async function getChatsByUserId({
  id,
  limit,
  startingAfter,
  endingBefore,
  searchQuery,
}: {
  id: string;
  limit: number;
  startingAfter: string | null;
  endingBefore: string | null;
  searchQuery?: string | null;
}) {
  try {
    const extendedLimit = limit + 1;
    const titleFilter = searchQuery
      ? ilike(chat.title, `%${searchQuery}%`)
      : undefined;

    const buildWhere = (cursorCondition?: SQL<unknown>) => {
      const conditions = [eq(chat.userId, id)];
      if (titleFilter) conditions.push(titleFilter);
      if (cursorCondition) conditions.push(cursorCondition);
      return conditions.length === 1 ? conditions[0] : and(...conditions);
    };

    const queryFn = (cursorCondition?: SQL<unknown>) =>
      db
        .select()
        .from(chat)
        .where(buildWhere(cursorCondition))
        .orderBy(desc(chat.createdAt))
        .limit(extendedLimit);

    let filteredChats: Chat[] = [];

    // When searching, skip cursor-based pagination and return top results
    if (searchQuery) {
      filteredChats = await queryFn();
    } else if (startingAfter) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, startingAfter))
        .limit(1);

      if (!selectedChat) {
        throw new ChatSDKError(
          "not_found:database",
          `Chat with id ${startingAfter} not found`
        );
      }

      filteredChats = await queryFn(gt(chat.createdAt, selectedChat.createdAt));
    } else if (endingBefore) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, endingBefore))
        .limit(1);

      if (!selectedChat) {
        throw new ChatSDKError(
          "not_found:database",
          `Chat with id ${endingBefore} not found`
        );
      }

      filteredChats = await queryFn(lt(chat.createdAt, selectedChat.createdAt));
    } else {
      filteredChats = await queryFn();
    }

    const hasMore = filteredChats.length > limit;

    return {
      chats: hasMore ? filteredChats.slice(0, limit) : filteredChats,
      hasMore,
    };
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get chats by user id"
    );
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    if (!selectedChat) {
      return null;
    }

    return selectedChat;
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to get chat by id");
  }
}

export async function saveMessages({ messages }: { messages: DBMessage[] }) {
  try {
    return await db.insert(message).values(messages);
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to save messages");
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(message)
      .where(eq(message.chatId, id))
      .orderBy(asc(message.createdAt));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get messages by chat id"
    );
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: "up" | "down";
}) {
  try {
    const [existingVote] = await db
      .select()
      .from(vote)
      .where(and(eq(vote.messageId, messageId)));

    if (existingVote) {
      return await db
        .update(vote)
        .set({ isUpvoted: type === "up" })
        .where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId)));
    }
    return await db.insert(vote).values({
      chatId,
      messageId,
      isUpvoted: type === "up",
    });
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to vote message");
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await db.select().from(vote).where(eq(vote.chatId, id));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get votes by chat id"
    );
  }
}

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
}) {
  try {
    return await db
      .insert(document)
      .values({
        id,
        title,
        kind,
        content,
        userId,
        createdAt: new Date(),
      })
      .returning();
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to save document");
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    const documents = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(asc(document.createdAt));

    return documents;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get documents by id"
    );
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    const [selectedDocument] = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(desc(document.createdAt));

    return selectedDocument;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get document by id"
    );
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    await db
      .delete(suggestion)
      .where(
        and(
          eq(suggestion.documentId, id),
          gt(suggestion.documentCreatedAt, timestamp)
        )
      );

    return await db
      .delete(document)
      .where(and(eq(document.id, id), gt(document.createdAt, timestamp)))
      .returning();
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete documents by id after timestamp"
    );
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Suggestion[];
}) {
  try {
    return await db.insert(suggestion).values(suggestions);
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to save suggestions"
    );
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    return await db
      .select()
      .from(suggestion)
      .where(and(eq(suggestion.documentId, documentId)));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get suggestions by document id"
    );
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await db.select().from(message).where(eq(message.id, id));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get message by id"
    );
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    const messagesToDelete = await db
      .select({ id: message.id })
      .from(message)
      .where(
        and(eq(message.chatId, chatId), gte(message.createdAt, timestamp))
      );

    const messageIds = messagesToDelete.map(
      (currentMessage) => currentMessage.id
    );

    if (messageIds.length > 0) {
      await db
        .delete(vote)
        .where(
          and(eq(vote.chatId, chatId), inArray(vote.messageId, messageIds))
        );

      return await db
        .delete(message)
        .where(
          and(eq(message.chatId, chatId), inArray(message.id, messageIds))
        );
    }
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete messages by chat id after timestamp"
    );
  }
}

export async function updateChatVisiblityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: "private" | "public";
}) {
  try {
    return await db.update(chat).set({ visibility }).where(eq(chat.id, chatId));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to update chat visibility by id"
    );
  }
}

export async function updateChatLastContextById({
  chatId,
  context,
}: {
  chatId: string;
  // Store merged server-enriched usage object
  context: AppUsage;
}) {
  try {
    return await db
      .update(chat)
      .set({ lastContext: context })
      .where(eq(chat.id, chatId));
  } catch (error) {
    console.warn("Failed to update lastContext for chat", chatId, error);
    return;
  }
}

/** Counts user-role messages sent by `id` within the last `differenceInHours` hours. Used for rate-limit checks. */
export async function getMessageCountByUserId({
  id,
  differenceInHours,
}: {
  id: string;
  differenceInHours: number;
}) {
  try {
    const twentyFourHoursAgo = new Date(
      Date.now() - differenceInHours * 60 * 60 * 1000
    );

    const [stats] = await db
      .select({ count: count(message.id) })
      .from(message)
      .innerJoin(chat, eq(message.chatId, chat.id))
      .where(
        and(
          eq(chat.userId, id),
          gte(message.createdAt, twentyFourHoursAgo),
          eq(message.role, "user")
        )
      )
      .execute();

    return stats?.count ?? 0;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get message count by user id"
    );
  }
}

export async function createStreamId({
  streamId,
  chatId,
}: {
  streamId: string;
  chatId: string;
}) {
  try {
    await db
      .insert(stream)
      .values({ id: streamId, chatId, createdAt: new Date() });
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to create stream id"
    );
  }
}

// ─── Knowledge Base ───────────────────────────────────────────────────────────

export async function createKBDocument({
  userId,
  projectId,
  title,
  fileName,
  fileType,
  fileSize,
}: {
  userId: string;
  projectId?: string | null;
  title: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}): Promise<KnowledgeBaseDocument> {
  const [doc] = await db
    .insert(knowledgeBaseDocument)
    .values({
      userId,
      projectId: projectId ?? null,
      title,
      fileName,
      fileType,
      fileSize,
    })
    .returning();
  return doc;
}

export async function saveKBChunks({
  documentId,
  userId,
  projectId,
  chunks,
}: {
  documentId: string;
  userId: string;
  projectId?: string | null;
  chunks: Array<{ content: string; chunkIndex: number; embedding: number[] }>;
}) {
  if (chunks.length === 0) return;
  await db.insert(knowledgeBaseChunk).values(
    chunks.map((c) => ({
      documentId,
      userId,
      projectId: projectId ?? null,
      content: c.content,
      chunkIndex: c.chunkIndex,
      embedding: c.embedding,
    }))
  );
  await db
    .update(knowledgeBaseDocument)
    .set({ chunkCount: chunks.length })
    .where(eq(knowledgeBaseDocument.id, documentId));
}

export async function listKBDocuments(
  userId: string,
  projectId?: string | null
): Promise<KnowledgeBaseDocument[]> {
  const condition =
    projectId !== undefined
      ? and(
          eq(knowledgeBaseDocument.userId, userId),
          projectId
            ? eq(knowledgeBaseDocument.projectId, projectId)
            : isNull(knowledgeBaseDocument.projectId)
        )
      : eq(knowledgeBaseDocument.userId, userId);
  return db
    .select()
    .from(knowledgeBaseDocument)
    .where(condition)
    .orderBy(desc(knowledgeBaseDocument.createdAt));
}

export async function hasKBDocuments(
  userId: string,
  projectId?: string | null
): Promise<boolean> {
  const condition =
    projectId !== undefined
      ? and(
          eq(knowledgeBaseDocument.userId, userId),
          projectId
            ? eq(knowledgeBaseDocument.projectId, projectId)
            : isNull(knowledgeBaseDocument.projectId)
        )
      : eq(knowledgeBaseDocument.userId, userId);
  const result = await db
    .select({ id: knowledgeBaseDocument.id })
    .from(knowledgeBaseDocument)
    .where(condition)
    .limit(1);
  return result.length > 0;
}

export async function deleteKBDocument({
  id,
  userId,
}: {
  id: string;
  userId: string;
}) {
  return db
    .delete(knowledgeBaseDocument)
    .where(
      and(
        eq(knowledgeBaseDocument.id, id),
        eq(knowledgeBaseDocument.userId, userId)
      )
    );
}

export async function searchKBChunks({
  userId,
  projectId,
  queryEmbedding,
  queryText,
  limit = 5,
  similarityThreshold = 0.25,
}: {
  userId: string;
  projectId?: string | null;
  queryEmbedding: number[];
  queryText?: string;
  limit?: number;
  similarityThreshold?: number;
}): Promise<
  Array<{ content: string; documentTitle: string; similarity: number }>
> {
  const vectorStr = `[${queryEmbedding.join(",")}]`;

  // Project-scope filter: if projectId provided, restrict to that project's docs;
  // otherwise restrict to account-wide docs (projectId IS NULL).
  const projectFilter = projectId
    ? sql`AND c."projectId" = ${projectId}::uuid`
    : sql`AND c."projectId" IS NULL`;

  // Hybrid search: Reciprocal Rank Fusion (RRF) combining vector similarity + BM25 text search.
  // Over-fetches 20 candidates from each strategy, then merges with RRF (k=60) for better recall.
  if (queryText && queryText.trim().length >= 3) {
    const results = await db.execute<{
      content: string;
      title: string;
      rrf_score: number;
    }>(
      sql`
        WITH vector_results AS (
          SELECT c.id, c.content, d.title,
                 ROW_NUMBER() OVER (ORDER BY c.embedding <=> ${vectorStr}::vector) AS v_rank
          FROM "KnowledgeBaseChunk" c
          JOIN "KnowledgeBaseDocument" d ON d.id = c."documentId"
          WHERE c."userId" = ${userId}::uuid
            ${projectFilter}
            AND 1 - (c.embedding <=> ${vectorStr}::vector) >= ${similarityThreshold}
          ORDER BY c.embedding <=> ${vectorStr}::vector
          LIMIT 20
        ),
        text_results AS (
          SELECT c.id, c.content, d.title,
                 ROW_NUMBER() OVER (
                   ORDER BY ts_rank(to_tsvector('english', c.content), plainto_tsquery('english', ${queryText})) DESC
                 ) AS t_rank
          FROM "KnowledgeBaseChunk" c
          JOIN "KnowledgeBaseDocument" d ON d.id = c."documentId"
          WHERE c."userId" = ${userId}::uuid
            ${projectFilter}
            AND to_tsvector('english', c.content) @@ plainto_tsquery('english', ${queryText})
          LIMIT 20
        )
        SELECT
          COALESCE(v.content, t.content) AS content,
          COALESCE(v.title, t.title) AS title,
          (1.0 / (60 + COALESCE(v.v_rank, 1000)) + 1.0 / (60 + COALESCE(t.t_rank, 1000))) AS rrf_score
        FROM vector_results v
        FULL OUTER JOIN text_results t ON v.id = t.id
        ORDER BY rrf_score DESC
        LIMIT ${limit}
      `
    );
    return results.map((r) => ({
      content: r.content,
      documentTitle: r.title,
      similarity: Number(r.rrf_score),
    }));
  }

  // Fallback: pure vector search (used when queryText is absent or too short)
  const results = await db.execute<{
    content: string;
    title: string;
    similarity: number;
  }>(
    sql`
      SELECT c.content, d.title, 1 - (c.embedding <=> ${vectorStr}::vector) AS similarity
      FROM "KnowledgeBaseChunk" c
      JOIN "KnowledgeBaseDocument" d ON d.id = c."documentId"
      WHERE c."userId" = ${userId}::uuid
        ${projectFilter}
        AND 1 - (c.embedding <=> ${vectorStr}::vector) >= ${similarityThreshold}
      ORDER BY c.embedding <=> ${vectorStr}::vector
      LIMIT ${limit}
    `
  );
  return results.map((r) => ({
    content: r.content,
    documentTitle: r.title,
    similarity: Number(r.similarity),
  }));
}

export async function getStreamIdsByChatId({ chatId }: { chatId: string }) {
  try {
    const streamIds = await db
      .select({ id: stream.id })
      .from(stream)
      .where(eq(stream.chatId, chatId))
      .orderBy(asc(stream.createdAt))
      .execute();

    return streamIds.map(({ id }) => id);
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get stream ids by chat id"
    );
  }
}

// OAuth / Social Login

export async function getOAuthAccount(
  provider: string,
  providerAccountId: string
): Promise<{ userId: string } | null> {
  try {
    const [row] = await db
      .select({ userId: account.userId })
      .from(account)
      .where(
        and(
          eq(account.provider, provider),
          eq(account.providerAccountId, providerAccountId)
        )
      );
    return row ?? null;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get OAuth account"
    );
  }
}

export async function createOAuthAccount(
  userId: string,
  provider: string,
  providerAccountId: string,
  tokens?: {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    tokenType?: string;
    scope?: string;
    idToken?: string;
  }
) {
  try {
    await db.insert(account).values({
      userId,
      provider,
      providerAccountId,
      accessToken: tokens?.accessToken,
      refreshToken: tokens?.refreshToken,
      expiresAt: tokens?.expiresAt,
      tokenType: tokens?.tokenType,
      scope: tokens?.scope,
      idToken: tokens?.idToken,
    });
  } catch (_error) {
    // Ignore duplicate key errors (already linked)
  }
}

export async function getOrCreateOAuthUser(
  email: string,
  provider: string,
  providerAccountId: string,
  tokens?: {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    tokenType?: string;
    scope?: string;
    idToken?: string;
  }
): Promise<{ user: User; isNew: boolean }> {
  // Check if this OAuth account is already linked
  const existingAccount = await getOAuthAccount(provider, providerAccountId);
  if (existingAccount) {
    const [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, existingAccount.userId));
    if (existingUser) return { user: existingUser, isNew: false };
  }

  // Look up user by email (link existing email account)
  const existingUsers = await getUser(email);
  let userId: string;
  let isNew = false;

  if (existingUsers.length > 0) {
    userId = existingUsers[0].id;
  } else {
    // Create a new user (no password — OAuth only)
    const [newUser] = await db
      .insert(user)
      .values({ email, password: null })
      .returning();
    userId = newUser.id;
    isNew = true;
  }

  // Link the OAuth account
  await createOAuthAccount(userId, provider, providerAccountId, tokens);

  const [linkedUser] = await db.select().from(user).where(eq(user.id, userId));
  return { user: linkedUser, isNew };
}

// User preferences
export async function getUserPreferences(
  userId: string
): Promise<UserPreferences | null> {
  const [prefs] = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId));
  return prefs ?? null;
}

export async function upsertUserPreferences(
  userId: string,
  data: { customInstructions?: string; memoryEnabled?: boolean }
): Promise<UserPreferences> {
  const now = new Date();
  const [prefs] = await db
    .insert(userPreferences)
    .values({
      userId,
      customInstructions: data.customInstructions ?? null,
      ...(data.memoryEnabled !== undefined && {
        memoryEnabled: data.memoryEnabled,
      }),
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: userPreferences.userId,
      set: {
        customInstructions: data.customInstructions ?? null,
        ...(data.memoryEnabled !== undefined && {
          memoryEnabled: data.memoryEnabled,
        }),
        updatedAt: now,
      },
    })
    .returning();
  return prefs;
}

// MCP servers
/** Returns all MCP servers configured by the given user, ordered by creation date. */
export async function getMcpServers(userId: string): Promise<McpServer[]> {
  return db
    .select()
    .from(mcpServer)
    .where(eq(mcpServer.userId, userId))
    .orderBy(asc(mcpServer.createdAt));
}

export async function getEnabledMcpServers(
  userId: string
): Promise<McpServer[]> {
  return db
    .select()
    .from(mcpServer)
    .where(and(eq(mcpServer.userId, userId), eq(mcpServer.enabled, true)));
}

export async function createMcpServer(data: {
  userId: string;
  name: string;
  url: string;
  headers?: Record<string, string>;
}): Promise<McpServer> {
  const [server] = await db
    .insert(mcpServer)
    .values({
      userId: data.userId,
      name: data.name,
      url: data.url,
      headers: data.headers ?? {},
    })
    .returning();
  return server;
}

export async function updateMcpServer(
  id: string,
  userId: string,
  data: {
    name?: string;
    url?: string;
    enabled?: boolean;
    headers?: Record<string, string>;
  }
): Promise<McpServer | null> {
  const [server] = await db
    .update(mcpServer)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(mcpServer.id, id), eq(mcpServer.userId, userId)))
    .returning();
  return server ?? null;
}

export async function deleteMcpServer(
  id: string,
  userId: string
): Promise<void> {
  await db
    .delete(mcpServer)
    .where(and(eq(mcpServer.id, id), eq(mcpServer.userId, userId)));
}

// Projects
export async function getProjectsByUserId(userId: string): Promise<Project[]> {
  return db
    .select()
    .from(project)
    .where(eq(project.userId, userId))
    .orderBy(asc(project.createdAt));
}

export async function getProjectById(
  id: string,
  userId: string
): Promise<Project | null> {
  const [p] = await db
    .select()
    .from(project)
    .where(and(eq(project.id, id), eq(project.userId, userId)));
  return p ?? null;
}

export async function createProject(data: {
  userId: string;
  name: string;
  description?: string;
  instructions?: string;
}): Promise<Project> {
  const [p] = await db
    .insert(project)
    .values({
      userId: data.userId,
      name: data.name,
      description: data.description ?? null,
      instructions: data.instructions ?? null,
    })
    .returning();
  return p;
}

export async function updateProject(
  id: string,
  userId: string,
  data: { name?: string; description?: string; instructions?: string }
): Promise<Project | null> {
  const [p] = await db
    .update(project)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(project.id, id), eq(project.userId, userId)))
    .returning();
  return p ?? null;
}

export async function deleteProject(id: string, userId: string): Promise<void> {
  await db
    .delete(project)
    .where(and(eq(project.id, id), eq(project.userId, userId)));
}

export async function assignChatToProject(
  chatId: string,
  projectId: string | null,
  userId: string
): Promise<void> {
  await db
    .update(chat)
    .set({ projectId })
    .where(and(eq(chat.id, chatId), eq(chat.userId, userId)));
}

// Google Drive connection queries
export async function getDriveConnection(
  userId: string
): Promise<DriveConnection | null> {
  const [conn] = await db
    .select()
    .from(driveConnection)
    .where(eq(driveConnection.userId, userId));
  return conn ?? null;
}

export async function saveDriveConnection(
  userId: string,
  data: {
    accessToken: string;
    refreshToken?: string | null;
    expiresAt?: number | null;
    scope?: string | null;
  }
): Promise<DriveConnection> {
  const [conn] = await db
    .insert(driveConnection)
    .values({
      userId,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken ?? null,
      expiresAt: data.expiresAt ?? null,
      scope: data.scope ?? null,
    })
    .onConflictDoUpdate({
      target: driveConnection.userId,
      set: {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken ?? null,
        expiresAt: data.expiresAt ?? null,
        scope: data.scope ?? null,
        updatedAt: new Date(),
      },
    })
    .returning();
  return conn;
}

export async function deleteDriveConnection(userId: string): Promise<void> {
  await db.delete(driveConnection).where(eq(driveConnection.userId, userId));
}

export async function getNotionConnection(
  userId: string
): Promise<NotionConnection | null> {
  const [conn] = await db
    .select()
    .from(notionConnection)
    .where(eq(notionConnection.userId, userId));
  return conn ?? null;
}

export async function saveNotionConnection(
  userId: string,
  data: {
    accessToken: string;
    workspaceId?: string | null;
    workspaceName?: string | null;
    botId?: string | null;
  }
): Promise<NotionConnection> {
  const [conn] = await db
    .insert(notionConnection)
    .values({
      userId,
      accessToken: data.accessToken,
      workspaceId: data.workspaceId ?? null,
      workspaceName: data.workspaceName ?? null,
      botId: data.botId ?? null,
    })
    .onConflictDoUpdate({
      target: notionConnection.userId,
      set: {
        accessToken: data.accessToken,
        workspaceId: data.workspaceId ?? null,
        workspaceName: data.workspaceName ?? null,
        botId: data.botId ?? null,
        updatedAt: new Date(),
      },
    })
    .returning();
  return conn;
}

export async function deleteNotionConnection(userId: string): Promise<void> {
  await db.delete(notionConnection).where(eq(notionConnection.userId, userId));
}

// User memory (cross-conversation facts the AI remembers about the user)
export async function getUserMemories(userId: string): Promise<UserMemory[]> {
  return db
    .select()
    .from(userMemory)
    .where(eq(userMemory.userId, userId))
    .orderBy(desc(userMemory.createdAt));
}

export async function createUserMemory(
  userId: string,
  data: { content: string; category?: string; sourceChat?: string }
): Promise<UserMemory> {
  const [mem] = await db
    .insert(userMemory)
    .values({
      userId,
      content: data.content,
      category: data.category ?? "general",
      sourceChat: data.sourceChat ?? null,
    })
    .returning();
  return mem;
}

export async function deleteUserMemory(
  id: string,
  userId: string
): Promise<void> {
  await db
    .delete(userMemory)
    .where(and(eq(userMemory.id, id), eq(userMemory.userId, userId)));
}

export async function deleteAllUserMemories(userId: string): Promise<void> {
  await db.delete(userMemory).where(eq(userMemory.userId, userId));
}

// ── API Keys ──────────────────────────────────────────────────────────────────

export async function createApiKey(data: {
  userId: string;
  name: string;
  keyHash: string;
  keyPrefix: string;
}): Promise<ApiKey> {
  const [key] = await db.insert(apiKey).values(data).returning();
  return key;
}

export async function listApiKeys(userId: string): Promise<ApiKey[]> {
  return db
    .select()
    .from(apiKey)
    .where(and(eq(apiKey.userId, userId), sql`${apiKey.revokedAt} IS NULL`))
    .orderBy(desc(apiKey.createdAt));
}

export async function revokeApiKey(id: string, userId: string): Promise<void> {
  await db
    .update(apiKey)
    .set({ revokedAt: new Date() })
    .where(and(eq(apiKey.id, id), eq(apiKey.userId, userId)));
}

export async function validateApiKey(
  keyHash: string
): Promise<{ userId: string; keyId: string } | null> {
  const [row] = await db
    .select({ userId: apiKey.userId, id: apiKey.id })
    .from(apiKey)
    .where(and(eq(apiKey.keyHash, keyHash), sql`${apiKey.revokedAt} IS NULL`))
    .limit(1);

  if (!row) return null;

  // Update lastUsedAt in background (best-effort)
  db.update(apiKey)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKey.id, row.id))
    .catch(() => {});

  return { userId: row.userId, keyId: row.id };
}

// VideoJob queries

export async function createVideoJob(
  data: Omit<typeof videoJob.$inferInsert, "id" | "createdAt">
): Promise<VideoJob> {
  const [row] = await db.insert(videoJob).values(data).returning();
  return row;
}

export async function updateVideoJob(
  id: string,
  patch: Partial<
    Omit<typeof videoJob.$inferInsert, "id" | "userId" | "createdAt">
  >
): Promise<void> {
  await db.update(videoJob).set(patch).where(eq(videoJob.id, id));
}

export async function listVideoJobsByUser(userId: string): Promise<VideoJob[]> {
  return db
    .select()
    .from(videoJob)
    .where(eq(videoJob.userId, userId))
    .orderBy(desc(videoJob.createdAt))
    .limit(50);
}

export async function getVideoJob(
  id: string,
  userId: string
): Promise<VideoJob | null> {
  const [row] = await db
    .select()
    .from(videoJob)
    .where(and(eq(videoJob.id, id), eq(videoJob.userId, userId)))
    .limit(1);
  return row ?? null;
}

export async function upsertSlackWorkspace(data: {
  teamId: string;
  teamName: string;
  botToken: string;
  botUserId: string;
  installedByUserId?: string | null;
}): Promise<SlackWorkspace> {
  const [row] = await db
    .insert(slackWorkspace)
    .values({ ...data, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: slackWorkspace.teamId,
      set: {
        teamName: data.teamName,
        botToken: data.botToken,
        botUserId: data.botUserId,
        updatedAt: new Date(),
      },
    })
    .returning();
  return row;
}

export async function getSlackWorkspaceByTeamId(
  teamId: string
): Promise<SlackWorkspace | null> {
  const [row] = await db
    .select()
    .from(slackWorkspace)
    .where(eq(slackWorkspace.teamId, teamId))
    .limit(1);
  return row ?? null;
}

export async function getUserOnboardingStatus(
  userId: string
): Promise<boolean> {
  const [row] = await db
    .select({ onboardingCompleted: user.onboardingCompleted })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  return row?.onboardingCompleted ?? false;
}

export async function markOnboardingComplete(userId: string) {
  return await db
    .update(user)
    .set({ onboardingCompleted: true })
    .where(eq(user.id, userId));
}

// Plugin tools
export async function getPluginTools(userId: string): Promise<PluginTool[]> {
  return db
    .select()
    .from(pluginTool)
    .where(eq(pluginTool.userId, userId))
    .orderBy(asc(pluginTool.createdAt));
}

export async function getEnabledPluginTools(
  userId: string
): Promise<PluginTool[]> {
  return db
    .select()
    .from(pluginTool)
    .where(and(eq(pluginTool.userId, userId), eq(pluginTool.enabled, true)));
}

export async function createPluginTool(data: {
  userId: string;
  name: string;
  description: string;
  parametersSchema: Record<string, any>;
  webhookUrl: string;
  authHeaderName?: string;
  authHeaderValueEncrypted?: string;
}): Promise<PluginTool> {
  const [tool] = await db.insert(pluginTool).values(data).returning();
  return tool;
}

export async function updatePluginTool(
  id: string,
  userId: string,
  data: { enabled?: boolean; name?: string; description?: string }
): Promise<PluginTool | null> {
  const [updated] = await db
    .update(pluginTool)
    .set(data)
    .where(and(eq(pluginTool.id, id), eq(pluginTool.userId, userId)))
    .returning();
  return updated ?? null;
}

export async function deletePluginTool(
  id: string,
  userId: string
): Promise<void> {
  await db
    .delete(pluginTool)
    .where(and(eq(pluginTool.id, id), eq(pluginTool.userId, userId)));
}

// SSO config queries
export async function getSsoConfigByDomain(
  domain: string
): Promise<OrganizationSsoConfig | null> {
  const [config] = await db
    .select()
    .from(organizationSsoConfig)
    .where(eq(organizationSsoConfig.emailDomain, domain.toLowerCase()));
  return config ?? null;
}

export async function getAllSsoConfigs(): Promise<OrganizationSsoConfig[]> {
  return db
    .select()
    .from(organizationSsoConfig)
    .orderBy(asc(organizationSsoConfig.createdAt));
}

export async function upsertSsoConfig(data: {
  organizationName: string;
  emailDomain: string;
  workosOrganizationId?: string;
  workosConnectionId?: string;
  idpMetadataUrl?: string;
  configuredByUserId: string;
}): Promise<OrganizationSsoConfig> {
  const [config] = await db
    .insert(organizationSsoConfig)
    .values({
      ...data,
      emailDomain: data.emailDomain.toLowerCase(),
    })
    .onConflictDoUpdate({
      target: organizationSsoConfig.emailDomain,
      set: {
        organizationName: data.organizationName,
        workosOrganizationId: data.workosOrganizationId,
        workosConnectionId: data.workosConnectionId,
        idpMetadataUrl: data.idpMetadataUrl,
        updatedAt: new Date(),
      },
    })
    .returning();
  return config;
}

export async function deleteSsoConfig(id: string): Promise<void> {
  await db
    .delete(organizationSsoConfig)
    .where(eq(organizationSsoConfig.id, id));
}

export async function isValidReferralCode(code: string): Promise<boolean> {
  const [found] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.referralCode, code))
    .limit(1);
  return !!found;
}

// BYOK — user-supplied provider API keys
export async function getUserProviderKey(
  userId: string,
  provider: string
): Promise<UserProviderKey | null> {
  const [row] = await db
    .select()
    .from(userProviderKey)
    .where(
      and(
        eq(userProviderKey.userId, userId),
        eq(userProviderKey.provider, provider)
      )
    )
    .limit(1);
  return row ?? null;
}

export async function upsertUserProviderKey(
  userId: string,
  provider: string,
  encryptedKey: string,
  keyPrefix: string
): Promise<UserProviderKey> {
  const [row] = await db
    .insert(userProviderKey)
    .values({ userId, provider, encryptedKey, keyPrefix })
    .onConflictDoUpdate({
      target: [userProviderKey.userId, userProviderKey.provider],
      set: { encryptedKey, keyPrefix, updatedAt: new Date() },
    })
    .returning();
  return row;
}

export async function deleteUserProviderKey(
  userId: string,
  provider: string
): Promise<void> {
  await db
    .delete(userProviderKey)
    .where(
      and(
        eq(userProviderKey.userId, userId),
        eq(userProviderKey.provider, provider)
      )
    );
}
