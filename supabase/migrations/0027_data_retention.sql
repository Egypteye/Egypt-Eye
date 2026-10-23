-- Making the privacy policy true.
--
-- The policy now states, in writing, that contact details are removed 12
-- months after the last contact or the travel date, and that a newsletter
-- sign-up nobody confirmed is deleted after 30 days. A policy that promises
-- deletion the code never performs is worse than having no policy: it is a
-- false statement on a public page, made by a business taking card payments.
--
-- So this is the job that performs it. It is the only thing that deletes
-- customer data on a schedule, it is idempotent, and it reports what it did.
--
-- WHAT IS KEPT. Rows are not deleted, the person is removed from them. The
-- booking, the amount, the currency, the status and the reference all stay,
-- because an operator has to be able to show what was sold and for how much
-- long after the customer's name stops being any of our business. Only the
-- newsletter table deletes rows outright, because an address nobody confirmed
-- has no other content worth keeping.
--
-- DRY RUN BY DEFAULT. p_dry_run defaults to true, so a call that forgets the
-- argument counts rows and changes nothing. The nightly job passes false
-- explicitly. Given what this function does, the safe default is the one you
-- get by accident.


-- ---------------------------------------------------------------------------
-- First, a column to record that it happened.
--
-- Three reasons it is a real column and not an inference from a blank name:
--
--  1. reservations_contact_present_check (0021) requires every reservation to
--     be reachable by email, phone or a linked account. That is right for a
--     live booking and wrong for one anonymised two years later, so the
--     constraint needs a fourth, explicit escape rather than a loophole.
--  2. Idempotency. "guest_name <> ''" guesses at a sentinel; a timestamp
--     states the fact, so the second night's report reads zero because
--     nothing is left to do, not because a string happened to match.
--  3. It makes compliance answerable from the data. "Show me that you delete
--     what you promised to delete" is a question with an answer now.
-- ---------------------------------------------------------------------------
alter table public.reservations add column if not exists anonymised_at timestamptz;
alter table public.boutique_orders add column if not exists anonymised_at timestamptz;
alter table public.collaboration_applications add column if not exists anonymised_at timestamptz;
alter table public.travel_agent_applications add column if not exists anonymised_at timestamptz;
alter table public.hotel_rate_requests add column if not exists anonymised_at timestamptz;
alter table public.concierge_requests add column if not exists anonymised_at timestamptz;

comment on column public.reservations.anonymised_at is
  'When the retention job removed the guest name, email and phone. The booking and its figures are kept; the person is not. See 0027 and src/lib/privacy/policy.ts.';

-- The reachability rule, with anonymised rows allowed through. Everything
-- else about it is unchanged: a live reservation must still carry an email, a
-- phone, or an account.
alter table public.reservations
  drop constraint if exists reservations_contact_present_check;
alter table public.reservations
  add constraint reservations_contact_present_check
  check (
    (guest_email is not null and btrim(guest_email) <> '')
    or (guest_phone is not null and btrim(guest_phone) <> '')
    or customer_id is not null
    or anonymised_at is not null
  );

create or replace function public.apply_data_retention(p_dry_run boolean default true)
returns jsonb
language plpgsql
security definer
-- Pinned, not mutable: a SECURITY DEFINER function with a search_path the
-- caller controls can be pointed at a different `now()` or a shadowing table.
set search_path = public, pg_temp
as $$
declare
  -- 12 months after the LAST of: our last contact, or the trip. A reservation
  -- updated last week for travel in two years is not stale either way round.
  v_contact_cutoff timestamptz := now() - interval '12 months';
  v_signup_cutoff  timestamptz := now() - interval '30 days';
  v_report jsonb := jsonb_build_object(
    'dry_run', p_dry_run,
    'ran_at', now(),
    'contact_cutoff', v_contact_cutoff,
    'signup_cutoff', v_signup_cutoff
  );
  v_n bigint;
