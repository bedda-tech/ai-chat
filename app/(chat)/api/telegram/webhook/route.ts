import { gateway } from "@ai-sdk/gateway";
import { generateText } from "ai";
import { after } from "next/server";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET ?? "";
const DEFAULT_MODEL =
  process.env.TELEGRAM_DEFAULT_MODEL ?? "anthropic/claude-haiku-4.5";

// Same model alias map as Slack and Discord bots
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

async function sendMessage(
  chatId: number,
  text: string,
  replyToMessageId?: number
): Promise<void> {
  const body: Record<string, unknown> = {
    chat_id: chatId,
    text,
    parse_mode: "Markdown",
  };
  if (replyToMessageId) body.reply_to_message_id = replyToMessageId;

  const res = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    console.error(
      "[telegram] sendMessage failed:",
      res.status,
      await res.text()
    );
  }
}

interface TelegramEntity {
  type: string;
  offset: number;
  length: number;
}

interface TelegramMessage {
  message_id: number;
  chat: { id: number; type: string };
  from?: { id: number; first_name?: string; username?: string };
  text?: string;
  entities?: TelegramEntity[];
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

export async function POST(req: Request) {
  if (!BOT_TOKEN) {
    return new Response(
      "Telegram not configured — TELEGRAM_BOT_TOKEN missing",
      {
        status: 503,
      }
    );
  }

  // Verify Telegram's secret token header
  const secret = req.headers.get("X-Telegram-Bot-Api-Secret-Token") ?? "";
  if (WEBHOOK_SECRET && secret !== WEBHOOK_SECRET) {
    return new Response("Invalid token", { status: 401 });
  }

  const update = (await req.json()) as TelegramUpdate;
  const message = update.message;
  if (!message?.text) return new Response("OK");

  const chatId = message.chat.id;
  const messageId = message.message_id;
  const isGroup =
    message.chat.type === "group" || message.chat.type === "supergroup";

  let rawText = message.text.trim();

  if (isGroup) {
    // In groups, only respond when bot is @mentioned or /bedda command is used
    const hasMention = message.entities?.some((e) => e.type === "mention");
    const isBotCommand =
      rawText.startsWith("/bedda") ||
      message.entities?.some((e) => e.type === "bot_command");
    if (!hasMention && !isBotCommand) return new Response("OK");

    // Strip bot username mentions and the /bedda command prefix
    rawText = rawText
      .replace(/@\w+/g, "")
      .replace(/^\/bedda\b/, "")
      .trim();
  }

  // Handle /start or empty text with a help message
  if (!rawText || rawText === "/start") {
    after(async () => {
      await sendMessage(
        chatId,
        "👋 Hi! I'm *Bedda* — an AI assistant with access to Claude, GPT-5, Gemini, Grok, and 36+ models.\n\nJust send me a message! To pick a specific model, prefix with \\[alias\\]:\n• `[claude-opus]` — Claude Opus 4.8\n• `[gpt-5]` — GPT-5\n• `[gemini-pro]` — Gemini 2.5 Pro\n• `[grok-4]` — Grok 4\n\nOr use `--model=alias` syntax.\n\nVisit bedda.ai for the full web experience.",
        undefined
      );
    });
    return new Response("OK");
  }

  const { model, text: userText } = parseModelAndText(rawText);

  after(async () => {
    try {
      const { text: aiResponse } = await generateText({
        model: gateway.languageModel(model),
        system:
          "You are Bedda, an AI assistant on Telegram with access to Claude, GPT, Gemini, Grok, and 36+ AI models. Be helpful and concise — Telegram supports basic Markdown. Users can prefix messages with [model-alias] to choose a model, e.g. [gpt-5], [claude-opus], [grok-4], [gemini-pro].",
        messages: [{ role: "user", content: userText }],
        maxOutputTokens: 1500,
      });

      await sendMessage(chatId, aiResponse, messageId);
    } catch (err) {
      console.error("[telegram] AI response error:", err);
      await sendMessage(
        chatId,
        "Sorry, I ran into an error. Please try again.",
        messageId
      );
    }
  });

  return new Response("OK");
}
