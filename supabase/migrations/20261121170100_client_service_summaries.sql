create function public.client_service_summaries() returns table(client_id uuid,package_name text,inclusions text,addons text)
language sql stable security definer set search_path='' as $$
 select distinct on (a.client_id) a.client_id,p.name,p.inclusions,a.addons
 from public.client_packages a join public.agency_packages p on p.id=a.package_id
 where a.starts_on <= (now() at time zone 'Africa/Johannesburg')::date
 and auth.jwt()->'app_metadata'->>'agency_role' in ('owner','sales')
 order by a.client_id,a.starts_on desc
$$;
revoke all on function public.client_service_summaries() from public,anon;
grant execute on function public.client_service_summaries() to authenticated;