import { createHash, randomBytes } from "node:crypto";
import { auth } from "@/app/(auth)/auth";
import { logAuditEvent } from "@/lib/audit";
import { createApiKey, listApiKeys, revokeApiKey } from "@/lib/db/queries";
import { getUserTier } from "@/lib/usage/tracking";

const UPGRADE_ERROR = {
  error: "API access requires a paid subscription. Upgrade at /upgrade.",
};

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tier = await getUserTier(session.user.id);
  if (tier === "free") {
    return Response.json(UPGRADE_ERROR, { status: 403 });
  }

  const keys = await listApiKeys(session.user.id);
  return Response.json(
    keys.map((k) => ({
      id: k.id,
      name: k.name,
      keyPrefix: k.keyPrefix,
      lastUsedAt: k.lastUsedAt,
      createdAt: k.createdAt,
    }))
  );
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tier = await getUserTier(session.user.id);
  if (tier === "free") {
    return Response.json(UPGRADE_ERROR, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return Response.json({ error: "name is required" }, { status: 400 });
  }

  const raw = randomBytes(32).toString("hex");
  const plaintext = `bai_${raw}`;
  const keyHash = createHash("sha256").update(plaintext).digest("hex");
  const keyPrefix = `${plaintext.slice(0, 10)}...`;

  const key = await createApiKey({
    userId: session.user.id,
    name,
    keyHash,
    keyPrefix,
  });

  void logAuditEvent(session.user.id, "api_key.created", {
    keyId: key.id,
    name,
  });

  return Response.json({
    id: key.id,
    name: key.name,
    keyPrefix: key.keyPrefix,
    createdAt: key.createdAt,
    key: plaintext, // shown once, not stored
  });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  if (!body?.id) {
    return Response.json({ error: "id is required" }, { status: 400 });
  }

  await revokeApiKey(body.id, session.user.id);
  void logAuditEvent(session.user.id, "api_key.deleted", { keyId: body.id });
  return Response.json({ success: true });
}
