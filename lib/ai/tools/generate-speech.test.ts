/**
 * Unit tests for lib/ai/tools/generate-speech.ts.
 * Run with: npx tsx lib/ai/tools/generate-speech.test.ts
 */
import assert from "node:assert/strict";
import { generateSpeechTool } from "./generate-speech";

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => void | Promise<void>) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err: unknown) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err instanceof Error ? err.message : String(err)}`);
    failed++;
  }
}

const schema = generateSpeechTool().inputSchema;

async function main() {
  console.log("generateSpeechTool.inputSchema");

  await test("voice defaults to nova when omitted", () => {
    const parsed = schema.parse({ text: "hello" });
    assert.equal(parsed.voice, "nova");
  });

  await test("accepts every documented voice value", () => {
    for (const voice of [
      "alloy",
      "echo",
      "fable",
      "onyx",
      "nova",
      "shimmer",
    ]) {
      const parsed = schema.parse({ text: "hello", voice });
      assert.equal(parsed.voice, voice);
    }
  });

  await test("rejects an unknown voice", () => {
    assert.throws(() => {
      schema.parse({ text: "hello", voice: "robot" });
    });
  });

  await test("accepts text at the 4096 character limit", () => {
    const text = "a".repeat(4096);
    const parsed = schema.parse({ text });
    assert.equal(parsed.text.length, 4096);
  });

  await test("rejects text over the 4096 character limit", () => {
    assert.throws(() => {
      schema.parse({ text: "a".repeat(4097) });
    });
  });

  await test("rejects a missing text field", () => {
    assert.throws(() => {
      schema.parse({ voice: "nova" });
    });
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

main();
