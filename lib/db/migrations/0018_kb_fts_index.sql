-- Add full-text search GIN index to KnowledgeBaseChunk for hybrid (vector + BM25) retrieval.
-- The expression index on to_tsvector('english', content) enables efficient full-text
-- search without a stored computed column.
CREATE INDEX IF NOT EXISTS "kbchunk_fts_idx"
  ON "KnowledgeBaseChunk"
  USING gin (to_tsvector('english', content));
