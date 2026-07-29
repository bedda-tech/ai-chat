import { auth } from "@/app/(auth)/auth";
import {
  deleteSsoConfig,
  getAllSsoConfigs,
  upsertSsoConfig,
} from "@/lib/db/queries";
import { getUserTier } from "@/lib/usage/tracking";

async function requireEnterprise(userId: string): Promise<Response | null> {
  const tier = await getUserTier(userId);
  if (tier !== "enterprise") {
    return Response.json(
      { error: "Enterprise subscription required" },
      { status: 403 }
    );
  }
  return null;
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const err = await requireEnterprise(session.user.id);
  if (err) {
    return err;
  }

  const configs = await getAllSsoConfigs();
  return Response.json({ configs });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const err = await requireEnterprise(session.user.id);
  if (err) {
    return err;
  }

  const body = await request.json();
  const {
    organizationName,
    emailDomain,
    workosOrganizationId,
    workosConnectionId,
    idpMetadataUrl,
  } = body;

  if (!organizationName || !emailDomain) {
    return Response.json(
      { error: "organizationName and emailDomain are required" },
      { status: 400 }
    );
  }

  const config = await upsertSsoConfig({
    organizationName,
    emailDomain,
    workosOrganizationId,
    workosConnectionId,
    idpMetadataUrl,
    configuredByUserId: session.user.id,
  });
  return Response.json({ config });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const err = await requireEnterprise(session.user.id);
  if (err) {
    return err;
  }

  const { id } = await request.json();
  if (!id) {
    return Response.json({ error: "id is required" }, { status: 400 });
  }

  await deleteSsoConfig(id);
  return Response.json({ success: true });
}
