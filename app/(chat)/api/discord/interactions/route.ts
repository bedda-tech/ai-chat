import { gateway } from "@ai-sdk/gateway";
import { generateText } from "ai";
import { after } from "next/server";

const DISCORD_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY ?? "";
const DISCORD_APP_ID = process.env.DISCORD_APP_ID ?? "";
const DISCORD_DEFAULT_MODEL =
  process.env.DISCORD_DEFAULT_MODEL ?? "anthropic/claude-haiku-4.5";

// Model aliases matching the Slack bot for consistency
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

function hexToArrayBuffer(hex: string): ArrayBuffer {
  const buf = Buffer.from(hex, "hex");
  return buf.buffer.slice(
    buf.byteOffset,
    buf.byteOffset + buf.byteLength
  ) as ArrayBuffer;
}

// Verify Discord's Ed25519 signature using Web Crypto API (no external deps)
async function verifySignature(
  publicKey: string,
  signature: string,
  timestamp: string,
  body: string
): Promise<boolean> {
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      hexToArrayBuffer(publicKey),
      "Ed25519",
      false,
      ["verify"]
    );
    const message = new TextEncoder().encode(timestamp + body);
    return await crypto.subtle.verify(
      "Ed25519",
      key,
      hexToArrayBuffer(signature),
      message
    );
  } catch {
    return false;
  }
}

async function editInteractionResponse(
  appId: string,
  token: string,
  content: string
): Promise<void> {
  const res = await fetch(
    `https://discord.com/api/v10/webhooks/${appId}/${token}/messages/@original`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: content.slice(0, 2000) }),
    }
  );
  if (!res.ok) {
    console.error(
      "[discord] editInteractionResponse failed:",
      res.status,
      await res.text()
    );
  }
}

interface DiscordOption {
  name: string;
  value: string;
}

export async function POST(req: Request) {
  if (!DISCORD_PUBLIC_KEY) {
    return new Response("Discord credentials not configured", { status: 503 });
  }

  const signature = req.headers.get("X-Signature-Ed25519") ?? "";
  const timestamp = req.headers.get("X-Signature-Timestamp") ?? "";

  if (!signature || !timestamp) {
    return new Response("Missing signature headers", { status: 401 });
  }

  const rawBody = await req.text();
  const isValid = await verifySignature(
    DISCORD_PUBLIC_KEY,
    signature,
    timestamp,
    rawBody
  );
  if (!isValid) {
    return new Response("Invalid signature", { status: 401 });
  }

  const body = JSON.parse(rawBody) as Record<string, unknown>;

  // Discord PING — must respond with PONG to verify the endpoint
  if (body.type === 1) {
    return Response.json({ type: 1 });
  }

  // Slash command (APPLICATION_COMMAND)
  if (body.type === 2) {
    if (!DISCORD_APP_ID) {
      return Response.json({
        type: 4,
        data: {
          content: "Bot is not fully configured (missing DISCORD_APP_ID).",
        },
      });
    }

    const data = body.data as Record<string, unknown> | undefined;
    const options = (data?.options ?? []) as DiscordOption[];
    const promptOpt = options.find((o) => o.name === "prompt");
    const modelOpt = options.find((o) => o.name === "model");
    const interactionToken = body.token as string;

    if (!promptOpt?.value?.trim()) {
      return Response.json({
        type: 4,
        data: { content: "Please provide a prompt." },
      });
    }

    const userText = promptOpt.value.trim();
    const modelAlias = (modelOpt?.value ?? "").toLowerCase().trim();
    const model = MODEL_ALIASES[modelAlias] ?? DISCORD_DEFAULT_MODEL;

    // Defer immediately — Discord requires a response within 3 seconds
    after(async () => {
      try {
        const { text: aiResponse } = await generateText({
          model: gateway.languageModel(model),
          system:
            "You are Bedda, a multi-model AI assistant inside Discord with access to Claude, GPT, Gemini, Grok, and 36+ AI models. Be helpful and concise. Use Discord markdown (** for bold, ``` for code blocks). Keep responses under 1900 characters when possible.",
          messages: [{ role: "user", content: userText }],
          maxOutputTokens: 1500,
        });

        await editInteractionResponse(
          DISCORD_APP_ID,
          interactionToken,
          aiResponse
        );
      } catch (err) {
        console.error("[discord] AI response error:", err);
        await editInteractionResponse(
          DISCORD_APP_ID,
          interactionToken,
          "Sorry, I ran into an error. Please try again."
        );
      }
    });

    // Type 5 = DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE (shows "Bot is thinking…")
    return Response.json({ type: 5 });
  }

  return new Response("OK");
}
