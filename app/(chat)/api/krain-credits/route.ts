import { auth } from "@/app/(auth)/auth";
import { encryptValue, isEncryptionConfigured } from "@/lib/ai/plugin-encrypt";
import {
  deleteUserProviderKey,
  getUserProviderKey,
  upsertUserProviderKey,
} from "@/lib/db/queries";
import { KRAIN_CREDIT_PROVIDER } from "@/lib/krain/spend-rules";

// Guests have no account to hold a key against, so they cannot link one.
async function getAccountUserId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id || session.user.type === "guest") {
    return null;
  }
  return session.user.id;
}

// GET /api/krain-credits — whether a testnet KRAIN key is linked (masked prefix only)
export async function GET() {
  const userId = await getAccountUserId();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const row = await getUserProviderKey(userId, KRAIN_CREDIT_PROVIDER);
  if (!row) {
    return Response.json({ configured: false });
  }
  return Response.json({ configured: true, keyPrefix: row.keyPrefix });
}

// PUT /api/krain-credits — link or replace the tester's app.krain.ai API key
export async function PUT(req: Request) {
  const userId = await getAccountUserId();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { key?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { key } = body;
  if (typeof key !== "string" || key.trim().length < 8) {
    return Response.json({ error: "Invalid key" }, { status: 400 });
  }

  // encryptValue stores plaintext when its key is unset, so refuse rather than store
  // a credit key unencrypted.
  if (!isEncryptionConfigured()) {
    return Response.json(
      { error: "Key storage is not configured" },
      { status: 503 }
    );
  }

  const trimmed = key.trim();
  const keyPrefix = trimmed.slice(0, 8);

  await upsertUserProviderKey(
    userId,
    KRAIN_CREDIT_PROVIDER,
    encryptValue(trimmed),
    keyPrefix
  );
  return Response.json({ configured: true, keyPrefix });
}

// DELETE /api/krain-credits — unlink the key; messages go back to the normal allowance
export async function DELETE() {
  const userId = await getAccountUserId();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await deleteUserProviderKey(userId, KRAIN_CREDIT_PROVIDER);
  return Response.json({ configured: false });
}
