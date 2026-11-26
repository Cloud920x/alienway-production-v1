# Security remediation phase 1: Owner/Sales data boundary

## Decision
The Sales workspace is for prospect calling and follow-up. Existing client records, client contact details, service agreements, and package summaries remain Owner-only.

## Database enforcement
Migration `202611250001_restrict_sales_to_prospects.sql`:
- Splits `call_leads` policies by operation: Sales can read and manage prospects only; deletion is Owner-only.
- Adds a database trigger that permits prospect-to-client promotion but rejects client-to-prospect demotion, including attempts to set the flag to `NULL`.
- Preserves Owner access to all leads and clients.
- Restricts Sales meetings to non-client prospects.
- Converts `save_agency_client()` and `client_service_summaries()` to SECURITY INVOKER so caller permissions and RLS remain in force.
- Keeps `delete_business()` as an intentionally guarded SECURITY DEFINER RPC because it preserves compare-and-delete behavior and handles linked-history errors; it checks the Owner claim and pins its search path.

Database policies are the security boundary; hiding a browser tab is only a usability measure.

## Workspace changes
- Hides the Existing Clients tab from Sales and blocks direct navigation.
- Removes the Sales-only service-summary fetch and rendering path.
- Clarifies the permissions in the staff workspace.

## Validation after rollout
Use separate Owner and Sales accounts:
1. Sales can list, add, update, and follow up prospects.
2. Sales cannot read rows where `is_client = true`.
3. Sales cannot read or create meetings linked to existing clients.
4. Sales receives no rows from `client_service_summaries()`.
5. Sales cannot read packages, projects, or payments, and cannot delete prospect or client records.
6. Owner can promote a prospect to a client.
7. Owner cannot demote an existing client back to a prospect, including by setting `is_client` to `NULL`.
8. Owner can still manage clients, agreements, packages, projects, payments, and meetings.
9. Confirm Clients is visible to Owner and hidden from Sales.

Do not merge or apply the migration until the PR is reviewed and both test accounts are ready. No production database changes are included in this branch.
