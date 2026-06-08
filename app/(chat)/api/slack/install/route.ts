/**
 * Slack OAuth install redirect
 * Sends users to Slack's authorization page to add Bedda to their workspace.
 * After granting permissions, Slack redirects to /api/slack/callback.
 */
export async function GET() {
  const clientId = process.env.SLACK_CLIENT_ID;
  if (!clientId) {
    return new Response("Slack not configured — SLACK_CLIENT_ID missing", {
      status: 503,
    });
  }

  const scopes = [
    "app_mentions:read", // Receive @bedda mentions in channels
    "channels:history", // Read messages in public channels (needed for threaded context)
    "chat:write", // Post messages as the bot
    "im:history", // Read DMs to the bot
    "im:read", // View DMs info
    "im:write", // Send DMs
  ].join(",");

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/slack/callback`;

  const url = new URL("https://slack.com/oauth/v2/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("scope", scopes);
  url.searchParams.set("redirect_uri", redirectUri);

  return Response.redirect(url.toString());
}
