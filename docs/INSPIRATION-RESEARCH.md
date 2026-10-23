# Flying Dresses Egypt — research, competitive audit and the design decisions that came out of it

Written for the build of the Flying Dresses Egypt site that lives at
`src/app/flying-dresses/` in this repository. Every claim below carries a
verification marker, because a research document whose confident sentences turn
out to be guesses is worse than no document.

| Marker | Means |
| --- | --- |
| **[VERIFIED]** | Fetched the page in this session and read its rendered text. |
| **[SEARCH]** | Came from a live web search result summary, not from the page itself. Prices from resellers, in particular, are "from" prices and go stale. |
| **[INTERPRETATION]** | My reading, judgement or design opinion. Not a fact about anyone's business. |
| **[UNVERIFIED]** | Could not be checked from this environment. Named so nobody mistakes it for a finding. |

---

## 0. What this environment could and could not reach

This matters before anything else, because Phase 2 of the brief asks for an
audit of the existing Flying Dresses website and I could not perform it.

- **`flyingdressesegypt.com` does not resolve from this sandbox.** `WebFetch`
  returns `getaddrinfo ENOTFOUND flyingdressesegypt.com`, and the same for
  `www.flyingdressesegypt.com`. **[VERIFIED]** — the failure itself is verified;
  the cause is not. It is consistent with a domain that is registered and
  hosted but not yet pointing at a live site, which is what "I have host and
  domain" suggests. It could equally be sandbox DNS policy.
  **Consequence: the existing-site audit the brief asks for has not been done.**
  No claim anywhere in this build rests on what that site currently says.
- **`cappadociastudio.com` does not resolve either.** **[VERIFIED]** as a
  failure. Its two pages named in the brief are therefore **[UNVERIFIED]**.
- **`egypteyetravel.com` does resolve and was audited.** **[VERIFIED]** This is
  the sister brand in this same repository, and it turned out to be the single
  most useful reference of the lot — see §1.
- **`awwwards.com`, `siteinspire.com` and the vendor documentation sites** were
  not fetched. Observations about them below are **[INTERPRETATION]** from prior
  knowledge, and are labelled as such. I have not pretended to a gallery crawl
  I did not do.

The research that *was* possible — a live audit of the sister brand, and web
searches across the Egypt/Cappadocia/Marrakech flying-dress market — turned out
to be enough to make the design decisions in §4. Where it was not enough, the
build asks the owner rather than inventing (see
`docs/FLYING-DRESSES-OWNER-CONFIRMATIONS.md`).

---

## 1. The sister brand: egypteyetravel.com/photoshoots

**[VERIFIED]** Fetched `egypteyetravel.com/photoshoots` and
`egypteyetravel.com/photoshoots/pyramids-rooftop-flying-dress-photoshoot`.

This is the most important reference because it is the same owner, the same
dresses and the same operation — and because it already sells the product.

### What is live right now

| Product | Live price | Repo fallback price |
| --- | --- | --- |
| Pyramids Rooftop Flying Dress | $199 pp | $199 ✅ |
| Sand Dunes Flying Dress | $179 pp | **$199** ❌ |
| Fayoum Flying Dress | $349 pp | **$219** ❌ |
| Exclusive Pyramids Photoshoot | $100 pp | **$75** ❌ |
| Jumping Horse Photoshoot | $125 pp | $125 ✅ |
| Running Horse + Jumping Horse | $185 pp | **$160** ❌ |
| Pyramids Proposal Romance Setup | $350 | **$150** ❌ |

**Finding 1 — the brochure prices are the live prices.** Sand Dunes $179,
Rooftop $199 and Fayoum $349 match the Flying Dresses brochure figures in the
brief exactly. **[VERIFIED]** for the live site; **[INTERPRETATION]** that this
means the brochure is current rather than coincidental, but three out of three
is a strong signal.

