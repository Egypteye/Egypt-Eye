-- Every enquiry, written down before anyone tries to email it.
--
-- =========================================================================
-- WHY THIS EXISTS
-- =========================================================================
-- Five routes in this app sent an email and stored nothing: /api/enquiry,
-- /api/flying-dresses-enquiry, /api/transfer-request, /api/shop-visit and
-- /api/review-submission. For four of them the email WAS the lead. If Resend
-- refused the send — an unverified sender domain, an expired key, an outage —
-- the visitor was shown "we could not send that, message us on WhatsApp", and
-- that was the end of it. No row, no log a person reads, no way to answer
-- "how many people tried to book this week and never reached us".
--
-- That is not hypothetical. The Flying Dresses route's own comment says it:
-- "every send fails, and the visitor is told to go to WhatsApp. Some of them
-- will. The rest are a customer the business never hears from, and nothing
-- anywhere records that they tried."
--
-- So the enquiry is written here FIRST, and the send outcome is recorded
-- against it afterwards. A failed send becomes a row marked `failed` with the
-- provider's reason, which is a lead the owner can still phone. It stops
-- being a customer who silently vanished.
--
-- review-submission is deliberately excluded. Its own header explains that it
-- writes nothing on purpose, so that a review only reaches the wall once a
-- person has checked it against a real booking. That is a different promise
-- and not mine to quietly reverse.
--
-- =========================================================================
-- THE POLICY ALREADY COVERS THIS DATA
-- =========================================================================
-- src/lib/privacy/policy.ts already tells visitors: "Your name, phone number
-- and email address are removed 12 months after your last contact with us."
-- That sentence was true of reservations and would have become false the
-- moment enquiries were stored with no sweep behind them — which is exactly
-- the failure 0027's own header warns about ("a policy that promises deletion
-- the code never performs is worse than having no policy").
--
-- So the sweep is part of this migration, not a follow-up.

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Which form, and which business. Both brands run from one app, and an
  -- enquiry that cannot say which brand it belongs to cannot be answered in
  -- the right voice or counted in the right funnel.
  kind text not null,
  brand text not null,

  -- What they were looking at. Free text rather than a foreign key: products
  -- live in Sanity and in content files, not in this database, and a lead
  -- must never fail to save because a slug was renamed.
  subject_title text,

  -- The person. Empty strings rather than null for name/email so the
  -- anonymisation sweep has somewhere to write, matching 0027's handling of
  -- reservations.guest_name.
  name text not null default '',
  email text not null default '',
  phone text,

  -- Everything else the form collected, as submitted. jsonb because the four
  -- forms disagree about their fields and always will; a column per field
  -- would mean a migration every time a form gains a question, and the
  -- migration is exactly what would be skipped in a hurry.
  details jsonb not null default '{}'::jsonb,

  -- The delivery outcome. This is the column the whole table is for.
  email_status text not null default 'pending',
  email_error text,
  email_attempted_at timestamptz,

  anonymised_at timestamptz,

  constraint enquiries_kind_check
    check (kind in ('tour_enquiry', 'flying_dresses', 'transfer', 'shop_visit')),
  constraint enquiries_brand_check
    check (brand in ('egypt_eye', 'flying_dresses')),
  constraint enquiries_email_status_check
    check (email_status in ('pending', 'sent', 'failed'))
);

-- The two questions this table gets asked: "what came in recently" and
-- "what never reached us". The second is partial — failures should be rare,
-- and an index over the whole table to find them would be mostly waste.
create index if not exists enquiries_created_at_idx
  on public.enquiries (created_at desc);
create index if not exists enquiries_undelivered_idx
  on public.enquiries (created_at desc)
  where email_status <> 'sent';

comment on table public.enquiries is
  'Every website enquiry, written before the notification email is attempted. email_status records whether that email actually left. See src/lib/enquiries/store.ts.';
comment on column public.enquiries.email_status is
  'pending until a send is attempted, then sent or failed. A failed row is a real customer whose enquiry never reached the inbox.';

-- RLS on with no policies at all: service role only, which is the same
-- posture as every other customer table here. This holds names, email
-- addresses and phone numbers, and the anon key is in the browser.
alter table public.enquiries enable row level security;

-- ---------------------------------------------------------------------------
-- updated_at.
-- ---------------------------------------------------------------------------
create or replace function public.enquiries_touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists enquiries_touch_updated_at on public.enquiries;
create trigger enquiries_touch_updated_at
  before update on public.enquiries
  for each row execute function public.enquiries_touch_updated_at();

-- ---------------------------------------------------------------------------
-- Retention, as a SEPARATE function rather than an edit to apply_data_retention.
--
-- The obvious move is to add a block to apply_data_retention. Doing that means
-- `create or replace` with the whole of its body — a hundred lines that DELETE
-- AND OVERWRITE CUSTOMER RECORDS — retyped from a file, to add six lines. A
-- single transcription slip in a cutoff or a where-clause there does silent,
-- unrecoverable damage on a schedule, at night.
--
-- The composition is the smaller risk and the honest one: this function owns
-- the table this migration created, and src/lib/privacy/retention.ts calls
-- both and merges the reports. 0029 copied function bodies from live
-- definitions when it had to; here it does not have to.
-- ---------------------------------------------------------------------------
create or replace function public.apply_enquiry_retention(p_dry_run boolean default true)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cutoff timestamptz := now() - interval '12 months';
  v_n bigint;
begin
  -- The person goes; the shape of the enquiry stays. kind, brand, the subject
  -- and the delivery outcome are what make the funnel countable a year later,
  -- and none of them identify anybody.
  if p_dry_run then
    select count(*) into v_n from public.enquiries
     where updated_at < v_cutoff and anonymised_at is null;
  else
    update public.enquiries
       set name = '', email = '', phone = null, details = '{}'::jsonb,
           anonymised_at = now()
     where updated_at < v_cutoff and anonymised_at is null;
    get diagnostics v_n = row_count;
  end if;

  return jsonb_build_object(
    'dry_run', p_dry_run,
    'cutoff', v_cutoff,
    'enquiries', v_n
  );
end;
$$;

-- Same lesson as 0026 and 0027: Postgres grants EXECUTE to PUBLIC on a new
-- function, and anon inherits it. This one overwrites customer records, so
-- leaving it callable over /rest/v1/rpc/ would hand the internet a button
-- that wipes the enquiry history.
revoke execute on function public.apply_enquiry_retention(boolean) from public, anon, authenticated;
grant execute on function public.apply_enquiry_retention(boolean) to service_role;

comment on function public.apply_enquiry_retention(boolean) is
  'Removes the person from enquiries 12 months after last contact, as the published privacy policy states. Dry run by default. Called beside apply_data_retention by src/lib/privacy/retention.ts.';
