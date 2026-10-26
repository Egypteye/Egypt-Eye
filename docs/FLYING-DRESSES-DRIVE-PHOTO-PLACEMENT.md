# The October 2026 Drive folder: what went on the site, and what did not

The brief was "get all photos from the drive link to each part of the website,
leave photos blank that you don't feel like that these are not accurate."

This is the record of that second half. Everything below is checkable: the
provenance claims come from the files' own bytes, not from folder names.

## What the folder contained

Seventeen folders under `Content/`. They divide cleanly into two kinds, and
the division is not a judgement call.

### Camera originals, from named client shoots

6000x4000 or 4000x6000 JPEGs carrying `copyright=EGYPT.EYE` in EXIF and an
Adobe export tag. These are the agency's own work.

| Folder | Frames | What it actually shows |
|---|---|---|
| Pyramids Rooftop Proposal | 49 | **Two** real proposals on the roof: one under a red floral heart with "Will You Marry Me" in gold, one under a white arch on dressed steps. Ring box open in both. |
| Pyramids Proposal | 50 | A proposal on the Giza **plateau**, on the sand. Not the roof. |
| Rooftop Anniversary | 28 | The Alessandra shoot already on the site, in full. Black tie and lace, kilim cushions, pyramids. |
| Gender Reveal / Kayan Event | 16 | The Kayan reveal already on the site, in full, including the frame that shows the **answer** ("Girl"). |
| Fayoum Oasis / Nayma | 36 | The Fayoum shoot, July and September 2024. |
| Pyramids Rooftop | 50 | Rooftop sessions. |
| Nine Pyramids Photoshoot | 50 | The Nine Pyramids site. |
| Jumping Horses Photoshoot | 50 | Horses. **Egypt Eye Travel's product, not this brand's** — see `assets.ts`, which fails a check if a horse frame is referenced from Flying Dresses again. |

### Generated images, created the same afternoon

1536x1024 PNGs, about 2MB each, with titles in the house style of an image
generator ("Golden Hour DJ Set by the Pyramids", "Rooftop Birthday Beneath the
Pyramids"). Their bytes carry C2PA provenance naming **OpenAI**, **gpt-image**
and **trainedAlgorithmicMedia**.

| Folder | Files | The gap it would have filled |
|---|---|---|
| Birthdays and private celebrations | 1 | The birthday category photograph |
| Maternity and family portraits | 5 | The maternity category photograph and three labelled gaps |
| DJ, music and rooftop production | 6 | The music category photograph |
| Creator, editorial and brand shoots | 4 | The creators category photograph |
| The Red Sea Yacht Experience | 1 | `empty.redSeaYacht` |

There is one of these for **every single gap the site still had**. That is not
a coincidence, and it is worth saying plainly: they are good images, and they
were clearly made to help.

## What was placed

Eight frames, all from the camera originals.

| File | Where | Says what it is |
|---|---|---|
| `proposal-heart-arch.jpg` | The **proposals category** photograph, large and uncaptioned | The sign is in frame. Nobody has to be told. |
| `proposal-heart-ask.jpg` | Proposal page gallery, lead | "The moment itself, under the heart arch." |
| `proposal-heart-ring.jpg` | Proposal page gallery | "A few seconds later, the ring on her hand." |
| `proposal-white-ask.jpg` | Proposal page **hero** | The second proposal, white arch. |
| `proposal-white-train.jpg` | Proposal page gallery | "The same roof dressed in white for a second proposal." |
| `proposal-plateau-ask.jpg` | Proposal page gallery | **"Not the roof: this one was asked down on the plateau, on the sand."** |
| `gender-reveal-girl.jpg` | Gender reveal gallery, lead | "The answer, at the same gender reveal. A girl." |
| `gender-reveal-couple.jpg` | Gender reveal gallery | "The parents at the lit letters as the sun went down." |

The proposal page used to open by admitting it had never photographed a
proposal. It has three now, and the assertion in `check-flying-dresses.mts`
that required that disclaimer has been **inverted**: the page now fails the
check if somebody restores the sentence, because it is false.

## What was left blank, and why

The five generated images were not installed anywhere.

The reason is not that generated imagery is banned on this site. It is not:
the thirteen accessory frames and the dress collection frame are generated,
they sit in `kind:"styled"` slots, and they say so. That was agreed on a
specific basis, in the owner's words: the jewellery was *photographed*, the
pieces render identically to the real ones, and delivering the exact piece
shown is the business's responsibility. The generated part is the model and
the setting around a real product.

A generated birthday, maternity session, DJ set, creator shoot or yacht is a
different claim. There is no real product in the frame rendering identically
to anything. What the picture asserts is **that we have done this work**, and
an uncaptioned photograph at the top of a category page is the strongest form
of that claim the site makes. That is the one thing the brief says never to
do: never present AI-generated imagery as real client work.

So those five categories keep the designed labelled gaps they had before. The
gaps are not an embarrassment to be padded out; they are the site saying, in
public, which work it has photographed and which it has not.

`scripts/check-flying-dresses.mts` now enforces this by reading the **bytes**
of every file in a `kind:"agency"` slot and failing if it finds generated-media
provenance. A filename list can be edited; a C2PA manifest cannot be argued
with.

### If you want these images on the site anyway

That is a reasonable thing to want, and there is an honest way to do it. Any
of them can go in as `kind:"styled"`, in a clearly captioned "how it could
look" context, labelled as an illustration rather than a photograph, and kept
off the category cards and out of the galleries that read as portfolio. Say
the word and it is a small change.

What cannot happen is one of them sitting uncaptioned above "Birthdays and
private celebrations" as though it were a party we ran.

## Still genuinely missing

The real folders do not contain, anywhere:

- A birthday, a maternity or family session, a DJ set, a creator shoot, or the
  Red Sea yacht. The five gaps are real gaps.
- A dress and a gawn in one frame (`empty.couple`).
- The five gawns together (`empty.mensGawn`).
- The accessory collection in one landscape frame (`empty.accessories`).

Four of the remaining folders (Pyramids Rooftop, Nine Pyramids, Fayoum/Nayma,
Rooftop Anniversary) hold roughly 160 more real frames than the site currently
uses. They are not missing, they are unplaced, and they are the obvious next
pass.
