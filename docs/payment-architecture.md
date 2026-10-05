# Payment architecture — proposal

Written before any code, after reading the current implementation end to end and
PayPal's current guidance. It states what we have, what is wrong with it, what I
propose instead, and — deliberately — what the proposal still cannot guarantee.

Sources that changed a decision are cited inline.

---

## 1. What exists today

**Three tables.** `reservations` is one row per booking, carrying both the
booking state (`status`) and the money state (`deposit_status`) in separate
columns so a payment can never imply a confirmed date. `payment_events` is an
append-only log of PayPal webhooks with a unique index on
`(provider, event_id)`. `notification_log` claims an email before sending it,
on a unique `idempotency_key`.

**The flow.** `POST /api/bookings` validates, inserts the reservation, **sends
the customer and team emails**, creates a PayPal order, stores its id, and
returns that id to the browser. The buttons approve; `onApprove` posts to
`/api/bookings/paypal/capture`, which re-reads the order from PayPal, checks the
reference and the amount, captures, and writes the result. A webhook applies
later state changes.

**The amount** is a flat per-product figure (`depositUsd` in Sanity). Extras are
recorded on the booking but are not part of the deposit and are never charged.

Three properties of this are worth keeping, and the proposal keeps all three:

- money state and booking state are separate columns, so no payment can confirm
  a date;
- the browser is never believed — the capture route re-asks PayPal and compares
  against the reservation;
- an unverified webhook is refused outright.

---

## 2. What is wrong with it

Ordered by what they cost, not by how hard they are to fix.

