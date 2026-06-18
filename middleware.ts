import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { guestRegex, isDevelopmentEnvironment } from "./lib/constants";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /*
   * Playwright starts the dev server and requires a 200 status to
   * begin the tests, so this ensures that the tests can start
   */
  if (pathname.startsWith("/ping")) {
    return new Response("pong", { status: 200 });
  }

  // Routes that bypass auth entirely (webhooks, API keys, public marketing/legal content)
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/webhooks") ||
    pathname.startsWith("/api/models") ||
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/api/v1") ||
    pathname.startsWith("/api/slack") ||
    pathname.startsWith("/api/discord") ||
    pathname.startsWith("/api/github") ||
    pathname.startsWith("/api/telegram") ||
    pathname.startsWith("/api/ms-teams") ||
    pathname.startsWith("/api/whatsapp") ||
    pathname.startsWith("/api/cron/") ||
    pathname.startsWith("/api/unsubscribe") ||
    pathname.startsWith("/compare/") || // SEO comparison pages — must be crawlable
    pathname.startsWith("/join/") || // Referral landing pages
    ["/home", "/pricing", "/roadmap", "/privacy", "/terms", "/unsubscribed"].includes(pathname)
  ) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: !isDevelopmentEnvironment,
  });

  const isGuest = guestRegex.test(token?.email ?? "");

  // Auth pages: redirect authenticated (non-guest) users to the app; otherwise pass through
  if (
    ["/login", "/register", "/forgot-password", "/reset-password"].includes(
      pathname
    )
  ) {
    if (token && !isGuest) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (!token) {
    // For the root homepage, send unauthenticated visitors to the marketing homepage.
    // This prevents an infinite guest-auth redirect loop that breaks SEO crawlers,
    // since crawlers have no cookies and can't complete the guest session flow.
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/home", request.url));
    }

    const redirectUrl = encodeURIComponent(request.url);
    return NextResponse.redirect(
      new URL(`/api/auth/guest?redirectUrl=${redirectUrl}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/chat/:id",
    "/api/:path*",
    "/login",
    "/register",

    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - images (static image assets and favicons)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images|a/script\\.js|a/api/send).*)",
  ],
};
