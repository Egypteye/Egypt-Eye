# Flying Dresses Egypt — photographs still needed

Ordered by what each missing photograph costs you, not by where it sits on the
page.

Every empty slot on the site renders as a **tinted panel with the intended
subject written across it and the words "photograph to come"**. That is
deliberate: the brief's rule — and the right rule for a photography brand — is
that temporary imagery must never become indistinguishable from your own work.
A stock desert photo in each gap would look finished and nobody, including you,
would be able to tell six months later which frames were real.

The slots are declared in one place, `src/app/flying-dresses/_lib/assets.ts`, and
`scripts/check-flying-dresses.mts` asserts that every non-empty one points at a
file that actually exists. So a path typo fails a check rather than shipping a
broken image.

---

## What the site has right now

**Two genuine flying-dress photographs**, both already published on
egypteyetravel.com's About page as creator collaborations:

| File | What it is | Size |
| --- | --- | --- |
| `/photos/about/briana-trip-flying-dress.jpg` | Blue gown, Egyptian desert, portrait | 533 × 800 |
| `/photos/about/cherry-travel-flying-dress.jpg` | White gown, desert dune, landscape | 800 × 533 |

**Four real Egypt location photographs**, used to show the *place* and never
captioned as flying-dress work: the Giza plateau, Sahara dunes, Giza on
horseback, and a Fayoum archway.

**Neither of the flying-dress files is used full-bleed**, because at 800px on
the long edge they are visibly soft stretched across a 1440px hero. They appear
at card and column size, where they hold up. This is the single biggest
constraint on how good the site can look.

---

## Priority 0 — the logo, which is two files away

You sent the logo in conversation, which does not put the files in the
repository, so the site is currently showing a **typeset wordmark** —
"Flying Dresses / EGYPT" set in the brand's display face — rather than your
actual mark.

**The code is already waiting for it.** Drop these two files in and the logo
appears in the header and the footer on the next deploy, with no code change:

| Put the file here | Which version |
| --- | --- |
| `public/brand/flying-dresses-logo.png` | The brown/rose version, for the light header |
| `public/brand/flying-dresses-logo-light.png` | The cream version, for the dark footer |

PNG with transparency, around 600–800px wide, is ideal. SVG is better still if
you have it — rename the paths to `.svg` in
`src/app/flying-dresses/_lib/logo.ts` if so.

If only the dark version is added, the footer keeps the typeset wordmark rather
than showing a dark logo on an ink background, where it would be invisible.

### One question about the logo

**The mark reads "FLYING DRESS" — singular.** The domain, the brochure and
every page of the site say "Flying Dresses" — plural. Both are defensible, but
they should not both be in use: the header would show one and the page text the
other.

Tell us which is the brand name and the site will be made consistent with it.
Changing the written name is a one-line edit in `src/content/flyingDresses.ts`.

### A note on the logo's colours

Your mark uses a deep red-brown and a dusty rose. The site's accent is a
darker antique gold, chosen and contrast-tested against all three background
tones so every label clears WCAG AA. The two are compatible — both warm and
desaturated — and the logo will sit comfortably as supplied.

If you would rather the site's accent matched the logo exactly, say so: it is a
single token change, but it needs the contrast re-measured afterwards, because
the dusty rose is far too light for text on an ivory background.

---

## Priority 1 — these change what the site can do

### 1. Higher-resolution originals of the two flying-dress photographs

**Why first:** these are the only genuine photographs of your actual product on
the entire site, and both are capped at 800px. At 2000px+ on the long edge they
could carry the hero, which is the first thing every visitor sees.

**What to send:** the original camera files, or the largest exports you have.

### 2. The rooftop shoot, vertical, dress mid-air

**Where:** the Pyramids Rooftop location panel on the home page, the hero of the
rooftop experience page, and the pinned rooftop story.

**Why:** the rooftop is your strongest commercial claim — the Giza site does not
open until 8am and a rooftop has no gate — and it is currently the one location
with **no photograph of the actual product at all**. The page makes the argument
in words and cannot show it.

**What to send:** portrait orientation, dress lifted, pyramids visible across
the skyline, shot in that 7am light. 2000px+ on the long edge.

