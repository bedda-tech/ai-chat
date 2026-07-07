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
    memoryEnabled: prefs?.memoryEnabled ?? true,
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const data: { customInstructions?: string; memoryEnabled?: boolean } = {};

  if (typeof body.customInstructions === "string") {
    data.customInstructions = body.customInstructions.slice(0, 2000);
  }
  if (typeof body.memoryEnabled === "boolean") {
    data.memoryEnabled = body.memoryEnabled;
  }

  await upsertUserPreferences(session.user.id, data);
  return Response.json({ success: true });
}
