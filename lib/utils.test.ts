/**
 * Unit tests for lib/utils.ts pure helpers.
 * Run with: npx tsx lib/utils.test.ts
 */
import assert from "node:assert/strict";
import {
  getDocumentTimestampByIndex,
  getMostRecentUserMessage,
  getTextFromMessage,
  getTrailingMessageId,
  pruneUIMessages,
  sanitizeText,
} from "./utils";
import type { ChatMessage } from "./types";
import type { Document } from "@/lib/db/schema";

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

console.log("sanitizeText");

test("strips the <has_function_call> marker", () => {
  assert.equal(
    sanitizeText("hello <has_function_call> world"),
    "hello  world",
  );
});

test("returns text unchanged when the marker is absent", () => {
  assert.equal(sanitizeText("plain text"), "plain text");
});

console.log("getMostRecentUserMessage");

test("returns the last user message, ignoring trailing assistant messages", () => {
  const messages = [
    { id: "1", role: "user" },
    { id: "2", role: "assistant" },
    { id: "3", role: "user" },
    { id: "4", role: "assistant" },
    // biome-ignore lint/suspicious/noExplicitAny: minimal fixture, full UIMessage shape not needed
  ] as any[];
  const result = getMostRecentUserMessage(messages);
  assert.equal(result?.id, "3");
});

test("returns undefined when there are no user messages", () => {
  // biome-ignore lint/suspicious/noExplicitAny: minimal fixture, full UIMessage shape not needed
  const messages = [{ id: "1", role: "assistant" }] as any[];
  assert.equal(getMostRecentUserMessage(messages), undefined);
});

console.log("getTrailingMessageId");

test("returns the id of the last message", () => {
  const messages = [
    { id: "a", role: "assistant" },
    { id: "b", role: "assistant" },
  ];
  assert.equal(getTrailingMessageId({ messages }), "b");
});

test("returns null for an empty message list", () => {
  assert.equal(getTrailingMessageId({ messages: [] }), null);
});

console.log("getTextFromMessage");

test("joins only the text parts, skipping non-text parts", () => {
  const message = {
    id: "1",
    role: "assistant",
    parts: [
      { type: "text", text: "Hello, " },
      { type: "tool-call", toolName: "get_weather" },
      { type: "text", text: "world!" },
    ],
    metadata: {},
    // biome-ignore lint/suspicious/noExplicitAny: minimal fixture, full ChatMessage shape not needed
  } as any as ChatMessage;
  assert.equal(getTextFromMessage(message), "Hello, world!");
});

test("returns an empty string when there are no text parts", () => {
  const message = {
    id: "1",
    role: "assistant",
    parts: [{ type: "tool-call", toolName: "get_weather" }],
    metadata: {},
    // biome-ignore lint/suspicious/noExplicitAny: minimal fixture, full ChatMessage shape not needed
  } as any as ChatMessage;
  assert.equal(getTextFromMessage(message), "");
});

console.log("getDocumentTimestampByIndex");

function makeDocument(createdAt: Date): Document {
  // biome-ignore lint/suspicious/noExplicitAny: minimal fixture, full Document shape not needed
  return { createdAt } as any as Document;
}

test("returns the document's createdAt when the index is in range", () => {
  const target = new Date("2026-01-01T00:00:00Z");
  const documents = [makeDocument(new Date("2025-01-01T00:00:00Z")), makeDocument(target)];
  assert.equal(getDocumentTimestampByIndex(documents, 1), target);
});

test("returns the current date when documents is falsy", () => {
  const before = Date.now();
  // biome-ignore lint/suspicious/noExplicitAny: exercising the falsy-input branch on purpose
  const result = getDocumentTimestampByIndex(undefined as any, 0);
  assert.ok(result instanceof Date);
  assert.ok(result.getTime() >= before);
});

test("returns the current date when the index is past the end of the array", () => {
  const documents = [makeDocument(new Date("2025-01-01T00:00:00Z"))];
  const before = Date.now();
  const result = getDocumentTimestampByIndex(documents, 5);
  assert.ok(result instanceof Date);
  assert.ok(result.getTime() >= before);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
