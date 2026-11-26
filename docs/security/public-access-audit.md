# Alienway public-access security audit

Audit date: 2026-11-26
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
- This branch adds Cloudflare Pages headers for the staff path: deny framing, disable camera/microphone/geolocation, suppress referrers, prevent caching, and reinforce no-index. These are browser-hardening measures, not a substitute for Supabase Auth/RLS.
- The dashboard content is hidden until sign-in. The client verifies the returned user's `app_metadata.agency_role` before opening the workspace.
- The database currently contains two staff accounts: one Owner and one Sales account; no unassigned or unknown-role account was found.
- No MFA factors are currently enrolled.
- Leaked-password protection is disabled on the current Supabase plan.

### Edge Function: `invite-staff`
- The deployed function currently has `verify_jwt=false`, but its handler independently requires a Bearer token, validates it with `auth.getUser()`, and checks the trusted Owner role before using the server-side service-role key.
- This branch adds `supabase/config.toml` with `verify_jwt=true`, so the Supabase gateway will also reject missing or invalid JWTs before the handler runs.
- The service-role key is read from `Deno.env`; no service-role key literal was found in the repository search.
- This branch pins the Edge Function's Supabase JS SDK import to the exact release `2.119.2` instead of floating on the major-version tag.
- The deployed function was found with wildcard CORS and an outdated GitHub Pages redirect. The source in this branch changes the allowed browser origin to `https://alienway.co.za` and the invitation redirect to `https://alienway.co.za/staff/`.
- Before deployment, confirm `https://alienway.co.za/staff/` is in Supabase Auth's allowed redirect URL list. The Edge Function source/config changes are not live until reviewed and deployed.

### Public function permissions
- No anonymous execute grant was found for the client, project, or payment RPC functions.
- One trigger-only helper, `public.touch_call_lead()`, currently inherits EXECUTE from PUBLIC. It returns `trigger` and only updates `NEW.updated_at`; it is not a normal data-returning RPC. Revoke the default execute grant as a small privilege-hygiene task in the next tracked database migration.

## Repository and deployment notes
- The GitHub repository is public, so source code and the public publishable Supabase key are visible. A publishable key is intended for browser use; it is not a service-role secret.
- No `.env` file or hard-coded service-role secret was found in the repository tree/search.
- Cloudflare Pages successfully deployed the security preview branch. This does not change the production domain.

## Remaining verification before production rollout

1. Review the CORS, redirect, gateway JWT-verification, and pinned SDK update with CodeRabbit.
2. Confirm the canonical staff redirect is allowlisted in Supabase Auth URL Configuration.
3. Verify the Cloudflare preview serves the new security headers on `/staff/` and `/staff/calls.js`.
4. Deploy the reviewed `invite-staff` function source with `verify_jwt=true` and verify the deployed function reports the canonical Alienway origin and redirect.
5. Test the invite endpoint with no token, an invalid token, a valid Sales token, and a valid Owner token. Expected outcomes: 401, 401, 403, and 200 (the final test should use a controlled test email and must not be run without the Owner's approval).
6. Run an anonymous Data API smoke test against each business table and RPC; expect no data access.
7. Revoke PUBLIC/anon EXECUTE on the trigger-only `touch_call_lead()` function through a tracked migration and confirm the trigger still updates timestamps.
8. Enrol MFA on the Owner account and the trusted staff account, then test a fresh login and recovery path.
9. Establish a free off-site database export routine and perform a restore drill.

## Cost constraint

No paid Supabase branch, plan upgrade, paid security tool, or other new subscription is required for the work in this report. Do not create a Supabase development branch unless the Owner explicitly approves the quoted cost.
