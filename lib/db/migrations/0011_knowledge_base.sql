-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Knowledge Base: uploaded documents
CREATE TABLE IF NOT EXISTS "KnowledgeBaseDocument" (
  "id" UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"("id"),
  "title" TEXT NOT NULL,
  "fileName" VARCHAR(255) NOT NULL,
  "fileType" VARCHAR(100) NOT NULL,
  "fileSize" INTEGER NOT NULL,
  "chunkCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Knowledge Base: vector chunks for RAG retrieval
CREATE TABLE IF NOT EXISTS "KnowledgeBaseChunk" (
  "id" UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "documentId" UUID NOT NULL REFERENCES "KnowledgeBaseDocument"("id") ON DELETE CASCADE,
  "userId" UUID NOT NULL REFERENCES "User"("id"),
  "content" TEXT NOT NULL,
  "chunkIndex" INTEGER NOT NULL,
  "embedding" vector(1536) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- IVFFlat index for fast approximate cosine similarity search
-- lists=100 is appropriate for up to ~1M vectors
CREATE INDEX IF NOT EXISTS "kbchunk_embedding_idx"
  ON "KnowledgeBaseChunk"
  USING ivfflat ("embedding" vector_cosine_ops)
  WITH (lists = 100);
