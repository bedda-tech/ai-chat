/**
 * Register Bedda's Telegram bot webhook with Telegram's Bot API.
 *
 * Usage:
 *   TELEGRAM_BOT_TOKEN=<token> NEXT_PUBLIC_APP_URL=https://www.bedda.tech \
 *     TELEGRAM_WEBHOOK_SECRET=<secret> node scripts/register-telegram-webhook.mjs
 *
 * Required env vars:
 *   TELEGRAM_BOT_TOKEN        — BotFather token (e.g. 123456:ABC-DEF...)
 *   NEXT_PUBLIC_APP_URL       — Production URL (default: https://www.bedda.tech)
 *
 * Optional:
 *   TELEGRAM_WEBHOOK_SECRET   — Random string sent as X-Telegram-Bot-Api-Secret-Token header
 *                               to verify requests are genuinely from Telegram. Recommended.
 *
 * Get a token from @BotFather on Telegram: https://t.me/BotFather
 * Create a bot with /newbot, then /setcommands:
 *   start - Get started with Bedda AI
 *   help  - Show available models and usage
 */

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.bedda.tech";
const SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

if (!TOKEN) {
  console.error("Error: TELEGRAM_BOT_TOKEN is required");
  process.exit(1);
}

const webhookUrl = `${APP_URL}/api/telegram/webhook`;
console.log("Registering webhook:", webhookUrl);

const body = {
  url: webhookUrl,
  allowed_updates: ["message"],
  drop_pending_updates: true,
};
if (SECRET) {
  body.secret_token = SECRET;
  console.log("Using webhook secret token for verification");
}

const res = await fetch(`https://api.telegram.org/bot${TOKEN}/setWebhook`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const data = await res.json();
if (data.ok) {
  console.log("✓ Webhook registered successfully:", data.description);
} else {
  console.error("✗ Webhook registration failed:", data);
  process.exit(1);
}

// Print webhook info
const infoRes = await fetch(
  `https://api.telegram.org/bot${TOKEN}/getWebhookInfo`
);
const info = await infoRes.json();
if (info.ok) {
  console.log("\nWebhook info:");
  console.log("  URL:", info.result.url);
  console.log("  Has custom cert:", info.result.has_custom_certificate);
  console.log("  Pending updates:", info.result.pending_update_count);
  if (info.result.last_error_message) {
    console.warn("  Last error:", info.result.last_error_message);
  }
}
