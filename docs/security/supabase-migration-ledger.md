# Supabase migration ledger reconciliation

Audit date: 2026-11-28  
Target checked: Alienway Production Supabase project `deqokqorcukbubirosqg`

## Production result

The production `supabase_migrations.schema_migrations` table contains these 11 application migrations. Each repository SQL file was compared with the stored migration statement for its corresponding production version; all 11 SQL bodies matched exactly after newline normalization.

| Previous repository filename | Applied production version | Applied name |
|---|---:|---|
| `202611200001_call_list.sql` | `20261120140545` | `call_list` |
| `20261121150000_agency_workspace.sql` | `20261121131715` | `agency_workspace` |
| `20261121160000_call_queue_order.sql` | `20261121140427` | `call_queue_order` |
| `20261121170000_existing_clients_packages.sql` | `20261121141158` | `existing_clients_packages` |
| `20261121170100_client_service_summaries.sql` | `20261121141313` | `client_service_summaries` |
| `202611220001_published_demo_packages.sql` | `20261122113429` | `published_demo_packages` |
| `202611220002_delete_business.sql` | `20261122193838` | `delete_unused_business` |
| `202611260001_revoke_public_touch_call_lead.sql` | `20261126155330` | `revoke_public_touch_call_lead` |
| `20261127142618_project_enquiries.sql` | `20261127143057` | `project_enquiries` |
| `20261128000100_future_table_permissions.sql` | `20261128114129` | `future_table_permissions` |
| `20261128150000_enquiry_follow_up.sql` | `20261128125559` | `enquiry_follow_up` |

The corrected repository filenames in this PR now use the applied production versions and names. The migration SQL is unchanged; no existing migration is being replayed or repaired in the production database.

## Safe rollout procedure

1. Merge the reviewed filename reconciliation only after the PR checks pass.
2. Link the Supabase CLI to the intended project and run `supabase migration list --linked`.
3. Confirm the 11 existing versions show as applied locally and remotely. The new hardening migration `20261128160000_revoke_default_function_execute` should be the only pending application migration.
4. Review that new migration before applying it. It is additive and only changes default privileges for future functions created by `postgres`; it does not change existing function grants.
5. Apply the pending migration through the reviewed deployment process, then query the default ACLs and confirm that PUBLIC has no default function EXECUTE grant and anon/authenticated have no schema-level default EXECUTE grant in `public`.
6. Re-run the existing RPC authorization checks and Supabase security advisor.

## If a migration command fails

- Stop. Do not repeatedly run `supabase db push`, edit the migration ledger manually, or replay an old SQL file.
- Inspect `supabase_migrations.schema_migrations` and compare it with the local migration filenames.
- Inspect the effective default privileges for role `postgres` and confirm whether the new hardening statements took effect.
- The two `ALTER DEFAULT PRIVILEGES ... REVOKE` statements are idempotent. The migration's assertions intentionally fail if unsafe defaults remain; if the migration failed transactionally, check the ledger before retrying.
- If a different environment has different version identifiers, reconcile that environment separately by comparing its recorded SQL statements and actual schema. Do not assume its ledger matches production.

## Important distinction

Migration version identifiers are part of Supabase's migration history. Identical SQL content does not make two different version identifiers interchangeable. This reconciliation is safe for the production ledger shown above because the exact recorded versions and SQL statements were checked. It is not a blanket instruction to repair other databases.
