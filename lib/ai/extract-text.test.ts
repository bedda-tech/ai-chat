/**
 * Unit tests for extractText.
 * Run with: npx tsx lib/ai/extract-text.test.ts
 */
import assert from "node:assert/strict";
import { extractText } from "./chunker";

async function test(name: string, fn: () => void | Promise<void>) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
  } catch (err: unknown) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err instanceof Error ? err.message : String(err)}`);
    process.exitCode = 1;
  }
}

function toBuffer(text: string): ArrayBuffer {
  return new TextEncoder().encode(text).buffer;
}

async function main() {
  console.log("extractText");

  await test("returns the raw text for text/plain", async () => {
    const result = await extractText(toBuffer("hello world"), "text/plain");
    assert.equal(result, "hello world");
  });

  await test("returns the raw text for text/markdown", async () => {
    const result = await extractText(toBuffer("# heading"), "text/markdown");
    assert.equal(result, "# heading");
  });

  await test("returns the raw text for text/csv", async () => {
    const result = await extractText(toBuffer("a,b\n1,2"), "text/csv");
    assert.equal(result, "a,b\n1,2");
  });

  await test("pretty-prints valid JSON for application/json", async () => {
    const result = await extractText(
      toBuffer('{"a":1,"b":[2,3]}'),
      "application/json"
    );
    assert.equal(result, JSON.stringify({ a: 1, b: [2, 3] }, null, 2));
  });

  await test("falls back to raw decoded text when JSON is invalid", async () => {
    const result = await extractText(
      toBuffer("{not valid json"),
      "application/json"
    );
    assert.equal(result, "{not valid json");
  });

  await test("throws a descriptive error for an unsupported mime type", async () => {
    await assert.rejects(
      () => extractText(toBuffer("data"), "image/png"),
      /Unsupported file type for text extraction: image\/png/
    );
  });

  console.log(
    `\n${process.exitCode ? "some tests failed" : "all tests passed"}`
  );
}

main();
