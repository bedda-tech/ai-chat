import { redirect } from "next/navigation"
import { getSsoConfigByDomain } from "@/lib/db/queries"
import { getWorkOSAuthorizationUrl } from "@/lib/workos"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email") ?? ""
  const domain = email.includes("@") ? email.split("@")[1].toLowerCase() : searchParams.get("domain") ?? ""

  if (!domain) {
    redirect("/login?sso_error=missing_domain")
  }

  const ssoConfig = await getSsoConfigByDomain(domain)
  if (!ssoConfig) {
    redirect(`/login?sso_error=no_sso_for_domain&domain=${encodeURIComponent(domain)}`)
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const redirectUri = process.env.WORKOS_REDIRECT_URI || `${baseUrl}/api/auth/workos/callback`

  const authUrl = getWorkOSAuthorizationUrl({
    organizationId: ssoConfig.workosOrganizationId ?? undefined,
    connectionId: ssoConfig.workosConnectionId ?? undefined,
    redirectUri,
  })

  redirect(authUrl)
}
