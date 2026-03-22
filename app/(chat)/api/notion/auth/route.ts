import { auth } from "@/app/(auth)/auth";
import { NextResponse } from "next/server";

const NOTION_OAUTH_URL = "https://api.notion.com/v1/oauth/authorize";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientId = process.env.NOTION_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "Notion OAuth not configured" }, { status: 500 });
  }

  const redirectUri = `${process.env.NEXTAUTH_URL}/api/notion/callback`;
  const state = Buffer.from(session.user.id).toString("base64");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    owner: "user",
    state,
  });

  return NextResponse.redirect(`${NOTION_OAUTH_URL}?${params.toString()}`);
}
