import type { InferSelectModel } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  integer,
  json,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
  vector,
} from "drizzle-orm/pg-core";
import type { AppUsage } from "../usage";

export const user = pgTable("User", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  email: varchar("email", { length: 64 }).notNull(),
  password: varchar("password", { length: 64 }),
  onboardingCompleted: boolean("onboardingCompleted").default(false),
});

export type User = InferSelectModel<typeof user>;

export const project = pgTable("Project", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  instructions: text("instructions"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type Project = InferSelectModel<typeof project>;

export const chat = pgTable("Chat", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  title: text("title").notNull(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  visibility: varchar("visibility", { enum: ["public", "private"] })
    .notNull()
    .default("private"),
  lastContext: jsonb("lastContext").$type<AppUsage | null>(),
  projectId: uuid("projectId").references(() => project.id, {
    onDelete: "set null",
  }),
});

export type Chat = InferSelectModel<typeof chat>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://chat-sdk.dev/docs/migration-guides/message-parts
export const messageDeprecated = pgTable("Message", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatId: uuid("chatId")
    .notNull()
    .references(() => chat.id),
  role: varchar("role").notNull(),
  content: json("content").notNull(),
  createdAt: timestamp("createdAt").notNull(),
});

export type MessageDeprecated = InferSelectModel<typeof messageDeprecated>;

export const message = pgTable("Message_v2", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatId: uuid("chatId")
    .notNull()
    .references(() => chat.id),
  role: varchar("role").notNull(),
  parts: json("parts").notNull(),
  attachments: json("attachments").notNull(),
  createdAt: timestamp("createdAt").notNull(),
  modelId: varchar("modelId", { length: 255 }),
});

export type DBMessage = InferSelectModel<typeof message>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://chat-sdk.dev/docs/migration-guides/message-parts
export const voteDeprecated = pgTable(
  "Vote",
  {
    chatId: uuid("chatId")
      .notNull()
      .references(() => chat.id),
    messageId: uuid("messageId")
      .notNull()
      .references(() => messageDeprecated.id),
    isUpvoted: boolean("isUpvoted").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.chatId, table.messageId] }),
  })
);

export type VoteDeprecated = InferSelectModel<typeof voteDeprecated>;

export const vote = pgTable(
  "Vote_v2",
  {
    chatId: uuid("chatId")
      .notNull()
      .references(() => chat.id),
    messageId: uuid("messageId")
      .notNull()
      .references(() => message.id),
    isUpvoted: boolean("isUpvoted").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.chatId, table.messageId] }),
  })
);

export type Vote = InferSelectModel<typeof vote>;

export const document = pgTable(
  "Document",
  {
    id: uuid("id").notNull().defaultRandom(),
    createdAt: timestamp("createdAt").notNull(),
    title: text("title").notNull(),
    content: text("content"),
    kind: varchar("text", { enum: ["text", "code", "image", "sheet", "mermaid", "html", "slides", "notebook"] })
      .notNull()
      .default("text"),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id, table.createdAt] }),
  })
);

export type Document = InferSelectModel<typeof document>;

export const suggestion = pgTable(
  "Suggestion",
  {
    id: uuid("id").notNull().defaultRandom(),
    documentId: uuid("documentId").notNull(),
    documentCreatedAt: timestamp("documentCreatedAt").notNull(),
    originalText: text("originalText").notNull(),
    suggestedText: text("suggestedText").notNull(),
    description: text("description"),
    isResolved: boolean("isResolved").notNull().default(false),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("createdAt").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  })
);

export type Suggestion = InferSelectModel<typeof suggestion>;

