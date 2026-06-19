import { auth } from "@/app/(auth)/auth";
import {
  getOrgModelPolicyForUser,
  getTeamsByUserId,
  getUserTeamAdminRole,
  upsertOrgModelPolicy,
} from "@/lib/db/team-queries";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const policy = await getOrgModelPolicyForUser(session.user.id);
  const teams = await getTeamsByUserId(session.user.id);
  const isAdmin = teams.some((t) => t.role === "admin");

  return Response.json({ policy, isAdmin, teamId: teams[0]?.id ?? null });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { teamId, allowedModelIds, deniedModelIds, monthlyCostCapUsdCents } =
    body;

  if (!teamId) {
    return Response.json({ error: "teamId required" }, { status: 400 });
  }

  const role = await getUserTeamAdminRole(session.user.id, teamId);
  if (role !== "admin") {
    return Response.json(
      { error: "Only team admins can update the model policy" },
      { status: 403 }
    );
  }

  const policy = await upsertOrgModelPolicy(teamId, {
    allowedModelIds: allowedModelIds ?? null,
    deniedModelIds: deniedModelIds ?? null,
    monthlyCostCapUsdCents: monthlyCostCapUsdCents ?? 0,
  });

  return Response.json({ policy });
}
