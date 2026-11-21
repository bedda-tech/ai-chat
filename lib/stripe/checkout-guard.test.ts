/**
 * Unit tests for lib/stripe/checkout-guard.ts.
 * Run with: npx tsx lib/stripe/checkout-guard.test.ts
 *
 * Covers the pure guard helpers only. Redis and Turnstile are left unset
 * (fail-open paths) so no network is touched.
 */
import assert from "node:assert/strict";

// biome-ignore lint/performance/noDelete: process.env must truly unset these
delete process.env.REDIS_URL;
// biome-ignore lint/performance/noDelete: process.env must truly unset these
delete process.env.TURNSTILE_SECRET_KEY;

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

async function main() {
  const {
    checkoutDenialResponse,
    getClientIp,
    isEligibleForCheckout,
    verifyTurnstile,
  } = await import("./checkout-guard");

  console.log("isEligibleForCheckout");

  await test("allows a signed-in regular account with a verified email", () => {
    assert.equal(
      isEligibleForCheckout({
        id: "u1",
        email: "alice@example.com",
        type: "regular",
        emailConfirmed: true,
      }),
      true
    );
  });

  await test("rejects a regular account whose email is not verified", () => {
    assert.equal(
      isEligibleForCheckout({
        id: "u5",
        email: "bob@example.com",
        type: "regular",
        emailConfirmed: false,
      }),
      false
    );
    assert.equal(
      isEligibleForCheckout({
        id: "u6",
        email: "bob@example.com",
        type: "regular",
      }),
      false
    );
  });

  console.log("checkoutDenialResponse");

  await test("returns null when checkout may proceed", () => {
    assert.equal(
      checkoutDenialResponse({
        id: "u1",
        email: "alice@example.com",
        type: "regular",
        emailConfirmed: true,
      }),
      null
    );
  });

  await test("asks an unverified account to confirm its email", () => {
    assert.equal(
      checkoutDenialResponse({
        id: "u5",
        email: "bob@example.com",
        type: "regular",
        emailConfirmed: false,
      })?.code,
      "email_verification_required"
    );
  });

  await test("asks a guest session to create an account", () => {
    assert.equal(
      checkoutDenialResponse({
        id: "u2",
        email: "guest-123@example.com",
        type: "guest",
        emailConfirmed: true,
      })?.code,
      "account_required"
    );
    assert.equal(checkoutDenialResponse(undefined)?.code, "account_required");
  });

  await test("rejects a guest session by type", () => {
    assert.equal(
      isEligibleForCheckout({
        id: "u2",
        email: "guest-123@example.com",
        type: "guest",
      }),
      false
    );
  });

  await test("rejects a guest email even if type is regular", () => {
    assert.equal(
      isEligibleForCheckout({
        id: "u3",
        email: "guest-42",
        type: "regular",
      }),
      false
    );
  });

  await test("rejects a session with no user id", () => {
    assert.equal(
      isEligibleForCheckout({ email: "alice@example.com", type: "regular" }),
      false
    );
  });

  await test("rejects a session with no email", () => {
    assert.equal(isEligibleForCheckout({ id: "u4", type: "regular" }), false);
  });

  await test("rejects a missing user", () => {
    assert.equal(isEligibleForCheckout(undefined), false);
    assert.equal(isEligibleForCheckout(null), false);
  });

  console.log("getClientIp");

  await test("uses the first x-forwarded-for entry", () => {
    const req = new Request("https://x.test", {
      headers: { "x-forwarded-for": "203.0.113.5, 10.0.0.1" },
    });
    assert.equal(getClientIp(req), "203.0.113.5");
  });

  await test("falls back to x-real-ip then 'unknown'", () => {
    const real = new Request("https://x.test", {
      headers: { "x-real-ip": "198.51.100.7" },
    });
    assert.equal(getClientIp(real), "198.51.100.7");
    assert.equal(getClientIp(new Request("https://x.test")), "unknown");
  });

  console.log("verifyTurnstile");

  await test("is inactive (returns true) when TURNSTILE_SECRET_KEY is unset", async () => {
    assert.equal(await verifyTurnstile(undefined, "203.0.113.5"), true);
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

main();
