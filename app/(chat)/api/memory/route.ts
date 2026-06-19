import { auth } from "@/app/(auth)/auth";
import {
  deleteAllUserMemories,
  deleteUserMemory,
  getUserMemories,
} from "@/lib/db/queries";
import { ChatSDKError } from "@/lib/errors";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new ChatSDKError("unauthorized:chat").toResponse();
  }

  const memories = await getUserMemories(session.user.id);
  return Response.json({ memories });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return new ChatSDKError("unauthorized:chat").toResponse();
  }

  const { id, all } = await request.json();

  if (all) {
    await deleteAllUserMemories(session.user.id);
    return Response.json({ success: true });
  }

  if (id) {
    await deleteUserMemory(id, session.user.id);
    return Response.json({ success: true });
  }

  return Response.json(
    { error: "Missing id or all parameter" },
    { status: 400 }
  );
}