export const passwordResetToken = pgTable("PasswordResetToken", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  tokenHash: varchar("tokenHash", { length: 128 }).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  usedAt: timestamp("usedAt"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type PasswordResetToken = InferSelectModel<typeof passwordResetToken>;

export const stream = pgTable(
  "Stream",
  {
    id: uuid("id").notNull().defaultRandom(),
    chatId: uuid("chatId").notNull(),
    createdAt: timestamp("createdAt").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    chatRef: foreignKey({
      columns: [table.chatId],
      foreignColumns: [chat.id],
    }),
  })
);

export type Stream = InferSelectModel<typeof stream>;

// User tier and subscription management
export const userTier = pgTable("UserTier", {
  userId: uuid("userId")
    .primaryKey()
    .notNull()
    .references(() => user.id),
  tier: varchar("tier", { enum: ["free", "pro", "premium", "enterprise"] })
    .notNull()
    .default("free"),
  subscriptionId: varchar("subscriptionId", { length: 255 }),
  subscriptionStatus: varchar("subscriptionStatus", { length: 50 }),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").default(false),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type UserTier = InferSelectModel<typeof userTier>;

// User usage tracking (monthly aggregation)
export const userUsage = pgTable(
  "UserUsage",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    month: timestamp("month").notNull(), // First day of month

    // Message counts
    messageCount: varchar("messageCount", { length: 255 })
      .notNull()
      .default("0"),
    freeTierUsed: varchar("freeTierUsed", { length: 255 })
      .notNull()
      .default("0"),

    // Token counts (stored as strings to handle large numbers)
    inputTokens: varchar("inputTokens", { length: 255 }).notNull().default("0"),
    outputTokens: varchar("outputTokens", { length: 255 })
      .notNull()
      .default("0"),
    cachedTokens: varchar("cachedTokens", { length: 255 })
      .notNull()
      .default("0"),

    // Costs (in USD, stored as strings for precision)
    totalCost: varchar("totalCost", { length: 50 }).notNull().default("0"),
    cachedSavings: varchar("cachedSavings", { length: 50 })
      .notNull()
      .default("0"),

    // Timestamps
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.month] }),
  })
);

export type UserUsage = InferSelectModel<typeof userUsage>;

// Individual request tracking (detailed)
export const usageEvent = pgTable("UsageEvent", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),

  // Request metadata
  modelId: varchar("modelId", { length: 255 }).notNull(),
  provider: varchar("provider", { length: 50 }).notNull(),
  sessionId: uuid("sessionId"),

  // Tokens
  inputTokens: varchar("inputTokens", { length: 255 }).notNull(),
  outputTokens: varchar("outputTokens", { length: 255 }).notNull(),
  cachedTokens: varchar("cachedTokens", { length: 255 }).notNull().default("0"),
  totalTokens: varchar("totalTokens", { length: 255 }).notNull(),

  // Cost (stored as string for precision)
  cost: varchar("cost", { length: 50 }).notNull(),
  cachedSavings: varchar("cachedSavings", { length: 50 })
    .notNull()
    .default("0"),

  // Performance
  latencyMs: varchar("latencyMs", { length: 255 }), // Response time in milliseconds
  cacheHit: boolean("cacheHit").default(false),

  // Tools used
  toolsUsed: json("toolsUsed").$type<string[]>(),

  // Status
  success: boolean("success").default(true),
  errorType: varchar("errorType", { length: 100 }),

  // Timestamps
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type UsageEvent = InferSelectModel<typeof usageEvent>;

// Rate limiting tracking
export const rateLimit = pgTable(
  "RateLimit",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),

    // Rate limit type
    limitType: varchar("limitType", { length: 50 }).notNull(), // 'messages_per_minute', 'messages_per_day', etc.

    // Counts
    currentCount: varchar("currentCount", { length: 255 })
      .notNull()
      .default("0"),
    limitValue: varchar("limitValue", { length: 255 }).notNull(),

    // Time window
    windowStart: timestamp("windowStart").notNull(),
    windowEnd: timestamp("windowEnd").notNull(),

    // Reset tracking
    lastReset: timestamp("lastReset").notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.userId, table.limitType, table.windowStart],
    }),
  })
);

export type RateLimit = InferSelectModel<typeof rateLimit>;

