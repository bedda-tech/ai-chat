/**
 * Unit tests for lib/ai/tools/generate-structured-data.ts.
 * Run with: npx tsx lib/ai/tools/generate-structured-data.test.ts
 */
import assert from "node:assert/strict";
import { generateStructuredDataTool } from "./generate-structured-data";

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

const schema = generateStructuredDataTool().inputSchema;

async function main() {
  console.log("generateStructuredDataTool.inputSchema");

  await test("count defaults to 1 when omitted", () => {
    const parsed = schema.parse({
      dataType: "user-profile",
      description: "a user",
    });
    assert.equal(parsed.count, 1);
  });

  await test("count is preserved when provided within range", () => {
    const parsed = schema.parse({
      dataType: "report",
      description: "quarterly report",
      count: 5,
    });
    assert.equal(parsed.count, 5);
  });

  await test("count rejects a value below the minimum of 1", () => {
    assert.throws(() => {
      schema.parse({
        dataType: "mock-data",
        description: "some mock data",
        count: 0,
      });
    });
  });

  await test("count rejects a value above the maximum of 10", () => {
    assert.throws(() => {
      schema.parse({
        dataType: "mock-data",
        description: "some mock data",
        count: 11,
      });
    });
  });

  await test("dataType accepts every documented enum value", () => {
    const dataTypes = [
      "user-profile",
      "api-response",
      "config-file",
      "test-data",
      "mock-data",
      "report",
    ];
    for (const dataType of dataTypes) {
      const parsed = schema.parse({ dataType, description: "x" });
      assert.equal(parsed.dataType, dataType);
    }
  });

  await test("rejects an unknown dataType", () => {
    assert.throws(() => {
      schema.parse({ dataType: "spreadsheet", description: "x" });
    });
  });

  await test("rejects a missing description", () => {
    assert.throws(() => {
      schema.parse({ dataType: "report" });
    });
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

main();
