import crypto from "crypto";
import { generateText } from "ai";
import { after } from "next/server";
import { gateway } from "@ai-sdk/gateway";
import { getSlackWorkspaceByTeamId } from "@/lib/db/queries";

const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET ?? "";
const SLACK_DEFAULT_MODEL =
  process.env.SLACK_DEFAULT_MODEL ?? "anthropic/claude-haiku-4.5";

function verifySlackSignature(
  secret: string,
  rawBody: string,
  timestamp: string,
  signature: string
): boolean {
  const base = `v0:${timestamp}:${rawBody}`;
  const hmac = crypto.createHmac("sha256", secret).update(base).digest("hex");
  const computed = `v0=${hmac}`;
  try {
    return crypto.timingSafeEqual(
      Buffer.from(computed, "utf8"),
      Buffer.from(signature, "utf8")
    );
  } catch {
    return false;
  }
}

async function postToSlack(
  botToken: string,
  channel: string,
  text: string,
  threadTs?: string
): Promise<void> {
  const body: Record<string, string> = { channel, text };
  if (threadTs) body.thread_ts = threadTs;

  const res = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${botToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.error("[slack] postMessage failed:", res.status, await res.text());
  }
}

export async function POST(req: Request) {
  if (!SLACK_SIGNING_SECRET) {
    return new Response("Slack credentials not configured", { status: 503 });
  }

  const rawBody = await req.text();
  const timestamp = req.headers.get("X-Slack-Request-Timestamp") ?? "";
  const slackSig = req.headers.get("X-Slack-Signature") ?? "";

  // Replay attack prevention: reject if request is older than 5 minutes
  const age = Math.abs(Date.now() / 1000 - parseInt(timestamp, 10));
  if (!timestamp || age > 300) {
    return new Response("Request timestamp too old", { status: 400 });
  }

  if (
    !verifySlackSignature(SLACK_SIGNING_SECRET, rawBody, timestamp, slackSig)
  ) {
    return new Response("Invalid signature", { status: 401 });
  }

  const body = JSON.parse(rawBody) as Record<string, unknown>;

  // Slack URL verification challenge (required when registering the Events API endpoint)
  if (body.type === "url_verification") {
    return Response.json({ challenge: body.challenge });
  }

  if (body.type !== "event_callback") {
    return new Response("OK");
  }

  const event = body.event as Record<string, unknown>;
  const isAppMention = event.type === "app_mention";
  const isDM =
    event.type === "message" &&
    event.channel_type === "im" &&
    !event.bot_id &&
    !event.subtype;

  if (!isAppMention && !isDM) {
    return new Response("OK");
  }

  // Extract user text — strip @mentions (e.g. <@U12345>)
  const userText = (event.text as string).replace(/<@[A-Z0-9]+>/g, "").trim();
  if (!userText) return new Response("OK");

  const channel = event.channel as string;
  const threadTs = ((event.thread_ts ?? event.ts) as string) || undefined;
  const teamId = (body.team_id as string) || "";

  // Look up per-workspace bot token; fall back to env var for single-workspace deploys
  const workspace = teamId ? await getSlackWorkspaceByTeamId(teamId) : null;
  const botToken = workspace?.botToken ?? process.env.SLACK_BOT_TOKEN ?? "";

  if (!botToken) {
    console.error("[slack] no bot token for team:", teamId);
    return new Response("OK");
  }

  // Run AI inference after responding 200 to Slack (Slack requires fast ACK)
  after(async () => {
    try {
      const { text: aiResponse } = await generateText({
        model: gateway.languageModel(SLACK_DEFAULT_MODEL),
        system:
          "You are Bedda, an AI assistant inside Slack with access to Claude, GPT, Gemini, Grok, and 30+ AI models. Be helpful and concise — Slack is not a document editor. Use plain text; avoid markdown headers.",
        prompt: userText,
        maxOutputTokens: 1500,
      });

      await postToSlack(botToken, channel, aiResponse, threadTs);
    } catch (err) {
      console.error("[slack] AI response error:", err);
      await postToSlack(
        botToken,
        channel,
        "Sorry, I ran into an error. Please try again.",
        threadTs
      );
    }
  });

  return new Response("OK");
}