// OAuth account linking (for social login providers)
export const account = pgTable(
  "Account",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    provider: varchar("provider", { length: 50 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    expiresAt: integer("expiresAt"),
    tokenType: varchar("tokenType", { length: 50 }),
    scope: text("scope"),
    idToken: text("idToken"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.provider, table.providerAccountId] }),
  })
);

export type Account = InferSelectModel<typeof account>;

// User preferences (custom instructions)
export const userPreferences = pgTable("UserPreferences", {
  userId: uuid("userId")
    .primaryKey()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  customInstructions: text("customInstructions"),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type UserPreferences = InferSelectModel<typeof userPreferences>;

// Knowledge Base: uploaded documents for RAG
export const knowledgeBaseDocument = pgTable("KnowledgeBaseDocument", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  projectId: uuid("projectId").references(() => project.id, {
    onDelete: "cascade",
  }),
  title: text("title").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileType: varchar("fileType", { length: 100 }).notNull(),
  fileSize: integer("fileSize").notNull(),
  chunkCount: integer("chunkCount").notNull().default(0),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type KnowledgeBaseDocument = InferSelectModel<
  typeof knowledgeBaseDocument
>;

// Knowledge Base: vector chunks for RAG retrieval
export const knowledgeBaseChunk = pgTable("KnowledgeBaseChunk", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  documentId: uuid("documentId")
    .notNull()
    .references(() => knowledgeBaseDocument.id, { onDelete: "cascade" }),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  projectId: uuid("projectId").references(() => project.id, {
    onDelete: "cascade",
  }),
  content: text("content").notNull(),
  chunkIndex: integer("chunkIndex").notNull(),
  embedding: vector("embedding", { dimensions: 1536 }).notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type KnowledgeBaseChunk = InferSelectModel<typeof knowledgeBaseChunk>;

// MCP (Model Context Protocol) server configurations per user
export const mcpServer = pgTable("McpServer", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  url: text("url").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  headers: json("headers").$type<Record<string, string>>().default({}),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type McpServer = InferSelectModel<typeof mcpServer>;

// Google Drive OAuth connection per user
export const driveConnection = pgTable("DriveConnection", {
  userId: uuid("userId")
    .primaryKey()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken").notNull(),
  refreshToken: text("refreshToken"),
  expiresAt: integer("expiresAt"),
  scope: text("scope"),
  connectedAt: timestamp("connectedAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type DriveConnection = InferSelectModel<typeof driveConnection>;

export const notionConnection = pgTable("NotionConnection", {
  userId: uuid("userId")
    .primaryKey()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken").notNull(),
  workspaceId: text("workspaceId"),
  workspaceName: text("workspaceName"),
  botId: text("botId"),
  connectedAt: timestamp("connectedAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type NotionConnection = InferSelectModel<typeof notionConnection>;

// Cross-conversation memory: facts the AI extracts and remembers about the user
export const userMemory = pgTable("UserMemory", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  category: varchar("category", { length: 64 }).notNull().default("general"),
  sourceChat: uuid("sourceChat"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type UserMemory = InferSelectModel<typeof userMemory>;

// API keys for programmatic access (OpenAI-compatible API)
export const apiKey = pgTable("ApiKey", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  keyHash: varchar("keyHash", { length: 128 }).notNull().unique(),
  keyPrefix: varchar("keyPrefix", { length: 12 }).notNull(), // e.g. "bai_abc1..."
  lastUsedAt: timestamp("lastUsedAt"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  revokedAt: timestamp("revokedAt"),
});

export type ApiKey = InferSelectModel<typeof apiKey>;

// Teams
export const team = pgTable("Team", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  ownerId: uuid("ownerId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  seatLimit: integer("seatLimit").notNull().default(5),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type Team = InferSelectModel<typeof team>;

export const teamMember = pgTable(
  "TeamMember",
  {
    teamId: uuid("teamId")
      .notNull()
      .references(() => team.id, { onDelete: "cascade" }),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: varchar("role", { enum: ["admin", "member"] })
      .notNull()
      .default("member"),
    joinedAt: timestamp("joinedAt").notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.teamId, table.userId] }),
  })
);

export type TeamMember = InferSelectModel<typeof teamMember>;

export const teamInvite = pgTable("TeamInvite", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  teamId: uuid("teamId")
    .notNull()
    .references(() => team.id, { onDelete: "cascade" }),
  email: varchar("email", { length: 255 }).notNull(),
  token: varchar("token", { length: 128 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  acceptedAt: timestamp("acceptedAt"),
});

export type TeamInvite = InferSelectModel<typeof teamInvite>;

export const teamChat = pgTable(
  "TeamChat",
  {
    teamId: uuid("teamId")
      .notNull()
      .references(() => team.id, { onDelete: "cascade" }),
    chatId: uuid("chatId")
      .notNull()
      .references(() => chat.id, { onDelete: "cascade" }),
    sharedBy: uuid("sharedBy")
      .notNull()
      .references(() => user.id),
    sharedAt: timestamp("sharedAt").notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.teamId, table.chatId] }),
  })
);

export type TeamChat = InferSelectModel<typeof teamChat>;

export const videoJob = pgTable("VideoJob", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  mode: varchar("mode", { enum: ["text-to-video", "image-to-video"] }).notNull(),
  quality: varchar("quality", { enum: ["standard", "pro"] }).notNull(),
  prompt: text("prompt").notNull(),
  sourceImageUrl: text("sourceImageUrl"),
  videoUrl: text("videoUrl"),
  thumbnailUrl: text("thumbnailUrl"),
  status: varchar("status", { enum: ["pending", "processing", "completed", "failed"] })
    .notNull()
    .default("pending"),
  errorMessage: text("errorMessage"),
  durationSeconds: integer("durationSeconds"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  completedAt: timestamp("completedAt"),
});

export type VideoJob = InferSelectModel<typeof videoJob>;

export const compareSession = pgTable("CompareSession", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }),
  modelIds: json("modelIds").notNull(),
  prompts: json("prompts").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type CompareSession = InferSelectModel<typeof compareSession>;

export const slackWorkspace = pgTable("SlackWorkspace", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  teamId: varchar("teamId", { length: 32 }).notNull().unique(),
  teamName: varchar("teamName", { length: 255 }).notNull(),
  botToken: text("botToken").notNull(),
  botUserId: varchar("botUserId", { length: 32 }).notNull(),
  installedByUserId: uuid("installedByUserId").references(() => user.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type SlackWorkspace = InferSelectModel<typeof slackWorkspace>;

export const auditLog = pgTable("AuditLog", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId").references(() => user.id, { onDelete: "set null" }),
  action: varchar("action", { length: 64 }).notNull(),
  metadata: jsonb("metadata"),
  ipAddress: varchar("ipAddress", { length: 64 }),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type AuditLog = InferSelectModel<typeof auditLog>;

// User-defined webhook plugin tools
export const pluginTool = pgTable("PluginTool", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description").notNull(),
  parametersSchema: jsonb("parametersSchema").notNull().$type<Record<string, any>>(),
  webhookUrl: text("webhookUrl").notNull(),
  authHeaderName: varchar("authHeaderName", { length: 255 }),
  authHeaderValueEncrypted: text("authHeaderValueEncrypted"),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type PluginTool = InferSelectModel<typeof pluginTool>;

export const organizationSsoConfig = pgTable("OrganizationSsoConfig", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  organizationName: varchar("organizationName", { length: 255 }).notNull(),
  emailDomain: varchar("emailDomain", { length: 255 }).notNull().unique(),
  workosOrganizationId: varchar("workosOrganizationId", { length: 255 }),
  workosConnectionId: varchar("workosConnectionId", { length: 255 }),
  idpMetadataUrl: text("idpMetadataUrl"),
  configuredByUserId: uuid("configuredByUserId").references(() => user.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type OrganizationSsoConfig = InferSelectModel<typeof organizationSsoConfig>;
