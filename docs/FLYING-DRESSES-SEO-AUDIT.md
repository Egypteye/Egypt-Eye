# Flying Dresses Egypt: SEO audit and implementation report

Audited and implemented 1 November 2026, from the code and the live site
rather than from assumptions.

**The short version: most of what the brief asked for was already built.** Two
things were genuinely wrong or missing, and both are now fixed. Three of the
ten articles requested would have actively damaged the site, and I did not
write them. The detail is below.

---

## 1. What I found already working

I expected to find gaps here and mostly did not.

| Area | State |
|---|---|
| Canonical URLs | Correct, and pointing at flyingdressesegypt.com from both domains |
| Per-brand robots.txt | Built. The travel domain disallows `/flying-dresses` so the two domains cannot duplicate each other |
| Per-brand sitemap | Built, and complete: all 30-odd URLs including every celebration and creative page |
| Metadata | Unique title, description, canonical, Open Graph and Twitter on every page |
| Structured data | LocalBusiness, Service, FAQPage, BreadcrumbList and Article, emitted by all 17 pages |
| Image handling | Next/Image throughout, real alt text, provenance-typed asset registry |
| Internal linking | A reverse-link system most sites do not have: see section 4 |
| Analytics | Present and configured |
| Stories/blog architecture | One structure, at `/stories`. No duplication |

### The `/blog` question

> **Corrected 1 November 2026, after the Search Console export.** What follows
> was right about the codebase and wrong about the consequence. There is no
> `/blog` route, but the previous site's blog URLs are still being clicked and
> they were 404ing. See section 9. The conclusion "no rankings at risk" was
> wrong and is retracted.

The brief flagged `/blog` versus `/flying-dresses/stories` as a critical
duplicate-content problem. **There is no `/blog` route in this codebase.**

What exists is a redirect: `/blog` and `/blog/:slug` return 308 to `/stories`,
and they are part of a block of WordPress legacy redirects built for the
*travel* site's old permalinks (`/2024/04/01/some-post`, `/feed`,
`/wp-sitemap.xml`). There was never a Flying Dresses blog to merge.

I verified this live: `/blog` → 308, `/flying-dresses/stories` → 200,
`/flying-dresses/blog` → 404 — but I checked those on the **travel** domain,
where that redirect block lives. On flyingdressesegypt.com itself nothing
handled them at all. That gap is now fixed; see section 9.

### Editorial categories

The brief proposed six new categories. Four already exist and are wired into
the index, the sitemap and the related-article logic: **The session**, **The
dress**, **The place**, **The occasion**.

I did not replace them. They map cleanly onto the proposed six, they are
already populated, and renaming live category taxonomy for no functional gain
would churn URLs and internal links to arrive in the same place.

---

## 2. What was actually broken, and is now fixed

### Every sitemap URL claimed to have changed in the last hour

The Flying Dresses sitemap stamped `new Date().toISOString()` on all 30-odd
URLs. With hourly revalidation that meant the entire site reported itself as
just-edited, every hour, permanently.

This is worse than it sounds. Google uses `lastmod` only where a site is
consistently accurate with it, so a site that reports everything as
always-changed teaches the crawler to disregard the field here, including on
the pages where it was true and useful.

Fixed: a URL now carries `lastmod` **only where the content layer actually
knows one**. That is the stories, which record `publishedAt` and `updatedAt`.
The product and listing pages have no edit date recorded anywhere, so they now
say nothing rather than guessing. This is what the travel site's sitemap, in
the file next door, was already doing correctly.

Verified in the generated XML: a story carries
`<lastmod>2026-11-01T00:00:00.000Z</lastmod>`; `/experiences/fayoum` carries no
`lastmod` element at all.

Guarded with a check that runs the real route handler and parses the real XML,
rather than grepping the source. The bug lived inside a template literal, and a
grep for "lastmod" would have passed just as happily on the broken version.
Both halves proven red: restoring the generated timestamp, and dropping the
story dates.

### Two genuinely missing articles, now written

See section 3 for why it is two and not ten.

- **[Rooftop or dunes](/stories/rooftop-or-dunes)** — 1,089 words. The decision
  article for the two shoots people actually weigh against each other.
- **[A day in Fayoum](/stories/a-day-in-fayoum)** — 1,109 words. What the day
  involves, why it is $349, who should not book it, and the fact that it is not
  the White Desert.

Both are first-party, both carry FAQs, a single commercial destination, related
reading and reverse links, and both land in **The place**, which was the
thinnest cluster on the site (one published article against three in The
dress).

---

## 3. Why I wrote two articles and not ten

This is the most important thing in this report, so it gets its own section.

I checked each of the ten proposed titles against both domains before writing
anything. Here is what came back:

