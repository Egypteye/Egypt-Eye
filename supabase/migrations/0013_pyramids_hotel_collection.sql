-- Replaces the placeholder example hotels (0004_hotels.sql) with the real
-- Egypt Eye "Pyramids Hotel Collection" — 8 Giza-area hotels plus Spacey
-- (a distinct long-stay apartment property, property_type = 'apartment').
--
-- Source of truth: the "Egypt Eye - Pyramids Hotel Collection" 2026
-- brochure supplied directly by the Egypt Eye team. Every name, room type,
-- view, rate, and policy below is taken verbatim from that document —
-- nothing here is estimated or invented. Two details the brochure leaves
-- open are handled conservatively rather than guessed:
--   * Meal plan: the brochure lists a per-night room/suite rate plus a
--     separate "$15 per person" dinner add-on, but never states whether
--     breakfast is bundled into the room rate. Rather than assume, every
--     rate here is logged as "Room Rate" with a note directing staff to
--     confirm exact inclusions at booking.
--   * Spacey has no rates, room types, or specific location in any
--     existing source — it's seeded with only the framing already agreed
--     (luxury long-stay apartments), no rooms/rates, and enquiry-only.
--
-- Rates shown on the public site are explicitly framed as indicative,
-- Egypt-Eye-negotiated deal rates requiring confirmation (see
-- src/app/(site)/hotel-deals) — consistent with the "not live
-- availability" design already established in 0004_hotels.sql.

-- Remove the two clearly-fictional placeholder listings now that the real
-- collection is being seeded (safe: hotel_rate_requests.hotel_id is
-- ON DELETE SET NULL, so no existing enquiry record is broken).
delete from public.hotels where slug in ('example-nile-view-hotel-cairo', 'example-red-sea-resort-hurghada');

insert into public.hotels
  (slug, name, property_type, short_description, full_description, location, highlights, amenities, photos, special_notes, child_family_policy, enabled, display_order)
