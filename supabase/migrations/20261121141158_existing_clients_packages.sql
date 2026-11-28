alter table public.call_leads add column is_client boolean not null default false;

create function public.save_agency_client(business_id uuid, business_name text default null, contact_phone text default null, contact_notes text default '') returns uuid
language plpgsql security definer set search_path = '' as $$
begin
  if coalesce(auth.jwt()->'app_metadata'->>'agency_role','') <> 'owner' then raise insufficient_privilege; end if;
  if business_name is null then
    update public.call_leads set is_client=true where id=business_id;
    if not found then raise exception 'Business does not exist'; end if;
  else
    insert into public.call_leads(id,business,phone,details,is_client,status)
    values(business_id,trim(business_name),contact_phone,contact_notes,true,'approved')
    on conflict(id) do nothing;
  end if;
  return business_id;
end;
$$;
revoke all on function public.save_agency_client(uuid,text,text,text) from public,anon;
grant execute on function public.save_agency_client(uuid,text,text,text) to authenticated;

create table public.agency_packages(
 id uuid primary key,
 name text not null check(length(trim(name)) between 1 and 100),
 inclusions text not null check(length(trim(inclusions)) between 1 and 2500),
 setup_fee numeric(12,2) not null check(setup_fee>=0),
 monthly_fee numeric(12,2) not null check(monthly_fee>=0)
);
create table public.client_packages(
 id uuid primary key,
 client_id uuid not null references public.call_leads,
 package_id uuid not null references public.agency_packages,
 starts_on date not null,
 addons text not null default '' check(length(addons)<=1500),
 extra_once numeric(12,2) not null default 0 check(extra_once>=0),
 extra_monthly numeric(12,2) not null default 0 check(extra_monthly>=0),
 created_at timestamptz not null default clock_timestamp(),
 unique(client_id,starts_on)
);
alter table public.agency_packages enable row level security;
alter table public.client_packages enable row level security;
revoke all on public.agency_packages,public.client_packages from public,anon,authenticated;
grant select,insert(id,name,inclusions,setup_fee,monthly_fee) on public.agency_packages to authenticated;
grant select,insert(id,client_id,package_id,starts_on,addons,extra_once,extra_monthly) on public.client_packages to authenticated;
create policy owner_catalogue on public.agency_packages to authenticated using ((select auth.jwt())->'app_metadata'->>'agency_role'='owner');
create policy owner_assignments on public.client_packages to authenticated using ((select auth.jwt())->'app_metadata'->>'agency_role'='owner')
with check ((select auth.jwt())->'app_metadata'->>'agency_role'='owner' and exists(select from public.call_leads l where l.id=client_id and l.is_client));
create function public.mark_project_client() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.stage <> 'Quoted' then update public.call_leads set is_client=true where id=new.lead_id and not is_client; end if;
 return new;
end;
$$;
revoke all on function public.mark_project_client() from public,anon,authenticated;
create trigger project_client after insert or update of stage on public.agency_projects for each row execute function public.mark_project_client();
update public.call_leads l set is_client=true where exists(select from public.agency_projects p where p.lead_id=l.id and p.stage<>'Quoted');
