# Flying Dresses Stories: audit, roadmap and workflow

Written 25 October 2026. Everything dated here was checked on that date.

---

## 1. The audit, in one page

### The single most important finding

**The two articles named in the brief are already live, and they are on the
other domain.**

| Article | Where it actually is | Live? | Approx. words |
|---|---|---|---|
| Flying Dress Photoshoot in Egypt: The Complete Guide | egypteyetravel.com/stories/flying-dress-photoshoot-egypt-guide | yes (200) | ~2,800 |
| Flying Dress Photoshoot at the Pyramids of Giza | egypteyetravel.com/stories/flying-dress-photoshoot-pyramids-giza | yes (200) | ~1,560 |

Egypt Eye also publishes `what-to-wear-flying-dress-photoshoot`,
`best-flying-dress-photoshoot-locations-egypt` and
`abby-zoobi-midnight-flying-dress-booking` on the same subject. A sixth,
`best-time-flying-dress-photoshoot`, was merged into the pillar and **301s**
to it — so its timing, wind and sunrise-versus-sunset material is covered,
even though the URL returns 404 on its own.

That changes the whole shape of this project. Rewriting those topics on
flyingdressesegypt.com would not add a reader; it would split one business's
signal across two domains, one of which has years of history and one of which
had its DNS pointed last month. **Roughly 20 of the brief's 50 proposed topics
are already covered by the sister site.**

### What the pillar already covers, heading by heading

Read from the live pages, not assumed:

- **The guide**: what a flying dress photoshoot is, why Egypt, what a session
  involves, dress selection, hair and makeup, locations and setups, timing,
  the wind problem, sunrise vs sunset, seasonal timing, what is delivered,
  Giza vs Fayoum, planning.
- **The Giza article**: where the shoot happens, timing around site hours and
  crowds, best angles, access and permits, what to expect on the day.

### What neither domain covers at all

**Cost.** Searched both articles: zero occurrences of `price`, `cost` or `$`.
This is the highest commercial intent query in the entire topic and nobody in
the business has written a word about it.

### What already existed here, and what was wrong with it

Flying Dresses had a Stories section with six genuinely good first-party
articles, a cluster model, source citations and FAQ schema. Three structural
faults, all invisible in a screenshot:

1. **The related rail was `slice(0, 3)`.** Every article recommended the same
   first three articles in file order. The sixth was unreachable from any of
   them.
2. **No article had a commercial destination.** Six editorial pages the
   business paid to write and was never paid for.
3. **Every article was an orphan.** Nothing on the site linked to any of them
   except the index, which is itself two clicks deep and not in the nav.

Plus: no contextual links inside the prose, no status system (so a draft had
nowhere to live but live), no measurement of article-to-booking clicks, and a
stale cannibalisation blocklist.

---

## 2. Research, and what it does and does not support

Searched 25 October 2026. Sources and dates are recorded on the articles that
use them; the full disagreement log for the permits topic is in the content
file next to the brief it blocks.

**Market prices for flying-dress sessions at Giza.** Listings ran roughly
$180 to $500 per person: a rooftop package at $500 including transport and
video; another operator from $450 for an hour with 20 edited photographs;
private sessions from $180 and $189; plain pyramid photo sessions with no
flying dress from about $85. These are **marketplace listings read on one
day**, several showing a discount against a higher figure. They are not a
price list and nobody is bound to them.

**Our position:** $179 / $199 / $349 / $399. Bottom of the flying-dress
bracket, above the plain photo tours.

**Permits and tripods at Giza.** Four guides, four incompatible answers: no
permit needed for professional work; ministry authorisation needed two to four
weeks ahead; a tripod fee of about 20 EGP per site per day; written
authorisation rather than a gate fee. **None is an official source.** This is
the reason the permits article is briefed and not published.

**The competing corpus is not Egyptian.** Almost everything written about
flying-dress photoshoots is about Santorini, Mykonos, Cancun or Miami. The
generic advice exists in volume; nobody writes it for limestone, desert wind,
a 45°C afternoon and the specific geography of Giza. That gap is the whole
editorial opportunity.

> No search volumes or keyword difficulty scores appear anywhere in this
> document. We have no tool connected that measures them, and inventing them
> is worse than not having them.

