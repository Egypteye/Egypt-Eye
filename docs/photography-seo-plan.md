# Photography Topical Authority Plan

Everything here is grounded in what Egypt Eye actually sells, taken from
`src/content/photoshoots.ts`, `src/content/stories.ts` and `src/content/tours.ts`
as of this commit. Where a fact is not in the codebase it is marked
**[NEEDS CONFIRMATION]** — nothing in that state should be published.

---

## 1. Audit of current photography content

### 1.1 The products that actually exist (6)

| Product | Price | Was | Duration | Locations |
|---|---|---|---|---|
| Exclusive Pyramids Photoshoot | **$75** | $100 | 1–2 hrs | Giza Pyramids, Nine Pyramids View |
| Jumping Horse Photoshoot | **$120** | $150 | 1–2 hrs | Giza Pyramids, Nine Pyramids View |
| Pyramids Proposal Romance Setup | **$150** | — | 1 hr | Giza Pyramids, Nine Pyramids View |
| Running Horse Video + Jumping Horse | **$160** | $195 | 1–2 hrs | Giza Pyramids, Nine Pyramids View |
| Sand Dunes Flying Dress | **$199** | $250 | 1 hr | Sand Dunes (Giza) |
| Fayoum Flying Dress | **$219** | $270 | 1 hr | Wadi El Rayan & the Magic Lake |

**Exclusive Pyramids Photoshoot — what is actually included:** private professional
photographer, professional camera equipment, private transportation, parking &
road tolls, 80+ edited pictures, 24-hour follow-up service.
**Delivery:** 80+ edited pictures; raw unedited photos the same day; optional
larger gallery of 100+ high-resolution edited images within 5 days.
**Add-ons:** professional video Reel, Arabian horse photography, camel
experience, group photoshoot.

**Entrance tickets are NOT included — confirmed.** Travelers buy them at the
gate. This is a real, recurring pre-booking question and the content says so
plainly rather than staying silent.

**Also confirmed (2026-09-28):** a deposit secures the date, with the balance
paid the same day *after* the shoot in cash or by transfer; bad weather and late
arrivals are handled by rescheduling; pickup and drop-off are included; a
photoshoot can be combined with any tour; all required equipment is provided.

### 1.2 The 15 published photography articles

| Slug | Primary keyword | Verdict |
|---|---|---|
| `pyramids-photoshoot-guide` | Pyramids photoshoot | **Keep — promote to pillar** |
| `private-photographer-egypt` | private photographer Egypt | **Keep — promote to pillar** |
| `flying-dress-photoshoot-egypt-guide` | flying dress photoshoot Egypt | **Keep — sub-pillar** |
| `best-time-for-pyramids-photoshoot` | best time for Pyramids photoshoot | Keep, expand |
| `best-photo-spots-in-egypt` | best photo spots in egypt | Keep, expand |
| `photography-tips-for-egypt` | egypt photography tips | Keep (top-of-funnel) |
| `flying-dress-photoshoot-pyramids-giza` | flying dress photoshoot pyramids | Keep |
| `what-to-wear-flying-dress-photoshoot` | what to wear flying dress | **Expand** to all shoot types |
| `best-flying-dress-photoshoot-locations-egypt` | flying dress locations | **Merge candidate** |
| `best-time-flying-dress-photoshoot` | best time flying dress | **Merge candidate** |
| `egypt-photoshoot-content-creators` | Egypt photoshoot content creator | Keep (niche, commercial) |
| `egypt-eye-travel-photography-experiences` | Egypt travel photography experiences | **Convert to hub** |
| `best-instagram-photo-spots-egypt` | best Instagram photo spots | **Cannibalisation** |
| `most-instagrammable-places-in-egypt` | Instagrammable places in Egypt | **Cannibalisation** |
| `the-egypt-you-dont-see-on-instagram` | authentic Egypt travel | Keep (brand, not SEO) |

### 1.3 What the audit found

