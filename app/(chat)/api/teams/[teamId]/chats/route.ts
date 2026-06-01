import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getChatById } from "@/lib/db/queries";
import {
  getTeamSharedChats,
  isTeamAdmin,
  isTeamMember,
  shareChat,
  unshareChat,
} from "@/lib/db/team-queries";

export async function GET(
  _req: Request,
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

  const chats = await getTeamSharedChats(teamId);
  return NextResponse.json({ chats });
}

export async function POST(
  req: Request,
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

  let body: { chatId: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { chatId } = body;
  if (!chatId) {
    return NextResponse.json({ error: "chatId is required" }, { status: 400 });
  }

  const chat = await getChatById({ id: chatId });
  if (!chat) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  if (chat.userId !== session.user.id) {
    return NextResponse.json(
      { error: "Only the chat owner can share it" },
      { status: 403 }
    );
  }

  await shareChat(teamId, chatId, session.user.id);
  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { teamId } = await params;

  let body: { chatId: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { chatId } = body;
  if (!chatId) {
    return NextResponse.json({ error: "chatId is required" }, { status: 400 });
  }

  const chat = await getChatById({ id: chatId });
  if (!chat) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  const isOwner = chat.userId === session.user.id;
  const isAdmin = await isTeamAdmin(teamId, session.user.id);

  if (!isOwner && !isAdmin) {
    return NextResponse.json(
      { error: "Only the chat owner or team admin can unshare" },
      { status: 403 }
    );
  }

  await unshareChat(teamId, chatId);
  return NextResponse.json({ ok: true });
}
