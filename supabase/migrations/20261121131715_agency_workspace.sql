create table public.agency_meetings (
 id uuid primary key default gen_random_uuid(),
 lead_id uuid not null references public.call_leads,
 starts_at timestamptz not null,
 notes text not null default '' check(length(notes)<=2000),
 completed boolean not null default false
);
create table public.agency_projects (
 id uuid primary key default gen_random_uuid(),
 lead_id uuid not null references public.call_leads,
 title text not null check(length(trim(title)) between 1 and 160),
 scope text not null check(length(trim(scope)) between 1 and 3000),
 build_fee numeric(12,2) not null check(build_fee>0),
 extras numeric(12,2) not null default 0 check(extras>=0),
 monthly numeric(12,2) not null default 0 check(monthly>=0),
 renewal date,
 stage text not null default 'Quoted' check(stage in ('Quoted','Accepted','In build','In review','Approved','Live')),
 created_at timestamptz not null default now()
);
create table public.agency_payments (
 id uuid primary key,
 project_id uuid not null references public.agency_projects,
 amount numeric(12,2) not null check(amount>0),
 reference text not null check(length(trim(reference)) between 1 and 160),
 received_at date not null default current_date
);
alter table public.agency_meetings enable row level security;
alter table public.agency_projects enable row level security;
alter table public.agency_payments enable row level security;
revoke all on public.agency_meetings, public.agency_projects, public.agency_payments from public, anon, authenticated;
grant select, insert(id,lead_id,starts_at,notes), update(completed) on public.agency_meetings to authenticated;
grant select, insert(id,lead_id,title,scope,build_fee,extras,monthly,renewal),update(stage,renewal) on public.agency_projects to authenticated;
grant select,insert(id,project_id,amount,reference,received_at) on public.agency_payments to authenticated;
create policy meetings_staff on public.agency_meetings to authenticated using ((select auth.jwt())->'app_metadata'->>'agency_role' in ('sales','owner')) with check ((select auth.jwt())->'app_metadata'->>'agency_role' in ('sales','owner'));
create policy projects_owner on public.agency_projects to authenticated using ((select auth.jwt())->'app_metadata'->>'agency_role'='owner') with check ((select auth.jwt())->'app_metadata'->>'agency_role'='owner');
create policy payments_owner on public.agency_payments to authenticated using ((select auth.jwt())->'app_metadata'->>'agency_role'='owner') with check ((select auth.jwt())->'app_metadata'->>'agency_role'='owner');
grant update(details) on public.call_leads to authenticated;
