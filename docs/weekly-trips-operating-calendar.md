# Weekly Trips operating calendar — review and what shipped

A review of the proposed Nov 2026 – Dec 2027 calendar, and what of it is now
live. Everything published is **announced**: a real date, no price, no booking
form, nothing bookable.

---

## What the proposal gets right

**The three-way split is the correct model**, and it is already how this site
is built: a reusable trip (description, itinerary, photos, inclusions) with
many dated departures, each carrying its own capacity, bookings and operating
state. Section 5 of the proposal describes the architecture that exists. No new
products were needed to schedule a date, and none were created.

**The calendar research is the strongest part, and it checks out.** Two catches
that matter commercially, both verified against independent sources:

- **Ramadan 2027 runs roughly 8 February – 9 March, with Eid al-Fitr around
  9–10 March** (moon-sighting dependent). Long day trips aimed at Egyptian
  groups in that window are a mistake.
- **1 May 2027 is Coptic Holy Saturday *and* Labour Day**, with Sham El Nessim
  on 3 May. Scheduling a craft-workshop trip that day was correctly rejected.

**The discipline is right.** Holding Abu Sir back until site access is actually
confirmed, rather than publishing a bookable date, is exactly the standard this
project works to.

**The duration estimates are plausible.** Alexandria at 10–12 hours from Cairo
matches independent research: roughly 2.5–3 hours each way over about 224 km,
so 5–6 hours of driving before anyone sees anything.

---

## The blocking problem: most of these trips do not exist

Of roughly thirteen trip concepts in the proposal, **three map to products that
exist**. The rest have no page, no itinerary, no inclusions and no images:

| Proposed | Status |
|---|---|
| Dahshur: The Forgotten Pyramids | maps to **Dahshur, Saqqara & Memphis** |
| Alexandria: The Roman City / Underground Tombs / Old Harbor | map to **Alexandria on the Mediterranean** |
| Siwa: Culture & Desert Expedition | maps to **Siwa Oasis Long Weekend** |
| Hidden Historic Cairo Houses | does not exist |
| Medieval Cairo & Hidden Architecture | does not exist |
| Islamic Cairo heritage walk | does not exist |
| Coptic Cairo | does not exist |
| Fayoum: Pottery & Village Culture (Tunis village) | does not exist |
| Fayoum: Forgotten Ancient Egypt (Qasr Qarun) | does not exist |
| Fustat: Crafts & Old Cairo | does not exist |
| Ancient Monasteries of the Red Sea | does not exist |
| Wadi Degla | does not exist |
| Abu Sir | does not exist (correctly held back) |

This is not a formality. A departure points at a trip by slug; one pointing at
a slug with no trip is **dropped silently at read time** and never appears. So
roughly seventeen of the proposed departures could not have been published even
if the dates were perfect.

Creating them is real work, not configuration: an itinerary, verified opening
hours, confirmed workshops and craftsmen, permits, images, and a reason the
trip is worth a day. Several carry supplier risk the proposal itself names —
the monasteries need coordination with the monasteries, Fustat needs workshops
that have actually agreed to receive a group.

**My recommendation on sequencing matches the proposal's own:** start with
Dahshur, Alexandria and Siwa, which exist. Fayoum pottery is the best next
product to build, because the existing Fayoum trip is Wadi El Hitan and the
lakes — a different trip entirely — and Tunis village with real craftsmen is a
genuinely distinctive day. The Cairo walking trips are the cheapest to run but
need one confirmed route each before a date goes up.

---

## What shipped

Thirteen departures for the three trips that exist. Capacity comes from each
product's own stated group size, not from the proposal's 8–10 guess.

### Dahshur, Saqqara & Memphis — capacity 14

| Date | Note |
|---|---|
| Sat 14 Nov 2026 | proposed 7 Nov, **moved one week** |
| Sat 16 Jan 2027 | proposed 9 Jan, **moved one week** |
| Sat 10 Apr 2027 | proposed 3 Apr, **moved one week** |
| Sat 11 Sep 2027 | as proposed |
| Sat 6 Nov 2027 | as proposed |

