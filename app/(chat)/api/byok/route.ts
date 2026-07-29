import { auth } from "@/app/(auth)/auth";
import { encryptValue } from "@/lib/ai/plugin-encrypt";
import {
  deleteUserProviderKey,
  getUserProviderKey,
  upsertUserProviderKey,
} from "@/lib/db/queries";

const SUPPORTED_PROVIDERS = ["openai"] as const;
type SupportedProvider = (typeof SUPPORTED_PROVIDERS)[number];

function isSupportedProvider(p: string): p is SupportedProvider {
  return (SUPPORTED_PROVIDERS as readonly string[]).includes(p);
}

// GET /api/byok?provider=openai — returns key prefix (masked) or null
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const provider = searchParams.get("provider") ?? "openai";
  if (!isSupportedProvider(provider)) {
    return Response.json({ error: "Unsupported provider" }, { status: 400 });
  }

  const row = await getUserProviderKey(session.user.id, provider);
  if (!row) {
    return Response.json({ configured: false });
  }
  return Response.json({ configured: true, keyPrefix: row.keyPrefix });
}

// PUT /api/byok — save or update a provider key
export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { provider?: string; key?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { provider = "openai", key } = body;
  if (!key || typeof key !== "string" || key.trim().length < 8) {
    return Response.json({ error: "Invalid key" }, { status: 400 });
  }
  if (!isSupportedProvider(provider)) {
    return Response.json({ error: "Unsupported provider" }, { status: 400 });
  }

  const trimmed = key.trim();
  const encryptedKey = encryptValue(trimmed);
  const keyPrefix = trimmed.slice(0, 8);

  await upsertUserProviderKey(
    session.user.id,
    provider,
    encryptedKey,
    keyPrefix
  );
  return Response.json({ configured: true, keyPrefix });
}

// DELETE /api/byok?provider=openai — remove a stored key
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const provider = searchParams.get("provider") ?? "openai";
  if (!isSupportedProvider(provider)) {
    return Response.json({ error: "Unsupported provider" }, { status: 400 });
  }

  await deleteUserProviderKey(session.user.id, provider);
  return Response.json({ configured: false });
}
