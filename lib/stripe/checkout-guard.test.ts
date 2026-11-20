/**
 * Unit tests for lib/stripe/checkout-guard.ts.
 * Run with: npx tsx lib/stripe/checkout-guard.test.ts
 *
 * REDIS_URL is unset here, so consumeCheckoutAttempt takes its fail-open path;
 * the Redis counting itself is not exercised.
 */
import assert from "node:assert/strict";

Reflect.deleteProperty(process.env, "REDIS_URL");

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void | Promise<void>) {
  return Promise.resolve()
    .then(fn)
    .then(() => {
      console.log(`  ✓ ${name}`);
      passed++;
    })
    .catch((err: unknown) => {
      console.error(`  ✗ ${name}`);
      console.error(`    ${err instanceof Error ? err.message : String(err)}`);
      failed++;
    });
}

async function main() {
  const { consumeCheckoutAttempt, getClientIp, isRegisteredSession } =
    await import("./checkout-guard");

  console.log("isRegisteredSession");

  await test("accepts a regular account with an email", () => {
    assert.equal(
      isRegisteredSession({ user: { email: "a@b.co", type: "regular" } }),
      true
    );
  });

  await test("rejects a guest session", () => {
    assert.equal(
      isRegisteredSession({ user: { email: "guest@x.co", type: "guest" } }),
      false
    );
  });

  await test("rejects a session without an email", () => {
    assert.equal(isRegisteredSession({ user: { type: "regular" } }), false);
  });

  await test("rejects a missing session", () => {
    assert.equal(isRegisteredSession(null), false);
  });

  console.log("getClientIp");

  await test("uses the first x-forwarded-for entry", () => {
    const req = new Request("http://x", {
      headers: { "x-forwarded-for": "203.0.113.5, 10.0.0.1" },
    });
    assert.equal(getClientIp(req), "203.0.113.5");
  });

  await test("falls back to x-real-ip then 'unknown'", () => {
    const real = new Request("http://x", {
      headers: { "x-real-ip": "198.51.100.7" },
    });
    assert.equal(getClientIp(real), "198.51.100.7");
    assert.equal(getClientIp(new Request("http://x")), "unknown");
  });

  console.log("consumeCheckoutAttempt");

  await test("allows the attempt when REDIS_URL is unset (fail-open)", async () => {
    const result = await consumeCheckoutAttempt("user-1", "203.0.113.5");
    assert.equal(result.allowed, true);
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

main();
