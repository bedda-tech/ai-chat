import "server-only";

import { and, eq, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { team, teamInvite, teamMember, user } from "./schema";

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

export async function createTeam(ownerId: string, name: string) {
  const [t] = await db.insert(team).values({ name, ownerId }).returning();

  await db.insert(teamMember).values({
    teamId: t.id,
    userId: ownerId,
    role: "admin",
  });

  return t;
}

export async function getTeamsByUserId(userId: string) {
  return db
    .select({
      id: team.id,
      name: team.name,
      ownerId: team.ownerId,
      stripeCustomerId: team.stripeCustomerId,
      createdAt: team.createdAt,
      role: teamMember.role,
    })
    .from(teamMember)
    .innerJoin(team, eq(teamMember.teamId, team.id))
    .where(eq(teamMember.userId, userId));
}

export async function getTeamMembersWithEmail(teamId: string) {
  return db
    .select({
      userId: teamMember.userId,
      email: user.email,
      role: teamMember.role,
      joinedAt: teamMember.joinedAt,
    })
    .from(teamMember)
    .innerJoin(user, eq(teamMember.userId, user.id))
    .where(eq(teamMember.teamId, teamId));
}

export async function isTeamAdmin(teamId: string, userId: string) {
  const rows = await db
    .select()
    .from(teamMember)
    .where(
      and(
        eq(teamMember.teamId, teamId),
        eq(teamMember.userId, userId),
        eq(teamMember.role, "admin")
      )
    )
    .limit(1);
  return rows.length > 0;
}

export async function isTeamMember(teamId: string, userId: string) {
  const rows = await db
    .select()
    .from(teamMember)
    .where(and(eq(teamMember.teamId, teamId), eq(teamMember.userId, userId)))
    .limit(1);
  return rows.length > 0;
}

export async function removeMemberFromTeam(teamId: string, userId: string) {
  return db
    .delete(teamMember)
    .where(
      and(eq(teamMember.teamId, teamId), eq(teamMember.userId, userId))
    );
}

export async function createTeamInvite(
  teamId: string,
  email: string,
  token: string,
  expiresAt: Date
) {
  const [inv] = await db
    .insert(teamInvite)
    .values({ teamId, email, token, expiresAt })
    .returning();
  return inv;
}

export async function getTeamInviteByToken(token: string) {
  const rows = await db
    .select()
    .from(teamInvite)
    .where(eq(teamInvite.token, token))
    .limit(1);
  return rows[0] ?? null;
}

export async function acceptTeamInvite(
  inviteId: string,
  userId: string,
  teamId: string
) {
  await db
    .update(teamInvite)
    .set({ acceptedAt: new Date() })
    .where(eq(teamInvite.id, inviteId));

  const existing = await isTeamMember(teamId, userId);
  if (!existing) {
    await db.insert(teamMember).values({ teamId, userId, role: "member" });
  }
}

export async function getPendingInvitesByTeam(teamId: string) {
  return db
    .select()
    .from(teamInvite)
    .where(
      and(eq(teamInvite.teamId, teamId), isNull(teamInvite.acceptedAt))
    );
}
