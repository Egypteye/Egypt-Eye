-- Which sender actually got the enquiry through.
--
-- 0030 recorded whether the notification email left. That turned out not to
-- be enough to answer the question it was built for.
--
-- The Flying Dresses route tries two senders: the brand's own
-- (info@flyingdressesegypt.com) and, if Resend refuses it, whatever
-- RESEND_FROM_EMAIL names. Both outcomes are stored as 'sent', so the row
-- cannot distinguish "the brand domain is verified and working" from "the
-- brand domain is refused and the platform's address caught it".
--
-- That distinction is the whole diagnosis. The two brands deploy from one
-- repository to two Vercel projects, and only one of them has
-- RESEND_FROM_EMAIL set. So the same enquiry can read 'sent' on
-- egypteyetravel.com and fail outright on flyingdressesegypt.com, where there
-- is no fallback to catch it — and 0030 alone would show a healthy table
-- while that brand's customers disappeared.
--
-- sendEmail now returns the address it resolved, so this column is the value
-- Resend actually accepted rather than a guess reconstructed afterwards.
-- A row reading 'onboarding@resend.dev' is the loudest possible signal: it
-- means no sender is configured at all, and Resend refuses every recipient
-- except the account owner's own address.

alter table public.enquiries add column if not exists email_sender text;

comment on column public.enquiries.email_sender is
  'The From address Resend accepted, as resolved by sendEmail. A brand address means that domain is verified; RESEND_FROM_EMAIL means the brand sender was refused and the platform caught it; onboarding@resend.dev means nothing is configured.';

-- Finding the fallbacks is the point, and they should be rare, so the index
-- is partial rather than over a column that is the same value on most rows.
create index if not exists enquiries_fallback_sender_idx
  on public.enquiries (created_at desc)
  where email_sender is not null and email_sender not like '%@flyingdressesegypt.com%';
