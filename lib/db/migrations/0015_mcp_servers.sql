-- MCP server configurations per user
CREATE TABLE IF NOT EXISTS "McpServer" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "userId" uuid NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "name" varchar(255) NOT NULL,
  "url" text NOT NULL,
  "enabled" boolean NOT NULL DEFAULT true,
  "headers" json DEFAULT '{}',
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "mcp_server_user_idx" ON "McpServer" ("userId");
