CREATE TABLE IF NOT EXISTS "UserProviderKey" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "userId" uuid NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "provider" varchar(32) NOT NULL,
  "encryptedKey" text NOT NULL,
  "keyPrefix" varchar(16) NOT NULL,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  UNIQUE("userId", "provider")
);
