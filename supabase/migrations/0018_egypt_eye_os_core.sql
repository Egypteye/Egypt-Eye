-- ===========================================================================
-- EGYPT EYE OS — core schema
-- ===========================================================================
--
-- This migration adds the internal operating system that runs Egypt Eye
-- AFTER the reservation desk closes a deal. It is deliberately separate
-- from the public website's tables (profiles / reservations / journeys /
-- discount_codes / hotels ...), which stay exactly as they are: the OS is a
-- second application sharing one Supabase project and, crucially, ONE
-- identity provider (auth.users), so a person signs in once and reaches
-- whichever surface their permissions allow.
--
-- Every OS table is prefixed `os_` so the two worlds never collide.
--
-- ---------------------------------------------------------------------------
-- SECURITY MODEL (read this before adding a table)
-- ---------------------------------------------------------------------------
-- Row Level Security is enabled on every `os_` table and NO client-facing
-- policy is ever created for them. That means the browser's anon key can
-- read and write exactly nothing here, no matter what a crafted request
-- asks for. All OS access goes through server-only code in `src/lib/os/*`
-- using the service-role key, and that code resolves the acting employee,
-- checks a permission, and applies a scope filter (all / unit / own) before
-- it touches a row.
--
-- Why not express the whole permission matrix in RLS? Because the required
-- model is permission x scope x business-unit x record-ownership, which in
-- RLS becomes dozens of interdependent policies that are very hard to read
-- and even harder to prove correct. A single, auditable TypeScript layer
-- that is the ONLY thing holding a service-role key is easier to reason
-- about and to test. The deny-all RLS underneath is the backstop: if that
-- layer is ever bypassed, the anon key still gets nothing.
--
-- This mirrors the pattern this repo already uses for newsletter_subscribers
-- and discount_campaigns (RLS on, no policies, server routes only).
--
-- ---------------------------------------------------------------------------
-- HISTORY MODEL
-- ---------------------------------------------------------------------------
-- Nothing operational is ever destroyed:
--   * archived_at instead of DELETE on every record type that matters.
--   * Rates are effective-dated (valid_from / valid_to). Changing a supplier
--     price inserts a NEW rate row; the old one keeps its dates, so a trip
--     costed in January still resolves January's price forever.
--   * Trip cost lines snapshot the amount AND the rate id they came from, so
--     a historical trip's economics never move when a price list changes.
--   * os_audit_log has no UPDATE/DELETE grant for any role but the owner.
--
-- Safe to re-run: every statement is IF NOT EXISTS / CREATE OR REPLACE.
-- ===========================================================================

create extension if not exists "pgcrypto";
-- btree_gist lets an exclusion constraint mix equality (employee_id) with
-- range overlap (&&) in one index — that is what makes double-booking a
-- confirmed person or vehicle physically impossible, not merely discouraged.
create extension if not exists "btree_gist";

-- ---------------------------------------------------------------------------
-- Shared helper: keep updated_at honest without trusting the caller.
-- ---------------------------------------------------------------------------
create or replace function public.os_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ===========================================================================
-- 1. ORGANIZATION
-- ===========================================================================

