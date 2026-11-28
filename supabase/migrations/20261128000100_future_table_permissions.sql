-- Application migrations create objects as postgres in the public schema.
-- Grant access to each new object explicitly when its access policy is ready.
alter default privileges for role postgres in schema public
  revoke all privileges on tables from anon, authenticated;

alter default privileges for role postgres in schema public
  revoke all privileges on sequences from anon, authenticated;
