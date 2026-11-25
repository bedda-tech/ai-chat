CREATE TABLE IF NOT EXISTS "PublishedPage" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "slug" varchar(24) NOT NULL UNIQUE,
  "userId" uuid NOT NULL REFERENCES "User"("id"),
  "documentId" uuid NOT NULL,
  "title" text NOT NULL,
  "kind" varchar(20) NOT NULL,
  "content" text NOT NULL,
  "reviewedClean" boolean DEFAULT false NOT NULL,
  "unpublishedAt" timestamp,
  "hiddenByReports" boolean DEFAULT false NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "PublishedPage_user_doc_idx" ON "PublishedPage" ("userId", "documentId");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PublishedPageReport" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "pageId" uuid NOT NULL REFERENCES "PublishedPage"("id"),
  "reason" text NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL
);
