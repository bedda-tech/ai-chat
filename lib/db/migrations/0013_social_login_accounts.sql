-- Social login: OAuth account linking table
CREATE TABLE IF NOT EXISTS "Account" (
  "userId" uuid NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "provider" varchar(50) NOT NULL,
  "providerAccountId" varchar(255) NOT NULL,
  "accessToken" text,
  "refreshToken" text,
  "expiresAt" integer,
  "tokenType" varchar(50),
  "scope" text,
  "idToken" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  PRIMARY KEY ("provider", "providerAccountId")
);

CREATE INDEX IF NOT EXISTS "Account_userId_idx" ON "Account" ("userId");
