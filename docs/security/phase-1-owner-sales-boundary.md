# Security remediation phase 1: Owner/Sales data boundary

## Decision
The Sales workspace is for prospect calling and follow-up. Existing client records, client contact details, service agreements, and package summaries remain Owner-only.

## Database enforcement
Migration `202611250001_restrict_sales_to_prospects.sql`:
- Splits `call_leads` policies by operation: Sales can read and manage prospects only; deletion is Owner-only.
- Preserves Owner access to all leads and clients.
- Restricts Sales meetings to non-client prospects.
- Keeps the client-summary RPC as SECURITY INVOKER so table RLS remains in force.
- Makes the client-creation and delete RPCs SECURITY INVOKER too; direct DELETE remains Owner-only through its own RLS policy.
- Converts `save_agency_client()`, `delete_business()`, and `client_service_summaries()` to SECURITY INVOKER. Owner-only RPC checks remain, while RLS and column grants enforce the actual database permissions.

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
6. Owner can still manage clients, agreements, packages, projects, payments, and meetings.
7. Confirm Clients is visible to Owner and hidden from Sales.

Do not merge or apply the migration until the PR is reviewed and both test accounts are ready. No production database changes are included in this branch.
