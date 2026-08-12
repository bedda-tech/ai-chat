-- Add referral tracking to User table
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "referralCode" varchar(16) UNIQUE,
  ADD COLUMN IF NOT EXISTS "referredBy" varchar(16);

-- Backfill referral codes for existing users.
-- Appends a per-row sequence number (unique within this batch) to a random
-- prefix so the backfill can't collide even across hundreds of thousands of
-- rows -- a plain random 8-hex-char code has a near-certain collision at
-- that scale per the birthday paradox.
WITH numbered AS (
  SELECT id, row_number() OVER (ORDER BY id) AS rn
  FROM "User"
  WHERE "referralCode" IS NULL
)
UPDATE "User" u
SET "referralCode" = lower(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))
  || lpad(to_hex(numbered.rn::int), 6, '0')
FROM numbered
WHERE u.id = numbered.id;

-- Index for fast lookup by referral code
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_referral_code ON "User"("referralCode")
  WHERE "referralCode" IS NOT NULL;
