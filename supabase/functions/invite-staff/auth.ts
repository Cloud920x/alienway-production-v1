/**
 * Reads the AAL claim from a JWT. Call this only after Supabase Auth has
 * validated the exact token with auth.getUser(token); this helper does not
 * verify JWT signatures itself.
 */
function readJwtClaims(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length !== 3 || !parts[1]) return null;

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const claims: unknown = JSON.parse(new TextDecoder().decode(bytes));

    if (!claims || typeof claims !== "object" || Array.isArray(claims)) return null;
    return claims as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Staff invitations require both the trusted Owner app_metadata role and
 * an AAL2 session. Call only after the token has passed Supabase Auth's
 * server-side getUser(token) validation.
 */
export function canInviteStaff(agencyRole: unknown, token: string): boolean {
  return agencyRole === "owner" && readJwtClaims(token)?.aal === "aal2";
}
