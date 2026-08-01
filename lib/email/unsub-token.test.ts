/**
 * Unit tests for lib/email/unsub-token.ts.
 * Run with: npx tsx lib/email/unsub-token.test.ts
 */
import assert from "node:assert/strict";
import {
  generateUnsubToken,
  unsubscribeUrl,
  verifyUnsubToken,
} from "./unsub-token";

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

console.log("generateUnsubToken / verifyUnsubToken / unsubscribeUrl");

test("generateUnsubToken is deterministic for the same userId", () => {
  const a = generateUnsubToken("user-1");
  const b = generateUnsubToken("user-1");
  assert.equal(a, b);
  assert.match(a, /^[0-9a-f]{64}$/);
});

test("generateUnsubToken differs across userIds", () => {
  assert.notEqual(generateUnsubToken("user-1"), generateUnsubToken("user-2"));
});

test("verifyUnsubToken returns true for a valid token", () => {
  const token = generateUnsubToken("user-1");
  assert.equal(verifyUnsubToken("user-1", token), true);
});

test("verifyUnsubToken returns false for a tampered same-length token", () => {
  const token = generateUnsubToken("user-1");
  const tampered = `${token.slice(0, -1)}${token.endsWith("0") ? "1" : "0"}`;
  assert.equal(verifyUnsubToken("user-1", tampered), false);
});

test("verifyUnsubToken returns false for a token issued to another user", () => {
  const otherToken = generateUnsubToken("user-2");
  assert.equal(verifyUnsubToken("user-1", otherToken), false);
});

test("verifyUnsubToken returns false (not throws) on length-mismatched input", () => {
  // timingSafeEqual throws on differing buffer lengths; the catch branch
  // must swallow that and report an invalid token rather than crashing
  // the /api/unsubscribe route on a malformed/truncated link.
  assert.equal(verifyUnsubToken("user-1", "deadbeef"), false);
  assert.equal(verifyUnsubToken("user-1", ""), false);
});

test("unsubscribeUrl embeds the userId and a matching token", () => {
  const url = unsubscribeUrl("user-1");
  const parsed = new URL(url);
  assert.equal(parsed.searchParams.get("uid"), "user-1");
  const token = parsed.searchParams.get("token");
  assert.ok(token);
  assert.equal(verifyUnsubToken("user-1", token as string), true);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
