import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { encode } from "next-auth/jwt";
import { logAuditEvent } from "@/lib/audit";
import { getOrCreateOAuthUser } from "@/lib/db/queries";
import { authenticateWithCode } from "@/lib/workos";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state");

  if (error) {
    redirect(`/login?sso_error=${encodeURIComponent(error)}`);
  }
  if (!code) {
    redirect("/login?sso_error=missing_code");
  }

  // Validate CSRF state param to prevent cross-site request forgery
  const cookieStore = await cookies();
  const expectedState = cookieStore.get("workos_sso_state")?.value;
  cookieStore.delete("workos_sso_state");
  if (!state || !expectedState) {
    redirect("/login?sso_error=missing_state");
  }
  try {
    if (!timingSafeEqual(Buffer.from(state), Buffer.from(expectedState))) {
      redirect("/login?sso_error=invalid_state");
    }
  } catch {
    redirect("/login?sso_error=invalid_state");
  }

  try {
    const { user: workosUser } = await authenticateWithCode(code);

    const { user: dbUser, isNew } = await getOrCreateOAuthUser(
      workosUser.email,
      "workos",
      workosUser.id,
      {}
    );

    void logAuditEvent(dbUser.id, "user.login", { provider: "workos-sso" });

    const isSecure = process.env.NODE_ENV === "production";
    const cookieName = isSecure
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token";

    const token = await encode({
      token: {
        id: dbUser.id,
        type: "regular" as const,
        email: dbUser.email,
        sub: dbUser.id,
      },
      secret: process.env.AUTH_SECRET!,
      maxAge: 30 * 24 * 60 * 60,
      salt: cookieName,
    });

    const cookieStore = await cookies();
    cookieStore.set(cookieName, token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });
  } catch (err) {
    console.error("WorkOS SSO callback error:", err);
    redirect("/login?sso_error=authentication_failed");
  }

  redirect("/");
}
