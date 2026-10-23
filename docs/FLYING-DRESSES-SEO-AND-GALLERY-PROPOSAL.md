# Flying Dresses Egypt: search, storytelling and the gallery system

**A proposal. Nothing in here is built yet, and nothing will be built until you say
which parts you want.** That is your own instruction and it is the right one: most of
what follows is cheap to change on paper and expensive to change once it is live.

Written 14 October 2026, against the site as it stands on
`claude/zealous-volta-ec0mvn`.

---

## How to read the evidence in this document

The brief said never to invent search volumes or ranking opportunities, so this
document uses three labels and uses them strictly:

| Label | What it means |
|---|---|
| **Verified** | I measured it, in this repository or in a browser, and can show you the measurement. |
| **Observed** | I saw it on the public web just now. True at the time of looking, and I name where. |
| **Estimate** | My judgement. No number behind it. Treat as an opinion, argue with it. |

**I have no keyword tool.** No Search Console, no Ahrefs, no Semrush, no Keyword
Planner. So there is not a single search volume in this document, and there should not
be. A number I made up would be worse than no number, because you would plan against
it. Where I would normally cite volume, I cite the structure of the market instead,
which I can actually see. The section at the end lists what access would change this.

---

## 1. The findings that matter most

### 1.1 Nobody in this category has an owned website that ranks (**Observed**)

I searched twice, from different angles, for Egyptian flying-dress operators. Every
result on the first page was a marketplace listing: Expedia, Airbnb, AAA TripCanvas,
Headout, Travelocity. One competitor brand name surfaced only as a credit line inside
an Expedia listing. I did not find a single operator's own website ranking for the
obvious commercial queries.

Two searches is evidence, not proof. A tool with real ranking data could overturn
this, and I would want it checked before you spend heavily against it. But if it
holds, it is the single most important fact about your position:

- **You are not fighting other photographers for these rankings. You are fighting
  Expedia and Airbnb**, and on their own listing pages you will not beat them.
- **But OTAs only compete for transactional queries.** They publish listings, not
  guides. Everything a customer wants to know *before* they are ready to book is
  unoccupied ground, and that is ground a marketplace structurally cannot take from
  you.
- **Every booking through those platforms costs you commission.** Typical OTA take
  on experiences runs roughly 20 to 30% (**Estimate**: I have not seen your contracts).
  A booking won by your own content is worth materially more than the same booking
  won on Expedia, which changes what content is worth paying for.

### 1.2 Every page shares without a picture (**Verified**)

This is the highest-value, lowest-effort fix on the site, and it is embarrassing for a
photography brand.

`src/app/flying-dresses/_lib/seo.ts` builds `openGraph` with `title`, `description`
and `url`, and **no `images`**. It then sets `twitter.card` to
`"summary_large_image"`, which asks Twitter/X for the big photo card and gives it no
photo to put in it.

So when anyone pastes a link to your site into WhatsApp, Instagram DM, Facebook,
iMessage or Slack, it renders as grey text. For a business whose entire product is
photographs, and whose customers share links in exactly those places, this is the
worst possible first impression.

My visual audit flagged it on all six pages tested. **Until last week this was hard to
fix properly, because there were no photographs. Now there are 18.**

### 1.3 The informational ground is held by Greece and Turkey (**Observed**)

When I searched for preparation and "what to expect" content, the results were
dominated by Santorini, Mykonos and Cappadocia guides, plus generic photographer
blogs. Substantive, well-structured, and **not about Egypt**.

Nothing addressed the questions that are specific to shooting here, and those
questions are real and different:

- Giza has a gate-opening time, and the good light is before it.
- There is an archaeological-site entry ticket that is usually **not** in the price.
- Modesty norms differ from a Greek island, and guests ask about this.
- Fayoum is three hours away, which makes it a different kind of day entirely.
- The wind that makes the picture is weather, and weather has a season.

Nobody is answering these. You can, with authority, because you do it every week.

### 1.4 Your pricing sits mid-market and one product is unexplained (**Verified / Observed**)

Your prices (**Verified**, from `src/content/flyingDresses.ts`): Sand Dunes **$179**,
Pyramids Rooftop **$199**, Fayoum **$349**.

Comparable listings I saw (**Observed**, prices as displayed and subject to change):
AAA TripCanvas from ~$125, Expedia private shoot ~$180, Airbnb rooftop ~$179, Expedia
tour-plus-shoot ~$200.

Sand Dunes and Pyramids Rooftop are competitive without being cheap, which is the
right place to be. **Fayoum at $349 is nearly double the market and the site does not
yet explain why.** It is a three-hour drive to a landscape nobody else shoots, which
is a genuinely good reason, but it is currently a number next to a name. That gap is
a content problem, not a pricing problem, and it is the one page where storytelling
most directly moves money.

### 1.5 Smaller verified items

