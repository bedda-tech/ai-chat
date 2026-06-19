import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { logAuditEvent } from "@/lib/audit";
import {
  createTeamInvite,
  getPendingInvitesByTeam,
  getTeamById,
  getTeamMemberCount,
  getTeamMembersWithEmail,
  isTeamAdmin,
  isTeamMember,
  removeMemberFromTeam,
} from "@/lib/db/team-queries";
import { sendTeamInviteEmail } from "@/lib/email/send-team-invite";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { teamId } = await params;

  const member = await isTeamMember(teamId, session.user.id);
  if (!member) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [members, pendingInvites] = await Promise.all([
    getTeamMembersWithEmail(teamId),
    getPendingInvitesByTeam(teamId),
  ]);

  return NextResponse.json({ members, pendingInvites });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { teamId } = await params;

  const admin = await isTeamAdmin(teamId, session.user.id);
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { email: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email } = body;
  if (!email?.trim()) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  // Enforce seat limit when a paid subscription is active
  const [teamRecord, memberCount] = await Promise.all([
    getTeamById(teamId),
    getTeamMemberCount(teamId),
  ]);
  if (
    teamRecord?.stripeSubscriptionId &&
    memberCount >= (teamRecord.seatLimit ?? 5)
  ) {
    return NextResponse.json(
      {
        error: "seat_limit_reached",
        message:
          "Seat limit reached. Upgrade your team plan to invite more members.",
      },
      { status: 403 }
    );
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const invite = await createTeamInvite(teamId, email.trim(), token, expiresAt);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.bedda.tech";
  const inviteUrl = `${baseUrl}/api/teams/invite/${token}`;

  try {
    await sendTeamInviteEmail(
      email.trim(),
      "your team",
      session.user.email ?? session.user.id,
      inviteUrl
    );
  } catch (err) {
    console.error("Failed to send invite email:", err);
  }

  void logAuditEvent(session.user.id, "team.member_invited", {
    teamId,
    inviteeEmail: email.trim(),
  });

  return NextResponse.json({ invite }, { status: 201 });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { teamId } = await params;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const admin = await isTeamAdmin(teamId, session.user.id);
  if (!admin && userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await removeMemberFromTeam(teamId, userId);
  void logAuditEvent(session.user.id, "team.member_removed", {
    teamId,
    removedUserId: userId,
  });
  return NextResponse.json({ success: true });
}
