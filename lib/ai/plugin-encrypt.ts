import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const KEY_ENV = "PLUGIN_TOOL_ENCRYPTION_KEY";
const ALGO = "aes-256-gcm";

function getKey(): Buffer | null {
  const hex = process.env[KEY_ENV];
  if (!hex || hex.length < 64) return null;
  return Buffer.from(hex.slice(0, 64), "hex");
}

export function encryptValue(plaintext: string): string {
  const key = getKey();
  if (!key) return plaintext; // no-op if key not configured
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export function decryptValue(ciphertext: string): string {
  const key = getKey();
  if (!key) return ciphertext; // no-op if key not configured
  try {
    const buf = Buffer.from(ciphertext, "base64");
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const encrypted = buf.subarray(28);
    const decipher = createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    return "";
  }
}
