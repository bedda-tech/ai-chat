import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { acceptTeamInvite, getTeamInviteByToken } from "@/lib/db/team-queries";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    const { token } = await params;
    redirect(`/login?redirect=/api/teams/invite/${token}`);
  }

  const { token } = await params;
  const invite = await getTeamInviteByToken(token);

  if (!invite) {
    redirect("/settings?team_invite=invalid");
  }

  if (invite.acceptedAt) {
    redirect("/settings?team_invite=already_accepted");
  }

  if (invite.expiresAt < new Date()) {
    redirect("/settings?team_invite=expired");
  }

  await acceptTeamInvite(invite.id, session.user.id, invite.teamId);
  redirect("/settings?team_invite=accepted");
}
