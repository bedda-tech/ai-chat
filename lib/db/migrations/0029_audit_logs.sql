CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "userId" uuid REFERENCES "User"("id") ON DELETE SET NULL,
  "action" varchar(64) NOT NULL,
  "metadata" jsonb,
  "ipAddress" varchar(64),
  "createdAt" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "audit_log_user_id_idx" ON "AuditLog" ("userId");
CREATE INDEX IF NOT EXISTS "audit_log_action_idx" ON "AuditLog" ("action");
CREATE INDEX IF NOT EXISTS "audit_log_created_at_idx" ON "AuditLog" ("createdAt" DESC);
