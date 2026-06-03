-- Add seat-based billing columns to Team table
ALTER TABLE "Team"
  ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" varchar(255),
  ADD COLUMN IF NOT EXISTS "seatLimit" integer NOT NULL DEFAULT 5;
