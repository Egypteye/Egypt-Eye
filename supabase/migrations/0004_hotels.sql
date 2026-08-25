-- Backs the "Hotel Deals" public catalog (src/app/(site)/hotel-deals) and
-- its admin manager (src/app/(site)/admin/hotels). Fully greenfield - no
-- prior hotel schema existed; the loose `hotels` jsonb field on
-- `reservations` (0001_init.sql) is unrelated per-trip itinerary
-- bookkeeping, not a sellable catalog.
--
-- Rates are NOT live availability - they're Egypt Eye's negotiated deal
-- rates, shown with an explicit "may need confirmation" framing on the
-- public pages. A rate can be marked `contact_for_rate` (no price shown,
-- "Contact us for the latest rate") and/or given a `valid_until` expiry
-- date, both editable per-rate from the admin manager.

create table if not exists public.hotels (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  short_description text not null,
  full_description text not null default '',
  location text not null,
  highlights text[] not null default '{}',
  amenities text[] not null default '{}',
  photos text[] not null default '{}',
  special_notes text,
  deal_headline text,
  deal_description text,
  child_family_policy text,
  enabled boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hotels_enabled_order_idx on public.hotels (enabled, display_order);

alter table public.hotels enable row level security;
create policy "hotels are publicly readable" on public.hotels for select using (true);
-- Public SELECT is intentional (this is a public catalog, like the Sanity
-- tour/experience content) - all writes still go through the service-role
-- admin client only, gated by requireAdmin() server-side.

create table if not exists public.hotel_rooms (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.hotels (id) on delete cascade,
  name text not null,
  room_category text not null default 'standard' check (room_category in ('standard', 'suite')),
  view text,
  max_occupancy integer not null default 2,
  description text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hotel_rooms_hotel_idx on public.hotel_rooms (hotel_id, display_order);

alter table public.hotel_rooms enable row level security;
create policy "hotel rooms are publicly readable" on public.hotel_rooms for select using (true);

create table if not exists public.hotel_rates (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.hotel_rooms (id) on delete cascade,
  occupancy text not null check (occupancy in ('single', 'double')),
  meal_plan text not null default 'Bed & Breakfast',
  price_per_night numeric(10, 2),
  currency text not null default 'USD',
  contact_for_rate boolean not null default false,
  valid_until date,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hotel_rates_price_or_contact check (contact_for_rate or price_per_night is not null)
);

create index if not exists hotel_rates_room_idx on public.hotel_rates (room_id, display_order);

alter table public.hotel_rates enable row level security;
create policy "hotel rates are publicly readable" on public.hotel_rates for select using (true);

-- "Check Latest Rates" email-capture requests - server-only, reviewed from
-- admin/hotel-rate-requests, same tier as newsletter_subscribers.
create table if not exists public.hotel_rate_requests (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid references public.hotels (id) on delete set null,
  hotel_name_snapshot text not null,
  room_id uuid references public.hotel_rooms (id) on delete set null,
  room_name_snapshot text,
  name text,
  email text not null,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz not null default now()
);

create index if not exists hotel_rate_requests_status_idx on public.hotel_rate_requests (status, created_at desc);

alter table public.hotel_rate_requests enable row level security;
-- Server-only, no public policy.

-- Seed placeholder content so the public page and admin manager are both
-- immediately usable. These are clearly-fictional examples (not real
-- named hotel brands) meant to be edited or deleted once the real Egypt
-- Eye Hotel Collection is entered via /admin/hotels.
insert into public.hotels (slug, name, short_description, full_description, location, highlights, amenities, photos, deal_headline, deal_description, child_family_policy, display_order)
values
  (
    'example-nile-view-hotel-cairo',
    'Example Nile View Hotel — Cairo',
    'A placeholder listing — replace with a real Egypt Eye hotel partner from the admin panel.',
    'This is seed content so the Hotel Deals page and admin manager are usable right away. Edit or delete this entry from /admin/hotels and add your real partner hotels with their actual names, photos, and rates.',
    'Cairo, Nile Corniche',
    array['Placeholder highlight — edit or remove', 'Nile-facing rooms', 'Central Cairo location'],
    array['Pool', 'Free Wi-Fi', 'Airport shuttle', 'Spa'],
    array[]::text[],
    'Example Egypt Eye Deal',
    'Placeholder deal copy — replace with your real negotiated rate details.',
    'Children under 6 stay free with an existing adult bed. Extra beds available on request.',
    1
  ),
  (
    'example-red-sea-resort-hurghada',
    'Example Red Sea Resort — Hurghada',
    'A placeholder listing — replace with a real Egypt Eye hotel partner from the admin panel.',
    'This is seed content so the Hotel Deals page and admin manager are usable right away. Edit or delete this entry from /admin/hotels and add your real partner hotels with their actual names, photos, and rates.',
    'Hurghada, Red Sea Coast',
    array['Placeholder highlight — edit or remove', 'Private beach access', 'On-site dive center'],
    array['Beach access', 'Multiple pools', 'All-inclusive option', 'Kids club'],
    array[]::text[],
    'Example Egypt Eye Deal',
    'Placeholder deal copy — replace with your real negotiated rate details.',
    'Family rooms available. Children under 12 eat free from the kids menu.',
    2
  )
on conflict (slug) do nothing;

-- No unique constraint on hotel_rooms/hotel_rates beyond `id` (a real
-- room/rate has no natural key), so seeding uses an explicit `where not
-- exists` guard instead of `on conflict` to stay safe to re-run — without
-- it, re-applying this migration would duplicate the placeholder rows
-- every time.
insert into public.hotel_rooms (hotel_id, name, room_category, view, max_occupancy, description, display_order)
select h.id, 'Deluxe Room', 'standard', 'Nile View', 2, 'Placeholder room — edit from the admin panel.', 1
from public.hotels h
where h.slug = 'example-nile-view-hotel-cairo'
  and not exists (select 1 from public.hotel_rooms r where r.hotel_id = h.id and r.name = 'Deluxe Room');

insert into public.hotel_rooms (hotel_id, name, room_category, view, max_occupancy, description, display_order)
select h.id, 'Executive Suite', 'suite', 'Nile View', 3, 'Placeholder suite — edit from the admin panel.', 2
from public.hotels h
where h.slug = 'example-nile-view-hotel-cairo'
  and not exists (select 1 from public.hotel_rooms r where r.hotel_id = h.id and r.name = 'Executive Suite');

insert into public.hotel_rooms (hotel_id, name, room_category, view, max_occupancy, description, display_order)
select h.id, 'Garden Room', 'standard', 'Garden View', 2, 'Placeholder room — edit from the admin panel.', 1
from public.hotels h
where h.slug = 'example-red-sea-resort-hurghada'
  and not exists (select 1 from public.hotel_rooms r where r.hotel_id = h.id and r.name = 'Garden Room');

insert into public.hotel_rates (room_id, occupancy, meal_plan, price_per_night, contact_for_rate, display_order)
select r.id, o.occupancy, 'Bed & Breakfast', o.price, false, o.display_order
from public.hotel_rooms r
join public.hotels h on h.id = r.hotel_id
join (values ('single', 90, 1), ('double', 120, 2)) as o(occupancy, price, display_order) on true
where h.slug = 'example-nile-view-hotel-cairo' and r.name = 'Deluxe Room'
  and not exists (select 1 from public.hotel_rates existing where existing.room_id = r.id and existing.occupancy = o.occupancy);

insert into public.hotel_rates (room_id, occupancy, meal_plan, price_per_night, contact_for_rate, display_order)
select r.id, 'double', 'Half Board', null, true, 1
from public.hotel_rooms r
join public.hotels h on h.id = r.hotel_id
where h.slug = 'example-nile-view-hotel-cairo' and r.name = 'Executive Suite'
  and not exists (select 1 from public.hotel_rates existing where existing.room_id = r.id and existing.occupancy = 'double');

insert into public.hotel_rates (room_id, occupancy, meal_plan, price_per_night, contact_for_rate, display_order)
select r.id, o.occupancy, 'All Inclusive', o.price, false, o.display_order
from public.hotel_rooms r
join public.hotels h on h.id = r.hotel_id
join (values ('single', 140, 1), ('double', 190, 2)) as o(occupancy, price, display_order) on true
where h.slug = 'example-red-sea-resort-hurghada' and r.name = 'Garden Room'
  and not exists (select 1 from public.hotel_rates existing where existing.room_id = r.id and existing.occupancy = o.occupancy);
