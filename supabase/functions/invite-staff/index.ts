import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STAFF_REDIRECT = "https://alienway.co.za/staff/";
const ALLOWED_ORIGIN = "https://alienway.co.za";

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};

function reply(status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (origin && origin !== ALLOWED_ORIGIN) {
    return reply(403, { error: "This origin is not allowed." });
  }

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return reply(405, { error: "Method not allowed." });
  }

  const authorization = req.headers.get("Authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) {
    return reply(401, { error: "Sign in as the Alienway owner to invite staff." });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return reply(500, { error: "Staff invitations are not configured correctly." });
  }

  const caller = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userError } = await caller.auth.getUser();
  const owner = userData?.user;
  if (userError || !owner) {
    return reply(401, { error: "Your session has expired. Sign in again." });
  }
  if (owner.app_metadata?.agency_role !== "owner") {
    return reply(403, { error: "Only the Alienway owner can invite staff." });
  }

  let email = "";
  try {
    const body = await req.json();
    email = String(body?.email ?? "").trim().toLowerCase();
  } catch {
    return reply(400, { error: "Enter a valid staff email address." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return reply(400, { error: "Enter a valid staff email address." });
  }
  if (email === String(owner.email ?? "").toLowerCase()) {
    return reply(400, { error: "That email already belongs to the owner account." });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: inviteData, error: inviteError } =
    await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: STAFF_REDIRECT,
    });

  if (inviteError || !inviteData?.user) {
    return reply(400, {
      error: inviteError?.message ?? "The invitation could not be created. Check the email address and try again.",
    });
  }

  const invitedUser = inviteData.user;
  const { error: roleError } = await admin.auth.admin.updateUserById(invitedUser.id, {
    app_metadata: {
      ...(invitedUser.app_metadata ?? {}),
      agency_role: "sales",
    },
  });

  if (roleError) {
    await admin.auth.admin.deleteUser(invitedUser.id);
    return reply(500, {
      error: "The invitation was created but Sales access could not be assigned. Please try again.",
    });
  }

  return reply(200, {
    ok: true,
    message: "Invitation sent. Your staff member can open the email, verify their address and create their own password.",
  });
});