| Item | Detail | Effort |
|---|---|---|
| Home `<title>` is 66 chars | Google truncates near 60. Currently "Flying Dresses Egypt \| Editorial flying-dress photography in Egypt" | Minutes |
| Canonicals carry `/flying-dresses` | `flyingdressesegypt.com/wardrobe` canonicalises to `…/flying-dresses/wardrobe`. Deliberate, documented, and correct for now; worth revisiting once DNS is pointed | Medium, needs care |
| No landmark region | axe flags content outside landmarks on all six pages | Small |
| Empty table header on `/packages` | axe minor; a screen reader announces a blank column | Minutes |
| No `Review` / `aggregateRating` schema | **Correct as-is.** You have no verified reviews and inventing them is a manual-action risk. Noted so nobody "fixes" it later | n/a |

---

## 2. A prioritised content strategy

Ordered by return per unit of your time, because your time is the binding constraint:
not my time, and not budget.

### Tier 1: do these first

**1. Open Graph images on every page.**
Code change, uses photographs you have already supplied. One afternoon. It improves
every share from every channel you already use, forever. Nothing else on this list has
that ratio.

**2. The Fayoum page earns its $349.**
One page, written once. The Fayoum product is your highest-margin and least-understood
item. It needs: why the white desert looks like nowhere else in Egypt, what the drive
is actually like, what the day contains hour by hour, and the photographs to prove it.
**Needs from you: the Fayoum shoot photographs, and roughly what time you leave and
return.**

**3. "What actually happens on a Giza rooftop shoot": the honest walkthrough.**
This is the piece nobody else can write and everybody searching wants. Arrival time,
why it is before the gates open, how long you are in the dress, what the assistant
does, what the wind does, when the photographs arrive. Links naturally to both the
Pyramids Rooftop and Sand Dunes products.
**Needs from you: nothing you have not already told me, plus behind-the-scenes frames
if any exist.**

### Tier 2: the cluster that compounds

Four pieces, each answering a question the Greece/Turkey guides answer for their own
destination and nobody answers for Egypt:

4. **What to wear, and what to wear underneath**. The single most-asked practical
   question in this category, and the one every competing guide covers.
5. **Choosing your colour**. You have twelve. This is a genuine decision customers
   agonise over, you now have a photograph of each, and it is the most natural
   gallery piece on the site. It also sends people straight into the wardrobe.
6. **When to come: light, wind and season in Egypt**. The only one of these that is
   truly Egypt-specific and defensible. Golden hour, gate times, the windy months,
   what summer actually means at Giza.
7. **Giza, the dunes, or Fayoum: choosing your location**. A comparison page that
   catches people who know they want this but not where, and routes them to a product
   rather than leaving them to an OTA.

### Tier 3: once the above is live

8. Men's gawn shoots and couples' sessions. Currently your thinnest content and a
   real differentiator, but **blocked on photographs you do not yet have**.
9. The rental and accessories services as standalone pages. **Blocked on prices you
   have not yet set**.
10. Real reviews, with Review schema. **Blocked on you collecting them.** Worth
    starting now: ask every client, as the photographs land, in one line.

### What I am explicitly NOT recommending

- **No blog for the sake of a blog.** Ten good pages beat fifty thin ones, and thin
  pages on a small site actively hurt.
