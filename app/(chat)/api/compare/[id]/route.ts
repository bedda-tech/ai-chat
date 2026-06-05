import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import {
  getCompareSession,
  deleteCompareSession,
} from "@/lib/db/compare-queries";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const compareSession = await getCompareSession(id, session.user.id);
  if (!compareSession) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ session: compareSession });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await deleteCompareSession(id, session.user.id);
  return NextResponse.json({ ok: true });
}
