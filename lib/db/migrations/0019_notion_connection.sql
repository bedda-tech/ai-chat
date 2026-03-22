CREATE TABLE IF NOT EXISTS "NotionConnection" (
  "userId" uuid PRIMARY KEY NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "accessToken" text NOT NULL,
  "workspaceId" text,
  "workspaceName" text,
  "botId" text,
  "connectedAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);
