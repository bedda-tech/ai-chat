import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { createClient } from "redis";
import { signIn } from "@/app/(auth)/auth";
import { isDevelopmentEnvironment } from "@/lib/constants";

// Non-browser clients that can't store cookies will loop forever between /
// and /api/auth/guest because the cookie set by signIn is never sent back.
const NON_BROWSER_UA =
  /bot|crawler|spider|curl\/|wget|python-requests|go-http-client|java\/|ruby\/|perl|httpclient|libwww|uptime|pingdom|statuscake|monitor/i;

const GUEST_IP_LIMIT = 5;
const GUEST_IP_WINDOW_SECONDS = 3600; // 1 hour

let _redis: ReturnType<typeof createClient> | null = null;

async function getRedis(): Promise<ReturnType<typeof createClient> | null> {
  if (!process.env.REDIS_URL) {
    return null;
  }
  if (_redis?.isReady) {
    return _redis;
  }
  try {
    const client = createClient({ url: process.env.REDIS_URL });
    client.on("error", () => {});
    await client.connect();
    _redis = client;
    return _redis;
  } catch {
    return null;
  }
}

function safeRedirectPath(raw: string | null, requestUrl: string): string {
  if (!raw) return "/";
  try {
    const parsed = new URL(raw);
    const origin = new URL(requestUrl).origin;
    // Only allow same-origin redirects
    if (parsed.origin === origin) {
      return parsed.pathname + parsed.search + parsed.hash;
    }
  } catch {
    // `raw` is a relative path (no origin) — allow if it starts with a single slash
    if (/^\/(?!\/)/.test(raw)) {
      return raw;
    }
  }
  return "/";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const redirectUrl = safeRedirectPath(searchParams.get("redirectUrl"), request.url);

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: !isDevelopmentEnvironment,
  });

  if (token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Cookieless clients (bots, crawlers, curl, uptime monitors) can't complete
  // the cookie handshake — redirect to a public page to break the loop.
  const ua = request.headers.get("user-agent") ?? "";
  if (NON_BROWSER_UA.test(ua)) {
    return NextResponse.redirect(new URL("/pricing", request.url));
  }

  // IP-based throttle: max 5 guest accounts per IP per hour.
  // Prevents scripts from looping guest creation to exhaust paid model quotas.
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const redis = await getRedis();
  if (redis) {
    try {
      const key = `guest:ip:${ip}`;
      const count = await redis.incr(key);
      if (count === 1) {
        await redis.expire(key, GUEST_IP_WINDOW_SECONDS);
      }
      if (count > GUEST_IP_LIMIT) {
        return NextResponse.redirect(
          new URL("/pricing?reason=guest_limit", request.url)
        );
      }
    } catch {
      // Redis error: allow through (graceful degradation over hard failure)
    }
  }

  return signIn("guest", { redirect: true, redirectTo: redirectUrl });
}
