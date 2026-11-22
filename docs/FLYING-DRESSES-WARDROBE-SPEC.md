# The thirteen wardrobe pages

20 November 2026. **For approval before any URL is created.**

You approved thirteen pages in principle and asked to see the exact URLs and
the page structure first, and said they must be proper commercial collection
pages rather than thin SEO landing pages. This is that specification.

---

## 1. The exact thirteen URLs

Slugs match the existing `outfitId` in `src/content/outfitCollection.ts`, so
the enquiry pre-fill, the Egypt Eye booking picker and these pages all agree
on one identifier. Nothing is renamed.

| # | Dress | URL | Hex | Drive folder |
|---:|---|---|---|---|
| 1 | Cherry | `/wardrobe/cherry` | `#9d2235` | Red |
| 2 | Emerald | `/wardrobe/emerald` | — | Em. Green |
| 3 | Navy | `/wardrobe/navy` | — | Blue |
| 4 | Black | `/wardrobe/black` | — | Black |
| 5 | Verdant | `/wardrobe/verdant` | — | Green |
| 6 | Ginger | `/wardrobe/ginger` | — | Ginger |
| 7 | Snowy | `/wardrobe/snowy` | — | White |
| 8 | Golden | `/wardrobe/golden` | — | Gold |
| 9 | BronZey | `/wardrobe/bronzey` | — | Bronze |
| 10 | Aqua | `/wardrobe/aqua` | — | Aqua |
| 11 | Lavender | `/wardrobe/lavender` | — | Purple |
| 12 | Hot Pink | `/wardrobe/hot-pink` | `#fc1356` | Pink |
| 13 | Orchid | `/wardrobe/orchid` | — | Magenta |

**Route.** `/wardrobe` stays as the collection index. The pages are a new
`[slug]` segment beneath it, the same pattern `/experiences/[slug]` and
`/celebrations/[slug]` already use.

**Yellow is not here.** Thirteen dresses, thirteen pages, and the Yellow
folder still maps to nothing until you say what it is.

---

## 2. What goes on each page

Eleven blocks. Every one of them is filled from something that already
exists; none of them requires a fact nobody has given us.

### 1. Hero
One frame of the dress in motion on location, full bleed, portrait or
landscape at its native ratio. Not a flat garment shot. The first thing a
visitor sees should be the photograph they are buying, not the product.

### 2. The name and the colour in one sentence
**Built without the swatch.** The dress name as the `h1` and a single
sentence describing the colour as a photographer would: its depth, its
temperature, and what it is not. Cherry's reads "a deep crimson, darker and
cooler than a bright pillarbox red, and clearly distinct from Hot Pink".

### 3. The gallery: three to six real sessions
Frames from that dress's own Drive colour folder, each one a different client
session where the folder allows it. **Different people in the same dress is
the point** and it is the single most persuasive thing these pages can show:
it answers "will this look good on someone who is not a model" without
anybody having to claim it does.

Native aspect ratios, no cropping to a grid. Provenance checked per file
before placement, and nothing from the generated class.

### 4. What the colour does against this background
Two or three sentences, specific to the dress, on how it behaves against pale
limestone and sand, in hard sun and in haze. This is the part that cannot be
written from a swatch and is why these are not thin pages.

### 5. The cut and the fabric
Neckline, bodice, split, and the scale of the train. Honest about the fact
that the bodice is close-fitting and unremarkable and the train is what makes
the photograph.

### 6. Fit
One short block, linking to the live `one-size-cut-to-fit` article rather than
restating it. Adjustable, worn across a wide range of heights and builds in
the gallery above.

### 7. Where it works best
Which of the locations suit this colour, with links to `/experiences/
pyramids-rooftop`, `/experiences/fayoum` and the White Desert. Driven by the
same logic as the colour hub: warm earth tones want something behind them that
is not earth.

### 8. Which occasions choose it
Links through to the celebrations pages where the colour has a natural fit.
This is the block that turns a product page into a route to a booking.

### 9. Price, and what it includes
$199 per person for a flying dress session, stated plainly, with the assistant
and the directed session named. **The same for all thirteen**, and the page
should say so: there is no colour surcharge, and saying it removes a question
people otherwise have to ask.

### 10. Two or three related dresses
Chosen by how they behave in a photograph rather than by hue. Cherry's
neighbours are Orchid and Hot Pink on saturation, and Black and Navy on "what
else reads at distance".

### 11. The enquiry
Pre-filled with the dress, so a visitor who has decided does not retype it.

---

## 3. What makes these premium rather than thin

Three decisions, and they are the whole difference:

**Different people, same dress.** A stock product page shows one garment on
one body. These show six, because we have six. That is a fashion lookbook
move, not an SEO move, and no competitor can copy it without the archive.

**Uncropped frames.** The gallery renders each photograph at its own
dimensions rather than forcing it into a grid shape. *Correction after the
build:* I sold this as a portrait-and-landscape mix, and it is not one. All 61
frames are 3:2 landscape because every original was shot horizontally. The
frames are uncropped, which was the real point, but the varied-lookbook look
is not available from this photography.

**The colour written as a photographer sees it.** Not "elegant red, perfect
for your special day". Depth, temperature, how it holds in direct sun, what it
does in silhouette. It is the brand's actual expertise and it is the thing a
reader cannot get anywhere else.

---

## 4. Built on 22 November

All thirteen exist. Two blocks changed during the build and one data problem
turned up; see `docs/FLYING-DRESSES-WARDROBE-BUILD.md`, which supersedes the
constraints below.

## 4. Honest constraints, as written before the build

**Four dresses have thin folders.** Of the 106+ images, the Red, Pink and
Purple folders are well stocked and some others are not. Before building, I
will count frames per folder and tell you which dresses can carry six and
which can only carry three. A page with three strong frames is fine; a page
with three weak ones is not, and I would rather tell you than pad it.

**No fabric composition is published.** Nobody has told us what the fabric
actually is, so the pages describe how it behaves and photographs rather than
claiming a fibre content. If you can tell me, it goes in block 5.

**No rental or standalone hire price.** The Rent a Dress folder holds one
image and no terms have been given. These pages sell the session, not the
garment, until you say otherwise.

**Schema.** `Product` markup is tempting and wrong here: we are not selling
the dress, we are selling a session that includes it. I would mark these up as
part of the service offer rather than as thirteen purchasable products, which
is both accurate and keeps us clear of fake-schema territory.
