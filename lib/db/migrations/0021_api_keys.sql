CREATE TABLE IF NOT EXISTS "ApiKey" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "userId" uuid NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "name" varchar(255) NOT NULL,
  "keyHash" varchar(128) NOT NULL UNIQUE,
  "keyPrefix" varchar(12) NOT NULL,
  "lastUsedAt" timestamp,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "revokedAt" timestamp
);