**Finding 2 — the repository's fallback prices are stale, and they leak.**
`src/content/photoshoots.ts` carries different numbers, and because of this
repo's Sanity rule (a Studio document replaces the content-file entry wholesale,
per `CLAUDE.md` §3) those stale numbers normally stay invisible. They do not stay
invisible in **FAQ prose**. The live `/photoshoots` page shows $349 for Fayoum in
the listing and **$219 in its own FAQ text on the same page**, plus $75 vs $100
for the Exclusive shoot, $120 vs $125 for the Jumping Horse, $160 vs $185 for the
Running Horse and $150 vs $350 for the Proposal. **[VERIFIED]** — I read both
numbers on one fetched page.

This is a genuine conversion and trust bug on the live production site: a
visitor who reads the FAQ sees a cheaper price than the one they are asked to
pay. It is **out of scope for this build** and is written up as its own task
rather than silently folded in, because it touches the production pricing of
six products.

**Finding 3 — the rooftop page already promises men's attire it cannot show.**
The live FAQ reads: *"Yes. We have traditional Egyptian attire for men in five
styles. Let us know when you book."* **[VERIFIED]** But the outfit picker on
that page offers only the twelve dresses, because `MENS_OUTFITS` in
`src/content/photoshoots.ts` is an empty array with a comment explaining that
nothing had ever named a single men's outfit. The brief's brochure names five.
**This is the gap the "men's wear" half of the request closes**, and it closes
it with the owner's own brochure rather than with invention.

**Finding 4 — twelve dresses, confirmed live and by name.** Cherry, Emerald,
Navy, Black, Verdant, Ginger, Snowy, Golden, BronZey, Aqua, Lavender, Orchid.
**[VERIFIED]** on the rooftop page, and identical to the brochure list in the
brief. Note `BronZey`'s internal capitalisation — it is deliberate in the repo
and is preserved.

**Finding 5 — no rental-only product exists anywhere.** **[VERIFIED]** by
fetching the listing and by grepping the codebase for `rental`, `rent `,
`accessor`. The three services in this request are genuinely new inventory, not
a re-skin.

### What to learn from it

- The **honesty mechanics are excellent and should be carried over wholesale**:
  outfits structurally cannot carry a price (`lib/booking/outfits.ts` has no
  price field at all, and a check script asserts it); a chosen dress is recorded
  as a *preference* with an explicit "if anything is unavailable on the day we
  will contact you"; placeholder products are flagged and excluded from
  structured data. **[VERIFIED]** by reading the source.
- The **7am rooftop argument is the single best piece of copy on the site**:
  *the Giza site does not open until 8am, so the first hour of the day is one no
  photoshoot inside the complex can offer.* That is a real, checkable competitive
  moat expressed in one sentence. **[VERIFIED]** It belongs on the Flying Dresses
  home page, near the top.

### What not to carry over

- The Egypt Eye visual system — white background, Cinzel/Cormorant, antique gold
  — is a **travel-agency** identity: trustworthy, document-like, deliberately
  calm. **[INTERPRETATION]** It is the wrong register for a fashion-editorial
  brand, which is why the Flying Dresses site gets its own root layout, its own
  fonts and its own palette rather than inheriting the chrome.
- The navigation is thirteen top-level items. **[VERIFIED]** from
  `src/content/site.ts`. Correct for an operator selling tours, cruises,
  transfers, a boutique and a journal; wrong for a single-product brand, where
  it would bury the only thing being sold.

---

## 2. The competitive market

All pricing in this section is **[SEARCH]** — reseller "from" prices gathered
from search result summaries, not from the operators' own sites. They are useful
for *positioning* and useless as a quote.

### Egypt — direct competitors

