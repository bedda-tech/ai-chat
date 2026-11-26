CREATE TABLE IF NOT EXISTS "ScheduledTask" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"prompt" text NOT NULL,
	"modelId" varchar(255),
	"dayOfWeek" integer DEFAULT 1 NOT NULL,
	"hour" integer DEFAULT 9 NOT NULL,
	"timezone" varchar(64) DEFAULT 'UTC' NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"nextRunAt" timestamp NOT NULL,
	"lastRunAt" timestamp,
	"lastChatId" uuid,
	"lastError" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ScheduledTask" ADD CONSTRAINT "ScheduledTask_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ScheduledTask_due_idx" ON "ScheduledTask" ("enabled", "nextRunAt");
