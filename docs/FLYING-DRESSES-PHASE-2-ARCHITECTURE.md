# Phase 2: architecture, baselines and two corrections

20 November 2026. Nothing here is published or edited. Proposals only, per
your publishing rule.

---

## 1. A correction: the "free" archived article is not free

In my last message I called `best-time-flying-dress-photoshoot` a free gift —
archived on Egypt Eye, uncontested, ready for our first batch. You then asked
me to prioritise it. **That characterisation was wrong, and here is what I
found when I checked the URL properly.**

### What it actually does

```
GET https://egypteyetravel.com/stories/best-time-flying-dress-photoshoot
  -> HTTP/2 308
  location: /stories/flying-dress-photoshoot-egypt-guide
```

It is not abandoned. It **permanently redirects into the pillar**, so whatever
authority that URL earned has been deliberately consolidated there.

### And the pillar absorbed its keywords

The pillar's own declared `secondaryKeywords` now include:

> `best time for flying dress photoshoot`, `flying dress photoshoot timing`,
> `golden hour desert photoshoot`, `flying dress photoshoot sunrise`,
> `flying dress photoshoot sunset`

That is the entire topic you asked me to build a comprehensive guide around,
already claimed by the article the redirect points at.

The slug is also on the repository's explicit do-not-duplicate list,
`EGYPT_EYE_FLYING_DRESS_STORIES`, and the check script fails the build on a
collision. I should have read that list before calling the topic free.

### What this does and does not change

It does **not** kill the article. It ties it to the narrowing decision you
already approved:

- **If we narrow the pillar** to the traveller's view, the deep treatment of
  light — sunrise against sunset, season by season, how each of thirteen
  colours behaves in low sun, how the assistant times a throw to the wind —
  legitimately becomes ours, and the pillar links to it. The article you
  described is a specialist piece the pillar has no room for.
- **If we do not narrow the pillar**, our article competes with it on
  `best time for flying dress photoshoot` and we are bidding against
  ourselves on a term we already hold.

So it stays in batch one, but it is now **sequenced after** the pillar edit
rather than independent of it.

### On recovering the URL

You asked whether the old URL could be recovered or has indexing value. It
cannot be recovered for us — it is on egypteyetravel.com and we are a separate
domain. **The redirect should be left exactly as it is.** Breaking it to free
the slug would discard the equity it is currently passing to the pillar, which
is the opposite of protecting Egypt Eye's performance. Our article needs a new
URL on our own domain.

---

## 2. A blocker: there is no Search Console access

You asked me, before editing anything, to check each article's current clicks,
impressions, rankings and queries, and to identify which keywords each one
ranks for.

**I cannot. There is no Search Console access in this environment** — no
authenticated Google account, no API credentials, no BigQuery export. The only
Search Console figures anywhere in this project are a handful pasted into code
comments in October.

This is the one instruction in your message I cannot carry out, and it matters
more than it looks: **editing five ranking articles without knowing what they
rank for is the exact risk you asked me to avoid.** A heading that looks
redundant to me may be the one matching a query that brings the article its
traffic.

### What I can and cannot give you

| You asked for | Status |
|---|---|
| Current URLs, titles, metadata, content | **Done** — §3 |
| Clicks, impressions, rankings, queries | **Blocked** — needs Search Console |
| Which keywords each article ranks for | **Blocked.** I can give you what each one *targets*, which is not the same thing |
| Proposed revisions for approval | Can draft, but see below |
| Preserve URLs and avoid needless metadata churn | Built into the proposal |

### What I need

Either give this session Search Console access for egypteyetravel.com, **or**
export the Performance report for these five URLs yourself — queries, clicks,
impressions and average position, last 3 or 6 months — and paste it. Either
unblocks the safe version of this work.

**Until then I will draft the revisions but I will not recommend publishing
them.** Drafting is safe; editing live ranking pages blind is not.

---

## 3. Baseline: the five Egypt Eye articles

Recorded 20 November 2026 from `src/content/stories.ts`, the source the live
site is built from. **This is the restore point.** All five are `published`.