| Source | Format | Listed from-price |
| --- | --- | --- |
| Airbnb Services — Giza rooftop | 1 hr, up to 3 guests | $179 /guest |
| Expedia — Cairo operator, Giza | 1 hr, 4 hr window, hotel pickup | $180 /adult |
| Viator — private Giza, flying dress | 1 hr | ~$180 |
| Viator — private Giza, flying dress | 4 hr | ~$189 /adult |
| AAA TripCanvas — Giza | 4 hr private | from $125 |
| Expedia — Giza tour + rooftop shoot | combined, guided | $200 /adult |
| AAA TripCanvas — rooftop | 1 hr | from $300 |
| AAA TripCanvas — rooftop | 2 hr + pickup | from $400 |
| Tinggly — tour + flying dress | 4 hr | $465 (from $500) |
| Tinggly — + camel and horse riding | 4 hr | $450 |
| Airbnb — Hurghada, horses | — | $170 /guest |

**Reading of this [INTERPRETATION]:** the Egyptian market clusters hard at
**$170–$200 for a one-hour shoot**, which is exactly where the brochure sits
($179 dunes / $199 rooftop). Flying Dresses Egypt is therefore *at* market, not
below it, and cannot win on price — the market floor is $125 and some resellers
list $500 for the same hour. What differentiates at this price point is **what
the price visibly includes**. The brochure's inclusions are unusually strong for
the band: door-to-door transport, **100+ colour-graded photographs**, a dedicated
assistant for the dress, and the dress itself. Several $180 competitors list
**six retouched photos**. One lists 25+. One lists 10.

**This is the single most important commercial finding in this document.**
"100+ edited photographs" against a competitor's "6 retouched photos" at the
same price is a 16× difference in the deliverable, and it is a verifiable,
non-promotional fact. It drives design decision D3 in §4.

### Dress rental without a photoshoot — the new service

This is the product category the request is about, so I looked specifically for
how anyone else sells it.

- **Göreme, Cappadocia — "Cappadocia Flying Dress Rental"**, Cappadocia Life
  Travel, listed on Expedia NZ. **NZ$39.38 per adult** for a **3-hour rental of
  one dress, photoshoot explicitly excluded**, collected from a store in Göreme
  **or delivered to your hotel**. **[SEARCH]**
- **Powertraveller — long flying dress for rental, Cappadocia**, from **$39.77
  per person**, delivery to hotel. **[SEARCH]**
- Cappadocia Studio's own rental add-on page — **[UNVERIFIED]**, domain does not
  resolve.

**Reading [INTERPRETATION]:** rental-only is an established, separately-sold
product in Cappadocia — the most mature flying-dress market in the world — and
the two data points agree closely on the shape: **one dress, a fixed window of
about three hours, hotel delivery, priced around a fifth to a quarter of the
full shoot.** I found **no Egyptian operator selling it at all.** That is the
gap. It is also why the build models rental as *duration window + delivery
method* rather than as a stripped-down photoshoot: the Cappadocia precedent says
those two fields are what a customer actually asks about.

I have deliberately **not** used the $39–$40 Cappadocia figure as an Egyptian
price. Different market, different currency, different cost base, different
seller. Per the owner's instruction, rental, accessories and men's wear all ship
**price-on-request**.

### Santorini Photo Agency — portfolio presentation

**[UNVERIFIED]** as a fetch. **[INTERPRETATION]** from prior knowledge of the
destination-photography category: agencies in Santorini and Mykonos compete
almost entirely on *volume and immediacy of portfolio*, with galleries that open
instantly and run to hundreds of frames, because the only question a buyer
actually has is "will my photos look like that". Worth adopting: portfolio as a
first-class destination, not a sub-page. Worth rejecting: the infinite-scroll
wall of near-identical frames, which flattens the three genuinely different
Egyptian locations into one undifferentiated beige.

---

## 3. Craft references

All **[INTERPRETATION]** — these galleries were not fetched. Included because
the brief asks for a design direction, and a direction has to come from
somewhere nameable.

1. **Peak'n Film (Awwwards)** — `awwwards.com/sites/peakn-film`. The reference
   the brief names. Cinematic-film-studio presentation: full-bleed footage,
   restrained chrome, type that enters with the image rather than over it.
   **Adopt:** the discipline of letting one frame hold the whole viewport with
   almost no UI on it. **Reject:** a long pre-loader before the site is usable —
   the brief forbids it and so do the Core Web Vitals targets.
