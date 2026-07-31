/**
 * Unit tests for chunkText.
 * Run with: npx tsx lib/ai/chunker.test.ts
 */
import assert from "node:assert/strict";
import { chunkText } from "./chunker";

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

console.log("chunkText");

test("returns empty array for empty input", () => {
  assert.deepEqual(chunkText(""), []);
});

test("returns empty array for whitespace-only input", () => {
  assert.deepEqual(chunkText("   \n\n  \r\n  "), []);
});

test("drops fragments shorter than 20 characters", () => {
  assert.deepEqual(chunkText("too short"), []);
});

test("returns a single chunk for text under the size limit", () => {
  const text = "This is a normal paragraph of reasonable length.";
  const result = chunkText(text);
  assert.deepEqual(result, [text]);
});

test("normalizes CRLF and CR line endings before splitting", () => {
  const para1 = "First paragraph with enough characters to survive filtering.";
  const para2 = "Second paragraph with enough characters to survive filtering.";
  const crlf = chunkText(`${para1}\r\n\r\n${para2}`);
  const lf = chunkText(`${para1}\n\n${para2}`);
  assert.deepEqual(crlf, lf);
});

test("merges paragraphs into one chunk while under the size limit", () => {
  const para1 = "a".repeat(100);
  const para2 = "b".repeat(100);
  const result = chunkText(`${para1}\n\n${para2}`);
  assert.equal(result.length, 1);
  assert.equal(result[0], `${para1}\n\n${para2}`);
});

test("splits into multiple chunks with overlap when paragraphs exceed the size limit", () => {
  const para1 = "a".repeat(900);
  const para2 = "b".repeat(900);
  const result = chunkText(`${para1}\n\n${para2}`);
  assert.equal(result.length, 2);
  // second chunk should start with the overlapping tail of the first chunk
  assert.ok(result[1].startsWith("a".repeat(200)));
  assert.ok(result[1].includes(para2));
});

test("splits an oversized single paragraph by sentence", () => {
  const sentence = "This is one sentence that repeats itself here.";
  const bigPara = Array(30).fill(sentence).join(" ");
  const result = chunkText(bigPara);
  assert.ok(result.length > 1);
  for (const chunk of result) {
    assert.ok(chunk.length <= 1000);
  }
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
