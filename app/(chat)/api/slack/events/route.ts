import crypto from "node:crypto";
import { gateway } from "@ai-sdk/gateway";
import { generateText } from "ai";
import { after } from "next/server";
import { getSlackWorkspaceByTeamId } from "@/lib/db/queries";

const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET ?? "";
const SLACK_DEFAULT_MODEL =
  process.env.SLACK_DEFAULT_MODEL ?? "anthropic/claude-haiku-4.5";

// Friendly aliases users can type in Slack: [claude-opus], [gpt-4o], etc.
const MODEL_ALIASES: Record<string, string> = {
  claude: "anthropic/claude-sonnet-4-6",
  "claude-opus": "anthropic/claude-opus-4-8",
  "claude-sonnet": "anthropic/claude-sonnet-4-6",
  "claude-haiku": "anthropic/claude-haiku-4.5",
  gpt: "openai/gpt-5",
  "gpt-5": "openai/gpt-5",
  "gpt-5-mini": "openai/gpt-5-mini",
  "gpt-4o": "openai/gpt-4o",
  "gpt-4o-mini": "openai/gpt-4o-mini",
  gemini: "google/gemini-2.5-flash",
  "gemini-pro": "google/gemini-2.5-pro",
  grok: "xai/grok-4",
  "grok-4": "xai/grok-4",
  mistral: "mistral/mistral-large-latest",
  deepseek: "deepseek/deepseek-r1",
  "deepseek-v3": "deepseek/deepseek-v3.1",
  kimi: "moonshotai/kimi-k2-turbo",
};

// Parse optional model prefix at start of text: [alias] text  or  --model=alias text
function parseModelAndText(raw: string): { model: string; text: string } {
  const bracketMatch = raw.match(/^\[([^\]]+)\]\s*([\s\S]*)$/);
  if (bracketMatch) {
    const alias = bracketMatch[1].toLowerCase().trim();
    const model = MODEL_ALIASES[alias];
    if (model) {
      return { model, text: bracketMatch[2].trim() };
    }
  }
  const flagMatch = raw.match(/^--model=(\S+)\s*([\s\S]*)$/i);
  if (flagMatch) {
    const alias = flagMatch[1].toLowerCase();
    const model = MODEL_ALIASES[alias];
    if (model) {
      return { model, text: flagMatch[2].trim() };
    }
  }
  return { model: SLACK_DEFAULT_MODEL, text: raw };
}

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
  if (threadTs) {
    body.thread_ts = threadTs;
  }

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

type SlackMessage = {
  bot_id?: string;
  app_id?: string;
  subtype?: string;
  text?: string;
};

// Fetch prior messages in a thread to give the model conversation context.
// Returns all messages except the last one (the current event being handled).
async function fetchThreadHistory(
  botToken: string,
  channel: string,
  threadTs: string
): Promise<Array<{ role: "user" | "assistant"; content: string }>> {
  const url = `https://slack.com/api/conversations.replies?channel=${encodeURIComponent(channel)}&ts=${encodeURIComponent(threadTs)}&limit=20`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${botToken}` },
    });
    const data = (await res.json()) as {
      ok: boolean;
      messages?: SlackMessage[];
    };
    if (!data.ok || !data.messages || data.messages.length <= 1) {
      return [];
    }

    return data.messages
      .slice(0, -1) // exclude the current message being handled
      .filter((msg) => msg.text && !msg.subtype)
      .map((msg) => ({
        role: (msg.bot_id || msg.app_id ? "assistant" : "user") as
          | "user"
          | "assistant",
        content: (msg.text ?? "").replace(/<@[A-Z0-9]+>/g, "").trim(),
      }))
      .filter((msg) => msg.content.length > 0);
  } catch {
    return [];
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
  const age = Math.abs(Date.now() / 1000 - Number.parseInt(timestamp, 10));
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
  const rawText = (event.text as string).replace(/<@[A-Z0-9]+>/g, "").trim();
  if (!rawText) {
    return new Response("OK");
  }

  const { model, text: userText } = parseModelAndText(rawText);
  if (!userText) {
    return new Response("OK");
  }

  const channel = event.channel as string;
  const threadTs = ((event.thread_ts ?? event.ts) as string) || undefined;
  // A reply in an existing thread has thread_ts pointing to the parent message
  const isThreadReply =
    typeof event.thread_ts === "string" && event.thread_ts !== event.ts;
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
      // Load thread history for multi-turn conversation context
      const history =
        isThreadReply && threadTs
          ? await fetchThreadHistory(botToken, channel, threadTs)
          : [];

      const messages: Array<{ role: "user" | "assistant"; content: string }> = [
        ...history,
        { role: "user", content: userText },
      ];

      const { text: aiResponse } = await generateText({
        model: gateway.languageModel(model),
        system:
          "You are Bedda, an AI assistant inside Slack with access to Claude, GPT, Gemini, Grok, and 36+ AI models. Be helpful and concise — Slack is not a document editor. Use plain text; avoid markdown headers. Users can prefix messages with [model-alias] to choose a model, e.g. [gpt-5], [claude-opus], [grok-4], [gemini-pro].",
        messages,
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
