-- Backs a simple, real (database-enforced) rate limiter for public write
-- endpoints (newsletter signup, discount code validation, reservation
-- submission, concierge) — see src/lib/rateLimit.ts. Server-only; no RLS
-- policy is needed since only the service-role client ever touches it.

create table if not exists public.rate_limit_hits (
  id bigint generated always as identity primary key,
  bucket_key text not null,
  created_at timestamptz not null default now()
);

create index if not exists rate_limit_hits_bucket_created_idx on public.rate_limit_hits (bucket_key, created_at);

alter table public.rate_limit_hits enable row level security;

-- Old rows are harmless but unbounded growth isn't — a scheduled cleanup
-- isn't set up here (no cron in this stack yet), so trim opportunistically
-- from the application side isn't practical either; this function is
-- provided for a manual/scheduled call (e.g. Supabase's SQL editor, or a
-- pg_cron job if enabled on your project) to purge old hits.
create or replace function public.cleanup_rate_limit_hits()
returns void
language sql
security definer set search_path = public
as $$
  delete from public.rate_limit_hits where created_at < now() - interval '1 day';
$$;
