-- Add referral tracking to User table
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "referralCode" varchar(16) UNIQUE,
  ADD COLUMN IF NOT EXISTS "referredBy" varchar(16);

-- Backfill referral codes for existing users
UPDATE "User"
SET "referralCode" = lower(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))
WHERE "referralCode" IS NULL;

-- Index for fast lookup by referral code
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_referral_code ON "User"("referralCode")
  WHERE "referralCode" IS NOT NULL;
