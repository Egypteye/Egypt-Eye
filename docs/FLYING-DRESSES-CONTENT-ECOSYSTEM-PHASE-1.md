# Flying Dresses Egypt: content ecosystem, Phase 1

Audit and content architecture for the Stories brief of 20 November 2026.
Nothing here is published. This document exists to be argued with.

---

## How to read this

Three labels are used throughout, and they mean different things:

- **Verified** — read out of this repository or returned by a live request.
  Reproducible by anyone who runs the same command.
- **Observed** — from Search Console figures already recorded in the codebase.
  Real, but a snapshot, and the domain is young enough that the numbers are small.
- **Judgement** — my recommendation. Argue with these.

**What this document does NOT contain: search volumes.** I have no keyword
tool in this environment. Any figure I printed next to a keyword would be
invented, and invented numbers are how a content plan gets sized wrong for a
year. Where I rank topics, I rank them on search *intent* and on commercial
proximity, both of which I can reason about honestly, and I say so each time.
Getting real volumes is a named next step in §8.

---

## 0. Read this before anything else

**Phase 1 of your brief already exists, and it was delivered in October.**

Two documents in this repository already contain: the site audit, the existing
story audit, the cross-domain cannibalisation analysis, a 50-topic triage, the
cluster model, the internal-linking architecture, the measurement plan, the
publishing workflow and an SEO checklist.

- `docs/FLYING-DRESSES-STORIES-ROADMAP.md` (302 lines)
- `docs/FLYING-DRESSES-SEO-AUDIT.md`
- `docs/FLYING-DRESSES-SEO-AND-GALLERY-PROPOSAL.md`

I am not going to retype them. This document covers **what those did not**,
and reconciles them against the new brief.

**And there is a decision in them that is still open.** The October audit put
three options to you about the overlap with egypteyetravel.com and rated them.
Its third option was:

> **Rewrite it here on a different angle.** Worst of the three. Two articles
> on one topic competing, which is the thing both the brief and the build
> guard against.

Executed literally, the new brief is that third option, roughly two hundred
times over. That is the single most important thing on this page and §3 is
about it.

---

## 1. Complete URL inventory

**Verified** by enumerating `flyingDressRoutes` and `liveStories()` from the
content layer, which is what the sitemap and the pages are both built from.

**38 indexable URLs.** 28 routes plus 10 live stories.

### Commercial pages (28)

| URL | Type | Primary intent | Price | Editorial support today |
|---|---|---|---|---|
| `/` | Home | Brand / navigational | — | n/a |
| `/experiences` | Hub | Commercial: compare shoots | — | 3 stories |
| `/experiences/sand-dunes` | Product | Commercial: dunes shoot | $179 | `rooftop-or-dunes` |
| `/experiences/pyramids-rooftop` | Product | Commercial: pyramids shoot | $199 | 2 stories |
| `/experiences/fayoum` | Product | Commercial: Fayoum day | $349 | `a-day-in-fayoum` |
| `/experiences/red-sea-yacht` | Product | Commercial: yacht day | $399 | **none** |
| `/experiences/white-desert` | Product | Commercial: 2-day trip | $400 | **none** |
| `/packages` | Compare | Commercial investigation | — | `what-a-flying-dress-photoshoot-costs` |
| `/wardrobe` | Collection | Research: which dress | — | 2 stories |
| `/rentals` | Hub | Commercial: hire only | — | **none** |
| `/rentals/dress-rental` | Product | Commercial: hire a dress | on request | **none** |
| `/rentals/accessories` | Product | Commercial: accessories | on request | **none** |
| `/rentals/mens-wear` | Product | Commercial: gawn hire | on request | `two-people-in-the-frame` |
| `/celebrations` | Hub | Occasion research | — | `two-people-in-the-frame` |
| `/celebrations/marriage-proposals` | Occasion | Commercial: proposal | — | `photographing-a-proposal…` |
| `/celebrations/gender-reveals` | Occasion | Commercial | — | **none** |
| `/celebrations/birthdays-and-celebrations` | Occasion | Commercial | — | **none** |
| `/celebrations/anniversaries-and-romance` | Occasion | Commercial | — | **none** |
| `/celebrations/maternity-and-family` | Occasion | Commercial | — | `one-size-cut-to-fit` |
| `/celebrations/vow-renewals-and-engagements` | Occasion | Commercial | — | **none** |
| `/creative` | Hub | B2B | — | **none** |
| `/creative/creators-and-editorial` | B2B | Commercial: creators | — | **none** |
| `/creative/dj-and-music` | B2B | Commercial: production | — | **none** |
| `/collaborate` | B2B | Partnership | — | **none** |
| `/about` | Trust | Navigational | — | **none** |
| `/faq` | Support | Informational | — | `inside-a-forty-five-minute…` |
| `/enquire` | Conversion | Transactional | — | n/a |
| `/stories` | Hub | Editorial index | — | n/a |

