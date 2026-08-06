/**
 * Unit tests for lib/ai/tools/transcribe-audio.ts.
 * Run with: npx tsx lib/ai/tools/transcribe-audio.test.ts
 */
import assert from "node:assert/strict";
import { transcribeAudioTool } from "./transcribe-audio";

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

const schema = transcribeAudioTool().inputSchema;

async function main() {
  console.log("transcribeAudioTool.inputSchema");

  await test("accepts a valid audioUrl with no language", () => {
    const parsed = schema.parse({ audioUrl: "https://example.com/a.mp3" });
    assert.equal(parsed.audioUrl, "https://example.com/a.mp3");
    assert.equal(parsed.language, undefined);
  });

  await test("accepts a valid audioUrl with a language code", () => {
    const parsed = schema.parse({
      audioUrl: "https://example.com/a.mp3",
      language: "es",
    });
    assert.equal(parsed.language, "es");
  });

  await test("rejects a non-URL audioUrl", () => {
    assert.throws(() => {
      schema.parse({ audioUrl: "not-a-url" });
    });
  });

  await test("rejects a missing audioUrl", () => {
    assert.throws(() => {
      schema.parse({ language: "en" });
    });
  });

  await test("rejects a non-string language", () => {
    assert.throws(() => {
      schema.parse({ audioUrl: "https://example.com/a.mp3", language: 5 });
    });
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

main();
