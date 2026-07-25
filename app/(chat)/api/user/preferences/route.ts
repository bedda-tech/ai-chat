import { auth } from "@/app/(auth)/auth";
import { getUserPreferences, upsertUserPreferences } from "@/lib/db/queries";
import { MODEL_PREFERENCE_CATEGORIES } from "@/lib/ai/model-preferences";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prefs = await getUserPreferences(session.user.id);
  return Response.json({
    customInstructions: prefs?.customInstructions ?? "",
    memoryEnabled: prefs?.memoryEnabled ?? true,
    modelPreferences: prefs?.modelPreferences ?? {},
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const data: {
    customInstructions?: string;
    memoryEnabled?: boolean;
    modelPreferences?: Record<string, string>;
  } = {};

  if (typeof body.customInstructions === "string") {
    data.customInstructions = body.customInstructions.slice(0, 2000);
  }
  if (typeof body.memoryEnabled === "boolean") {
    data.memoryEnabled = body.memoryEnabled;
  }
  if (body.modelPreferences && typeof body.modelPreferences === "object") {
    const filtered: Record<string, string> = {};
    for (const cat of MODEL_PREFERENCE_CATEGORIES) {
      if (typeof body.modelPreferences[cat] === "string") {
        filtered[cat] = body.modelPreferences[cat];
      }
    }
    // Merge with existing preferences to support partial updates
    const existing = await getUserPreferences(session.user.id);
    data.modelPreferences = {
      ...(existing?.modelPreferences ?? {}),
      ...filtered,
    };
  }

  await upsertUserPreferences(session.user.id, data);
  return Response.json({ success: true });
}
