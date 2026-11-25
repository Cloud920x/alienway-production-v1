-- Sales can work prospects only. Existing clients remain Owner-only.
drop policy if exists staff_calls on public.call_leads;
drop policy if exists call_leads_select on public.call_leads;
drop policy if exists call_leads_insert on public.call_leads;
drop policy if exists call_leads_update on public.call_leads;

create policy call_leads_select on public.call_leads
for select to authenticated
using (
  ((select auth.jwt())->'app_metadata'->>'agency_role') = 'owner'
  or (((select auth.jwt())->'app_metadata'->>'agency_role') = 'sales' and is_client is false)
);

create policy call_leads_insert on public.call_leads
for insert to authenticated
with check (
  ((select auth.jwt())->'app_metadata'->>'agency_role') = 'owner'
  or (((select auth.jwt())->'app_metadata'->>'agency_role') = 'sales' and is_client is false)
);

create policy call_leads_update on public.call_leads
for update to authenticated
using (
  ((select auth.jwt())->'app_metadata'->>'agency_role') = 'owner'
  or (((select auth.jwt())->'app_metadata'->>'agency_role') = 'sales' and is_client is false)
)
with check (
  ((select auth.jwt())->'app_metadata'->>'agency_role') = 'owner'
  or (((select auth.jwt())->'app_metadata'->>'agency_role') = 'sales' and is_client is false)
);

-- These column grants let the Owner-only client RPC operate as SECURITY INVOKER under RLS.
-- Sales cannot set is_client=true because the policies above reject that row state.
grant insert(id, is_client, status) on public.call_leads to authenticated;
grant update(is_client) on public.call_leads to authenticated;

-- Sales may schedule and manage meetings for prospects, not existing clients.
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

-- Client creation can use caller permissions because Owner RLS and column grants are sufficient.
create or replace function public.save_agency_client(
  business_id uuid,
  business_name text default null,
  contact_phone text default null,
  contact_notes text default ''
)
returns uuid
language plpgsql
set search_path = ''
as $$
begin
  if coalesce(auth.jwt()->'app_metadata'->>'agency_role', '') <> 'owner' then
    raise insufficient_privilege;
  end if;

  if business_name is null then
    update public.call_leads
    set is_client = true
    where id = business_id;

    if not found then
      raise exception 'Business does not exist';
    end if;
  else
    insert into public.call_leads(id, business, phone, details, is_client, status)
    values(business_id, trim(business_name), contact_phone, contact_notes, true, 'approved')
    on conflict(id) do nothing;
  end if;

  return business_id;
end;
$$;
revoke all on function public.save_agency_client(uuid, text, text, text) from public, anon;
grant execute on function public.save_agency_client(uuid, text, text, text) to authenticated;

-- Intentionally SECURITY DEFINER: preserves compare-and-delete semantics and maps linked-history errors.
-- Owner is checked before the delete; search_path is pinned and all objects are schema-qualified.
create or replace function public.delete_business(business_id uuid, expected_updated_at timestamptz)
returns text
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(auth.jwt()->'app_metadata'->>'agency_role', '') <> 'owner' then
    raise insufficient_privilege;
  end if;

  delete from public.call_leads
  where id = business_id and updated_at = expected_updated_at;

  if not found then
    return 'changed_or_removed';
  end if;

  return 'deleted';
exception
  when foreign_key_violation then
    return 'linked_history';
end;
$$;
revoke all on function public.delete_business(uuid, timestamptz) from public, anon;
grant execute on function public.delete_business(uuid, timestamptz) to authenticated;

-- Client summaries use caller privileges and Owner-only table RLS.
create or replace function public.client_service_summaries()
returns table(client_id uuid, package_name text, inclusions text, addons text)
language sql
stable
set search_path = ''
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
