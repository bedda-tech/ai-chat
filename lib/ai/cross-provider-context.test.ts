/**
 * Unit tests for sanitizeMessagesForProvider.
 * Run with: npx tsx lib/ai/cross-provider-context.test.ts
 */
import assert from "node:assert/strict";
import type { ModelMessage } from "ai";
import { sanitizeMessagesForProvider } from "./cross-provider-context";

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err: unknown) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err instanceof Error ? err.message : String(err)}`);
    failed++;
  }
}

console.log("sanitizeMessagesForProvider");

// Helpers
const textMsg = (role: "user" | "assistant", text: string): ModelMessage =>
  ({
    role,
    content: [{ type: "text", text }],
  }) as ModelMessage;

const reasoningMsg = (text: string): ModelMessage =>
  ({
    role: "assistant",
    content: [
      { type: "reasoning", text },
      { type: "text", text: "answer" },
    ],
  }) as ModelMessage;

const imageMsg = (): ModelMessage =>
  ({
    role: "user",
    content: [{ type: "image", image: new URL("https://example.com/img.png") }],
  }) as ModelMessage;

const imageAndTextMsg = (): ModelMessage =>
  ({
    role: "user",
    content: [
      { type: "image", image: new URL("https://example.com/img.png") },
      { type: "text", text: "describe this" },
    ],
  }) as ModelMessage;

// --- Passthrough tests ---

test("passes messages unchanged when switching between Anthropic models", () => {
  const msgs = [
    textMsg("user", "hi"),
    reasoningMsg("thinking"),
    textMsg("user", "next"),
  ];
  const { messages, warnings } = sanitizeMessagesForProvider(
    msgs,
    "anthropic/claude-sonnet-4-6"
  );
  assert.equal(messages.length, 3, "message count unchanged");
  assert.equal(warnings.length, 0, "no warnings for Anthropic→Anthropic");
  // reasoning block preserved
  const asst = messages[1] as any;
  assert.equal(asst.content[0].type, "reasoning");
});

test("passes vision messages unchanged for vision-capable models", () => {
  const msgs = [imageMsg()];
  const { messages, warnings } = sanitizeMessagesForProvider(
    msgs,
    "openai/gpt-4o"
  );
  assert.equal(messages.length, 1);
  assert.equal((messages[0] as any).content[0].type, "image");
  assert.equal(warnings.length, 0);
});

test("plain-text messages are always passed through unchanged", () => {
  const msgs = [textMsg("user", "hello"), textMsg("assistant", "world")];
  const { messages, warnings } = sanitizeMessagesForProvider(
    msgs,
    "openai/gpt-5"
  );
  assert.deepEqual(messages, msgs);
  assert.equal(warnings.length, 0);
});

// --- Reasoning block stripping ---

test("strips reasoning blocks when switching to OpenAI", () => {
  const msgs = [reasoningMsg("I am thinking…")];
  const { messages, warnings } = sanitizeMessagesForProvider(
    msgs,
    "openai/gpt-5"
  );
  const asst = messages[0] as any;
  assert.equal(asst.content.length, 1, "reasoning part removed, text remains");
  assert.equal(asst.content[0].type, "text");
  assert.equal(warnings.length, 1);
  assert(
    warnings[0].toLowerCase().includes("reasoning"),
    "warning mentions reasoning"
  );
});

test("strips reasoning blocks when switching to Google", () => {
  const msgs = [reasoningMsg("thought")];
  const { messages, warnings } = sanitizeMessagesForProvider(
    msgs,
    "google/gemini-2.5-pro"
  );
  const asst = messages[0] as any;
  assert.equal(asst.content.length, 1);
  assert.equal(warnings.length, 1);
});

test("drops assistant turns that contain only reasoning (no text)", () => {
  const thinkingOnly: ModelMessage = {
    role: "assistant",
    content: [{ type: "reasoning", text: "just thinking" } as any],
  };
  const msgs = [thinkingOnly, textMsg("user", "follow-up")];
  const { messages, warnings } = sanitizeMessagesForProvider(
    msgs,
    "openai/gpt-5"
  );
  // The thinking-only turn should be dropped, leaving only the user turn
  assert.equal(messages.length, 1, "thinking-only assistant turn dropped");
  assert.equal((messages[0] as any).role, "user");
  assert.equal(warnings.length, 1);
});

// --- Image stripping ---

test("strips images for text-only models and emits a warning", () => {
  const msgs = [imageMsg()];
  const { messages, warnings } = sanitizeMessagesForProvider(
    msgs,
    "deepseek/deepseek-r1"
  );
  const user = messages[0] as any;
  assert.equal(user.content[0].type, "text", "replaced with placeholder text");
  assert(
    user.content[0].text.includes("Image removed"),
    "placeholder explains why"
  );
  assert.equal(warnings.length, 1);
  assert(
    warnings[0].toLowerCase().includes("image"),
    "warning mentions images"
  );
});

test("strips only image parts when message also contains text", () => {
  const msgs = [imageAndTextMsg()];
  const { messages, warnings } = sanitizeMessagesForProvider(
    msgs,
    "deepseek/deepseek-r1"
  );
  const user = messages[0] as any;
  assert.equal(user.content.length, 1, "image part removed, text part kept");
  assert.equal(user.content[0].type, "text");
  assert.equal(user.content[0].text, "describe this");
  assert.equal(warnings.length, 1);
});

// --- Combined cross-provider scenarios ---

test("handles full cross-provider switch: Anthropic→OpenAI with reasoning and images", () => {
  const msgs: ModelMessage[] = [
    textMsg("user", "hi"),
    reasoningMsg("thinking"),
    imageAndTextMsg(),
  ];
  const { messages, warnings } = sanitizeMessagesForProvider(
    msgs,
    "openai/gpt-5"
  );
  // openai/gpt-5 supports vision but not reasoning
  assert.equal(
    messages.length,
    3,
    "no turns dropped — gpt-5 is vision-capable"
  );
  const asst = messages[1] as any;
  assert.equal(asst.content.length, 1, "reasoning stripped from assistant");
  assert.equal(asst.content[0].type, "text");
  // image survives for GPT-5 (vision model)
  const user2 = messages[2] as any;
  const types = user2.content.map((p: any) => p.type);
  assert(types.includes("image"), "image kept for vision model");
  assert.equal(warnings.length, 1, "only reasoning warning, no image warning");
});

test("deduplicates warnings — one per category regardless of message count", () => {
  const msgs = [reasoningMsg("a"), reasoningMsg("b"), reasoningMsg("c")];
  const { warnings } = sanitizeMessagesForProvider(msgs, "openai/gpt-5");
  assert.equal(
    warnings.length,
    1,
    "one warning for reasoning regardless of how many turns"
  );
});

// --- Summary ---
console.log();
console.log(`${passed + failed} tests: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
}
