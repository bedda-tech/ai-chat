/**
 * Unit tests for pruneUIMessages.
 * Run with: npx tsx lib/utils.test.ts
 */
import assert from "node:assert/strict";
import { pruneUIMessages } from "./utils";
import type { ChatMessage } from "./types";

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

console.log("pruneUIMessages");

function makeMessage(id: string, text: string): ChatMessage {
  return {
    id,
    role: "user",
    parts: [{ type: "text", text }],
    metadata: {},
  } as ChatMessage;
}

test("returns messages unchanged when length <= 1", () => {
  const messages = [makeMessage("1", "hello")];
  const result = pruneUIMessages(messages, 1);
  assert.equal(result, messages);
});

test("returns empty array unchanged when length is 0", () => {
  const messages: ChatMessage[] = [];
  const result = pruneUIMessages(messages, 100);
  assert.equal(result, messages);
});

test("keeps all history when budget comfortably covers every message", () => {
  const messages = [
    makeMessage("1", "a".repeat(40)), // ~10 tokens
    makeMessage("2", "b".repeat(40)), // ~10 tokens
    makeMessage("3", "c".repeat(40)), // ~10 tokens, last message
  ];
  const result = pruneUIMessages(messages, 1000);
  assert.deepEqual(result, messages);
});

test("drops oldest history messages first when budget is tight", () => {
  const messages = [
    makeMessage("1", "a".repeat(40)), // ~10 tokens, should be dropped
    makeMessage("2", "b".repeat(40)), // ~10 tokens, should be kept
    makeMessage("3", "c".repeat(40)), // ~10 tokens, last message, always kept
  ];
  // Budget: last message costs ~10, leaving ~15 for history -> only message "2" fits.
  const result = pruneUIMessages(messages, 25);
  assert.deepEqual(
    result.map((m) => m.id),
    ["2", "3"],
  );
});

test("always keeps at least the last message even when it alone exceeds budget", () => {
  const messages = [
    makeMessage("1", "a".repeat(40)),
    makeMessage("2", "b".repeat(400)),
  ];
  const result = pruneUIMessages(messages, 1);
  assert.deepEqual(
    result.map((m) => m.id),
    ["2"],
  );
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
