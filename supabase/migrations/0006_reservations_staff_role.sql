-- Adds a scoped "reservations" staff role, distinct from full "admin".
-- A reservations-role account can only access /admin/reservations and
-- /admin/hotel-rate-requests (see requireReservationsStaff() in
-- src/lib/auth/session.ts and the per-page checks in src/app/(site)/admin/*)
-- — hotels, discounts, newsletter, concierge, and collaborations stay
-- admin-only. Widens the existing profiles.role check constraint rather
-- than replacing it, so existing 'customer'/'admin' rows are untouched.

alter table public.profiles drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check check (role in ('customer', 'admin', 'reservations'));