**The catalogue is strong and the content does not sell it.** Fifteen articles,
and not one answers *how much does a Pyramids photoshoot cost* — the single
highest commercial-intent query in the set. Egypt Eye's own pricing is a
competitive weapon (below) and it appears in no article.

**Five flying-dress articles, one Cairo article: zero.** Flying dress is ~4% of
search volume in this space and has a third of the coverage. "Photographer in
Cairo" has none.

**Three articles compete for Instagram-spot queries.** `best-photo-spots-in-egypt`,
`best-instagram-photo-spots-egypt` and `most-instagrammable-places-in-egypt`
split the same intent three ways.

**`/photoshoots` has zero FAQs.** FAQPage schema is already wired on photoshoot
*detail* pages (`photoshoots/[slug]/page.tsx:53`) with 4 questions each; the
listing page has none. That is free rich-result real estate.

**Nothing covers the pre-booking anxiety block:** is it allowed, where do we
meet, is transport included, what if it rains, how many photos, how fast.

---

## 2. The competitive gap

From live search (sources at the end):

| | Typical competitor | Egypt Eye |
|---|---|---|
| Edited photos | 20 (1 hr) → 50 (4 hrs) | **80+** |
| Delivery | up to 14 days | **raw same day**, 100+ in 5 days |
| Entry price | ~$190/person; flying dress from $400 | **$75** |
| Transport | usually extra | **included** |

**This is the whole strategy.** Egypt Eye delivers roughly four times the photos,
same-day, at a fraction of the price. Every commercial article should make that
comparison factually, using the numbers above and no others.

Competitors also rank largely through **Viator / TripAdvisor / Marriott activity
listings** rather than owned content — meaning the informational SERP is
genuinely winnable with real articles.

What competitors do NOT answer well: permission/legitimacy, meeting logistics,
what happens in bad weather, whether tickets are included, turnaround, and
anything about couples/family/proposal shoots beyond a line on a listing page.

---

## 3. Hub structure

```
/photoshoots                                  ← commercial hub (exists)
  └ /photoshoots/[slug]                       ← 6 product pages (exist)

/stories/hiring-a-photographer-in-egypt       ← NEW pillar: hiring & booking
/stories/pyramids-photoshoot-guide            ← EXISTING pillar: the shoot itself
/stories/pyramids-photoshoot-cost             ← NEW pillar: money
/stories/flying-dress-photoshoot-egypt-guide  ← EXISTING sub-pillar
```

Four pillars, each with supporting articles that link up to it and across to the
product. No article sits more than one click from a bookable page.

---

## 4. Proposed articles, in priority order

### TIER 1 — build these first (highest booking intent)

---

#### A1. `pyramids-photoshoot-cost`
**Title:** How Much Does a Pyramids Photoshoot Cost? (2026 Prices)
**H1:** How Much a Pyramids Photoshoot Actually Costs in 2026
**Intent:** Commercial. **Primary kw:** how much does a pyramids photoshoot cost
**Secondary:** pyramids photoshoot price, photographer giza cost, how much is a photographer in cairo, giza photoshoot cost, egypt photoshoot price
**Type:** Article → the single most valuable missing page.

**Must answer:** the real price range in Egypt; what changes it (duration, people,
horse/camel, video, flying dress); what is included vs extra; **that entrance
tickets are not included, and that transport is**; how the deposit-then-balance
payment actually works; why photo count matters more than hourly rate; the
80-photos-for-$75 comparison against 20-photos-for-$190.

**H2s:** What a Pyramids photoshoot costs in 2026 · What actually drives the price ·
What's included (and what isn't) · Why "photos delivered" matters more than "hours" ·
Egypt Eye's pricing, plainly · Is the cheapest option a false economy?

