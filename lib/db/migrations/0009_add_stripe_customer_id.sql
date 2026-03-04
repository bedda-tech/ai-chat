-- Add stripeCustomerId column to UserTier table
ALTER TABLE "UserTier" ADD COLUMN IF NOT EXISTS "stripeCustomerId" VARCHAR(255);
