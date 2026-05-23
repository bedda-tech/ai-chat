import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { signIn } from "@/app/(auth)/auth";
import { isDevelopmentEnvironment } from "@/lib/constants";

// Non-browser clients that can't store cookies will loop forever between /
// and /api/auth/guest because the cookie set by signIn is never sent back.
const NON_BROWSER_UA =
  /bot|crawler|spider|curl\/|wget|python-requests|go-http-client|java\/|ruby\/|perl|httpclient|libwww|uptime|pingdom|statuscake|monitor/i;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const redirectUrl = searchParams.get("redirectUrl") || "/";

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

  return signIn("guest", { redirect: true, redirectTo: redirectUrl });
}
