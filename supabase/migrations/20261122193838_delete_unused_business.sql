create function public.delete_business(business_id uuid, expected_updated_at timestamptz)
returns text language plpgsql security definer set search_path = '' as $$
begin
  if coalesce(auth.jwt()->'app_metadata'->>'agency_role','') <> 'owner' then
    raise insufficient_privilege;
  end if;
  delete from public.call_leads where id = business_id and updated_at = expected_updated_at;
  if not found then return 'changed_or_removed'; end if;
  return 'deleted';
exception when foreign_key_violation then
  return 'linked_history';
end;
$$;
revoke all on function public.delete_business(uuid,timestamptz) from public, anon;
grant execute on function public.delete_business(uuid,timestamptz) to authenticated;
