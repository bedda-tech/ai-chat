import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { deleteDriveConnection, getDriveConnection } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

/** GET /api/drive -- returns current Drive connection status */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conn = await getDriveConnection(session.user.id);
  if (!conn) {
    return NextResponse.json({ connected: false });
  }

  return NextResponse.json({
    connected: true,
    connectedAt: conn.connectedAt,
    scope: conn.scope,
  });
}

/** DELETE /api/drive -- disconnect Google Drive */
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await deleteDriveConnection(session.user.id);
  return NextResponse.json({ success: true });
}
