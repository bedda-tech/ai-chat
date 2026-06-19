import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { saveNotionConnection } from "@/lib/db/queries";

const NOTION_TOKEN_URL = "https://api.notion.com/v1/oauth/token";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/notion?error=unauthorized`
    );
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/notion?error=${error}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/notion?error=no_code`
    );
  }

  const expectedState = Buffer.from(session.user.id).toString("base64");
  if (state !== expectedState) {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/notion?error=invalid_state`
    );
  }

  const redirectUri = `${process.env.NEXTAUTH_URL}/api/notion/callback`;

  const credentials = Buffer.from(
    `${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`
  ).toString("base64");

  const tokenRes = await fetch(NOTION_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/notion?error=token_exchange_failed`
    );
  }

  const tokens = await tokenRes.json();

  await saveNotionConnection(session.user.id, {
    accessToken: tokens.access_token,
    workspaceId: tokens.workspace_id ?? null,
    workspaceName: tokens.workspace_name ?? null,
    botId: tokens.bot_id ?? null,
  });

  return NextResponse.redirect(
    `${process.env.NEXTAUTH_URL}/notion?connected=true`
  );
}
