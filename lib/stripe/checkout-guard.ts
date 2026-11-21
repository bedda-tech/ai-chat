import { createClient } from "redis";
import { guestRegex } from "@/lib/constants";

/** Max checkout-session creations per user and per client IP in one window. */
export const CHECKOUT_RATE_LIMIT = 3;
export const CHECKOUT_RATE_WINDOW_SECONDS = 60 * 60;

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

type RedisClient = ReturnType<typeof createClient>;

export type CheckoutSessionUser =
  | {
      id?: string;
      email?: string | null;
      type?: string;
      emailConfirmed?: boolean | null;
    }
  | null
  | undefined;

/**
 * True only for a signed-in, non-guest account whose email address has been
 * confirmed. Guest sessions (type "guest" or a `guest-<n>` email) cannot start
 * checkout, upgrade or the billing portal, and neither can accounts that have
 * not yet clicked the verification link.
 */
export function isEligibleForCheckout(user: CheckoutSessionUser): boolean {
  return (
    !!user?.id &&
    !!user.email &&
    user.type === "regular" &&
    !guestRegex.test(user.email) &&
    user.emailConfirmed === true
  );
}

export const ACCOUNT_REQUIRED_RESPONSE = {
  error:
    "A signed-in account is required to manage billing. Create an account to subscribe.",
  code: "account_required",
} as const;

export const EMAIL_VERIFICATION_REQUIRED_RESPONSE = {
  error:
    "Confirm your email address before subscribing. Check your inbox for the confirmation link.",
  code: "email_verification_required",
} as const;

/**
 * The 403 body to return for a billing request, or null when it may proceed.
 * A signed-in account that has not confirmed its email gets its own code so
 * the client can tell the user what to do.
 */
export function checkoutDenialResponse(
  user: CheckoutSessionUser
):
  | typeof ACCOUNT_REQUIRED_RESPONSE
  | typeof EMAIL_VERIFICATION_REQUIRED_RESPONSE
  | null {
  if (isEligibleForCheckout(user)) {
    return null;
  }
  const signedInRegular =
    !!user?.id &&
    !!user.email &&
    user.type === "regular" &&
    !guestRegex.test(user.email);
  return signedInRegular
    ? EMAIL_VERIFICATION_REQUIRED_RESPONSE
    : ACCOUNT_REQUIRED_RESPONSE;
}

/** Client IP from the proxy headers set by Vercel; "unknown" when absent. */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first || req.headers.get("x-real-ip") || "unknown";
}

let redisClient: RedisClient | null = null;
let redisConnecting: Promise<RedisClient | null> | null = null;

async function getRedis(): Promise<RedisClient | null> {
  if (!process.env.REDIS_URL) {
    return null;
  }
  if (redisClient?.isReady) {
    return redisClient;
  }
  if (!redisConnecting) {
    redisConnecting = (async () => {
      try {
        const client = createClient({ url: process.env.REDIS_URL });
        client.on("error", (err) =>
          console.error("[checkout-guard] redis error:", err)
        );
        await client.connect();
        redisClient = client;
        return client;
      } catch (err) {
        console.error("[checkout-guard] redis connect failed:", err);
        return null;
      } finally {
        redisConnecting = null;
      }
    })();
  }
  return redisConnecting;
}

/**
 * Records one checkout attempt against `key` (fixed one-hour window) and
 * returns false once the attempt count exceeds CHECKOUT_RATE_LIMIT.
 * Fails open (returns true) when Redis is unset or unreachable, so a Redis
 * outage does not block paying customers; the failure is logged.
 */
export async function consumeCheckoutAttempt(key: string): Promise<boolean> {
  const redis = await getRedis();
  if (!redis) {
    console.warn("[checkout-guard] rate limit skipped: Redis unavailable");
    return true;
  }
  try {
    const count = await redis.incr(`checkout-rl:${key}`);
    if (count === 1) {
      await redis.expire(`checkout-rl:${key}`, CHECKOUT_RATE_WINDOW_SECONDS);
    }
    return count <= CHECKOUT_RATE_LIMIT;
  } catch (err) {
    console.error("[checkout-guard] rate limit error:", err);
    return true;
  }
}

/**
 * Verifies a Cloudflare Turnstile token. Enforced only when
 * TURNSTILE_SECRET_KEY is set; without it the challenge is inactive and this
 * returns true.
 */
export async function verifyTurnstile(
  token: string | undefined,
  ip: string
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return true;
  }
  if (!token) {
    return false;
  }
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip !== "unknown") {
      body.set("remoteip", ip);
    }
    const res = await fetch(TURNSTILE_VERIFY_URL, { method: "POST", body });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (err) {
    console.error("[checkout-guard] turnstile verify failed:", err);
    return false;
  }
}
