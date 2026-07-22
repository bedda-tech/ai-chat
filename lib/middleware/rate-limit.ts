import { NextResponse } from "next/server";
import {
  checkRateLimit,
  checkTierLimit,
  getUserTier,
  incrementRateLimit,
  TIER_LIMITS,
  type UserTierType,
} from "@/lib/usage/tracking";

export type RateLimitResult = {
  allowed: boolean;
  /** The user's DB tier — always set so callers avoid a second DB lookup. */
  tier?: UserTierType;
  error?: string;
  message?: string;
  retryAfter?: number;
  upgrade?: boolean;
  upgradeUrl?: string;
};

/**
 * Rate limiting middleware for chat requests
 * Checks per-minute, daily, and monthly limits
 */
export async function rateLimitMiddleware(
  userId: string
): Promise<RateLimitResult> {
  try {
    // Get user's tier
    const tier = await getUserTier(userId);
    const limits = TIER_LIMITS[tier];

    // Check per-minute limit
    const minuteLimit = await checkRateLimit(
      userId,
      "messages_per_minute",
      tier
    );

    if (!minuteLimit.allowed) {
      return {
        allowed: false,
        tier,
        error: "Rate limit exceeded",
        message: `You can only send ${limits.messagesPerMinute} messages per minute. Please wait ${minuteLimit.retryAfter} seconds.`,
        retryAfter: minuteLimit.retryAfter,
      };
    }

    // Check daily limit
    const dailyLimit = await checkRateLimit(userId, "messages_per_day", tier);

    if (!dailyLimit.allowed) {
      const retryAfterHours = dailyLimit.retryAfter
        ? Math.ceil(dailyLimit.retryAfter / 3600)
        : 24;
      return {
        allowed: false,
        tier,
        error: "Daily limit exceeded",
        message: `You've reached your daily limit of ${limits.messagesPerDay} messages. Resets in ~${retryAfterHours} hour${retryAfterHours === 1 ? "" : "s"}.`,
        retryAfter: dailyLimit.retryAfter,
        upgrade: tier === "free",
        upgradeUrl: tier === "free" ? "/upgrade?plan=plus" : undefined,
      };
    }

    // Check monthly limit
    const monthlyAllowed = await checkTierLimit(userId, tier);

    if (!monthlyAllowed) {
      return {
        allowed: false,
        tier,
        error: "Monthly limit exceeded",
        message: `You've reached your monthly limit of ${limits.messagesPerMonth} messages.${
          tier === "free"
            ? " Upgrade to Plus for unlimited monthly messages!"
            : " Please upgrade to a higher tier for more capacity."
        }`,
        upgrade: true,
        upgradeUrl: "/pricing",
      };
    }

    // Increment rate limit counters
    await Promise.all([
      incrementRateLimit(userId, "messages_per_minute"),
      incrementRateLimit(userId, "messages_per_day"),
    ]);

    return {
      allowed: true,
      tier,
    };
  } catch (error) {
    console.error("Rate limiting error:", error);
    // Fail CLOSED — deny request on rate-limit DB error to protect API spend
    return {
      allowed: false,
      error: "Rate limiting unavailable",
      message: "Service temporarily unavailable. Please try again shortly.",
    };
  }
}

/**
 * Create a NextResponse for rate limit errors.
 * Uses ChatSDKError format (code + cause) so fetchWithErrorHandlers parses it correctly.
 * Also includes upgrade metadata for the chat UI to show an upgrade prompt.
 */
export function createRateLimitResponse(result: RateLimitResult): NextResponse {
  const status = 429; // Too Many Requests

  const headers = new Headers();
  if (result.retryAfter) {
    headers.set("Retry-After", result.retryAfter.toString());
  }
  headers.set("X-RateLimit-Limit", "true");

  return NextResponse.json(
    {
      code: "rate_limit:chat",
      cause: result.message,
      upgrade: result.upgrade || false,
      upgradeUrl: result.upgradeUrl || "/upgrade?plan=plus",
    },
    {
      status,
      headers,
    }
  );
}
