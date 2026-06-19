import { gateway } from "@ai-sdk/gateway";
import { generateText } from "ai";

const TEAMS_SECURITY_TOKEN = process.env.TEAMS_SECURITY_TOKEN ?? "";
const TEAMS_DEFAULT_MODEL =
  process.env.TEAMS_DEFAULT_MODEL ?? "google/gemini-2.0-flash-lite";

// Model aliases matching the other platform bots for consistency
const MODEL_ALIASES: Record<string, string> = {
  claude: "anthropic/claude-sonnet-4-6",
  "claude-opus": "anthropic/claude-opus-4-8",
  "claude-sonnet": "anthropic/claude-sonnet-4-6",
  "claude-haiku": "anthropic/claude-haiku-4.5",
  gpt: "openai/gpt-4o",
  "gpt-4o": "openai/gpt-4o",
  "gpt-4o-mini": "openai/gpt-4o-mini",
  gemini: "google/gemini-2.5-flash",
  "gemini-pro": "google/gemini-2.5-pro",
  grok: "xai/grok-3-mini",
  "grok-3": "xai/grok-3",
  mistral: "mistral/mistral-large-latest",
  deepseek: "deepseek/deepseek-r1",
};

// Verify Teams Outgoing Webhook HMAC-SHA256 signature.
// Teams sends Authorization: HMAC <base64(sha256(body, base64decode(token)))>
async function verifyHmac(
  body: ArrayBuffer,
  authHeader: string,
  token: string
): Promise<boolean> {
  try {
    const hmacMatch = authHeader.match(/^HMAC\s+(.+)$/i);
    if (!hmacMatch) return false;
    const receivedSig = hmacMatch[1].trim();

    const keyBytes = Buffer.from(token, "base64");
    const key = await crypto.subtle.importKey(
      "raw",
      keyBytes.buffer.slice(
        keyBytes.byteOffset,
        keyBytes.byteOffset + keyBytes.byteLength
      ) as ArrayBuffer,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const sigBuf = await crypto.subtle.sign("HMAC", key, body);
    const expected = Buffer.from(sigBuf).toString("base64");
    return expected === receivedSig;
  } catch {
    return false;
  }
}

function parseModelAndText(raw: string): { model: string; text: string } {
  const bracketMatch = raw.match(/^\[([^\]]+)\]\s*([\s\S]*)$/);
  if (bracketMatch) {
    const alias = bracketMatch[1].toLowerCase().trim();
    const model = MODEL_ALIASES[alias];
    if (model) return { model, text: bracketMatch[2].trim() };
  }
  const flagMatch = raw.match(/^--model=(\S+)\s*([\s\S]*)$/i);
  if (flagMatch) {
    const alias = flagMatch[1].toLowerCase();
    const model = MODEL_ALIASES[alias];
    if (model) return { model, text: flagMatch[2].trim() };
  }
  return { model: TEAMS_DEFAULT_MODEL, text: raw };
}

interface TeamsActivity {
  type: string;
  text?: string;
  textFormat?: string;
  from?: { id: string; name?: string };
}

export async function POST(req: Request) {
  if (!TEAMS_SECURITY_TOKEN) {
    return Response.json(
      {
        type: "message",
        text: "Teams bot not configured — TEAMS_SECURITY_TOKEN missing.",
      },
      { status: 200 }
    );
  }

  const bodyAB = await req.arrayBuffer();
  const authHeader = req.headers.get("Authorization") ?? "";

  const isValid = await verifyHmac(bodyAB, authHeader, TEAMS_SECURITY_TOKEN);
  if (!isValid) {
    return new Response("Invalid HMAC signature", { status: 401 });
  }

  const activity = JSON.parse(
    Buffer.from(bodyAB).toString("utf-8")
  ) as TeamsActivity;

  if (activity.type !== "message" || !activity.text) {
    return Response.json({ type: "message", text: "" });
  }

  // Strip XML <at>BotName</at> mention tags that Teams prepends to messages
  const cleanText = activity.text.replace(/<at>[^<]*<\/at>/gi, "").trim();

  if (!cleanText) {
    return Response.json({
      type: "message",
      text: "Hi! I'm **Bedda** — an AI assistant with access to Claude, GPT-4o, Gemini, Grok, and 30+ models. Just send me a message!\n\nPrefix with `[model]` to pick a model: `[claude-opus]`, `[gpt-4o]`, `[gemini-pro]`, `[grok-3]`, etc.",
    });
  }

  const { model, text: userText } = parseModelAndText(cleanText);

  try {
    const { text: aiResponse } = await generateText({
      model: gateway.languageModel(model),
      system:
        "You are Bedda, a multi-model AI assistant inside Microsoft Teams with access to Claude, GPT, Gemini, Grok, and 30+ AI models. Be helpful and concise. Teams supports basic Markdown. Users can prefix messages with [model-alias] to choose a model, e.g. [claude-opus], [gpt-4o], [gemini-pro]. Visit bedda.ai for the full web experience.",
      messages: [{ role: "user", content: userText }],
      maxOutputTokens: 1200,
    });

    return Response.json({ type: "message", text: aiResponse });
  } catch (err) {
    console.error("[ms-teams] AI response error:", err);
    return Response.json({
      type: "message",
      text: "Sorry, I ran into an error processing your request. Please try again.",
    });
  }
}
