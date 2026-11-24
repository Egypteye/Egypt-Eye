-- Lets the enquiries table accept a campaign enquiry.
--
-- The "Shakira let you down? Egypt Eye got you." campaign page has its own
-- enquiry form. It is not a tour enquiry: there is no catalogue item behind
-- it, the subject is one of four campaign packages, and the details carry a
-- party date rather than a departure.
--
-- enquiries.kind is constrained to a fixed list rather than left free text,
-- deliberately — a typo'd kind is a lead nobody ever finds again. So a new
-- kind means replacing the constraint, which is all this migration does.
-- Nothing is dropped and no row is touched: the four existing kinds are
-- carried over verbatim.

alter table public.enquiries
  drop constraint if exists enquiries_kind_check;

alter table public.enquiries
  add constraint enquiries_kind_check
    check (kind in ('tour_enquiry', 'flying_dresses', 'transfer', 'shop_visit', 'campaign'));
