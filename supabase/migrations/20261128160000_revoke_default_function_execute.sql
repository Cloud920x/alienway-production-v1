-- Application-created public RPCs must be explicitly granted to the roles that need them.
-- Existing function grants are unchanged; this only affects future functions created by postgres.

ALTER DEFAULT PRIVILEGES FOR ROLE postgres
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE EXECUTE ON FUNCTIONS FROM anon, authenticated;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM aclexplode(COALESCE(
      (
        SELECT defaclacl
        FROM pg_default_acl
        WHERE defaclrole = 'postgres'::regrole
          AND defaclnamespace = 0
          AND defaclobjtype = 'f'
      ),
      acldefault('f', 'postgres'::regrole)
    )) AS acl
    WHERE acl.grantee = 0
      AND acl.privilege_type = 'EXECUTE'
  ) THEN
    RAISE EXCEPTION 'PUBLIC still has default EXECUTE on functions created by postgres';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_default_acl AS d
    CROSS JOIN LATERAL aclexplode(d.defaclacl) AS acl
    WHERE d.defaclrole = 'postgres'::regrole
      AND d.defaclnamespace = 'public'::regnamespace
      AND d.defaclobjtype = 'f'
      AND acl.grantee IN ('anon'::regrole, 'authenticated'::regrole)
      AND acl.privilege_type = 'EXECUTE'
  ) THEN
    RAISE EXCEPTION 'anon or authenticated still has default EXECUTE on public functions created by postgres';
  END IF;
END;
$$;
