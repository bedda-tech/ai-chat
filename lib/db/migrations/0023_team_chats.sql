CREATE TABLE IF NOT EXISTS "TeamChat" (
  "teamId" uuid NOT NULL REFERENCES "Team"("id") ON DELETE CASCADE,
  "chatId" uuid NOT NULL REFERENCES "Chat"("id") ON DELETE CASCADE,
  "sharedBy" uuid NOT NULL REFERENCES "User"("id"),
  "sharedAt" timestamp NOT NULL DEFAULT NOW(),
  PRIMARY KEY ("teamId", "chatId")
);
