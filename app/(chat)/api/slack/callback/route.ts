/**
 * Slack OAuth callback
 * Exchanges the authorization code for a bot access token and persists
 * the workspace credentials so per-workspace token lookup works in events.
 */
import { auth } from "@/app/(auth)/auth";
import { upsertSlackWorkspace } from "@/lib/db/queries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  if (error || !code) {
    console.error("[slack] OAuth error:", error);
    return Response.redirect(`${appUrl}/?slack_error=${error ?? "unknown"}`);
  }

  const clientId = process.env.SLACK_CLIENT_ID ?? "";
  const clientSecret = process.env.SLACK_CLIENT_SECRET ?? "";

  const tokenRes = await fetch("https://slack.com/api/oauth.v2.access", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: `${appUrl}/api/slack/callback`,
    }),
  });

  const tokenData = (await tokenRes.json()) as {
    ok: boolean;
    access_token?: string;
    bot_user_id?: string;
    team?: { id: string; name: string };
    error?: string;
  };

  if (!tokenData.ok || !tokenData.access_token || !tokenData.team) {
    console.error("[slack] token exchange failed:", tokenData.error);
    return Response.redirect(`${appUrl}/?slack_error=oauth_failed`);
  }

  const session = await auth();

  await upsertSlackWorkspace({
    teamId: tokenData.team.id,
    teamName: tokenData.team.name,
    botToken: tokenData.access_token,
    botUserId: tokenData.bot_user_id ?? "",
    installedByUserId: session?.user?.id ?? null,
  });

  console.log(
    "[slack] workspace connected:",
    tokenData.team.name,
    tokenData.team.id
  );

  return Response.redirect(`${appUrl}/settings?slack_connected=1`);
}
