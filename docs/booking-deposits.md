# Booking deposits

> **The deposit model changed.** It is no longer a flat per-product amount. It
> is a percentage of the backend price:
>
> ```
> booking value = (price × people) + Σ(extra price × quantity)
> deposit       = booking value × depositPercent      (default 25%)
> ```
>
> and the deposit is the **only** amount ever collected online. Sections below
> that describe `depositUsd`, `depositBasis` or `depositMaxUsd` describe a
> model that no longer exists; see "One price, one switch" at the end.

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

## A dialog in, a page back

The first draft argued for a page instead of a popup. That was half right, and
the half it got wrong was the half that matters to a customer.

The objection to a modal was never about speed — it was that a modal has no
URL, cannot survive the round trip to a payment provider, and cannot be the
page somebody lands on when they come back. All of that is true, and none of it
is an argument against opening the flow in a dialog. It is an argument that
**a dialog needs a page behind it**, which it does regardless.

So both exist, and they are not alternatives:

- **The dialog** opens from the product page. Someone reading about a
  photoshoot who already knows they want it should not lose the page they are
  reading in order to hold a date. Four fields, the deposit, the cancellation
  terms, done.
- **The page** at `/secure/[type]/[slug]` is the deep link, the no-JS
  fallback, and — the part that cannot be a dialog — the destination the
  payment provider redirects back to.

The booking the dialog produces is byte-identical to the one the page produces.
It is a second front door, not a second system.

### The cancellation terms belong in the dialog

Putting them in the dialog, above the button, is not a nicety. The research
into UK consumer law is specific: a non-refundable term is enforceable only if
it was **transparent and disclosed before payment**. A policy page the customer
never opened does not meet that; a paragraph they had to scroll past to reach
the button does.

So the dialog shows the real `cancellationSummary` from
`content/cancellationPolicy.ts` — never a paraphrase written for the dialog —
and links to the full policy. One source, as with every other surface that
quotes it.

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

## The popup, second pass

The dialog was rebuilt after the pilot went live. Six changes, and the reasoning
behind the two that look like they contradict earlier decisions in this
document.

**It is two steps, not one screen.** Step one is the session — date, time,
headcount, extras. Step two is who you are — name, country code and phone,
optional email, the terms, the pay button. The running total sits in a pinned
bar across both so the figure never scrolls out of sight while the extras are
being chosen. One screen holding all of it is a wall, and a wall on a phone is
an abandoned booking.

**The button says "Instant Booking".** This reverses the label, not the
promise. Booking here really is instant in the sense a customer means: choose a
date, pay, finished, in one popup, with no account and no waiting for a reply
before you can commit. What is not instant is narrower — the date becomes final
when a person has checked it — and that is stated in full, above the pay
button, before any money moves. The old "This is not an instant booking" framed
the whole flow by its slowest part, undersold a product that genuinely is fast,
and would now read as a contradiction of the button. The rule that has not
moved an inch: nothing may claim the date **is** confirmed until a person says
so, and `claimsConfirmation()` still enforces it.

**The 48-hour promise is gone everywhere.** It was a deadline the site was
making on Egypt Eye's behalf, on every booking, repeated into the emails, the
account page and the admin panel. Nobody had committed to it. A promise with a
clock on it is only worth printing if someone is accountable for the clock, so
the copy now says what happens rather than when. `check-booking.mts` sweeps
every customer-facing sentence for a reply window and fails if one returns.

**An email address is optional; a way to reach you is not.** Requiring an
account or an address to hold a date loses bookings from people who are ready
to pay, and buys nothing — an address nobody verifies is not identity. The
required field is the phone number, with a mandatory country code, because a
bare `010…` is undialable from outside Egypt. The underlying rule is "at least
one usable channel", stated identically in `reservations_contact_present_check`
and in the route, deliberately, so the two cannot disagree. The two front doors
satisfy it differently: the popup allows no email so it insists on a number,
the `/secure` page requires an email so a number there is a bonus.

