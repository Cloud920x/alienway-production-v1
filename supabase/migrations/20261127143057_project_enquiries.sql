create table public.project_enquiries (
  id uuid primary key,
  created_at timestamptz not null default now(),
  contact_name text not null check (length(trim(contact_name)) between 1 and 100),
  email text not null check (length(email) <= 160 and email ~ '^[^[:space:]@]+@[^[:space:]@]+$'),
  brief text not null check (length(trim(brief)) between 12 and 8000)
);
create index project_enquiries_created on public.project_enquiries(created_at desc, id desc);
create index project_enquiries_sender on public.project_enquiries(lower(email), created_at desc);
alter table public.project_enquiries enable row level security;
revoke all on public.project_enquiries from public, anon, authenticated;
grant select on public.project_enquiries to authenticated;
create policy staff_read_project_enquiries on public.project_enquiries for select to authenticated
using ((select auth.jwt())->'app_metadata'->>'agency_role' in ('owner','sales'));

-- A write-only intake operation. Visitors cannot list leads or choose staff-only data.
create schema if not exists enquiry_intake;
revoke all on schema enquiry_intake from public;
grant usage on schema enquiry_intake to anon, authenticated;
create function enquiry_intake.submit(request_id uuid, contact_name text, email text, brief text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(lower(trim(email)), 0));
  if exists (select 1 from public.project_enquiries e where e.id = request_id
    and e.email = trim(submit.email) and e.contact_name = trim(submit.contact_name)
    and e.brief = trim(submit.brief)) then
    return;
  end if;
  if (select count(*) from public.project_enquiries e where lower(e.email) = lower(trim(submit.email))
      and e.created_at > now() - interval '1 hour') >= 5 then
    raise exception 'Please try again later.';
  end if;
  insert into public.project_enquiries (id, contact_name, email, brief)
  values (request_id, trim(contact_name), trim(email), trim(brief));
end;
$$;
create function public.submit_project_enquiry(request_id uuid, contact_name text, email text, brief text)
returns void language sql security invoker set search_path = ''
as $$ select enquiry_intake.submit(request_id, contact_name, email, brief) $$;
revoke all on function enquiry_intake.submit(uuid,text,text,text), public.submit_project_enquiry(uuid,text,text,text) from public;
grant execute on function enquiry_intake.submit(uuid,text,text,text), public.submit_project_enquiry(uuid,text,text,text) to anon, authenticated;
