import assert from "node:assert";
import { compareSync } from "bcrypt-ts";
import { generateDummyPassword, generateHashedPassword } from "./utils";

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
  await test("generateHashedPassword produces a bcrypt hash the plaintext verifies against", () => {
    const hash = generateHashedPassword("correct-horse-battery-staple");
    assert.ok(hash.startsWith("$2"), "expected a bcrypt hash prefix");
    assert.strictEqual(
      compareSync("correct-horse-battery-staple", hash),
      true
    );
  });

  await test("generateHashedPassword rejects the wrong plaintext", () => {
    const hash = generateHashedPassword("correct-horse-battery-staple");
    assert.strictEqual(compareSync("wrong-password", hash), false);
  });

  await test("generateHashedPassword salts each call independently (same input, different hash)", () => {
    const first = generateHashedPassword("same-input");
    const second = generateHashedPassword("same-input");
    assert.notStrictEqual(first, second);
    assert.strictEqual(compareSync("same-input", first), true);
    assert.strictEqual(compareSync("same-input", second), true);
  });

  await test("generateDummyPassword returns a valid bcrypt hash with no known plaintext", () => {
    const hash = generateDummyPassword();
    assert.ok(hash.startsWith("$2"), "expected a bcrypt hash prefix");
    assert.strictEqual(hash.length > 0, true);
  });

  await test("generateDummyPassword is different across calls (random underlying password)", () => {
    const first = generateDummyPassword();
    const second = generateDummyPassword();
    assert.notStrictEqual(first, second);
  });

  if (process.exitCode === 1) {
    console.error("Some tests failed");
  } else {
    console.log("All tests passed");
  }
}

main();
