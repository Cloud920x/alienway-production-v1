create table public.call_leads (
  id uuid primary key default gen_random_uuid(),
  business text not null check (length(trim(business)) between 1 and 160),
  phone text not null check (phone ~ '^[+]?[0-9]{7,15}$'),
  details text not null default '' check (length(details) <= 2000),
  status text not null default 'new' check (status in ('new','callback','approved','declined')),
  callback_at timestamptz,
  updated_at timestamptz not null default clock_timestamp(),
  check ((status = 'callback') = (callback_at is not null))
);
alter table public.call_leads enable row level security;
revoke all on public.call_leads from public, anon, authenticated;
grant select, insert (business,phone,details), update (status,callback_at)
on public.call_leads to authenticated;
create policy staff_calls on public.call_leads to authenticated
using ((select auth.jwt())->'app_metadata'->>'agency_role' in ('owner','sales'))
with check ((select auth.jwt())->'app_metadata'->>'agency_role' in ('owner','sales'));
create function public.touch_call_lead() returns trigger language plpgsql
set search_path = '' as $$
begin
  new.updated_at := clock_timestamp();
  return new;
end;
$$;
create trigger touch_call_lead before update on public.call_leads
for each row execute function public.touch_call_lead();
