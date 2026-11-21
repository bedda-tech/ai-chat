ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerifiedAt" TIMESTAMP;
--> statement-breakpoint
-- Grandfather every account that already exists so current users keep access
-- to billing. Only accounts created after this migration must verify.
UPDATE "User" SET "emailVerifiedAt" = now() WHERE "emailVerifiedAt" IS NULL;
