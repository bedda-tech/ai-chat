import { createHmac, timingSafeEqual } from "node:crypto";
import { Resend } from "resend";

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;

function signingKey(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is required to sign email verification links");
  }
  return secret;
}

function sign(userId: string, expiresAt: number): string {
  return createHmac("sha256", signingKey())
    .update(`verify-email:${userId}:${expiresAt}`)
    .digest("hex");
}

/** Returns true when `token` is a valid, unexpired verification token for `userId`. */
export function verifyEmailToken(
  userId: string,
  expiresAt: number,
  token: string
): boolean {
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) {
    return false;
  }
  const expected = Buffer.from(sign(userId, expiresAt), "hex");
  const given = Buffer.from(token, "hex");
  return given.length === expected.length && timingSafeEqual(expected, given);
}

/** Sends the confirmation email whose link must be opened before checkout is allowed. */
export async function sendVerificationEmail(
  email: string,
  userId: string
): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.bedda.tech";
  const expiresAt = Date.now() + VERIFY_TTL_MS;
  const token = sign(userId, expiresAt);
  const link = `${appUrl}/api/verify-email?uid=${userId}&exp=${expiresAt}&token=${token}`;

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "Bedda <onboarding@resend.dev>",
    to: email,
    subject: "Confirm your email for Bedda",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="margin-bottom: 16px;">Confirm your email</h2>
        <p style="color: #555; margin-bottom: 24px;">
          Confirm this address to finish setting up your Bedda account and to
          subscribe to a paid plan. This link expires in 24 hours.
        </p>
        <a href="${link}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
          Confirm email
        </a>
        <p style="color: #888; font-size: 13px; margin-top: 24px;">
          If you did not create a Bedda account, you can ignore this email.
        </p>
        <p style="color: #aaa; font-size: 12px; margin-top: 8px;">
          Or copy this link: ${link}
        </p>
      </div>
    `,
  });
}
