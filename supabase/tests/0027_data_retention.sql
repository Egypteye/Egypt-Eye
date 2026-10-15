-- The retention job, proven rather than asserted.
--
-- The privacy policy now promises, on a public page, that contact details go
-- 12 months after the last contact and that an unconfirmed newsletter
-- sign-up goes after 30 days. These assertions are what make that promise
-- true. They check both directions, because both are ways of being sued:
-- data that should have gone and is still there, and data that should have
-- stayed — the amounts, the references, the confirmed subscribers — being
-- destroyed by a job that was too eager.

begin;

-- An old reservation: we last touched it 18 months ago and the trip is over.
insert into public.reservations
  (reference, guest_name, guest_email, guest_phone, total_estimate, trip_start_date, trip_end_date, created_at, updated_at)
values
  ('EE-OLD00001', 'Old Guest', 'old@example.com', '+201111111111', 1234.00,
   (now() - interval '20 months')::date, (now() - interval '19 months')::date,
   now() - interval '20 months', now() - interval '18 months');

-- A recent one. Nothing may touch this.
insert into public.reservations
  (reference, guest_name, guest_email, guest_phone, total_estimate, created_at, updated_at)
values
  ('EE-NEW00001', 'New Guest', 'new@example.com', '+202222222222', 999.00, now() - interval '3 days', now() - interval '3 days');

-- A reservation updated recently for travel long ago: the greatest() of the
-- two dates is recent, so it stays. This is the case a naive
-- "trip_end_date < cutoff" rule would wrongly wipe.
insert into public.reservations
  (reference, guest_name, guest_email, total_estimate, trip_start_date, trip_end_date, created_at, updated_at)
values
  ('EE-REOPEN01', 'Reopened Guest', 'reopened@example.com', 500.00,
   (now() - interval '20 months')::date, (now() - interval '19 months')::date,
   now() - interval '20 months', now() - interval '2 days');

insert into public.boutique_orders
  (reference, product_slug, product_name, engraved_name, sign_count, unit_cents, total_cents,
   customer_name, customer_email, customer_phone, quote, created_at, updated_at)
values
  ('EEB-OLD0001', 'khufu-cartouche', 'Khufu Cartouche', 'OMAR', 4, 9900, 9900,
   'Old Buyer', 'oldbuyer@example.com', '+203333333333', '{"totalCents":9900}'::jsonb,
   now() - interval '20 months', now() - interval '18 months'),
  ('EEB-NEW0001', 'khufu-cartouche', 'Khufu Cartouche', 'LAYLA', 5, 9900, 9900,
   'New Buyer', 'newbuyer@example.com', '+204444444444', '{"totalCents":9900}'::jsonb,
   now() - interval '2 days', now() - interval '2 days');

insert into public.newsletter_subscribers (email, first_name, verified, created_at)
values
  ('stale-unconfirmed@example.com', 'Stale', false, now() - interval '60 days'),
  ('fresh-unconfirmed@example.com', 'Fresh', false, now() - interval '5 days'),
  ('old-confirmed@example.com', 'Confirmed', true, now() - interval '60 days');
insert into public.newsletter_subscribers (email, first_name, verified, unsubscribed, created_at)
values ('gone@example.com', 'Departed', true, true, now() - interval '10 days');

-- ===========================================================================
-- 1. The dry run must change absolutely nothing.
-- ===========================================================================
select public.apply_data_retention() into temp dry;

select 'dry_run_still_named=' || count(*) || ' (expect 1)' as step
from public.reservations where reference = 'EE-OLD00001' and guest_name = 'Old Guest';
select 'dry_run_left_no_stamp=' || count(*) || ' (expect 0)' as step
from public.reservations where anonymised_at is not null;

select 'dry_run_signups_intact=' || count(*) || ' (expect 4)' as step
from public.newsletter_subscribers;

-- And it must still have counted correctly: one stale reservation, one stale
-- order, one unconfirmed sign-up, one unsubscribed name.
select 'dry_counted_reservations=' || ((select * from dry)->>'reservations') || ' (expect 1)' as step;
select 'dry_counted_orders=' || ((select * from dry)->>'boutique_orders') || ' (expect 1)' as step;
select 'dry_counted_signups=' || ((select * from dry)->>'unconfirmed_signups_deleted') || ' (expect 1)' as step;
select 'dry_counted_unsub_names=' || ((select * from dry)->>'unsubscribed_names_cleared') || ' (expect 1)' as step;
-- Printed, not compared, is how a guard in this project has passed on broken
-- code before: check-sql.sh only compares "name=N (expect M)" lines and
-- echoes everything else. So this raises instead of printing.
do $$
begin
  if (select (r->>'dry_run')::boolean from dry d(r)) is not true then
    raise exception 'the dry run did not report itself as a dry run';
  end if;
