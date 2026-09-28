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
| `/testimonials` | The full wall, filtered by category, product, **source** and **mentions** |
| Tour pages | Reviews of that tour, or themed on guides / planning / pickups |
| Photoshoot pages | Reviews of that shoot, or themed on photography / flying dress / occasions |
| Experience pages | Reviews of that experience, or themed on guides / planning |
| Product cards | The star chip, linking to that product's reviews |

---

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
