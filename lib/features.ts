/**
 * Launch feature flag. Bedda Chat is single player at launch; multiplayer
 * (teams, invites, bots, SSO) and Video Studio are hidden unless
 * NEXT_PUBLIC_ENABLE_TEAM_FEATURES=true. Code is kept, only hidden.
 */
export const TEAM_FEATURES_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_TEAM_FEATURES === "true";

/** Path prefixes (pages and APIs) that 404 when the flag is off. */
export const HIDDEN_PATH_PREFIXES = [
  "/studio/video",
  "/api/studio/video",
  "/team",
  "/teams",
  "/join",
  "/api/teams",
  "/api/org",
  "/api/sso-config",
  "/api/auth/sso",
  "/settings/enterprise",
  "/api/slack",
  "/api/discord",
  "/api/ms-teams",
  "/api/github",
  "/api/telegram",
  "/api/whatsapp",
];

export function isHiddenPath(pathname: string): boolean {
  return HIDDEN_PATH_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}
