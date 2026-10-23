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

## Priority 0 — the logo and the covers

### The name is settled, and the artwork disagrees with it

You confirmed the agency is **Flying Dresses Egypt** — plural. Two of the three
brand files you sent say something else:

| Asset | Reads | Correct? |
| --- | --- | --- |
| Logo (brown and cream versions) | FLYING DRESS **Egypt** | ✗ singular |
| Social cover, olive | THE FLYING **DRESSES** OF EGYPT | ✓ |
| Social cover, brown | FLYING DRESS **Egypt** | ✗ singular |

**The site now sets the wordmark as live text rather than using the artwork**,
so the header and footer read "FLYING DRESSES / *Egypt*" — the right name, in
the logo's own layout: letterspaced serif capitals with the script overlapping
beneath, in the logo's red-brown and dusty rose.

That turned out to be better than waiting for a corrected export. It is sharp
at every size, costs no image request, recolours itself for the dark footer,
and is readable by a screen reader. **Nothing is blocked** — but the logo files
themselves still need re-exporting with the plural for use anywhere off the
website: Instagram, printed material, email signatures, the brown cover.

### If you do re-export, the site will use it

Drop the corrected files in and they take precedence over the text wordmark
automatically, with no code change:

| Put the file here | Which version |
| --- | --- |
| `public/brand/flying-dresses-logo.png` | Brown/rose, for the light header |
| `public/brand/flying-dresses-logo-light.png` | Cream, for the dark footer |
| `public/brand/flying-dresses-cover.jpg` | A social cover, 1200×630 |

PNG with transparency for the logos; SVG is better still if you have it.
If only the dark logo is added, the footer keeps the text wordmark rather than
putting a dark logo on a dark background where it would vanish.

### The cover is worth adding first

Right now, pasting a link to this site into WhatsApp, Instagram or Facebook
renders a bare grey rectangle. **The olive cover is the one to use** — it is
the one with the correct plural name — exported at 1200×630 so the name is not
lost to the platform's crop. One file, and every shared link gets a proper
card. For a business that sells through WhatsApp, that is not a small thing.

### The site's palette now follows your covers

The covers sit on a warm brown and an olive with cream type over flowing silk.
The site's dark was effectively black, which read colder and harder than
anything else the brand puts out, so it is now the covers' brown. The sampled
value was slightly too light to carry text safely, so it is that brown
darkened — same hue, and every text pairing measured above the accessibility
minimum.

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
