import { auth } from "@/app/(auth)/auth";
import { getUserPreferences, upsertUserPreferences } from "@/lib/db/queries";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prefs = await getUserPreferences(session.user.id);
  return Response.json({
    customInstructions: prefs?.customInstructions ?? "",
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const customInstructions =
    typeof body.customInstructions === "string"
      ? body.customInstructions.slice(0, 2000)
      : "";

  await upsertUserPreferences(session.user.id, { customInstructions });
  return Response.json({ success: true });
}
