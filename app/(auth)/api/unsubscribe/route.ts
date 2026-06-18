import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { type NextRequest, NextResponse } from "next/server";
import postgres from "postgres";
import * as schema from "@/lib/db/schema";
import { verifyUnsubToken } from "@/lib/email/unsub-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  if (!uid || !token || !verifyUnsubToken(uid, token)) {
    return NextResponse.redirect(new URL("/unsubscribed?error=1", req.url));
  }

  if (!process.env.POSTGRES_URL) {
    return NextResponse.redirect(new URL("/unsubscribed?error=1", req.url));
  }

  const client = postgres(process.env.POSTGRES_URL);
  const db = drizzle(client, { schema });

  try {
    await db
      .update(schema.user)
      .set({ emailUnsubscribed: true })
      .where(eq(schema.user.id, uid));
  } finally {
    await client.end();
  }

  return NextResponse.redirect(new URL("/unsubscribed", req.url));
}
