/**
 * Unit tests for gateway-config's provider fallback and thinking-budget logic.
 * Run with: npx tsx lib/ai/gateway-config.test.ts
 */
import assert from "node:assert/strict";
import {
  buildGatewayConfig,
  getProviderFallbackOrder,
  getThinkingBudget,
} from "./gateway-config";

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

console.log("getProviderFallbackOrder");

test("routes anthropic/claude models through vertex then anthropic", () => {
  assert.deepEqual(getProviderFallbackOrder("anthropic/claude-sonnet-4-6"), [
    "vertex",
    "anthropic",
  ]);
});

test("routes google/gemini models through vertex then google", () => {
  assert.deepEqual(getProviderFallbackOrder("google/gemini-2.5-flash"), [
    "vertex",
    "google",
  ]);
});

test("returns undefined for models with no configured fallback", () => {
  assert.equal(getProviderFallbackOrder("openai/gpt-5"), undefined);
});

test("returns undefined for an empty model id", () => {
  assert.equal(getProviderFallbackOrder(""), undefined);
});

console.log("\nbuildGatewayConfig");

test("always sets includeMetadata to true", () => {
  assert.equal(buildGatewayConfig("openai/gpt-5").includeMetadata, true);
  assert.equal(
    buildGatewayConfig("anthropic/claude-sonnet-4-6").includeMetadata,
    true
  );
});

test("embeds the provider fallback order when one applies", () => {
  assert.deepEqual(buildGatewayConfig("google/gemini-2.5-flash").order, [
    "vertex",
    "google",
  ]);
});

test("leaves order undefined when no fallback applies", () => {
  assert.equal(buildGatewayConfig("xai/grok-4").order, undefined);
});

console.log("\ngetThinkingBudget");

test("returns undefined for non-anthropic models", () => {
  assert.equal(getThinkingBudget("openai/gpt-5"), undefined);
});

test("gives opus models a 2000 token budget", () => {
  assert.equal(getThinkingBudget("anthropic/claude-opus-4-6"), 2000);
});

test("gives sonnet models a 1000 token budget", () => {
  assert.equal(getThinkingBudget("anthropic/claude-sonnet-4-6"), 1000);
});

test("gives haiku models a 500 token budget", () => {
  assert.equal(getThinkingBudget("anthropic/claude-haiku-4-5"), 500);
});

test("defaults other anthropic models to a 1000 token budget", () => {
  assert.equal(getThinkingBudget("anthropic/claude-instant"), 1000);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
