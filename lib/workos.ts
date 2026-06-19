const WORKOS_API_BASE = "https://api.workos.com";

export interface WorkOSUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  profile_picture_url: string | null;
}

export function getWorkOSAuthorizationUrl({
  organizationId,
  connectionId,
  redirectUri,
  state,
}: {
  organizationId?: string;
  connectionId?: string;
  redirectUri: string;
  state?: string;
}): string {
  const params = new URLSearchParams({
    client_id: process.env.WORKOS_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: "code",
  });
  if (organizationId) params.set("organization_id", organizationId);
  if (connectionId) params.set("connection", connectionId);
  if (state) params.set("state", state);
  return `${WORKOS_API_BASE}/user_management/authorize?${params}`;
}

export async function authenticateWithCode(
  code: string
): Promise<{ user: WorkOSUser }> {
  const res = await fetch(`${WORKOS_API_BASE}/user_management/authenticate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.WORKOS_CLIENT_ID,
      client_secret: process.env.WORKOS_API_KEY,
      code,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`WorkOS authentication failed: ${err}`);
  }
  return res.json();
}
