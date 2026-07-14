import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { auditLog } from "@/lib/db/schema";

const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

export type AuditAction =
  | "user.login"
  | "user.logout"
  | "chat.created"
  | "api_key.created"
  | "api_key.deleted"
  | "subscription.changed"
  | "team.member_invited"
  | "team.member_removed";

/** Records a structured audit event to the database; silently swallows errors so callers are never disrupted. */
export async function logAuditEvent(
  userId: string | null | undefined,
  action: AuditAction,
  metadata?: Record<string, unknown>,
  ipAddress?: string | null
): Promise<void> {
  try {
    await db.insert(auditLog).values({
      userId: userId ?? null,
      action,
      metadata: metadata ?? null,
      ipAddress: ipAddress ?? null,
    });
  } catch (err) {
    // Audit logging is non-critical — log but don't throw
    console.error("[audit] Failed to log event:", action, err);
  }
}