end $$;

-- ===========================================================================
-- 2. The real run.
-- ===========================================================================
select public.apply_data_retention(false) into temp did;

-- The old guest is gone from the row, but the row and the money are not.
select 'old_name_cleared=' || count(*) || ' (expect 1)' as step
from public.reservations where reference = 'EE-OLD00001' and guest_name = '';
select 'old_email_cleared=' || count(*) || ' (expect 1)' as step
from public.reservations where reference = 'EE-OLD00001' and guest_email is null;
select 'old_phone_cleared=' || count(*) || ' (expect 1)' as step
from public.reservations where reference = 'EE-OLD00001' and guest_phone is null;
select 'old_amount_survives=' || count(*) || ' (expect 1)' as step
from public.reservations where reference = 'EE-OLD00001' and total_estimate = 1234.00;
select 'old_reference_survives=' || count(*) || ' (expect 1)' as step
from public.reservations where reference = 'EE-OLD00001';
select 'old_row_is_stamped=' || count(*) || ' (expect 1)' as step
from public.reservations where reference = 'EE-OLD00001' and anonymised_at is not null;
select 'recent_rows_unstamped=' || count(*) || ' (expect 2)' as step
from public.reservations where reference in ('EE-NEW00001','EE-REOPEN01') and anonymised_at is null;

-- The recent ones are untouched. Both of them.
select 'recent_untouched=' || count(*) || ' (expect 1)' as step
from public.reservations where reference = 'EE-NEW00001' and guest_name = 'New Guest' and guest_email = 'new@example.com';
select 'recently_updated_untouched=' || count(*) || ' (expect 1)' as step
from public.reservations where reference = 'EE-REOPEN01' and guest_name = 'Reopened Guest';

-- Boutique: the buyer and the engraved name go, the product and price stay.
select 'old_order_buyer_cleared=' || count(*) || ' (expect 1)' as step
from public.boutique_orders where reference = 'EEB-OLD0001'
  and customer_name = '' and customer_email = '' and customer_phone is null and engraved_name = '';
select 'old_order_money_survives=' || count(*) || ' (expect 1)' as step
from public.boutique_orders where reference = 'EEB-OLD0001' and total_cents = 9900 and product_name = 'Khufu Cartouche';
select 'new_order_untouched=' || count(*) || ' (expect 1)' as step
from public.boutique_orders where reference = 'EEB-NEW0001' and customer_name = 'New Buyer' and engraved_name = 'LAYLA';

-- Newsletter: the stale unconfirmed address is gone; the fresh unconfirmed
-- one and the confirmed one are not.
select 'stale_unconfirmed_deleted=' || count(*) || ' (expect 0)' as step
from public.newsletter_subscribers where email = 'stale-unconfirmed@example.com';
select 'fresh_unconfirmed_kept=' || count(*) || ' (expect 1)' as step
from public.newsletter_subscribers where email = 'fresh-unconfirmed@example.com';
select 'old_confirmed_kept=' || count(*) || ' (expect 1)' as step
from public.newsletter_subscribers where email = 'old-confirmed@example.com';

-- The unsubscribed address stays as a do-not-contact entry — that is the
-- privacy-respecting choice and the policy says so — but the name goes.
select 'unsubscribed_address_kept=' || count(*) || ' (expect 1)' as step
from public.newsletter_subscribers where email = 'gone@example.com';
select 'unsubscribed_name_cleared=' || count(*) || ' (expect 1)' as step
from public.newsletter_subscribers where email = 'gone@example.com' and first_name is null;

-- ===========================================================================
-- 3. Idempotent. A second night must report zero, not re-count the same rows.
-- ===========================================================================
select public.apply_data_retention(false) into temp again;
select 'second_run_reservations=' || ((select * from again)->>'reservations') || ' (expect 0)' as step;
select 'second_run_orders=' || ((select * from again)->>'boutique_orders') || ' (expect 0)' as step;
select 'second_run_signups=' || ((select * from again)->>'unconfirmed_signups_deleted') || ' (expect 0)' as step;
select 'second_run_unsub_names=' || ((select * from again)->>'unsubscribed_names_cleared') || ' (expect 0)' as step;

