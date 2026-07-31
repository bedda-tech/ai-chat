/**
 * Unit tests for computeCostUSD.
 * Run with: POSTGRES_URL=postgresql://localhost/dummy npx tsx lib/usage/tracking.test.ts
 */
import assert from "node:assert/strict";
import { computeCostUSD } from "./tracking";

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

console.log("computeCostUSD");

const PRICED_MODEL = "anthropic-claude-sonnet-4-6"; // input: 3, output: 15, cachedInput: 0.3 (per 1M)

test("returns undefined for a model with no registered pricing", () => {
  const result = computeCostUSD("nonexistent-model-xyz", 1000, 1000, 0);
  assert.equal(result, undefined);
});

test("computes input/output/cache costs for a priced model", () => {
  const result = computeCostUSD(PRICED_MODEL, 1_000_000, 500_000, 200_000);
  assert.ok(result);
  // normalInput = 1,000,000 - 200,000 = 800,000 -> 800,000/1e6 * 3 = 2.4
  assert.ok(Math.abs(result.inputUSD - 2.4) < 1e-9);
  // 500,000/1e6 * 15 = 7.5
  assert.equal(result.outputUSD, 7.5);
  // 200,000/1e6 * 0.3 = 0.06
  assert.ok(Math.abs(result.cacheReadUSD - 0.06) < 1e-9);
  assert.ok(Math.abs(result.totalUSD - (2.4 + 7.5 + 0.06)) < 1e-9);
});

test("clamps normal input tokens to zero when cachedTokens exceeds inputTokens", () => {
  const result = computeCostUSD(PRICED_MODEL, 100, 100, 500);
  assert.ok(result);
  assert.equal(result.inputUSD, 0);
});

test("returns all-zero costs for zero token counts", () => {
  const result = computeCostUSD(PRICED_MODEL, 0, 0, 0);
  assert.deepEqual(result, {
    inputUSD: 0,
    outputUSD: 0,
    cacheReadUSD: 0,
    totalUSD: 0,
  });
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
}
