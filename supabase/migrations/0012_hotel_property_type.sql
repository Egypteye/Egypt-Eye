-- Adds a property type to the hotels catalog so non-hotel accommodation
-- (e.g. "Spacey", Egypt Eye's luxury long-stay apartment option) can be
-- managed inside the same Hotel Deals catalog/admin panel, but rendered
-- and labeled distinctly on the public page rather than looking like just
-- another hotel listing.

alter table public.hotels
  add column if not exists property_type text not null default 'hotel'
    check (property_type in ('hotel', 'apartment'));
