-- Fixes "permission denied for table X" (Postgres error 42501) errors from
-- the app's service-role client. Row Level Security policies (defined in
-- 0001-0004) control *which rows* a role can see/touch, but they sit on top
-- of a separate, more basic layer: ordinary SQL table privileges (GRANT/
-- REVOKE), which control whether a role can attempt the operation on the
-- table AT ALL. service_role is meant to bypass RLS entirely (see the
-- design-notes comment in 0001_init.sql), but bypassing RLS does not imply
-- having the base table grants — those still have to be given explicitly,
-- and on this project they weren't, so every service-role write (newsletter
-- signup, reservations, discount codes, hotel rate requests, etc.) failed.
--
-- Safe to re-run.

grant usage on schema public to service_role, authenticated, anon;

-- service_role: full access to every table in the schema, matching this
-- codebase's actual design — it's the only thing allowed to write
-- newsletter subscribers, mint/redeem discount codes, or manage
-- reservations/hotels/collaborations, and it always bypasses RLS.
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;

-- Any table created by a future migration gets the same service_role grant
-- automatically, without needing another one of these GRANT-fixup
-- migrations.
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;

-- authenticated: base privileges for the tables its own RLS policies
-- already scope to "your own rows" (profiles_select_own, journeys_all_own,
-- reservations_select_own, etc.) — the GRANT here only opens the door: the
-- existing RLS policies still decide which rows are visible.
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.journeys to authenticated;
grant select, insert, update, delete on public.journey_items to authenticated;
grant select on public.reservations to authenticated;
grant select on public.reservation_change_requests to authenticated;
grant select on public.discount_codes to authenticated;
grant select, insert on public.concierge_requests to authenticated;

-- anon + authenticated: the public hotel catalog (hotels/hotel_rooms/
-- hotel_rates already have "for select using (true))" policies meant for
-- every visitor, logged in or not).
grant select on public.hotels, public.hotel_rooms, public.hotel_rates to anon, authenticated;
