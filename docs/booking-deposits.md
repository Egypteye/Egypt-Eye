# Booking deposits

Letting a decided customer secure a date with a deposit, without losing the
inquiry that already works.

## Status

**A design, not shipped code.** Nothing here exists yet.

Revised after a research pass into PayPal's current APIs, how tour and activity
platforms actually handle manually-confirmed bookings, and UK/EU consumer law
on deposits. That research **changed two recommendations in the first draft** —
both are called out below under *What the research changed*.

## This is not a new system

Most of it is already here. The reservation system has carried bookings since
`0001_init.sql`, and the Weekly Trips work added the hard part:

| Piece | Where | What it already does |
|---|---|---|
| `reservations` | `0001_init.sql` | reference, guest details, dates, travellers, `journey_snapshot`, a status machine (`requested → confirmed → in_trip → completed → cancelled → waitlisted`) |
| `book_departure_seats()` | `0018_weekly_trips.sql` | books seats under a row lock, so two people taking the last two seats of a twelve-seat bus cannot both win |
| `/api/trip-seats` | route | turns "two seats on 14 November" into an ordinary reservation |
| Accounts, RLS, guest claiming | `0001`, `claimGuestReservations.ts` | a signed-in traveller sees their own reservations, and a guest booking attaches itself when they later make an account |
| Team + customer email | `lib/email/templates.ts` | the desk is told, the traveller is confirmed |

There is **no payments table anywhere in `supabase/migrations/`**. That is the
whole gap. So this is not a booking system to build; it is one missing
dimension — money — on a reservation that already exists.

Designing it as a separate "bookings" feature would fork the status machine,
the account page, the admin list and the emails, and the two would drift. They
always do.

## What the research changed

Two positions from the first draft did not survive contact with the evidence.

### 1. Flat beats proportional — for a reason neither of us raised

The first draft argued for a proportional 20% deposit. That was wrong, and the
reason is legal rather than commercial.

Under the **Consumer Rights Act 2015**, a non-refundable sum must be a *genuine
pre-estimate of loss*, proportionate and transparent, or it risks being an
unenforceable penalty. The CMA's position is that keeping a substantial
prepayment in full, regardless of what the cancellation actually cost, is
likely to be unfair. And the **revised EU Package Travel Directive** moves
toward capping prepayments at **25% unless a higher one is justified**.

The asymmetry matters: 20% of a $3,000 journey is $600 held against a
cancellation that may have cost Egypt Eye nothing yet. A **flat $50** is
trivially defensible as the real cost of holding a date and doing the
admin — and it is the same number whether the trip is $200 or $5,000.

So the instinct in the brief was better than the first draft's advice. **Flat,
per-product, modest.** The proportional rule is dropped.

### 2. Do not take the money — hold it

This is the larger change, and it dissolves most of the brief's worries at
once rather than managing them with wording.

PayPal's Orders API supports `intent: "AUTHORIZE"`, which **places a hold on
the funds without moving them**. The authorization is valid for 29 days, with a
3-day "honor period" in which capture has the highest success rate. Capture
happens later, with the Payments API; an authorization that is never captured
is simply **voided** and the hold disappears.

This is what the platforms already do. Hipcamp holds funds when a request is
submitted and only captures when the host accepts. Viator, TourRadar and
Bookaway all distinguish instant-confirmation products from ones where *"your
payment method will show a pending charge, and the payment is only completed
once the operator confirms your spot"* — with manual confirmation typically
quoted as 1–3 business days.

Applied here:

| Worry in the brief | What authorize-don't-capture does to it |
|---|---|
| "I don't want to promise an instant refund we can't support" | There is nothing to refund. Voiding a hold is instant and reliable; refunds are slow and messy |
| "A payment succeeds but the booking cannot be confirmed" | The money never left the customer. The hold lapses |
| "Never tell the customer it is confirmed just because PayPal succeeded" | The customer's own statement says *pending*. The payment rail tells the truth for you |
| "Be transparent that a human confirms it" | A pending charge is the most honest possible signal that something is still being decided |

The transparency the brief asks for stops being a wording exercise and becomes
a property of the system.

**And it sets the SLA.** Capture is most reliable inside PayPal's 3-day honor
period, so the operational rule writes itself: *confirm or void within 72
hours, and promise 48.* That is a real number derived from the payment rail,
not a guess about how fast one person can work.

