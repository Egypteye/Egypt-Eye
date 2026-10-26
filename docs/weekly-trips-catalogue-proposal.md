# Weekly Trips — catalogue proposal

Researched October 2026. **Nothing in this document is published, bookable, or
visible to a customer.** It exists so that scheduling a departure is a decision
someone takes deliberately, with the open questions already written down.

Read the four tiers below as a ladder. A concept only moves down it when a
person at Egypt Eye confirms the thing in the "needs confirming" column — not
when it looks good on paper, and not because this document exists.

---

## Tier 1 — Trips that already exist on the site

These seven are live at `/weekly-trips`, with full content, images, itineraries
and FAQs. They are the catalogue. Nothing below replaces them.

| Trip | Shape | Season stated on the site |
|---|---|---|
| White Desert Overnight Camp | 2 days, 1 night | Not May–September |
| Moonless Night in Wadi El Hitan | 2 days, 1 night | Moon-phase dependent |
| Wadi El Hitan & the Fayoum Lakes | One long day | — |
| Dahshur, Saqqara & Memphis | One day | Year-round |
| Siwa Oasis Long Weekend | 4 days, 3 nights | — |
| Sinai Bedouin Beach Camp | 3 days, 2 nights | — |
| Alexandria on the Mediterranean | One day | Suggested for July |

**Status: zero scheduled departures.** Every one of these shows "Dates coming
soon". The catalogue is not the bottleneck — the calendar is.

---

## Tier 2 — New concepts the research supports

Each of these is a *proposal*. None has a supplier, a price, a permit or a date.

### 2.1 Lake Qarun & Wadi El Rayan birdwatching day — **strongest fit**

The best-evidenced new idea, because its season is the opposite problem to the
desert trips' season.

- Lake Qarun is an internationally designated Important Bird Area; thousands of
  migratory birds winter there, flamingos among them.
- The birding window runs roughly **September–April, peaking mid-December to
  March** — precisely the months the Western Desert trips are *also* good, but
  it extends into the shoulder where they are not.
- Best viewing is the hour before sunrise or just before sunset, which suits a
  group departure far better than a midday arrival.
- Fayoum is already a destination Egypt Eye runs, so the drive, the vehicle and
  the route are known quantities.

**Needs confirming:** a guide who can actually identify birds (this is the whole
product — a driver pointing at a flamingo is not it), optics, whether dawn or
dusk works operationally, Wadi El Rayan entry arrangements.

### 2.2 Ain Sokhna boat day — **good commercial fit, unknown supplier**

- Ain Sokhna is roughly **120 km east of Cairo**; comparable operators run this
  as an **~8-hour door-to-door day with about 2 hours on the water**.
- Local boats **typically take up to about 10 people** — which maps almost
  exactly onto the Weekly Trips group model, where a 12-seat cap is normal.
  This is unusual: most boat products have to be sold privately because the
  boat is the unit. Here the boat *is* roughly one group.
- Comparable snorkel-and-lunch day trips from Cairo advertise around **$140 per
  adult**, which is a market reference point, not our price.

**Needs confirming:** a named boat operator, safety equipment and insurance,
snorkelling competence requirements, whether the season is year-round, and
whether we are comfortable selling a water activity at all.

### 2.3 Cairo food and neighbourhood walks

Low operational complexity, year-round, no vehicle, no permit, and the one
category that works when the desert is closed in high summer. The brief's
Islamic Cairo / Khan el-Khalili ideas sit here.

**Needs confirming:** a guide, which specific establishments, food-safety
judgement, and whether to run it as evening rather than midday in summer.

---

## Tier 3 — Concepts I would not pursue yet

**Alexandria as a *new* format.** Already a trip. The research confirms the
constraint the existing page implies: **2.5–3 hours each way, ~224 km, so 5–6
hours of driving round trip.** That is a real day trip but a tight one, and
Alexandria's own traffic adds to it. Adding a second Alexandria product would
compete with the one that exists rather than extend the calendar.

