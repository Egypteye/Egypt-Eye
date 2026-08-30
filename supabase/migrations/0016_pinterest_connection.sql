-- Stores the Pinterest OAuth connection used by src/lib/pinterest/client.ts to
-- auto-pin blog Stories. Single-row table (one connected Pinterest account per
-- site) — service_role only, same pattern as newsletter_subscribers: no public
-- policies at all, since this holds a live access/refresh token pair.
--
-- service_role already has access automatically (see
-- "alter default privileges ... grant all ... to service_role" in
-- 0007_grant_privileges.sql), so no companion GRANT migration is needed here
-- the way 0015 was needed for game_campaigns/game_tiers.
--
-- Safe to re-run.

create table if not exists public.pinterest_connection (
  id uuid primary key default gen_random_uuid(),
  access_token text not null,
  refresh_token text not null,
  token_expires_at timestamptz not null,
  board_id text,
  board_name text,
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pinterest_connection enable row level security;
-- No policies — service_role (createAdminSupabaseClient()) is the only client
-- that should ever read or write OAuth tokens.
