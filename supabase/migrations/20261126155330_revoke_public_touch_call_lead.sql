-- The function is used only as a trigger and must not be exposed as an RPC.
-- Existing triggers continue to execute after this privilege is revoked.
revoke execute on function public.touch_call_lead() from public, anon, authenticated;