---

## 3. The 50 proposed topics, triaged

### Already covered by egypteyetravel.com — do not duplicate

Brief numbers **1, 2, 11, 12, 14, 15, 16, 19, 20, 21, 22, 23, 24, 26, 41, 42**
and most of cluster E's Giza logistics. The pillar and the Giza article own
these. If they need improving, improve them *there*.

### Already covered by this site's existing six articles — merge, do not add

| Brief topic | Covered by |
|---|---|
| 5, 9, 50 (what happens, how long, camera to gallery) | `inside-a-forty-five-minute-session` |
| 13, 17, 18 (Nine Pyramids, inside vs rooftop) | `a-pyramid-view-is-not-the-pyramid-complex` |
| 25, 28 (what to wear under, sizing) | `one-size-cut-to-fit` |
| 32 (surprise proposal) | `photographing-a-proposal-she-does-not-know-about` |
| 49 (how the photos are made) | `how-a-flying-dress-flies` |

### Approved and published in this batch

| # | Brief topics | Slug | Intent | Funnel | Destination |
|---|---|---|---|---|---|
| 1 | 3, 6, 10 | `what-a-flying-dress-photoshoot-costs` | commercial investigation: "how much" | bottom | `/packages` |
| 2 | 8, 31, 36, 37 | `two-people-in-the-frame` | planning: "can my partner be in it" | middle | `/celebrations` |

**Why #1 deserves to exist:** zero price coverage on either domain, the
highest-intent query in the topic, and we are one of very few operators that
will publish a figure at all. **Differentiation:** actual numbers, an honest
statement that we are not the cheapest, and a researched comparison with
sources.

**Why #2 deserves to exist:** every guide in the corpus assumes one person in
a dress. Nothing anywhere explains that the price is per person, what changes
in the choreography, or that an untrained partner throwing the train ruins the
frame. **Differentiation:** entirely first-party.

### Researched, briefed, deliberately not published

`who-owns-the-answer-about-photographing-giza` (brief topics 17, 18). The
research *is* the reason it is held: four sources contradict each other and
none is official. Writing it from those sources alone would produce a fifth
confident wrong answer. It needs three things from the owner, listed in the
content file beside the entry.

### Next batch, in priority order

1. **What is actually in the gallery, and when** (brief 50 partially). Delivery
   format, timings, what "colour-graded" means. First-party, high intent,
   uncovered. Blocked only on confirming delivery times.
2. **Hiring a dress without the shoot** (brief topics none; our own product).
   Supports `/rentals/dress-rental`, which currently has no editorial support
   at all and is the biggest untapped product per the earlier research.
3. **Accessories: what each piece is and where it sits** — now that the
   thirteen pieces are named and described, an article can do what the
   collection page cannot: explain how to choose a combination.
4. **The permits piece**, once the owner answers.

### Rejected outright

Brief topics **44, 45, 46, 47, 48** (getting to Giza, how long to spend, what
to bring, general travel photography). These are destination-guide topics with
no connection to what this business does, they are written far better
elsewhere, and publishing them would make this an Egypt blog with a dress
business attached.

---

## 4. Clusters and internal linking

Four clusters, unchanged: **The session**, **The dress**, **The place**, **The
occasion**. They are drawn around what a reader is worrying about rather than
by subject, which is why cluster match is the heaviest signal in the related
score.

**Three kinds of link, three different jobs:**

| Kind | Where | Chosen by |
|---|---|---|
| Contextual, in prose | mid-sentence, where the reader wants it | the writer, as `[text](/path)` |
| The next step | once, after the article ends | `destination`, one per article |
| The reading list | below the next step | `relatedStories()`, scored |

**The scoring:** +3 editor named it, +2 same cluster, +1 same commercial
destination, +1 the pair already links one way. Ties break on date, newest
first. Articles scoring zero do not appear, which is correct: no rail is
better than a bad one.

**Inbound links** are declared on the article (`inboundFrom`) and asked for by
the page (`<StoriesFromHere>`). One place to look, and the check fails if a
page named in `inboundFrom` does not actually render the component — which it
caught three times on the first pass.

---

## 5. Measurement

