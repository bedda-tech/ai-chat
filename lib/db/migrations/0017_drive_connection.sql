CREATE TABLE IF NOT EXISTS "DriveConnection" (
  "userId" uuid PRIMARY KEY NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "accessToken" text NOT NULL,
  "refreshToken" text,
  "expiresAt" integer,
  "scope" text,
  "connectedAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);