The cost is that this needs the Orders API and the PayPal JS SDK rather than a
hosted payment link — because a payment link is a "pay me now" instrument and
captures immediately. That is the trade: a somewhat larger build in exchange
for never owing anyone a refund for a date you could not confirm.

## The three paths, honestly compared

| | A. Manual PayPal links | B. Payment Links API | C. Authorize, capture on confirm |
|---|---|---|---|
| Build | none | small | moderate |
| Reconciliation | by hand, against name/email | `return_url` + webhook | `custom_id` + webhook |
| Money on an unconfirmable date | captured, must refund | captured, must refund | never moved, just voided |
| Customer's statement says | charged | charged | **pending** |
| "Confirmed" risk | high — payment looks final | high | low — the rail says pending |
| Dispute exposure | highest | high | lowest |

**Recommendation: C.** Not because it is more sophisticated, but because A and
B both require building a refund process, a refund policy and careful wording
to compensate for taking money too early — and C removes the need for all
three. The extra build in C is roughly the refund handling that A and B need
anyway.

There is a fourth path worth naming to dismiss it: **request first, pay after
confirmation.** It is the most honest of all and the simplest to build, but it
collapses into the WhatsApp inquiry you already have — Egypt Eye does the
availability work before anyone has committed to anything, which is the exact
cost the deposit exists to avoid. A free request is not a commitment signal.

## Payment verification: the rule that matters

**A customer landing back on your `return_url` is not proof of payment.** It is
a browser redirect. It can be replayed, bookmarked, interrupted by a dropped
connection, or simply never reached by someone who paid and closed the tab.

Payment state must come from one of two places:

1. a **verified webhook** — `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.DENIED`,
   and the authorization events — with the signature verified, either by the
   CRC32 method or by posting the payload and headers back to PayPal's
   verify-signature endpoint; or
2. a **server-side lookup** of the order or authorization at the moment you
   need to trust it.

The `return_url` is only ever used to show the customer a friendly page. It
never writes payment state.

`custom_id` is the reconciliation key: a caller-provided value that comes back
on the webhook and appears in settlement reports, and is not shown to the
payer. It carries the reservation `reference`, which already exists and is
already unique.

*(One thing I could not verify: whether the Payment Links API
(`POST /v1/checkout/payment-resources`) accepts `custom_id`. It is documented
on Orders API `purchase_units`, and PayPal's own developer site is unreachable
from this environment for a direct read. If path B is ever chosen, confirm that
field before relying on it — without it, reconciliation falls back to manual
matching.)*

## The published policy has to change

The site currently says, in `content/site.ts`, `content/faqHub.ts` and
`content/customizePage.ts`:

> A 20% down payment secures your reservation and is non-refundable. The
> remaining balance can be paid in cash or via PayPal at the end of the day or
> tour.

The first draft tried to preserve that line by making the deposit
proportional. The research says the opposite: a flat, modest deposit is the
*more* defensible instrument, so the published line is the thing that should
move.

It needs to change anyway, for a reason independent of the amount: it says
*non-refundable* without distinguishing the customer cancelling from Egypt Eye
being unable to confirm, and under the hold model nothing is charged until a
date is confirmed at all. The sentence describes a system that will no longer
exist.

This is a content change in three files plus `content/cancellationPolicy.ts`,
with `check:faqs` already watching for drift between the surfaces that quote
it. It is not a large job, but it has to land **before** the first deposit is
taken, not after.

## Price is a presentation problem, not a deposit problem

The deposit is a fixed amount per product and does not depend on the price.
What the price changes is how the deposit is *explained* — and the brief is
right that the second case is the more interesting one.

Measured against the content files:

| | Priced | Where the price lives |
|---|---|---|
| Tours (visible) | **31 / 31** | `content/tours.ts` |
| Photoshoots | **6 / 6** | `content/photoshoots.ts` |
| Weekly Trips | **7 / 7** | `trip_departures` in Supabase, per departure |
| Extra Experiences | **5 / 23** | `content/experiences.ts` |

So "no public price" is true of **18 Extra Experiences** — the camel ride, the
Fayoum and Siwa experiences, the Luxor balloon, Abu Simbel, the Hurghada and
Marsa Alam boat trips — plus custom journeys. Tours and photoshoots are fully
priced, and Weekly Trips are priced per departure rather than per trip.