| Slug | Title | Declared primary keyword | Published |
|---|---|---|---|
| `flying-dress-photoshoot-egypt-guide` | Flying Dress Photoshoot in Egypt: The Complete Guide | `flying dress photoshoot Egypt` | 2026-09-01 |
| `flying-dress-photoshoot-pyramids-giza` | Flying Dress Photoshoot at the Pyramids of Giza | `flying dress photoshoot pyramids` | 2026-09-02 |
| `what-to-wear-flying-dress-photoshoot` | What to Wear (and Bring) for a Flying Dress Photoshoot | `what to wear flying dress photoshoot` | 2026-09-03 |
| `best-flying-dress-photoshoot-locations-egypt` | Best Flying Dress Photoshoot Locations in Egypt | `best flying dress photoshoot locations Egypt` | 2026-09-04 |
| `egypt-photoshoot-content-creators` | Egypt Photoshoot Experiences for Content Creators and Influencers | `Egypt photoshoot content creator` | 2026-09-06 |

Full secondary keyword sets, seoTitles, seoDescriptions, categories, tags and
related tours are in the git history at this commit. Nothing is lost by
editing later; everything is recoverable.

**A note worth acting on:** Egypt Eye's `Story` type carries `primaryKeyword`
and `secondaryKeywords`. Flying Dresses' `FlyingDressStory` carries neither —
the gap I flagged in Phase 1 §2.1. The travel site already solved this. We
should copy the pattern rather than invent one.

---

## 4. The dress cluster: pages or articles?

You asked for a recommendation before any URL is created. Here it is.

### Recommendation: thirteen product pages, plus six to eight editorial articles

**Not thirteen articles.** Here is the reasoning.

**Nobody searches for a dress by its name.** "Orchid flying dress" is our
product name, not a phrase a traveller types. Thirteen articles optimised for
thirteen names would target thirteen keywords with close to no demand, and
would be thirteen variations of one article — the thing you explicitly ruled
out, and the thing that makes a site look like a content farm.

**But people do search by colour and by decision**: a red dress against the
pyramids, which colour photographs best in the desert, what suits a dark
background. Those are real questions with real intent, and they are
*comparative* — they want several dresses in one place, not one.

So the two jobs are different and need different shapes:

| Job | Shape | Why |
|---|---|---|
| Show a specific dress: photographs, colour, where it suits, book it | **Product page** `/wardrobe/[slug]` | Commercial intent, navigational, and the destination every colour article needs to link to |
| Answer "which colour should I choose?" | **Editorial article** | Comparative, informational, and this is where the search demand actually is |

### Why the thirteen pages are worth building anyway

Even with little direct search demand per dress, they earn their place:

1. **They are the link destinations the cluster has no way to reach today.**
   Phase 1 found the dress cluster has nowhere to point. Every colour article
   wants to link to the specific dresses it discusses, and currently cannot.
2. **Image search is real traffic for a visual product.** 106+ photographs
   across thirteen named dresses, on thirteen indexed pages with proper
   filenames and alt text, is a genuine channel that one `/wardrobe` page
   cannot capture.
3. **They are conversion pages.** Someone who has decided on Cherry should
   reach a page about Cherry with a booking button, not scroll a grid.
4. **They make the enquiry form smarter** — a dress page can pre-fill which
   dress the enquiry is about.

### Proposed URLs

`/wardrobe/cherry`, `/wardrobe/emerald`, `/wardrobe/navy`, `/wardrobe/black`,
`/wardrobe/verdant`, `/wardrobe/ginger`, `/wardrobe/snowy`, `/wardrobe/golden`,
`/wardrobe/bronzey`, `/wardrobe/aqua`, `/wardrobe/lavender`,
`/wardrobe/hot-pink`, `/wardrobe/orchid`

Thirteen URLs, matching the `outfitId` values already in the content layer, so
nothing new has to be invented or kept in sync.

`/wardrobe` stays as the collection hub and gains links down into each.

### Each dress page carries

- Three to six photographs from that dress's own Drive folder
- The colour, described honestly, and what it does against limestone and sand
- Which of the five locations it suits and which it fights
- Which occasions it is chosen for
- Related dresses, for comparison
- Enquire, pre-filled with the dress

No invented stories, no fabricated popularity claims, no "our most requested"
unless you tell me it is true.

---

## 5. The dress editorial articles

Six to eight, each with a distinct question, all linking into the thirteen
pages. This is where the search work happens.

