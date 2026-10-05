-- Payment attempts: the difference between a booking and a try at paying for it.
--
-- Until now a reservation carried one `payment_order_id` column. That was
-- wrong in a way that only shows up in the cases that matter: a customer who
-- abandons one checkout and starts another overwrites the first, a failed
-- attempt followed by a successful one leaves no record that the first
-- happened, and there is nowhere to put the state of something that is neither
-- the booking's state nor a webhook event.
--
-- A booking is a thing a person wants. An attempt is one go at paying for it.
-- One booking has many attempts; at most one of them may ever hold money.
--
-- The two indexes at the bottom are the point of this migration. Most of the
-- duplicate scenarios — two tabs, a double click, a retried request, a
-- redelivered webhook — are races between processes that each believe they
-- should record a payment. Application checks lose those races. A partial
-- unique index does not: every racer may try, exactly one commits, and the
-- losers read the winner's row and report the same truth.

create table if not exists public.payment_attempts (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations (id) on delete cascade,
  provider text not null default 'paypal',

  -- PayPal's order id. Null only in the moment between creating the row and
  -- hearing back from PayPal, which is deliberate: the row exists first, so an
  -- order we created but never recorded cannot happen.
  provider_order_id text,

  status text not null default 'created'
    check (status in (
      'created',    -- our row exists; PayPal may or may not have an order yet
      'approved',   -- the buyer approved; money is NOT collected yet
      'captured',   -- the money is in the account
      'pending',    -- PayPal has it but has not credited it
      'failed',     -- PayPal declined or the capture failed
      'cancelled',  -- the buyer backed out
      'expired',    -- approved and never captured, now void
      'refunded',
      'reversed',
      -- The payment is real but disagrees with the booking: wrong amount,
      -- wrong reference. Never resolved automatically in either direction.
      'mismatch'
    )),

  -- Integer cents. Never a float, and never recomputed: this is the figure the
  -- customer agreed to, compared byte for byte against what PayPal reports.
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'USD',

  -- The whole quote as it stood when the customer agreed to it — the rates,
  -- the headcount, the line for every extra. Immutable. If the team changes a
  -- deposit from $25 to $30 next month, this still says what was agreed and
  -- why, which is the only thing that answers a dispute six months later.
  quote jsonb not null,

  -- PayPal stores a PayPal-Request-Id and replays the ORIGINAL result for up
  -- to 45 days, so these must be per attempt and never per booking: a genuine
  -- second attempt after a failure would otherwise be answered with the first
  -- attempt's failure. UUIDs because PayPal recommends them and caps the
  -- header at 38 characters.
  create_request_id uuid not null default gen_random_uuid(),
  capture_request_id uuid not null default gen_random_uuid(),

  capture_id text,
  authorization_id text,

  -- Telling people about a payment is a different operation from taking it,
  -- with different failure modes. A failed email must never be able to
  -- un-capture money, so fulfilment is tracked separately and retried.
  fulfilled_at timestamptz,
  fulfilment_error text,

  failed_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  approved_at timestamptz,
  captured_at timestamptz
);

-- THE guarantee. One booking can never have two captured payments, however
-- many processes race to record one.
create unique index if not exists payment_attempts_one_capture_idx
  on public.payment_attempts (reservation_id)
  where status = 'captured';

-- One PayPal order is one attempt. A webhook and a browser callback arriving
-- together cannot produce two rows for the same order.
create unique index if not exists payment_attempts_order_idx
  on public.payment_attempts (provider, provider_order_id)
  where provider_order_id is not null;

-- The reconciliation sweep's working set: attempts that are still in flight,
-- oldest first, because the oldest is the one closest to being lost.
create index if not exists payment_attempts_open_idx
  on public.payment_attempts (created_at)
  where status in ('created', 'approved', 'pending');

-- Captured but never told anybody. The other half of the sweep.
create index if not exists payment_attempts_unfulfilled_idx
  on public.payment_attempts (captured_at)
  where status = 'captured' and fulfilled_at is null;

create index if not exists payment_attempts_reservation_idx
  on public.payment_attempts (reservation_id, created_at desc);

alter table public.payment_attempts enable row level security;
-- No client policies at all. Attempts are written by server routes with the
-- service role and read by staff tooling; a browser has no business reading
-- anyone's payment history, and RLS with no policy is the strongest way to say
-- so — the same posture as payment_events in 0020.

-- Which attempt actually paid for this booking. A pointer rather than a
-- duplicate of its state, so the two cannot disagree.
alter table public.reservations
  add column if not exists paid_attempt_id uuid references public.payment_attempts (id),
  -- The same snapshot, denormalised onto the booking so the admin list and the
  -- emails can read it without a join.
  add column if not exists deposit_quote jsonb;

comment on table public.payment_attempts is
  'One go at paying for a booking. Many per reservation; at most one captured, enforced by payment_attempts_one_capture_idx.';