-- One row per company/brand. Egypt Eye is the only tenant today, but every
-- operational table carries org_id so a second brand (or a subsidiary) can
-- be added later without a migration that rewrites the world. The app pins
-- itself to the single active org and never exposes a tenant switcher yet —
-- architecture now, UI when it is actually needed.
create table if not exists public.os_orgs (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  legal_name text,
  base_currency text not null default 'USD',
  timezone text not null default 'Africa/Cairo',
  logo_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Business/service units inside the org — Tours, Photoshoots, Flying Dresses,
-- Experiences, Transfers, Group Trips, Content Production. These are NOT
-- separate apps: a unit is an attribute of a trip and a scoping boundary for
-- permissions, nothing more. Everything (clients, staff, vehicles, dresses,
-- suppliers, knowledge) is shared across all of them.
create table if not exists public.os_business_units (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  key text not null,
  name text not null,
  description text,
  color text not null default '#c9a227',
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (org_id, key)
);

-- ===========================================================================
-- 2. PEOPLE, ROLES, PERMISSIONS
-- ===========================================================================

-- An Employee is the operational identity: the person who drives, guides,
-- shoots, coordinates. It is deliberately decoupled from auth.users, because
-- plenty of real crew (a freelance driver, a partner photographer) need to
-- appear on a schedule long before — or without ever — having a login.
-- Linking user_id later turns the same record into a user; no duplicate
-- person is created.
create table if not exists public.os_employees (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  user_id uuid unique references auth.users (id) on delete set null,
  code text not null,
  full_name text not null,
  display_name text,
  email text,
  phone text,
  whatsapp text,
  job_title text,
  department text,
  employment_type text not null default 'staff'
    check (employment_type in ('staff', 'freelance', 'partner', 'contractor', 'intern')),
  status text not null default 'active'
    check (status in ('active', 'inactive', 'suspended', 'on_leave', 'left')),
  primary_unit_id uuid references public.os_business_units (id) on delete set null,
  -- Capability metadata that smart/AI assignment reads: what this person can
  -- actually do, what they speak, where they start their day.
  skills text[] not null default '{}',
  languages text[] not null default '{}',
  home_city text,
  can_drive boolean not null default false,
  -- Default cost of putting this person on a trip. The trip's cost line
  -- snapshots the number at assignment time; changing this never rewrites
  -- history.
  day_rate_amount numeric(12, 2),
  day_rate_currency text not null default 'USD',
  avatar_url text,
  emergency_contact text,
  hired_on date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  unique (org_id, code)
);

create index if not exists os_employees_org_status_idx on public.os_employees (org_id, status) where archived_at is null;
create index if not exists os_employees_user_idx on public.os_employees (user_id);

drop trigger if exists os_employees_touch on public.os_employees;
create trigger os_employees_touch before update on public.os_employees
  for each row execute function public.os_touch_updated_at();

-- The permission catalog. Rows here are the vocabulary of the whole system —
-- application code never invents a permission string at runtime, it always
-- refers to a key that exists in this table, which is what makes the Admin
-- Center able to render a complete, always-current permission matrix.
create table if not exists public.os_permissions (
  key text primary key,
  module text not null,
  action text not null,
  label text not null,
  description text,
  -- Permissions that expose money or personal data are flagged so the Admin
  -- Center can warn before granting them, and so the AI layer can refuse to
  -- surface the underlying data to an actor who lacks them.
  sensitive boolean not null default false,
  -- Whether a scope narrower than 'all' is meaningful for this permission.
  -- "View trips" is scopeable (all / my unit / only mine); "Configure system
  -- settings" is not — you either can or you cannot.
  scopeable boolean not null default true,
  sort_order int not null default 0
);

create table if not exists public.os_roles (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  key text not null,
  name text not null,
  description text,
  -- System roles ship with the product and cannot be deleted (they can still
  -- have their permissions edited, except for the owner role). Custom roles
  -- created by an administrator are fully editable — the spec's "admins must
  -- be able to create custom roles" requirement.
  is_system boolean not null default false,
  -- Rank orders roles for display and for "can this actor manage that actor"
  -- checks: you may never grant a role ranked above your own.
  rank int not null default 100,
  color text not null default '#5c7a5f',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  unique (org_id, key)
);

drop trigger if exists os_roles_touch on public.os_roles;
create trigger os_roles_touch before update on public.os_roles
  for each row execute function public.os_touch_updated_at();

-- ROLE x PERMISSION x SCOPE. Scope is the third dimension that turns basic
-- RBAC into something an operations business can actually use:
--   all  — every record in the organization
--   unit — records belonging to a business unit the actor is a member of
--   own  — only records the actor is assigned to, owns, or created
-- Absence of a row means no access at all.
create table if not exists public.os_role_permissions (
  role_id uuid not null references public.os_roles (id) on delete cascade,
  permission_key text not null references public.os_permissions (key) on delete cascade,
  scope text not null default 'all' check (scope in ('all', 'unit', 'own')),
  primary key (role_id, permission_key)
);

-- A person can hold several roles, and a role can be granted only within one
-- business unit (e.g. "Operations Manager, but only for Photoshoots").
create table if not exists public.os_employee_roles (
  employee_id uuid not null references public.os_employees (id) on delete cascade,
  role_id uuid not null references public.os_roles (id) on delete cascade,
  unit_id uuid references public.os_business_units (id) on delete cascade,
  granted_by uuid references public.os_employees (id) on delete set null,
  granted_at timestamptz not null default now(),
  primary key (employee_id, role_id)
);

-- Per-person exceptions layered on top of roles, for the cases every real
-- company hits: "the senior photographer may also see supplier costs", or
-- "revoke exports from this one account while we investigate".
-- granted=false always wins over any role grant.
create table if not exists public.os_permission_overrides (
  employee_id uuid not null references public.os_employees (id) on delete cascade,
  permission_key text not null references public.os_permissions (key) on delete cascade,
  scope text not null default 'all' check (scope in ('all', 'unit', 'own')),
  granted boolean not null default true,
  reason text,
  granted_by uuid references public.os_employees (id) on delete set null,
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  primary key (employee_id, permission_key)
);

-- Which units a person belongs to, for scope='unit' resolution. An employee
-- with no membership row falls back to primary_unit_id.
create table if not exists public.os_employee_units (
  employee_id uuid not null references public.os_employees (id) on delete cascade,
  unit_id uuid not null references public.os_business_units (id) on delete cascade,
  primary key (employee_id, unit_id)
);

-- Sign-in visibility. Supabase Auth owns credentials, sessions, refresh
-- tokens, email verification and password reset — we never store or verify a
-- password ourselves. What Auth does not give us is an operational answer to
-- "who signed in, from what, and when", so we record that here on each OS
-- sign-in and surface it under Admin -> Users and My Account -> Devices.
create table if not exists public.os_login_events (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references public.os_employees (id) on delete set null,
  user_id uuid references auth.users (id) on delete cascade,
  email text,
  kind text not null default 'sign_in' check (kind in ('sign_in', 'sign_out', 'sign_out_all', 'denied')),
  ip text,
  user_agent text,
  at timestamptz not null default now()
);

create index if not exists os_login_events_user_idx on public.os_login_events (user_id, at desc);

-- ===========================================================================
-- 3. CLIENTS AND TRAVELLERS
-- ===========================================================================

-- One permanent record per customer. A returning guest is matched to their
-- existing row (see src/lib/os/clients.ts), never duplicated, which is what
-- makes the six-months-later rebooking scenario keep its whole history.
-- `kind` carries B2C travellers and B2B agencies in one table because they
-- share almost every field and every relationship; the handful of agency-only
-- fields live below and stay null for individuals.
create table if not exists public.os_clients (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  code text not null,
  kind text not null default 'individual' check (kind in ('individual', 'agency')),
  full_name text not null,
  company_name text,
  email text,
  phone text,
  whatsapp text,
  nationality text,
  country text,
  city text,
  language text,
  gender text,
  date_of_birth date,
  instagram text,
  tiktok text,
  facebook text,
  youtube text,
  website text,
  other_links jsonb not null default '[]'::jsonb,
  -- Where this relationship came from. Powers the "which channels bring the
  -- highest-value clients" analytics without a separate attribution table.
  source text,
  vip boolean not null default false,
  -- B2B only
  commission_pct numeric(5, 2),
  payment_terms text,
  preferences text,
  dietary_notes text,
  notes text,
  first_trip_on date,
  last_trip_on date,
  created_by uuid references public.os_employees (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  unique (org_id, code)
);

create index if not exists os_clients_org_name_idx on public.os_clients (org_id, full_name);
create index if not exists os_clients_email_idx on public.os_clients (org_id, lower(email));

drop trigger if exists os_clients_touch on public.os_clients;
create trigger os_clients_touch before update on public.os_clients
  for each row execute function public.os_touch_updated_at();

-- Everyone who actually travels. Kept separate from os_clients because the
-- person who books is frequently not the whole party, and because a
-- traveller (a spouse, a child) recurs across trips and should not be
-- retyped each time.
create table if not exists public.os_travelers (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  client_id uuid references public.os_clients (id) on delete cascade,
  full_name text not null,
  relationship text,
  age_category text not null default 'adult'
    check (age_category in ('adult', 'child', 'infant', 'senior')),
  date_of_birth date,
  nationality text,
  passport_reference text,
  phone text,
  email text,
  dietary_notes text,
  special_requirements text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create index if not exists os_travelers_client_idx on public.os_travelers (client_id);

-- ===========================================================================
-- 4. LOCATIONS
-- ===========================================================================

create table if not exists public.os_locations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  name text not null,
  city text,
  region text,
  kind text not null default 'site'
    check (kind in ('site', 'hotel', 'airport', 'restaurant', 'office', 'meeting_point', 'studio', 'other')),
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  -- Operational intelligence that normally lives in one veteran's head:
  -- where the van can actually park, which gate the permit covers, how long
  -- the drive really takes at 6am. This is the "no single point of failure"
  -- requirement made concrete.
  access_notes text,
  permit_notes text,
  ticket_notes text,
  best_time_notes text,
  typical_drive_minutes int,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists os_locations_org_idx on public.os_locations (org_id, name);

-- ===========================================================================
-- 5. TRIP TYPES, STATUSES, TEMPLATES
-- ===========================================================================

-- Trip statuses live in a table rather than a CHECK constraint so an
-- administrator can add one ("Awaiting Permit") without a developer, which
-- the spec explicitly asks for. `category` is the stable thing code branches
-- on; the key/label are the configurable thing humans see.
create table if not exists public.os_trip_statuses (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  key text not null,
  label text not null,
  category text not null default 'active'
    check (category in ('draft', 'planning', 'ready', 'active', 'post', 'closed', 'cancelled')),
  color text not null default '#5c7a5f',
  sort_order int not null default 0,
  -- A status that may only be entered once the readiness gate passes.
  requires_readiness boolean not null default false,
  is_terminal boolean not null default false,
  active boolean not null default true,
  unique (org_id, key)
);

create table if not exists public.os_trip_types (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  unit_id uuid references public.os_business_units (id) on delete set null,
  key text not null,
  name text not null,
  description text,
  color text not null default '#c9a227',
  default_duration_minutes int not null default 240,
  -- The readiness contract for this kind of trip, e.g.
  --   {"driver":true,"photographer":true,"dress":true,"vehicle":true,
  --    "guide":false,"tickets":true,"supplier_confirmation":false,
  --    "media_folder":true}
  -- The readiness engine (src/lib/os/readiness.ts) reads this instead of
  -- hard-coding "a photoshoot needs a dress", so adding a service later is a
  -- configuration change, not a code change.
  requirements jsonb not null default '{}'::jsonb,
  default_task_template_id uuid,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, key)
);

-- ===========================================================================
-- 6. TRIPS — the central operational object
-- ===========================================================================

create table if not exists public.os_trips (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  ref text not null,
  title text not null,
  trip_type_id uuid references public.os_trip_types (id) on delete set null,
  unit_id uuid references public.os_business_units (id) on delete set null,
  client_id uuid references public.os_clients (id) on delete set null,
  status text not null default 'draft',
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'critical')),

  trip_date date not null,
  start_time time,
  end_time time,
  duration_minutes int,
  -- Denormalised absolute instants, maintained by a trigger from
  -- trip_date + start/end time. They exist so overlap detection, calendars
  -- and the conflict exclusion constraints can all work on one comparable
  -- value instead of re-deriving it in five places.
  starts_at timestamptz,
  ends_at timestamptz,

  location_id uuid references public.os_locations (id) on delete set null,
  pickup_location text,
  pickup_time time,
  dropoff_location text,

  guests_adults int not null default 0,
  guests_children int not null default 0,

  source text,
  currency text not null default 'USD',
  sell_amount numeric(12, 2) not null default 0,
  -- Cached rollups of os_trip_cost_lines, refreshed by trigger so trip lists
  -- and dashboards never have to aggregate at read time.
  estimated_cost_amount numeric(12, 2) not null default 0,
  actual_cost_amount numeric(12, 2) not null default 0,
  deposit_amount numeric(12, 2) not null default 0,
  paid_amount numeric(12, 2) not null default 0,

  -- Cached readiness, recomputed on every mutation that could change it.
  readiness_score int not null default 0,
  readiness_state text not null default 'red' check (readiness_state in ('green', 'yellow', 'red')),
  readiness_blockers jsonb not null default '[]'::jsonb,
  readiness_checked_at timestamptz,

  special_requests text,
  notes_internal text,
  notes_client text,
  emergency_notes text,

  template_id uuid,
  quote_id uuid,
  created_by uuid references public.os_employees (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  confirmed_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  cancel_reason text,
  archived_at timestamptz,
  unique (org_id, ref)
);

create index if not exists os_trips_date_idx on public.os_trips (org_id, trip_date) where archived_at is null;
create index if not exists os_trips_status_idx on public.os_trips (org_id, status) where archived_at is null;
create index if not exists os_trips_client_idx on public.os_trips (client_id);
create index if not exists os_trips_unit_idx on public.os_trips (unit_id, trip_date);
create index if not exists os_trips_starts_idx on public.os_trips (starts_at);

-- Keep starts_at / ends_at in sync with the date + time fields humans edit.
-- Times are interpreted in the organization's timezone (Africa/Cairo) rather
-- than UTC or the server's locale, because an operations day is a local day.
create or replace function public.os_trips_sync_instants()
returns trigger
language plpgsql
as $$
declare
  tz text;
begin
  select o.timezone into tz from public.os_orgs o where o.id = new.org_id;
  tz := coalesce(tz, 'Africa/Cairo');

  if new.start_time is not null then
    new.starts_at := ((new.trip_date + new.start_time) at time zone tz);
  else
    new.starts_at := ((new.trip_date + time '00:00') at time zone tz);
  end if;

  if new.end_time is not null then
    -- An end time earlier than the start means the trip runs past midnight.
    if new.end_time <= coalesce(new.start_time, time '00:00') then
      new.ends_at := (((new.trip_date + 1) + new.end_time) at time zone tz);
    else
      new.ends_at := ((new.trip_date + new.end_time) at time zone tz);
    end if;
  elsif new.duration_minutes is not null then
    new.ends_at := new.starts_at + make_interval(mins => new.duration_minutes);
  else
    new.ends_at := ((new.trip_date + time '23:59') at time zone tz);
  end if;

  if new.duration_minutes is null and new.starts_at is not null and new.ends_at is not null then
    new.duration_minutes := greatest(0, (extract(epoch from (new.ends_at - new.starts_at)) / 60)::int);
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists os_trips_sync on public.os_trips;
create trigger os_trips_sync before insert or update on public.os_trips
  for each row execute function public.os_trips_sync_instants();

-- Human-readable trip references (EE-10482). A sequence guarantees they are
-- unique under concurrency, which a max()+1 read would not.
create sequence if not exists public.os_trip_ref_seq start with 10001;

create table if not exists public.os_trip_status_history (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.os_trips (id) on delete cascade,
  from_status text,
  to_status text not null,
  employee_id uuid references public.os_employees (id) on delete set null,
  note text,
  readiness_score int,
  at timestamptz not null default now()
);

create index if not exists os_trip_status_history_trip_idx on public.os_trip_status_history (trip_id, at desc);

-- The travel party for one trip. A traveller row is reused across trips;
-- this join carries the per-trip facts (who led this one, who cancelled).
create table if not exists public.os_trip_travelers (
  trip_id uuid not null references public.os_trips (id) on delete cascade,
  traveler_id uuid not null references public.os_travelers (id) on delete cascade,
  is_lead boolean not null default false,
  attended boolean,
  notes text,
  primary key (trip_id, traveler_id)
);

create table if not exists public.os_itinerary_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.os_trips (id) on delete cascade,
  seq int not null default 0,
  start_time time,
  end_time time,
  title text not null,
  description text,
  location_id uuid references public.os_locations (id) on delete set null,
  location_text text,
  kind text not null default 'activity'
    check (kind in ('pickup', 'drive', 'activity', 'shoot', 'meal', 'ticket', 'free_time', 'dropoff', 'other')),
  duration_minutes int,
  created_at timestamptz not null default now()
);