### 3. The five gawns

**Where:** the men's-wear service page, the men's section of the wardrobe, and
the couples frame.

**Why:** five garments are named on the site and none is shown. Your brochure
numbers them 1–5 and repeats two of the style names, so the site cannot even
describe what makes each pair different (see
`docs/FLYING-DRESSES-OWNER-CONFIRMATIONS.md` §2.2). A couples' booking is two
per-person prices instead of one, and right now the page asks people to imagine
the garment.

**What to send:** each of the five photographed individually, ideally worn.
Portrait. Even phone photographs on a hanger would be a large improvement on
nothing.

### 4. A couples' frame — dress and gawn together

**Where:** the home page gallery.

**Why:** every competitor listing found in the research is implicitly
solo-female. A single photograph of two people makes the couples' shoot an
obvious product rather than a question, and it is the clearest route to doubling
a booking value.

---

## Priority 2 — these make the wardrobe sell

### 5. The twelve dresses, photographed individually

**Where:** the wardrobe grid, the wardrobe rail on the home page, the dress
strip on every experience page, and the lightbox.

**Why:** the wardrobe is currently **twelve colour swatches**. The pages say so
plainly rather than passing a circle off as fabric, but a swatch cannot show a
train, a sheen or how the fabric moves — and the dresses are the brand's best
asset. The research finding was that most competitors show one or two dresses;
showing twelve properly is a real advantage going unused.

**What to send:** each dress on a hanger or worn, consistent framing, portrait,
plain background. A consistent set of twelve ordinary photographs beats four
beautiful ones.

**Where they go:** Sanity Studio, under Outfits, against the matching dress. The
swatch disappears on its own once a photograph exists — no code change. The
dress ids are `cherry`, `emerald`, `navy`, `black`, `verdant`, `ginger`,
`snowy`, `golden`, `bronzey`, `aqua`, `lavender`, `orchid`.

### 6. Fayoum, with a dress in it

**Where:** the Fayoum location panel and that experience page.

**Why:** Fayoum is the most expensive shoot at $349 and the most
visually distinctive — pale dunes down to still water. It is currently
represented by a photograph of an archway. The page is asking for the highest
price with the weakest picture.

### 7. A dress packed for hotel delivery

**Where:** the dress-rental service page.

**Why:** rental-only is the new product and the biggest opportunity found in the
research. "Delivered to your hotel" is the part people need to believe, and one
photograph of a garment bag does that.

---

## Priority 3 — depth

### 8. Behind the scenes: the assistant handling the dress

**Where:** the home page gallery and the About page.

**Why:** the assistant is a genuine inclusion that competitors at the same price
do not list, and it is invisible in a finished photograph. A frame of someone
throwing the train is the proof.

### 9. The accessory collection

**Where:** the accessories page, which currently shows no items at all.

**Why:** nobody has named a single accessory, so there is nothing to photograph
yet. See `docs/FLYING-DRESSES-OWNER-CONFIRMATIONS.md` §2.1 — names first, then
photographs.

### 10. Sand dunes, with a dress in it

**Where:** the Sand Dunes panel, currently a real Sahara dunes photograph with
no dress in it.

**Why:** lowest priority of the three locations because the two genuine
flying-dress photographs are both desert frames, so this location is the one
already represented by real product work elsewhere on the page.

---

## How to send them

Whatever is easiest — a shared drive link, WhatsApp, or straight into Sanity
Studio.

**Dress and gawn photographs should go into Sanity Studio** under Outfits,
against the matching garment. Those appear on both this site and the Egypt Eye
photoshoot pages the moment they are uploaded, with no code change and no
deploy, because both brands read one wardrobe.

**Location and gallery photographs** need placing into the slots in
`src/app/flying-dresses/_lib/assets.ts`, which is a small code change — send
them and say which slot each is for.

---

## A note on what is not in these gaps

No competitor's photography has been used anywhere, and no AI-generated image.
Every photograph on the site is either your own work or an openly-licensed Egypt
location photograph that was already in use on egypteyetravel.com. The empty
slots are empty on purpose.