**2.1 The capture only happens if a browser comes back.** This is the serious
one, and it is the opposite of PayPal's guidance. With `CAPTURE` intent the
buyer's approval authorises the charge but does not collect it; the capture call
does. Today that call is made by `onApprove` in the customer's browser. A
customer who approves and then closes the tab, loses signal, or has the page
crash has agreed to pay and we never take the money — silently, with the booking
sitting in `awaiting` and nothing anywhere saying a payment was abandoned
mid-flight. PayPal's documented answer is to run the capture leg off the
`CHECKOUT.ORDER.APPROVED` webhook, with the browser call as an accelerator
rather than the mechanism.
([webhook guidance](https://developer.paypal.com/docs/checkout/apm/reference/subscribe-to-webhooks/))

**2.2 Emails go out before anybody has paid.** Both the customer email and the
team email are sent at booking creation. The customer email already hedges and
the team email now says "PAYMENT STATUS: NOT YET RECEIVED", so nothing it says
is false — but a confirmation that arrives before the money does is a
confirmation in the reader's mind, and the team email is noise on every
abandoned checkout.

**2.3 One order per booking, with no history.** `payment_order_id` is a single
column on `reservations`. A customer who abandons one checkout and starts
another overwrites it. A failed attempt followed by a successful one leaves no
record that the first happened, and there is nowhere to put the state of an
attempt that is neither the booking's state nor a webhook event.

**2.4 Idempotency keys are per booking, not per attempt.** `PayPal-Request-Id`
is `settle-{reference}`. PayPal stores that id and returns *the result of the
original call* for up to 45 days
([idempotency](https://developer.paypal.com/api/rest/reference/idempotency)).
So a genuine second attempt on the same booking — after a first one failed —
can be answered with the first one's failure. The key has to be per attempt.

**2.5 The webhook trusts its own payload.** It reads `custom_id`, the resource
id and the status straight out of the delivery. PayPal's advice is to fetch the
order fresh on each webhook rather than act on the body. More concretely: the
webhook never checks the amount, so the one guard the capture route has is
missing from the path that will eventually matter more.

**2.6 Nothing sweeps.** If a webhook is lost and the browser never came back,
the booking stays `awaiting` forever. There is no reconciliation.

**2.7 The team email is not idempotent.** It uses `sendEmail` directly rather
than `sendIdempotentEmail`, so a retried request sends it twice.

**2.8 The amount cannot express what you now want.** A flat figure cannot say
"$25 per person plus $10 for a reel", and `addons_total` is recorded but never
charged.

**2.9 No record of *why* an amount was charged.** `deposit_amount` is stored,
which is the important half, but nothing records the rule that produced it. A
dispute six months after someone edits Sanity cannot be answered from the data.

---

## 3. Proposed architecture

### 3.1 Pricing is a pure function over authoritative configuration

Configuration lives in Sanity, per product:

```
depositBasis    "perPerson" | "fixed"
depositUsd      the per-person rate, or the fixed amount
depositMaxUsd   optional cap, so a party of 20 cannot produce a $500 deposit
extras[]        label, priceUsd, depositUsd, depositBasis ("booking" | "person")
```

A pure, server-only function turns a *selection* into a **quote**:

```
quoteDeposit(product, { people, extraLabels }) -> Quote
Quote = {
  lines: [{ kind, label, unitCents, quantity, amountCents }],
  totalCents, currency,
  productSlug, productTitle,
  computedAt, rulesFingerprint
}
```

Everything is integer cents from end to end; there is no float in the path. The
browser sends only `people` and a list of extra **labels**. It never sends a
price, and `quoteDeposit` ignores anything it is handed that is not on the
product.

Invalid configuration — negative, non-integer cents, a per-person rate with no
people — yields **no quote**, which means no deposit button, not a guessed
figure. That rule already exists for the flat amount and carries over.

### 3.2 A payment attempt is a row, not a column

```
payment_attempts
  id                uuid pk
  reservation_id    uuid not null references reservations
  provider          text not null default 'paypal'
  provider_order_id text unique
  status            text   -- created|approved|captured|failed|cancelled|expired|refunded|reversed|mismatch
  amount_cents      int not null
  currency          text not null default 'USD'
  quote             jsonb not null      -- the snapshot, immutable
  create_request_id uuid not null       -- PayPal-Request-Id for order creation
  capture_request_id uuid not null      -- PayPal-Request-Id for capture
  capture_id, authorization_id text
  fulfilled_at      timestamptz         -- emails sent
  created_at, updated_at, approved_at, captured_at, failed_reason
```

Two database guarantees, not application checks:

```sql
-- One booking can never have two captured payments.
create unique index payment_attempts_one_capture_idx
  on payment_attempts (reservation_id) where status = 'captured';

-- One PayPal order can never be recorded twice.
create unique index payment_attempts_order_idx
  on payment_attempts (provider, provider_order_id);
```

The first is the answer to most of the duplicate scenarios in one line. Two
tabs, a double click, a retried request and a redelivered webhook can all race
to capture; at most one row can land in `captured`, and the loser reads the
winner's row and reports the same truth.

`reservations` keeps `deposit_status` as the money state and gains
`paid_attempt_id`. The quote is snapshotted onto the reservation too, so the
booking is readable without a join.

### 3.3 The capture leg moves to the webhook

| Event | What it means | What we do |
|---|---|---|
| `CHECKOUT.ORDER.APPROVED` | the buyer approved; money is **not** collected | re-read the order, verify, **capture** |
| `PAYMENT.CAPTURE.COMPLETED` | money is in the account | mark captured, **fulfil** |
| `PAYMENT.CAPTURE.PENDING` | PayPal has it but has not credited it | record; do **not** fulfil |
| `PAYMENT.CAPTURE.DENIED` / `DECLINED` | it failed | attempt `failed` |
| `PAYMENT.CAPTURE.REFUNDED` / `REVERSED` | money went back | attempt `refunded`/`reversed` |
| `CHECKOUT.PAYMENT-APPROVAL.REVERSED` | approved but never captured, now void | attempt `expired` |

The browser's `onApprove` still posts to the capture route, because a customer
watching the screen should get an answer in two seconds rather than whenever a
webhook lands. But it is now one of two callers of the same idempotent routine,
and the routine is safe to run from either. If the browser never comes back, the
webhook does the identical thing.

`PAYMENT.CAPTURE.PENDING` not fulfilling is explicit in PayPal's guidance, and
the capture status must be read from `purchase_units[].payments.captures[].status`
rather than from the order status
([capture_status](https://developer.paypal.com/api/payments/v2/definitions/capture_status/)).

### 3.4 Fulfilment is a separate, retryable step

Capturing money and telling people about it are different operations with
different failure modes, and the second must never be able to corrupt the first.

```
capture succeeds -> attempt.status = 'captured', captured_at set   [committed]
                 -> fulfil(attempt)                                [separate]
                      -> customer email   (idempotent, key = capture:{capture_id}:customer)
                      -> team email       (idempotent, key = capture:{capture_id}:team)
                      -> attempt.fulfilled_at = now
```

If fulfilment throws, the payment stays captured and `fulfilled_at` stays null.
A webhook redelivery, the reconciliation sweep, or an admin button re-runs it.
The emails themselves are claimed in `notification_log` before sending, which
already exists and is already race-safe, so re-running cannot double-send.

Both emails carry the snapshot: customer, service, guests, date and time,
extras, the full deposit breakdown line by line, the exact amount captured, the
currency, the PayPal order id, the capture id, the payment status and the
booking reference.

### 3.5 Verification at every boundary

Nothing is believed because it arrived:

- the browser supplies only an order id that we issued;
- on every settlement, the order is re-read from PayPal with our own
  credentials;
- `custom_id` must equal the reservation reference;
- the captured amount must equal `payment_attempts.amount_cents` exactly, in
  integer cents;
- the capture status must be `COMPLETED`.

Any mismatch sets the attempt to `mismatch`, leaves the booking unpaid, and
raises it in admin. It never resolves itself quietly in either direction.

### 3.6 Idempotency keys

`PayPal-Request-Id` must be unique per request *and per call type*, and PayPal
recommends a UUID because of a 38-character limit
([idempotency](https://developer.paypal.com/api/rest/reference/idempotency)).
So each attempt carries two generated UUIDs — one for creating the order, one
for capturing it — stored at creation and reused verbatim on every retry of
*that* operation. A new attempt gets new ids, so a genuine retry after a failure
is never answered with the old failure.

### 3.7 Reconciliation

A sweep, runnable from cron, from admin, and opportunistically:

1. attempts in `created`/`approved` older than ~20 minutes → ask PayPal for the
   order; capture if approved-and-uncaptured, expire if PayPal says so;
2. attempts `captured` with `fulfilled_at is null` → re-run fulfilment;
3. anything in `mismatch` → surface, never auto-resolve.

PayPal rate-limits order lookups, so the sweep is bounded and ordered oldest
first rather than polling everything.

---

## 4. The duplicate scenarios, one by one

| Scenario | What stops it |
|---|---|
| Double-click the pay button | PayPal's own `PayPal-Request-Id` on capture returns the first result; the partial unique index allows one `captured` row |
| Two tabs, two orders | Two attempts, one capture — the index rejects the second |
| Refresh mid-capture | Same `capture_request_id`, same answer from PayPal |
| Reopening a payment session | New attempt, new order, new request ids; prior attempt expires |
| Network timeout after capture | The capture happened at PayPal; the webhook or the sweep records it |
| Our retry of a capture call | Same request id → PayPal replays the original result |
| Webhook delivered twice | `payment_events (provider, event_id)` unique — second insert fails, handler returns early |
| Webhook after the browser already captured | Both run the same routine; the index and the state machine make the second a no-op |
| Customer pays once, many events | Events are a log; state transitions are monotonic |
| Several attempts, one booking | Allowed by design; only one can be `captured` |
| Capture succeeds, our request times out | Money is at PayPal; webhook or sweep reconciles |
| Email sent twice | `notification_log.idempotency_key` unique, claimed before sending |
| Email fails after payment | Payment stays captured; `fulfilled_at` null; retried |

---

## 5. What this architecture cannot guarantee

Stated plainly, because a design that claims none of these is lying.

- **A payment we never hear about.** If PayPal captures and every webhook is
  lost and the sweep window is missed, the money exists and our record does not.
  The sweep bounds how long that can last; it cannot make it impossible.
- **Email delivery.** `notification_log` guarantees we send at most once and
  know whether the provider accepted it. It cannot guarantee the message
  arrives, is not filtered, or is read.
- **Two bookings for one intent.** A customer who books the same date twice from
  two devices has made two bookings, both valid. We can detect and flag the
  overlap; preventing it would mean refusing legitimate bookings.
- **Clock and ordering.** Webhooks arrive out of order. The state machine only
  moves forward, so a late `approved` cannot un-capture — but "latest event
  wins" is not available to us and we do not pretend it is.
- **PayPal's own state.** Disputes, chargebacks and account-level holds happen
  inside PayPal. We record what we are told.
- **Human error in configuration.** A deposit rule typed as 2500 instead of 25
  will produce $2,500 quotes. Validation catches the implausible; it cannot read
  intent. Snapshots mean at least the damage is visible and bounded.

---

## 6. Migration plan

Nothing in this breaks what works today. In order:

1. `payment_attempts` table, indexes, and `reservations.paid_attempt_id`.
   Existing rows keep working; the current columns stay.
2. `quoteDeposit` and the Sanity fields, defaulting to today's behaviour when
   only `depositUsd` is set — so nothing changes until the team sets a rule.
3. Booking creation writes an attempt and stops sending emails.
4. Capture and webhook both call one `settleAttempt` routine.
5. `CHECKOUT.ORDER.APPROVED` handling.
6. Fulfilment step and the admin retry.
7. Reconciliation sweep.
8. Tests per section 12 of the brief, against sandbox, before any of it is
   pointed at live.
