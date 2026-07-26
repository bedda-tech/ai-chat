import { auth } from "@/app/(auth)/auth";
import { getDailyUsage, getUserTier, TIER_LIMITS } from "@/lib/usage/tracking";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [used, tier] = await Promise.all([
    getDailyUsage(session.user.id),
    getUserTier(session.user.id),
  ]);

  const limit = TIER_LIMITS[tier].messagesPerDay;
  const pct = limit >= 999_999_999 ? 0 : used / limit;

  return Response.json({ used, limit, tier, pct });
}
