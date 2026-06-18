ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailUnsubscribed" boolean NOT NULL DEFAULT false;