create index if not exists os_itinerary_trip_idx on public.os_itinerary_items (trip_id, seq);

-- Reusable trip blueprints: an itinerary skeleton plus the task template and
-- default costing that a service normally carries.
create table if not exists public.os_trip_templates (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  trip_type_id uuid references public.os_trip_types (id) on delete set null,
  unit_id uuid references public.os_business_units (id) on delete set null,
  key text not null,
  name text not null,
  description text,
  default_duration_minutes int,
  default_location_id uuid references public.os_locations (id) on delete set null,
  itinerary jsonb not null default '[]'::jsonb,
  default_task_template_id uuid,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, key)
);

-- ===========================================================================
-- 7. RESOURCES — vehicles, dresses, equipment, venues
-- ===========================================================================
--
-- People are NOT duplicated here. An employee is already a schedulable
-- resource via os_employees; os_resources covers the physical things. Both
-- are booked through the same os_trip_assignments table below, which is what
-- lets one conflict engine cover "this photographer is double-booked" and
-- "this dress is double-booked" without two parallel implementations.
create table if not exists public.os_resources (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  kind text not null check (kind in ('vehicle', 'dress', 'equipment', 'venue', 'prop', 'other')),
  code text not null,
  name text not null,
  description text,
  unit_id uuid references public.os_business_units (id) on delete set null,
  status text not null default 'available'
    check (status in ('available', 'in_use', 'maintenance', 'cleaning', 'reserved', 'retired')),
  condition text not null default 'good'
    check (condition in ('excellent', 'good', 'fair', 'needs_repair', 'damaged')),

  -- Vehicle-shaped fields
  capacity int,
  model text,
  plate text,
  year int,
  -- Dress-shaped fields
  color text,
  size text,
  -- Equipment-shaped fields
  serial_number text,
  assigned_employee_id uuid references public.os_employees (id) on delete set null,

  home_base text,
  current_location text,
  photo_url text,
  -- Anything kind-specific that does not deserve a column of its own
  -- (fuel policy, lens mount, train length). Kept as jsonb so adding a new
  -- resource kind never needs a migration.
  attributes jsonb not null default '{}'::jsonb,

  cost_rate_amount numeric(12, 2),
  cost_rate_currency text not null default 'USD',
  cost_rate_unit text not null default 'per_trip'
    check (cost_rate_unit in ('per_trip', 'per_day', 'per_hour', 'per_km')),

  purchased_on date,
  insurance_expires_on date,
  license_expires_on date,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  unique (org_id, code)
);

create index if not exists os_resources_kind_idx on public.os_resources (org_id, kind, status) where archived_at is null;

drop trigger if exists os_resources_touch on public.os_resources;
create trigger os_resources_touch before update on public.os_resources
  for each row execute function public.os_touch_updated_at();

create table if not exists public.os_resource_maintenance (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references public.os_resources (id) on delete cascade,
  kind text not null default 'service'
    check (kind in ('service', 'repair', 'cleaning', 'inspection', 'insurance', 'license', 'other')),
  title text not null,
  due_on date,
  completed_on date,
  cost_amount numeric(12, 2),
  cost_currency text not null default 'EGP',
  supplier_id uuid,
  notes text,
  created_by uuid references public.os_employees (id) on delete set null,
  created_at timestamptz not null default now()
);

-- One table for every reason a person or a thing is unavailable: annual
-- leave, sick days, a van in the workshop, a dress at the dry cleaner. The
-- availability engine reads exactly one place instead of three.
create table if not exists public.os_unavailability (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  employee_id uuid references public.os_employees (id) on delete cascade,
  resource_id uuid references public.os_resources (id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text not null default 'unavailable'
    check (reason in ('leave', 'sick', 'holiday', 'maintenance', 'cleaning', 'training', 'blocked', 'unavailable')),
  note text,
  approved_by uuid references public.os_employees (id) on delete set null,
  created_by uuid references public.os_employees (id) on delete set null,
  created_at timestamptz not null default now(),
  -- Exactly one subject, never both, never neither.
  constraint os_unavailability_subject check (
    (employee_id is not null and resource_id is null)
    or (employee_id is null and resource_id is not null)
  ),
  constraint os_unavailability_window check (ends_at > starts_at)
);

create index if not exists os_unavailability_emp_idx on public.os_unavailability (employee_id, starts_at, ends_at);
create index if not exists os_unavailability_res_idx on public.os_unavailability (resource_id, starts_at, ends_at);

-- ===========================================================================
-- 8. ASSIGNMENTS — one table for crew and kit, with real double-booking
--    prevention enforced by the database
-- ===========================================================================

create table if not exists public.os_trip_assignments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  trip_id uuid not null references public.os_trips (id) on delete cascade,
  role_key text not null
    check (role_key in ('guide', 'driver', 'photographer', 'videographer', 'coordinator',
                        'representative', 'editor', 'assistant', 'vehicle', 'dress',
                        'equipment', 'venue', 'other')),
  employee_id uuid references public.os_employees (id) on delete cascade,
  resource_id uuid references public.os_resources (id) on delete cascade,
  status text not null default 'assigned'
    check (status in ('proposed', 'assigned', 'confirmed', 'declined', 'released', 'replaced')),

  -- Copied from the trip on write (see trigger) so the exclusion constraints
  -- below have a range to compare, and so a released assignment keeps the
  -- window it actually occupied even if the trip is later rescheduled.
  starts_at timestamptz,
  ends_at timestamptz,

  -- Cost snapshot at assignment time. Changing a person's day rate next
  -- month must never rewrite what last month's trip cost.
  rate_amount numeric(12, 2),
  rate_currency text not null default 'USD',

  -- Field status: what the crew member reported from their phone.
  field_status text
    check (field_status in ('on_my_way', 'arrived', 'started', 'completed', 'issue')),
  field_status_at timestamptz,

  notes text,
  -- Set when an operations lead knowingly overrides a soft conflict. Never
  -- silent: the reason is required by the server action and lands in the
  -- audit log alongside this row.
  override_reason text,
  assigned_by uuid references public.os_employees (id) on delete set null,
  assigned_at timestamptz not null default now(),
  responded_at timestamptz,
  released_at timestamptz,
  constraint os_assignment_subject check (
    (employee_id is not null and resource_id is null)
    or (employee_id is null and resource_id is not null)
  )
);

create index if not exists os_assign_trip_idx on public.os_trip_assignments (trip_id);
create index if not exists os_assign_emp_idx on public.os_trip_assignments (employee_id, starts_at);
create index if not exists os_assign_res_idx on public.os_trip_assignments (resource_id, starts_at);

-- Mirror the trip's window onto the assignment.
create or replace function public.os_assignments_sync_window()
returns trigger
language plpgsql
as $$
begin
  if new.starts_at is null or new.ends_at is null then
    select t.starts_at, t.ends_at into new.starts_at, new.ends_at
      from public.os_trips t where t.id = new.trip_id;
  end if;
  return new;
end;
$$;

drop trigger if exists os_assignments_window on public.os_trip_assignments;
create trigger os_assignments_window before insert on public.os_trip_assignments
  for each row execute function public.os_assignments_sync_window();

