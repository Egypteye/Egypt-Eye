-- Backfill: links any newsletter_subscribers/discount_codes rows that
-- predate an account to that account by matching email, for the case where
-- someone subscribed to the newsletter (or already had a discount code)
-- *before* creating an account with the same email — the auto-link in
-- handle_new_user() (0001_init.sql) only fires once, at the moment a new
-- account is created, so it never ran for these. Safe to re-run: every
-- update is guarded with `is null`, so it only ever fills in a missing link,
-- never overwrites one that's already set.

update public.newsletter_subscribers s
set customer_id = p.id
from public.profiles p
where p.email = s.email and s.customer_id is null;

update public.discount_codes dc
set customer_id = s.customer_id
from public.newsletter_subscribers s
where dc.subscriber_id = s.id and dc.customer_id is null and s.customer_id is not null;
