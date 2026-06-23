import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import {
  createMcpServer,
  deleteMcpServer,
  getMcpServers,
  updateMcpServer,
} from "@/lib/db/queries";
import { getUserTier } from "@/lib/usage/tracking";

const UPGRADE_ERROR = {
  error: "MCP tool integration requires a paid subscription. Upgrade at /upgrade.",
  upgrade: true,
};

/** GET /api/mcp-servers — list user's MCP servers */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tier = await getUserTier(session.user.id);
  if (tier === "free") {
    return NextResponse.json(UPGRADE_ERROR, { status: 403 });
  }

  const servers = await getMcpServers(session.user.id);
  return NextResponse.json({ servers });
}

/** POST /api/mcp-servers — add a new MCP server */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tier = await getUserTier(session.user.id);
  if (tier === "free") {
    return NextResponse.json(UPGRADE_ERROR, { status: 403 });
  }

  let body: { name: string; url: string; headers?: Record<string, string> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, url, headers } = body;
  if (!name?.trim() || !url?.trim()) {
    return NextResponse.json(
      { error: "name and url are required" },
      { status: 400 }
    );
  }

  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const server = await createMcpServer({
    userId: session.user.id,
    name: name.trim(),
    url: url.trim(),
    headers: headers ?? {},
  });

  return NextResponse.json({ server }, { status: 201 });
}

/** PUT /api/mcp-servers?id=xxx — update an MCP server */
export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tier = await getUserTier(session.user.id);
  if (tier === "free") {
    return NextResponse.json(UPGRADE_ERROR, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  let body: {
    name?: string;
    url?: string;
    enabled?: boolean;
    headers?: Record<string, string>;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const server = await updateMcpServer(id, session.user.id, body);
  if (!server) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ server });
}

/** DELETE /api/mcp-servers?id=xxx — delete an MCP server */
export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tier = await getUserTier(session.user.id);
  if (tier === "free") {
    return NextResponse.json(UPGRADE_ERROR, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  await deleteMcpServer(id, session.user.id);
  return NextResponse.json({ success: true });
}
