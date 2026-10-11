-- What the customer will wear, recorded on the booking.
--
-- A separate column from `addons` rather than another entry inside it,
-- because the two are different kinds of thing and conflating them would
-- break the one rule that matters here: an addon carries a price and feeds
-- the deposit quote, an outfit carries none and must never be able to move a
-- total. Keeping them apart means there is no column an invented fee could
-- arrive in. See src/lib/booking/outfits.ts.
--
-- Shape, snapshotted at the moment of booking:
--   [{ "id": "cherry", "name": "Cherry", "category": "womens-dress", "quantity": 1 }, …]
--
-- The NAME is stored alongside the id on purpose. The id is what selection is
-- matched on, so renaming a dress in the Studio does not orphan past
-- bookings; the stored name is what an old booking reads back as, so a rename
-- does not silently rewrite what a customer was told they chose either.
--
-- Nothing here is nullable-with-meaning: an empty array means "no outfit
-- chosen", which is a perfectly ordinary booking and not a missing value.
-- Choosing an outfit is never required, because an outfit preference is not
-- worth failing a booking over.

alter table public.reservations
  add column if not exists outfits jsonb not null default '[]'::jsonb;

-- The desk's filter for "Flying Dress bookings that still need an outfit
-- conversation" — a booking where nobody picked, on a product that offers a
-- collection, is a phone call rather than a problem.
create index if not exists reservations_outfits_chosen_idx
  on public.reservations ((jsonb_array_length(outfits)))
  where jsonb_array_length(outfits) > 0;
