-- Fixes "permission denied for table game_campaigns" (Postgres 42501) on
-- the Pharaoh's Challenge tables — same root cause 0007_grant_privileges.sql
-- already fixed once for hotels/journeys/etc: creating a table and an RLS
-- policy is not enough on its own. RLS controls which ROWS a role can see;
-- it sits on top of a separate, more basic layer of plain SQL table
-- privileges that controls whether the role can query the table AT ALL.
-- 0014_pharaoh_challenge.sql set up the RLS policies but never granted
-- these base privileges, so anon/authenticated requests were denied before
-- RLS was ever evaluated.
--
-- service_role already has access to every new table automatically (see
-- the "alter default privileges ... grant all ... to service_role" in
-- 0007_grant_privileges.sql), which is why the admin panel and server
-- actions worked fine — this migration only needed to cover the
-- anon/authenticated read paths.
--
-- Safe to re-run.

-- anon + authenticated: game_campaigns/game_tiers already have "for select
-- using (true)" policies meant for every visitor, logged in or not.
grant select on public.game_campaigns, public.game_tiers to anon, authenticated;

-- authenticated only: game_attempts' RLS policy is "select own"
-- (auth.uid() = customer_id) — this grant just opens the door, the policy
-- still decides which row(s) are visible.
grant select on public.game_attempts to authenticated;