Everything downstream had to learn about it. The acknowledgement email is
skipped rather than failed; the response reports whether one was sent, so the
dialog tells a guest to keep their reference instead of promising a copy that
will never arrive; the team email carries a **NO EMAIL ADDRESS** banner; and
the admin confirm and decline actions say, in the same message that reports the
decision, that nobody has been told and somebody has to call.

**Extras are selected here and settled with the balance.** The PayPal payment
link is a fixed amount per deposit tier, so a variable extras total cannot be
charged through it. Nothing may add the two into a single figure a customer
could mistake for what they paid, which is why the footer shows two numbers:
what is taken now, and what is not. The prices live on the product and are
resolved on the server from the labels the browser sends — a price arriving in
a request body would be a price the customer set themselves, the same rule the
deposit amount has always followed.

**Extras and times are editable in the Studio with the repo as the default.**
`timeSlots` and `extras` follow the same three-case rule as every other array
in `lib/sanityShape.ts`: a Studio document that has never had them typed in
projects null and falls back to the content file, so the popup is complete
before anyone edits the CMS, while an editor who empties the list in Studio
gets an empty list rather than the repo's copy back.

### Two bugs a browser found and reading could not

Both were invisible in the markup and would have shipped.

The floating WhatsApp bubble is `fixed bottom-6 right-6 z-50`. The dialog was
also `z-50` and the bubble comes later in the DOM, so on a phone the green
circle sat directly on top of the dialog's primary button — Playwright reported
that the WhatsApp link "intercepts pointer events", which is precisely what a
thumb would have found.

Worse: the newsletter popup opens nine seconds after page load, on a timer that
fires once. Nine seconds is well inside the time it takes to fill in a date, a
phone number and a few extras, so it would appear over a half-finished booking.

`lib/ui/modalLock.ts` is the fix for both. While a dialog owns the screen,
nothing else may open over it and the floating buttons step aside. A z-index
alone would have fixed neither properly — stacking the newsletter behind the
dialog leaves it waiting there, to be revealed the moment the customer
finishes.

## PayPal, for real

The payment adapter was built to be filled in later. This is later.

### What runs

A REST app's client id and secret in the environment make `paymentProvider()`
return a real PayPal provider instead of `disabledProvider`, and the booking
popup renders PayPal's own buttons inline. The customer never leaves the page:
they choose a date, add extras, enter a name and phone, and pay, in one dialog.

The order is created **server side** when the booking is saved, with the amount
read from the product and the booking reference in `custom_id`. That last
detail is the one that pays for the whole integration: PayPal echoes `custom_id`
back on the order and on every webhook, so a payment finds its own booking. The
payment-link rail could not do that — it asked the customer to type a reference
into a PayPal note and asked the desk to read it back out.

### What the browser is allowed to say

Nothing. It reports that the customer approved, and hands back an order id that
we issued. `/api/bookings/paypal/capture` then asks PayPal, with our own
credentials, and checks three things against the reservation:

- the order id is the one stored on this booking when it was created;
- PayPal's `custom_id` is still this reference;
- the amount PayPal reports equals the deposit we recorded.

A mismatch leaves the booking unpaid and tells a human. That is the right
outcome even though it is the inconvenient one: a booking wrongly marked paid
is money nobody will chase and a date held for free.

A capture that comes back `PENDING` is not money in the account and is not
reported as money in the account.

### CAPTURE or AUTHORIZE

`PAYPAL_INTENT` decides, and the customer-facing wording follows it
automatically — that is the point of `PaymentMode` describing the money rather
than the rail.

**CAPTURE** (the default) takes the deposit when the customer approves. It is
what "instant payment" means, and it is what the payment links already did, so
switching rails does not silently change what happens to anyone's money. A date
Egypt Eye cannot do means a refund, which `declineBooking` now issues through
the API rather than leaving as a note for someone to action in the dashboard.
PayPal keeps its fixed fee on a refund, so a declined booking costs a little.

