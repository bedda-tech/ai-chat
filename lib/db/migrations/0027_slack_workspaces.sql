CREATE TABLE IF NOT EXISTS "SlackWorkspace" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "teamId" varchar(32) NOT NULL UNIQUE,
  "teamName" varchar(255) NOT NULL,
  "botToken" text NOT NULL,
  "botUserId" varchar(32) NOT NULL,
  "installedByUserId" uuid REFERENCES "User"("id") ON DELETE SET NULL,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);