2. **SiteInspire's photography category** — the category's house style is
   asymmetric editorial grids with deliberate empty columns. **Adopt:** the
   offset grid for the portfolio, so a tall portrait and a wide landscape can sit
   together without either being cropped to fit a card. **Reject:** the common
   habit of hiding the navigation until scroll — a booking link must never be
   more than one tap away.
3. **Luxury fashion campaign pages generally** — type at display sizes, editorial
   serif against a highly legible sans, colour carried entirely by photography.
   **Adopt:** exactly that split, and a near-monochrome chrome so twelve
   saturated dresses are the only colour on the page.
4. **Luxury hotel and resort sites** — the "inclusions" table done well: what is
   included stated plainly and early, before the booking step. **Adopt**, because
   §2 says inclusions are this brand's strongest commercial asset.
5. **Editorial magazine long-form** — the pinned scroll sequence used *once*, for
   one story, rather than on every section. **Adopt** as a hard limit: one pinned
   scene on the home page, nowhere else.

### Technical documentation consulted

- **CSS scroll-driven animations** (`animation-timeline: view()` / `scroll()`) —
  chosen as the backbone of the motion system. **[INTERPRETATION]** of the
  trade-off: it is the only way to get genuinely scroll-linked motion with **zero
  added JavaScript**, which is the single biggest lever on the brief's INP and
  LCP targets. Unsupported browsers simply show the content in its final state,
  which is the correct fallback rather than a broken one.
- **GSAP ScrollTrigger / Motion for React / Lenis** — all three were considered
  and **all three were declined**. The brief itself says not to install every
  animation library and not to run two animation systems against the same
  elements; this repository's own guidance says not to add unnecessary
  dependencies; and `next build` cannot complete in this sandbox (`CLAUDE.md`
  §8), so I cannot measure a new client bundle's real cost before shipping it to
  a branch of a repo whose default branch deploys to a live site taking card
  payments. Zero new dependencies is the defensible choice here. `motion@14.1.1`
  is available on the registry if a later pass wants component-level gestures.
- **`prefers-reduced-motion`** per WCAG 2.2's animation-from-interactions
  guidance — implemented as a single blanket block that disables every
  animation, transition and scroll timeline in the Flying Dresses stylesheet, so
  a reduced-motion visitor gets the full layout and no movement.

---

## 4. The design decisions that came out of all this

These are the decisions the research actually produced, each traceable to a
finding above.

**D1 — A separate root layout, not a section of Egypt Eye.**
From §1 ("what not to carry over") and the owner's explicit choice. This Next 16
app has no `src/app/layout.tsx`; `[locale]` and `studio` are already separate
root layouts, so `src/app/flying-dresses/` can own its `<html>`, its fonts and
its palette with no effect on the production travel site. Verified as a working
pattern by reading the existing tree, not assumed.

**D2 — Lead with 7am, not with "luxury".**
From §1 Finding 5. Every competitor in §2 can claim premium; only this operator
can claim the hour before the gates open. A checkable fact outperforms an
adjective.

**D3 — Put "100+ colour-graded photographs" in the first viewport.**
From §2. It is the brand's largest verifiable advantage at its price point, and
competitors at the same price are shipping 6–25 images. It goes in the hero's
supporting line and again in the inclusions block — not buried in an FAQ.

**D4 — Rental is modelled as window + delivery, and priced on request.**
From §2's Cappadocia precedent and the owner's instruction. `durationNote` and
`delivery: "hotel-delivery" | "collection"` are real fields; price is absent
entirely rather than zero, so there is nowhere for an invented figure to live —
the same structural trick `lib/booking/outfits.ts` uses for dresses.

