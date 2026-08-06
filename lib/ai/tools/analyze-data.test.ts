/**
 * Unit tests for lib/ai/tools/analyze-data.ts inputSchema.
 * Run with: npx tsx lib/ai/tools/analyze-data.test.ts
 */
import assert from "node:assert/strict";
import { analyzeDataTool } from "./analyze-data";

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

const schema = analyzeDataTool().inputSchema;

const ANALYSIS_TYPES = [
  "sentiment",
  "summary",
  "trends",
  "key-points",
  "statistics",
] as const;

async function main() {
  console.log("analyzeDataTool.inputSchema");

  for (const analysisType of ANALYSIS_TYPES) {
    await test(`accepts analysisType "${analysisType}"`, () => {
      const parsed = schema.parse({ data: "some data", analysisType });
      assert.equal(parsed.analysisType, analysisType);
    });
  }

  await test("rejects an unknown analysisType", () => {
    assert.throws(() => {
      schema.parse({ data: "some data", analysisType: "predictions" });
    });
  });

  await test("rejects a missing analysisType", () => {
    assert.throws(() => {
      schema.parse({ data: "some data" });
    });
  });

  await test("rejects a missing data field", () => {
    assert.throws(() => {
      schema.parse({ analysisType: "summary" });
    });
  });

  await test("context is optional and omitted when not provided", () => {
    const parsed = schema.parse({ data: "some data", analysisType: "trends" });
    assert.equal(parsed.context, undefined);
  });

  await test("context is preserved when provided", () => {
    const parsed = schema.parse({
      data: "some data",
      analysisType: "key-points",
      context: "quarterly sales report",
    });
    assert.equal(parsed.context, "quarterly sales report");
  });

  await test("rejects a non-string context", () => {
    assert.throws(() => {
      schema.parse({
        data: "some data",
        analysisType: "statistics",
        context: 123,
      });
    });
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

main();
