import { reportPage } from "@/lib/db/published-pages";

/** Public: anyone can report a published page. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const slug: unknown = body?.slug;
  const reason: unknown = body?.reason;
  if (typeof slug !== "string" || slug.length > 24) {
    return Response.json({ error: "slug required" }, { status: 400 });
  }
  const text = typeof reason === "string" ? reason.slice(0, 1000) : "";
  const ok = await reportPage(slug, text || "No reason given");
  return Response.json({ ok }, { status: ok ? 200 : 404 });
}