values
  (
    'pyramid-edge-hotel',
    'Pyramid Edge Hotel',
    'hotel',
    '45m² Edge Suites with city and Pyramids views and a private jacuzzi, in the heart of Giza.',
    'Stay in the heart of Giza with beautiful Pyramids views from select rooms and suites, including Edge Suites with both city and Pyramids views.',
    'Giza, Egypt',
    array['45m² Edge Suites with a private jacuzzi', 'City and Pyramids views from select rooms and suites', 'Heart-of-Giza location'],
    array[]::text[],
    array['/photos/hotels/pyramid-edge-hotel-1.jpg', '/photos/hotels/pyramid-edge-hotel-2.jpg'],
    'Room rate as listed by the hotel. Dinner is available separately for $15 per person. Exact meal inclusions and the final rate are confirmed at the time of booking.',
    'Children 0–6 years: free accommodation and meals. Children 6–11 years: a $5 supplement (half board) or $8 supplement (full board) applies for accommodation and meals.',
    true, 1
  ),
  (
    'top-pyramids-view-hotel',
    'Top Pyramids View Hotel',
    'hotel',
    'A new hotel close to both the Pyramids and the Grand Egyptian Museum.',
    'A convenient Giza location for travelers who want to experience the Pyramids while staying close to the Grand Egyptian Museum.',
    'Giza, Egypt',
    array['New hotel near the Pyramids and the Grand Egyptian Museum'],
    array[]::text[],
    array['/photos/hotels/top-pyramids-view-hotel-1.jpg', '/photos/hotels/top-pyramids-view-hotel-2.jpg'],
    'Room rate as listed by the hotel. Dinner is available separately for $15 per person. Exact meal inclusions and the final rate are confirmed at the time of booking.',
    'Children 0–6 years: free accommodation and meals. Children 6–11 years: a $5 supplement (half board) or $8 supplement (full board) applies for accommodation and meals.',
    true, 2
  ),
  (
    'zen-pyramids-luxury-villa',
    'ZEN Pyramids Luxury Villa',
    'hotel',
    'A peaceful stay near the Grand Egyptian Museum with an outdoor pool and easy access to Giza''s top attractions.',
    'Just a short distance from the Grand Egyptian Museum, ZEN Pyramids Luxury Villa offers a peaceful stay with an outdoor pool and easy access to Giza''s top attractions.',
    'Giza, Egypt',
    array['Rooftop swimming pool', 'Short distance from the Grand Egyptian Museum'],
    array['Rooftop swimming pool', 'On-site restaurant', 'Free Wi-Fi', 'Concierge service', 'Tour desk'],
    array['/photos/hotels/zen-pyramids-luxury-villa-1.jpg', '/photos/hotels/zen-pyramids-luxury-villa-2.jpg'],
    'Room rate as listed by the hotel. Dinner is available separately for $15 per person. Exact meal inclusions and the final rate are confirmed at the time of booking.',
    'Children 0–6 years: free accommodation and meals. Children 6–11 years: a $5 supplement (half board) or $8 supplement (full board) applies for accommodation and meals.',
    true, 3
  ),
  (
    'blue-pyramids-eyes-hotel',
    'Blue Pyramids Eyes Hotel',
    'hotel',
    'A comfortable stay close to the Giza Pyramids with a garden, terrace, and easy access to the Pyramids and Great Sphinx.',
    'Located close to the Giza Pyramids, Blue Pyramids Eyes Hotel offers a comfortable stay with a garden, terrace, and easy access to the Pyramids and Great Sphinx.',
    'Giza, Egypt',
    array['Close to the Giza Pyramids and Great Sphinx', 'Garden and terrace'],
    array['Garden', 'Terrace'],
    array['/photos/hotels/blue-pyramids-eyes-hotel-1.jpg', '/photos/hotels/blue-pyramids-eyes-hotel-2.jpg'],
    'Room rate as listed by the hotel. Dinner is available separately for $15 per person. Exact meal inclusions and the final rate are confirmed at the time of booking.',
    'Children 0–6 years: free accommodation and meals. Children 6–11 years: a $5 supplement (half board) or $8 supplement (full board) applies for accommodation and meals.',
    true, 4
  ),
  (
    'nomad-pyramids-boutique-hotel',
    'The Nomad Pyramids Boutique Hotel',
    'hotel',
    'A boutique stay in Giza, close to the Pyramids and Great Sphinx, with a convenient location for exploring the area''s most famous landmarks.',
    'A boutique stay in Giza, close to the Pyramids and Great Sphinx, with a convenient location for exploring the area''s most famous landmarks.',
    'Giza, Egypt',
    array['Boutique hotel close to the Pyramids and Great Sphinx', 'Free high-speed Wi-Fi and coffee shop'],
    array['Free high-speed Wi-Fi', 'Coffee shop'],
    array['/photos/hotels/nomad-pyramids-boutique-hotel-1.jpg', '/photos/hotels/nomad-pyramids-boutique-hotel-2.jpg'],
    'Room rate as listed by the hotel. Dinner is available separately for $15 per person. Exact meal inclusions and the final rate are confirmed at the time of booking.',
    'Children 0–6 years: free accommodation and meals. Children 6–11 years: a $5 supplement (half board) or $8 supplement (full board) applies for accommodation and meals.',
    true, 5
  ),
  (
    'pyramids-height-hotel',
    'Pyramids Height Hotel',
    'hotel',
    'City and Pyramid view rooms with a rooftop swimming pool, sauna, steam room, and other leisure facilities in the Giza Pyramids area.',
    'Located in the Giza Pyramids area, Pyramids Height Hotel offers city and Pyramid view rooms, along with a rooftop swimming pool, sauna, steam room, and other leisure facilities.',
    'Giza, Egypt',
    array['Two outdoor swimming pools and a children''s pool', 'Hot tub, spa facilities, and a rooftop terrace'],
    array['Two outdoor swimming pools', 'Children''s pool', 'Hot tub', 'Spa facilities', 'Rooftop terrace', 'Sauna', 'Steam room'],
    array['/photos/hotels/pyramids-height-hotel-1.jpg', '/photos/hotels/pyramids-height-hotel-2.jpg'],
    'Room rate as listed by the hotel. Dinner is available separately for $15 per person. Exact meal inclusions and the final rate are confirmed at the time of booking.',
    'Children 0–6 years: free accommodation and meals. Children 6–11 years: a $5 supplement (half board) or $8 supplement (full board) applies for accommodation and meals.',
    true, 6
  ),
  (
    'soul-pyramids-view-hotel',
    'Soul Pyramids View Hotel',
    'hotel',
    'Panoramic views of the Great Pyramids from select rooms and suites, with deluxe rooms designed to bring the Pyramids into your stay.',
    'Enjoy panoramic views of the Great Pyramids from select rooms and suites, with deluxe rooms designed to bring the Pyramids into your stay.',
    'Giza, Egypt',
    array['Panoramic Great Pyramids views from select rooms', 'Outdoor swimming pool with a view'],
    array['Outdoor swimming pool with a view', 'Restaurant'],
    array['/photos/hotels/soul-pyramids-view-hotel-1.jpg', '/photos/hotels/soul-pyramids-view-hotel-2.jpg'],
    'Room rate as listed by the hotel. Dinner is available separately for $15 per person. Exact meal inclusions and the final rate are confirmed at the time of booking.',
    'Children 0–6 years: free accommodation and meals. Children 6–11 years: a $5 supplement (half board) or $8 supplement (full board) applies for accommodation and meals.',
    true, 7
  ),
  (
    'gate-hotel-front-pyramids-sphinx-view',
    'The Gate Hotel — Front Pyramids & Sphinx View',
    'hotel',
    'Just 247 meters from the Great Sphinx, with only 10 rooms for an intimate boutique experience.',
    'Just 247 meters from the Great Sphinx, The Gate Hotel offers a front-facing Pyramids and Sphinx location, with select suites featuring panoramic views of the three Pyramids and Sphinx.',
    'Giza, Egypt',
    array['Just 247 meters from the Great Sphinx', 'Only 10 rooms — intimate boutique experience', 'Front-facing Pyramids and Sphinx views from select suites'],
    array[]::text[],
    array['/photos/hotels/gate-hotel-front-pyramids-sphinx-view-1.jpg', '/photos/hotels/gate-hotel-front-pyramids-sphinx-view-2.jpg'],
    'Room rate as listed by the hotel. Dinner is available separately for $15 per person. Exact meal inclusions and the final rate are confirmed at the time of booking.',
    'Children 0–6 years: free accommodation and meals. Children 6–11 years: a $5 supplement (half board) or $8 supplement (full board) applies for accommodation and meals.',
    true, 8
  ),
  (
    'spacey-luxury-apartments',
    'Spacey',
    'apartment',
    'Luxury long-stay apartments — a premium, home-like alternative to a hotel room, with more space and privacy.',
    'Spacey is Egypt Eye''s premium apartment-style accommodation option, for travelers who want more space and privacy, a home-like experience, and comfortable longer stays — well suited to couples, families, groups, and extended stays.',
    'Egypt',
    array['More space and privacy than a traditional hotel room', 'A home-like experience', 'Ideal for couples, families, groups, and extended stays'],
    array[]::text[],
    array[]::text[],
    'Rates, exact locations, and availability are confirmed directly by our team — send an enquiry for current options.',
    null,
    true, 100
  )
