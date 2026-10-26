# Stargazing calendar, November 2026 – December 2027

Everything here was computed, not copied. `src/lib/astronomy.ts` derives
new-moon instants, lunar illumination and altitude from Meeus; the computation
reproduces all thirteen published 2027 new-moon times **to the minute**, and
`scripts/check-astronomy.mts` re-derives every published date on every build
and fails if one drifts.

Conditions below are for Wadi El Hitan (29.27°N, 30.04°E), over the 20:00–04:00
window, in Egypt local time with daylight saving handled per date.

---

## A. Validated calendar

All fourteen are live at `/weekly-trips` as **announced**: real dates, no
price, no booking form.

| Departure | Event | Moon | Dark window | Status |
|---|---|---|---|---|
| Sat 7 Nov 2026 | Taurid fireball season | 2% | 19:00–04:50 | as proposed |
| Sat 12 Dec 2026 | Geminid meteor shower | 13% | 20:00–05:00 | as proposed |
| Sat 9 Jan 2027 | — | 4% | 19:00–05:00 | as proposed |
| Sat 6 Feb 2027 | New moon | 0% | 19:10–05:00 | as proposed |
| Sat 6 Mar 2027 | — | 2% | 19:30–05:00 | as proposed |
| **Sat 3 Apr 2027** | — | 10% | 19:40–04:00 | **moved from 10 Apr** |
| **Thu 6 May 2027** | Eta Aquariid meteor shower | 0% | 21:10–04:40 | **moved from 8 May** |
| Sat 5 Jun 2027 | — | 2% | 21:40–04:20 | as proposed |
| **Sat 31 Jul 2027** | Delta Aquariid & Capricornid meteors | 4% | 21:30–04:50 | **moved from 3 Jul** |
| **Sat 28 Aug 2027** | — | 12% | 20:50–03:30 | **moved from 7 Aug** |
| **Thu 30 Sep 2027** | — | 1% | 20:10–05:00 | **moved from 4 Sep** |
| Sat 30 Oct 2027 | — | 2% | 19:00–04:50 | as proposed |
| Sat 27 Nov 2027 | — | 0% | 19:00–05:00 | as proposed |
| Sat 25 Dec 2027 | — | 4% | 19:00–05:00 | as proposed — **see holiday note** |

### Why the five moved

**7 Aug 2027 — the one that fails.** A 36%-lit Moon, 32° above the horizon,
leaving 5.3 dark hours. Five days after the new moon is not a dark night. The
whole of early August 2027 is compromised; the month's usable window is the
very end, so it moves to **28 Aug** (12%, Moon barely up).

**10 Apr 2027** — 18% lit and 27° up, so the Moon is in the sky for a third of
the session. **3 Apr** is 10% with the Moon below the horizon and two more
hours of darkness.

**8 May 2027** — 8% but 25° up. **6 May** is the new moon *and* the Eta
Aquariid peak, with the Moon essentially absent. Strictly better on both
counts, and it is a Thursday, which is the Egyptian weekend.

**3 Jul → 31 Jul 2027** — 3 July is astronomically perfect (0%) but
astronomically perfect is not the only axis. 31 July is 4% lit *and* carries
the Southern Delta Aquariids and Alpha Capricornids together. Same darkness in
practice, a reason to come.

**4 Sep 2027** — at 22% this was the worst remaining night on the calendar.
**30 Sep** is 1% with two more dark hours, and moving it also closed an
eight-week hole between late August and the end of October.

### Two things to decide

**Christmas Day.** 25 Dec 2027 is astronomically excellent (4%, nearly ten dark
hours) and it is Christmas Day. For international guests a desert night on
Christmas may be the draw; for Egyptian staff it may not. **Thu 30 Dec** is
9% lit with the same dark window if you would rather not run it. Say the word
and I will move it.

**The weekend is Friday–Saturday in Egypt.** The calendar is mostly Saturdays,
which means returning Sunday — a working day locally. Fine for international
travellers, awkward for Cairo residents. Thursday and Friday departures are
available in most of these windows if the local market matters more.

### Not scheduled, deliberately

**Perseids, 12–13 Aug 2027.** The most famous shower of the year, running under
a Moon around 80% lit. Fame is not a reason to drive people into the desert.

**Quadrantids, 3–4 Jan 2027.** A genuinely sharp peak only a few hours wide. If
it lands in daylight over Egypt the trip delivers nothing. Too much risk to
sell as an event; the January date stands on its own darkness.

**Northern Taurids, 11–12 Nov 2026.** Roughly five meteors an hour. Not a
product. The Taurids *are* active across the 7 Nov date, and the page says so
as "fireball season", which is true without promising a show.

**Leonids (Nov 2027), Ursids (Dec 2027), Lyrids (Apr 2027), Orionids.** Either
moonlit in 2027 or too thin to carry a departure.

---

## B. The two eclipse products — August 2, 2027

Both exist in the system at **`readiness = research`**: internal only, invisible
to visitors, with their blockers written into the row. Neither is bookable and
neither has a price.

### Siwa — total solar eclipse

Siwa is inside the path of totality. Published durations **disagree**: roughly
5m25s, 5m31s and 5m37s depending on source. None is quoted anywhere, and none
should be until one authoritative calculation is confirmed.

Blocked on, in writing, before this can be announced:
accommodation capacity and terms · round-trip transport and realistic travel
times · a legal, safe viewing site with permissions · maximum group size ·
a contingency plan.