Two presentations, chosen by whether a price exists:

**When the total is known:**

> Total — $199
> Deposit to secure your date — $50
> Remaining balance — $149, payable after your experience

**When it is not:**

> Deposit to secure your booking — $50
> Your final itinerary and price are confirmed with you separately.
> This $50 is credited toward your final price.

The second is the more valuable pattern for Egypt Eye, and it is honest in a
way a fake "from" price would not be: it says plainly that the price is still
to be agreed, while giving the customer one exact number they are committing
to now. The thing that makes it work is that **the one number shown is the
only number being charged** — which is precisely what the hold model
guarantees.

Both presentations must state that the deposit is credited, because an
uncredited deposit is a fee, and a fee needs saying out loud.

## The amount is data, not a constant

A fixed deposit per product, editable in the Studio as `depositUsd`, with a
site-wide default in Site Settings for anything unset. The brief's tiers —
$25, $50, $100 — are business numbers and belong where business numbers are
edited, not in a constant in the codebase.

Weekly Trips are the one case that may want the deposit per *departure* rather
than per trip, since a longer or more expensive departure may justify a larger
hold. `trip_departures` is where that would live, alongside `price_usd`.

A product with no deposit set and no default gets no button, which is the
correct failure: silence rather than a guess at what someone should be charged.

## Three things the idea gets wrong

### The published "non-refundable" policy needs narrowing

The site currently says, flatly, *"Deposits and payments are non-refundable."*
Three problems:

- it is the kind of blanket term the CRA treats as vulnerable, because it keeps
  the money regardless of what the cancellation actually cost;
- it does not distinguish the customer cancelling from **Egypt Eye being unable
  to confirm**, and keeping money in the second case is indefensible under any
  reading;
- under path C it is largely moot, because nothing is captured until a date is
  confirmed — but the words still need to match the system.

The replacement is narrower and stronger: *the deposit is non-refundable if you
cancel, because the date was held for you and costs were committed; it is never
taken at all if we cannot confirm your date.*

### A deposit is a hold, not a confirmation

"Secure Your Date" promises certainty that cannot be delivered without a live
availability calendar nobody maintains yet. The honest state machine is:

    awaiting deposit  →  held  →  confirmed

and the honest sentence is *"Your date is held. We will confirm within N
hours."* That is barely less satisfying than "Confirmed!" and it is true.

N must be a number Egypt Eye will actually hit. One person runs this; a promise
of one hour that takes nine is worse than a promise of twenty-four that takes
three.

### Deposit-first is wrong for the biggest bookings

This is the part of the concept worth pushing back on hardest.

For a photoshoot or a fixed-price day tour, "I know what I want, let me secure
it" is exactly right: a concrete thing, a small decision, a known price.

For a **custom multi-day journey with no published price**, asking for money
before the traveller knows whether the trip is $800 or $6,000 does not remove
friction — it adds doubt, at the highest-value end of the funnel, where the
WhatsApp inquiry is already working.

So *"Secure your date" is a per-product flag, not a site-wide feature.* On for
photoshoots, Weekly Trips and fixed-price day tours. Off for custom journeys,
where the inquiry is the correct first step.

## The two doors

The split the concept describes is right, and it should be visibly a choice
rather than a primary and a fallback:

    Need help deciding        →   Talk to us        (WhatsApp / email, unchanged)
    Already know what you want →  Secure your date  (deposit flow)

Nothing is removed. The WhatsApp route converts well and stays exactly as it
is; the deposit flow is an additional door for people who are already decided
and currently have to wait for a reply to do something they are ready to do.

## Data model

Extend `reservations` rather than adding a table:

```sql
alter table public.reservations
  add column if not exists deposit_amount   numeric check (deposit_amount >= 0),
  add column if not exists deposit_status   text not null default 'not_required'
    check (deposit_status in
      ('not_required','awaiting','authorized','captured','voided','refunded','failed')),
  add column if not exists deposit_held_at  timestamptz,  -- authorization created
  add column if not exists deposit_paid_at  timestamptz,  -- capture completed
  add column if not exists paypal_order_id  text,
  add column if not exists paypal_auth_id   text,         -- void or capture this
  add column if not exists paypal_capture_id text;        -- refund this, if ever
```

and extend the `status` check with `'checking'` and `'declined'`.

