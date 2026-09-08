-- ===========================================================================
-- RESET EGYPT EYE OS
-- ===========================================================================
--
-- DESTRUCTIVE. This removes every trace of Egypt Eye OS from the database:
-- all os_ tables and their data, the os_ functions, and the os_ sequences.
--
-- It touches NOTHING ELSE. The website's tables — profiles, reservations,
-- journeys, discount_codes, discount_campaigns, newsletter_subscribers,
-- hotels, travel_agents, concierge_requests, pinterest_connection and the
-- rest — are not dropped, not emptied, and not altered. auth.users is not
-- touched either, so nobody loses their login.
--
-- That is not a promise, it is enforced. Section 1 below refuses to run at
-- all if the drop list contains anything that is not an os_ object, and the
-- whole file runs inside one transaction, so a refusal drops nothing: either
-- every os_ object goes or none of them do.
--
-- Two things it deliberately leaves behind. The pgcrypto and btree_gist
-- EXTENSIONS stay installed — 0018 asked for them with `if not exists`, so it
-- cannot tell whether it created them or found them, and dropping one the
-- website is using would break the website. They cost nothing idle. The roles
-- anon, authenticated and service_role stay too; they are Supabase's, not the
-- OS's.
--
-- WHEN YOU WOULD RUN THIS
--
--   * The migrations went wrong and you want a clean slate. Run this, then
--     0018 onward again.
--   * You have finished evaluating the demo data and want to start for real.
--     Run this, then run 0018, 0019, 0021, 0022 and 0023 — but NOT 0020 or
--     0024, which are the demo records.
--
-- HOW TO RUN IT
--
--   Paste the whole file into the Supabase SQL editor and run it once.
--   Take a backup first. It is fast and it is not undoable.
--
-- This file lives in supabase/tools/ and NOT in supabase/migrations/ on
-- purpose: it must never be picked up by anything that runs the migration
-- folder in order.
-- ===========================================================================

-- One transaction. If any section below raises, the whole reset rolls back
-- and the database is exactly as it was. This also means the safety check in
-- section 1 protects you in any client, not only the ones that stop on error.
begin;

-- ---------------------------------------------------------------------------
-- 1. SAFETY CHECK — refuse to run if anything here is not an os_ object
-- ---------------------------------------------------------------------------
-- Belt and braces. The drop statements below are already scoped, but a
-- reset script is exactly the kind of thing that gets edited in a hurry at
-- the wrong moment, so it verifies its own blast radius before firing.
do $$
declare
  stray text;
begin
  select string_agg(tablename, ', ')
    into stray
  from pg_tables
  where schemaname = 'public'
    and tablename like 'os%'
    and tablename not like 'os\_%';

  if stray is not null then
    raise exception
      'Refusing to run. These tables start with "os" but are not os_ tables, and this script will not guess: %', stray;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 2. WHAT IS ABOUT TO GO
-- ---------------------------------------------------------------------------
-- Printed to the output pane before anything is dropped, so the last thing
-- you see before the damage is a list of exactly what took it.
do $$
declare
  table_count int;
  row_total bigint;
begin
  select count(*) into table_count
  from pg_tables where schemaname = 'public' and tablename like 'os\_%';

  select coalesce(sum(n_live_tup), 0) into row_total
  from pg_stat_user_tables where schemaname = 'public' and relname like 'os\_%';

  raise notice 'Dropping % Egypt Eye OS tables holding roughly % rows.', table_count, row_total;
  raise notice 'Website tables are untouched.';
end $$;

-- ---------------------------------------------------------------------------
-- 3. DROP THE TABLES
-- ---------------------------------------------------------------------------
-- CASCADE handles the foreign keys between os_ tables and the views, triggers
-- and constraints that hang off them. It cannot cascade into a website table
-- because no website table references an os_ table — nothing in migrations
-- 0001 to 0017 knows these exist.
do $$
declare
  t text;
begin
  for t in
    select tablename from pg_tables
    where schemaname = 'public' and tablename like 'os\_%'
    order by tablename
  loop
    execute format('drop table if exists public.%I cascade', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 4. DROP THE FUNCTIONS
-- ---------------------------------------------------------------------------
-- Matched on name so a signature change never leaves an orphan behind.
do $$
declare
  fn record;
begin
  for fn in
    select p.oid::regprocedure as signature
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and (p.proname like 'os\_%' or p.proname like 'nextval\_os\_%')
  loop
    execute format('drop function if exists %s cascade', fn.signature);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 5. DROP THE SEQUENCES
-- ---------------------------------------------------------------------------
-- Reference counters (trip, quote, approval, incident, lead, deal, agreement,
-- company). Dropping them resets numbering to the start on the next install,
-- which is what you want on a clean slate and is worth knowing if you are
-- only clearing demo data: your first real trip will be EE-10001 again.
do $$
declare
  s text;
begin
  for s in
    select sequencename from pg_sequences
    where schemaname = 'public' and sequencename like 'os\_%'
  loop
    execute format('drop sequence if exists public.%I cascade', s);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 6. CONFIRM
-- ---------------------------------------------------------------------------
do $$
declare
  remaining int;
  website_tables int;
begin
  select count(*) into remaining
  from pg_tables where schemaname = 'public' and tablename like 'os\_%';

  select count(*) into website_tables
  from pg_tables where schemaname = 'public' and tablename not like 'os\_%';

  if remaining > 0 then
    raise exception 'Something is left: % os_ tables remain.', remaining;
  end if;

  raise notice 'Egypt Eye OS removed. % website tables still present and untouched.', website_tables;
end $$;

commit;