**AUTHORIZE** only holds the money, and a person captures it on confirming. On
paper it fits this booking model better: an uncapturable date costs the
customer nothing and needs no refund at all. In practice it is not free —
PayPal honours an authorization for 3 days and allows capture up to 29, after
which a capture can fail or come back short, and not every funding source
supports it. It is one environment variable away if the refund fees ever
justify the operational care.

Either way the rule that has never moved: **a payment cannot confirm a
booking.** `stateAfterPaymentHeld` enforces it, the webhook refuses to write
rather than violate it, and `check-booking` asserts it against every state.

### The webhook is the backstop, not the mechanism

The capture route settles the common case while the customer is still looking
at the screen. The webhook exists for everything that happens after they close
the tab: a payment PayPal reviews for an hour, a refund issued from the
dashboard, a dispute. Without `PAYPAL_WEBHOOK_ID` set, **every** delivery is
refused — with no webhook id there is no way to tell PayPal from anyone else
POSTing to a public URL, and accepting one would let a stranger mark any
booking paid. Payments still work without it; late news does not arrive.

Deliveries are idempotent by construction: each is inserted into
`payment_events` keyed by PayPal's own event id under a unique index, so a
duplicate insert fails and a repeat delivery becomes a no-op. PayPal retries for
days, so this is not a hypothetical.

### The bug this shipped with, and the guard that now catches it

Three surfaces each worked out what happens to the customer's money — the
product page, the secure page and the booking route — and all three asked "is
there a payment link?". That question answered it only while a link was the
only way money could move. With an API order capturing, the pages said *"your
deposit is held, not charged"* about money PayPal had already taken.

`resolveRail()` is now the single answer and all four read it. `check-booking`
asserts the ordering, that the API rail drops the link rather than offering
both, and the property underneath: a rail that takes money always says what
happened to it, and a rail that takes none never claims anything did. Breaking
each one in turn fails the check.

The same mistake was still in two pieces of copy — the product-page caption and
the dialog's terms both promised a refund under a hold, where the honest word
is *released*. Both now follow the mode.

#### The fourth time, and the part a static page cannot answer

It then happened once more, in the one place `resolveRail()` could not fix.
Three surfaces called it with `{ isAdmin: false }` hardcoded, because they are
statically rendered and a page built at deploy time cannot know who is reading
it. The booking route called it with the real viewer. For a customer the two
agree exactly. For the one person they don't — an admin testing PayPal's
sandbox on the live site, who is deliberately the only visitor offered the
sandbox at all — the page said **"No payment now"** and then the route handed
them PayPal buttons.

The visible symptom was two symptoms, and they had one cause. `"No payment
now"` is the same branch that suppresses `Pay now $50`, so the per-person total
was being computed correctly and never shown. Underneath it, the breakdown that
would have shown the arithmetic asked for two quote lines, and a per-person
deposit for a group produces exactly one line charged twice — so the one case a
customer most wants to check was the one case nothing explained.

The fix is in two halves, because the problem has two halves:

* `productRail()` assembles the offer, the rail and the provider in one place,
  and the pages, the secure page and the booking route all read it. No surface
  may call `resolveRail` or `paymentProviderFor` for itself; `check-quote`
  greps for it and fails if one does.
* `GET /api/bookings/rail` answers the viewer-dependent half. The popup asks it
  on open — not on page load, so a visitor who never opens it costs nothing —
  and keeps the page's answer if the request fails. The static page stays
  static and stays correct for customers; the one visitor it cannot see asks
  for themselves.

What this still cannot guarantee: a customer whose page was cached before a
deposit changed sees the old figure until it revalidates. That is survivable
only because the figure on screen is never the figure charged — the route
recomputes from the product and its own copy of the rules, and a mismatch
between the two is caught at capture, not after. The popup's number is a
courtesy; the route's number is the contract.

Two things surfaced while fixing it, both on the secure page, both because it
writes its own copy instead of reading the shared sentences:

