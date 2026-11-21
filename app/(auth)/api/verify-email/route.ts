import { NextResponse } from "next/server";
import { markEmailVerified } from "@/lib/db/queries";
import { verifyEmailToken } from "@/lib/email/send-verification-email";

/**
 * GET /api/verify-email?uid=&exp=&token=
 * Confirms the email link from sendVerificationEmail, then sends the user home.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const uid = url.searchParams.get("uid") ?? "";
  const exp = Number(url.searchParams.get("exp"));
  const token = url.searchParams.get("token") ?? "";
  const home = new URL("/", url.origin);

  if (!uid || !verifyEmailToken(uid, exp, token)) {
    home.searchParams.set("emailVerified", "0");
    return NextResponse.redirect(home);
  }

  try {
    await markEmailVerified(uid);
    home.searchParams.set("emailVerified", "1");
  } catch (err) {
    console.error("[verify-email] failed to mark verified:", err);
    home.searchParams.set("emailVerified", "0");
  }
  return NextResponse.redirect(home);
}
