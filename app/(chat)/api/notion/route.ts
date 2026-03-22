import { auth } from "@/app/(auth)/auth";
import { deleteNotionConnection, getNotionConnection } from "@/lib/db/queries";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** GET /api/notion -- returns current Notion connection status */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conn = await getNotionConnection(session.user.id);
  if (!conn) {
    return NextResponse.json({ connected: false });
  }

  return NextResponse.json({
    connected: true,
    workspaceName: conn.workspaceName,
    connectedAt: conn.connectedAt,
  });
}

/** DELETE /api/notion -- disconnect Notion */
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await deleteNotionConnection(session.user.id);
  return NextResponse.json({ success: true });
}