on conflict (slug) do nothing;

-- Rooms — guarded with `where not exists` (rooms have no natural unique
-- key) so this migration stays safe to re-run.

insert into public.hotel_rooms (hotel_id, name, room_category, view, max_occupancy, display_order)
select h.id, r.name, r.category, r.view, 2, r.display_order
from public.hotels h
join (values
  ('pyramid-edge-hotel', 'Edge Suite', 'suite', 'City & Pyramids View', 1),
  ('pyramid-edge-hotel', 'Standard Room', 'standard', null, 2),
  ('top-pyramids-view-hotel', 'Standard Room', 'standard', null, 1),
  ('zen-pyramids-luxury-villa', 'Room — City View', 'standard', 'City View', 1),
  ('zen-pyramids-luxury-villa', 'Room — Garden View', 'standard', 'Garden View', 2),
  ('blue-pyramids-eyes-hotel', 'Room — City View', 'standard', 'City View', 1),
  ('blue-pyramids-eyes-hotel', 'Room — Pyramids View', 'standard', 'Pyramids View', 2),
  ('nomad-pyramids-boutique-hotel', 'Room — City View', 'standard', 'City View', 1),
  ('nomad-pyramids-boutique-hotel', 'Room — Pyramids View', 'standard', 'Pyramids View', 2),
  ('pyramids-height-hotel', 'Standard Room — City View', 'standard', 'City View', 1),
  ('pyramids-height-hotel', 'Standard Room — Pyramids View', 'standard', 'Pyramids View', 2),
  ('pyramids-height-hotel', 'Premium Room — City View', 'suite', 'City View', 3),
  ('pyramids-height-hotel', 'Premium Room — Pyramids View', 'suite', 'Pyramids View', 4),
  ('soul-pyramids-view-hotel', 'Standard Room', 'standard', null, 1),
  ('gate-hotel-front-pyramids-sphinx-view', 'Standard Room', 'standard', null, 1)
) as r(hotel_slug, name, category, view, display_order) on r.hotel_slug = h.slug
where not exists (select 1 from public.hotel_rooms hr where hr.hotel_id = h.id and hr.name = r.name);

