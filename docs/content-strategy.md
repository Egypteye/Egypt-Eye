# Egypt Eye Content Strategy

Written against the site as it exists today, not against an imagined blank
slate. Every count below was measured from the codebase, not estimated.

---

## The finding that changes the brief

**Egypt Eye already publishes 168 live articles.** The 60 proposed topics were
mapped against every one of them by keyword overlap, and then the 20
highest-value matches were checked by hand:

| | |
|---|---|
| Topics already covered by a live article | **24** |
| Topics partially covered (an existing article ranks for the same intent) | **19** |
| Genuinely new | **17** — and 10 of those are blocked (see below) |

Every single one of these already exists and is live:

`pyramids-photoshoot-guide` · `pyramids-photoshoot-cost` ·
`photographer-vs-phone-photos-egypt` · `what-to-wear-pyramids-photoshoot` ·
`proposal-photographer-pyramids` · `birthday-photoshoot-egypt` ·
`private-airport-transfer-vs-taxi-cairo` · `cairo-airport-transfer-guide` ·
`private-vs-group-tours-egypt` · `how-to-choose-a-private-tour-company-egypt` ·
`is-the-white-desert-worth-visiting` · `western-desert-oases-guide` ·
`best-day-trips-from-cairo` · `egypt-beyond-the-pyramids-hidden-gems` ·
`best-photo-spots-in-egypt` · `private-photographer-egypt` ·
`flying-dress-photoshoot-pyramids-giza` · `best-time-for-pyramids-photoshoot` ·
`vip-meet-and-assist-cairo-airport` · `ultimate-egypt-bucket-list`

**So writing the 60 as briefed would be the most damaging thing we could do to
this site's search performance.** Topic 7 ("What to Wear for a Photoshoot at
the Pyramids") is a 1.00 title match with `what-to-wear-pyramids-photoshoot`.
Topic 37 is a 1.00 match with `is-the-white-desert-worth-visiting`. Publishing
those would split the ranking signal of pages that are already earning it —
the exact cannibalisation the brief says to avoid.

The opportunity here is not 60 new articles. It is **7 real gaps, 1 urgent
event, 10 customer stories, and a structural problem worth more than all of
them combined.**

---

## The structural problem

168 articles is not a content library, it is a pile, unless the reader and the
crawler can see its shape. Right now the photography cluster alone has 15
articles with no declared hierarchy — `best-instagram-photo-spots-egypt` and
`most-instagrammable-places-in-egypt` were competing for the same query until
the consolidation pass in `docs/photography-seo-plan.md` §5.

That pattern repeats across clusters that have never been audited:
transfers, private tours, desert, celebrations.

**The highest-return work is not writing. It is:**

1. Declaring a pillar per cluster and pointing the supporting articles at it.
2. Finding and killing the remaining cannibalisation pairs.
3. Making every article link to the Egypt Eye service it should convert to —
   the chain the brief describes (question → article → experience → service)
   is currently broken in most of the 168.

One well-linked cluster of 15 existing articles will outrank 15 new orphans.

---

## Clusters, pillars, and where the 60 land

### Cluster 1 — Photography (the money cluster)

Already audited in full in `docs/photography-seo-plan.md`. 15 live articles,
6 real products, prices confirmed. Pillars: `private-photographer-egypt`
(commercial) and `pyramids-photoshoot-guide` (informational).

Topics 1–10 map almost entirely onto existing pages. **Actions:**

| Topic | Verdict |
|---|---|
| 1 Hire a photographer in Giza | **Merge** into `private-photographer-egypt` as its transactional section. Do not create — it would cannibalise the pillar. |
| 2 How much does a photographer cost | Covered by `pyramids-photoshoot-cost`. Expand with the non-photoshoot cases. |
| 3 Can you hire a photographer at the Pyramids | **BLOCKED** — needs the on-site permit answer (see Open questions). Highest-value unanswered query on the site. |
| 4, 6, 7, 10 | Covered. Expand, do not duplicate. |
| 5 Plan a professional photoshoot in Cairo | **New, narrow** — Cairo-not-Giza is a real distinct intent (studio, Islamic Cairo, rooftops). |
| 8 Photo spots in Giza besides the Pyramids | Fold into `best-photo-spots-in-egypt` as a Giza section. |
| 9 Better photos without a pro camera | Covered by `photography-tips-for-egypt`. |
| 33 Viral photo spots | **Cannibalises** two existing pages. Do not create. |

