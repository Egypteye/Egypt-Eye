# Stories: what was researched, what was found, what could not be established

Written 19 October 2026, alongside the first six articles in
`src/content/flyingDressStories.ts`.

The brief for this work said, in terms: do not fabricate search volumes,
rankings, keyword difficulty, customer questions or competitor findings; label
estimates; record the sources and dates. This file is that record, including
the parts where the honest answer is "this could not be established here".

---

## 1. What could NOT be researched from this environment

**No keyword volume, difficulty or ranking data.** This container has no
access to Search Console, Ads Keyword Planner, Ahrefs, Semrush or any
equivalent. Nothing in this project states a monthly search volume, a
difficulty score or a current ranking position, because there is no way to
obtain one here and a plausible-looking number is worse than none: it gets
quoted back in a meeting six months later as though it had been measured.

What that rules out: a prioritised keyword roadmap with volumes attached. What
it does not rule out: everything below, which is observable.

**The one data source the business actually owns is not connected yet.**
Search Console verification for `flyingdressesegypt.com` was set up in this
same session, using the TXT record the owner supplied. It has no history. In
roughly four weeks it will begin answering the questions this section cannot
answer now, from this site's own impressions rather than from a third-party
estimate. That is the first real input to a second content batch, and it is
worth waiting for rather than guessing ahead of.

---

## 2. The competitive landscape, as observed

Searched 19 October 2026 for the commercial terms this brand would compete on.
The finding is consistent enough to act on.

**Almost every competitor is a marketplace listing, not a website.** The
results for "flying dress photoshoot Giza" and its variants are dominated by
Expedia activity pages, Airbnb service listings and AAA Trip Canvas entries.
Among those seen:

