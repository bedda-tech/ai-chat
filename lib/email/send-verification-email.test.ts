/**
 * Unit tests for lib/email/send-verification-email.ts token checks.
 * Run with: npx tsx lib/email/send-verification-email.test.ts
 */
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";

process.env.AUTH_SECRET = "test-secret";

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

const USER = "6f1c2b1e-0000-4000-8000-000000000001";

function tokenFor(userId: string, expiresAt: number, secret = "test-secret") {
  return createHmac("sha256", secret)
    .update(`verify-email:${userId}:${expiresAt}`)
    .digest("hex");
}

async function main() {
  const { verifyEmailToken } = await import("./send-verification-email");
  const future = Date.now() + 60_000;
  const past = Date.now() - 60_000;

  console.log("verifyEmailToken");

  await test("accepts a valid, unexpired token for the user", () => {
    assert.equal(verifyEmailToken(USER, future, tokenFor(USER, future)), true);
  });

  await test("rejects an expired token", () => {
    assert.equal(verifyEmailToken(USER, past, tokenFor(USER, past)), false);
  });

  await test("rejects a token issued for another user", () => {
    assert.equal(
      verifyEmailToken(
        "6f1c2b1e-0000-4000-8000-000000000002",
        future,
        tokenFor(USER, future)
      ),
      false
    );
  });

  await test("rejects a token signed with another secret", () => {
    assert.equal(
      verifyEmailToken(USER, future, tokenFor(USER, future, "other")),
      false
    );
  });

  await test("rejects malformed or missing tokens", () => {
    assert.equal(verifyEmailToken(USER, future, ""), false);
    assert.equal(verifyEmailToken(USER, future, "zz-not-hex"), false);
    assert.equal(
      verifyEmailToken(USER, Number.NaN, tokenFor(USER, future)),
      false
    );
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

main();
