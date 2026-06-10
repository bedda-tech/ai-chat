-- Add projectId to KnowledgeBaseDocument and KnowledgeBaseChunk
-- Null = account-wide (accessible from any non-project chat)
-- Non-null = project-scoped (only used when the chat belongs to that project)

ALTER TABLE "KnowledgeBaseDocument"
  ADD COLUMN "projectId" uuid REFERENCES "Project"("id") ON DELETE CASCADE;

ALTER TABLE "KnowledgeBaseChunk"
  ADD COLUMN "projectId" uuid REFERENCES "Project"("id") ON DELETE CASCADE;

-- Indexes for project-scoped KB lookups
CREATE INDEX idx_kb_document_user_project ON "KnowledgeBaseDocument" ("userId", "projectId");
CREATE INDEX idx_kb_chunk_user_project ON "KnowledgeBaseChunk" ("userId", "projectId");
