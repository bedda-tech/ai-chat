-- User-defined webhook plugin tools
CREATE TABLE IF NOT EXISTS "PluginTool" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "userId" uuid NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "name" varchar(128) NOT NULL,
  "description" text NOT NULL,
  "parametersSchema" jsonb NOT NULL DEFAULT '{}',
  "webhookUrl" text NOT NULL,
  "authHeaderName" varchar(255),
  "authHeaderValueEncrypted" text,
  "enabled" boolean NOT NULL DEFAULT true,
  "createdAt" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "plugin_tool_user_idx" ON "PluginTool" ("userId");
