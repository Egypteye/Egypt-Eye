# Booking deposits

Letting a decided customer secure a date with a deposit, without losing the
inquiry that already works.

## Status

**A design, not shipped code.** Nothing in this document exists yet. It is
written to be argued with before anything is built — the open questions at the
end are real, and two of them change the shape of the whole thing.

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

## The conflict to resolve first

The site already publishes a deposit policy, in `content/site.ts`,
`content/faqHub.ts` and `content/customizePage.ts`:

> A 20% down payment secures your reservation and is non-refundable. The
> remaining balance can be paid in cash or via PayPal at the end of the day or
> tour.

A flat $50 contradicts that in every one of those places:

- the 1 Day Giza Tour is $89, so 20% is **$17.80** — a flat $50 is nearly three
  times the published rate;
- a $3,000 custom journey would be held on **1.7%**, which is not a commitment.

This is not a checkout detail. It is a published promise, quoted on tour pages,
in the FAQ and on the Customize page, and the FAQ system has a build check
(`check:faqs`) specifically to stop policy text drifting between surfaces.

Two honest ways out, and only two:

1. **Keep the published policy and make the deposit proportional.** 20% where a
   price exists; a flat holding fee only where one genuinely does not. Same
   mechanism, honest in every case, nothing to rewrite.
2. **Move to a flat deposit everywhere** — a legitimate business decision, but
   then it is a *policy change made in those three content files first*, and
   the FAQ, the Customize page and every tour sidebar change with it.

This document assumes (1), because it needs no promise to be withdrawn.

## Which products actually lack a price

The concept assumes *"a large part of the website does not show a final price"*.
Measured against the content files, that is true of one category and not the
others:

| | Priced | Where the price lives |
|---|---|---|
| Tours (visible) | **31 / 31** | `content/tours.ts` |
| Photoshoots | **6 / 6** | `content/photoshoots.ts` |
| Weekly Trips | **7 / 7** | `trip_departures` in Supabase, per departure — not the content file |
| Extra Experiences | **5 / 23** | `content/experiences.ts` |

So the unpriced population is **18 Extra Experiences** — the camel ride, the
Fayoum and Siwa experiences, the Luxor balloon, Abu Simbel, the Hurghada and
Marsa Alam boat trips — plus custom journeys built through `/customize` and the
reserve wizard, which have no fixed price by definition.

That matters, because it means the proportional rule covers **44 of the 60
bookable products** without needing a flat fee at all, and the flat holding fee
is the exception rather than the norm. A design built the other way round —
flat fee first, proportional as a special case — would be solving for the
smaller half.

Weekly Trips are the subtle one: they are priced, but the price is a property of
the *departure*, not the trip, so a deposit for them is 20% of
`trip_departures.price_usd` for the date chosen, and it changes with the date.

## The amount is data, not a constant

Hardcoding any number is the mistake. The deposit belongs on the product, as
`depositUsd`, editable in the Studio, with a site-wide default in Site Settings
and a rule applied when the field is unset:

- product has a price → 20% of it, rounded to whole dollars (for a Weekly
  Trip, 20% of the chosen departure's price, which varies by date);
- product has no price → the site-wide flat holding fee, which today means the
  18 unpriced Extra Experiences and custom journeys;
- product is not bookable this way → no deposit, no button (see below).

That keeps a $89 day tour asking $18, a weekly trip asking 20% of its real
price, and a custom journey asking the flat fee to hold a date — from one rule,
with no per-product arithmetic for anyone to get wrong.

## Three things the idea gets wrong

### Taking money before confirming needs a refund rule the policy does not have

If someone pays to secure 14 November and the photographer turns out to be
booked, keeping that money is indefensible, and PayPal will side with the
customer. The current policy — *deposits are non-refundable* — does not
distinguish the two cases that matter:

- **the customer changes their mind** → non-refundable, as published, and
  defensible: costs are committed on their behalf;
- **Egypt Eye cannot confirm the date** → refunded in full, always.

That second line is what makes taking money before confirming honest, and it
has to appear at the payment step, not only on `/cancellation-policy`.

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
  add column if not exists deposit_amount  numeric check (deposit_amount >= 0),
  add column if not exists deposit_status  text not null default 'not_required'
    check (deposit_status in ('not_required','awaiting','paid','refunded')),
  add column if not exists deposit_paid_at timestamptz,
  add column if not exists deposit_txn     text;  -- PayPal transaction, entered by the desk
```

and extend the existing `status` check with `'held'`.

`reference` is already unique and already human-readable; it becomes the
booking reference the customer quotes and the desk matches against. Nothing new
needs generating.

Writes stay service-role only, exactly as the existing comment in `0001_init`
requires — a deposit amount must never be writable from a browser.

## The order of operations

**The reservation is created before PayPal, never after.** This is the single
most important decision in the design.

    1. customer picks date / people / name / email
    2. review: what is charged now, what is not, what happens next
    3. POST /api/reservations  →  row created, deposit_status 'awaiting'
    4. reference shown, PayPal link opened
    5. customer returns to a page that knows what they just did

If the row were created after payment, every abandoned checkout would be
invisible, and anyone who paid and then closed the tab would have paid for a
booking that does not exist. Creating it first means an unpaid booking is a
*lead the desk can follow up*, rather than nothing at all.

## Reconciling PayPal

This is the real constraint, and it deserves to be stated plainly: **a static
PayPal link does not say which booking paid.** Twenty $50 payments arrive and
nothing maps them to twenty reservations.

| Approach | How | When |
|---|---|---|
| **Manual, by reference** | the reference is shown prominently and the customer is asked to put it in the PayPal note; the desk matches and marks it paid in `/admin/reservations` | **Start here** |
| PayPal Smart Buttons | the JS SDK with `custom_id` set to the reference, so payment and booking arrive linked | the right second step |
| Webhooks | payment confirms the booking without anyone looking | only once volume justifies it |

Manual is genuinely adequate at current volume, and it keeps a human at the one
moment a human should be there: deciding whether the trip can actually run. The
work is one click per booking, and the alternative is an integration that has
to be maintained before it is needed.

Nothing above paints the later steps into a corner: the reference is in the
payment either way, so moving to `custom_id` later changes how it gets there,
not what it means.

**No card data ever touches the site.** PayPal-only keeps this entirely out of
PCI scope, and that should be treated as a design constraint rather than an
accident.

## A page, not a popup

The concept suggests a popup. A modal is the wrong container for this:

- it has no URL, so nobody can be sent back to it or emailed a link to resume;
- it cannot survive the round trip to PayPal and back;
- it cannot be the page the customer lands on when they return.

A light page at `/secure/[type]/[slug]` keeps every one of those and loses
nothing that matters — the speed comes from asking three things, not from
rendering in a layer above the page.

## What the customer sees

Four fields at most: date, how many people, name, email. A signed-in customer
sees name and email already filled.

Then a review step that states, in plain words and before any commitment:

- the exact amount charged now, and that it is credited against the final price;
- that the final price is not set yet, where that is true;
- that the date is **held**, not confirmed, and when they will hear;
- that the deposit is refunded in full if Egypt Eye cannot confirm;
- that it is not refunded if they cancel.

Afterwards the booking is in their account immediately — including when they
never pay, where it reads *awaiting deposit* with the link to finish.

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
fixed date, so the deposit is 20% of a number that already exists and nothing
has to be invented. If the flow is wrong, that is
discovered on seven trips rather than fifty-four products.

Then one photoshoot, which is the other shape — a time slot rather than a seat.
Then decide whether it goes further.

## What is deliberately NOT built

- **Live availability.** Not a code problem: it is a calendar somebody has to
  maintain daily. Until that is true, "held, we will confirm" is the honest
  interface.
- **Automated payment confirmation.** See the reconciliation table.
- **Balance tracking, reminders, refund automation.** All real work whose value
  depends on volume that does not exist yet.
- **Card payments.** Out of PCI scope is a feature.
- **A deposit button on every product.** Per-product flag, off by default.

## Legal, and the limit of this advice

Taking deposits for multi-day trips that combine accommodation and transport
may make them *packages* under EU and UK travel regulations, which carry real
obligations — mandatory pre-contract information and insolvency protection
among them. Egypt Eye's customers are international, so this is not
hypothetical.

This document cannot tell you where that line falls, and should not pretend to.
It is worth proper advice before deposits go on multi-day journeys. It does not
affect a photoshoot or a day tour.

## Open questions for Egypt Eye

1. **Proportional or flat?** If flat, the published 20% policy changes in three
   content files first, and every surface quoting it changes with it.
2. **What is N?** How many hours, truthfully, before a held date is confirmed
   or refunded.
3. **Which products get the button?** The recommendation is Weekly Trips,
   photoshoots and fixed-price day tours only.
4. **Is the deposit credited against the final price?** Assumed yes throughout;
   it must be stated at the payment step either way.
5. **Who refunds, and how fast,** when a date cannot be confirmed? The promise
   is only as good as the operational answer.