**Links to:** `/photoshoots/exclusive-pyramids-photoshoot` (primary CTA),
all 6 products in a price table, `hiring-a-photographer-in-egypt`, `pyramids-photoshoot-guide`
**CTA:** "See all six packages and what each includes →"
**Schema:** Article + FAQPage. *(Do not use Product/Offer schema on an article.)*
**FAQs:** Is $75 realistic? · Are entrance tickets included? (no — bought at the
gate) · How does payment work? (deposit secures the date; balance the same day
after the shoot, cash or transfer) · Is transport extra? (no — pickup and
drop-off included)
**Cannibalisation:** None. Genuine gap.

---

#### A2. `hiring-a-photographer-in-egypt`
**Title:** How to Hire a Photographer in Egypt: A Traveler's Guide
**H1:** How to Hire a Photographer in Egypt (Without Getting It Wrong)
**Intent:** Both. **Primary kw:** how to hire a photographer in egypt
**Secondary:** how to hire a photographer in giza, how to book a photographer in egypt, can tourists hire a photographer in egypt, photographer for tourists in cairo, how to book a pyramids photoshoot
**Type:** **Pillar article.**

This absorbs a dozen near-identical queries — *how to hire / how to book / can
tourists hire / where do I find* — which do not deserve separate pages.

**Must answer:** where to find a photographer; how to tell a real operator from a
tout; how booking works end to end; where you meet; whether transport is included;
what to confirm before paying; deposit and cancellation; what happens on the day.

**H2s:** Can tourists hire a photographer in Egypt? · Where travelers actually find
one (and the risks of each) · How to tell a legitimate operator from a tout ·
What to confirm before you pay · How booking works with Egypt Eye · Where you meet
and what happens next
**Links to:** `/photoshoots`, `pyramids-photoshoot-cost`, `what-happens-pyramids-photoshoot`,
`/cancellation-policy` (real, and a trust signal)
**CTA:** "Check availability for your dates →"
**Schema:** Article + FAQPage + BreadcrumbList
**Cannibalisation risk:** **Yes — with `private-photographer-egypt`.** See §7.

---

#### A3. `can-you-hire-photographer-at-pyramids`
**Title:** Can You Hire a Photographer at the Pyramids? What's Actually Allowed
**H1:** Can You Hire a Photographer at the Pyramids?
**Intent:** Informational, very high pre-booking. **Primary kw:** can i hire a photographer at the pyramids
**Secondary:** can i get professional photos at the pyramids, pyramids photography rules, can you bring a camera to the pyramids, professional camera pyramids

**This is the anxiety query.** People will not book until they believe it is
permitted. Nobody ranking today answers it clearly.

> **Accuracy warning.** Egypt's 2022 rules allow personal photography in public
> places without a permit, but sources **actively conflict** on tripods and
> professional equipment. This article must describe what Egypt Eye does in
> practice and must **not** assert a permit position. Any sentence claiming what
> is or isn't permitted for professional gear is **[NEEDS CONFIRMATION]** and
> should be confirmed with the Ministry of Tourism and Antiquities before
> publishing.

**Must answer:** yes, tourists have professional shoots there routinely; what the
site is like; how Egypt Eye's photographers work; what's not allowed (drones are
prohibited without Ministry of Defence permit — well established); the honest
uncertainty about tripods rather than a confident wrong answer.
**Links to:** `pyramids-photoshoot-guide`, `hiring-a-photographer-in-egypt`, `/photoshoots/exclusive-pyramids-photoshoot`
**CTA:** "We handle the logistics — see the Pyramids package →"
**Schema:** Article + FAQPage

---

#### A4. `photographer-in-cairo`
**Title:** Hiring a Photographer in Cairo: Locations, Prices and How It Works
**H1:** Hiring a Photographer in Cairo
**Intent:** Both. **Primary kw:** photographer in cairo
**Secondary:** private photographer cairo, cairo photoshoot, where can i take professional photos in cairo, best places for photography in cairo, professional photographer egypt
**Type:** **City landing page** (the LocalLens pattern — competitors rank with these and Egypt Eye has none).

