import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { createTeam, getTeamsByUserId } from "@/lib/db/team-queries";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const teams = await getTeamsByUserId(session.user.id);
  return NextResponse.json({ teams });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { name: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name } = body;
  if (!name?.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const t = await createTeam(session.user.id, name.trim());
  return NextResponse.json({ team: t }, { status: 201 });
}
