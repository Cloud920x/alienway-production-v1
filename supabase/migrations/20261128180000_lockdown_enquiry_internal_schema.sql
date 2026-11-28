-- Keep the public enquiry RPCs callable, but hide their internal implementation schema.
-- The public wrappers execute as their owner with an empty search_path and fully qualified calls.

CREATE OR REPLACE FUNCTION public.submit_project_enquiry(
  request_id uuid,
  contact_name text,
  email text,
  brief text
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT enquiry_intake.submit(request_id, contact_name, email, brief)
$function$;

CREATE OR REPLACE FUNCTION public.submit_project_enquiry(
  request_id uuid,
  contact_name text,
  email text,
  brief text,
  phone text
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT enquiry_intake.submit(request_id, contact_name, email, brief, phone)
$function$;

REVOKE ALL ON FUNCTION public.submit_project_enquiry(uuid, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.submit_project_enquiry(uuid, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_project_enquiry(uuid, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_project_enquiry(uuid, text, text, text, text) TO anon, authenticated;

REVOKE ALL ON FUNCTION enquiry_intake.submit(uuid, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION enquiry_intake.submit(uuid, text, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE USAGE ON SCHEMA enquiry_intake FROM PUBLIC, anon, authenticated;

DO $$
BEGIN
  IF has_schema_privilege('anon', 'enquiry_intake', 'USAGE')
     OR has_schema_privilege('authenticated', 'enquiry_intake', 'USAGE') THEN
    RAISE EXCEPTION 'API roles still have USAGE on the internal enquiry schema';
  END IF;

  IF has_function_privilege('anon', 'enquiry_intake.submit(uuid,text,text,text)', 'EXECUTE')
     OR has_function_privilege('authenticated', 'enquiry_intake.submit(uuid,text,text,text)', 'EXECUTE')
     OR has_function_privilege('anon', 'enquiry_intake.submit(uuid,text,text,text,text)', 'EXECUTE')
     OR has_function_privilege('authenticated', 'enquiry_intake.submit(uuid,text,text,text,text)', 'EXECUTE') THEN
    RAISE EXCEPTION 'API roles still have EXECUTE on internal enquiry functions';
  END IF;

  IF NOT has_function_privilege('anon', 'public.submit_project_enquiry(uuid,text,text,text)', 'EXECUTE')
     OR NOT has_function_privilege('authenticated', 'public.submit_project_enquiry(uuid,text,text,text)', 'EXECUTE')
     OR NOT has_function_privilege('anon', 'public.submit_project_enquiry(uuid,text,text,text,text)', 'EXECUTE')
     OR NOT has_function_privilege('authenticated', 'public.submit_project_enquiry(uuid,text,text,text,text)', 'EXECUTE') THEN
    RAISE EXCEPTION 'Public enquiry wrappers lost their intended API grants';
  END IF;
END;
$$;