* The promised **"usually within 48 hours"** was still there. It had been
  removed from `wording.ts` and pinned by a check — but that check guards the
  module, and a page with a hardcoded string is not the module. `check-booking`
  now reads the booking surfaces themselves and fails on a duration standing
  next to a reply, while leaving durations that are facts about a product ("a
  3-hour session") alone.
* The page asks for a headcount and the route charges per person, yet it showed
  a bare figure and called it *"the only amount you pay now"*. It was asking
  `resolveDeposit`, which knows nothing about per-person rules. It now reads
  `offer.perPerson` and says *per person* out loud.

### What was proven, and what was not

`check-paypal.mts` runs everywhere and covers the reasoning: money compared in
whole integer cents, `PAYPAL_ENV` falling back to sandbox rather than live,
`PAYPAL_INTENT` falling back to CAPTURE rather than to holds nobody is watching,
the money mode derived from the intent, and a webhook with any signature header
missing refused before a network call.

**The round trip was never executed here** — PayPal is not reachable from the
environment this was written in. `npm run paypal:smoke` is what proves it, with
real credentials: it authenticates, creates an order, reads it back, checks that
`custom_id` and the amount survive, and verifies the webhook id exists on the
account. It refuses to touch live without being asked twice.

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


## One price, one switch

The rebuild replaced two competing sources of truth with one.

Before, a product carried a `price` (never displayed, used for admin and
discounts) **and** a `depositUsd` (charged, unrelated to the price). Nothing
kept them in step. A product could show a $25 deposit beside a $200 price, and
changing the price left the deposit saying something nobody meant.

Now there is one input per product:

| Field | What it does |
|---|---|
| **Price** | The per-person price. The only money input. Shown on the page when set. |
| **Instant Booking** | Whether it is offered online. |
| **Deposit percentage** | Optional per-product override of the site default. |

`depositUsd`, `depositBasis`, `depositMaxUsd` and the per-extra deposit fields
are **gone**, not deprecated — a field that still parses is a field that still
fights. The documents in Sanity keep whatever was in them; nothing reads it.

### The two halves of Instant Booking

A price makes a booking *possible*; the switch makes it *offered*. They are
deliberately separate, because a price is also just information:

| Price | Instant Booking | Page shows |
|---|---|---|
| not set | off | no price, no button |
| set | off | the price, no button |
| set | on | the price and the button |

`isInstantBookable()` answers both at once and **everything** reads it — the
badge, the product page, the booking route, the quote. `InstantBookingBadge`
deliberately takes the product rather than a boolean, so a card cannot be told
it is bookable by something that worked it out differently. Turning the switch
off, or clearing the price, removes the badge and the button everywhere at
once because only one function decides.

### Why the prices are now visible

The site shows "Enquire for Pricing" over a real figure everywhere, on purpose.
Instant Booking is the one exception, and it has to be: the popup shows the
customer `$200 × 2 = $400, 25% = $100`, and a page that refuses to name a price
beside a popup that names one reads as a trick. So `PriceTag` takes an opt-in
`reveal` flag, and only photoshoots and experiences pass it. Tours are
unchanged.

### What the percentage cannot do by itself

The site states the deposit share in three static sentences — the FAQ, the
Customize page and the site policies — that a customer reads long before the
popup. Those cannot follow a Studio change on their own. `check-quote` asserts
that every published percentage equals `DEFAULT_DEPOSIT_PERCENT`, so changing
the default in the Studio without changing the copy fails the check loudly
rather than contradicting itself quietly on the live site.

### Extras

Extras carry a price and a quantity. They are part of the booking total, so the
deposit percentage applies to them — a change of promise from "settled with the
balance", and the wording moved with it. Quantities are clamped at both ends:
an invalid quantity resolves to *not taken* rather than being clamped upward,
because inventing a charge the customer did not make is the worse error.

### Weekly Trips are not on this model

They were asked for and are deliberately not included. Weekly Trips already
have backend pricing — `departures.price_usd` in Supabase, edited at
`/admin/departures` — and their own booking route that holds seats against a
finite capacity with a row lock. Putting them on the deposit rail means
deciding what happens when a payment fails *after* seats are held, and getting
that wrong oversells a departure or takes money for a seat nobody holds. That
is a design question, not a wiring job, and it is the one thing this system was
rebuilt to stop doing in a hurry.
