import type { NextRequest } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getChatById, getMessagesByChatId } from "@/lib/db/queries";
import { ChatSDKError } from "@/lib/errors";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user) {
    return new ChatSDKError("unauthorized:chat").toResponse();
  }

  const chat = await getChatById({ id });
  if (!chat) {
    return new ChatSDKError("not_found:chat").toResponse();
  }
  if (chat.userId !== session.user.id) {
    return new ChatSDKError("not_found:chat").toResponse();
  }

  const messages = await getMessagesByChatId({ id });

  const date = new Date(chat.createdAt).toISOString().split("T")[0];
  const lines: string[] = [
    "# Chat Export",
    "",
    `**Date:** ${date}`,
    `**ID:** ${id}`,
    "",
  ];

  for (const msg of messages) {
    const label = msg.role === "user" ? "**User**" : "**Assistant**";
    const parts = msg.parts as Array<{ type: string; text?: string }>;
    const textContent = parts
      .filter((p) => p.type === "text" && typeof p.text === "string")
      .map((p) => p.text as string)
      .join("\n");

    if (!textContent.trim()) continue;

    lines.push("---", "", `${label}:`, "", textContent, "");
  }

  const markdown = lines.join("\n");

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="chat-${id}.md"`,
    },
  });
}
