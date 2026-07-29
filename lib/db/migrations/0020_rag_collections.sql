-- RAG: Document collections (named knowledge bases)
CREATE TABLE IF NOT EXISTS "DocumentCollection" (
  "id" UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "chunkSize" INTEGER NOT NULL DEFAULT 1000,
  "chunkOverlap" INTEGER NOT NULL DEFAULT 200,
  "embeddingModel" VARCHAR(100) NOT NULL DEFAULT 'text-embedding-3-small',
  "documentCount" INTEGER NOT NULL DEFAULT 0,
  "chunkCount" INTEGER NOT NULL DEFAULT 0,
  "totalTokens" BIGINT NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "doccollection_user_idx" ON "DocumentCollection" ("userId");

-- Add collection grouping and processing metadata to existing documents
ALTER TABLE "KnowledgeBaseDocument"
  ADD COLUMN IF NOT EXISTS "collectionId" UUID REFERENCES "DocumentCollection"("id") ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "status" VARCHAR(50) NOT NULL DEFAULT 'ready',
  ADD COLUMN IF NOT EXISTS "content" TEXT,
  ADD COLUMN IF NOT EXISTS "summary" TEXT,
  ADD COLUMN IF NOT EXISTS "fileUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "tokenCount" INTEGER,
  ADD COLUMN IF NOT EXISTS "errorMessage" TEXT,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS "kbdoc_collection_idx" ON "KnowledgeBaseDocument" ("collectionId");
CREATE INDEX IF NOT EXISTS "kbdoc_status_idx" ON "KnowledgeBaseDocument" ("status");

-- Add metadata to chunks for page numbers, sections, etc.
ALTER TABLE "KnowledgeBaseChunk"
  ADD COLUMN IF NOT EXISTS "metadata" JSONB,
  ADD COLUMN IF NOT EXISTS "tokenCount" INTEGER;

-- RAG: Search query analytics
CREATE TABLE IF NOT EXISTS "SearchQuery" (
  "id" UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "collectionId" UUID REFERENCES "DocumentCollection"("id") ON DELETE SET NULL,
  "documentId" UUID REFERENCES "KnowledgeBaseDocument"("id") ON DELETE SET NULL,
  "query" TEXT NOT NULL,
  "resultsCount" INTEGER,
  "responseTimeMs" INTEGER,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "searchquery_user_idx" ON "SearchQuery" ("userId");
CREATE INDEX IF NOT EXISTS "searchquery_collection_idx" ON "SearchQuery" ("collectionId");