| Source | What it lists | Price shown |
|---|---|---|
| [Airbnb service 6160881](https://www.airbnb.com/services/6160881) | Rooftop session with pyramid views, dress from the host's collection, 1 hour, up to 3 guests | $179 per guest |
| [Expedia: Giza pyramids tour with flying dress](https://www.expedia.com/things-to-do/giza-pyramids-tour-with-flying-dress-photoshoot-experience.a49826337.activity-details) | Guided tour bundled with a rooftop shoot | $200 per adult |
| [Expedia: 4 hours private photoshoot in Giza](https://www.expedia.com/things-to-do/4-hours-private-photoshoot-in-giza-with-flying-dress.a46632760.activity-details) | Private shoot, photographer and dress assistant | $180 per adult |
| [AAA: Epic Flying Dresses in Egypt](https://ww1.aaa.com/tripcanvas/thing-to-do/epic-flying-dresses-in-egypt-4-hours-private-photoshoot-in-giza-451388P2) | 4-hour private shoot, transport, one dress, "25+ colour-enhanced photos" | from $125 |

Three things follow, and all three are already acted on in the repository.

1. **Nobody in this niche is competing on content.** There is no editorial
   presence from any operator in these results. The only substantial writing
   on the subject belongs to the owner, on `egypteyetravel.com`. That is why a
   stories section is worth building at all, and why six articles is a
   reasonable opening rather than a token.

2. **The inclusions are the commercial advantage, and they are legible in the
   same result list.** A competitor at the same price point lists "25+"
   photographs; this brand's three photoshoots include more than a hundred
   colour-graded frames. That comparison was already recorded in
   `src/content/flyingDresses.ts` and the research here confirms it still
   holds.

3. **The marketplace copy is systematically vague about location.** One
   listing's meeting point is in Maadi and its description also mentions
   Greece, which reads as copied text. Several do not distinguish a private
   rooftop from the archaeological site at all. That vagueness is the gap the
   article `a-pyramid-view-is-not-the-pyramid-complex` exists to fill, and it
   is the one topic where being straightforward is itself the differentiator.

**Not claimed:** that these are all the competitors, that these prices are
current, that any of them ranks in a particular position, or that this
represents demand. It is a snapshot of one day's results.

---

## 3. Facts checked for the articles, and the ones that failed the check

This is the part worth reading before writing a second batch.

### Giza tickets, hours and tripod fees: UNUSABLE

Four independent attempts to establish the Giza general admission price, the
complex's opening hours and the tripod fee produced figures that disagree with
each other badly.

| Detail | What sources said |
|---|---|
| General admission, foreign adult | roughly EGP 200 in one source, EGP 700 in another |
| Winter opening | 8am with last entry 4pm in one source; 7am in another |
| Tripod | EGP 20 in two sources, around EGP 25 in a third, "a separate permit and fee" in a fourth |

Sources consulted, all read 19 October 2026:
[Third Eye Traveller](https://thirdeyetraveller.com/guide-photography-in-egypt-spots-prices-tips/),
[Egypt Tours Portal](https://www.egypttoursportal.com/en-gb/blog/tips-for-visiting-the-pyramids-of-giza/),
[Strikolith blog](https://belgie.strikolith.com/blog/giza-pyramid-tickets-prices-tours-and-how-to-buy-1764799188/).

**Decision: no article states any of these numbers.** The spread is too wide
to pick from, none of the sources is the antiquities authority, and these are
figures a customer discovers at a ticket window rather than on a screen. The
rooftop article instead says who owns the answer, shows the spread, and points
the reader at the official channel. That is a worse article for a snippet and
a better one for the person reading it.

The one sentence the research does support without qualification is the one
that is ours: the rooftop session needs no complex ticket, because it does not
enter the complex.

### Cairo weather and the best months: NOT USED, and deliberately

Sources agree on the pattern (hot summer, comfortable winter and spring) and
disagree on the numbers, with summer highs given as 35°C by
[WeatherSpark](https://weatherspark.com/y/96939/Average-Weather-in-Cairo-Egypt-Year-Round)
and around 40°C by others, read 19 October 2026.

This was not written up, for a different reason: **the owner already publishes
`best-time-flying-dress-photoshoot` on `egypteyetravel.com`.** Writing it again
here would be the cannibalisation this whole section was shaped to avoid. See
§4.

### Fayoum and Wadi El Rayan entry fees: NOT ESTABLISHED

Searched, and the results were tour listings that bundle admission into a
package price without showing it. No standalone fee and no independent-access
rules could be confirmed. Nothing in the articles states either.

What is stated about Fayoum comes entirely from the brand's own data: about
three hours from central Cairo each way, which is already in
`src/content/flyingDresses.ts` and is the reason that package is priced where
it is.

---

## 4. The cannibalisation finding, which changed the plan

The proposed topic list for this work ran to fifty titles. Before any of them
was written, the repository was searched for existing coverage. **The owner's
other site already publishes seven articles on flying-dress photoshoots**, in
`src/content/stories.ts` and `src/content/storyBatches/`:

| Slug | Size |
|---|---|
| `flying-dress-photoshoot-egypt-guide` | 21,005 body characters |
| `flying-dress-photoshoot-pyramids-giza` | 9,390 |
| `best-flying-dress-photoshoot-locations-egypt` | 9,846 |
| `what-to-wear-flying-dress-photoshoot` | 9,212 |
| `best-time-flying-dress-photoshoot` | 7,822 |
| `egypt-eye-travel-photography-experiences` | — |
| `abby-zoobi-midnight-flying-dress-booking` | — |

**Five of the fifty proposed topics already exist, on the other domain.** Among
them the three most obvious opening articles: what to wear, best locations,
best time.

`egypteyetravel.com` has years of history and two hundred and twelve published
stories. `flyingdressesegypt.com` had its DNS pointed this month. Publishing
the same topics on both would not add a reader; it would split one business's
own signal across two hosts and hand the weaker one a page that cannot win.

So every article in the first batch is first-party operating knowledge that the
travel site has no claim on: what the assistant does, what the wind does, what
a colour does against limestone, what the forty-five minutes consists of, what
a rooftop with a pyramid view is and is not, and what "cut to fit all sizes"
means when you put it on. None of it is destination writing.

`scripts/check-flying-dresses.mts` enforces this. It reads the travel site's
whole story corpus and fails on any slug that appears on both domains, in
either direction. That guard found a real mistake on its first run: the
seven-article list above was initially checked against `stories.ts` alone, and
`abby-zoobi-midnight-flying-dress-booking` lives in
`src/content/storyBatches/batch16.ts`, so a guard reading half the data
reported a slug as missing that was there all along.

### The open question for the owner

The two sites do not link to each other, and nothing here changed that. The
obvious optimisation is to link these articles to the travel site's pillar
guide and collect the topical association; it was not taken, because the
instruction is to keep the Flying Dresses website separate from the live Egypt
Eye Travel website, and interlinking two domains is the opposite of separating
them.

That is a brand decision, not a technical one, and it is worth a deliberate
answer. There are three coherent positions:

1. **Keep them separate, as now.** The travel site keeps the destination
   writing and the ranking it has; Flying Dresses keeps the first-party
   operational writing. Nothing links. Cost: some lost authority on both
   sides. This is the current state and it needs no decision to continue.
2. **Separate brands, linked in public.** A small number of honest links in
   both directions, acknowledging the same business runs both. Cost: the two
   sites are publicly associated, which may or may not be wanted.
3. **Migrate the seven articles to `flyingdressesegypt.com` with 301
   redirects.** Not recommended, and worth saying why plainly: it moves
   established pages from a domain with history to one with none, and 301s
   preserve most but never all of what a page has earned. This is the only
   option on the list that can lose something that currently works.

Nothing will be done about this without an instruction.

---

## 5. What this section cannot promise

No first-page ranking, no AI citation, no guaranteed indexing. Six articles on
a one-month-old domain in a niche where every competitor is a marketplace
listing is a reasonable position and not a result. The measurable things,
which can be checked in four to six weeks in Search Console:

- whether these URLs are indexed at all
- which queries bring impressions, as opposed to which were expected to
- whether any of them produces a message through `/enquire`

The third is the only one that matters, and it is the only one that requires no
estimate from anybody.
