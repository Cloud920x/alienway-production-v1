-- Owner-only financial and administrative data requires a fresh AAL2 session.
-- Sales access to shared call, meeting and enquiry workflows is unchanged.

DROP POLICY IF EXISTS owner_catalogue ON public.agency_packages;
CREATE POLICY owner_catalogue
ON public.agency_packages
FOR ALL TO authenticated
USING (
  ((SELECT auth.jwt())->'app_metadata'->>'agency_role') = 'owner'
  AND ((SELECT auth.jwt())->>'aal') = 'aal2'
)
WITH CHECK (
  ((SELECT auth.jwt())->'app_metadata'->>'agency_role') = 'owner'
  AND ((SELECT auth.jwt())->>'aal') = 'aal2'
);

DROP POLICY IF EXISTS payments_owner ON public.agency_payments;
CREATE POLICY payments_owner
ON public.agency_payments
FOR ALL TO authenticated
USING (
  ((SELECT auth.jwt())->'app_metadata'->>'agency_role') = 'owner'
  AND ((SELECT auth.jwt())->>'aal') = 'aal2'
)
WITH CHECK (
  ((SELECT auth.jwt())->'app_metadata'->>'agency_role') = 'owner'
  AND ((SELECT auth.jwt())->>'aal') = 'aal2'
);

DROP POLICY IF EXISTS projects_owner ON public.agency_projects;
CREATE POLICY projects_owner
ON public.agency_projects
FOR ALL TO authenticated
USING (
  ((SELECT auth.jwt())->'app_metadata'->>'agency_role') = 'owner'
  AND ((SELECT auth.jwt())->>'aal') = 'aal2'
)
WITH CHECK (
  ((SELECT auth.jwt())->'app_metadata'->>'agency_role') = 'owner'
  AND ((SELECT auth.jwt())->>'aal') = 'aal2'
);

DROP POLICY IF EXISTS owner_assignments ON public.client_packages;
CREATE POLICY owner_assignments
ON public.client_packages
FOR ALL TO authenticated
USING (
  ((SELECT auth.jwt())->'app_metadata'->>'agency_role') = 'owner'
  AND ((SELECT auth.jwt())->>'aal') = 'aal2'
)
WITH CHECK (
  ((SELECT auth.jwt())->'app_metadata'->>'agency_role') = 'owner'
  AND ((SELECT auth.jwt())->>'aal') = 'aal2'
  AND EXISTS (
    SELECT 1
    FROM public.call_leads AS l
    WHERE l.id = client_packages.client_id
      AND l.is_client
  )
);

CREATE OR REPLACE FUNCTION public.delete_business(
  business_id uuid,
  expected_updated_at timestamp with time zone
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  IF coalesce(auth.jwt()->'app_metadata'->>'agency_role','') <> 'owner'
     OR coalesce(auth.jwt()->>'aal','') <> 'aal2' THEN
    RAISE insufficient_privilege;
  END IF;

  DELETE FROM public.call_leads
  WHERE id = business_id
    AND updated_at = expected_updated_at;

  IF NOT FOUND THEN
    RETURN 'changed_or_removed';
  END IF;

  RETURN 'deleted';
EXCEPTION
  WHEN foreign_key_violation THEN
    RETURN 'linked_history';
END;
$function$;

REVOKE ALL ON FUNCTION public.delete_business(uuid, timestamp with time zone) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_business(uuid, timestamp with time zone) TO authenticated;

CREATE OR REPLACE FUNCTION public.save_agency_client(
  business_id uuid,
  business_name text DEFAULT NULL::text,
  contact_phone text DEFAULT NULL::text,
  contact_notes text DEFAULT ''::text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  IF coalesce(auth.jwt()->'app_metadata'->>'agency_role','') <> 'owner'
     OR coalesce(auth.jwt()->>'aal','') <> 'aal2' THEN
    RAISE insufficient_privilege;
  END IF;

  IF business_name IS NULL THEN
    UPDATE public.call_leads
    SET is_client = true
    WHERE id = business_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Business does not exist';
    END IF;
  ELSE
    INSERT INTO public.call_leads(id,business,phone,details,is_client,status)
    VALUES(business_id,trim(business_name),contact_phone,contact_notes,true,'approved')
    ON CONFLICT(id) DO NOTHING;
  END IF;

  RETURN business_id;
END;
$function$;

REVOKE ALL ON FUNCTION public.save_agency_client(uuid, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_agency_client(uuid, text, text, text) TO authenticated;