`deposit_status` carries the money; `status` carries the booking. They are
deliberately separate, because the whole point is that a held deposit does not
imply a confirmed booking.

`paypal_auth_id` is the operationally important one: it is what gets captured
on confirmation and voided on decline, and it expires. A booking whose
authorization is older than 72 hours with no decision needs to appear at the
top of the admin list, not quietly rot.

`reference` already exists, is already unique and already human-readable. It
becomes `custom_id` on the PayPal order, so the webhook can find the booking.

Writes stay service-role only, as `0001_init` already requires — a deposit
amount or a payment state must never be writable from a browser.

## The order of operations

**The reservation is created before PayPal, never after.** This is the single
most important decision in the design.

    1. customer picks date / people / name / email
    2. review: what is held, what is not charged, what happens next
    3. POST /api/reservations  →  row created, deposit_status 'awaiting'
    4. PayPal buttons render; the order carries custom_id = reference
    5. approval → authorization held → 'authorized', nothing charged
    6. a human confirms (capture) or declines (void)

If the row were created after payment, every abandoned checkout would be
invisible, and anyone who paid and then closed the tab would have paid for a
booking that does not exist. Creating it first means an unpaid booking is a
*lead the desk can follow up*, rather than nothing at all.

## The integration, concretely

1. **Create the booking first.** `POST /api/reservations` writes the row with
   `deposit_status: 'awaiting'` before PayPal is involved at all. An abandoned
   payment is then a lead to follow up, not a void.
2. **Create the order server-side** with `intent: "AUTHORIZE"`, the deposit
   amount, and `custom_id` set to the reservation `reference`.
3. **PayPal JS SDK buttons** on the secure page. On approval, the server
   authorizes and stores `paypal_auth_id`, moving `deposit_status` to
   `authorized`.
4. **The webhook is the source of truth.** A verified
   `PAYMENT.AUTHORIZATION.CREATED` / `.VOIDED` / `PAYMENT.CAPTURE.COMPLETED` /
   `.DENIED` writes the state. The `return_url` only renders a page.
5. **Admin confirms** → capture the authorization → `captured` + `confirmed`,
   confirmation email sent. **Admin declines** → void → `voided` + `declined`,
   alternatives email sent.

The webhook handler must be **idempotent** — PayPal retries, and the same event
will arrive twice. Keying on the PayPal event id and ignoring repeats is the
whole of it, and `lib/email/idempotent.ts` already establishes that pattern in
this codebase.

## A page, not a popup

The concept suggests a popup. A modal is the wrong container for this:

- it has no URL, so nobody can be sent back to it or emailed a link to resume;
- it cannot survive the round trip to PayPal and back;
- it cannot be the page the customer lands on when they return.

A light page at `/secure/[type]/[slug]` keeps every one of those and loses
nothing that matters — the speed comes from asking three things, not from
rendering in a layer above the page.

## Five states, never collapsed into two

The brief asks for these to stay distinct, and it is right — most of the
confusion in the industry complaints comes from collapsing 1 and 4.

| # | State | `status` / `deposit_status` | What the customer is told |
|---|---|---|---|
| 1 | Booking request received | `requested` / `not_required` | "We have your request." |
| 2 | Payment held | `requested` / `authorized` | "Your deposit is held — not yet charged." |
| 3 | Availability being checked | `checking` / `authorized` | "Our team is confirming your date." |
| 4 | Booking confirmed | `confirmed` / `captured` | "Confirmed. Your deposit has now been charged." |
| 5 | Cannot be confirmed | `declined` / `voided` | "We could not confirm that date. The hold has been released; here are alternatives." |

**State 4 is the only one that may use the word "confirmed", and only a human
moves a booking into it.** PayPal reporting a successful payment moves a
booking from 1 to 2. Never further.

## The wording

Drawn from how the platforms that do this well phrase it, adapted to Egypt
Eye's voice — plain, calm, no exclamation marks, no false urgency.

**Before paying**, on the secure page:

> **This is not an instant booking.** A member of our team checks availability
> for your date and confirms it personally — usually within 48 hours.
>
> Your card or PayPal account will show a **hold** for $50. Nothing is charged
> until we confirm your date. If we cannot confirm it, the hold is released and
> you are not charged at all.

**Immediately after paying:**

> **Your deposit is held and your request is with our team.**
> We are confirming your date now. You will have an answer within 48 hours.
> Nothing has been charged yet.