It is currently attached to the existing 4-day Siwa trip, but the eclipse
programme is 1–3 August. It probably needs its own trip entry before publishing.

### Fayoum / Cairo / Giza — partial solar eclipse

**Cairo is outside the path of totality.** This must never be described as a
total eclipse, and the system labels it "Partial solar eclipse" throughout.

One correction to the brief: **"94.7% obscuration" conflates two quantities.**
0.947 is the eclipse *magnitude* — the fraction of the Sun's **diameter**
covered. Obscuration is the fraction of its **area**, and for that magnitude it
is a meaningfully smaller number. One source labels 94.72% as obscuration while
defining magnitude as diameter, which cannot both be right. **No percentage is
published**, and none should be until a single authoritative source is
confirmed. The honest description is a deep partial: the Sun reduced to a thin
crescent, never covered.

Blocked on: venue and permissions · certified solar glasses for every guest ·
properly filtered telescopes · local contact times for the chosen site.

---

## C. Itinerary — what was reused, and what was not

Two real products exist and they are **not** the same trip:

**`/experiences/fayoum-stargazing`** — an evening into the early hours with an
optional overnight. Transport, astronomy guide, telescope (weather permitting),
Bedouin dinner and tea, seating and blankets, Wadi El Hitan entry. No price.

**`/weekly-trips/wadi-el-hitan-moonless-night-camp`** — 2 days, 1 night, and
the trip the calendar is attached to. Adds the fossil valley and open-air
museum, a 4x4 beyond the protected area, sandboarding, a content creator,
lunch/barbecue/breakfast, and the desert camp. Maximum 8 travellers.

The calendar uses the **weekly trip**, unchanged. Nothing was invented and
nothing was merged between the two.

The brief's checklist mentioned a 4x4, sandboarding, a content creator, fossil
and museum visits and a BBQ. Those are verified — but on the weekly trip, not
on the experience page. Had the calendar been attached to the experience, every
one of them would have been a promise the product does not make.

**Left unconfirmed:** the exact pickup time (the page says "Afternoon from
Cairo — exact pickup confirmed when you book", because `departure_time` is free
text and no specific hour is documented), and `min_seats`, which is left at the
schema default of 1 rather than inventing a minimum group size. The minimum is
not published while a date is announced, but **it must be set before any date
is opened for booking**, or the page will say "Needs 1 more traveller to run".

---

## D. How it is stored

No new CMS and no duplicated content. Departures already lived in Supabase
(`trip_departures`) pointing at version-controlled trip content — the reusable
experience / dated departure split the brief asks for already existed.

Three additions (`supabase/migrations/0028`):

- **`price_usd` is now nullable.** It could not be null, so publishing a date a
  year out meant typing a number nobody had agreed to.
- **`readiness`** — `research` (internal only) → `announced` (public date, no
  price, not bookable) → `open` (bookable, price required, enforced by a table
  constraint).
- **`astro_event`, `moon_illumination`, `observing_window`** — why this date.

A security gap surfaced while doing it: `book_departure_seats` checked status,
dates, the deadline and the seats, and **nothing about whether the departure was
on sale**. A POST straight at `/api/trip-seats` with an announced departure's id
would have taken the booking and written a total of `round(null × seats)` —
null. The guard now sits inside the same locked read that prevents overselling,
and was proven against the live function: announced+unpriced returns
`not_on_sale` and takes no seat; open+priced still books.

---

## E. Prices

**Every new departure has `price_usd = null`.** No placeholders, no $0, no
estimates. Nothing existing was changed.

A date with no price shows "Pricing to come", has no booking form, and emits
**no `Offer` in its structured data** — an announced date is a real `Event`
with a real date and no price or availability claim, rather than an Offer with
a guessed number that a search engine would render as fact.

To sell a date: set the price in `/admin/departures`, set `min_seats`, and move
`readiness` to `open`. The constraint will refuse `open` without a price.

---

## F. Open operational risks

1. **Wadi El Hitan is a protected area.** Secondhand sources say camping in
   Egyptian reserves requires an Environmental Affairs Agency permit and that
   Wadi El Rayan carries a separate camping fee. One camp inside the reserve
   states a police-instructed gate-time restriction for foreign visitors, and
   **sources disagree on whether it is before or after 19:00** — which is
   exactly why it cannot be published either way. This affects a product you
   already sell, fourteen times over now.
2. **`min_seats` is unset** (default 1). Must be set before any date opens.
3. **High summer.** The trip's own season note says the desert is too hot to
   camp in comfortably from June to August. June, July and August dates are
   scheduled on astronomy alone; they may not be sellable, and the calendar is
   deliberately thin there.
4. **Group size.** Capacity is 8, from the trip's own "Maximum 8 travellers".
   Confirm that still holds a year out.
5. **Telescope and guide availability** on fourteen specific nights.
6. **Both eclipse products** — see section B.

---

## G. Quality check

- Every published date re-derived from the computed sky on every build; worst
  case across the fourteen is a **13% Moon with 8.3 dark hours**.
- New-moon instants match independently published times to the minute; the
  check pins them so the algorithm cannot rot.
- All times computed in Egypt local time, with daylight saving resolved per
  date rather than assumed.
- No unconfirmed product is public: both eclipse products are `research`.
- Total and partial eclipses are distinct products with distinct names.
- No invented prices, no invented inclusions.
- Booking flow verified intact: `open`+priced departures still book.
- Verified on the live site at desktop and 390px, no horizontal overflow.
