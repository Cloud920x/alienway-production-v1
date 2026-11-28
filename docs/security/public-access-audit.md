# Alienway public-access security audit

Audit date: 2026-11-28
Scope: public/unauthenticated access to the Alienway Production staff workspace and its Supabase-backed business data.

## Executive result

The current production database does not grant anonymous visitors access to the six Alienway business tables. The staff page itself is publicly reachable as a static HTML page, but its workspace is hidden until a user signs in. Data access is enforced at the Supabase database layer, not by hiding the page.

This audit does not claim that the whole site is private: the public marketing website, public demo websites, and the public GitHub repository are intentionally public. The objective here is to protect the management workspace and its underlying business records.

## Verified production controls

### Supabase Data API
- All six application tables in the public schema have Row Level Security enabled: `call_leads`, `agency_meetings`, `agency_projects`, `agency_payments`, `agency_packages`, and `client_packages`.
- No table-level or column-level privileges on these application tables were found for the `anon` role.
- No RLS policies for `anon` or `PUBLIC` were found on the application tables.
- The policies target authenticated sessions and check the trusted `app_metadata.agency_role` claim.
- No public-schema views were found.
- No Storage buckets exist, so there are currently no public file buckets.

### Authentication and staff access
- The staff page has a `noindex` directive, but this is only an indexing hint and is not treated as an access-control mechanism.
- The live `/staff*` response headers deny framing, disable camera/microphone/geolocation, suppress referrers, prevent caching, and reinforce no-index. PR #88 proposes a stricter Content Security Policy scoped to the staff route. These are browser-hardening measures, not a substitute for Supabase Auth/RLS.
- The dashboard content is hidden until sign-in. The client verifies the returned user's `app_metadata.agency_role` before opening the workspace.
- The database currently contains three active staff accounts: one Owner and two Sales accounts; no unassigned or unknown-role account was found. There are zero pending staff invitations, so the invitation redirect change does not strand an outstanding invite.
- The Owner account has one verified TOTP factor. Neither Sales account currently has a verified TOTP factor.
- MFA is currently enforced for staff invitations and password recovery. PR #89 adds a database-level AAL2 requirement for Owner-only packages, projects, payments, client-package assignments, and the Owner-only delete/save RPCs. Until that migration is applied, those Owner-only records still rely on the Owner role check without an AAL2 requirement.
- Sales accounts remain password-only for shared call, meeting and enquiry workflows. The separate `client_service_summaries()` SECURITY DEFINER RPC also returns a limited projection (`client_id`, package name, inclusions and add-ons) to authenticated Owner/Sales roles without AAL2; it does not grant direct access to the Owner-only package or assignment tables. Decide separately whether Sales workflows and this summary should also require MFA.
- Leaked-password protection is disabled on the current Supabase plan.

### Edge Function: `invite-staff`
- The deployed function currently has `verify_jwt=false`, but its handler independently requires a Bearer token, validates it with `auth.getUser()`, and checks the trusted Owner role before using the server-side service-role key.
- This branch adds `supabase/config.toml` with `verify_jwt=true` as a gateway-level defence in depth. Do not treat this setting as proof that a real user is signed in: the project publishable API key identifies the project, not the user, and gateway/API-key handling can differ by key format. The handler must still require an `Authorization: Bearer <user access token>` header and validate that exact token with `auth.getUser(accessToken)`; it does so before checking the Owner role and AAL2 claim.
- The service-role key is read from `Deno.env`; no service-role key literal was found in the repository search.
- The handler validates the exact Bearer token with `auth.getUser(accessToken)`, checks the trusted Owner `app_metadata` role, and then requires the signed JWT `aal` claim to equal `aal2` before constructing the service-role client.
- The staff workspace now includes an Owner authenticator setup and challenge flow using TOTP. The invitation UI checks the current assurance level and prompts for setup or a fresh code before sending.
- This branch pins the Edge Function's Supabase JS SDK import to the exact release `2.119.2` instead of floating on the major-version tag.
- The deployed function was found with wildcard CORS and an outdated GitHub Pages redirect. The source in this branch changes the allowed browser origin to `https://alienway.co.za` and the invitation redirect to `https://alienway.co.za/staff/`.
- Before deployment, confirm `https://alienway.co.za/staff/` is in Supabase Auth's allowed redirect URL list. The Edge Function source/config changes are not live until reviewed and deployed.