**D5 — Men's wear ships as the five named gawns, with photographs flagged.**
From §1 Finding 3. The names come from the brochure; nothing else about them is
invented; and the picker labels any garment without a photograph as "photo
coming soon" rather than passing a colour swatch off as the garment, reusing the
existing mechanism.

**D6 — Accessories ship as a service with no item list.**
Nothing in the brochure or on any reachable page names a single accessory. The
brochure says only "Accessories and men's outfits are available." So the
accessories page describes the *service* truthfully and carries an enquiry; the
item list is an owner-confirmation line, not a guess. An empty collection
renders as absent, exactly as `MENS_OUTFITS` did before this change.

**D7 — Near-monochrome chrome, colour from the dresses only.**
From §3.3 and from the business fact that there are twelve saturated dress
colours. Ivory, charcoal, one restrained antique gold. No purple-blue gradient,
no glassmorphism, no repeated three-card rows.

**D8 — CSS-only motion with a total reduced-motion off-switch.**
From §3's technical note. Fabric-inspired `clip-path` reveals, view-timeline
scaling, one pinned scene. No new dependencies.

**D9 — No testimonials until real ones with attribution exist.**
Nothing reachable in this session gave a quotable, attributable review for this
brand. The trust section therefore carries verifiable operational facts
(inclusions, timings, delivery window) instead of invented social proof, and the
owner-confirmations doc asks for the real reviews.

---

## 5. Five high-impact opportunities competitors appear to underuse

Each is something the research suggests the market is doing badly, that this
brand can execute well.

1. **Sell the dress without the photographer.** **[SEARCH]** found rental-only
   established in Cappadocia and **no Egyptian operator offering it**. It opens a
   price point far below $179, reaches travellers who already have a photographer
   or just want the photos on their own phone, and monetises wardrobe that is
   otherwise idle between shoots. This is the largest single opportunity found.
2. **Compete on the deliverable, loudly.** 100+ colour-graded photographs
   against competitors' 6–25 at the same price **[SEARCH]** is the strongest
   honest claim available, and essentially nobody in the listings leads with
   image count. Most lead with the location, which every competitor shares.
3. **Own the hour before the gates open.** **[VERIFIED]** 7am rooftop access
   with no entry ticket is structurally unavailable to any shoot inside the Giza
   complex. No reseller listing surfaced this at all.
4. **Make the couples' shoot real by actually showing men's attire.**
   **[VERIFIED]** the promise exists and the inventory is invisible. Every
   competitor listing found is implicitly solo-female. Five named gawns, shown
   properly, make a two-person booking an obvious product rather than a
   question — and two-person bookings double a per-person price.
5. **Let people choose the dress before they talk to anyone.** The twelve
   dresses are the brand's best asset and most competitors show one or two, or a
   contact form. A wardrobe that is browsable, filterable by colour and carried
   into the enquiry message means the first message the business receives already
   says which dress, which location and which date — which is a materially
   shorter path to a booking.

---

## 6. Deliberately not done, and why

- **No audit of the existing flyingdressesegypt.com.** It does not resolve here
  (§0). Nothing in the build depends on it, and the owner-confirmations document
  asks for the current prices rather than assuming the brochure is live.
- **No testimonials, ratings, review counts, customer numbers, awards or
  founding claims.** None were verifiable. §4 D9.
- **No accessory item list, no dress sizes, no stock or availability promises,
  no rental prices, no cancellation-policy interpretation.** All owner input.
  The brochure's 15-day and 7-day cancellation provisions do appear to overlap,
  and that ambiguity is recorded for the owner rather than resolved by guessing.
- **No competitor photography.** Every image used is either already in this
  repository or an openly-licensed stand-in in a clearly-marked replaceable
  slot. See `docs/FLYING-DRESSES-ASSET-CHECKLIST.md`.
- **No fix to the Egypt Eye FAQ price contradiction (§1 Finding 2)**, despite it
  being a real live bug. It changes production pricing copy on six products and
  belongs to its own reviewed change.