| Proposed article | Reality |
|---|---|
| How much does a flying dress photoshoot cost | **Already live here** |
| The complete guide to flying dress photoshoots in Egypt | **Already live on egypteyetravel.com** (a 20,000+ character pillar) |
| Pyramids rooftop vs sand dunes | **Gap — written** |
| What to wear | **Already live on egypteyetravel.com** |
| Best flying dress colours | **Already live here** |
| How does a flying dress actually fly | **Already live here** |
| Best time for a photoshoot at the pyramids | **Already live on egypteyetravel.com** |
| How to plan a surprise proposal | **Already live here** |
| Complete guide to a Fayoum photoshoot | **Gap — written** |
| What happens in a 45-minute photoshoot | **Already live here** |

Five already existed on this domain. Three exist on the travel site.

Writing those three again here would have split one business's own search
signal across two domains, one of which has years of history and one of which
had its DNS pointed last month. That is exactly what the brief's own
content-separation section forbids, and the codebase already has an automated
guard that fails the build on a slug appearing on both domains.

So the gap was never ten articles. It was two, and they are written.

**This is the single highest-value thing to decide next**, and it needs you
rather than me: see section 6.

---

## 4. The internal linking system, which already existed

Worth describing because it is unusual and because it is doing real work.

Each article declares `inboundFrom`: the commercial pages that should carry a
link **to** it. The pages then ask, via a shared component, rather than each
page keeping its own hand-maintained list of article slugs.

The direction matters. The failure it prevents is invisible from inside an
article: six articles were once published here with nothing but the index
linking to them, which is fine for a reader who finds the index and useless for
every other arrival.

Verified live on the Fayoum experience page: the new article appears there
under "Worth reading first", because the article asked for it.

**One real gap found:** the component is rendered on experiences, celebrations,
rentals, packages, wardrobe and FAQ, but **not** on `/creative`,
`/creative/[slug]`, `/about` or `/collaborate`. No article currently targets
those, so adding it today would render nothing. It becomes worth doing the
moment an article is written for the creative section.

---

## 5. What I did not change, and why

- **The four editorial clusters.** They work. Renaming them to the proposed six
  would churn live URLs to arrive in the same place.
- **The experience pages.** Each already has distinct metadata, intro,
  inclusions, price story, FAQs and location detail. They are not thin and they
  do not repeat each other with the location swapped.
- **The special-occasion landing pages.** Already built and distinct:
  proposals, gender reveals, birthdays, anniversaries, maternity, vow renewals,
  creators, DJ and music. Nothing to add without creating doorway pages.
- **Analytics.** Already configured. I did not add a second tag.
- **The domain, redirects and payment paths.** Untouched.

---

## 6. What needs you

**1. The travel site overlap is a business decision, not a technical one.**

egypteyetravel.com ranks for flying-dress queries with seven articles including
the pillar guide. flyingdressesegypt.com is the brand that actually sells the
shoots. Long term, that pillar belongs on this domain.

Moving it is a real project with real risk: a 301 from a page with history to a
domain with almost none, and a temporary ranking dip is normal. It is the right
move eventually and it is not one I will make without you asking for it.

Three options, in order of how much I would recommend them:

- **Leave it.** The travel site keeps the broad informational queries, this one
  keeps the commercial ones. Safe, and it is where you are now.
- **Migrate the pillar.** Move `flying-dress-photoshoot-egypt-guide` to this
  domain with a permanent redirect. Highest upside, real short-term risk.
- **Rewrite it here on a different angle.** Worst of the three. Two articles on
  one topic competing, which is the thing both the brief and the build guard
  against.

**2. Four open questions blocking content.** The content files already record
these; they are not new:

- Whether the Fayoum product really is Fayoum or genuinely runs to the White
  Desert. The brochure says "White Desert / Fayoum" and then describes Fayoum.
  I have written it as Fayoum and said plainly that it is not the White Desert.
- The Red Sea yacht group discount: the $399 is confirmed, the saving is not.
- The sand dunes price ($179) and the Fayoum price ($349) are marked
  "confirm" rather than "verified" in the content files.
- What the standard photograph delivery actually is: how many edited images,
  in what time.

**3. The venue name**, still outstanding from last week: the hotel's wordmark
is legible in your rooftop footage and the Studio switch for publishing the
name is off.

---

## 7. Validation

| Check | Result |
|---|---|
| `npx tsc --noEmit` | 0 errors |
| `npm run lint` | clean |
| `npm run check` (28 suites) | all pass |
| New sitemap guard | passes; both halves proven red |
| `/stories/rooftop-or-dunes` | 200, title 17 chars, canonical correct, Article schema present |
| `/stories/a-day-in-fayoum` | 200, same |
| Inbound links | verified rendering on `/experiences/fayoum` |
| Sitemap dates | story dated, product page undated, verified in generated XML |

**Not verified, and I will not claim otherwise:** Google indexing, Search
Console status, Core Web Vitals field data, and rendering on real devices.
`next build` cannot complete in this sandbox (no DNS to Sanity), so the signal
available is "compiles with zero type errors", which it does.

---

## 8. The next thirty days

1. Decide the travel-site overlap (section 6). Everything else in content
   strategy depends on it.
