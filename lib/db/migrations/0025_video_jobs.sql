CREATE TABLE "VideoJob" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"mode" varchar NOT NULL,
	"quality" varchar NOT NULL,
	"prompt" text NOT NULL,
	"sourceImageUrl" text,
	"videoUrl" text,
	"thumbnailUrl" text,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"errorMessage" text,
	"durationSeconds" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"completedAt" timestamp
);
--> statement-breakpoint
ALTER TABLE "VideoJob" ADD CONSTRAINT "VideoJob_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