- **No keyword-stuffed location pages** ("flying dress photoshoot Cairo Giza Egypt
  pyramids"). CLAUDE.md §7 rules this out and so does Google.
- **No AI-written filler.** The entire advantage here is that you do this work and
  nobody writing these guides does. Generic text throws that away.
- **No chasing the OTA transactional terms head-on.** You will lose, and the money is
  better spent on ground they cannot take.

---

## 3. The gallery system

### What exists today (**Verified**)

- `Scene.tsx`, one image, or a designed, labelled absence of one. Good component,
  does its job, enforces the no-fake-photos rule.
- `.fd-lightbox` CSS exists (11 rules) but is wired only into `Wardrobe.tsx`.
- The home page gallery was, until this week's commit, a hand-built grid that had
  drifted out of step with its own caption.

So there is no reusable gallery. There is one bespoke lightbox and a lot of
hand-placed figures. **The right move is to extract what the wardrobe already does,
not to invent something new**. It is proven in the one place it runs.

### What I propose

One component, `<Gallery>`, that takes a list of frames and a layout, with the rules
that keep this site honest baked in rather than left to whoever edits the page next:

- **Every frame is a registry entry**, not a path typed into a page. Captions,
  credits and alt text travel with the photograph, so a caption cannot drift from its
  picture the way the home page's did.
- **A missing photograph renders as a labelled gap**, via `Scene`. This is the rule
  that stops temporary imagery quietly becoming indistinguishable from your real
  client work, and it must survive into the gallery.
- **Landscape by default**, per your instruction, with portrait available where a
  photograph genuinely needs it.
- **Three layouts, not infinite**: `grid` (the even wall, what the home page now
  uses), `feature` (one large frame with supporting ones), and `strip` (a horizontal
  run for a sequence). Three is enough to tell every story on this site and few
  enough that they stay consistent.
- **Lightbox optional per gallery**, keyboard-navigable, extracted from the wardrobe.
- **Counts derived, never typed.** "Four of these six frames are ours" is computed
  from the array. This is exactly the bug that shipped on the home page.
- **A check script asserts the rules**, proven by breaking each one, per CLAUDE.md
  §4. Specifically: no gallery may reference a photograph that is not in the
  registry, and no real photograph may be unattributed.

### What I would need to decide with you

Whether galleries are editable in Sanity Studio or stay in code. **This matters more
than it sounds.** CLAUDE.md §3 is explicit that a Sanity document replaces the content
file wholesale, and a field present in the content file but missing from the Studio
schema becomes silently empty in production, and that has already caused one incident
here. So: code-only is safer and I can ship it; Sanity-editable means you can change
galleries yourself without me, but the schema has to be built carefully and in step.
**My recommendation: code-only for now, Sanity once the content has settled.**

---

## 4. How to give me your photographs

This is the part that will otherwise block everything above, so here it is concretely.

### The way that worked, and should stay the way

**Google Drive, shared directly with `mars.mproduction@gmail.com`.**

Last time, the folder was owned by `egypteyetravelandtours@gmail.com` and shared by
link. A link-share does not make a folder findable by a different account, so I could
not see it until you shared it explicitly. **Share to that address, do not just copy a
link.**

### How to organise it so I can use it without asking you questions

One folder per batch, and inside it:

```
2026-10-fayoum-shoot/
  raw/                     ← anything, any size, straight off the camera
  README.txt               ← optional, but see below
```

That is genuinely all the structure I need. **Do not rename, resize, crop or sort the
files.** I will do all of that, and originals at full resolution are strictly better
input. I can always make a web image smaller, never larger. Several of the current
photographs are 800px on the long edge, which is why none of them is used full-bleed.

### The three things I cannot get from a photograph

If a `README.txt` exists, these are what belongs in it. Without them I have to either
ask you or leave the frame uncaptioned:

1. **Who is in it, and may we publish them.** Model release status. If you are not
   certain for a given shoot, say so and I will not use those frames. This is the one
   I will never guess at.
2. **Where and roughly when.** "Fayoum, white desert, March 2026." Enough for a true
   caption.
3. **Anything that is not what it looks like.** A styled test shoot, a staff member
   rather than a client, a dress you no longer own. These must not be presented as
   client work, and I cannot tell by looking.

### The video, specifically

One landscape file, as long as you like, highest quality you have. I handle the
compression. The current hero ships as three encodes (H.264 for the world, VP9/WebM
for browsers without the H.264 licence, and a 1.2MB cut for phones) plus a poster
frame. You supply one file.

### Two things still waiting on you from last time

- **A thirteenth colour folder, "Pink"**, which is not in the twelve-dress wardrobe.
  Is it a new dress, a retired one, or not yours? It is currently unused.
- **Gawn photographs.** The men's wear has five products and no pictures, which is
  why its pages are the thinnest on the site.

---

## 5. What I would need, and what I cannot do

**Honestly stated, because the brief asked for it.**

| I do not have | What it would change |
|---|---|
| Google Search Console | The single biggest gap. It is free, it is yours, and it would replace every **Estimate** above with your actual queries, impressions and positions. **If you do one thing from this document, connect this.** |
| Any keyword tool | No search volumes. This is why there are none here. |
| Google Analytics | No idea which pages convert, or where people leave. |
| Your OTA dashboards | No idea what converts on Expedia/Airbnb, which is your best available proxy for demand. |
| Your commission rates | The 20 to 30% above is an industry estimate, not your contract. |

**What I cannot do at all:** promise rankings, promise timelines for rankings, or tell
you what any keyword's search volume is. Anyone who does is guessing with more
confidence than I am.

**What this document is worth without those tools:** the structural findings (1.1,
1.2, 1.3) do not depend on volume data and I stand behind them. The prioritisation in
section 2 is my judgement and would improve materially with Search Console.

---

## What I need from you to start

Nothing here is built. Tell me which of these to do and I will start there:

1. **Tier 1 only.** OG images, the Fayoum page, the Giza walkthrough. Smallest
   commitment, highest certainty.
2. **Tier 1 + the gallery system.** The above, plus the reusable component, so every
   later piece has somewhere good to put pictures.
3. **The full Tier 1 and 2 programme.** Seven pieces plus the gallery. Largest, and I
   would want Search Console connected before committing to the ordering.
4. **Something else entirely.** If your read of the business says I have the
   priorities wrong, say so. You know things about this market that I cannot see from
   the code.

And separately, whenever convenient: connect Search Console, and answer the Pink
folder.
