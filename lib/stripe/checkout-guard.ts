import { createClient } from "redis";

/** Max checkout-session creations per user per hour. */
export const CHECKOUT_LIMIT_PER_USER = 3;
/** Max checkout-session creations per client IP per hour (shared NAT allows some headroom). */
export const CHECKOUT_LIMIT_PER_IP = 10;

const WINDOW_SECONDS = 60 * 60;

type SessionLike = {
  user?: { email?: string | null; type?: string } | null;
} | null;

/**
 * True only for a signed-in, non-guest account. Guest sessions (created by the
 * auth middleware for anonymous visitors) must register before they can pay.
 */
export function isRegisteredSession(session: SessionLike): boolean {
  return !!session?.user?.email && session.user.type === "regular";
}

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") ?? "unknown";
}

type RedisClient = ReturnType<typeof createClient>;
let _client: RedisClient | null = null;
let _connecting: Promise<RedisClient | null> | null = null;

async function getRedis(): Promise<RedisClient | null> {
  if (!process.env.REDIS_URL) {
    return null;
  }
  if (_client?.isReady) {
    return _client;
  }
  if (!_connecting) {
    _connecting = (async () => {
      try {
        const client = createClient({ url: process.env.REDIS_URL });
        client.on("error", (err) =>
          console.error("[checkout-guard] redis error:", err)
        );
        await client.connect();
        _client = client;
        return client;
      } catch (err) {
        console.error("[checkout-guard] redis connect failed:", err);
        return null;
      } finally {
        _connecting = null;
      }
    })();
  }
  return _connecting;
}

async function bump(redis: RedisClient, key: string): Promise<number> {
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, WINDOW_SECONDS);
  }
  return count;
}

/**
 * Records one checkout-creation attempt for the user and IP and reports whether
 * both are still under their hourly limits. Fixed one-hour windows in Redis.
 *
 * If REDIS_URL is unset or Redis is unreachable this allows the request and logs
 * a warning, so a Redis outage cannot block paying customers.
 */
export async function consumeCheckoutAttempt(
  userId: string,
  ip: string
): Promise<{ allowed: boolean; retryAfter?: number; reason?: string }> {
  const redis = await getRedis();
  if (!redis) {
    console.warn(
      "[checkout-guard] REDIS_URL unavailable; checkout rate limit skipped"
    );
    return { allowed: true };
  }

  try {
    const userCount = await bump(redis, `checkout:user:${userId}`);
    if (userCount > CHECKOUT_LIMIT_PER_USER) {
      return { allowed: false, retryAfter: WINDOW_SECONDS, reason: "user" };
    }
    const ipCount = await bump(redis, `checkout:ip:${ip}`);
    if (ipCount > CHECKOUT_LIMIT_PER_IP) {
      return { allowed: false, retryAfter: WINDOW_SECONDS, reason: "ip" };
    }
    return { allowed: true };
  } catch (err) {
    console.error("[checkout-guard] rate limit check failed:", err);
    return { allowed: true };
  }
}
