/**
 * Unit tests for lib/ai/tools/execute-code.ts inputSchema.
 * Run with: npx tsx lib/ai/tools/execute-code.test.ts
 */
import assert from "node:assert/strict";
import { executeCodeTool } from "./execute-code";

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

const schema = executeCodeTool().inputSchema;

async function main() {
  console.log("executeCodeTool.inputSchema");

  await test("language defaults to python when omitted", () => {
    const parsed = schema.parse({ code: "print(1)" });
    assert.equal(parsed.language, "python");
  });

  await test("accepts javascript explicitly", () => {
    const parsed = schema.parse({ code: "console.log(1)", language: "javascript" });
    assert.equal(parsed.language, "javascript");
  });

  await test("accepts python explicitly", () => {
    const parsed = schema.parse({ code: "print(1)", language: "python" });
    assert.equal(parsed.language, "python");
  });

  await test("rejects an unknown language", () => {
    assert.throws(() => {
      schema.parse({ code: "print(1)", language: "ruby" });
    });
  });

  await test("rejects a missing code field", () => {
    assert.throws(() => {
      schema.parse({ language: "python" });
    });
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

main();
