alter table public.project_enquiries
  add column phone text check (phone ~ '^[+]?[0-9]{7,15}$'),
  add column contacted boolean not null default false;

grant update (contacted) on public.project_enquiries to authenticated;
create policy staff_mark_enquiry_contacted on public.project_enquiries
  for update to authenticated
  using ((select auth.jwt())->'app_metadata'->>'agency_role' in ('owner','sales'))
  with check (contacted and (select auth.jwt())->'app_metadata'->>'agency_role' in ('owner','sales'));

-- Keep the four-argument intake for visitors with an already-open form.
create function enquiry_intake.submit(request_id uuid, contact_name text, email text, brief text, phone text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if phone is null or phone !~ '^[+]?[0-9]{7,15}$' then
    raise exception 'A valid cell phone number is required.';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(lower(trim(email)), 0));
  if exists (select 1 from public.project_enquiries e where e.id = request_id
    and e.email = trim(submit.email) and e.contact_name = trim(submit.contact_name)
    and e.phone = submit.phone and e.brief = trim(submit.brief)) then
    return;
  end if;
  if (select count(*) from public.project_enquiries e where lower(e.email) = lower(trim(submit.email))
      and e.created_at > now() - interval '1 hour') >= 5 then
    raise exception 'Please try again later.';
  end if;
  insert into public.project_enquiries (id, contact_name, email, brief, phone)
  values (request_id, trim(contact_name), trim(email), trim(brief), phone);
end;
$$;
create function public.submit_project_enquiry(request_id uuid, contact_name text, email text, brief text, phone text)
returns void language sql security invoker set search_path = ''
as $$ select enquiry_intake.submit(request_id, contact_name, email, brief, phone) $$;
revoke all on function enquiry_intake.submit(uuid,text,text,text,text), public.submit_project_enquiry(uuid,text,text,text,text) from public;
grant execute on function enquiry_intake.submit(uuid,text,text,text,text), public.submit_project_enquiry(uuid,text,text,text,text) to anon, authenticated;

create extension if not exists pg_cron;
select cron.schedule('expire-project-enquiries', '*/15 * * * *',
  $$delete from public.project_enquiries where created_at + interval '1 month' <= now()$$);
