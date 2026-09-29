# Reviews & Customer Stories

How Egypt Eye's reviews work, and the rules the system enforces so they stay
defensible.

## The chain this is built to produce

> real customer → real experience → real review → **real source** → relevant
> Egypt Eye experience → book

The fourth link is the one most travel sites skip, and it is the one that makes
the rest believable. Every review on this site either was collected by Egypt Eye
directly, or names the platform it was written on and links to the original. A
visitor can always go and check.

---

## The two things you can publish

Egypt Eye deliberately does **not** show platform ratings badges — no "4.9 from
312 reviews on Tripadvisor" summary cards, and no coloured platform pill on
review cards. Attribution is carried as a plain text link on each third-party
review instead. That is a house style decision, not a technical limit; the
attribution itself is not optional, for the reasons below.

### 1. Reviews collected directly — the real asset

A review a traveller gave Egypt Eye over WhatsApp or email is Egypt Eye's own
content. It can be published in full, it can carry the traveller's photos with
their permission, and it is **the only kind that can ever appear in search
engine rating markup**.

If a traveller has already reviewed you on Tripadvisor, asking them to send the
same words directly is the single highest-value thing you can do here. It turns
a quoted excerpt into content you own outright.

### 2. Reviews from another platform — quoted, attributed, linked

Set `Source` to the platform and paste the review **exactly as written**, with a
`Url` to the original. The site then:

- shows an **excerpt** (capped at 450 characters) rather than the full text,
  with "Read the full review on Tripadvisor" beside it;
- names the platform and links to the original on every card;
- **drops any photos** attached to it;
- **excludes it from `AggregateRating` structured data.**

All four are enforced in `src/lib/reviewPolicy.ts`, not left to whoever edits
next, and asserted by `npm run check:reviews`.

---

## Why those restrictions exist

**Copyright.** The text of a Tripadvisor or Airbnb review is that platform's
content. They license republication through an official widget or their Content
API to approved partners — not by pasting. A short attributed excerpt with a
link back is the defensible pattern; copying review bodies wholesale is not.
If Egypt Eye wants full reviews displayed, the clean routes are the Tripadvisor
widget, Content API partnership, or asking travellers to re-send their words
directly.

**Google.** The review snippet documentation says, in as many words: *"Don't
aggregate reviews or ratings from other websites."* Separately, reviews a
business publishes about itself are not eligible for star snippets at all. So
marking up imported reviews buys nothing and breaches policy. `Rating` carries
an `includesThirdParty` flag, and `content/seo.ts` refuses to emit
`aggregateRating` when it is set.

**FTC Consumer Review Rule.** In force since 2024, first enforcement letters
December 2025, penalties per violation. It turns on authenticity and
completeness: never attribute words to someone who did not write them, never
edit a review's meaning, and don't curate a wall of praise that misrepresents
the whole. This is why nothing in the pipeline rewrites a review, why the source
link is mandatory, and why `Featured` should be used for reviews that are
*useful and specific*, not only for the most glowing.

None of this is legal advice, and it is the conservative reading.

---

## How a review reaches the right page

Two signals, combined in `src/lib/reviewThemes.ts`:

1. **Product attribution** (`reviewAttribution.ts`) — a review whose `Context`
   names a product exactly, or whose product reference is set in Studio, is
   evidence about that product and outranks everything else.
2. **Themes** — what the traveller actually mentioned, read from their own
   words: photography, flying dress, guides, pickups, communication, proposals,
   celebrations, families, couples, solo, desert, the Nile, diving, planning,
   value. Matching is word-boundary anchored, never substring.

Then **specificity** breaks ties: length, how many different things the review
touches, and whether it names a team member. This is what puts *"the
photographer kept showing us the back of the camera"* above *"great
experience"* on a photoshoot page.

Tagging only ever classifies. It never changes a word of a review.

A page with nothing relevant **shows no review section at all.** An empty
section is better than a padded one — a review that does not speak to the
product is not evidence about it, and showing it anyway is exactly how a site
starts looking like it is manufacturing testimonials.

### Where reviews appear

| Surface | What it shows |
|---|---|
| Homepage | Featured reviews marquee, once reviews exist |
| `/testimonials` | The hub: totals, what travellers mention, and each product's three best reviews |
| `/testimonials/<type>/<slug>` | Every review of one product, 48 to a page |
| `/testimonials/<type>/<slug>/page/<n>` | Pages two and up |
| Tour pages | Reviews of that tour, or themed on guides / planning / pickups |
| Photoshoot pages | Reviews of that shoot, or themed on photography / flying dress / occasions |
| Experience pages | Reviews of that experience, or themed on guides / planning |
| Product cards | The star chip, linking to that product's review page |

### Why the reviews are split across pages

They used to be one wall: every review in one document, with filters narrowing
what was visible. At a few dozen that was right — everything was one Ctrl+F
away. At 2,527 it stopped being. The live page measured **6.3 MB**, and only
**717 KB** of that was review text. The rest was card markup, carried twice:
an App Router page embeds the flight payload for its tree alongside the HTML,
so whatever it renders it also ships as serialised React. That doubling is
inherent — it is ~60% of the new pages too — so the only lever is how much a
page renders.