One event: `story_cta_click`, carrying the article slug and the destination
path. That answers the only question worth asking of an editorial section —
which articles send people to something they can book — and it collects
nothing else. No scroll depth, no session recording, no text anybody typed.

Page views already flow through `trackPageView`, keyed on the **published**
path rather than the internal one, so GA4 rows join to Search Console rows
without a manual rewrite.

**Not yet connected:** Google Search Console. It needs the owner to verify the
property; nothing in the code blocks it.

---

## 6. The publishing workflow

Status lives on the article: `idea → researched → draft → reviewed →
published`, plus `needs-update` for a live article that has gone stale.
Only `published` and `needs-update` get a URL, a sitemap entry or a card on
the index. A draft is invisible to everyone but the team.

**Per article:**

1. Check it is not already covered — **including on egypteyetravel.com**, which
   the check enforces on slugs and a human must enforce on substance.
2. Research it; record each source with the date and *what it does not
   support*.
3. Draft it with `status: "researched"` or `"draft"`. It will not publish.
4. Verify every figure against `content/flyingDresses.ts`. The check does this
   too, but after the fact.
5. Give it a `destination` and at least one `inboundFrom`.
6. Place contextual links where a sentence earns them, not at a quota.
7. `npm run check`, then look at the page in a browser.
8. Set `status: "published"`.

**Cadence:** one article a fortnight is sustainable and is more than the
library needs right now. Eight live articles covering four clusters is a
defensible section; twenty interchangeable ones would be worse than six.

**Refresh:** mark `needs-update` rather than unpublishing. A stale article
beats a 404 and keeps whatever position it has earned.

---

## 7. SEO and AI-search checklist

### Done and verified

- Crawlable and indexable; `robots.txt` allows all user agents, which includes
  OAI-SearchBot, PerplexityBot and Google-Extended. No CDN or firewall rule
  blocks them.
- Every published article in the XML sitemap; drafts excluded by construction.
- Canonical URLs on every page, via `fdMetadata`.
- `Article` + `BreadcrumbList` + `FAQPage` JSON-LD on every article, verified
  rendering in a browser. Author and publisher are the **Organization** — no
  invented human byline.
- `citation` in the Article schema, populated from real sources.
- Breadcrumbs visible on the page, matching the structured data.
- Titles budgeted against the 60-character result line, with the brand suffix
  measured rather than assumed. Meta descriptions bounded 110–160.
- Clean, readable, stable URLs. No duplicate slugs or titles.
- Social sharing metadata.
- Direct answer near the top of each article; headings that are real questions;
  a contents list on articles with five or more sections.
- Sources shown on the page, with what each one does *not* establish.
- Internal links verified against a derived route registry — a link to a route
  that does not exist fails the build check.
- Article-to-booking clicks measured.

### Not done, and honestly not

- **Google Search Console is not connected.** Needs owner verification.
- **No images in articles.** The template has no figure support yet and the
  brand's photography is not catalogued per article. This is the largest
  remaining gap and the next structural piece of work.
- **No Core Web Vitals measurement.** Nothing has been profiled.
- **Rankings, impressions and AI citations are unmeasured**, and will stay
  unmeasured until Search Console is connected. Nobody should promise any of
  them.

### Verified on the live domain, with one limit

Checks against `egypteyetravel.com` were made directly. **This container's
network policy blocks `flyingdressesegypt.com`**, so the Flying Dresses pages
were verified locally and on the Egypt Eye review copy rather than on the
production domain. Worth re-checking from a normal browser after deploy.

---

## 8. What needs the owner

1. **The three permits questions** beside the briefed article. Until they are
   answered that article stays unpublished.
2. **Group pricing.** `two-people-in-the-frame` says "ask" because no figure
   exists. A published number would convert better.
3. **Accessory and men's-attire prices.** Same, and now more visible: the
   enquiry form gates both behind a deliberate choice, so people reach them
   already wanting a quote.
4. **Search Console verification** for flyingdressesegypt.com.
5. **Confirm the gallery delivery timings** so the next article can be written.
6. **A decision on the two brands' public relationship.** Right now no story
   links to egypteyetravel.com, per the separation instruction, which costs
   some authority. Worth revisiting deliberately rather than by drift.
