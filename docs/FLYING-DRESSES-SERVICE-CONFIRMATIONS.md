# What has to be confirmed before the experience pages can be finished

Eight experience pages and three rental pages cannot be completed without
answers that only the business has. This is every one of those answers,
collected from the `confirm` and `dependencies` fields in
`src/content/flyingDressExperiences.ts` and `src/content/flyingDresses.ts`,
and deduplicated.

**The same question appears on many pages.** Thirty-one separate `confirm`
items across the eight experiences collapse into the nine below. Answering
section 1 alone unblocks more of the site than the other eight together.

Answer in any form — a reply, a voice note, a scribbled list. Nothing here
needs to be written formally. Where an answer is "we don't do that", say so:
removing a claim is as useful as confirming one, and faster.

---

## 1. Prices — blocks all eleven pages  ← THE REMAINING BLOCKER

Every experience is currently priced "enquire". That is honest, and it is also
the reason none of these pages can rank for a commercial search or answer the
question a visitor actually arrived with.

| Page | What is needed |
|---|---|
| Marriage proposals | A starting price, and what it includes |
| Gender reveals | A price with video, and one without |
| Birthdays and celebrations | A starting price, or the basis you quote on |
| Anniversaries and romance | A starting price |
| Maternity and family | A price — see section 4, which may block this anyway |
| Vow renewals and engagements | A starting price |
| Creators and editorial | Session, half-day and full-day |
| DJ and music | See section 7: the commercial model itself is undecided |
| Rent a dress | Per-day price |
| Accessories | Price, or "priced with the dress" |
| Men's wear (gawns) | Per-day price |

A *starting* price is enough. "From $X, depending on the decoration" is a real
answer and can go live; "it depends" cannot.

## 2. The venue matrix — answers six questions at once

The rooftop belongs to a hotel, not to us. Six separate `confirm` items are all
asking the same thing. One table settles them:

For each rooftop you have a working arrangement with:

- Its name, and whether the arrangement is standing or booked each time
- Whether it permits sessions **after dark**
- Whether it permits **amplified music**, and on what conditions
- Maximum **group size**
- Whether **catering or private dining** is genuinely available, and on what terms
- Which **reveal mechanisms** are allowed for a gender reveal (confetti, smoke,
  balloons, none)

Until this exists the site cannot say a rooftop evening, a DJ set, a dinner or
a particular reveal is available — only that it may be, subject to the venue.

## 3. Suppliers — which are real, which are aspirational

The pages currently offer these as extras. For each: a supplier you can
reliably call, or remove it from the site?

- Live musician, singer or DJ
- Cake, flowers, refreshments
- Transport to and from the hotel
- Hair and makeup
- A celebrant for vow renewals
- Sound equipment and generators for a music session

"Remove it" is a perfectly good answer for any of these.

## 4. Dress sizing — ANSWERED, October 2026

**The collection is cut to fit all sizes.** Individual fit and colour
availability are still confirmed with the customer before the date.

Applied to the maternity page: the FAQ now answers the question confidently
instead of deferring it, the inclusion says the dress is cut to fit all sizes,
and the dependency no longer reads as doubt about whether a dress exists. The
page is no longer blocked by sizing — only by price.

## 5. Delivery standard

For creators and editorial, and ideally across the board:

- How many edited images does a client receive?
- Within what time?

The home page already claims "more than a hundred colour-graded photographs"
for the photoshoot packages. If that figure applies elsewhere, say so; if it
doesn't, the experience pages need their own.

## 6. Commercial licence — DECIDED, October 2026

**Not advertised as a standard offering.** These enquiries are handled one at a
time.

Applied: the commercial licence has been removed from the creators page's
extras, where it sat alongside "additional edited images" as though it were
something handed over on request. The FAQ still answers a commercial question,
because someone planning a paid campaign deserves to know it is a different
conversation — it now describes that conversation rather than a product. A
check fails if it is ever listed as a bookable extra again.

STILL WORTH DOING, lower priority: drafting standard usage terms internally, so
the case-by-case answer starts from a position rather than from nothing.

## 7. The music and DJ model

The commercial shape is undecided, not just the number. Which is it:

- A coordination fee on top of a shoot?
- An hourly production rate?
- A package?
- Custom quote only?

Also needed: **the equipment inventory** — exactly which cameras and lights
exist, so the page can be specific instead of saying "our equipment".

## 8. Two things that need checking rather than deciding

- **Vow renewal wording.** The page distinguishes a symbolic ceremony from a
  legal one. That sentence should be read by someone qualified before it goes
  live. It is the sentence that stops a customer believing they are legally
  married.
- **Commercial music video permissions.** Whether one needs permissions beyond
  the venue's, confirmed against an authoritative source rather than assumed.

## 9. PayPal links are missing

All three photoshoot packages carry a confirmed price and **no `paypalLink`**:

| Package | Price | PayPal link |
|---|---|---|
| Sand dunes | $179 | none |
| Pyramids rooftop | $199 | none |
| Fayoum | $349 | none |

PayPal is active and receiving USD. Paste one payment link per package and the
site can take a booking instead of only an enquiry. This is the single change
with the most direct revenue effect on the list.

---

## What happens once these are answered

Each answer unlocks specific, already-planned work:

- **Prices** → real `ExperiencePricing` values, Offer structured data where it
  is genuinely supported, and pages that can compete for commercial searches
- **Venue matrix** → the availability language stops hedging, and each page can
  state what is actually possible
- **Suppliers** → the extras lists become real offers rather than maybes
- **Dress sizing** → maternity becomes sellable
- **PayPal links** → booking replaces enquiry on three pages

Nothing here will be invented in the meantime. A page with an honest gap is
worth more than a page with a confident guess, and a guess about a venue's
rules is one a customer discovers on the day.