### Cluster 2 — Private & custom trips

Live: `private-vs-group-tours-egypt`, `how-to-choose-a-private-tour-company-egypt`,
`how-to-plan-a-trip-to-egypt`. Topics 11–14 are all covered or partial.

**Action:** none are new articles. Promote `how-to-plan-a-trip-to-egypt` to
cluster pillar, and add a real **cost** section — "How much does a private tour
of Egypt cost" (13) is a commercial-intent query with no honest answer on the
site yet, and Egypt Eye has real prices to publish.

### Cluster 3 — Transfers & arrival

Live: `cairo-airport-transfer-guide`, `private-airport-transfer-vs-taxi-cairo`,
`vip-meet-and-assist-cairo-airport`. Topics 15–19 covered.

**Topic 20 — "What happens if your flight is delayed" — is the one genuine gap,
and it is the best conversion asset in the whole list.** It is a pre-booking
objection, nobody else answers it well, and Egypt Eye has a real policy. It
belongs as an **FAQ block on the transfers service page first**, and only as an
article if search volume justifies it.

### Cluster 4 — Celebrations (proposals, birthdays, gender reveals)

Live: `proposal-photographer-pyramids`, `birthday-photoshoot-egypt`. Egypt Eye
sells a **Pyramids Proposal Romance Setup at $150**.

Topics 21–29 are nine articles for what is really **one cluster with one gap**.
Nine pages on "celebrate in Egypt" would compete with each other on day one.

**Recommended structure:**
- **New pillar: "Celebrating a Milestone in Egypt"** — proposals, birthdays,
  gender reveals, anniversaries, one page, each with its own section and its
  own FAQ. This is the page that can rank for the head term and feed the
  existing two.
- Keep `proposal-photographer-pyramids` and `birthday-photoshoot-egypt` as the
  deep sub-pages.
- **Gender reveal (28) is genuinely uncovered** and Egypt Eye demonstrably does
  them — worth its own page once we have a real example.
- Topics 22, 27, 29 → sections of the pillar, not pages.

### Cluster 5 — Desert & oases

Live: `is-the-white-desert-worth-visiting`, `western-desert-oases-guide`.
Topics 37–41, 43, 44, 46, 47 are eight topics over two existing articles.

**Recommended:** `western-desert-oases-guide` becomes the pillar. Two real
sub-pages are worth building because they answer distinct, well-searched
questions the pillar can only gesture at:
- **White Desert vs Black Desert** (38, 41) — one comparison page, not two.
- **How to get from Cairo to Bahariya** (43) — pure logistics, and it is the
  physical gateway to every desert trip Egypt Eye sells.

Topics 40, 44, 45 (duration, camping, stargazing) → sections. Stargazing
overlaps `what-egypt-looks-like-after-dark`.

### Cluster 6 — Beyond the Pyramids

Live: `best-day-trips-from-cairo`, `egypt-beyond-the-pyramids-hidden-gems`,
`ultimate-egypt-bucket-list`. Topics 34, 36, 48, 49, 50 are covered.

**One real gap: weekend trips from Cairo (35)** — distinct from day trips,
maps directly onto the Weekly Trips product, and nothing on the site serves it.

### Cluster 7 — Yachts & the Red Sea

Topics 30, 31. **Genuinely new**, and Egypt Eye sells it (the Red Sea tile on
the homepage). **One page, not two** — "Is it worth it" is a section of "how to
book it", not a rival page.

### Cluster 8 — Events (time-sensitive)

**Topic 32, Forever Is Now 06, is the single most urgent item on the list and
the most under-rated.** Verified: Art D'Égypte's sixth edition, **4–28 November
2026, at the Giza Pyramids**, led for the first time primarily by women
artists. That is **five weeks away** and it puts international art-press
attention directly onto the plateau Egypt Eye works on every day.

