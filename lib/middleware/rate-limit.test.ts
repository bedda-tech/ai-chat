/**
 * Unit tests for createRateLimitResponse.
 * Run with: npx tsx lib/middleware/rate-limit.test.ts
 */
import assert from "node:assert/strict";
import { createRateLimitResponse } from "./rate-limit";

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

console.log("createRateLimitResponse");

test("sets Retry-After header and status 429 when retryAfter is present", async () => {
  const response = createRateLimitResponse({
    allowed: false,
    retryAfter: 42,
  });
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("Retry-After"), "42");
  const body = await response.json();
  assert.equal(body.upgrade, false);
  assert.equal(body.upgradeUrl, "/upgrade?plan=plus");
});

test("omits Retry-After header when retryAfter is not set", () => {
  const response = createRateLimitResponse({ allowed: false });
  assert.equal(response.headers.get("Retry-After"), null);
});

test("passes through upgrade flag and a custom upgradeUrl", async () => {
  const response = createRateLimitResponse({
    allowed: false,
    upgrade: true,
    upgradeUrl: "/pricing",
    message: "Monthly limit exceeded",
  });
  const body = await response.json();
  assert.equal(body.code, "rate_limit:chat");
  assert.equal(body.cause, "Monthly limit exceeded");
  assert.equal(body.upgrade, true);
  assert.equal(body.upgradeUrl, "/pricing");
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
