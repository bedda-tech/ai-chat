#!/usr/bin/env node
// Register the /bedda slash command with Discord's API.
// Run once (or after changing command definitions):
//   DISCORD_APP_ID=... DISCORD_BOT_TOKEN=... node scripts/register-discord-commands.mjs
//
// Finds application commands at: https://discord.com/developers/applications

const appId = process.env.DISCORD_APP_ID;
const token = process.env.DISCORD_BOT_TOKEN;

if (!appId || !token) {
  console.error("Error: DISCORD_APP_ID and DISCORD_BOT_TOKEN must be set.");
  process.exit(1);
}

const commands = [
  {
    name: "bedda",
    description: "Ask Bedda — your multi-model AI assistant (Claude, GPT, Gemini, Grok & more)",
    options: [
      {
        name: "prompt",
        description: "What do you want to ask?",
        type: 3, // STRING
        required: true,
      },
      {
        name: "model",
        description: "AI model to use (claude, gpt, gemini, grok, mistral, deepseek…)",
        type: 3, // STRING
        required: false,
        choices: [
          { name: "Claude Sonnet (default)", value: "claude" },
          { name: "Claude Opus", value: "claude-opus" },
          { name: "Claude Haiku (fast)", value: "claude-haiku" },
          { name: "GPT-4o", value: "gpt-4o" },
          { name: "GPT-4o Mini (fast)", value: "gpt-4o-mini" },
          { name: "Gemini 2.5 Flash", value: "gemini" },
          { name: "Gemini 2.5 Pro", value: "gemini-pro" },
          { name: "Grok 3", value: "grok-3" },
          { name: "Mistral Large", value: "mistral" },
          { name: "DeepSeek R1", value: "deepseek" },
        ],
      },
    ],
  },
];

const url = `https://discord.com/api/v10/applications/${appId}/commands`;
const res = await fetch(url, {
  method: "PUT",
  headers: {
    Authorization: `Bot ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(commands),
});

if (!res.ok) {
  const text = await res.text();
  console.error("Failed to register commands:", res.status, text);
  process.exit(1);
}

const data = await res.json();
console.log(`Registered ${data.length} command(s):`);
for (const cmd of data) {
  console.log(`  /${cmd.name} (id: ${cmd.id})`);
}
console.log("\nDone. Set your Discord app's Interactions Endpoint URL to:");
console.log(`  https://www.bedda.tech/api/discord/interactions`);
