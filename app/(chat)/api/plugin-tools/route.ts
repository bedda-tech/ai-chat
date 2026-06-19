import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { encryptValue } from "@/lib/ai/plugin-encrypt";
import {
  createPluginTool,
  deletePluginTool,
  getPluginTools,
  updatePluginTool,
} from "@/lib/db/queries";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const tools = await getPluginTools(session.user.id);
  return NextResponse.json({ tools });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    name: string;
    description: string;
    parametersSchema: Record<string, any>;
    webhookUrl: string;
    authHeaderName?: string;
    authHeaderValue?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    name,
    description,
    parametersSchema,
    webhookUrl,
    authHeaderName,
    authHeaderValue,
  } = body;

  if (!name?.trim() || !description?.trim() || !webhookUrl?.trim()) {
    return NextResponse.json(
      { error: "name, description, and webhookUrl are required" },
      { status: 400 }
    );
  }

  if (!webhookUrl.startsWith("https://")) {
    return NextResponse.json(
      { error: "webhookUrl must use HTTPS" },
      { status: 400 }
    );
  }

  const toolName = name
    .trim()
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .slice(0, 64);

  const tool = await createPluginTool({
    userId: session.user.id,
    name: toolName,
    description: description.trim(),
    parametersSchema: parametersSchema ?? { type: "object", properties: {} },
    webhookUrl: webhookUrl.trim(),
    authHeaderName: authHeaderName?.trim() || undefined,
    authHeaderValueEncrypted: authHeaderValue
      ? encryptValue(authHeaderValue)
      : undefined,
  });

  return NextResponse.json({ tool }, { status: 201 });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  let body: { enabled?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const tool = await updatePluginTool(id, session.user.id, body);
  if (!tool) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ tool });
}

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

  await deletePluginTool(id, session.user.id);
  return NextResponse.json({ success: true });
}
