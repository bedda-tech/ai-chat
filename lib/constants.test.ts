import assert from "node:assert";
import { guestRegex } from "./constants";

async function test(name: string, fn: () => void | Promise<void>) {
  try {
    await fn();
    console.log(`ok - ${name}`);
  } catch (err) {
    console.error(`FAIL - ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

async function main() {
  await test("guestRegex matches the guest email format produced at guest sign-in", () => {
    assert.strictEqual(guestRegex.test("guest-1738000000000"), true);
    assert.strictEqual(guestRegex.test("guest-1"), true);
  });

  await test("guestRegex rejects a real user email", () => {
    assert.strictEqual(guestRegex.test("matt@bedda.tech"), false);
  });

  await test("guestRegex rejects a non-numeric suffix", () => {
    assert.strictEqual(guestRegex.test("guest-abc"), false);
    assert.strictEqual(guestRegex.test("guest-"), false);
  });

  await test("guestRegex is case-sensitive (capitalized prefix does not match)", () => {
    assert.strictEqual(guestRegex.test("Guest-123"), false);
  });

  await test("guestRegex is anchored (rejects extra prefix/suffix around a valid id)", () => {
    assert.strictEqual(guestRegex.test("not-guest-123"), false);
    assert.strictEqual(guestRegex.test("guest-123-extra"), false);
    assert.strictEqual(guestRegex.test("guest-123 "), false);
  });

  await test("guestRegex rejects the empty string", () => {
    assert.strictEqual(guestRegex.test(""), false);
  });

  if (process.exitCode === 1) {
    console.error("Some tests failed");
  } else {
    console.log("All tests passed");
  }
}

main();