**Must answer:** Cairo vs Giza — what most searchers actually want; the real
locations Egypt Eye shoots; how to combine a Cairo stay with a Giza shoot;
pricing; transport from Cairo hotels (**included** in the Pyramids package).
**Links to:** `/photoshoots`, `pyramids-photoshoot-cost`, `best-photo-spots-in-egypt`
**Cannibalisation:** Low, if it stays Cairo-framed and defers Pyramids detail.

---

#### A5. `what-happens-pyramids-photoshoot`
**Title:** What Actually Happens During a Pyramids Photoshoot
**H1:** What a Pyramids Photoshoot Is Actually Like
**Intent:** Informational, immediately pre-booking. **Primary kw:** what happens during a pyramids photoshoot
**Secondary:** how does a pyramids photoshoot work, where do photographers meet clients at the pyramids, how long does a pyramids photoshoot take, do i need to know how to pose

Absorbs: how does it work · where do we meet · how long · do I need to pose ·
what if I'm late · what if the weather is bad · how private is it.

**Must answer:** hour by hour, from pickup to delivery. All confirmed: hotel
pickup and drop-off included, parking and tolls covered, 1–2 hours, all equipment
provided, the photographer directs throughout, raw photos the same day, 24-hour
follow-up, and rescheduling if the weather turns or you are running late.
**CTA:** "Book the Exclusive Pyramids Photoshoot — $75 →"
**Schema:** Article + FAQPage + HowTo (genuinely step-based)

---

#### A6. `pyramids-photoshoot-what-included`
**Title:** What's Included in a Pyramids Photoshoot (and What Isn't)
**Intent:** Commercial. **Primary kw:** what is included in a pyramids photoshoot
**Secondary:** how many photos do you get, do photographers edit the photos, how long to receive photos, are entrance tickets included

**The honesty page, and a conversion page.** Sets out all six packages' inclusions;
states plainly that entrance tickets are not included; covers editing and the
same-day raw / 5-day gallery split. Directly beats competitors on the numbers.
**Schema:** Article + FAQPage

---

### TIER 2 — occasion pages (high intent, low competition)

| Slug | Title | Primary kw | Links to product |
|---|---|---|---|
| `proposal-photographer-pyramids` | Planning a Proposal at the Pyramids: Photographer, Setup and Timing | proposal photographer egypt | `pyramids-proposal-romance-setup` ($150) |
| `couples-photoshoot-pyramids` | Couples Photoshoot at the Pyramids | couple photoshoot at the pyramids | `exclusive-pyramids-photoshoot` |
| `family-photoshoot-pyramids` | Family Photoshoot at the Pyramids: What Works With Kids | family photoshoot at the pyramids | + group add-on |
| `solo-photoshoot-egypt` | Solo Travel Photoshoot in Egypt | solo photoshoot in egypt | `exclusive-pyramids-photoshoot` |
| `birthday-photoshoot-egypt` | Birthday Photoshoot in Egypt | birthday photoshoot at the pyramids | proposal setup as styling base |
| `horse-camel-photoshoot-pyramids` | Horse and Camel Photoshoots at the Pyramids | arabian horse photoshoot egypt | `jumping-horse-photoshoot` ($120), `running-horse-video-jumping-horse-photoshoot` ($160) |

The horse/camel page is a **notable untapped asset** — two products, $120 and $160,
with real search demand and **zero** existing article.

### TIER 3 — supporting

- `photographer-vs-phone-photos-egypt` — "is it worth hiring a photographer at the pyramids" (high commercial intent, pure persuasion, uses the 80-photo fact)
- `photoshoot-photo-delivery-editing` — delivery and editing turnaround; absorbs several queries; strong differentiator
- `combine-photoshoot-with-tour-egypt` — links to the **listed** tours that already include a Giza photoshoot day: `8-day-essential-egypt-nile-cruise`, `10-day-private-luxurious-trip`, `epic-8-day-egypt-escapade`
- `what-to-wear-pyramids-photoshoot` — expands the existing flying-dress-only wear article to all shoot types
- `fayoum-photoshoot-guide` — the $219 Fayoum product has real search space (Wadi El Rayan, Magic Lake) and no article

