import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { clearModelsCache } from "@/lib/ai/models-cache";

function isAdmin(email: string | null | undefined): boolean {
  if (!email) {
    return false;
  }
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes(email.toLowerCase());
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const session = await auth();

  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  clearModelsCache();

  return NextResponse.json({
    success: true,
    message: "Model cache cleared successfully",
  });
}
