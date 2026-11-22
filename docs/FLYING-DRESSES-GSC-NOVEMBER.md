# Search Console, 18 October to 20 November 2026

Read against the previous export (three months to 1 November), which is
recorded in `docs/FLYING-DRESSES-SEO-AUDIT.md`.

**This is the flyingdressesegypt.com property.** It is not Egypt Eye, so it
does **not** unblock the five Egypt Eye article edits, R1, or cluster 3. Those
still need the `egypteyetravel.com` property. That item stays open.

---

## The site is growing, substantially

34 days, **169 clicks, 1,618 impressions, 10.4% CTR**, average position 5.4
on mobile.

| | 3 months to 1 Nov | 18 Oct to 20 Nov | Change |
|---|---:|---:|---:|
| Impressions per day | 6.6 | 60.7 | **9.2x** |
| Clicks per day | 0.71 | 5.06 | **7.2x** |

That is the headline and it is good news. A caution on the arithmetic: the
page-level export sums to 2,065 impressions against the chart's 1,618, which
is ordinary Search Console de-duplication across dimensions. I have used the
chart and device figures, which agree with each other, as the site total.

---

## The 1 November fixes are working

Both bugs found in the last export were fixed that day. This export is the
first measurement of whether the fixes took.

**The duplicate long-form URLs are decaying, as intended.** They grew 2.7x
while the site grew 9.2x, so their share is falling:

| URL | Growth | Verdict |
|---|---:|---|
| `/flying-dresses/stories/how-a-flying-dress-flies` | 2.7x | losing share |
| `/flying-dresses/packages` | 2.7x | losing share |
| `/flying-dresses/stories/choosing-a-dress-colour` | 2.7x | losing share |

All thirteen long-form URLs together now take 88 impressions and 2 clicks.
Nothing to do; re-check in a month.

**The legacy redirect fires correctly in production.** I fetched
`flyingdressesegypt.com/blog-post1` and it resolves to the Stories page with a
200 after the 308. `/blog-post1` is still reported as a landing page and still
growing in line with the site (8.7x), which is normal: Search Console keeps
attributing to the pre-redirect URL for weeks after a 308. Also nothing to do,
but it is worth re-checking, because if it has not started decaying by late
December something else is going on.

Legacy URLs still account for 15 clicks and 229 impressions, about 9% of
clicks, which is the transition cost and will come back.

---

## What this changes about the content plan

### The stories look terrible, and the number is misleading

| Section | Clicks | Impressions | CTR |
|---|---:|---:|---:|
| Homepage | 104 | 830 | 12.5% |
| Celebrations | 17 | 164 | 10.4% |
| Rentals | 16 | 261 | 6.1% |
| Wardrobe | 3 | 70 | 4.3% |
| Experiences | 2 | 77 | 2.6% |
| **Stories (11 articles)** | **3** | **177** | **1.7%** |

Eleven articles produce 1.7% of the clicks. Two of the best sit at zero:

- `how-a-flying-dress-flies` — 48 impressions, **0 clicks**, position 11.17
- `what-a-flying-dress-photoshoot-costs` — 39 impressions, **0 clicks**, position 11.23

**I do not think this means the articles are bad, and I want to be careful
not to over-read it.** Position 11 is the top of page two, and near-zero
clicks is simply what page two produces. These articles were published from
19 October onwards on a domain that is a few months old. One month is too
short a window to judge them, and the right conclusion is that they have not
ranked **yet**, not that they failed.

I also checked the obvious culprit and it is not the problem: internal
linking is already in place. Ten of the eleven articles carry `inboundFrom`,
the homepage links to stories, and the occasion pages render a related rail.

### But it does change the expected return on the P1 batch

The P1 brief I gave you on 20 November ranked fourteen articles on commercial
intent. That ranking still holds. What I got wrong was the implied timescale.

