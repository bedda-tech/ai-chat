/**
 * Unit tests for lib/ai/plugin-encrypt.ts.
 * Run with: npx tsx lib/ai/plugin-encrypt.test.ts
 */
import assert from "node:assert/strict";

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

const KEY_ENV = "PLUGIN_TOOL_ENCRYPTION_KEY";
const VALID_KEY = "a".repeat(64); // 32 bytes hex, valid AES-256 key
const originalKey = process.env[KEY_ENV];

async function main() {
console.log("encryptValue / decryptValue");

await test("encryptValue is a no-op when key env var is unset", async () => {
  delete process.env[KEY_ENV];
  const mod = await import(`./plugin-encrypt?t=${Date.now()}-1`);
  assert.equal(mod.encryptValue("secret-token"), "secret-token");
});

await test("decryptValue is a no-op when key env var is unset", async () => {
  delete process.env[KEY_ENV];
  const mod = await import(`./plugin-encrypt?t=${Date.now()}-2`);
  assert.equal(mod.decryptValue("secret-token"), "secret-token");
});

await test("encryptValue is a no-op when key is shorter than 64 hex chars", async () => {
  process.env[KEY_ENV] = "deadbeef";
  const mod = await import(`./plugin-encrypt?t=${Date.now()}-3`);
  assert.equal(mod.encryptValue("secret-token"), "secret-token");
});

await test("encryptValue + decryptValue round-trips plaintext when key is configured", async () => {
  process.env[KEY_ENV] = VALID_KEY;
  const mod = await import(`./plugin-encrypt?t=${Date.now()}-4`);
  const ciphertext = mod.encryptValue("my-api-key-12345");
  assert.notEqual(ciphertext, "my-api-key-12345");
  assert.equal(mod.decryptValue(ciphertext), "my-api-key-12345");
});

await test("encryptValue produces different ciphertext each call (random IV) but both decrypt correctly", async () => {
  process.env[KEY_ENV] = VALID_KEY;
  const mod = await import(`./plugin-encrypt?t=${Date.now()}-5`);
  const a = mod.encryptValue("same-plaintext");
  const b = mod.encryptValue("same-plaintext");
  assert.notEqual(a, b);
  assert.equal(mod.decryptValue(a), "same-plaintext");
  assert.equal(mod.decryptValue(b), "same-plaintext");
});

await test("decryptValue returns empty string (not throws) for tampered ciphertext", async () => {
  process.env[KEY_ENV] = VALID_KEY;
  const mod = await import(`./plugin-encrypt?t=${Date.now()}-6`);
  const ciphertext = mod.encryptValue("sensitive-value");
  const buf = Buffer.from(ciphertext, "base64");
  buf[buf.length - 1] ^= 0xff; // flip last byte of the encrypted payload
  const tampered = buf.toString("base64");
  assert.equal(mod.decryptValue(tampered), "");
});

await test("decryptValue returns empty string (not throws) for malformed/truncated ciphertext", async () => {
  process.env[KEY_ENV] = VALID_KEY;
  const mod = await import(`./plugin-encrypt?t=${Date.now()}-7`);
  assert.equal(mod.decryptValue("not-valid-base64-ciphertext"), "");
  assert.equal(mod.decryptValue(""), "");
});

if (originalKey === undefined) {
  delete process.env[KEY_ENV];
} else {
  process.env[KEY_ENV] = originalKey;
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
}

main();
