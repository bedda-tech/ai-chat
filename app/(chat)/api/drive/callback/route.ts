import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { saveDriveConnection } from "@/lib/db/queries";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/drive?error=unauthorized`
    );
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/drive?error=${error}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/drive?error=no_code`
    );
  }

  // Verify state matches session user
  const expectedState = Buffer.from(session.user.id).toString("base64");
  if (state !== expectedState) {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/drive?error=invalid_state`
    );
  }

  const redirectUri = `${process.env.NEXTAUTH_URL}/api/drive/callback`;

  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/drive?error=token_exchange_failed`
    );
  }

  const tokens = await tokenRes.json();

  await saveDriveConnection(session.user.id, {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token ?? null,
    expiresAt: tokens.expires_in
      ? Math.floor(Date.now() / 1000) + tokens.expires_in
      : null,
    scope: tokens.scope ?? null,
  });

  return NextResponse.redirect(
    `${process.env.NEXTAUTH_URL}/drive?connected=true`
  );
}
