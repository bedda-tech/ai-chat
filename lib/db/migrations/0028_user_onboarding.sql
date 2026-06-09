ALTER TABLE "User" ADD COLUMN "onboardingCompleted" boolean DEFAULT false;
-- Backfill existing users so they don't see the tour
UPDATE "User" SET "onboardingCompleted" = true;
