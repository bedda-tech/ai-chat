-- Add modelId column to Message_v2 table to track which AI model generated each message
ALTER TABLE "Message_v2" ADD COLUMN "modelId" VARCHAR(255);
