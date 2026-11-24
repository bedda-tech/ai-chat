import "server-only";

/**
 * Fire-and-forget server-side PostHog capture via the public ingest API.
 * No-op when NEXT_PUBLIC_POSTHOG_KEY is unset. Never throws.
 */
export async function captureServerEvent(
  distinctId: string,
  event: string,
  properties: Record<string, unknown> = {}
): Promise<void> {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) {
    return;
  }
  const host = (
    process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com"
  ).replace(/\/$/, "");
  try {
    await fetch(`${host}/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: key,
        event,
        distinct_id: distinctId,
        properties,
      }),
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    // analytics must never break a request
  }
}
