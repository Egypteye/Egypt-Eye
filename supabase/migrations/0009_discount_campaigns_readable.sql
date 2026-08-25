-- The My Account page joins discount_codes -> discount_campaigns (to show
-- the campaign's name/discount value alongside the customer's own code).
-- discount_campaigns was deliberately left server-only in 0001_init.sql
-- (admins manage it from /admin, never the browser), but that also silently
-- blocked this read-only join for `authenticated` — 0007_grant_privileges
-- granted authenticated access to discount_codes itself but missed this
-- one, so the join came back empty with no visible error, and the whole
-- "Your Egypt Eye Offer" card just never rendered.
--
-- Campaign name/type/value/eligibility fields aren't sensitive (no
-- customer data), so a straightforward public-read policy is fine — writes
-- still go through the service-role admin client only.

grant select on public.discount_campaigns to authenticated;

drop policy if exists "discount_campaigns_select_authenticated" on public.discount_campaigns;
create policy "discount_campaigns_select_authenticated" on public.discount_campaigns for select
  to authenticated
  using (true);