-- When a trip moves, every live assignment moves with it — otherwise the
-- conflict engine would be checking yesterday's window.
create or replace function public.os_trips_cascade_window()
returns trigger
language plpgsql
as $$
begin
  if new.starts_at is distinct from old.starts_at or new.ends_at is distinct from old.ends_at then
    update public.os_trip_assignments
      set starts_at = new.starts_at, ends_at = new.ends_at
      where trip_id = new.id and status in ('proposed', 'assigned', 'confirmed');
  end if;
  return new;
end;
$$;

drop trigger if exists os_trips_cascade on public.os_trips;
create trigger os_trips_cascade after update on public.os_trips
  for each row execute function public.os_trips_cascade_window();

-- ---------------------------------------------------------------------------
-- The double-booking guarantee.
--
-- Confirmed assignments for the same person (or the same vehicle/dress/camera)
-- may not overlap in time. This is an exclusion constraint, not application
-- logic, so it holds even under two simultaneous requests from two different
-- coordinators — the race that application-level checks always lose.
--
-- Deliberately scoped to `confirmed` only. Operations frequently pencils the
-- same photographer into two candidate slots while a client decides; that is
-- a soft conflict, surfaced loudly in the UI by src/lib/os/conflicts.ts and
-- blocked by the server action unless an override reason is supplied. Once
-- someone is CONFIRMED on a trip, the overlap becomes impossible rather than
-- merely discouraged.
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'os_assign_no_double_book_employee'
  ) then
    alter table public.os_trip_assignments
      add constraint os_assign_no_double_book_employee
      exclude using gist (
        employee_id with =,
        tstzrange(starts_at, ends_at, '[)') with &&
      )
      where (status = 'confirmed' and employee_id is not null and starts_at is not null and ends_at is not null);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'os_assign_no_double_book_resource'
  ) then
    alter table public.os_trip_assignments
      add constraint os_assign_no_double_book_resource
      exclude using gist (
        resource_id with =,
        tstzrange(starts_at, ends_at, '[)') with &&
      )
      where (status = 'confirmed' and resource_id is not null and starts_at is not null and ends_at is not null);
  end if;
end;
$$;

-- ===========================================================================
-- 9. SUPPLIERS AND EFFECTIVE-DATED RATES
-- ===========================================================================