### Stories (10 live, 1 unpublished)

All 10 live stories have a `destination`, `inboundFrom` entries and FAQs.
Word counts 520–1,016. **Verified.**

| Slug | Cluster | Destination | Words | Basis |
|---|---|---|---|---|
| `what-a-flying-dress-photoshoot-costs` | session | `/packages` | 1,016 | cited |
| `a-day-in-fayoum` | place | `/experiences/fayoum` | 918 | first-party |
| `rooftop-or-dunes` | place | `/experiences` | 838 | first-party |
| `inside-a-forty-five-minute-session` | session | `/experiences` | 740 | first-party |
| `how-a-flying-dress-flies` | dress | `/experiences` | 692 | first-party |
| `two-people-in-the-frame` | occasion | `/celebrations` | 688 | first-party |
| `choosing-a-dress-colour` | dress | `/wardrobe` | 653 | first-party |
| `a-pyramid-view-is-not-the-pyramid-complex` | place | `/experiences/pyramids-rooftop` | 634 | cited |
| `photographing-a-proposal-she-does-not-know-about` | occasion | `/celebrations/marriage-proposals` | 590 | first-party |
| `one-size-cut-to-fit` | dress | `/wardrobe` | 520 | first-party |
| `who-owns-the-answer-about-photographing-giza` | place | — | **stub** | cited — *blocked on permits questions* |

### The legacy blog: already handled

The brief asks me to audit a "legacy Blog section". **It no longer exists and
was dealt with in October.** `/blog` → `/stories` (308), plus patterns for
`/blog-post{n}` and `/blog/*`. The code records why, with the Search Console
data that justified it. Nothing to do here.

---

## 2. What is structurally missing

Four findings that no existing document covers. These are the genuinely new
part of this audit.

### 2.1 The story data model has nowhere to put a keyword — **Verified**

`FlyingDressStory` has `slug, cluster, status, title, seoTitle,
metaDescription, excerpt, publishedAt, updatedAt, basis, sections, faqs,
related, sources, destination, inboundFrom, relatedStorySlugs`.

There is **no field for a target keyword, a secondary keyword set, or a search
intent**. Every one of the 11 stories returns nothing for them, because the
field does not exist.

Your brief asks for a "consistent structured record with its title, URL,
target keyword, intent, metadata…". Today that record cannot be stored, so it
cannot be checked, so it will drift the moment there are more than a dozen
articles. **This is the first thing to build, before a single new article.**
It is a small change — three optional fields and a uniqueness check that fails
the build when two articles claim the same primary keyword, which is
cannibalisation caught at compile time instead of in Search Console six months
later.

### 2.2 Thirteen dresses with no URLs — **Verified**

13 dresses (Cherry, Emerald, Navy, Black, Verdant, Ginger, Snowy, Golden,
BronZey, Aqua, Lavender, Hot Pink, Orchid) and 5 gawns, all with real
photographs from your own wardrobe shoot, all on **one page**: `/wardrobe`.
There is no `/wardrobe/cherry`.

Your brief asks for "dedicated content opportunities around the individual
dresses". The blocker is not articles, it is that there is nothing for a dress
article to link *to*. **This is the largest untapped commercial cluster on the
site** and it is a page-template job, not a writing job.

