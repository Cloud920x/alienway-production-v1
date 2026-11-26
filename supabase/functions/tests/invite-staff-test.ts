import { canInviteStaff } from "../invite-staff/auth.ts";

function base64UrlEncode(value: unknown): string {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function tokenWithAal(aal?: string): string {
  const header = base64UrlEncode({ alg: "HS256", typ: "JWT" });
  const payload = base64UrlEncode(aal ? { sub: "owner-test", aal } : { sub: "owner-test" });
  return header + "." + payload + ".test-signature";
}

Deno.test("password-only Owner session (aal1) cannot invite staff", () => {
  if (canInviteStaff("owner", tokenWithAal("aal1"))) {
    throw new Error("An aal1 Owner session must not be allowed to invite staff.");
  }
});

Deno.test("Owner session with aal2 can pass the invitation gate", () => {
  if (!canInviteStaff("owner", tokenWithAal("aal2"))) {
    throw new Error("An aal2 Owner session should pass the invitation gate.");
  }
});

Deno.test("Sales session cannot invite staff even with aal2", () => {
  if (canInviteStaff("sales", tokenWithAal("aal2"))) {
    throw new Error("A Sales session must not be allowed to invite staff.");
  }
});

Deno.test("missing, malformed, or unknown AAL claims fail closed", () => {
  if (canInviteStaff("owner", "not-a-jwt")) {
    throw new Error("A malformed token must be rejected.");
  }
  if (canInviteStaff("owner", tokenWithAal())) {
    throw new Error("A token without an AAL claim must be rejected.");
  }
  if (canInviteStaff("owner", tokenWithAal("aal3"))) {
    throw new Error("An unknown AAL claim must be rejected.");
  }
});
