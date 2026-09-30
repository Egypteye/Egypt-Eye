# FAQ strategy

How buying questions are answered across the site, where each answer lives,
and which questions have earned an article of their own.

## The problem this solved

FAQs existed, and were good, on six photoshoots, six Weekly Trips, three
signature experiences, the transfers page and two listing pages. They did not
exist at all on the 31 live tour pages — the highest-intent pages on the site
— and the same site-wide policy answers were being written out separately on
the homepage and in the catalogue, where they had already drifted apart in
wording.

Structured data was also uneven: the accordion rendered on eight surfaces but
`FAQPage` markup was emitted from only four of them.

## The split: product answers vs. policy answers

One rule decides where an answer goes.

**If the answer differs between products, it belongs on the product.** The
White Desert camp's toilet arrangements, a photoshoot's dress, a tour's
entrance fees. These are the answers that earn the page its rankings, and
they can only be written where the facts are.

**If the answer is the same everywhere, it belongs on `/faq`, once.** The
deposit, the currencies, children's pricing, the cancellation terms. Putting
these on each product page would mean 43 pages carrying the same paragraph,
43 `FAQPage` entities competing to answer one query, and 43 edits the day the
deposit changes. Each product accordion links to `/faq` instead.

`scripts/check-faqs.mts` enforces both halves. It fails the build if a policy
number appears in a product answer, and if the same question is published
with an identical answer on two pages. It deliberately allows the same
*question* on two products — "do you pick me up from my hotel?" has a
different answer for a two-hour shoot than for a nine-hour tour, and both
pages should answer it in their own terms.

## Tour FAQs are derived, not written

`src/lib/tourFaqs.ts` builds each tour's seven questions from that tour's own
`included`, `excluded`, `physicalLevel`, `duration`, `cities`, `destinations`
and `relatedExperiences`.

This was the central decision. Hand-writing 31 × 7 answers produces prose that
restates the bullet lists directly above it on the same page — and the first
time an inclusion changes, the prose silently disagrees with the list, because
nothing checks a paragraph against a bullet. Deriving them makes the answers
true by construction, keeps them in step forever, and gives a new tour its
FAQ on the day it ships.

Each rule is guarded, so a question only appears when the data supports it. A
tour that includes entrance fees says so and lists what is still payable; a
tour that does not says that instead, and says why we do not quote a fixed
gate price. `Tour.faqs` exists for the rare tour with a concern no field can
express; anything written there replaces the derived question of the same
name.

The seven:

| Question | Derived from | Why it converts |
|---|---|---|
| Are entrance fees included? | `included` / `excluded` | The most-asked question about Egypt tours, and the one competitors bury |
| Do you pick me up from my hotel? | `included` | "Where do we meet" is a booking blocker, not a detail |
| Is this private, or will I be with other people? | `included` | The core product difference; links to Weekly Trips for the other answer |
| How much walking is there? | `physicalLevel` | Almost nobody answers honestly; decides the booking for families and older travellers |
| How long does the day take? | `duration`, `cities` | Sets expectations before the deposit, not after |
| What should I budget on top? | `excluded` | The trust question — naming exclusions plainly is what makes a page believable |
| Can I add anything, or change it? | `relatedExperiences` | The conversion question, and the bridge into the rest of the catalogue |

## Where FAQs appear

| Surface | Source | `FAQPage` markup |
|---|---|---|
| `/faq` | `content/faqHub.ts` | Yes — canonical for policy answers |
| Homepage | Six of the hub's answers, selected by question | No, deliberately |
| Tour pages (31) | Derived, `lib/tourFaqs.ts` | Yes |
| Photoshoots (6 + listing) | Authored per package | Yes |
| Weekly Trips (6) | Authored per trip | Yes |
| Signature experiences (3) | Authored per experience | Yes — added with this work |
| Transfers | Authored on the page | Yes — added with this work |
| Tours listing | Authored | No — the detail pages carry the entities |
| Articles | `faqBlock` in the body | Yes |

The homepage emitting nothing is intentional: two pages claiming the same FAQ
entity competes with itself, and `/faq` is the one that should win.

## FAQ questions that have earned an article

The pipeline the brief asks for: a question with real search demand, an answer
too long for an accordion, and a service at the end of it.

Checked against all 182 published articles first — most candidates turned out
to be covered already, and are listed here so they are not proposed again.

### Worth writing

**1. What you actually pay at the gate: Egypt entrance fees**
Zero coverage across 182 articles, and it is the single most-derived FAQ on
the site. Real demand: *pyramids entrance fee*, *how much are tickets to the
pyramids*, *is the Egyptian Museum included*.
→ Cluster: `planning`. Pillar: `how-to-plan-a-trip-to-egypt`. Service: `/tours`.
**Blocked on verification.** Gate prices are set by the Ministry of Tourism
and Antiquities and change; this article cannot be written from memory or from
competitor pages. It needs current figures confirmed by the operations team,
and a visible "checked on" date, or it must not ship.

**2. How much walking is really involved at Egypt's sites**
Zero coverage, and we hold better data on this than anyone competing for it —
`physicalLevel.note` is already written per tour, site by site. Real demand:
*is the Giza plateau wheelchair accessible*, *how much walking at Karnak*,
*Egypt tours for seniors*.
→ Cluster: `planning`. Pillar: `how-to-plan-a-trip-to-egypt`. Service: `/customize`.
Writable now from the catalogue, with no invention required.

### Already covered — do not duplicate

| FAQ question | Existing article |
|---|---|
| Is tipping expected? | `tipping-etiquette-in-egypt` |
| Do I need a visa? | `egypt-visa-guide-2026` |
| Is a private tour worth it? | `how-to-choose-a-private-tour-company-egypt` |
| When should I come? | `best-time-to-visit-egypt` |
| Travelling with children | `egypt-family-travel-tips` |
| What's included in a photoshoot? | `pyramids-photoshoot-what-included` |

### Deliberately never an article

Deposits, payment methods, currencies and cancellation terms. These are
transactional, they change, and an article about them would be a second place
to keep them current. They live on `/faq` and `/cancellation-policy`.

## Adding FAQs to a new product

- **A tour** needs nothing. Ship it with accurate `included`, `excluded` and
  `physicalLevel` and its FAQ writes itself.
- **A photoshoot, trip or experience** takes an authored `faqs` array. Answer
  what is specific to it; do not restate policy — `check:faqs` will stop you.
- **A site-wide answer** goes in `content/faqHub.ts`, in the group it fits.

Run `npm run check:faqs` before shipping either.