Honest caution: I cannot tell you whether "emerald flying dress Egypt" has
meaningful search volume, because I have no keyword tool (see §8). My
judgement is that the per-dress *pages* are worth building for navigation,
internal linking and image search regardless, and that per-dress *articles*
should wait for volume data. Thirteen dedicated articles on individual dress
colours is very likely more than the demand supports.

### 2.3 Photography in the repo is thin, but the Drive is not — **Verified**

> **Updated 20 November 2026**, once the Drive link was supplied. The figures
> immediately below describe what is *published on the site today*. §10 has
> the Drive library, which changes the conclusion: photography is no longer
> the binding constraint for most clusters, and is a severe one for exactly
> the clusters §5 identifies as the opportunity.


| Kind | Count | Usable as real client work? |
|---|---|---|
| `agency` | 47 | yes |
| `retouched` | 12 | yes, with its credit |
| `location` | included above | yes |
| `reference` (generated) | 26 | **no** |
| `styled` (composite) | 1 | **no** |
| `empty` (labelled gaps) | 5 | n/a |

**59 frames usable as genuine photography. 27 generated frames that must never
illustrate a claim about real client work.**

Your brief says "Prioritize our original photography over stock images" and
"Avoid repeating the same image excessively across articles". Those two rules
and 59 frames put a hard ceiling on how many articles can be *honestly
illustrated*. At 2–3 unique frames per article that is roughly **20–30
well-illustrated articles** from current stock.

This is the real argument for the Drive library — and the Drive link in your
brief is the literal placeholder text `[INSERT GOOGLE DRIVE LINK HERE]`.
**I could not inventory any Drive photography, and I have not pretended to.**
Section 4 of your brief, the photography-to-content mapping sheet, is blocked
until you paste the link.

### 2.4 Several "locations" in the brief are not separate products — **Verified**

The brief lists ten locations. They collapse to five products:

| Brief's location | Reality |
|---|---|
| Pyramids Rooftop / Giza / Pyramids of Giza | one product, `/experiences/pyramids-rooftop` |
| Sand Dunes near Cairo | `/experiences/sand-dunes` |
| Fayoum Oasis | `/experiences/fayoum` |
| **Magic Lake, Wadi El Rayan, Mudawara Mountain, Arab Castles** | **the four stops inside the Fayoum day**, not four products |
| Red Sea Yacht, Ain Sokhna | `/experiences/red-sea-yacht` |
| Bahariya Oasis & White Desert | `/experiences/white-desert` |

Treating the four Fayoum stops as separate pillars would create four articles
competing with `/experiences/fayoum` and with `a-day-in-fayoum`. They are
*sections within* the Fayoum cluster, which is how they are written today.

---

## 3. The cross-domain problem, at its real size

**This is the finding that should change the plan.** — **Verified**

egypteyetravel.com, which you own, has **215 stories, 185 published**. Of
those, **36 overlap Flying Dresses territory and 34 are live.** I confirmed
the pillar returns HTTP 200.

Here is what is already published on the other domain, mapped against the
sections of your brief:

| Your brief asks for | Already live on egypteyetravel.com |
|---|---|
| A. The overall flying dress experience | `flying-dress-photoshoot-egypt-guide` (~2,800 words) |
| B. Pyramids / Giza | `flying-dress-photoshoot-pyramids-giza`, `pyramids-photoshoot-guide`, `what-happens-pyramids-photoshoot`, `pyramids-photoshoot-what-included` |
| B. Location selection | `best-flying-dress-photoshoot-locations-egypt` |
| B. Fayoum, Magic Lake, Wadi El Rayan | `fayoum-photoshoot-guide` |
| B. White Desert | `is-the-white-desert-worth-visiting`, `white-desert-vs-black-desert` |
| B. Red Sea Yacht, Ain Sokhna | `private-yacht-day-trip-ain-sokhna` |
| D. Proposals | `proposal-photographer-pyramids`, `egypt-proposal-engagement-trip-ideas`, `egypt-romantic-destination-proposals` |
| D. Birthdays | `birthday-photoshoot-egypt` |
| D. Family / couples / solo | `family-photoshoot-pyramids`, `couples-photoshoot-pyramids`, `solo-photoshoot-egypt` |
| D. Milestones | `celebrating-a-milestone-in-egypt` |
| E. Creators and influencers | `egypt-photoshoot-content-creators` |
| F. What to wear | `what-to-wear-flying-dress-photoshoot`, `what-to-wear-pyramids-photoshoot` |
| F. Best time of day | `best-time-flying-dress-photoshoot`, `best-time-for-pyramids-photoshoot` |
| F. Cost | `pyramids-photoshoot-cost` |
| F. Delivery and editing | `photoshoot-photo-delivery-editing` |

