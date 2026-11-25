# Proposed change to a live page: `choosing-a-dress-colour`

25 November 2026. **Not applied.** You asked to see proposed changes to
existing pages before they are made, so this is the whole change, written out.

---

## Why this instead of writing D6

The content map has **D6, "Choosing a colour for the photographs you actually
want"**, as a new article at a new URL. I no longer think we should write it,
and the reason is the live article it would sit next to.

`/stories/choosing-a-dress-colour` already covers that ground, and Search
Console says it is working: **position 4.48**, the best-ranking story on the
site. Publishing a second article about choosing a colour would split that
between two of our own pages, which is the exact mistake I spent a week
arguing we should not make between Egypt Eye and Flying Dresses.

So: **expand the one that ranks, do not create a rival.** This also folds in
D1, which I had already recommended as an expansion rather than a new URL.
Two planned articles become one improved page, and the P1 list gets shorter
rather than longer.

---

## The problem this fixes, in one number

The thirteen wardrobe pages went live on 22 November. **Not one story on the
site links to any of them.** Their only inbound links are the wardrobe index
and the sitemap.

Meanwhile this article names the thirteen dresses **39 times** and links to
none of them, because when it was written there was nothing to link to.

That makes it the single highest-leverage page on the site right now: it
already ranks, it already names every dress, and turning those names into
links is what tells a search engine the thirteen new pages matter.

---

## Change 1: link every dress name to its page

No wording changes. The named dresses in "The ones that separate" and "The
ones that need thought" become links, first mention only in each section, so
the prose does not turn blue.

**Before**

> Cherry and Orchid are the strongest performers against stone.

**After**

> [Cherry](/wardrobe/cherry) and [Orchid](/wardrobe/orchid) are the strongest
> performers against stone.

Applied the same way to Emerald, Verdant, Aqua, Navy, Black, Lavender, Snowy,
Golden, Ginger and BronZey in their existing sentences. Hot Pink is named once
in the opening list and gets its link there, along with the other twelve.

**Thirteen links out, one per dress, from a page at position 4.48.**

---

## Change 2: a factual correction about Navy

This is the part that needs your eye, because it contradicts something the
page currently says.

**The article says:**

> Navy and Black are the most reliable choices of all for a wide landscape
> shot, because the separation does not depend on colour at all. They work as
> shape.

That is true of Black. It is **not** true of the dress we call Navy. I looked
at all twelve frames in the Blue folder while building the wardrobe pages, and
sampled the lit face of the fabric across them: it is a vivid royal blue, near
`#3f548b`, not the dark `#1e2a4a` navy the swatch claims. It separates very
strongly on hue. Describing it as working "as shape" sends someone who wants a
dark, graphic silhouette to the wrong dress.

**Proposed replacement:**

> Black is the most reliable choice of all for a wide landscape shot, because
> the separation does not depend on colour at all. It works as shape, and it
> is the one that takes the hottest midday sun least comfortably, which is
> worth weighing against the hour you are shooting.
>
> Navy is the surprise of the group. The name suggests something dark and
> quiet; the dress photographs as a vivid royal blue, and blue is the one
> colour the plateau cannot answer. It separates on hue as strongly as Cherry
> does, and it is the most consistent dress in the collection across weather:
> hazy or clear, early or late, it reads the same blue.

This is the same correction the Navy wardrobe page already makes, so applying
it here keeps the two agreeing.

**It also leaves the swatch question open**, which is yours:
`outfitCollection.ts` stores `#1e2a4a` and the wardrobe index renders it. A
customer choosing Navy from a dark square still gets a royal blue dress.

---

## Change 3: one new section, which is all D6 was for

Added after "The ones that need thought", before "If you genuinely cannot
choose".

> ### Or choose on the photograph you want
>
> Everything above is about what separates from the background, which is the
> right question if you want the dress to be the subject. It is not the only
> question worth asking.
>
> If you want the picture to be **loud**, pick from the saturated end and
> accept that the dress wins the frame: Cherry, Orchid, Hot Pink, Aqua,
> Emerald. In a photograph from any of those, the plateau is the setting and
> the dress is the subject.
>
> If you want the **pyramids to carry the picture** and the dress to belong to
> the scene, the warm tones do that: Golden, Ginger, BronZey, and Snowy in its
> own tonal way. They are not weaker choices, they are a different photograph,
> and they are the ones most often chosen by people who came for the place
> rather than for the dress.
>
> If you want the photograph to work **whatever the sky does on the day**, Navy
> and Aqua are the two that hold their colour in any light. That matters more
> than it sounds when you are booking from abroad and cannot pick your weather.
>
> And if you simply like a colour, wear it. Every one of the thirteen has
> produced photographs people were delighted with, the choice costs nothing,
> and the one thing that is visible in a frame is whether somebody is
> comfortable in what they are standing in.

Each dress name there links to its page too.

---

## Change 4: two metadata lines

`related` gains the wardrobe index entry it already has, plus nothing new.
`inboundFrom` gains `/wardrobe/cherry` ... `/wardrobe/orchid`, so each of the
thirteen dress pages carries a link back to this article. That is the return
leg: the hub points at thirteen pages and thirteen pages point at the hub.

---

## What does not change

The title, the slug, the URL, the meta description, the FAQs, the price
statements, and the four existing sections apart from the Navy sentence and
the added links. Nothing about what the business sells changes.

---

## What I need

1. **Approve the three content changes** (links, the Navy correction, the new
   section), or tell me which to drop.
2. **The Navy swatch**: correct the stored hex to the photographed colour,
   or leave it and accept the mismatch on the wardrobe index.
3. **Confirm D6 is dropped** from the content map, which takes the P1 list
   from fourteen articles to thirteen.