### Alexandria on the Mediterranean — capacity 14

| Date | Note |
|---|---|
| Sat 27 Mar 2027 | proposed 6 Feb, **moved past Ramadan** |
| Sat 17 Apr 2027 | as proposed |
| Sat 19 Jun 2027 | as proposed |
| Sat 17 Jul 2027 | as proposed |
| Sat 14 Aug 2027 | as proposed |
| Sat 20 Nov 2027 | as proposed |

### Siwa Oasis Long Weekend — capacity 12

| Date | Note |
|---|---|
| Fri 19 – Mon 22 Mar 2027 | after Eid; **4 days / 3 nights**, not 3 / 2 |
| Thu 7 – Sun 10 Oct 2027 | **4 days / 3 nights**, not 3 / 2 |

---

## Four judgement calls I made

**1. Moon-locked trips win the date.** Four proposed day trips landed on nights
already carrying a stargazing departure — 7 Nov 2026, 9 Jan, 6 Feb and 3 Apr
2027. A stargazing date cannot move: it is fixed by the new moon. A day trip
can. So the day trip moved. Two departures on one Saturday from an operator
with one vehicle is a question a customer should never have to ask.

**2. Alexandria moved out of February entirely.** The obvious one-week shift
from 6 Feb is 13 Feb — inside Ramadan, and a 10–12 hour day trip is precisely
what the proposal says not to schedule then. It moved past Eid to 27 March,
which also clears the Siwa departure.

**3. Siwa follows the real product.** The proposal says 3 days / 2 nights; the
product that exists is 4 days / 3 nights. The return dates follow the product.
If the eclipse-style 3-day format is what you actually want to run, that is a
different product and needs its own page.

**4. Capacity comes from the products.** Dahshur and Alexandria both state "up
to 14 travellers"; Siwa states 12. The proposal's 8–10 would have published a
smaller group than the trips advertise.

---

## One consequence for the stargazing calendar

**The 6 March 2027 stargazing departure falls inside Ramadan.** Worth knowing,
and there is no clean fix: March 2027's dark window is 4–10 March, which is
almost entirely Ramadan, and Eid lands on 9–10 March. The post-Eid alternatives
are materially worse — 11 March is 13% lit with the Moon up, 13 March is 31%
and fails the darkness test outright.

So the options are: keep 6 March and sell it to international guests, who are
unaffected; take 11 March and a brighter sky; or skip March. It is announced
and unbookable, so nothing is committed. **I would keep it** — the Moon is the
binding constraint, a desert camp does not depend on Ramadan, and the
alternative costs real darkness. Your call.

---

## Still open

1. **`min_seats` is unset** on all 27 departures (schema default 1). It is not
   published while a date is announced, but it must be set before any date is
   opened, or the page will say "Needs 1 more traveller to run".
2. **Prices.** All 27 are null, by design. Set them in `/admin/departures`, set
   the minimum, then move readiness to `open`.
3. **The Dahshur naming gap.** The proposal's concept is the Red and Bent
   pyramids alone; the product that exists includes Saqqara and Memphis.
   Customers on these dates get the broader itinerary. If the narrower
   "forgotten pyramids" trip is what you want to sell, it is a new product.
4. ~~No collision guard exists.~~ **Built.** `/admin/departures` now detects
   departures whose dates overlap and warns at the top of the screen. It
   compares date *ranges*, not start dates, because the clash that actually
   mattered was a four-day Siwa departure lying across a Saturday day trip —
   two departures starting on different days that still want the same vehicle
   on the Tuesday in between. It warns rather than blocks: two departures on
   one day is a question, not an error.

   Fixing it surfaced three regressions on the same screen, now also fixed:
   research departures were invisible there (the admin page was using the
   public fetcher), the "announced" state rendered a blank badge, and the
   "below minimum" alarm was firing on all 27 announced departures — which
   take no bookings and so cannot be below a minimum.
5. **Ramadan dates are approximate** and confirmed by moon sighting about a day
   ahead. Treat 8 Feb – 9 Mar 2027 as a window to plan around, not a fact.