### Explicitly NOT recommended

- **Rooftop photoshoot with Pyramids view** — competitors sell this at ~$650.
  Egypt Eye has no rooftop product. Writing the article would rank for something
  you cannot sell. **Revisit only if a rooftop package is added.**
- Separate pages for *how to hire* / *how to book* / *where to find* — one intent,
  one page (A2).
- A "Giza photographer" page separate from A2 and A4 — it would cannibalise both.

---

## 5. Cannibalisation risks and fixes

1. **`private-photographer-egypt` vs new A2.** Same intent. **Fix:** do not create
   A2 as a new URL. **Rewrite and expand `private-photographer-egypt` in place**,
   keeping the URL and its existing equity, and retitle it to the hiring pillar.
   This is the single most important decision in this plan.
2. **~~Three Instagram-spot articles.~~ Two, and the third does not exist.**
   This item was written against a `most-instagrammable-places-in-egypt` that
   is not in the content files, in Sanity, or in the redirect map — the title
   was misremembered. The two real articles are `best-instagram-photo-spots-egypt`
   (Giza, Khan el-Khalili, Luxor, Fayoum, Siwa) and `best-photo-spots-in-egypt`
   (timing-led: the balloon, Abu Simbel, the White Desert, Philae, Nine
   Pyramids View). They overlap on Giza and golden-hour advice but answer
   different questions, so **no 301 was issued** — merging them would have
   destroyed real content to fix a duplicate that wasn't one.
   **Done instead:** split them explicitly by intent. `best-photo-spots-in-egypt`
   is re-angled toward *shoot* locations and linked to the flying dress and
   exclusive Pyramids products; `best-instagram-photo-spots-egypt` keeps the
   shoot-it-yourself angle. Each now opens by naming the other.
3. **Five flying-dress articles.** Merge `best-time-flying-dress-photoshoot` into
   `flying-dress-photoshoot-egypt-guide` as a section; 301 the old URL. Keep the
   locations and what-to-wear pieces — they hold distinct long-tail.
4. **A4 Cairo vs A1/A3 Giza.** Keep A4 on Cairo-as-a-base framing.

Every merge above must use a 301. Both mechanisms now read from one map,
`STORY_REDIRECTS` in `src/content/redirectedStories.ts`: `next.config.ts`
generates its `redirects()` entries from it, and `src/lib/sitemapEntries.ts`
filters the sitemap against it. Adding a redirect there is the whole change.
`scripts/check-story-images.mts` fails the build if a destination isn't a
published story, or if a redirected slug is still published.

Not to be confused with `RETIRED_STORY_SLUGS` in `src/content/retiredStories.ts`
— that is the 410 Gone list for articles pulled with no replacement, read by
`src/proxy.ts` on the Edge runtime. The two lists must not overlap: a 301 in
`next.config.ts` runs before middleware, so a slug in both would never reach
its 410.

---

## 6. Internal linking

```
                    /photoshoots  ←──────────────┐
                        ▲                        │
        ┌───────────────┼───────────────┐        │
        │               │               │        │
   A1 cost ◄────► A2 hiring ◄────► A3 allowed    │
        │               │               │        │
        └──────► A5 what happens ◄──────┘        │
                        │                        │
                 A6 what's included ─────────────┤
                        │                        │
        ┌───────────────┴──────────────┐         │
   occasion pages (Tier 2) ────────────┴─────────┘
        │
   flying dress cluster · locations · timing
```

Rules: every article links **up** to its pillar, **across** to two siblings, and
**down** to exactly one product page as the primary CTA. Never more than one
primary CTA per article.

---

## 7. Service / landing page work

