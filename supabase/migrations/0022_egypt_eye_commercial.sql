-- ===========================================================================
-- EGYPT EYE OS — COMMERCIAL LAYER
-- B2C Reservations and B2B Sales & Partnerships, on ONE data model
-- ===========================================================================
--
-- Migration 0018 built the operating system that starts once a booking is
-- closed. This one builds what happens BEFORE that: the enquiry, the
-- conversation, the quote, the negotiation, the agreement — and it hands the
-- result to the same trip the operation already runs.
--
-- THE ONE RULE THIS FILE IS ORGANISED AROUND
-- ------------------------------------------
-- There is no B2C database and no B2B database. There is one commercial
-- model with two lenses on it:
--
--   * A PERSON is `os_clients`. It already existed and it is not duplicated
--     here. A traveller who books for themselves and a person who books on
--     behalf of an agency are the same row, so their history is one history.
--
--   * A COMPANY is `os_companies`, new, because an agency is genuinely not a
--     person: it has contracts, commission terms, several contacts, and it
--     outlives any of them. `os_clients.kind = 'agency'` rows created before
--     this migration are promoted into a company below, with the person kept
--     as its contact — nothing is deleted and no history moves.
--
--   * The link between them is `os_client_companies`. It is a MEMBERSHIP, not
--     a copy: the same person can be a B2C customer in their own right and a
--     contact at two agencies at once, and closing one of those doors leaves
--     the other two untouched.
--
--   * A LEAD is an enquiry that has not been qualified. A DEAL is a
--     qualified opportunity. Both live in one table each, with a `pipeline`
--     column separating B2C from B2B — so "how much is in the pipeline" is
--     one query, and a person who arrives as a B2C enquiry and turns out to
--     run a tour company is re-pointed, not re-typed.
--
-- WHAT IS DELIBERATELY REUSED RATHER THAN REBUILT
-- -----------------------------------------------
--   os_quotes / os_quote_lines  the priced proposal a deal produces
--   os_trips                    what a won B2C deal becomes (deal_id added)
--   os_tasks                    follow-ups (lead/deal/company links added)
--   os_approvals                discount and term approvals
--   os_activity / os_audit_log  the story and the forensic record
--   os_price_items / os_rates   the price book, including agency net rates
--   os_suppliers                unchanged; a supplier is not a customer
--
-- SCORES ARE EXPLAINED, NEVER ASSERTED
-- ------------------------------------
-- Every score in this file — lead score, relationship health — is stored
-- alongside the list of factors that produced it, each with its own
-- contribution. A number a salesperson cannot argue with is a number they
-- will not trust, and an unexplained score is indistinguishable from a made
-- up one. See os_leads.score_factors and os_companies.health_factors.
--
-- HISTORY IS NEVER OVERWRITTEN
-- ----------------------------
-- Commercial terms are effective-dated and superseded, never updated in
-- place (os_agreement_terms), exactly as trip pricing is. A stage change is
-- appended to os_deal_stage_history. A lost deal keeps its reason and its
-- whole conversation.
--
-- SECURITY
-- --------
-- Same model as the rest of the OS: RLS on, no client-facing policy, anon
-- and authenticated revoked. Everything reaches these tables through
-- src/lib/os/commercial/* with the service-role key, after resolving the
-- acting employee and checking a permission and a scope.
-- ===========================================================================

-- ===========================================================================
-- 1. COMPANIES — the B2B organisation
-- ===========================================================================

create table if not exists public.os_companies (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  code text not null,
  name text not null,
  legal_name text,
  -- What KIND of partner this is decides which terms and which pipeline
  -- stages make sense, so it is a column rather than a tag.
  kind text not null default 'travel_agency'
    check (kind in (
      'travel_agency', 'tour_operator', 'dmc', 'ota', 'hotel', 'cruise_line',
      'corporate', 'wedding_planner', 'photographer_studio', 'media',
      'government', 'other'
    )),
  status text not null default 'prospect'
    check (status in ('prospect', 'active', 'dormant', 'suspended', 'former')),
  tier text not null default 'standard'
    check (tier in ('standard', 'preferred', 'strategic')),

  website text,
  email text,
  phone text,
  whatsapp text,
  country text,
  city text,
  address text,
  timezone text,
  languages text[] not null default '{}',

  -- Commercial shape of the relationship. The NUMBERS live in
  -- os_agreement_terms, effective-dated; these are the defaults a new
  -- agreement starts from and what a salesperson sees at a glance.
  default_commission_pct numeric(5, 2),
  default_payment_terms text,
  currency text not null default 'USD',
  credit_limit_amount numeric(14, 2),
  -- Set only by someone holding commercial.credit. A company over its limit
  -- cannot have a deal marked won without an approval.
  credit_hold boolean not null default false,

  -- Who owns this relationship. Scope 'own' in the commercial module means
  -- exactly this column.
  owner_employee_id uuid references public.os_employees (id) on delete set null,
  unit_id uuid references public.os_business_units (id) on delete set null,

  source text,
  -- Which company introduced us to this one. Referral revenue is traced
  -- through this, not guessed at.
  referred_by_company_id uuid references public.os_companies (id) on delete set null,

  -- Relationship health, 0-100, recomputed rather than typed. Never shown
  -- without health_factors beside it.
  health_score int not null default 0 check (health_score between 0 and 100),
  health_state text not null default 'unknown'
    check (health_state in ('unknown', 'strong', 'steady', 'slipping', 'at_risk', 'dormant')),
  health_factors jsonb not null default '[]'::jsonb,
  health_computed_at timestamptz,

  -- Denormalised relationship facts, maintained by the application when the
  -- underlying record changes. They are a cache of an answer that is
  -- otherwise four joins deep on every list row.
  first_deal_on date,
  last_deal_on date,
  last_contact_at timestamptz,
  lifetime_trips int not null default 0,
  lifetime_revenue_amount numeric(14, 2) not null default 0,
  lifetime_revenue_currency text not null default 'USD',

  notes text,
  created_by uuid references public.os_employees (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  unique (org_id, code)
);

create index if not exists os_companies_org_idx on public.os_companies (org_id, status) where archived_at is null;
create index if not exists os_companies_owner_idx on public.os_companies (owner_employee_id);
create index if not exists os_companies_name_idx on public.os_companies (org_id, lower(name));

drop trigger if exists os_companies_touch on public.os_companies;
create trigger os_companies_touch before update on public.os_companies
  for each row execute function public.os_touch_updated_at();

create sequence if not exists public.os_company_code_seq start with 101;

-- ---------------------------------------------------------------------------
-- The membership that makes one person record enough.
-- ---------------------------------------------------------------------------
-- A person is `os_clients`. This table says which companies they act for and
-- in what capacity. It is what lets Nour see, on one screen, that the woman
-- who booked a private photoshoot last March is also the operations manager
-- at the agency now negotiating a volume agreement — without either record
-- being a copy of the other.
create table if not exists public.os_client_companies (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.os_clients (id) on delete cascade,
  company_id uuid not null references public.os_companies (id) on delete cascade,
  job_title text,
  department text,
  -- What they can actually do in a negotiation. Sending a proposal to
  -- somebody with no authority is the most common wasted week in B2B sales,
  -- so the model asks.
  decision_role text not null default 'contact'
    check (decision_role in ('contact', 'influencer', 'recommender', 'decision_maker', 'signatory', 'gatekeeper', 'former')),
  is_primary boolean not null default false,
  work_email text,
  work_phone text,
  started_on date,
  ended_on date,
  notes text,
  created_by uuid references public.os_employees (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, company_id)
);

create index if not exists os_client_companies_company_idx on public.os_client_companies (company_id) where ended_on is null;
create index if not exists os_client_companies_client_idx on public.os_client_companies (client_id);

drop trigger if exists os_client_companies_touch on public.os_client_companies;
create trigger os_client_companies_touch before update on public.os_client_companies
  for each row execute function public.os_touch_updated_at();

-- One company can only have one primary contact. Enforced in the database
-- because "who do I call" must have exactly one answer.
create unique index if not exists os_client_companies_one_primary
  on public.os_client_companies (company_id)
  where is_primary and ended_on is null;

-- ---------------------------------------------------------------------------
-- Commercial columns on the EXISTING person record. No second person table.
-- ---------------------------------------------------------------------------
alter table public.os_clients add column if not exists lifecycle text not null default 'customer';
alter table public.os_clients add column if not exists lifetime_trips int not null default 0;
alter table public.os_clients add column if not exists lifetime_revenue_amount numeric(14, 2) not null default 0;
alter table public.os_clients add column if not exists lifetime_revenue_currency text not null default 'USD';
alter table public.os_clients add column if not exists last_contact_at timestamptz;
alter table public.os_clients add column if not exists owner_employee_id uuid references public.os_employees (id) on delete set null;
alter table public.os_clients add column if not exists referred_by_client_id uuid references public.os_clients (id) on delete set null;
alter table public.os_clients add column if not exists do_not_contact boolean not null default false;
alter table public.os_clients add column if not exists marketing_opt_in boolean not null default false;
alter table public.os_clients add column if not exists consent_recorded_at timestamptz;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'os_clients_lifecycle_check') then
    alter table public.os_clients add constraint os_clients_lifecycle_check
      check (lifecycle in ('lead', 'prospect', 'customer', 'repeat', 'lapsed', 'do_not_contact'));
  end if;
end $$;

create index if not exists os_clients_owner_idx on public.os_clients (owner_employee_id);
create index if not exists os_clients_lifecycle_idx on public.os_clients (org_id, lifecycle) where archived_at is null;

-- ===========================================================================
-- 2. PIPELINES AND STAGES — configuration, not code
-- ===========================================================================
--
-- Both workspaces read their stages from here. Adding "Awaiting Contract
-- Review" to the B2B pipeline is a row, exactly as adding a trip status is.
-- `category` is the stable thing application code branches on; the key and
-- label are the configurable thing humans see.
create table if not exists public.os_deal_stages (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  pipeline text not null check (pipeline in ('b2c', 'b2b')),
  key text not null,
  label text not null,
  description text,
  category text not null
    check (category in ('new', 'qualifying', 'proposing', 'negotiating', 'won', 'lost')),
  color text not null default '#c9a227',
  sort_order int not null default 0,
  -- The historical conversion rate this stage carries, used to weight the
  -- forecast. Configuration, so a sales lead can correct it from experience
  -- rather than arguing with a hardcoded number.
  probability_pct int not null default 0 check (probability_pct between 0 and 100),
  -- Days after which a deal sitting in this stage is considered stalled.
  stale_after_days int,
  -- What must be true before a deal may leave this stage. Read by the
  -- application and shown as named blockers, never as a silent refusal.
  requirements jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (org_id, pipeline, key)
);

create index if not exists os_deal_stages_pipeline_idx on public.os_deal_stages (org_id, pipeline, sort_order);

create table if not exists public.os_lost_reasons (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  key text not null,
  label text not null,
  -- Whether this is something Egypt Eye could have changed. The split
  -- between "price" and "travel cancelled" is the whole value of the field.
  controllable boolean not null default true,
  pipeline text check (pipeline in ('b2c', 'b2b')),
  sort_order int not null default 0,
  active boolean not null default true,
  unique (org_id, key)
);

-- ===========================================================================
-- 3. LEADS — an enquiry, before it is qualified
-- ===========================================================================
--
-- A lead deliberately does NOT require a client record. A name and a phone
-- number typed at 23:00 from a DM is a lead; forcing a full customer record
-- at that moment is how enquiries end up in a notebook instead of the
-- system. Qualifying it is what creates or matches the person.
--
-- This is NOT an inbox. The OS does not receive messages, thread them, or
-- pretend to reply on a channel. A lead records that an enquiry arrived,
-- where from, and what happened next.
create table if not exists public.os_leads (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  ref text not null,
  pipeline text not null default 'b2c' check (pipeline in ('b2c', 'b2b')),

  -- Raw contact detail as it arrived. Kept even after the lead is matched to
  -- a person, because what they typed is evidence and the client record is
  -- an interpretation of it.
  contact_name text,
  contact_email text,
  contact_phone text,
  contact_whatsapp text,
  contact_instagram text,
  company_name text,
  country text,
  language text,

  -- Resolved identity, once known. Either, both, or neither may be set.
  client_id uuid references public.os_clients (id) on delete set null,
  company_id uuid references public.os_companies (id) on delete set null,

  -- Where it came from. `source` is the channel, `campaign` the specific
  -- thing that produced it — that split is what makes attribution possible.
  source text not null default 'other',
  campaign text,
  referred_by_client_id uuid references public.os_clients (id) on delete set null,
  referred_by_company_id uuid references public.os_companies (id) on delete set null,
  landing_page text,

  -- What they actually want.
  interest text,
  trip_type_id uuid references public.os_trip_types (id) on delete set null,
  unit_id uuid references public.os_business_units (id) on delete set null,
  requested_date date,
  date_flexible boolean not null default false,
  guests int,
  budget_amount numeric(12, 2),
  budget_currency text,
  message text,

  status text not null default 'new'
    check (status in ('new', 'contacted', 'qualifying', 'qualified', 'converted', 'unqualified', 'lost', 'duplicate')),
  owner_employee_id uuid references public.os_employees (id) on delete set null,

  -- The explainable score. `score_factors` is an array of
  -- {key, label, points, detail} and score is their sum, clamped. Nothing
  -- renders the number without the list.
  score int not null default 0 check (score between 0 and 100),
  score_band text not null default 'cold' check (score_band in ('hot', 'warm', 'cool', 'cold')),
  score_factors jsonb not null default '[]'::jsonb,
  score_computed_at timestamptz,

  -- Response time is the single strongest predictor of conversion in this
  -- business, so it is a first-class measurement rather than something
  -- derived from a log nobody reads.
  received_at timestamptz not null default now(),
  first_response_at timestamptz,
  first_response_minutes int,
  qualified_at timestamptz,
  closed_at timestamptz,

  deal_id uuid,
  lost_reason_id uuid references public.os_lost_reasons (id) on delete set null,
  lost_note text,
  duplicate_of_lead_id uuid references public.os_leads (id) on delete set null,

  notes text,
  created_by uuid references public.os_employees (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  unique (org_id, ref)
);

create index if not exists os_leads_status_idx on public.os_leads (org_id, status, received_at desc) where archived_at is null;
create index if not exists os_leads_owner_idx on public.os_leads (owner_employee_id, status);
create index if not exists os_leads_client_idx on public.os_leads (client_id);
create index if not exists os_leads_company_idx on public.os_leads (company_id);
create index if not exists os_leads_email_idx on public.os_leads (org_id, lower(contact_email));

drop trigger if exists os_leads_touch on public.os_leads;
create trigger os_leads_touch before update on public.os_leads
  for each row execute function public.os_touch_updated_at();

create sequence if not exists public.os_lead_ref_seq start with 3001;

-- The scoring rules themselves are configuration, which is what makes the
-- score arguable. A sales lead who believes a referral is worth more than a
-- matching date changes the number here, and every lead is rescored against
-- the same published rules.
create table if not exists public.os_lead_score_rules (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  key text not null,
  label text not null,
  -- The sentence shown to a salesperson next to the points. If this is
  -- empty the rule does not run, because an unexplained contribution is
  -- exactly the thing this system refuses to produce.
  explanation text not null,
  points int not null,
  pipeline text check (pipeline in ('b2c', 'b2b')),
  sort_order int not null default 0,
  active boolean not null default true,
  unique (org_id, key)
);

-- ===========================================================================
-- 4. DEALS — a qualified opportunity, in either pipeline
-- ===========================================================================

create table if not exists public.os_deals (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  ref text not null,
  pipeline text not null check (pipeline in ('b2c', 'b2b')),
  title text not null,

  -- Who this is with. A B2C deal has a client; a B2B deal has a company and
  -- usually a client too — the human being negotiated with.
  client_id uuid references public.os_clients (id) on delete set null,
  company_id uuid references public.os_companies (id) on delete set null,

  stage_id uuid references public.os_deal_stages (id) on delete set null,
  status text not null default 'open' check (status in ('open', 'won', 'lost', 'abandoned')),

  -- What it is worth, and how sure we are. `probability_pct` starts from the
  -- stage and may be overridden by a person, which is recorded so the
  -- forecast can be split into "stage says" and "the owner says".
  value_amount numeric(14, 2) not null default 0,
  currency text not null default 'USD',
  probability_pct int check (probability_pct between 0 and 100),
  probability_source text not null default 'stage' check (probability_source in ('stage', 'owner')),
  expected_close_on date,

  -- What the deal is FOR, so a won deal can become the right trip.
  trip_type_id uuid references public.os_trip_types (id) on delete set null,
  unit_id uuid references public.os_business_units (id) on delete set null,
  requested_date date,
  guests int,

  owner_employee_id uuid references public.os_employees (id) on delete set null,
  source text,
  campaign text,
  lead_id uuid references public.os_leads (id) on delete set null,

  -- The outputs. A deal produces a quote; a won B2C deal produces a trip;
  -- a won B2B deal produces an agreement. All three are separate records
  -- with their own history — the deal points at them, it does not contain
  -- them.
  primary_quote_id uuid references public.os_quotes (id) on delete set null,

  won_at timestamptz,
  lost_at timestamptz,
  lost_reason_id uuid references public.os_lost_reasons (id) on delete set null,
  lost_note text,
  -- Which competitor took it, when that is known. Blank is honest; a
  -- guessed name is not.
  lost_to text,

  stage_entered_at timestamptz not null default now(),
  last_activity_at timestamptz,
  next_step text,
  next_step_due_on date,

  notes text,
  created_by uuid references public.os_employees (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  unique (org_id, ref)
);

create index if not exists os_deals_pipeline_idx on public.os_deals (org_id, pipeline, status) where archived_at is null;
create index if not exists os_deals_stage_idx on public.os_deals (stage_id, status);
create index if not exists os_deals_owner_idx on public.os_deals (owner_employee_id, status);
create index if not exists os_deals_company_idx on public.os_deals (company_id);
create index if not exists os_deals_client_idx on public.os_deals (client_id);
create index if not exists os_deals_close_idx on public.os_deals (org_id, expected_close_on) where status = 'open';

drop trigger if exists os_deals_touch on public.os_deals;
create trigger os_deals_touch before update on public.os_deals
  for each row execute function public.os_touch_updated_at();

create sequence if not exists public.os_deal_ref_seq start with 4001;

-- A deal must be with SOMEBODY, and a B2B deal must be with a company.
-- Enforced here because a pipeline of anonymous rows is a spreadsheet.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'os_deals_counterparty_check') then
    alter table public.os_deals add constraint os_deals_counterparty_check
      check (client_id is not null or company_id is not null);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'os_deals_b2b_needs_company') then
    alter table public.os_deals add constraint os_deals_b2b_needs_company
      check (pipeline <> 'b2b' or company_id is not null);
  end if;
end $$;

-- The lead's forward pointer, added now that os_deals exists.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'os_leads_deal_fk') then
    alter table public.os_leads add constraint os_leads_deal_fk
      foreign key (deal_id) references public.os_deals (id) on delete set null;
  end if;
end $$;

-- Every stage change, appended. "It has been in Negotiation for three weeks"
-- is answerable only if the moves were kept, and a pipeline whose history can
-- be rewritten cannot be used to measure anybody.
create table if not exists public.os_deal_stage_history (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.os_deals (id) on delete cascade,
  from_stage_id uuid references public.os_deal_stages (id) on delete set null,
  to_stage_id uuid references public.os_deal_stages (id) on delete set null,
  from_status text,
  to_status text,
  changed_by uuid references public.os_employees (id) on delete set null,
  note text,
  -- How long the deal sat in the stage it just left.
  days_in_previous_stage numeric(8, 2),
  changed_at timestamptz not null default now()
);

create index if not exists os_deal_stage_history_deal_idx on public.os_deal_stage_history (deal_id, changed_at desc);

-- Several quotes can be offered against one deal; the deal names the one on
-- the table. This is how "we sent them three options" survives.
create table if not exists public.os_deal_quotes (
  deal_id uuid not null references public.os_deals (id) on delete cascade,
  quote_id uuid not null references public.os_quotes (id) on delete cascade,
  label text,
  added_at timestamptz not null default now(),
  primary key (deal_id, quote_id)
);

-- Trips a deal produced. A B2B volume agreement produces many over years, so
-- this is a table and not a column.
create table if not exists public.os_deal_trips (
  deal_id uuid not null references public.os_deals (id) on delete cascade,
  trip_id uuid not null references public.os_trips (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (deal_id, trip_id)
);

-- ===========================================================================
-- 5. ENGAGEMENTS — the human record of contact
-- ===========================================================================
--
-- Deliberately NOT an inbox and not a message store. Egypt Eye answers its
-- customers on Instagram, WhatsApp and email, and those tools are better at
-- it than anything built here would be. What this records is that a
-- conversation HAPPENED: who, when, on what channel, what came of it, and
-- what was agreed. That is what a colleague picking the relationship up
-- needs, and it is all that belongs in a company system.
create table if not exists public.os_engagements (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  kind text not null default 'note'
    check (kind in ('call', 'meeting', 'email', 'message', 'site_visit', 'proposal_sent', 'note', 'task_note')),
  direction text not null default 'outbound' check (direction in ('inbound', 'outbound', 'internal')),
  channel text,

  -- What it was about. Any combination may be set: a call can be about a
  -- deal, for a company, with a person.
  lead_id uuid references public.os_leads (id) on delete cascade,
  deal_id uuid references public.os_deals (id) on delete cascade,
  client_id uuid references public.os_clients (id) on delete cascade,
  company_id uuid references public.os_companies (id) on delete cascade,
  trip_id uuid references public.os_trips (id) on delete cascade,

  subject text,
  summary text not null,
  outcome text
    check (outcome is null or outcome in ('positive', 'neutral', 'negative', 'no_answer', 'rescheduled')),
  happened_at timestamptz not null default now(),
  duration_minutes int,
  employee_id uuid references public.os_employees (id) on delete set null,
  -- Who was on the other side of it. Free text as well as ids, because the
  -- person who joined the call is often not yet a record.
  participants text,

  -- A follow-up creates a real task rather than a promise in a note.
  followup_task_id uuid references public.os_tasks (id) on delete set null,

  created_at timestamptz not null default now()
);

create index if not exists os_engagements_deal_idx on public.os_engagements (deal_id, happened_at desc);
create index if not exists os_engagements_company_idx on public.os_engagements (company_id, happened_at desc);
create index if not exists os_engagements_client_idx on public.os_engagements (client_id, happened_at desc);
create index if not exists os_engagements_lead_idx on public.os_engagements (lead_id, happened_at desc);
create index if not exists os_engagements_org_idx on public.os_engagements (org_id, happened_at desc);

-- An engagement must be ABOUT something. A note attached to nothing is a
-- note nobody will ever find again.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'os_engagements_subject_check') then
    alter table public.os_engagements add constraint os_engagements_subject_check
      check (
        lead_id is not null or deal_id is not null or client_id is not null
        or company_id is not null or trip_id is not null
      );
  end if;
end $$;

-- ===========================================================================
-- 6. AGREEMENTS — what was actually signed, and what it costs us
-- ===========================================================================

create table if not exists public.os_agreements (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  ref text not null,
  company_id uuid not null references public.os_companies (id) on delete cascade,
  deal_id uuid references public.os_deals (id) on delete set null,
  title text not null,
  kind text not null default 'commission'
    check (kind in ('commission', 'net_rate', 'volume', 'exclusive', 'referral', 'affiliate', 'mou', 'other')),
  status text not null default 'draft'
    check (status in ('draft', 'in_review', 'sent', 'active', 'expired', 'terminated', 'superseded')),

  starts_on date,
  ends_on date,
  auto_renew boolean not null default false,
  notice_days int,

  currency text not null default 'USD',
  -- A commitment the partner made, and what we owe if they meet it. Both
  -- nullable because plenty of agreements have neither.
  minimum_trips_per_year int,
  minimum_revenue_amount numeric(14, 2),

  -- The signed document lives in Drive like everything else; the OS holds
  -- the link and who verified it opens.
  document_id uuid references public.os_documents (id) on delete set null,
  signed_on date,
  signed_by_name text,
  signed_by_employee_id uuid references public.os_employees (id) on delete set null,

  -- An agreement is never edited into a new one. Replacing it creates a new
  -- row that points back here, and this one becomes 'superseded'.
  supersedes_agreement_id uuid references public.os_agreements (id) on delete set null,

  notes text,
  created_by uuid references public.os_employees (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, ref)
);

create index if not exists os_agreements_company_idx on public.os_agreements (company_id, status);
create index if not exists os_agreements_expiry_idx on public.os_agreements (org_id, ends_on) where status = 'active';

drop trigger if exists os_agreements_touch on public.os_agreements;
create trigger os_agreements_touch before update on public.os_agreements
  for each row execute function public.os_touch_updated_at();

create sequence if not exists public.os_agreement_ref_seq start with 201;

-- ---------------------------------------------------------------------------
-- The numbers, effective-dated and superseded — never updated in place.
-- ---------------------------------------------------------------------------
-- Exactly the pattern os_rates uses for the price book, and for the same
-- reason: a trip that ran in March must always be able to say which
-- commission was in force in March, however many times the deal has been
-- renegotiated since.
create table if not exists public.os_agreement_terms (
  id uuid primary key default gen_random_uuid(),
  agreement_id uuid not null references public.os_agreements (id) on delete cascade,
  -- What the term applies to. Null trip_type_id means every service.
  trip_type_id uuid references public.os_trip_types (id) on delete set null,
  tier text check (tier in ('standard', 'premium', 'luxury', 'vip')),

  basis text not null default 'commission_pct'
    check (basis in ('commission_pct', 'net_rate', 'markup_pct', 'fixed_fee', 'per_person')),
  commission_pct numeric(5, 2),
  net_amount numeric(12, 2),
  markup_pct numeric(5, 2),
  fixed_amount numeric(12, 2),
  currency text not null default 'USD',

  min_guests int,
  max_guests int,

  effective_from date not null,
  effective_to date,
  -- The term this one replaced. Superseding closes the old window and
  -- inserts a new row; nothing is ever overwritten.
  supersedes_term_id uuid references public.os_agreement_terms (id) on delete set null,
  note text,
  created_by uuid references public.os_employees (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists os_agreement_terms_lookup_idx
  on public.os_agreement_terms (agreement_id, effective_from desc);

-- Two terms cannot cover the same service, tier and party size on the same
-- day. Without this, "what commission applies" has two answers and finance
-- and sales each pick a different one.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'os_agreement_terms_no_overlap') then
    alter table public.os_agreement_terms
      add constraint os_agreement_terms_no_overlap
      exclude using gist (
        agreement_id with =,
        coalesce(trip_type_id, '00000000-0000-0000-0000-000000000000'::uuid) with =,
        coalesce(tier, '*') with =,
        daterange(effective_from, effective_to, '[]') with &&
      );
  end if;
end $$;

-- ===========================================================================
-- 7. LINKING THE COMMERCIAL LAYER TO THE OPERATION
-- ===========================================================================
--
-- These columns are the whole point of building this inside the OS rather
-- than beside it: a trip knows which deal produced it, which agency owns the
-- commercial relationship, and which agreement's terms priced it — so the
-- margin report can answer "what does the Blue Nile relationship actually
-- earn us" without anybody reconciling two systems by hand.
alter table public.os_trips add column if not exists deal_id uuid references public.os_deals (id) on delete set null;
alter table public.os_trips add column if not exists company_id uuid references public.os_companies (id) on delete set null;
alter table public.os_trips add column if not exists agreement_id uuid references public.os_agreements (id) on delete set null;
alter table public.os_trips add column if not exists booked_by_client_id uuid references public.os_clients (id) on delete set null;
alter table public.os_trips add column if not exists commission_pct numeric(5, 2);
alter table public.os_trips add column if not exists commission_amount numeric(12, 2);

create index if not exists os_trips_deal_idx on public.os_trips (deal_id);
create index if not exists os_trips_company_idx on public.os_trips (company_id);

alter table public.os_quotes add column if not exists deal_id uuid references public.os_deals (id) on delete set null;
alter table public.os_quotes add column if not exists company_id uuid references public.os_companies (id) on delete set null;
alter table public.os_quotes add column if not exists agreement_id uuid references public.os_agreements (id) on delete set null;
alter table public.os_quotes add column if not exists valid_until date;
alter table public.os_quotes add column if not exists sent_at timestamptz;
alter table public.os_quotes add column if not exists decided_at timestamptz;

create index if not exists os_quotes_deal_idx on public.os_quotes (deal_id);

-- Follow-ups are TASKS. There is one task system in this company, and a
-- salesperson's "call them Thursday" belongs on the same list as everything
-- else they owe.
alter table public.os_tasks add column if not exists lead_id uuid references public.os_leads (id) on delete cascade;
alter table public.os_tasks add column if not exists deal_id uuid references public.os_deals (id) on delete cascade;
alter table public.os_tasks add column if not exists company_id uuid references public.os_companies (id) on delete cascade;

create index if not exists os_tasks_deal_idx on public.os_tasks (deal_id, status);
create index if not exists os_tasks_lead_idx on public.os_tasks (lead_id, status);

do $$
begin
  alter table public.os_tasks drop constraint if exists os_tasks_entity_type_check;
exception when others then null;
end $$;

do $$
declare
  c text;
begin
  select conname into c from pg_constraint
  where conrelid = 'public.os_tasks'::regclass and contype = 'c'
    and pg_get_constraintdef(oid) like '%entity_type%';
  if c is not null then execute format('alter table public.os_tasks drop constraint %I', c); end if;
  alter table public.os_tasks add constraint os_tasks_entity_type_check
    check (entity_type in ('trip', 'client', 'employee', 'supplier', 'project', 'resource', 'incident', 'lead', 'deal', 'company', 'agreement', 'general'));
end $$;

-- Approvals reach commercial records too — a discount is the most common
-- thing anybody needs permission for.
alter table public.os_approvals add column if not exists deal_id uuid references public.os_deals (id) on delete set null;
alter table public.os_approvals add column if not exists quote_id uuid references public.os_quotes (id) on delete set null;
alter table public.os_approvals add column if not exists agreement_id uuid references public.os_agreements (id) on delete set null;

create index if not exists os_approvals_deal_idx on public.os_approvals (deal_id);

-- ===========================================================================
-- 8. ATTRIBUTION — where revenue actually came from
-- ===========================================================================
--
-- Written once when a trip completes, from what was true at the time. It is
-- a snapshot rather than a view because the source of a booking two years
-- ago must not change when somebody edits a client record today.
create table if not exists public.os_revenue_attribution (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  trip_id uuid not null references public.os_trips (id) on delete cascade,
  deal_id uuid references public.os_deals (id) on delete set null,
  lead_id uuid references public.os_leads (id) on delete set null,
  client_id uuid references public.os_clients (id) on delete set null,
  company_id uuid references public.os_companies (id) on delete set null,
  channel text,
  campaign text,
  referred_by_client_id uuid references public.os_clients (id) on delete set null,
  referred_by_company_id uuid references public.os_companies (id) on delete set null,
  owner_employee_id uuid references public.os_employees (id) on delete set null,
  revenue_amount numeric(14, 2) not null default 0,
  commission_amount numeric(12, 2) not null default 0,
  currency text not null default 'USD',
  recognised_on date not null,
  created_at timestamptz not null default now(),
  unique (trip_id)
);

create index if not exists os_revenue_attribution_org_idx on public.os_revenue_attribution (org_id, recognised_on);
create index if not exists os_revenue_attribution_company_idx on public.os_revenue_attribution (company_id, recognised_on);

-- ===========================================================================
-- 9. PROMOTING EXISTING AGENCY CLIENTS INTO COMPANIES
-- ===========================================================================
--
-- Before this migration, a travel agency was an os_clients row with
-- kind = 'agency'. That row is NOT deleted and NOT emptied — every trip,
-- quote and payment still points at it. What happens instead: a company is
-- created carrying the commercial half of the relationship, the person keeps
-- the human half, and os_client_companies joins them. Running this twice
-- changes nothing.
insert into public.os_companies (
  org_id, code, name, legal_name, kind, status, website, email, phone, whatsapp,
  country, city, default_commission_pct, default_payment_terms, source, notes, created_by, created_at
)
select
  c.org_id,
  -- Taken from the same sequence the application uses, so a code allocated
  -- here can never collide with one allocated by a person later.
  'CO-' || lpad(nextval('public.os_company_code_seq')::text, 4, '0'),
  coalesce(nullif(c.company_name, ''), c.full_name),
  nullif(c.company_name, ''),
  'travel_agency',
  'active',
  c.website, c.email, c.phone, c.whatsapp,
  c.country, c.city,
  c.commission_pct, c.payment_terms,
  c.source,
  'Promoted from the client record ' || c.code || ' when the commercial layer was added. '
    || 'That record still holds the person and every trip they booked.',
  c.created_by, c.created_at
from public.os_clients c
where c.kind = 'agency'
  and c.archived_at is null
  and not exists (
    select 1 from public.os_companies co
    where co.org_id = c.org_id
      and lower(co.name) = lower(coalesce(nullif(c.company_name, ''), c.full_name))
  );

insert into public.os_client_companies (client_id, company_id, job_title, decision_role, is_primary, work_email, work_phone, notes)
select c.id, co.id, 'Main contact', 'decision_maker', true, c.email, c.phone,
       'Linked automatically when the agency record was promoted to a company.'
from public.os_clients c
join public.os_companies co
  on co.org_id = c.org_id
 and lower(co.name) = lower(coalesce(nullif(c.company_name, ''), c.full_name))
where c.kind = 'agency'
  and c.archived_at is null
  and not exists (
    select 1 from public.os_client_companies cc where cc.client_id = c.id and cc.company_id = co.id
  );

-- Trips booked through a promoted agency now carry the company, so B2B
-- revenue is attributable without anybody re-keying it.
update public.os_trips t
set company_id = cc.company_id
from public.os_client_companies cc
join public.os_clients c on c.id = cc.client_id
where t.client_id = c.id
  and c.kind = 'agency'
  and t.company_id is null;

-- ===========================================================================
-- 10. HELPER FUNCTIONS
-- ===========================================================================

create or replace function public.nextval_os_lead_ref()
returns text language sql as $$
  select 'LD-' || lpad(nextval('public.os_lead_ref_seq')::text, 5, '0');
$$;

create or replace function public.nextval_os_deal_ref()
returns text language sql as $$
  select 'DL-' || lpad(nextval('public.os_deal_ref_seq')::text, 5, '0');
$$;

create or replace function public.nextval_os_agreement_ref()
returns text language sql as $$
  select 'AG-' || lpad(nextval('public.os_agreement_ref_seq')::text, 4, '0');
$$;

create or replace function public.nextval_os_company_code()
returns text language sql as $$
  select 'CO-' || lpad(nextval('public.os_company_code_seq')::text, 4, '0');
$$;

revoke execute on function public.nextval_os_lead_ref() from anon, authenticated;
revoke execute on function public.nextval_os_deal_ref() from anon, authenticated;
revoke execute on function public.nextval_os_agreement_ref() from anon, authenticated;
revoke execute on function public.nextval_os_company_code() from anon, authenticated;

-- ===========================================================================
-- 11. SECURITY — same lockdown as every other os_ table
-- ===========================================================================
do $$
declare
  t text;
begin
  for t in
    select tablename from pg_tables
    where schemaname = 'public'
      and tablename in (
        'os_companies', 'os_client_companies', 'os_deal_stages', 'os_lost_reasons',
        'os_leads', 'os_lead_score_rules', 'os_deals', 'os_deal_stage_history',
        'os_deal_quotes', 'os_deal_trips', 'os_engagements', 'os_agreements',
        'os_agreement_terms', 'os_revenue_attribution'
      )
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
  end loop;
end $$;

-- Append-only, like every other record of what happened.
revoke update, delete on public.os_deal_stage_history from service_role;
revoke update, delete on public.os_engagements from service_role;
revoke update, delete on public.os_agreement_terms from service_role;
revoke update, delete on public.os_revenue_attribution from service_role;
