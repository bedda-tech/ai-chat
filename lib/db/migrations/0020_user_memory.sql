-- Migration: Cross-conversation user memory
CREATE TABLE IF NOT EXISTS "UserMemory" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "userId" uuid NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "content" text NOT NULL,
  "category" varchar(64) NOT NULL DEFAULT 'general',
  "sourceChat" uuid,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "UserMemory_userId_idx" ON "UserMemory"("userId");
