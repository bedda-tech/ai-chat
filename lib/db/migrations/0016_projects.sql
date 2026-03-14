CREATE TABLE IF NOT EXISTS "Project" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "userId" varchar(255) NOT NULL,
  "name" varchar(255) NOT NULL,
  "description" text,
  "instructions" text,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_User_id_fk"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "Chat" ADD COLUMN IF NOT EXISTS "projectId" uuid;
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_projectId_Project_id_fk"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
