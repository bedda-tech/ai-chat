-- Migration: Add UserPreferences table for custom instructions
CREATE TABLE IF NOT EXISTS "UserPreferences" (
  "userId" uuid PRIMARY KEY NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "customInstructions" text,
  "updatedAt" timestamp NOT NULL DEFAULT now()
);
