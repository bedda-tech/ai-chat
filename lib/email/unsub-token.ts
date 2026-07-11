import { createHmac } from "node:crypto";

/** Generates a deterministic HMAC-SHA256 unsubscribe token bound to AUTH_SECRET so tokens are stateless and verifiable without DB storage. */
export function generateUnsubToken(userId: string): string {
  const secret = process.env.AUTH_SECRET ?? "bedda-unsub-secret";
  return createHmac("sha256", secret).update(`unsub:${userId}`).digest("hex");
}

export function verifyUnsubToken(userId: string, token: string): boolean {
  return generateUnsubToken(userId) === token;
}

export function unsubscribeUrl(userId: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.bedda.tech";
  const token = generateUnsubToken(userId);
  return `${appUrl}/api/unsubscribe?uid=${userId}&token=${token}`;
}