### Public function permissions
- No anonymous execute grant was found for the client, project, or payment RPC functions.
- The Supabase advisor reports three SECURITY DEFINER functions callable by authenticated users. Their live definitions were inspected: `client_service_summaries()` allows only the trusted Owner/Sales app roles; `delete_business()` and `save_agency_client()` enforce the trusted Owner app role. All three pin `search_path` to an empty value and schema-qualify their table references. PR #89 adds an AAL2 requirement to the two Owner-only RPCs; until that migration is applied, their live production versions still rely on the Owner role check alone.
- The trigger-only helper `public.touch_call_lead()` previously inherited EXECUTE from PUBLIC. Its production migration is recorded as applied; live privilege checks confirm anon and authenticated cannot execute it. A rolled-back transaction test confirmed the trigger still updates timestamps after the privilege is revoked.
- PR #87 adds a separate default-privilege migration so future functions created by `postgres` do not automatically inherit EXECUTE for PUBLIC, anon or authenticated in the public schema. It has been tested in a rolled-back transaction but is not yet applied to production.

## Repository and deployment notes
- The GitHub repository is public, so source code and the public publishable Supabase key are visible. A publishable key is intended for browser use; it is not a service-role secret.
- No `.env` file or hard-coded service-role secret was found in the repository tree/search.
- Cloudflare Pages successfully deployed the security preview branch. This does not change the production domain.

## Public enquiry endpoint notes

- The public enquiry endpoint is an intentionally exposed submission API. It validates contact name, email, brief length and phone format through database constraints, serializes requests per email with an advisory lock, deduplicates repeated request IDs, and limits each email to five submissions per hour.
- This PR keeps the public `submit_project_enquiry` wrappers executable by anon/authenticated but makes them SECURITY DEFINER with an empty search path, then revokes API-role schema usage and function execution from the internal `enquiry_intake` schema. A rollback-only test confirmed the public wrapper still inserts while a direct anonymous call to the internal function is denied.
- The enquiry endpoint's rate limit is per email, not per IP, and there is no CAPTCHA/Turnstile check yet. Consider adding Cloudflare Turnstile or edge-level abuse controls if spam becomes a problem.

## Remaining verification before production rollout

1. Complete CodeRabbit reviews and keep the required GitHub security checks green for PRs #87, #88 and #89.
2. After PR #87 merges, run `supabase migration list --linked` against the intended project. Confirm the 11 existing versions align and that only the new default-function-privilege migration is pending before applying it.
3. After PR #89 merges, apply its AAL2 migration through the reviewed deployment process. Verify Owner AAL1 cannot read or write Owner-only records, Owner AAL2 can, and Sales remains blocked from Owner-only records.
4. After PR #88 merges, verify the effective CSP on `/staff/` and `/staff/calls.js`. Preview hosts intentionally block staff sign-in, so validate the authenticated flow on the official domain or a separately authorised staging environment.
5. Confirm `https://alienway.co.za/staff/` remains allowlisted in Supabase Auth URL Configuration and that the deployed `invite-staff` function retains canonical-origin CORS, canonical redirect and `verify_jwt=true`.
6. Test the invite endpoint with no token, an invalid token, a valid AAL1 Owner token, a valid AAL1 Sales token, and a valid AAL2 Owner token. Expected outcomes: 401, 401, 403, 403, and 200. Use a controlled test email only with the Owner's approval.
7. Re-run anonymous Data API tests and Supabase security advisors after the migrations. Confirm no anonymous access to business tables or RPCs and confirm the trigger-only helper still works through its trigger.
8. Confirm the backup repository's access list is restricted to trusted writers, merge PR #1 after review, and verify the next scheduled encrypted backup plus a separate restore drill.
9. Establish an independent encrypted off-site backup copy and document staff-account/MFA re-enrolment after disaster recovery.
## Cost constraint

No paid Supabase branch, plan upgrade, paid security tool, or other new subscription is required for the work in this report. Do not create a Supabase development branch unless the Owner explicitly approves the quoted cost.
