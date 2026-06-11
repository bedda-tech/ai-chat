CREATE TABLE "OrganizationModelPolicy" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "teamId" uuid NOT NULL UNIQUE REFERENCES "Team"("id") ON DELETE CASCADE,
  "allowedModelIds" jsonb,
  "deniedModelIds" jsonb,
  "monthlyCostCapUsdCents" integer NOT NULL DEFAULT 0,
  "updatedAt" timestamp NOT NULL DEFAULT now()
);