Published now, it can rank before the event. Published in November, it cannot.
**This is the first thing to ship.** Implemented in this pass — see below.

Post-event behaviour: keep the URL, convert to a recap with real photographs,
and let it accrue authority for edition 07. The site already has the pattern
(`2027-total-solar-eclipse-luxor`).

---

## The customer stories — and why they are blocked

Topics 42 and 51–60 are ten real-customer stories. Strategically they are the
strongest idea in the brief: nobody else can write them, they are exactly what
AI search surfaces as first-hand experience, and they show the service working
rather than describing it.

**I cannot write them yet, and I will not fake them.**

Every name was searched against the codebase and against all 2,527 imported
reviews:

| Searched | Result |
|---|---|
| Alessandra, Gianluca | 2 review hits each — **different people.** Unrelated Giza tour and felucca reviews. |
| Vasileia | 1 hit — a Cairo walking tour review whose entire text is `:)` |
| Aziz | 1 hit — actually "Abdulaziz", a different traveller |
| Abby Zoobi, Zekra, Babsy, Dalia, Reem | **zero hits anywhere** |
| Noor, Greg, Olivia, Andrea, Mostafa | common first names, all unrelated reviews |

There is no verifiable record of any of these ten trips in this repository.
Writing them would mean inventing the locations, the dates, the activities and
the outcome — which is what the brief explicitly forbids, and what would make
them worthless as trust content the moment one detail was wrong.

**What each story needs before it can be written** (a short intake, per story):

1. Trip date (month and year is enough)
2. What they booked — the actual Egypt Eye products
3. Locations in order
4. Any real quote or review they gave, and permission to publish it
5. Their photographs, and permission to publish them
6. Permission to use their names, or the name they want used
7. Anything notable that actually happened

Give me that for any one of them and it becomes a 1,000–1,500 word story the
same day. Give me all ten and this becomes the site's best content asset.

---

## Priority order

| # | What | Why now |
|---|---|---|
| 1 | **Forever Is Now 06** | Hard deadline. 5 weeks. Shipped in this pass. |
| 2 | **Cluster pillars + internal linking** | Multiplies 168 existing articles. Beats any new writing. |
| 3 | **Transfers: flight-delay FAQ** | Removes a booking objection. Hours of work. |
| 4 | **Celebrations pillar** | Nine briefed topics collapse into one rankable page. |
| 5 | **Private tour cost** section | Commercial intent, real prices available. |
| 6 | **White vs Black Desert** | Clean comparison gap. |
| 7 | **Cairo → Bahariya logistics** | Gateway page for every desert sale. |
| 8 | **Weekend trips from Cairo** | Feeds Weekly Trips. |
| 9 | **Ain Sokhna yacht** | New product, no content. |
| 10 | **Cairo photoshoot (not Giza)** | Distinct intent from the Giza pillar. |
| 11 | **Customer stories** | Blocked on intake. Highest ceiling. |

Nine new articles, not sixty. The other 51 topics are better served by
improving pages that already rank.

---

## Open questions blocking work

1. **Can a traveller hire a photographer at the Giza plateau, and what does the
   site's permit position need to say?** Raised earlier and still unanswered.
   It blocks topic 3, which is one of the highest-intent queries in the set.
2. **The ten customer stories** — the intake above.
3. **Forever Is Now 06 admission and hours** — Art D'Égypte had not published
   them at the time of writing, and neither artdegypte.org nor cairoscene.com
   is reachable from this environment. The article says so plainly rather than
   guessing, and links out. Worth a manual check before the event.

---

## Standards applied to everything here

- No article is created where a live article already serves the intent.
- Every new page declares its pillar and links to the Egypt Eye product it
  should convert to.
- Facts that cannot be verified are marked or omitted, never guessed.
- Images come from Egypt Eye's own photography, or openly licensed sources with
  the credit recorded in `imageCredit` — the existing `check:stories` gate
  already enforces that all 168 covers are credited and distinct.
- Event pages state what is unknown rather than inventing it.