Measured on a production build of the real 2,527:

| | HTML | embedded flight | total |
|---|---|---|---|
| Old single wall | 4,048 KB | 2,247 KB | **6,295 KB** |
| New hub | 61 KB | 90 KB | **150 KB** |
| A product page (48 reviews) | 96 KB | 144 KB | **240 KB** |

So `src/lib/reviewPages.ts` now decides the layout, and the rules are:

- **Page one is the bare product path**, never `/page/1`. `parseReviewPage`
  rejects `1`, `01`, `2.0` and anything non-numeric, so one page of reviews
  never has two URLs.
- **48 a page** — divides evenly into 2, 3 and 4 columns, and at the observed
  median review length keeps a page near 150 KB.
- **Ordered by what a review says, not when it was written.** 43% of the
  imported reviews are under 200 characters; date order puts those above a
  paragraph describing the day. Nothing is hidden by this — every review is
  still on some page — it only decides which page.
- **A product with no reviews gets no page.** An address promising reviews of
  something nobody has reviewed is worse than no address.
- **Everything renders on the server.** No filter state on the product pages,
  so nothing hydrates and nothing is sent twice.

`check:reviews` asserts the paging is a partition — every review on exactly
one page, no page over the limit — at several sizes either side of a page
boundary, because an off-by-one there drops a traveller's review off the site
silently.

**Old deep links still work.** Before the split, a star chip pointed at
`/testimonials#reviews-tour-1-day-giza-tour`. A fragment never reaches the
server, so no redirect rule in `next.config.ts` can catch one — instead
`LegacyReviewHashRedirect` on the hub reads the hash in the browser and
forwards it to the product page. Anchors with no page behind them are left
alone and the visitor stays on the hub.

**The sitemap lists page one only.** Pages 2+ are ordinary linked pages with
self-referencing canonicals — crawlable and indexable, just not submitted. On
a site already short of crawl budget, asking Google to fetch nineteen more
pages of one tour's reviews spends it at the least useful end.

---

## Reviews travellers write on the site

At the foot of `/testimonials` there is a form: name, email, which trip,
a rating out of five, and the review itself. The dropdown lists every tour,
shoot and service in the catalogue, not only the ones that already have
reviews.

**It emails you. It publishes nothing.** `POST /api/review-submission`
resolves the product from the catalogue (never from the form, so a crafted
request can't put an invented tour name in front of you), renders the review
into an email and sends it to Site Settings → Contact → Email via Resend,
with the traveller's address as reply-to. Nothing is written to Sanity or to
Supabase, and nothing appears on the wall.

That is deliberate. The page tells readers every review comes from a real
Egypt Eye trip; an open form that published itself would make that untrue the
first time someone filled it in. So a submitted review becomes a normal
review only when you have checked it against a real booking and added it in
Studio — **as written**, under the same rules as the rest of this document.
The traveller is told the same thing on the page: their review is under
review, and when it appears it will be exactly as they wrote it.

Practicalities: five submissions per IP per hour, a honeypot field, a
thirty-character minimum, and a failed send leaves the form filled in so a
long review is never lost to a dropped request. If `RESEND_API_KEY` is
missing the endpoint returns 502 and the traveller is asked to try again —
so check that it is set before pointing anyone at the form.

## Importing

**Studio → Bulk Add Reviews.** Two formats, detected automatically.

**A CSV export** with a header row — columns matched by name (Name, Quote,
Context, Source, Url, Date, Score; common synonyms like Reviewer/Review/Rating
also work). Quoted fields, embedded commas and hard newlines inside a review
are handled properly, because a review body is not one line.

Platform exports are messy in three predictable ways, all handled:

- Cells reading `Not provided`, `N/A`, `-` or blank are treated as **missing**,
  not imported as literal text.
- Dates like `August 2026` or `3 weeks ago` are normalised to the **first of
  the month they were written in**. Platforms give month precision at best, the
  site displays month and year only, and storing a day nobody recorded would be
  inventing it. Anything unreadable is left blank rather than guessed.
- A **leading apostrophe** on a name is Excel's text escape, and is stripped.
  Nothing else about a name or a quote is ever changed.

Exports almost never carry a per-review link, and the importer won't accept a
third-party review without one. Use the **fallback link** field: paste the
listing page the reviews were left on and it covers every row that has none. A
reader still lands where the review can be read.

**Or typed blocks** separated by `---`:

```
Name: Sarah M.
Quote: The photographer kept showing us the back of the camera so we knew exactly what we were getting.
Context: Exclusive Pyramids Photoshoot
Source: tripadvisor
Url: https://www.tripadvisor.com/ShowUserReviews-...
Date: 2026-03-14
Score: 5
```

`Name` and `Quote` are required. Everything else is optional **except** `Url`,
which is required for any source other than `direct` — the importer refuses the
block without it.

Duplicates are skipped automatically on reviewer name + quote text.

## Checking your work

- `/admin/reviews` — attribution coverage, unmatched contexts, compliance
  flags, source mix, and what travellers mention.
- `npm run check:reviews` — asserts the excerpting, photo handling, schema
  eligibility, staleness and theme-matching rules still hold. Runs in CI.
