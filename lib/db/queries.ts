import "server-only";

import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  inArray,
  lt,
  sql,
  type SQL,
} from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import type { ArtifactKind } from "@/components/artifact";
import type { VisibilityType } from "@/components/visibility-selector";
import { ChatSDKError } from "../errors";
import type { AppUsage } from "../usage";
import { generateUUID } from "../utils";
import {
  account,
  type Chat,
  chat,
  type DBMessage,
  document,
  type KnowledgeBaseDocument,
  knowledgeBaseChunk,
  knowledgeBaseDocument,
  message,
  passwordResetToken,
  type Suggestion,
  stream,
  suggestion,
  type User,
  user,
  vote,
} from "./schema";
import { generateHashedPassword } from "./utils";

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

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

export async function createUser(email: string, password: string) {
  const hashedPassword = generateHashedPassword(password);

  try {
    return await db.insert(user).values({ email, password: hashedPassword });
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to create user");
  }
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
}: {
  id: string;
  userId: string;
  title: string;
  visibility: VisibilityType;
}) {
  try {
    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      userId,
      title,
      visibility,
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

    const chatIds = userChats.map(c => c.id);

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
}: {
  id: string;
  limit: number;
  startingAfter: string | null;
  endingBefore: string | null;
}) {
  try {
    const extendedLimit = limit + 1;

    const query = (whereCondition?: SQL<any>) =>
      db
        .select()
        .from(chat)
        .where(
          whereCondition
            ? and(whereCondition, eq(chat.userId, id))
            : eq(chat.userId, id)
        )
        .orderBy(desc(chat.createdAt))
        .limit(extendedLimit);

    let filteredChats: Chat[] = [];

    if (startingAfter) {
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

      filteredChats = await query(gt(chat.createdAt, selectedChat.createdAt));
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

      filteredChats = await query(lt(chat.createdAt, selectedChat.createdAt));
    } else {
      filteredChats = await query();
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
  title,
  fileName,
  fileType,
  fileSize,
}: {
  userId: string;
  title: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}): Promise<KnowledgeBaseDocument> {
  const [doc] = await db
    .insert(knowledgeBaseDocument)
    .values({ userId, title, fileName, fileType, fileSize })
    .returning();
  return doc;
}

export async function saveKBChunks({
  documentId,
  userId,
  chunks,
}: {
  documentId: string;
  userId: string;
  chunks: Array<{ content: string; chunkIndex: number; embedding: number[] }>;
}) {
  if (chunks.length === 0) return;
  await db.insert(knowledgeBaseChunk).values(
    chunks.map((c) => ({
      documentId,
      userId,
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
  userId: string
): Promise<KnowledgeBaseDocument[]> {
  return db
    .select()
    .from(knowledgeBaseDocument)
    .where(eq(knowledgeBaseDocument.userId, userId))
    .orderBy(desc(knowledgeBaseDocument.createdAt));
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
  queryEmbedding,
  limit = 5,
  similarityThreshold = 0.3,
}: {
  userId: string;
  queryEmbedding: number[];
  limit?: number;
  similarityThreshold?: number;
}): Promise<
  Array<{ content: string; documentTitle: string; similarity: number }>
> {
  const vectorStr = `[${queryEmbedding.join(",")}]`;
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
    throw new ChatSDKError("bad_request:database", "Failed to get OAuth account");
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
): Promise<User> {
  // Check if this OAuth account is already linked
  const existingAccount = await getOAuthAccount(provider, providerAccountId);
  if (existingAccount) {
    const [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, existingAccount.userId));
    if (existingUser) return existingUser;
  }

  // Look up user by email (link existing email account)
  const existingUsers = await getUser(email);
  let userId: string;

  if (existingUsers.length > 0) {
    userId = existingUsers[0].id;
  } else {
    // Create a new user (no password — OAuth only)
    const [newUser] = await db
      .insert(user)
      .values({ email, password: null })
      .returning();
    userId = newUser.id;
  }

  // Link the OAuth account
  await createOAuthAccount(userId, provider, providerAccountId, tokens);

  const [linkedUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId));
  return linkedUser;
}
