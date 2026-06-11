import { generateText } from "ai";
import { after } from "next/server";
import { gateway } from "@ai-sdk/gateway";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN ?? "";
const APP_SECRET = process.env.WHATSAPP_APP_SECRET ?? "";
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN ?? "";
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID ?? "";
const DEFAULT_MODEL =
  process.env.WHATSAPP_DEFAULT_MODEL ?? "anthropic/claude-haiku-4.5";

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
  return { model: DEFAULT_MODEL, text: raw };
}

async function verifySignature(secret: string, payload: string, sig: string): Promise<boolean> {
  if (!secret) return true;
  const expected = sig.startsWith("sha256=") ? sig.slice(7) : sig;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const encoded = new TextEncoder().encode(payload);
  const buf = await crypto.subtle.sign("HMAC", key, encoded);
  const actual = Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return actual === expected;
}

async function sendMessage(to: string, text: string): Promise<void> {
  if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) return;
  const res = await fetch(
    `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text },
      }),
    }
  );
  if (!res.ok) {
    console.error("[whatsapp] sendMessage failed:", res.status, await res.text());
  }
}

// Webhook verification challenge (Meta sends GET to confirm endpoint)
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN && challenge) {
    return new Response(challenge, { status: 200 });
  }
  return new Response("Verification failed", { status: 403 });
}

interface WhatsAppMessage {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text?: { body: string };
}

interface WhatsAppValue {
  messaging_product: string;
  messages?: WhatsAppMessage[];
}

interface WhatsAppPayload {
  object: string;
  entry: Array<{
    changes: Array<{
      value: WhatsAppValue;
      field: string;
    }>;
  }>;
}

export async function POST(req: Request) {
  if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
    return new Response("WhatsApp not configured", { status: 503 });
  }

  const rawBody = await req.text();
  const sig = req.headers.get("X-Hub-Signature-256") ?? "";
  if (!(await verifySignature(APP_SECRET, rawBody, sig))) {
    return new Response("Invalid signature", { status: 401 });
  }

  let payload: WhatsAppPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }

  if (payload.object !== "whatsapp_business_account") {
    return new Response("OK");
  }

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field !== "messages") continue;
      for (const message of change.value.messages ?? []) {
        if (message.type !== "text" || !message.text?.body) continue;

        const from = message.from;
        const rawText = message.text.body.trim();

        if (!rawText || rawText === "/start" || rawText === "/help") {
          after(async () => {
            await sendMessage(
              from,
              "👋 Hi! I'm *Bedda* — an AI assistant with access to Claude, GPT-4o, Gemini, Grok, and 30+ models.\n\nJust send me a message! To pick a specific model, prefix with [alias]:\n• [claude-opus] — Claude Opus 4.8\n• [gpt-4o] — GPT-4o\n• [gemini-pro] — Gemini 2.5 Pro\n• [grok-3] — Grok 3\n\nVisit bedda.ai for the full web experience."
            );
          });
          continue;
        }

        const { model, text: userText } = parseModelAndText(rawText);

        after(async () => {
          try {
            const { text: aiResponse } = await generateText({
              model: gateway.languageModel(model),
              system:
                "You are Bedda, an AI assistant on WhatsApp with access to Claude, GPT, Gemini, Grok, and 30+ AI models. Be helpful and concise. Users can prefix messages with [model-alias] to choose a model, e.g. [gpt-4o], [claude-opus], [gemini-pro].",
              messages: [{ role: "user", content: userText }],
              maxOutputTokens: 1500,
            });

            await sendMessage(from, aiResponse);
          } catch (err) {
            console.error("[whatsapp] AI response error:", err);
            await sendMessage(from, "Sorry, I ran into an error. Please try again.");
          }
        });
      }
    }
  }

  return new Response("OK");
}
