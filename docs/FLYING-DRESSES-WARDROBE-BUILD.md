# The thirteen wardrobe pages: what the build found

22 November 2026. Built, checked and pushed. **Not yet deployed to production
by me** — it is on all three branches, so it goes live on the next deploy of
`flying-dresses-production`.

Live URLs: `/wardrobe/cherry`, `/wardrobe/emerald`, `/wardrobe/navy`,
`/wardrobe/black`, `/wardrobe/verdant`, `/wardrobe/ginger`, `/wardrobe/snowy`,
`/wardrobe/golden`, `/wardrobe/bronzey`, `/wardrobe/aqua`, `/wardrobe/lavender`,
`/wardrobe/hot-pink`, `/wardrobe/orchid`.

---

## Three things I need you to look at

### 1. The Navy swatch and the Navy dress are not the same colour

`outfitCollection.ts` stores Navy as `#1e2a4a`, a very dark navy. **All twelve
photographs in the Blue folder show a vivid royal blue.** Sampling the lit face
of the fabric across all twelve lands near `#3f548b`.

This is not a mapping error. You confirmed Blue maps to Navy on 20 November and
nothing here changes that. It is the swatch that looks wrong, and the Hot Pink
comment in that file says its hex was "sampled from the dress itself rather
than picked by eye", which implies the others were not.

It matters because the live `/wardrobe` index renders that swatch, and a
customer choosing "Navy" from a dark navy square will be handed a bright royal
blue dress.

**I have not changed it.** You told me not to rename or relabel dresses on
assumption, and the hex is read by the Egypt Eye booking picker as well as by
this site. Three options:

- correct the hex to the photographed colour and leave the name alone;
- leave both and accept the mismatch;
- tell me the stored hex is right and the Blue folder is a different garment,
  which would reopen the mapping.

The dress page itself sidesteps it: it shows six photographs and describes the
colour as photographed, and renders no swatch at all.

### 2. One frame was rejected on provenance, and it is the useful kind

A Fayoum frame of the Ginger dress carries `c2pa.edited` plus
`compositeWithTrainedAlgorithmicMedia` and an Adobe Firefly manifest. By your
four classes that is **edited photography, not generated**, so it is not barred
from the site. But it belongs with the retouched population this repo keeps
under `/shoots/retouched/` with a credit that says so, not in a product gallery
of straight client photographs.

Dropped. Ginger keeps five frames and loses nothing. Flagging it because it was
the only one of 62 that tripped, and because it was the only Fayoum frame in
any colour folder.

### 3. Nine frames have no client session recorded

Nine of the sixty-one arrived as `IMG_nnnn` with no name in the filename. They
are plainly this team's work on this roof, but nobody recorded whose session.

The pages count **named sessions only** when they say "photographed on N
different people", so those nine do not inflate the number. If you can identify
any of them, three pages get a better claim:

| Page | Named sessions | Unattributed frames |
|---|---:|---:|
| Lavender | 1 (Julia) | 1 |
| Orchid | 1 (Fran) | 1 |
| Golden | 1 (Milya) | 0 |

---

## What is on each page

Eleven blocks, as specified, with two changes made during the build.

**No colour swatch.** Specified as block 2; dropped. Every page carries real
photographs of the garment, a hex square beside a photograph adds nothing, and
for at least one dress the two disagree. One source of truth, and it is the
photograph.

**No "mix of portrait and landscape".** The spec sold native aspect ratios as a
differentiator. **All 61 frames are 3:2 landscape**, because every original was
shot horizontally, so there is no mix to show. The dimensions are still
declared per frame and the gallery still renders them uncropped, which was the
real point; the claim that it would look like a varied lookbook was wrong and I
have taken it out.

**No `Product` schema.** We sell a session that includes the dress, not the
dress. Marking thirteen garments up as purchasable products would be a schema
claim that does not match what anyone can buy. Breadcrumbs only.

---

## The archive, honestly

| Dress | Frames used | Named sessions | Folder held |
|---|---:|---:|---:|
| Cherry | 6 | 5 | 15 |
| Aqua | 6 | 5 | 15 |
| Navy | 6 | 5 | 12 |
| Black | 6 | 2 | 10 |
| Ginger | 5 | 5 | 10 (1 rejected) |
| BronZey | 5 | 3 | 10 |
| Hot Pink | 5 | 2 | 5 |
| Emerald | 4 | 4 | 8 |
| Golden | 4 | **1** | 10 |
| Verdant | 4 | 4 | 4 |
| Snowy | 4 | 3 | 4 |
| Orchid | 4 | **1** | 4 |
| Lavender | **2** | **1** | 2 |

Three pages say out loud that they cannot show a range: Golden (one session,
ten frames of it), Orchid (three of four frames from one session) and Lavender
(two frames, the whole archive). The check script fails the build if a page in
that position drops its note.

**Golden is the weakest page and the easiest to fix.** It is a good colour with
ten frames of one customer on one evening. One more session in that dress would
lift it more than anything else in this batch.

---

## What the check script now enforces

Twelve assertions, each proven by breaking it and watching it go red:

1. Every dress has a page; every page is a real dress.
2. Between two and six frames per page.
3. A page with fewer than two named sessions must carry a note saying so.
4. A page must have at least one named session.
5. Every referenced frame exists on disk.
6. No frame file is used by two dresses.
7. Every frame carries an EXIF block.
8. No frame carries a generative provenance assertion.
9. Declared dimensions match the file.
10. Related dresses are real and never the page itself.
11. No orphan files in the directory.
12. The price appears once, in one shared note, and never in a page's prose.

Two of those comments were corrected after the break test disagreed with what I
had written, which is the whole reason for the rule:

- the generative-assertion guard catches a file dropped in by hand, but **not**
  one laundered through the Pillow resize, because that re-encode drops the
  C2PA segment. Said so in the comment rather than implying it is airtight.
- the named-sessions guard does **not** catch a fabricated session name. Two
  names is two names as far as code can tell. I had claimed otherwise; the
  break test came back green and the comment now says what is true.

---

## Verified, not assumed

Rendered all thirteen against a local dev server: 200 each, correct canonicals
in short form, correct counted headings, notes present on the three thin pages,
images served, a non-dress slug 404s, thirteen links on the index, thirteen
entries in the sitemap. `tsc`, `lint` and all 45 checks green.

`next build` still cannot finish in this sandbox for the usual DNS reason
(CLAUDE.md §8), so the deployed pages are worth a look once they are live.
