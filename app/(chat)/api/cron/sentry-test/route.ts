import * as Sentry from "@sentry/nextjs";

export const dynamic = "force-dynamic";

/** Sends one test error to Sentry. Protected by CRON_SECRET, like the other crons. */
export async function GET(request: Request) {
  const secret = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const eventId = Sentry.captureException(
    new Error("Bedda Chat Sentry test error (observability check)")
  );
  await Sentry.flush(5000);
  return Response.json({ ok: true, eventId });
}