| # | Working title | Target keyword | Intent | Photography |
|---|---|---|---|---|
| D1 | Which flying dress colour works against limestone and sand | `best flying dress colour Egypt` | informational, comparative | 8–12 across colours |
| D2 | Dark dresses in bright desert light, and when they win | `dark flying dress desert photoshoot` | informational | Black, Navy, Verdant |
| D3 | Red against yellow stone: Cherry at the pyramids | `red flying dress pyramids` | informational, commercial lean | Cherry, Red folder |
| D4 | The metallics: Golden, BronZey and what the low sun does to them | `gold flying dress photoshoot` | informational | Gold, Bronze |
| D5 | White and pale dresses when the ground is already pale | `white flying dress desert` | informational | Snowy, White folder |
| D6 | Choosing a colour for the photographs you actually want | `how to choose flying dress colour` | decision support | mixed |
| D7 | Two dresses in one frame: colours that work together | `flying dress couple colours` | informational | Group folder |
| D8 | Colour and skin tone, said plainly | `flying dress colour skin tone` | informational | mixed, **needs care** |

**D8 carries a judgement risk** and I flag it rather than write it blind: done
well it is genuinely useful and inclusive; done badly it is presumptuous. I
would want your view before drafting it.

Existing `choosing-a-dress-colour` (653 words) becomes the hub for this group
and should be expanded rather than duplicated.

---

## 6. Cluster plan, in your priority order

Per-article specifications for clusters 1 and 2 are in §4, §5 and §7. The
remainder are sized here and specified next.

| # | Cluster | Articles | Photography | Status |
|---|---|---:|---|---|
| 1 | Individual dress collection | 13 pages + 8 articles | 106+ images, mapped | **ready** |
| 2 | Pyramids Rooftop | 10–12 | 577 images | **ready** |
| 3 | Flying dress photography at the Pyramids | 4–6 | shared with 2 | **after pillar edit** |
| 4 | Marriage proposals | 6–8 | 47 images | **ready** |
| 5 | Gender reveals | 5–6 | 40 images, no article today | **ready** |
| 6 | Anniversaries and birthdays | 6–8 | 28 + 15 images, no articles today | **ready** |
| 7 | Sand Dunes | 4–5 | thin in Drive, some in repo | partly ready |
| 8 | Fayoum | 5–6 | 22 images, 7 videos | **ready** |
| 9 | Dress rental | 6–8 | **1 image** | **blocked on photography** |
| 10 | Preparation and behind the scenes | 6–8 | BTS folder exists under DJ | partly ready |

**Ready to produce now: clusters 1, 2, 4, 5, 6, 8.** That is roughly 45–55
articles plus 13 pages, all with real photography, none duplicating Egypt Eye.

**Cluster 9 stays blocked.** One photograph of a rental dress will not support
eight articles, and this is the product the earlier research called the
biggest untapped one. It needs the shoot in §8.

---

## 7. Why the rooftop cluster is not simply "the biggest"

577 images is two thirds of the library, and the temptation is to write
proportionally. That would be a mistake: Egypt Eye holds eight
`pyramids-photoshoot-*` articles and the two flying-dress rooftop pieces, so
this is also the most contested ground we have.

The rooftop articles that are safely ours are the ones only an operator can
write: what the roof is and is not, the light at either end of the day, how
the throw works in rooftop wind against desert wind, what the skyline does to
a frame, which dresses the limestone background flatters. Not "what is a
pyramids photoshoot", which is theirs.

---

## 8. Recommended new photography

To unblock cluster 9 and strengthen 10. Half a day each.

| Shoot | What | Unblocks |
|---|---|---|
| **A. The rental rack** | All 13 dresses on a hanger and on a model, front and train, consistent light | Cluster 9, the 13 dress pages, D1–D8 |
| **B. Accessories on a person** | The 13 accessory pieces worn, not flat | `/rentals/accessories`, styling articles |
| **C. The gawns** | All 5, worn, full length | `/rentals/mens-wear`, couples content |
| **D. Behind the scenes** | The assistant throwing, the fan, the reset between frames | Cluster 10, the "how it flies" articles |
| **E. Dress detail** | Fabric close-ups: weight, sheen, seams | Every dress page |

A and E can be the same session. Nothing here needs a client present, which
means it can be scheduled around real bookings rather than waiting for one.

---

## 9. What I need from you

1. **Search Console access or an export** for the five URLs. Blocks safe
   editing.
2. **Yellow**: same dress as Ginger, separate dress, or discontinued?
3. **D8** — the colour and skin tone article. Write it or drop it?
4. **Confirm the thirteen `/wardrobe/[slug]` URLs** before I create them.
5. Still outstanding from before: **gallery delivery timings**, **group
   pricing**, **accessory and gawn prices**, **the rooftop venue name**.