**Sections A, B, D and F of your brief are substantially already written — on
your other domain.**

### Why this matters more than it looks

flyingdressesegypt.com is **new and small**. The Search Console figures
recorded in the codebase are: `/rentals` 53 impressions, `/packages` 26, a
story 6–14. The old blog's best page managed 6 clicks a quarter and
"out-clicked every celebration page on the site". **Observed.**

egypteyetravel.com is the established property with 185 published articles and
years of history.

Publishing 200 articles on the new domain against keywords the old domain
already holds does not give you two chances at the ranking. It splits one
business's signal across two properties, and the newer one loses. The
repository already fails the build on a slug appearing on both domains — the
guard exists precisely because this was foreseen.

### The decision, still open from October

| Option | What it means | Risk | My rating |
|---|---|---|---|
| **A. Leave it** | Travel site keeps informational queries; this site keeps commercial ones. Flying Dresses writes only what the travel site does not cover. | None. Where you are now. | **Safe, and genuinely viable** |
| **B. Migrate the pillar** | Move `flying-dress-photoshoot-egypt-guide` and the 6–7 core flying-dress articles here with 301s. | A real dip while the redirect settles. | **Highest long-term upside** |
| **C. Rewrite here on a new angle** | What the brief asks for, at scale. | Two properties competing on every term. | **Do not** |

**I cannot make this call for you — it is a business decision about two
properties you own, not a technical one.** Everything below is written so that
it works under A or B.

---

## 4. The arithmetic on "30–40 per subject"

Taken literally, the brief names 49 subjects across its six sections
(6 experience topics + 10 locations + 13 dresses + 10 occasions + 10 services
+ 10 planning topics). At 35 each:

**49 × 35 = 1,715 articles.**

Against: 38 existing URLs, 59 usable photographs, 5 products, and a domain
currently measured in tens of impressions. Your own brief says "Think like the
owner of a premium photography experience brand, not like a content farm" and
"Do not create duplicate content simply to increase the article count". Those
two instructions and the 30–40 target cannot both be satisfied; I am treating
the quality instruction as the one that governs, which is what §13 of your
brief tells me to do.

Read the other sensible way — 30–40 per *major cluster*, six clusters — the
target is **180–240 articles**. Still too many for this domain this year, but
the right order of magnitude for a two-to-three-year programme.

### What I actually recommend — **Judgement**

| Horizon | Articles | Why |
|---|---|---|
| Next 90 days | **12–16** | What current photography can honestly illustrate, and what the open questions in §7 do not block |
| Year one | **40–60** | Assumes the Drive library lands and the dress pages are built |
| The 180–240 figure | year two to three | Only after the §3 decision and real volume data |

A domain with 53 impressions on its best page does not have a content-volume
problem. It has an authority and indexation problem, and 200 thin articles
make that worse, not better.

---

## 5. Cluster architecture

Four clusters already exist in the content model and they are the right four.
I propose extending to six, because two of the brief's strongest commercial
areas have no cluster today.

| Cluster | Pillar page | Today | Proposed year-one | Status |
|---|---|---|---|---|
| **The session** | `/packages` | 2 | 8–10 | exists |
| **The dress** | `/wardrobe` | 3 | 8–12 | exists |
| **The place** | `/experiences` | 3 + 1 stub | 10–14 | exists |
| **The occasion** | `/celebrations` | 2 | 8–10 | exists |
| **Hire without a shoot** | `/rentals` | **0** | 6–8 | **new** |
| **Commissioned work** | `/creative` | **0** | 4–6 | **new** |

**The two new clusters are where the opportunity actually is**, and the reason
is §3: they are the only areas where egypteyetravel.com has nothing. Dress
hire, accessories, gawn hire, creator shoots and DJ production are products
this brand sells and the travel site does not discuss. Under option A they are
the obvious place to spend the next ninety days.