**On confirmation:**

> **Your date is confirmed.** Your $50 deposit has now been charged and is
> credited against your final price.

**When it cannot be confirmed:**

> **We could not confirm 14 November.** The hold on your deposit has been
> released — you have not been charged. Here are the nearest dates we can
> offer.

Three rules behind the wording: say *hold* rather than *payment* until capture;
never use "confirmed" before state 4; and always state the time to the next
human response, because the complaints in the research are almost all about
silence rather than delay.

## What the customer sees in their account

The booking appears immediately — including when they abandon payment, where
it reads *awaiting deposit* with a link to finish. Each state above has its own
line, so the account page answers "what is happening" without an email.

## What the team sees

`/admin/reservations` gains a filter for `awaiting` and two actions: **mark
deposit paid** (with the PayPal transaction pasted in) and **confirm**. Marking
paid moves `held`; confirming moves `confirmed` and sends the confirmation
email.

The existing team email on a new reservation already exists and needs only the
deposit amount and status added to it.

## Where to start

**Weekly Trips.** Every departure already carries a real price
(`trip_departures.price_usd`), a real capacity, an atomic seat booking and a
fixed date, so the only new decision is the deposit figure itself. If the flow is wrong, that is
discovered on seven trips rather than fifty-four products.

Then one photoshoot, which is the other shape — a time slot rather than a seat.
Then decide whether it goes further.

## What is deliberately NOT built

- **Live availability.** Not a code problem: it is a calendar somebody has to
  maintain daily. Until that is true, "held, we will confirm" is the honest
  interface — and the research suggests customers accept it readily when the
  wait is stated. Weekly Trips are the exception, since `trip_departures`
  already knows its seat count, so those could confirm instantly later.
- **Automatic booking confirmation.** The webhook is built, because payment
  state must never be read from a browser redirect — but it only ever moves a
  booking to *held*. A human moves it to *confirmed*. That is the whole point,
  and it is a product decision rather than a missing feature.
- **Balance tracking, reminders, refund automation.** Real work whose value
  depends on volume that does not exist yet. Note that refund automation is
  largely moot under the hold model: the common case is a void, not a refund.
- **Taking card details ourselves.** PayPal Checkout already offers cards to
  eligible customers, and no card data touching this site keeps it entirely out
  of PCI scope. That is a constraint to defend, not an omission to fix.
- **A deposit button on every product.** Per-product flag, off by default.

## The policy, scenario by scenario

The brief asked for seven situations. Under path C most of them stop being
refund questions, which is the point.

| Situation | What happens to the money | Why |
|---|---|---|
| **We cannot confirm the date** | Authorization voided. Never charged. | The customer gets nothing worse than a hold that lapses. Alternatives offered in the same message |
| **The experience becomes unavailable** after confirmation | Full refund of the captured deposit, or transfer to a new date at the customer's choice | Egypt Eye caused this; the customer should be whole |
| **We need to move the booking** | Customer chooses: new date, or full refund | Same reasoning |
| **Customer cancels** before confirmation | Authorization voided, nothing charged | Nothing has been committed yet on either side |
| **Customer cancels** after confirmation | Deposit retained | The date was held and costs committed. This is the one genuinely non-refundable case, and it is defensible precisely because the amount is small and fixed |
| **Customer changes the date** | Deposit transfers once, free, if asked more than N days ahead | Transferable beats non-refundable for goodwill, and costs almost nothing. A repeat change is a cancellation |
| **Customer does not respond** | Hold expires on its own; booking lapses to `declined` | No action needed, which is the right amount of work for silence |
| **Payment succeeds but booking cannot be confirmed** | Cannot occur in the normal path — nothing is captured until confirmation. If a capture ever happens in error, it is refunded in full, immediately, as a bug | The structural fix for the brief's hardest case |

Two principles underneath: **Egypt Eye's problem is never the customer's cost**,
and **the customer's change of mind is their own cost** — but only to the
extent of a small, disclosed, fixed amount.

The abuse protection the brief asks for comes from the deposit existing at all.
A fixed $25–$100 filters tyre-kickers without being worth gaming, and one free
date change is cheap generosity that removes most of the reasons someone would
argue.

## Legal, and the limit of this advice

Three findings from the research, none of which is a substitute for actual
advice:

- **Non-refundable terms must be proportionate.** Under the Consumer Rights
  Act 2015 a non-refundable sum must reflect genuine loss, be transparent and
  be disclosed before payment, or it risks being an unenforceable penalty. The
  CMA treats keeping a substantial prepayment regardless of actual cost as
  likely unfair. A small fixed deposit sits comfortably inside this; a large
  percentage does not.
- **Prepayment caps are coming.** The revised EU Package Travel Directive moves
  toward limiting prepayments to 25% unless a higher figure is justified. A
  flat deposit well under that is aligned with where the rules are heading.
- **Packages carry obligations beyond refunds.** Combining accommodation and
  transport may make a trip a *package*, triggering pre-contract information
  duties and insolvency protection. This is not hypothetical for an operator
  selling to European travellers.

What that means practically: the deposit flow is low-risk for photoshoots, day
tours and single experiences, and needs proper advice before it goes on
multi-day journeys. That boundary happens to match the product scope
recommended above, which is convenient but not a coincidence — the simple
products are simple legally for the same reason they are simple operationally.

This document cannot tell you where the package line falls for Egypt Eye, and
does not try to.

## What is still open

The first draft's five questions are now mostly settled by the brief and the
research. What remains:

1. **Confirm that `intent: "AUTHORIZE"` behaves as expected for the payment
   methods Egypt Eye's customers actually use**, in the PayPal sandbox, before
   anything is built on it. Card-funded holds through PayPal Checkout are the
   case to test specifically. If holds turn out not to work for a meaningful
   share of customers, path B plus a refund process is the fallback — and that
   decision should be made on a sandbox test, not on this document.
2. **The deposit per product.** The brief suggests $25 / $50 / $100 tiers.
   These are business numbers, not technical ones, and they belong in the
   Studio.
3. **N, for the free date change.** "More than 14 days ahead" is a reasonable
   default but it is Egypt Eye's call.
4. **Rewriting the published policy.** The current "20% down payment,
   non-refundable" line in `content/site.ts`, `content/faqHub.ts` and
   `content/customizePage.ts` has to change to match whatever is built, and
   `content/cancellationPolicy.ts` with it. That is a content change with a
   `check:faqs` guard already watching it.

## Sources

- PayPal, [Payment Links and Buttons API](https://developer.paypal.com/payment-links-buttons/create-payment-link) — `POST /v1/checkout/payment-resources`, reusable links, `return_url`
- PayPal, [Authorize and delay capture](https://developer.paypal.com/checkout/delay-capture) — `intent: "AUTHORIZE"`, 29-day validity, 3-day honor period, reauthorization
- PayPal, [Webhooks](https://developer.paypal.com/api/rest/webhooks/rest) and [event names](https://developer.paypal.com/api/rest/webhooks/event-names) — signature verification, `PAYMENT.CAPTURE.COMPLETED` / `.DENIED`
- PayPal, [Orders API use cases](https://developer.paypal.com/api/rest/integration/orders-api/api-use-cases/other-use-cases/) — `custom_id` / `invoice_id` reconciliation
- Hipcamp, [instant book vs request to book](https://support.hipcamp.com/hc/en-us/articles/360024822412-What-s-the-difference-between-instant-book-and-request-to-book-sites) — funds held on request, captured on acceptance
- TourRadar, [has my pending booking been confirmed](https://support.tourradar.com/en/customers/has-my-pending-booking-been-confirmed) and Bookaway, [what does pending mean](https://support.bookaway.com/hc/en-us/articles/4886079583645-What-does-it-mean-that-my-booking-is-pending) — pending-charge language, 1–3 business day manual confirmation
- Guesty, [request to book vs instant booking](https://help.guesty.com/hc/en-gb/articles/17298869126429-Setting-a-listing-s-booking-options-instant-booking-or-request-to-book) — approval windows and auto-expiry
- [Are non-refundable deposits legal in the UK](https://go-legal.ai/are-non-refundable-deposits-legal-in-the-uk-rights-guidance/) — CRA 2015, genuine pre-estimate of loss, CMA position
- Council of the EU, [revised package travel directive](https://www.consilium.europa.eu/en/press/press-releases/2025/12/02/consumer-protection-council-and-parliament-strike-a-deal-on-revising-rules-on-package-travel/) — 25% prepayment limit, insolvency protection
