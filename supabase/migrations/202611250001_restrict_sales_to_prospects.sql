-- Sales can work prospects only. Existing clients remain Owner-only.
drop policy if exists staff_calls on public.call_leads;
create policy staff_calls on public.call_leads
for all to authenticated
using (
  ((select auth.jwt())->'app_metadata'->>'agency_role') = 'owner'
  or (((select auth.jwt())->'app_metadata'->>'agency_role') = 'sales' and is_client is false)
)
with check (
  ((select auth.jwt())->'app_metadata'->>'agency_role') = 'owner'
  or (((select auth.jwt())->'app_metadata'->>'agency_role') = 'sales' and is_client is false)
);

drop policy if exists meetings_staff on public.agency_meetings;
create policy meetings_staff on public.agency_meetings
for all to authenticated
using (
  ((select auth.jwt())->'app_metadata'->>'agency_role') = 'owner'
  or (
    ((select auth.jwt())->'app_metadata'->>'agency_role') = 'sales'
    and exists (
      select 1 from public.call_leads lead
      where lead.id = agency_meetings.lead_id and lead.is_client is false
    )
  )
)
with check (
  ((select auth.jwt())->'app_metadata'->>'agency_role') = 'owner'
  or (
    ((select auth.jwt())->'app_metadata'->>'agency_role') = 'sales'
    and exists (
      select 1 from public.call_leads lead
      where lead.id = agency_meetings.lead_id and lead.is_client is false
    )
  )
);

-- SECURITY DEFINER bypasses table RLS, so the function enforces Owner access itself.
create or replace function public.client_service_summaries()
returns table(client_id uuid, package_name text, inclusions text, addons text)
language sql stable security definer set search_path = ''
as $$
  select distinct on (a.client_id) a.client_id, p.name, p.inclusions, a.addons
  from public.client_packages a
  join public.agency_packages p on p.id = a.package_id
  where a.starts_on <= (now() at time zone 'Africa/Johannesburg')::date
    and auth.jwt()->'app_metadata'->>'agency_role' = 'owner'
  order by a.client_id, a.starts_on desc;
$$;
revoke all on function public.client_service_summaries() from public, anon;
grant execute on function public.client_service_summaries() to authenticated;