`/rentals/dress-rental` has **no editorial support whatever** and the earlier
research already flagged it as the biggest untapped product.

---

## 6. Internal linking

The architecture already exists and is better than most sites have. Three
link types, each with a different owner:

| Link type | Where | Set by |
|---|---|---|
| Contextual | mid-prose | the writer, inline |
| The next step | once, after the article | `destination` — one per article |
| The reading list | below it | `relatedStories()`, scored |

Plus `inboundFrom`, which records which commercial pages link *into* an
article — this is what prevents orphans, and all 10 live stories have entries.

**What to add, not rebuild:**

1. The keyword field from §2.1, so cannibalisation fails the build.
2. `destination` for the stub article once the permits questions are answered.
3. Per-dress pages (§2.2), which give the dress cluster somewhere to point.
4. A check that every live story is reachable from at least one commercial
   page — `inboundFrom` records the intent but nothing currently asserts it.

---

## 7. Open questions blocking content

These are carried forward from the October documents. **They are still open**,
and several of them block articles the brief asks for.

| # | Question | Blocks |
|---|---|---|
| 1 | The three Giza permits questions | the researched stub, unpublishable until answered |
| 2 | Gallery delivery: how many edited images, in what time | "what's in the gallery" — a high-intent article |
| 3 | Group pricing for two or more people | strengthens `two-people-in-the-frame` |
| 4 | Accessory and gawn prices | the entire new Hire cluster |
| 5 | Sand dunes $179 and Fayoum $349 marked "confirm", not verified | any article quoting a price |
| 6 | Red Sea yacht group saving | the yacht article |
| 7 | The rooftop venue name | rooftop articles |
| 8 | Search Console verification for this domain | all measurement |
| 9 | **The §3 cross-domain decision** | the shape of the whole programme |

**Question 9 is the one I need first.** Questions 2 and 4 unlock the most
articles per answer.

---

## 8. What I propose to do next

Nothing is written until you have answered §3. In the meantime, three pieces
of work are useful under every option:

1. **Add the keyword and intent fields to the story model**, with a
   build-time uniqueness check. Small, structural, and it makes every later
   article auditable. I can do this now.
2. **Build the per-dress pages** at `/wardrobe/[slug]`. Thirteen real
   photographs already exist. This is the largest untapped cluster and it is
   a template, not a writing project.
3. **Get real keyword volumes.** Everything in §4 and §5 is sized on intent
   and judgement. Before committing to 40–60 articles it should be sized on
   data. This needs either a tool subscription or an export you run.

And two things I need from you:

4. **The Drive link.** Your brief's section 4 is blocked without it.
5. **Search Console access**, so the next version of this document is measured
   rather than reasoned.

---

## 9. What I have deliberately not done

- **Not produced 1,715 article concepts.** §4 explains the arithmetic. I would
  rather hand you 16 that can be published well than 200 that cannot.
- **Not invented search volumes.** No keyword tool here; a fabricated number
  would mis-size the programme for a year.
- **Not claimed to have inventoried the Drive.** The link was a placeholder.
- **Not rewritten the October audit.** It is good and it stands.
- **Not written anything that duplicates egypteyetravel.com**, because the
  build fails on it and because it would be the option that audit rated worst.


---

## 10. The Drive library

**Verified** on 20 November 2026 by enumerating
`drive.google.com/drive/folders/1bLvEK6u4qWFwyZUeFZzITpuTOSpnQLiL`
through the Drive API.

**Paging was stopped at 1,000 entries and the library is larger than that.**
Every figure below is therefore a FLOOR, not a total. The distribution was
stable across the last four pages, so the shape is reliable even though the
totals are not final.

1,000 entries seen: **63 folders, 937 assets — 894 images, 27 videos, 16 other.**

### What is in it, mapped to the site

