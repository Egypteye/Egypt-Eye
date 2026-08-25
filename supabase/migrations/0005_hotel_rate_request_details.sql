-- Extends hotel_rate_requests (0004_hotels.sql) with the structured
-- booking details the reservations team needs to quote a rate: room type,
-- number of rooms, check-in/out dates, guest count, and meal plan. Added
-- as its own migration rather than editing 0004 since that one has
-- already been applied/deployed.

alter table public.hotel_rate_requests
  add column if not exists rooms_count integer,
  add column if not exists check_in date,
  add column if not exists check_out date,
  add column if not exists guests integer,
  add column if not exists meal_plan text;