-- A dry run AFTER the real one must report zero too. This is the assertion
-- that catches the count branch losing its guard: before the first sweep
-- every row is unstamped, so a missing guard changes nothing and looks
-- correct. Only here, with rows already cleared, does an over-counting
-- report show up — and an over-counting report is how "we delete what we
-- promise to delete" quietly becomes unverifiable.
select public.apply_data_retention() into temp dry2;
select 'dry_after_sweep_reservations=' || ((select * from dry2)->>'reservations') || ' (expect 0)' as step;
select 'dry_after_sweep_orders=' || ((select * from dry2)->>'boutique_orders') || ' (expect 0)' as step;
select 'dry_after_sweep_signups=' || ((select * from dry2)->>'unconfirmed_signups_deleted') || ' (expect 0)' as step;

-- ===========================================================================
-- 3b. The reachability rule still bites on a live reservation. Widening it
--     for anonymised rows must not have opened it for everything else.
-- ===========================================================================
do $$
declare refused boolean := false;
begin
  begin
    insert into public.reservations (reference, guest_name) values ('EE-NOCONTACT', 'Unreachable');
  exception when check_violation then
    refused := true;
  end;
  raise notice 'live row with no contact -> %', case when refused then 'refused' else 'ACCEPTED (BAD)' end;
  if not refused then raise exception 'the reachability constraint stopped working'; end if;
end $$;

-- ===========================================================================
-- 4. It must not be callable from the internet. This function DELETES
--    customer records; the same PUBLIC-grant mistake that left the
--    rate-limit wipe open would be considerably worse here.
-- ===========================================================================
do $$
begin
  if has_function_privilege('anon', 'public.apply_data_retention(boolean)', 'execute') then
    raise exception 'anon can run the retention job over /rest/v1/rpc/ — it DELETES customer records';
  end if;
  if has_function_privilege('authenticated', 'public.apply_data_retention(boolean)', 'execute') then
    raise exception 'any signed-in user can run the retention job';
  end if;
  if not has_function_privilege('service_role', 'public.apply_data_retention(boolean)', 'execute') then
    raise exception 'the service role cannot run the retention job, so the nightly sweep is dead';
  end if;
  raise notice 'retention job reachable by service_role only -> ok';
end $$;

-- ===========================================================================
-- 5. Every function of ours pins its search_path.
--
--    This is the assertion that was missing: removing `set search_path` from
--    the retention function left the whole suite green, because nothing
--    looked. A SECURITY DEFINER function with a caller-controlled
--    search_path runs the caller's choice of `now()` or table with our
--    privileges, which is the whole point of the hardening.
--
--    Two exclusions, both deliberate:
--
--      - Extension functions (btree_gist's gbt_*, *_dist) are not ours.
--      - os_* and nextval_os_* belong to an internal operations system that
--        is not in this repository: no migration creates them and no line in
--        src/ touches them. They are the 19 the Supabase advisor lists. We
--        do not assert over code we do not own and cannot test, and 0027
--        deliberately does not alter them. See the note there.
-- ===========================================================================
do $$
declare
  unpinned text;
begin
  select string_agg(p.oid::regprocedure::text, ', ')
    into unpinned
  from pg_proc p
  join pg_namespace ns on ns.oid = p.pronamespace
  where ns.nspname = 'public'
    and p.prokind = 'f'
    and not exists (select 1 from pg_depend d where d.objid = p.oid and d.deptype = 'e')
    and p.proname not like 'os\_%'
    and p.proname not like 'nextval\_os\_%'
    and (p.proconfig is null or not exists (
      select 1 from unnest(p.proconfig) c where c like 'search\_path=%'
    ));
  if unpinned is not null then
    raise exception 'function(s) in public do not pin search_path: %', unpinned;
  end if;
  raise notice 'every function of ours pins search_path -> ok';
end $$;

-- And SECURITY DEFINER specifically, named separately so the failure message
-- says which class of problem it is.
do $$
declare
  bad text;
begin
  select string_agg(p.proname, ', ') into bad
  from pg_proc p
  join pg_namespace ns on ns.oid = p.pronamespace
  where ns.nspname = 'public' and p.prosecdef
    and (p.proconfig is null or not exists (
      select 1 from unnest(p.proconfig) c where c like 'search\_path=%'
    ));
  if bad is not null then
    raise exception 'SECURITY DEFINER function(s) with a mutable search_path: %', bad;
  end if;
end $$;

rollback;
