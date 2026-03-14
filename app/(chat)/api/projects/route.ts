import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import {
  createProject,
  deleteProject,
  getProjectsByUserId,
  updateProject,
} from "@/lib/db/queries";

/** GET /api/projects — list user's projects */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await getProjectsByUserId(session.user.id);
  return NextResponse.json({ projects });
}

/** POST /api/projects — create a new project */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { name: string; description?: string; instructions?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, description, instructions } = body;
  if (!name?.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const p = await createProject({
    userId: session.user.id,
    name: name.trim(),
    description: description?.trim(),
    instructions: instructions?.trim(),
  });

  return NextResponse.json({ project: p }, { status: 201 });
}

/** PUT /api/projects?id=xxx — update a project */
export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  let body: { name?: string; description?: string; instructions?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const p = await updateProject(id, session.user.id, body);
  if (!p) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ project: p });
}

/** DELETE /api/projects?id=xxx — delete a project */
export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  await deleteProject(id, session.user.id);
  return NextResponse.json({ success: true });
}