begin
  -- ---------------------------------------------------------------------
  -- Reservations. guest_name is NOT NULL so it is emptied rather than
  -- nulled; guest_email and guest_phone are nullable and go to null.
  -- The `guest_name <> ''` keeps this idempotent: a row already cleared is
  -- not counted again, so the report means something on the second night.
  -- ---------------------------------------------------------------------
  if p_dry_run then
    select count(*) into v_n from public.reservations
     where greatest(updated_at, (coalesce(trip_end_date, trip_start_date, created_at::date))::timestamptz) < v_contact_cutoff
       and anonymised_at is null;
  else
    update public.reservations
       set guest_name = '', guest_email = null, guest_phone = null, anonymised_at = now()
     where greatest(updated_at, (coalesce(trip_end_date, trip_start_date, created_at::date))::timestamptz) < v_contact_cutoff
       and anonymised_at is null;
    get diagnostics v_n = row_count;
  end if;
  v_report := v_report || jsonb_build_object('reservations', v_n);

  -- ---------------------------------------------------------------------
  -- Boutique orders. engraved_name goes too: it is usually the customer's
  -- own name. product_name says what was sold, which is what accounts need.
  -- ---------------------------------------------------------------------
  if p_dry_run then
    select count(*) into v_n from public.boutique_orders
     where updated_at < v_contact_cutoff and anonymised_at is null;
  else
    update public.boutique_orders
       set customer_name = '', customer_email = '', customer_phone = null, engraved_name = '', anonymised_at = now()
     where updated_at < v_contact_cutoff and anonymised_at is null;
    get diagnostics v_n = row_count;
  end if;
  v_report := v_report || jsonb_build_object('boutique_orders', v_n);

  -- ---------------------------------------------------------------------
  -- Applications to work with us. The company and the outcome stay; the
  -- person and what they wrote do not.
  -- ---------------------------------------------------------------------
  if p_dry_run then
    select count(*) into v_n from public.collaboration_applications
     where updated_at < v_contact_cutoff and anonymised_at is null;
  else
    update public.collaboration_applications
       set full_name = '', email = '', phone = null, message = null, anonymised_at = now()
     where updated_at < v_contact_cutoff and anonymised_at is null;
    get diagnostics v_n = row_count;
  end if;
  v_report := v_report || jsonb_build_object('collaboration_applications', v_n);

  if p_dry_run then
    select count(*) into v_n from public.travel_agent_applications
     where updated_at < v_contact_cutoff and anonymised_at is null;
  else
    update public.travel_agent_applications
       set contact_name = '', email = '', phone = '', message = null, anonymised_at = now()
     where updated_at < v_contact_cutoff and anonymised_at is null;
    get diagnostics v_n = row_count;
  end if;
  v_report := v_report || jsonb_build_object('travel_agent_applications', v_n);

  -- ---------------------------------------------------------------------
  -- Hotel rate enquiries. The hotel and room snapshots stay — they are our
  -- own content, not the enquirer's.
  -- ---------------------------------------------------------------------
  if p_dry_run then
    select count(*) into v_n from public.hotel_rate_requests
     where created_at < v_contact_cutoff and anonymised_at is null;
  else
    update public.hotel_rate_requests
       set name = null, email = '', message = null, anonymised_at = now()
     where created_at < v_contact_cutoff and anonymised_at is null;
    get diagnostics v_n = row_count;
  end if;
  v_report := v_report || jsonb_build_object('hotel_rate_requests', v_n);

  -- ---------------------------------------------------------------------
  -- Concierge conversations. These are the customer's own words, sent to
  -- Google to be answered. There is no reason to hold them for a year.
  -- ---------------------------------------------------------------------
  if p_dry_run then
    select count(*) into v_n from public.concierge_requests
     where created_at < v_contact_cutoff and anonymised_at is null;
  else
    update public.concierge_requests
       set question = '', answer = null, anonymised_at = now()
     where created_at < v_contact_cutoff and anonymised_at is null;
    get diagnostics v_n = row_count;
  end if;
  v_report := v_report || jsonb_build_object('concierge_requests', v_n);

  -- ---------------------------------------------------------------------
  -- Newsletter sign-ups nobody confirmed. Deleted outright after 30 days:
  -- the address was never verified, it is never emailed anything but the one
  -- confirmation request, and so it can never be used for anything.
  -- ---------------------------------------------------------------------
  if p_dry_run then
    select count(*) into v_n from public.newsletter_subscribers
     where not verified and created_at < v_signup_cutoff;
  else
    delete from public.newsletter_subscribers
     where not verified and created_at < v_signup_cutoff;
    get diagnostics v_n = row_count;
  end if;
  v_report := v_report || jsonb_build_object('unconfirmed_signups_deleted', v_n);

  -- ---------------------------------------------------------------------
  -- Unsubscribes. The address itself stays, as a do-not-contact entry, so a
  -- later sign-up cannot add somebody back who asked to be left alone. That
  -- is the one case where keeping the data is the privacy-respecting choice,
  -- and the policy says so. The first name is not needed for it.
  -- ---------------------------------------------------------------------
  if p_dry_run then
    select count(*) into v_n from public.newsletter_subscribers
     where unsubscribed and first_name is not null;
  else
    update public.newsletter_subscribers set first_name = null
     where unsubscribed and first_name is not null;
    get diagnostics v_n = row_count;
  end if;
  v_report := v_report || jsonb_build_object('unsubscribed_names_cleared', v_n);

  return v_report;
end;
$$;

-- Same lesson as 0026: revoking from the roles alone does nothing, because
-- Postgres grants EXECUTE on a new function to PUBLIC and anon inherits it.
-- This one deletes customer records, so it being callable from the internet
-- over /rest/v1/rpc/ would be considerably worse than the rate-limit wipe.
revoke execute on function public.apply_data_retention(boolean) from public, anon, authenticated;
grant execute on function public.apply_data_retention(boolean) to service_role;

comment on function public.apply_data_retention(boolean) is
  'Enforces the retention periods stated in the published privacy policy. Dry run by default; the nightly job passes false. See src/lib/privacy/policy.ts.';

-- ---------------------------------------------------------------------------
-- A note on the 19 "function_search_path_mutable" advisories, and why this
-- migration does NOT fix them.
--
-- All six SECURITY DEFINER functions in this database already pin
-- search_path, and apply_data_retention above pins its own. The 19 the
-- advisor lists are all `os_*` and `nextval_os_*`: triggers and sequence
-- helpers belonging to an internal operations system that is NOT part of
-- this repository. There is no migration here that creates them, no table
-- of theirs in supabase/migrations, and not one line in src/ that reads or
-- writes any os_* table. They share the Supabase project; they are not ours.
--
-- An earlier draft of this migration discovered unpinned functions and fixed
-- them in a loop. On a clean test database that is a no-op, because none of
-- those functions exist there — it looked harmless. Against production it
-- would have silently altered 19 functions belonging to an application
-- nobody here can test, on the strength of an informational advisory. If any
-- of them resolves a name through `extensions` or `auth` unqualified,
-- pinning to `public, pg_temp` breaks it, at night, in a system we would not
-- know had stopped working.
--
-- So they are left alone and written up for the owner instead. The
-- assertion in supabase/tests/0027_data_retention.sql still requires every
-- function this repository creates to pin its search_path, which is the part
-- we can actually stand behind.
--
-- btree_gist living in `public` is the other advisory, left alone for a
-- related reason: relocating an extension that backs live exclusion
-- constraints to satisfy a notice is a bad trade on a production database.
-- ---------------------------------------------------------------------------