1. **Add FAQs to `/photoshoots`.** It has none. Eight to ten, reusing the real
   per-product answers. `listingPages.tours` already carries `faqs` and the
   pattern renders via `FaqAccordion` — this is a content edit, not new code.
2. **Add a price comparison table** to `/photoshoots` — all six packages, photo
   counts, durations. It is Egypt Eye's strongest argument and is currently absent.
3. **Expand per-product FAQs from 4 to 8** on the two flagship products. FAQPage
   schema is already emitted, so this is pure upside.

---

## 8. Schema

| Page | Schema | Status |
|---|---|---|
| Photoshoot detail | FAQPage | **Already emitted** — extend question count |
| Photoshoot detail | Service / Offer with real `price` | **Proposed** — prices are real and public |
| New articles | Article + FAQPage | Proposed |
| A5 | HowTo | Proposed |
| All | BreadcrumbList | `breadcrumbJsonLd()` exists |

**Do not** add AggregateRating anywhere. `src/content/seo.ts:111` deliberately
restricts it to figures computed from real reviews, and the testimonials are
being purged — inventing one would be exactly the fabrication that guard prevents.

---

## 9. Implementation plan

**Phase 1 — fix what exists (no new URLs).** Add `/photoshoots` FAQs + price
table; expand flagship product FAQs; execute the three merges with 301s. Lowest
risk, fastest return.

**Phase 2 — the money pages.** A1 cost, then rewrite `private-photographer-egypt`
into A2, then A3 allowed. These three carry most of the commercial intent.

**Phase 3 — experience pages.** A5, A6, A4 Cairo.

**Phase 4 — occasions.** Tier 2, starting with proposal and horse/camel, both of
which map to existing products with zero current coverage.

**Phase 5 — supporting.** Tier 3.

Publish two per week at most. Each one needs the real numbers checked against
`photoshoots.ts` at the time of writing, because prices in this plan will go stale.

---

## 10. Open questions — answer before writing

1. Are entrance tickets ever included, or always the traveler's own cost?
2. Payment terms — deposit, balance, on-the-day?
3. Bad weather and late arrival policy?
4. Exact meeting arrangement for the Pyramids shoot?
5. Is there any rooftop capability, or should that intent stay unserved?
6. Can a photoshoot be booked alongside any tour, or only the three that include one?
7. The tripod/professional-equipment permit position — what does Egypt Eye
   actually do in practice?

Items 1–4 and 7 appear in nearly every Tier 1 article. Without them, the articles
either stay vague where travelers most want certainty, or invent an answer.

---

## Sources

- [Hire a Cairo Photographer: Egypt Photoshoot Packages & Pricing — LocalLens](https://locallens.com/destinations/cairo-egypt-photographer/)
- [Hire a Photographer for a Photoshoot in Egypt — Localgrapher](https://www.localgrapher.com/photographers-egypt/)
- [Giza Photography Tours — Viator](https://www.viator.com/Giza-tours/Photography-Tours/d23032-g12-c26028)
- [Hire Photographer, Professional Photo Shoot — Pyramids of Giza — Tripadvisor](https://www.tripadvisor.com/AttractionProductReview-g294202-d24053342-Hire_Photographer_Professional_Photo_Shoot_Pyramids_of_Giza-Giza_Giza_Governorate.html)
- [Book A Photoshoot in Egypt — Arabian Moments](https://arabianmoments.com/pages/egypt-photoshoot)
- [Egypt allows personal photography in public places without permit — Ahram Online](https://english.ahram.org.eg/News/472831.aspx)
- [Egyptian Government decided to allow photographs for free — Ministry of Tourism and Antiquities](https://egymonuments.gov.eg/en/news/egyptian-government-decided-to-allow-egyptians-and-tourists-to-take-photographs-for-free/)
- [Egypt Photography Rules 2026: Permits & Drone Laws — Nile Empire](https://www.nileempire.com/photography-permits-for-tourists-in-egypt/)
