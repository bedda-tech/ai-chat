CREATE TABLE IF NOT EXISTS "OrganizationSsoConfig" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organizationName" varchar(255) NOT NULL,
  "emailDomain" varchar(255) NOT NULL UNIQUE,
  "workosOrganizationId" varchar(255),
  "workosConnectionId" varchar(255),
  "idpMetadataUrl" text,
  "configuredByUserId" uuid REFERENCES "User"("id") ON DELETE SET NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);