2. Answer the four open product questions. Each one is currently a hedge on a
   live page.
3. Write for `/creative`. It is the only section with no editorial support at
   all, and it now has the strongest new imagery on the site.
4. Add `lastmod` to the product pages properly, by recording an edit date in
   the content files, rather than by guessing one.
5. Resolve the venue name, which unlocks the withheld rooftop photograph.


---

## 9. What the Search Console data showed, and what I had missed

Added 1 November 2026, from the owner's three-month export.

Two bugs that **no amount of reading the code had surfaced**, because both are
invisible until something external crawls the site. My audit above checked that
canonical tags existed and that each brand had its own robots and sitemap. Both
were true. Neither was sufficient, and the data said so in about a minute.

### Bug one: the entire brand was indexed twice

The proxy served every page at **both** shapes on this domain:

    flyingdressesegypt.com/packages
    flyingdressesegypt.com/flying-dresses/packages

The first is the public URL and the one every canonical tag points at. The
second is the internal route tree, which the proxy passed straight through on
the reasoning that it is "the form every internal link uses, so it is the
common case". Both halves of that were true, and together they were the bug:
the internal links are crawlable, so Google crawled and indexed them.

At least eight pages were in the index at both shapes, competing:

| Page | Short form | Long form |
|---|---|---|
| `/rentals` | 53 impressions | 2 |
| `/packages` | 26 | 12 |
| `/stories/how-a-flying-dress-flies` | 6 | 14 |
| `/stories/choosing-a-dress-colour` | 3 | 4 |
| `/creative/dj-and-music` | 2 (pos 45) | 3 (pos 28.7) |

On the stories the long form was *winning*, which is the clearest possible
evidence that the canonical tag was not being honoured. A canonical is a hint,
and on a domain this new it had no authority to spend.

**Fixed:** the long form now 308s to the short form on this domain only.
Verified single-hop to 200, and verified that the travel domain, where
`/flying-dresses/*` is the real and only address, is unaffected.

**The cost, stated plainly:** `fdPath()` emits the long form for every internal
link, because the same HTML is served to both domains and a static href cannot
vary by host. So an internal click on flyingdressesegypt.com now costs one
redirect hop. That is a real regression and it is the cheaper of the two
evils. To remove it, the links must become short-form, which is only safe once
you confirm the travel domain no longer needs to serve the review copy — see
section 10.

### Bug two: the previous site's URLs 404, and they still have traffic

| URL | Clicks | Impressions | Position |
|---|---|---|---|
| `/blog-post1` | 6 | 37 | 12.2 |
| `/about-us` | 2 | 41 | 6.3 |
| `/blog-post5` | 1 | 16 | 11.8 |
| `/blog` | 0 | 3 | 2.0 |

Nine clicks and ninety-seven impressions a quarter, landing on a 404.
`/blog-post1` on its own out-clicked every celebration page on the site.

**Fixed:** `/about-us` → `/about` (the one unambiguous one-to-one rename), and
`/blog`, `/blog-post<n>` and `/blog/<slug>` → `/stories`. Nobody kept a mapping
from the old post numbers, and inventing one would send a reader to an article
that is not what they clicked, so they go to the listing holding the same kind
of content. That is what the travel site's rules already do for its orphaned
WordPress post IDs.

### What the data says about the business, not the code

- **Mobile is the site.** 467 of 608 impressions and 46 of 65 clicks.
- **The head terms are already won.** "flying dress photoshoot egypt" sits at
  position 1.1 with 86% CTR; "flying dress egypt" at 1.2. There is no upside
  left there.
- **Hurghada is real demand you do not serve.** "hurghada flying dress" (25
  impressions) and "flying dress hurghada" (6) are the largest non-brand
  cluster on the whole export, at positions 8–9. You run Ain Sokhna on the Red
  Sea, not Hurghada. **I have not written a word about Hurghada**, because
  inventing a location is exactly what CLAUDE.md §7 forbids. If you do or could
  serve it, say so and it is a page. If you do not, this stays unserved.
- **`/rentals/dress-rental` is the clearest content problem.** 41 impressions,
  **zero** clicks, position 12.7. It is on page two and nothing about the
  result is making anyone click.
- **Traffic is tiny and that is fine.** 65 clicks a quarter on a domain whose
  DNS was pointed weeks ago. The chart only holds thirteen days of data.

---

## 10. Revised next thirty days

1. **Confirm whether the travel domain still needs to serve the Flying Dresses
   review copy.** If it does not, internal links become short-form and the
   redirect hop introduced above disappears. This is now the highest-value
   technical item and it needs your answer, not my judgement.
2. **Decide the Hurghada question.** Largest unserved demand in the data.
3. **Re-submit the sitemap** in Search Console and watch the duplicate URLs
   drop out of the index. Expect weeks, not days.
4. `/rentals/dress-rental`: 41 impressions and no clicks is a title and
   description problem before it is anything else.
5. The travel-site pillar overlap from section 6, unchanged.