create table if not exists public.os_suppliers (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  code text not null,
  name text not null,
  legal_name text,
  contact_name text,
  phone text,
  whatsapp text,
  email text,
  website text,
  country text default 'Egypt',
  city text,
  categories text[] not null default '{}',
  payment_terms text,
  currency text not null default 'EGP',
  contract_reference text,
  contract_expires_on date,
  -- Manually maintained relationship rating (1-5). The objective counterpart
  -- — incidents caused, late arrivals — is computed from os_incidents and
  -- os_performance_reviews rather than stored, so it can never drift.
  rating numeric(3, 2),
  notes text,
  active boolean not null default true,
  created_by uuid references public.os_employees (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  unique (org_id, code)
);

create table if not exists public.os_supplier_services (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.os_suppliers (id) on delete cascade,
  name text not null,
  category text not null,
  location_id uuid references public.os_locations (id) on delete set null,
  unit_label text not null default 'per person',
  lead_time_hours int,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ===========================================================================
-- 10. CENTRAL PRICE BOOK
-- ===========================================================================
--
-- No price is ever written into application code or into a form default.
-- Everything the calculator can add to a trip is a price item here, and
-- every number attached to a price item is an effective-dated rate below.
create table if not exists public.os_price_items (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  key text not null,
  name text not null,
  category text not null
    check (category in ('ticket', 'guide', 'driver', 'vehicle', 'photographer', 'videographer',
                        'dress', 'activity', 'meal', 'hotel', 'transfer', 'permit', 'editing',
                        'staff', 'extra', 'other')),
  unit_label text not null default 'per person',
  unit_id uuid references public.os_business_units (id) on delete set null,
  location_id uuid references public.os_locations (id) on delete set null,
  default_supplier_id uuid references public.os_suppliers (id) on delete set null,
  description text,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, key)
);

-- Effective-dated prices. A rate is never edited in place and never deleted:
-- raising the Fayoum supplier from $50 to $60 closes the old row's valid_to
-- and inserts a new one. The calculator resolves the rate valid on the TRIP
-- DATE, so quoting a trip six weeks out uses the price that will apply then,
-- and re-opening a trip from last year still shows last year's cost.
create table if not exists public.os_rates (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  price_item_id uuid references public.os_price_items (id) on delete cascade,
  supplier_service_id uuid references public.os_supplier_services (id) on delete cascade,
  supplier_id uuid references public.os_suppliers (id) on delete set null,
  -- Pricing tier this rate belongs to. 'any' means it applies to all tiers.
  tier text not null default 'any' check (tier in ('any', 'standard', 'premium', 'luxury', 'vip')),
  cost_amount numeric(12, 2) not null,
  -- Optional recommended sell price. When null the calculator derives sell
  -- from the tier's markup rule instead.
  sell_amount numeric(12, 2),
  currency text not null default 'USD',
  unit_label text,
  min_pax int,
  max_pax int,
  valid_from date not null default current_date,
  valid_to date,
  note text,
  created_by uuid references public.os_employees (id) on delete set null,
  created_at timestamptz not null default now(),
  superseded_by uuid references public.os_rates (id) on delete set null,
  constraint os_rates_target check (price_item_id is not null or supplier_service_id is not null),
  constraint os_rates_window check (valid_to is null or valid_to >= valid_from)
);

create index if not exists os_rates_item_idx on public.os_rates (price_item_id, valid_from desc);
create index if not exists os_rates_service_idx on public.os_rates (supplier_service_id, valid_from desc);

-- Markup rules per tier, so "Luxury" is a configurable multiplier rather
-- than a number a developer chose.
create table if not exists public.os_pricing_tiers (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  key text not null check (key in ('standard', 'premium', 'luxury', 'vip')),
  label text not null,
  markup_pct numeric(6, 2) not null default 45,
  min_margin_pct numeric(6, 2) not null default 20,
  description text,
  sort_order int not null default 0,
  unique (org_id, key)
);

-- Currencies and dated FX. Historical rates are inserted, never updated, so
-- a trip priced at 48.6 EGP/USD keeps that number for its whole life and the
-- profit reported for it never silently changes.
create table if not exists public.os_currencies (
  code text primary key,
  name text not null,
  symbol text not null,
  decimals int not null default 2,
  active boolean not null default true,
  sort_order int not null default 0
);

create table if not exists public.os_fx_rates (
  id uuid primary key default gen_random_uuid(),
  base_currency text not null references public.os_currencies (code),
  quote_currency text not null references public.os_currencies (code),
  rate numeric(18, 8) not null,
  as_of date not null,
  source text not null default 'manual',
  created_by uuid references public.os_employees (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (base_currency, quote_currency, as_of)
);

create index if not exists os_fx_lookup_idx on public.os_fx_rates (base_currency, quote_currency, as_of desc);

-- ===========================================================================
-- 11. QUOTES AND TRIP ECONOMICS
-- ===========================================================================

create table if not exists public.os_quotes (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  ref text not null,
  client_id uuid references public.os_clients (id) on delete set null,
  trip_id uuid references public.os_trips (id) on delete set null,
  trip_type_id uuid references public.os_trip_types (id) on delete set null,
  unit_id uuid references public.os_business_units (id) on delete set null,
  title text,
  tier text not null default 'standard' check (tier in ('standard', 'premium', 'luxury', 'vip')),
  trip_date date,
  guests_adults int not null default 2,
  guests_children int not null default 0,
  currency text not null default 'USD',
  cost_total numeric(12, 2) not null default 0,
  sell_total numeric(12, 2) not null default 0,
  margin_amount numeric(12, 2) not null default 0,
  margin_pct numeric(6, 2) not null default 0,
  status text not null default 'draft'
    check (status in ('draft', 'sent', 'accepted', 'declined', 'expired', 'converted')),
  notes text,
  created_by uuid references public.os_employees (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, ref)
);

create sequence if not exists public.os_quote_ref_seq start with 5001;

create table if not exists public.os_quote_lines (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.os_quotes (id) on delete cascade,
  seq int not null default 0,
  price_item_id uuid references public.os_price_items (id) on delete set null,
  -- The rate this line resolved to, kept so a quote can always explain
  -- itself: "guide fee $45, from the rate effective 1 Apr - 30 Jun".
  rate_id uuid references public.os_rates (id) on delete set null,
  label text not null,
  category text,
  qty numeric(10, 2) not null default 1,
  unit_cost numeric(12, 2) not null default 0,
  unit_sell numeric(12, 2) not null default 0,
  currency text not null default 'USD',
  fx_rate numeric(18, 8) not null default 1,
  notes text
);

-- Estimated vs actual, in one table separated by `kind`, so the variance
-- report is a single grouped query rather than a join between two shapes.
create table if not exists public.os_trip_cost_lines (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  trip_id uuid not null references public.os_trips (id) on delete cascade,
  kind text not null check (kind in ('estimated', 'actual')),
  category text not null,
  label text not null,
  price_item_id uuid references public.os_price_items (id) on delete set null,
  rate_id uuid references public.os_rates (id) on delete set null,
  supplier_id uuid references public.os_suppliers (id) on delete set null,
  employee_id uuid references public.os_employees (id) on delete set null,
  resource_id uuid references public.os_resources (id) on delete set null,
  qty numeric(10, 2) not null default 1,
  unit_amount numeric(12, 2) not null default 0,
  amount numeric(12, 2) not null default 0,
  currency text not null default 'USD',
  -- FX snapshot: the rate used, and the resulting amount in the org's base
  -- currency. Both are frozen at write time.
  fx_rate numeric(18, 8) not null default 1,
  base_amount numeric(12, 2) not null default 0,
  incurred_on date,
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'partial', 'paid', 'void')),
  approval_id uuid,
  receipt_url text,
  notes text,
  created_by uuid references public.os_employees (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists os_cost_trip_idx on public.os_trip_cost_lines (trip_id, kind);
create index if not exists os_cost_supplier_idx on public.os_trip_cost_lines (supplier_id, incurred_on);

-- Keep the trip's cached cost rollups correct without any read-time
-- aggregation. Fires on every insert/update/delete of a cost line.
create or replace function public.os_trips_recalc_costs()
returns trigger
language plpgsql
as $$
declare
  t uuid := coalesce(new.trip_id, old.trip_id);
begin
  update public.os_trips tr set
    estimated_cost_amount = coalesce((
      select sum(c.base_amount) from public.os_trip_cost_lines c
      where c.trip_id = t and c.kind = 'estimated' and c.payment_status <> 'void'
    ), 0),
    actual_cost_amount = coalesce((
      select sum(c.base_amount) from public.os_trip_cost_lines c
      where c.trip_id = t and c.kind = 'actual' and c.payment_status <> 'void'
    ), 0)
  where tr.id = t;
  return null;
end;
$$;

drop trigger if exists os_cost_lines_recalc on public.os_trip_cost_lines;
create trigger os_cost_lines_recalc after insert or update or delete on public.os_trip_cost_lines
  for each row execute function public.os_trips_recalc_costs();

-- Money in from clients and money out to suppliers/crew. Deliberately a
-- ledger of what happened, not a payment gateway: Egypt Eye's actual
-- collection happens in external tools, and this records the result so the
-- OS can answer "what is outstanding" without pretending to process cards.
create table if not exists public.os_payments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  trip_id uuid references public.os_trips (id) on delete set null,
  client_id uuid references public.os_clients (id) on delete set null,
  supplier_id uuid references public.os_suppliers (id) on delete set null,
  employee_id uuid references public.os_employees (id) on delete set null,
  direction text not null check (direction in ('in', 'out')),
  method text not null default 'bank_transfer'
    check (method in ('cash', 'bank_transfer', 'card', 'paypal', 'wise', 'stripe', 'other')),
  amount numeric(12, 2) not null,
  currency text not null default 'USD',
  fx_rate numeric(18, 8) not null default 1,
  base_amount numeric(12, 2) not null default 0,
  status text not null default 'received'
    check (status in ('pending', 'received', 'failed', 'refunded', 'void')),
  reference text,
  paid_on date not null default current_date,
  notes text,
  recorded_by uuid references public.os_employees (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists os_payments_trip_idx on public.os_payments (trip_id);

create or replace function public.os_trips_recalc_paid()
returns trigger
language plpgsql
as $$
declare
  t uuid := coalesce(new.trip_id, old.trip_id);
begin
  if t is null then return null; end if;
  update public.os_trips tr set paid_amount = coalesce((
    select sum(p.base_amount) from public.os_payments p
    where p.trip_id = t and p.direction = 'in' and p.status = 'received'
  ), 0)
  where tr.id = t;
  return null;
end;
$$;

drop trigger if exists os_payments_recalc on public.os_payments;
create trigger os_payments_recalc after insert or update or delete on public.os_payments
  for each row execute function public.os_trips_recalc_paid();

-- ===========================================================================
-- 12. TASKS, TEMPLATES, PROJECTS
-- ===========================================================================

create table if not exists public.os_task_templates (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  key text not null,
  name text not null,
  description text,
  trip_type_id uuid references public.os_trip_types (id) on delete set null,
  unit_id uuid references public.os_business_units (id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (org_id, key)
);

create table if not exists public.os_task_template_items (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.os_task_templates (id) on delete cascade,
  seq int not null default 0,
  title text not null,
  description text,
  -- Who owns this step, expressed as a role rather than a person, so the
  -- template survives staff changes. Resolved to an actual employee when the
  -- task is generated (see src/lib/os/tasks.ts).
  owner_role_key text,
  priority text not null default 'medium' check (priority in ('critical', 'high', 'medium', 'low')),
  -- Due time relative to the trip's start. -2 days = two days before.
  offset_days int not null default 0,
  offset_hours int not null default 0,
  phase text not null default 'pre' check (phase in ('pre', 'day', 'post')),
  -- A blocking task holds the trip out of "Ready" until it is done.
  blocking boolean not null default false
);

create table if not exists public.os_projects (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  code text not null,
  name text not null,
  description text,
  status text not null default 'active'
    check (status in ('planned', 'active', 'on_hold', 'done', 'cancelled')),
  owner_employee_id uuid references public.os_employees (id) on delete set null,
  unit_id uuid references public.os_business_units (id) on delete set null,
  starts_on date,
  due_on date,
  created_by uuid references public.os_employees (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  unique (org_id, code)
);

-- Tasks attach to anything via (entity_type, entity_id). trip_id is
-- duplicated as a real FK because trip-scoped queries are by far the hottest
-- path and deserve an index rather than a polymorphic scan.
create table if not exists public.os_tasks (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo'
    check (status in ('todo', 'in_progress', 'blocked', 'done', 'cancelled')),
  priority text not null default 'medium' check (priority in ('critical', 'high', 'medium', 'low')),
  owner_employee_id uuid references public.os_employees (id) on delete set null,
  owner_role_key text,
  entity_type text not null default 'trip'
    check (entity_type in ('trip', 'client', 'employee', 'supplier', 'project', 'resource', 'incident', 'general')),
  entity_id uuid,
  trip_id uuid references public.os_trips (id) on delete cascade,
  project_id uuid references public.os_projects (id) on delete cascade,
  unit_id uuid references public.os_business_units (id) on delete set null,
  due_at timestamptz,
  phase text not null default 'pre' check (phase in ('pre', 'day', 'post')),
  blocking boolean not null default false,
  depends_on_task_id uuid references public.os_tasks (id) on delete set null,
  template_item_id uuid references public.os_task_template_items (id) on delete set null,
  started_at timestamptz,
  completed_at timestamptz,
  completed_by uuid references public.os_employees (id) on delete set null,
  created_by uuid references public.os_employees (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create index if not exists os_tasks_owner_idx on public.os_tasks (owner_employee_id, status, due_at);
create index if not exists os_tasks_trip_idx on public.os_tasks (trip_id, status);
create index if not exists os_tasks_due_idx on public.os_tasks (org_id, due_at) where status in ('todo', 'in_progress', 'blocked');

drop trigger if exists os_tasks_touch on public.os_tasks;
create trigger os_tasks_touch before update on public.os_tasks
  for each row execute function public.os_touch_updated_at();

create table if not exists public.os_task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.os_tasks (id) on delete cascade,
  employee_id uuid references public.os_employees (id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

-- ===========================================================================
-- 13. APPROVALS
-- ===========================================================================

create table if not exists public.os_approval_rules (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  key text not null,
  name text not null,
  kind text not null,
  unit_id uuid references public.os_business_units (id) on delete set null,
  -- e.g. {"amount_gt": 200, "currency": "USD"} or {"discount_pct_gt": 15}
  condition jsonb not null default '{}'::jsonb,
  approver_role_key text not null,
  escalate_after_hours int not null default 24,
  escalate_to_role_key text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (org_id, key)
);

create table if not exists public.os_approvals (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  ref text not null,
  kind text not null
    check (kind in ('discount', 'refund', 'extra_cost', 'supplier_change', 'purchase',
                    'vip_upgrade', 'free_service', 'cancellation', 'special_request',
                    'assignment_override', 'other')),
  title text not null,
  detail text,
  entity_type text,
  entity_id uuid,
  trip_id uuid references public.os_trips (id) on delete cascade,
  amount numeric(12, 2),
  currency text default 'USD',
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'changes_requested', 'cancelled')),
  requested_by uuid references public.os_employees (id) on delete set null,
  requested_at timestamptz not null default now(),
  approver_role_key text,
  assigned_to uuid references public.os_employees (id) on delete set null,
  decided_by uuid references public.os_employees (id) on delete set null,
  decided_at timestamptz,
  decision_note text,
  due_at timestamptz,
  escalated_at timestamptz,
  rule_id uuid references public.os_approval_rules (id) on delete set null,
  unique (org_id, ref)
);

create sequence if not exists public.os_approval_ref_seq start with 1001;
create index if not exists os_approvals_status_idx on public.os_approvals (org_id, status, requested_at desc);

create table if not exists public.os_approval_events (
  id uuid primary key default gen_random_uuid(),
  approval_id uuid not null references public.os_approvals (id) on delete cascade,
  employee_id uuid references public.os_employees (id) on delete set null,
  action text not null check (action in ('requested', 'approved', 'rejected', 'changes_requested', 'commented', 'escalated', 'cancelled')),
  note text,
  at timestamptz not null default now()
);

-- ===========================================================================
-- 14. MEDIA LINKS, DOCUMENTS, CONTENT PIPELINE
-- ===========================================================================
--
-- Photos and video never enter this database. Egypt Eye already stores its
-- media in Google Drive, which is better at it than any application table
-- would be, and a photoshoot's raw folder is routinely tens of gigabytes.
-- The OS stores the LINK plus the operational metadata around it — what it
-- is, who owns it, who may see it, whether it has been verified to actually
-- open — which is the part Drive cannot answer.
create table if not exists public.os_media_links (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  trip_id uuid references public.os_trips (id) on delete cascade,
  client_id uuid references public.os_clients (id) on delete set null,
  kind text not null default 'other'
    check (kind in ('raw_photos', 'edited_photos', 'videos', 'client_delivery',
                    'behind_the_scenes', 'social_content', 'other')),
  title text not null,
  url text not null,
  provider text not null default 'google_drive'
    check (provider in ('google_drive', 'dropbox', 'wetransfer', 'youtube', 'vimeo', 'other')),
  visibility text not null default 'internal'
    check (visibility in ('internal', 'client', 'public')),
  item_count int,
  size_note text,
  added_by uuid references public.os_employees (id) on delete set null,
  added_at timestamptz not null default now(),
  -- Set when a human (or, later, the Drive API) confirmed the link resolves
  -- and the folder is not empty. An unverified delivery link is a readiness
  -- blocker, because a dead Drive link discovered by the client is worse
  -- than no link at all.
  verified_at timestamptz,
  verified_by uuid references public.os_employees (id) on delete set null,
  notes text
);

create index if not exists os_media_trip_idx on public.os_media_links (trip_id);

create table if not exists public.os_documents (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  title text not null,
  kind text not null default 'other'
    check (kind in ('voucher', 'invoice', 'supplier_confirmation', 'contract', 'ticket',
                    'trip_brief', 'client_document', 'identity', 'insurance', 'permit',
                    'internal', 'other')),
  url text,
  storage_path text,
  entity_type text not null default 'trip'
    check (entity_type in ('trip', 'client', 'supplier', 'employee', 'resource', 'project', 'org')),
  entity_id uuid,
  trip_id uuid references public.os_trips (id) on delete cascade,
  client_id uuid references public.os_clients (id) on delete set null,
  supplier_id uuid references public.os_suppliers (id) on delete set null,
  -- Documents can hold passports and contracts. Visibility is enforced
  -- server-side on top of the module permission, so "can view trips" does
  -- not silently imply "can view this client's passport scan".
  visibility text not null default 'internal'
    check (visibility in ('internal', 'management', 'finance', 'client', 'assigned_crew')),
  expires_on date,
  uploaded_by uuid references public.os_employees (id) on delete set null,
  created_at timestamptz not null default now(),
  archived_at timestamptz
);

create index if not exists os_documents_entity_idx on public.os_documents (entity_type, entity_id);

-- The post-shoot pipeline. One row per trip that produces content; the stage
-- column is the kanban column, and every move is written to os_activity.
create table if not exists public.os_content_jobs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  trip_id uuid not null references public.os_trips (id) on delete cascade unique,
  stage text not null default 'upload_pending'
    check (stage in ('shoot_complete', 'upload_pending', 'uploaded', 'editing',
                     'quality_check', 'ready', 'delivered')),
  editor_employee_id uuid references public.os_employees (id) on delete set null,
  photographer_employee_id uuid references public.os_employees (id) on delete set null,
  promised_at timestamptz,
  uploaded_at timestamptz,
  editing_started_at timestamptz,
  ready_at timestamptz,
  delivered_at timestamptz,
  delivery_link_id uuid references public.os_media_links (id) on delete set null,
  expected_photo_count int,
  delivered_photo_count int,
  -- Whether the client agreed the images may be used in Egypt Eye marketing.
  -- Never assumed: the default is no, and the social pipeline reads this.
  marketing_permission boolean not null default false,
  marketing_permission_note text,
  published_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists os_content_jobs_touch on public.os_content_jobs;
create trigger os_content_jobs_touch before update on public.os_content_jobs
  for each row execute function public.os_touch_updated_at();

-- ===========================================================================
-- 15. INTERNAL COMMUNICATION
-- ===========================================================================
--
-- Not a WhatsApp replacement and not a customer inbox. This exists so that a
-- decision about trip EE-10482 lives ON trip EE-10482 forever, instead of in
-- a personal chat that leaves with the employee.
create table if not exists public.os_channels (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  kind text not null default 'team'
    check (kind in ('trip', 'department', 'team', 'direct', 'announcement', 'project')),
  name text,
  trip_id uuid references public.os_trips (id) on delete cascade,
  project_id uuid references public.os_projects (id) on delete cascade,
  unit_id uuid references public.os_business_units (id) on delete set null,
  department text,
  created_by uuid references public.os_employees (id) on delete set null,
  created_at timestamptz not null default now(),
  last_message_at timestamptz,
  archived_at timestamptz
);

create unique index if not exists os_channels_trip_uniq on public.os_channels (trip_id) where trip_id is not null;
create index if not exists os_channels_kind_idx on public.os_channels (org_id, kind, last_message_at desc);

create table if not exists public.os_channel_members (
  channel_id uuid not null references public.os_channels (id) on delete cascade,
  employee_id uuid not null references public.os_employees (id) on delete cascade,
  role text not null default 'member' check (role in ('member', 'owner')),
  last_read_at timestamptz,
  muted boolean not null default false,
  joined_at timestamptz not null default now(),
  primary key (channel_id, employee_id)
);

create table if not exists public.os_messages (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.os_channels (id) on delete cascade,
  employee_id uuid references public.os_employees (id) on delete set null,
  body text not null,
  -- 'system' messages are written by the OS itself ("Ahmed was assigned as
  -- photographer"), so the trip conversation carries the operational history
  -- inline rather than in a separate tab nobody opens.
  kind text not null default 'message' check (kind in ('message', 'system')),
  mentions uuid[] not null default '{}',
  attachment_url text,
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz
);

create index if not exists os_messages_channel_idx on public.os_messages (channel_id, created_at desc);

create or replace function public.os_channels_touch_last_message()
returns trigger
language plpgsql
as $$
begin
  update public.os_channels set last_message_at = new.created_at where id = new.channel_id;
  return null;
end;
$$;

drop trigger if exists os_messages_touch_channel on public.os_messages;
create trigger os_messages_touch_channel after insert on public.os_messages
  for each row execute function public.os_channels_touch_last_message();

-- ===========================================================================
-- 16. NOTIFICATIONS
-- ===========================================================================

create table if not exists public.os_notifications (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  employee_id uuid not null references public.os_employees (id) on delete cascade,
  level text not null default 'info'
    check (level in ('critical', 'warning', 'info')),
  category text not null default 'system'
    check (category in ('assignment', 'task', 'approval', 'trip', 'mention', 'incident',
                        'readiness', 'content', 'attendance', 'system')),
  title text not null,
  body text,
  href text,
  entity_type text,
  entity_id uuid,
  -- Groups notifications that describe the same fact so the bell shows
  -- "3 trips need a driver" rather than three identical lines.
  dedupe_key text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists os_notifications_inbox_idx on public.os_notifications (employee_id, read_at, created_at desc);
create unique index if not exists os_notifications_dedupe_idx
  on public.os_notifications (employee_id, dedupe_key) where dedupe_key is not null and read_at is null;

create table if not exists public.os_notification_preferences (
  employee_id uuid not null references public.os_employees (id) on delete cascade,
  category text not null,
  in_app boolean not null default true,
  email boolean not null default false,
  push boolean not null default false,
  primary key (employee_id, category)
);

-- ===========================================================================
-- 17. ATTENDANCE
-- ===========================================================================
--
-- Deliberately thin. This answers "who is working today" for operations, and
-- it does not try to be payroll — Egypt Eye already has an accountant, and a
-- half-built payroll module is worse than none.
create table if not exists public.os_attendance (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  employee_id uuid not null references public.os_employees (id) on delete cascade,
  work_date date not null,
  check_in_at timestamptz,
  check_out_at timestamptz,
  minutes int,
  status text not null default 'present'
    check (status in ('present', 'late', 'absent', 'leave', 'holiday', 'remote', 'field')),
  check_in_source text,
  check_out_source text,
  trip_id uuid references public.os_trips (id) on delete set null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (employee_id, work_date)
);

create index if not exists os_attendance_date_idx on public.os_attendance (org_id, work_date);

-- ===========================================================================
-- 18. INCIDENTS, QUALITY, FEEDBACK
-- ===========================================================================

create table if not exists public.os_incidents (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  ref text not null,
  trip_id uuid references public.os_trips (id) on delete set null,
  severity text not null default 'medium'
    check (severity in ('low', 'medium', 'high', 'critical')),
  category text not null default 'other'
    check (category in ('late_arrival', 'no_show', 'vehicle', 'equipment', 'supplier',
                        'client_complaint', 'safety', 'lost_item', 'weather', 'permit', 'other')),
  title text not null,
  description text,
  occurred_at timestamptz not null default now(),
  reported_by uuid references public.os_employees (id) on delete set null,
  owner_employee_id uuid references public.os_employees (id) on delete set null,
  -- Who or what the incident is ABOUT, which is what makes "which suppliers
  -- cause the most incidents" answerable.
  subject_employee_id uuid references public.os_employees (id) on delete set null,
  subject_supplier_id uuid references public.os_suppliers (id) on delete set null,
  subject_resource_id uuid references public.os_resources (id) on delete set null,
  status text not null default 'open'
    check (status in ('open', 'investigating', 'resolved', 'closed')),
  client_impact text not null default 'none'
    check (client_impact in ('none', 'minor', 'major', 'severe')),
  actions_taken text,
  resolution text,
  cost_amount numeric(12, 2),
  cost_currency text default 'USD',
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, ref)
);

create sequence if not exists public.os_incident_ref_seq start with 501;
create index if not exists os_incidents_status_idx on public.os_incidents (org_id, status, occurred_at desc);

-- Internal, post-trip evaluation of the people and partners who delivered
-- it. Separate from client feedback on purpose: one is an operational
-- judgement, the other is the customer's experience, and merging them
-- produces a number that means nothing.
create table if not exists public.os_performance_reviews (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  trip_id uuid references public.os_trips (id) on delete cascade,
  subject_type text not null check (subject_type in ('employee', 'supplier', 'resource')),
  employee_id uuid references public.os_employees (id) on delete cascade,
  supplier_id uuid references public.os_suppliers (id) on delete cascade,
  resource_id uuid references public.os_resources (id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  punctuality int check (punctuality between 1 and 5),
  quality int check (quality between 1 and 5),
  professionalism int check (professionalism between 1 and 5),
  note text,
  reviewer_employee_id uuid references public.os_employees (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists os_reviews_subject_idx on public.os_performance_reviews (subject_type, employee_id, supplier_id, resource_id);

create table if not exists public.os_client_feedback (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  trip_id uuid references public.os_trips (id) on delete cascade,
  client_id uuid references public.os_clients (id) on delete set null,
  rating int check (rating between 1 and 5),
  nps int check (nps between 0 and 10),
  comments text,
  highlight text,
  complaint text,
  would_recommend boolean,
  -- Whether we asked for a public review, and where it landed. The public
  -- review platforms stay external; this only tracks the ask.
  public_review_requested_at timestamptz,
  public_review_url text,
  collected_by uuid references public.os_employees (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ===========================================================================
-- 19. KNOWLEDGE BASE AND SOPs
-- ===========================================================================

create table if not exists public.os_knowledge_articles (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  slug text not null,
  title text not null,
  category text not null default 'general',
  summary text,
  body text not null default '',
  tags text[] not null default '{}',
  unit_id uuid references public.os_business_units (id) on delete set null,
  location_id uuid references public.os_locations (id) on delete set null,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  visibility text not null default 'all_staff'
    check (visibility in ('all_staff', 'operations', 'management', 'finance')),
  version int not null default 1,
  author_employee_id uuid references public.os_employees (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, slug)
);

-- Full-text search over the knowledge base, generated so it can never fall
-- out of sync with the article.
alter table public.os_knowledge_articles
  add column if not exists search_vector tsvector
  generated always as (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(summary, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(body, '')), 'C')
  ) stored;

create index if not exists os_knowledge_search_idx on public.os_knowledge_articles using gin (search_vector);

-- An SOP is not a document. It is a procedure that can be INSTANTIATED as a
-- real checklist against a real trip, which is the difference between a
-- policy nobody reads and a process the system actually runs.
create table if not exists public.os_sops (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  slug text not null,
  title text not null,
  category text not null default 'operations',
  summary text,
  trip_type_id uuid references public.os_trip_types (id) on delete set null,
  unit_id uuid references public.os_business_units (id) on delete set null,
  location_id uuid references public.os_locations (id) on delete set null,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  version int not null default 1,
  owner_employee_id uuid references public.os_employees (id) on delete set null,
  -- When set, applying this SOP to a trip generates tasks from this template
  -- rather than from the SOP steps directly.
  task_template_id uuid references public.os_task_templates (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, slug)
);

create table if not exists public.os_sop_steps (
  id uuid primary key default gen_random_uuid(),
  sop_id uuid not null references public.os_sops (id) on delete cascade,
  seq int not null default 0,
  title text not null,
  detail text,
  owner_role_key text,
  expected_minutes int,
  evidence_required boolean not null default false,
  critical boolean not null default false
);

-- ===========================================================================
-- 20. TAGS, SAVED VIEWS, SETTINGS
-- ===========================================================================

create table if not exists public.os_tags (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  key text not null,
  label text not null,
  color text not null default '#c9a227',
  -- Which record types this tag is offered on. Empty means anything.
  applies_to text[] not null default '{}',
  description text,
  created_by uuid references public.os_employees (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (org_id, key)
);

create table if not exists public.os_taggings (
  tag_id uuid not null references public.os_tags (id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  tagged_by uuid references public.os_employees (id) on delete set null,
  tagged_at timestamptz not null default now(),
  primary key (tag_id, entity_type, entity_id)
);

create index if not exists os_taggings_entity_idx on public.os_taggings (entity_type, entity_id);

-- A saved view is a stored filter set, not a stored result. It is re-run on
-- every open, so "Trips at risk" is always today's answer.
create table if not exists public.os_saved_views (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  employee_id uuid references public.os_employees (id) on delete cascade,
  name text not null,
  resource text not null check (resource in ('trips', 'tasks', 'clients', 'resources', 'suppliers', 'approvals', 'incidents')),
  query jsonb not null default '{}'::jsonb,
  icon text,
  -- Shared views are visible to everyone whose permissions allow the
  -- underlying records; the view itself grants nothing.
  shared boolean not null default false,
  pinned boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists os_saved_views_emp_idx on public.os_saved_views (employee_id, resource);

create table if not exists public.os_settings (
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  key text not null,
  value jsonb not null default '{}'::jsonb,
  description text,
  updated_by uuid references public.os_employees (id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (org_id, key)
);

-- ===========================================================================
-- 21. ACTIVITY, AUDIT, AUTOMATION, AI
-- ===========================================================================

-- The human-readable story of a record: what happened, in order, in plain
-- language. Rendered on every entity's Activity tab.
create table if not exists public.os_activity (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  trip_id uuid references public.os_trips (id) on delete cascade,
  employee_id uuid references public.os_employees (id) on delete set null,
  verb text not null,
  summary text not null,
  meta jsonb not null default '{}'::jsonb,
  at timestamptz not null default now()
);

create index if not exists os_activity_entity_idx on public.os_activity (entity_type, entity_id, at desc);
create index if not exists os_activity_trip_idx on public.os_activity (trip_id, at desc);

-- The forensic record: exact before/after values for every write that
-- matters, including who did it and from what. Separate from os_activity
-- because they answer different questions — one is "what is the story of
-- this trip", the other is "prove what changed".
--
-- No UPDATE or DELETE grant is issued for this table below, so even the
-- service-role key the application uses cannot rewrite history through
-- PostgREST; correcting a mistake means adding a new row, never editing one.
create table if not exists public.os_audit_log (
  id bigserial primary key,
  org_id uuid references public.os_orgs (id) on delete set null,
  actor_employee_id uuid references public.os_employees (id) on delete set null,
  actor_user_id uuid,
  actor_label text,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  entity_label text,
  before jsonb,
  after jsonb,
  changed_fields text[],
  ip text,
  user_agent text,
  at timestamptz not null default now()
);

create index if not exists os_audit_entity_idx on public.os_audit_log (entity_type, entity_id, at desc);
create index if not exists os_audit_actor_idx on public.os_audit_log (actor_employee_id, at desc);
create index if not exists os_audit_at_idx on public.os_audit_log (at desc);

-- The registry of automations. `implemented` is honest bookkeeping: a rule
-- listed here with implemented=false is documented intent, shown in the
-- Admin Center as "not running yet", never as a toggle that pretends to do
-- something. The rules that DO run are executed by src/lib/os/automation.ts
-- on the mutation that triggers them, plus a scheduled sweep for the
-- time-based ones.
create table if not exists public.os_automations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  key text not null,
  name text not null,
  description text,
  trigger_event text not null,
  condition jsonb not null default '{}'::jsonb,
  actions jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  implemented boolean not null default false,
  requires_integration text,
  last_run_at timestamptz,
  run_count int not null default 0,
  created_at timestamptz not null default now(),
  unique (org_id, key)
);

create table if not exists public.os_automation_runs (
  id bigserial primary key,
  automation_id uuid references public.os_automations (id) on delete cascade,
  trigger_event text,
  entity_type text,
  entity_id uuid,
  status text not null default 'ok' check (status in ('ok', 'skipped', 'error')),
  detail text,
  at timestamptz not null default now()
);

-- AI governance ledger. Every AI-assisted read or action records the actor,
-- the permission snapshot it ran under, what data it was allowed to see, and
-- what it produced — so an AI answer can be replayed and audited exactly
-- like a human action. Written by the AI layer before the result is shown,
-- never after, so a refused or failed action is on the record too.
create table if not exists public.os_ai_actions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  employee_id uuid references public.os_employees (id) on delete set null,
  kind text not null
    check (kind in ('question', 'briefing', 'audit', 'assignment_suggestion', 'pricing', 'search', 'summary')),
  prompt text,
  -- The exact permission/scope set the request ran under. This is what makes
  -- "the AI must never bypass permissions" verifiable after the fact rather
  -- than a claim.
  permissions_snapshot jsonb not null default '{}'::jsonb,
  data_scope jsonb not null default '{}'::jsonb,
  result jsonb,
  status text not null default 'completed'
    check (status in ('completed', 'refused', 'error', 'pending_approval', 'approved', 'rejected')),
  approved_by uuid references public.os_employees (id) on delete set null,
  approved_at timestamptz,
  model text,
  tokens_used int,
  duration_ms int,
  at timestamptz not null default now()
);

create index if not exists os_ai_actions_emp_idx on public.os_ai_actions (employee_id, at desc);

-- ===========================================================================
-- 22. INTERNAL COMPANY CALENDAR
-- ===========================================================================
--
-- Kept in its own table rather than mixed into os_trips, because a customer
-- trip and a Tuesday management meeting have almost nothing in common
-- operationally, and merging them is how operations calendars become
-- unusable. The UI keeps them on separate screens by default and can overlay
-- them on request.
create table if not exists public.os_events (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.os_orgs (id) on delete cascade,
  kind text not null default 'meeting'
    check (kind in ('meeting', 'one_on_one', 'training', 'interview', 'company_event',
                    'supplier_meeting', 'deadline', 'holiday', 'other')),
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  all_day boolean not null default false,
  location text,
  meeting_url text,
  unit_id uuid references public.os_business_units (id) on delete set null,
  organizer_employee_id uuid references public.os_employees (id) on delete set null,
  visibility text not null default 'team'
    check (visibility in ('private', 'team', 'company')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  cancelled_at timestamptz
);

create index if not exists os_events_range_idx on public.os_events (org_id, starts_at);

create table if not exists public.os_event_attendees (
  event_id uuid not null references public.os_events (id) on delete cascade,
  employee_id uuid not null references public.os_employees (id) on delete cascade,
  response text not null default 'invited'
    check (response in ('invited', 'accepted', 'declined', 'tentative')),
  responded_at timestamptz,
  primary key (event_id, employee_id)
);

-- ===========================================================================
-- 23. ROW LEVEL SECURITY — deny everything to the browser
-- ===========================================================================
--
-- Every os_ table gets RLS enabled and NO policy. With RLS on and zero
-- policies, PostgREST requests made with the anon or authenticated key match
-- no rows and can write nothing — including tables added later, because the
-- loop below is driven by the catalog rather than a hand-maintained list.
-- Re-running this migration re-secures anything new.
--
-- The service-role key bypasses RLS by design; it lives only in server
-- environment variables and is used only by src/lib/os/*, which never runs a
-- query without first resolving the actor and checking a permission.
do $$
declare
  t record;
begin
  for t in
    select tablename from pg_tables
    where schemaname = 'public' and tablename like 'os\_%'
  loop
    execute format('alter table public.%I enable row level security', t.tablename);
    -- Revoke the blanket grants Supabase hands to anon/authenticated on new
    -- tables, so these are not even reachable through PostgREST.
    execute format('revoke all on public.%I from anon, authenticated', t.tablename);
  end loop;
end;
$$;

-- The audit log is append-only for every role the application can hold: the
-- service-role key that src/lib/os/* uses has INSERT and SELECT and nothing
-- else, so no code path in this repository can rewrite or erase history.
-- (A database owner with direct SQL access could, which is a property of
-- Postgres, not something an application can revoke from itself — the
-- mitigation there is that nobody but the operator holds those credentials.)
revoke update, delete on public.os_audit_log from service_role;
revoke update, delete on public.os_activity from service_role;
revoke update, delete on public.os_trip_status_history from service_role;
revoke update, delete on public.os_login_events from service_role;
revoke update, delete on public.os_fx_rates from service_role;

-- ===========================================================================
-- 24. REPORTING VIEWS
-- ===========================================================================
--
-- security_invoker keeps these views honest: they run with the caller's
-- rights, so a view can never become a hole around the RLS above.

create or replace view public.os_v_trip_economics
with (security_invoker = true) as
select
  t.id,
  t.org_id,
  t.ref,
  t.title,
  t.trip_date,
  t.status,
  t.unit_id,
  t.trip_type_id,
  t.client_id,
  t.source,
  t.currency,
  t.sell_amount,
  t.estimated_cost_amount,
  t.actual_cost_amount,
  coalesce(nullif(t.actual_cost_amount, 0), t.estimated_cost_amount) as effective_cost,
  t.sell_amount - coalesce(nullif(t.actual_cost_amount, 0), t.estimated_cost_amount) as margin_amount,
  case when t.sell_amount > 0
    then round(((t.sell_amount - coalesce(nullif(t.actual_cost_amount, 0), t.estimated_cost_amount)) / t.sell_amount) * 100, 2)
    else 0 end as margin_pct,
  case when t.estimated_cost_amount > 0 and t.actual_cost_amount > 0
    then round(t.actual_cost_amount - t.estimated_cost_amount, 2)
    else null end as cost_variance,
  t.guests_adults + t.guests_children as guests_total,
  t.archived_at
from public.os_trips t;

create or replace view public.os_v_employee_workload
with (security_invoker = true) as
select
  e.id as employee_id,
  e.org_id,
  e.full_name,
  e.job_title,
  count(a.id) filter (where a.status in ('assigned', 'confirmed')
    and a.starts_at >= date_trunc('week', now())
    and a.starts_at < date_trunc('week', now()) + interval '1 week') as assignments_this_week,
  count(a.id) filter (where a.status in ('assigned', 'confirmed')
    and a.starts_at::date = current_date) as assignments_today,
  count(a.id) filter (where a.status in ('assigned', 'confirmed')
    and a.starts_at > now()) as assignments_upcoming,
  count(a.id) filter (where a.status = 'confirmed' and a.ends_at < now()) as assignments_completed
from public.os_employees e
left join public.os_trip_assignments a on a.employee_id = e.id
where e.archived_at is null
group by e.id, e.org_id, e.full_name, e.job_title;

create or replace view public.os_v_resource_utilization
with (security_invoker = true) as
select
  r.id as resource_id,
  r.org_id,
  r.kind,
  r.code,
  r.name,
  r.status,
  count(a.id) filter (where a.status in ('assigned', 'confirmed')
    and a.starts_at >= now() - interval '30 days') as bookings_30d,
  count(a.id) filter (where a.status in ('assigned', 'confirmed') and a.starts_at > now()) as bookings_upcoming,
  max(a.ends_at) filter (where a.status in ('assigned', 'confirmed')) as last_booked_until
from public.os_resources r
left join public.os_trip_assignments a on a.resource_id = r.id
where r.archived_at is null
group by r.id, r.org_id, r.kind, r.code, r.name, r.status;

-- ===========================================================================
-- 25. LINK-UP OF DEFERRED FOREIGN KEYS
-- ===========================================================================
-- os_trip_types.default_task_template_id and os_trips.template_id are
-- declared above before their target tables exist, so the constraints are
-- added here at the end.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'os_trip_types_task_template_fk') then
    alter table public.os_trip_types
      add constraint os_trip_types_task_template_fk
      foreign key (default_task_template_id) references public.os_task_templates (id) on delete set null;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'os_trips_template_fk') then
    alter table public.os_trips
      add constraint os_trips_template_fk
      foreign key (template_id) references public.os_trip_templates (id) on delete set null;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'os_trips_quote_fk') then
    alter table public.os_trips
      add constraint os_trips_quote_fk
      foreign key (quote_id) references public.os_quotes (id) on delete set null;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'os_trip_templates_task_template_fk') then
    alter table public.os_trip_templates
      add constraint os_trip_templates_task_template_fk
      foreign key (default_task_template_id) references public.os_task_templates (id) on delete set null;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'os_trips_status_fk') then
    -- Status is a configurable key, validated against the org's status list
    -- by the application rather than a FK, because statuses are per-org and
    -- a composite FK on (org_id, status) would block renaming one. The
    -- status engine in src/lib/os/status.ts is the enforcement point.
    null;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'os_maintenance_supplier_fk') then
    alter table public.os_resource_maintenance
      add constraint os_maintenance_supplier_fk
      foreign key (supplier_id) references public.os_suppliers (id) on delete set null;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'os_cost_lines_approval_fk') then
    alter table public.os_trip_cost_lines
      add constraint os_cost_lines_approval_fk
      foreign key (approval_id) references public.os_approvals (id) on delete set null;
  end if;
end;
$$;

-- ===========================================================================
-- 26. FINAL LOCK-DOWN OF THE REPORTING VIEWS
-- ===========================================================================
-- Views are revoked too: os_v_* run with security_invoker, so they already
-- inherit the deny-all above, but removing the grant means they are not even
-- listed as reachable endpoints.
do $$
declare
  v record;
begin
  for v in
    select table_name from information_schema.views
    where table_schema = 'public' and table_name like 'os\_%'
  loop
    execute format('revoke all on public.%I from anon, authenticated', v.table_name);
  end loop;
end;
$$;