**The fourteen P1 articles are a six to twelve month asset, not a this-quarter
revenue lever.** If the existing eleven are at position 11 after a month, the
next fourteen will be too. That is fine, it is how this works, and it is still
worth doing. It is not fine if you are expecting them to move bookings before
spring, and I should have said so when I handed you the list.

The things that can move bookings sooner are different, and the data points
at three of them.

---

## Three things the data says, that the article plan does not address

### 1. The head terms are won and they are small

| Query | Position | Impressions (34 days) | Clicks |
|---|---:|---:|---:|
| `flying dress egypt` | **1.24** | 29 | 9 |
| `flying dress photoshoot egypt` | **1.37** | 19 | 8 |
| `flying dresses` | 1.33 | 3 | 2 |
| `flying dresses photoshoot` | 1.0 | 1 | 1 |

The 1 November audit already said this and this export confirms it at nine
times the volume. We are first for the category's core terms. Ranking first
for a term with 29 impressions a month produces nine clicks a month. **There
is no further upside in those keywords**, and no article can create demand
that is not being searched for.

### 2. Hurghada is now the largest non-brand demand on the site

| Query | Impressions | Position |
|---|---:|---:|
| `hurghada flying dress` | 52 | 6.52 |
| `flying dress hurghada` | 19 | 8.16 |

**71 impressions**, more than any Giza term including the brand ones, growing
7.7x, and we rank on page one for a service we do not offer there.

This was flagged on 1 November and has grown since. It is a business question
rather than a content one and only you can answer it: is a Red Sea or Hurghada
session something the business would ever do? If yes, it is the clearest
demand signal in this dataset. If no, we should stop ranking for it, because
those are visitors who cannot buy.

### 3. Rentals is the second-largest section and it is blocked

261 impressions and 16 clicks across four URLs, with `/rentals/dress-rental`
at position 15.29. Around twenty rental queries appear, from
`dresses for rent egypt` and `flying dress rental` through to a long tail of
`rent dresses near me` variants.

An honest caveat: much of that long tail is people looking for local dress
hire anywhere in the world, not Egypt, and they are not customers. But
`dresses for rent egypt`, `flying dress rental` and `rent a dress` are real,
and they land on pages that cannot state a price because no rental terms have
been given. This is outstanding item 5, and it is costing more than I thought
when I wrote it down.

---

## Smaller observations

- **Mobile is 72% of clicks** and ranks far better than desktop: position 5.38
  against 12.23. The gap is large enough to be worth a look, though it is
  partly a different query mix rather than a ranking problem.
- **Egypt and the United States are half the audience**, 45 and 43 clicks.
  Egypt ranks worse (7.84) than the US (5.2).
- **`/celebrations/gender-reveals` is at position 18** with a 17.4% CTR on 23
  impressions. G1's job is to get that page onto page one; the CTR suggests it
  converts once seen. But `gender reveal egypt` has 3 impressions in 34 days,
  so expect conversion support rather than traffic.
- **`/celebrations/anniversaries-and-romance` has 1 impression.** A2's target
  page is effectively not in the index. Same reasoning applies.
- **`/celebrations/vow-renewals-and-engagements`** is quietly the best
  converting page on the site: 27.8% CTR at position 4.67. A6 was P2; on this
  evidence it deserves a second look.

---

## Revised recommendation

Nothing in the content map is withdrawn. The sequencing changes:

1. **The thirteen wardrobe pages stay first**, and the data strengthens the
   case: 70 impressions already land on `/wardrobe` at position 6.43 and 261
   on the rental pages, with no per-dress page for any of them to land on.
2. **Answer the Hurghada question.** It is the biggest unserved demand in the
   dataset and it is a decision only you can make.
3. **Unblock rentals** by giving me the rental terms and prices. Second
   largest section, currently unable to answer the question it ranks for.
4. **Ship G1, A2 and D3** as drafted, understanding that their job is to get
   two invisible commercial pages into the index, not to deliver traffic this
   quarter.
5. **Re-measure in late December.** Specifically: has `/blog-post1` started
   decaying, and have any of the eleven articles crossed from position 11 into
   the top ten.
