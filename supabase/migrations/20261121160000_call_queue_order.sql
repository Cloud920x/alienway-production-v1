-- Give existing businesses the same starting point, preserving their previous alphabetical order.
alter table public.call_leads add column created_at timestamptz not null default now();
alter table public.call_leads alter column created_at set default clock_timestamp();
create index call_leads_queue_order on public.call_leads (callback_at asc nulls last, created_at, business, id);
