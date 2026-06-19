import { and, desc, eq, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { NextResponse } from "next/server";
import postgres from "postgres";
import { auth } from "@/app/(auth)/auth";
import { auditLog } from "@/lib/db/schema";

const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes(email.toLowerCase());
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/audit-logs
 * Returns paginated audit log entries with optional filters.
 * Query params: page (default 1), limit (default 50, max 200),
 *   action (filter by action type), userId (filter by user),
 *   from (ISO date), to (ISO date)
 */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(
    1,
    Number.parseInt(searchParams.get("page") ?? "1", 10)
  );
  const limit = Math.min(
    200,
    Math.max(1, Number.parseInt(searchParams.get("limit") ?? "50", 10))
  );
  const offset = (page - 1) * limit;
  const actionFilter = searchParams.get("action");
  const userIdFilter = searchParams.get("userId");
  const fromFilter = searchParams.get("from");
  const toFilter = searchParams.get("to");

  const conditions = [];
  if (actionFilter) conditions.push(eq(auditLog.action, actionFilter));
  if (userIdFilter) conditions.push(eq(auditLog.userId, userIdFilter));
  if (fromFilter)
    conditions.push(gte(auditLog.createdAt, new Date(fromFilter)));
  if (toFilter) conditions.push(lte(auditLog.createdAt, new Date(toFilter)));

  const rows = await db
    .select()
    .from(auditLog)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(auditLog.createdAt))
    .limit(limit)
    .offset(offset);

  return NextResponse.json({
    logs: rows,
    page,
    limit,
    count: rows.length,
  });
}
