-- ===========================================================================
-- EGYPT EYE OS — GOOGLE CALENDAR PUBLISHING
-- ===========================================================================
--
-- Mirrors trips into a shared Google Calendar so a driver, guide or
-- photographer sees tomorrow's work in the calendar app already on their
-- phone, without being given a login to this system.
--
-- TWO DECISIONS THIS FILE IS BUILT AROUND
-- ---------------------------------------
--
-- 1. IT IS ONE-WAY. The OS is the schedule; Google is a display of it.
--    Nothing arriving from Google ever writes to os_trips. Somebody dragging
--    an event in their own calendar app moves a picture of a trip, not the
--    trip — and the next publish puts it back where the OS says it belongs.
--    Two-way sync between two systems that both believe they are right is
--    how a crew ends up at the wrong pyramid at the wrong hour.
--
-- 2. IT IS AN OUTBOX, NOT AN INLINE CALL. Saving a trip marks a row here as
--    pending and returns. The hourly sweep does the talking to Google. That
--    matters because Google will be slow or down one day, and when it is, a
--    reservations agent rescheduling a trip must not see an error, must not
--    wait, and must not end up with a saved trip whose calendar row silently
--    never happened. A queue with attempts and last_error on it is the
--    difference between a failure you can see and one you cannot.
--
-- Publishing is deliberately status-gated: drafts are somebody thinking out
-- loud and do not belong in a crew's calendar, and a cancelled trip has its
-- event deleted rather than left sitting there looking real.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- THE LINK BETWEEN A TRIP AND ITS EVENT
-- ---------------------------------------------------------------------------
-- One row per (trip, calendar). Holds the Google event id so an update patches
-- the same event instead of creating a second one, and a content hash so a
-- sweep that finds nothing changed costs nothing.
create table if not exists public.os_calendar_links (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  trip_id uuid not null references public.os_trips (id) on delete cascade,

  provider text not null default 'google' check (provider in ('google')),
  -- Stored per row rather than read from the environment at publish time, so
  -- that changing GOOGLE_CALENDAR_ID later does not orphan the events already
  -- written to the old calendar — they can still be found and deleted.
  calendar_id text not null,
  event_id text,
  event_etag text,

  -- Hash of exactly the fields that get published. Unchanged hash, no call.
  content_hash text,

  -- pending  — something changed, Google does not know yet
  -- synced   — Google matches content_hash
  -- removing — the event should be deleted (trip cancelled, or fell out of
  --            the publishable set) and Google does not know that yet
  -- removed  — deleted from Google; the row is kept as the record that it was
  -- failed   — attempts exhausted; last_error says why, and it is visible in
  --            Admin rather than dying quietly in a log nobody reads
  state text not null default 'pending'
    check (state in ('pending', 'synced', 'removing', 'removed', 'failed')),

  attempts int not null default 0,
  last_error text,
  last_attempt_at timestamptz,
  synced_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (trip_id, provider, calendar_id)
);

create index if not exists os_calendar_links_due
  on public.os_calendar_links (state, last_attempt_at)
  where state in ('pending', 'removing');

create index if not exists os_calendar_links_trip
  on public.os_calendar_links (trip_id);

drop trigger if exists os_calendar_links_touch on public.os_calendar_links;
create trigger os_calendar_links_touch
  before update on public.os_calendar_links
  for each row execute function public.os_touch_updated_at();

-- ---------------------------------------------------------------------------
-- SECURITY
-- ---------------------------------------------------------------------------
-- Same posture as every other os_ table: RLS on, no client policy, browser
-- keys revoked. Reaching this table means going through server code that has
-- already checked a permission.
alter table public.os_calendar_links enable row level security;
revoke all on public.os_calendar_links from anon, authenticated;

-- ---------------------------------------------------------------------------
-- CONFIGURATION
-- ---------------------------------------------------------------------------
-- Which statuses are worth a crew member's calendar. Draft is excluded on
-- purpose; closed is excluded because the work is over and the calendar is
-- about what is coming.
insert into public.os_settings (org_id, key, value, description)
select o.id, v.key, v.value::jsonb, v.description
from public.os_orgs o,
(values
  ('calendar.publish_statuses',
   '["confirmed","planning","assigned","ready","in_progress"]',
   'Trip statuses that appear in the shared Google Calendar. A trip that leaves this set has its event deleted.'),
  ('calendar.max_attempts', '5',
   'How many times the sweep retries a failing calendar publish before marking it failed and surfacing it in Admin.')
) as v(key, value, description)
where o.key = 'egypt-eye'
on conflict (org_id, key) do nothing;

-- The automation registered as designed-not-built in 0019 is now built. It
-- still only runs when the Google credentials exist; `implemented` says the
-- code is there, not that the integration is configured.
update public.os_automations
set implemented = true,
    name = 'Publish trips to Google Calendar',
    description = 'Confirmed trips are published to a shared operations calendar and kept in step — rescheduled, renamed, or deleted when cancelled. One-way: the OS stays the source of truth.',
    trigger_event = 'trip.mutated',
    actions = '[{"type":"queue_calendar_publish"},{"type":"sync_google_calendar"}]'::jsonb,
    requires_integration = 'Google Calendar API (service account, calendar shared with it)'
where key = 'calendar_sync';