| Drive folder | Images | Videos | Maps to | That page's editorial support today |
|---|---:|---:|---|---|
| Pyramids Rooftop | **577** | 2 | `/experiences/pyramids-rooftop` | 2 stories |
| Dresses Colors / Photos | **106** | 0 | `/wardrobe` | 2 stories |
| Pyramids Rooftop Proposal | 47 | 0 | `/celebrations/marriage-proposals` | 1 story |
| Gender Reveal | 40 | 1 | `/celebrations/gender-reveals` | **none** |
| Rooftop Anniversary | 28 | 0 | `/celebrations/anniversaries-and-romance` | **none** |
| Fayoum: the Lakes and the White Dunes | 22 | 7 | `/experiences/fayoum` | 1 story |
| Birthdays and private celebrations | 15 | 0 | `/celebrations/birthdays-and-celebrations` | **none** |
| Accessories | 13 | 0 | `/rentals/accessories` | **none** |
| The Red Sea Yacht Experience | 13 | 4 | `/experiences/red-sea-yacht` | **none** |
| DJ, music and rooftop production | 11 | 9 | `/creative/dj-and-music` | **none** |
| Bahariya and the White Desert | 7 | 4 | `/experiences/white-desert` | **none** |
| Maternity and family portraits | 5 | 0 | `/celebrations/maternity-and-family` | 1 story |
| Men's wear | 5 | 0 | `/rentals/mens-wear` | 1 story |
| Creator, editorial and brand shoots | 4 | 0 | `/creative/creators-and-editorial` | **none** |
| **Rent a Dress** | **1** | 0 | `/rentals/dress-rental` | **none** |

The folder names map almost one-to-one onto the site's commercial pages. That
is unusually good and it is worth keeping that way.

### The finding that matters

**The photography is concentrated where the content already is, and absent
where the opportunity is.**

Pyramids Rooftop alone is 577 images — roughly two thirds of the library, and
it supports the cluster that is already best served. Meanwhile:

| Cluster §5 named as the opportunity | Photography |
|---|---|
| `/rentals/dress-rental` — "biggest untapped product" | **1 image** |
| `/creative/creators-and-editorial` | 4 images |
| `/rentals/mens-wear` | 5 images |
| `/experiences/white-desert` ($400, the highest-priced product) | 7 images |

So §2.3 inverts rather than resolves. Photography is no longer a constraint on
the rooftop, dress, proposal, gender-reveal and anniversary clusters: there is
more than enough for 30–40 articles across those. It is a **hard** constraint
on dress hire, men's wear and creator work, which is precisely where §5 says
the commercial upside is, because the travel site does not compete there.

**This needs a decision from you and it is not a writing decision:** the Hire
and Commissioned-work clusters need a shoot before they need articles. A
half-day photographing the rental dresses, the accessories on a model and the
gawns would unblock six to eight articles against products nobody else is
writing about.

### Two things to resolve before any image is placed

**1. The dress colour folders do not match the dress names.** Drive has 15
colour folders: Yellow, Gold, Aqua, Group, Em. Green, White, Purple, Red,
Pink, Black, Green, Blue, Bronze, Ginger, Magenta. The site has 13 named
dresses: Cherry, Emerald, Navy, Black, Verdant, Ginger, Snowy, Golden,
BronZey, Aqua, Lavender, Hot Pink, Orchid.

Some are obvious (Gold/Golden, Bronze/BronZey, Ginger, Black, Aqua). Several
are not: does **Purple** mean Lavender or Orchid? Does **Red** mean Cherry?
**Green** vs **Em. Green** against Verdant and Emerald? What are **Yellow**
and **Magenta** — dresses not on the site, or other names for ones that are?

I will not guess. A wrong mapping puts the wrong dress in an article about
choosing a colour, which is the one article where the colour is the whole
point. **Six lines from you resolves it.**

**2. Provenance still has to be checked per file.** The library has mixed
provenance — earlier in this project a file from this same folder turned out
to carry an OpenAI C2PA manifest, and the registry splits real from generated
on exactly that evidence. Every image pulled into an article gets the same
byte-level check before it is placed, and generated frames stay out of
anything claiming to show client work.

### What I can produce once you answer

The article-to-image assignment sheet your brief asks for: filename, Drive
link, target article, placement, SEO filename, alt text and caption, for every
image used. That is mechanical once the colour mapping is settled and the
cross-domain decision in §3 tells me which articles exist.