**Wadi Degla.** Close to Cairo and genuinely accessible, but it is a short
walk in a quarry valley an hour from the city — thin against a brand whose
other products are the White Desert and Siwa. Better as an add-on than a
departure anyone travels for.

**Birqash camel market.** Already researched and rejected elsewhere in this
project on welfare and reputational grounds, and guarded against reappearing in
`scripts/check-experience-collections.mts`. Not revisited here.

---

## Tier 4 — Confirmed, bookable departures

**None.** `trip_departures` is empty.

This is the single thing standing between the redesigned page and the "living
platform" the brief describes. The featured departure, the countdown, the
availability labels and the per-departure `Event` structured data are all built
and all tested — they display nothing because there is nothing to display.

One real date published at `/admin/departures` turns the entire top of that page
on.

---

## Open questions that block real scheduling

1. **Wadi El Rayan permits.** Secondhand sources say camping inside Egyptian
   protected areas needs a permit from the Environmental Affairs Agency, that
   Wadi El Rayan carries a separate camping fee, and that permits go through the
   "Egypt Reserves" app or the agency directly. One camp inside the reserve also
   states a police-instructed gate-time restriction for foreign visitors —
   sources disagree on whether that is *before* or *after* 19:00, which is
   exactly why it cannot be published either way.

   **This affects a product that already exists**, not just a proposal: the
   Moonless Night in Wadi El Hitan camp is inside that protected area. Worth
   confirming against the agency directly before the next overnight is
   scheduled.

2. **Group size.** The site states different caps per trip (8, 12, 14). The
   departure row carries its own capacity, which is what actually governs
   booking. Worth deciding whether the stated caps and the scheduled capacities
   should be reconciled.

3. **Deposits.** Each departure has an `instant_booking` switch controlling
   whether a deposit is taken online through PayPal. It is off by default, and
   the current FAQ tells customers nothing is charged on the website. Turning it
   on for a departure changes that promise, so the FAQ needs to change in the
   same breath.

---

## Sources

Market and operational research, October 2026. These are travel-trade and
booking sites, not official Egyptian government sources — which is why
everything above is written as "needs confirming" rather than as fact.

- [Fayoum day trips from Cairo (market survey)](https://www.hellotickets.com/en-en/egypt/cairo/fayoum-day-trips-from-cairo/sc-186-2814)
- [Camping permit requirements in Egyptian reserves](https://openvan.camp/en/news/lifestyle/camping-egypt-permit-requirements-costs)
- [Wadi Rayyan Protected Area](https://www.lonelyplanet.com/points-of-interest/wadi-rayyan-protected-area/1136077)
- [Flamingos return to Lake Qarun](https://emccutoday.masscomm.cu.edu.eg/details.php?nwid=735)
- [Fayoum birdwatching seasons](https://fayoumegypt.com/tag/fayoum/page/4/)
- [Cairo–Alexandria journey times](https://12go.com/en/travel/cairo/alexandria/)
- [Ain Sokhna yacht and snorkelling day trips from Cairo](https://www.excursionmania.com/ain-sohkna-private-day-tour-on-yacht-from-cairo-e4775)
- [Ain Sokhna day-trip guidance, boat capacity](https://www.theculturetrip.com/africa/egypt/articles/day-trips-from-cairo-ain-sokhna)

---

## One finding worth acting on regardless

The market research turned up something that supports the existing positioning
rather than changing it: **day trips out of Cairo are overwhelmingly sold as
private tours.** Listing after listing advertises a private vehicle and a
dedicated guide, including several that describe themselves as "small group"
while still meaning a private car. Genuine shared-seat departures with a
published date were hard to find at all.

That is the gap Weekly Trips already occupies. It is worth saying far more
loudly on the page than it currently is — not as a new product, but as the
reason this one exists.
