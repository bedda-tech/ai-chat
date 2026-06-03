import "server-only";

import { and, count, desc, eq, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { chat, team, teamChat, teamInvite, teamMember, user } from "./schema";

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

export async function shareChat(
  teamId: string,
  chatId: string,
  sharedBy: string
) {
  await db
    .insert(teamChat)
    .values({ teamId, chatId, sharedBy })
    .onConflictDoNothing();
}

export async function unshareChat(teamId: string, chatId: string) {
  await db
    .delete(teamChat)
    .where(and(eq(teamChat.teamId, teamId), eq(teamChat.chatId, chatId)));
}

export async function getTeamSharedChats(teamId: string) {
  return db
    .select({
      chatId: teamChat.chatId,
      sharedAt: teamChat.sharedAt,
      sharedBy: teamChat.sharedBy,
      title: chat.title,
      createdAt: chat.createdAt,
      ownerEmail: user.email,
    })
    .from(teamChat)
    .innerJoin(chat, eq(teamChat.chatId, chat.id))
    .innerJoin(user, eq(teamChat.sharedBy, user.id))
    .where(eq(teamChat.teamId, teamId))
    .orderBy(desc(teamChat.sharedAt));
}

export async function getTeamsForChat(chatId: string) {
  return db
    .select({ teamId: teamChat.teamId })
    .from(teamChat)
    .where(eq(teamChat.chatId, chatId));
}

export async function getTeamById(teamId: string) {
  const rows = await db
    .select()
    .from(team)
    .where(eq(team.id, teamId))
    .limit(1);
  return rows[0] ?? null;
}

export async function getTeamMemberCount(teamId: string): Promise<number> {
  const rows = await db
    .select({ cnt: count() })
    .from(teamMember)
    .where(eq(teamMember.teamId, teamId));
  return rows[0]?.cnt ?? 0;
}

export async function updateTeamBilling(
  teamId: string,
  fields: {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    seatLimit?: number;
  }
) {
  await db.update(team).set(fields).where(eq(team.id, teamId));
}

export async function getTeamByStripeSubscriptionId(subscriptionId: string) {
  const rows = await db
    .select()
    .from(team)
    .where(eq(team.stripeSubscriptionId, subscriptionId))
    .limit(1);
  return rows[0] ?? null;
}
