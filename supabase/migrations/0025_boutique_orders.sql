-- Boutique orders: a cartouche bought outright, rather than enquired about.
--
-- WHY A NEW TABLE AND NOT `reservations`
--
-- reservations is tour-shaped all the way down — journey_snapshot, itinerary,
-- hotels, transfers, guides, travelers_adults. A pendant has none of those,
-- and forcing one in would make every one of those columns lie.
--
-- WHY NOT A NEW PAYMENT TABLE
--
-- Because the payment machinery is the part that is hard to get right, and it
-- already exists: per-attempt idempotency keys, the status machine, the quote
-- snapshot, fulfilment tracked separately from capture, the webhook and the
-- reconciliation sweep. A second payment rail beside it would be two places
-- to fix the next bug in. So payment_attempts grows a second parent instead:
-- exactly one of reservation_id or boutique_order_id, enforced below.
--
-- FULFILMENT
--
-- Collected in Egypt. No courier, no address, no customs, no shipping line —
-- which is why there is no address here. If posted delivery is ever added it
-- is a new fulfilment value and the columns it needs, not a rewrite.

create table if not exists public.boutique_orders (
  id uuid primary key default gen_random_uuid(),

  -- EEB- prefixed, so a boutique order can never collide with a reservation
  -- and the webhook can tell them apart without a database round trip.
  reference text not null unique,

  product_slug text not null,
  product_name text not null,
  category_slug text not null default 'cartouches',

  -- The customisation, as agreed. engraved_name is what the customer typed;
  -- sign_codes is what the workshop engraves. Both are stored because the
  -- second is derived from the first and a disagreement between them is the
  -- thing that would reach a customer as the wrong pendant.
  engraved_name text not null,
  sign_codes jsonb not null default '[]'::jsonb,
  glyphs text not null default '',
  sign_count integer not null check (sign_count > 0),

  quantity integer not null default 1 check (quantity between 1 and 10),

  -- Integer cents. Never a float, never recomputed — the figure the customer
  -- agreed to, compared byte for byte against what PayPal reports.
  unit_cents integer not null check (unit_cents > 0),
  total_cents integer not null check (total_cents > 0),
  currency text not null default 'USD',

  fulfilment text not null default 'collect-in-egypt'
    check (fulfilment in ('collect-in-egypt')),

  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  -- Free text: when they are in Egypt, which hotel, anything they added.
  collection_notes text,

  status text not null default 'pending'
    check (status in (
      'pending',    -- the row exists; nothing has been paid
      'paid',       -- money is in the account
      'making',     -- the workshop has it
      'ready',      -- waiting for the customer to collect
      'collected',
      'cancelled',
      'refunded'
    )),

  -- The whole quote as it stood when the customer agreed to it.
  quote jsonb not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists boutique_orders_reference_idx on public.boutique_orders (reference);
create index if not exists boutique_orders_status_idx on public.boutique_orders (status, created_at desc);
create index if not exists boutique_orders_email_idx on public.boutique_orders (lower(customer_email));

-- Service-role only, like every other order table here. No anon reads: a
-- boutique order carries a customer's name, email and travel dates.
alter table public.boutique_orders enable row level security;

-- ---------------------------------------------------------------------------
-- payment_attempts gains a second parent.
-- ---------------------------------------------------------------------------

alter table public.payment_attempts
  add column if not exists boutique_order_id uuid
    references public.boutique_orders (id) on delete cascade;

alter table public.payment_attempts
  alter column reservation_id drop not null;

-- Exactly one parent, always. An attempt belonging to both, or to neither, is
-- an orphan that the reconciliation sweep could never resolve in either
-- direction — so the database refuses to hold one.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'payment_attempts_one_parent'
  ) then
    alter table public.payment_attempts
      add constraint payment_attempts_one_parent check (
        (reservation_id is not null and boutique_order_id is null)
        or (reservation_id is null and boutique_order_id is not null)
      );
  end if;
end $$;

create index if not exists payment_attempts_boutique_order_idx
  on public.payment_attempts (boutique_order_id);

-- updated_at, matching the trigger every other table here uses.
do $$
begin
  if exists (select 1 from pg_proc where proname = 'set_updated_at') then
    drop trigger if exists boutique_orders_set_updated_at on public.boutique_orders;
    create trigger boutique_orders_set_updated_at
      before update on public.boutique_orders
      for each row execute function public.set_updated_at();
  end if;
end $$;