-- Rates — one row per (room, occupancy), meal_plan logged as "Room Rate"
-- per the note above (breakfast inclusion isn't stated in the source).

insert into public.hotel_rates (room_id, occupancy, meal_plan, price_per_night, contact_for_rate, display_order)
select room.id, rate.occupancy, 'Room Rate', rate.price, false, rate.display_order
from public.hotel_rooms room
join public.hotels h on h.id = room.hotel_id
join (values
  ('pyramid-edge-hotel', 'Edge Suite', 'single', 135, 1),
  ('pyramid-edge-hotel', 'Edge Suite', 'double', 145, 2),
  ('pyramid-edge-hotel', 'Standard Room', 'single', 80, 1),
  ('pyramid-edge-hotel', 'Standard Room', 'double', 90, 2),
  ('top-pyramids-view-hotel', 'Standard Room', 'single', 45, 1),
  ('top-pyramids-view-hotel', 'Standard Room', 'double', 55, 2),
  ('zen-pyramids-luxury-villa', 'Room — City View', 'single', 65, 1),
  ('zen-pyramids-luxury-villa', 'Room — City View', 'double', 70, 2),
  ('zen-pyramids-luxury-villa', 'Room — Garden View', 'single', 70, 1),
  ('zen-pyramids-luxury-villa', 'Room — Garden View', 'double', 75, 2),
  ('blue-pyramids-eyes-hotel', 'Room — City View', 'single', 40, 1),
  ('blue-pyramids-eyes-hotel', 'Room — City View', 'double', 45, 2),
  ('blue-pyramids-eyes-hotel', 'Room — Pyramids View', 'single', 45, 1),
  ('blue-pyramids-eyes-hotel', 'Room — Pyramids View', 'double', 50, 2),
  ('nomad-pyramids-boutique-hotel', 'Room — City View', 'single', 40, 1),
  ('nomad-pyramids-boutique-hotel', 'Room — City View', 'double', 45, 2),
  ('nomad-pyramids-boutique-hotel', 'Room — Pyramids View', 'single', 45, 1),
  ('nomad-pyramids-boutique-hotel', 'Room — Pyramids View', 'double', 50, 2),
  ('pyramids-height-hotel', 'Standard Room — City View', 'single', 40, 1),
  ('pyramids-height-hotel', 'Standard Room — City View', 'double', 45, 2),
  ('pyramids-height-hotel', 'Standard Room — Pyramids View', 'single', 55, 1),
  ('pyramids-height-hotel', 'Standard Room — Pyramids View', 'double', 60, 2),
  ('pyramids-height-hotel', 'Premium Room — City View', 'single', 65, 1),
  ('pyramids-height-hotel', 'Premium Room — City View', 'double', 70, 2),
  ('pyramids-height-hotel', 'Premium Room — Pyramids View', 'single', 80, 1),
  ('pyramids-height-hotel', 'Premium Room — Pyramids View', 'double', 90, 2),
  ('soul-pyramids-view-hotel', 'Standard Room', 'single', 80, 1),
  ('soul-pyramids-view-hotel', 'Standard Room', 'double', 90, 2),
  ('gate-hotel-front-pyramids-sphinx-view', 'Standard Room', 'single', 85, 1),
  ('gate-hotel-front-pyramids-sphinx-view', 'Standard Room', 'double', 95, 2)
) as rate(hotel_slug, room_name, occupancy, price, display_order)
  on rate.hotel_slug = h.slug and rate.room_name = room.name
where not exists (
  select 1 from public.hotel_rates hr where hr.room_id = room.id and hr.occupancy = rate.occupancy
);
