# The Boutique

The shopping section, and the decisions behind it.

## Why it is not a shop

The brief's own framing — *"I can arrange something special from Egypt before I
even arrive"* — is not an ecommerce promise. It is a concierge promise, and the
difference decides the whole design.

A shop competes on catalogue breadth, price and delivery. Egypt Eye cannot win
any of those against Etsy, and should not try. What Egypt Eye has that no
souvenir seller has is **the traveller's arrival date**. That single fact is
the product: a piece can be chosen weeks ahead, made while the traveller is
still at home, and be finished and waiting on the day they land.

So the section is built around the trip, not around a cart. Every page answers
"when in my journey does this happen" before it answers "what does it cost".

## Naming

**The Boutique**, at `/boutique`, with **Shop & Collect** as the label above
the name and *"Take a little piece of Egypt home."* as the slogan.

It launched as **Take Egypt Home** at `/take-egypt-home` and was renamed
because that name read as generic and under-commercial — it described a
feeling, and a section that sells needs to read as a place you can buy from.
"The Boutique" is a shop without being a souvenir shop, and carries the price
level the pieces actually sit at. "Shop & Collect" sits above it as an eyebrow
rather than inside brackets, because it is the mechanic — buy it now, collect
it there — and a mechanic reads as a service.

Deliberately NOT leaned into: anything heavier on ancient Egypt. The pieces
are already cartouches and papyrus; the frame around them earns its premium by
being modern and restrained, not by adding more pharaoh.

Rejected earlier, and still rejected: *Egyptian Treasures* — the site's own
tagline is already "Unveiling Egypt's Treasures", and reusing it for a shop
blurs the brand's main line. Plain *Shop* and *Egypt Eye Shopping* describe the
mechanism with none of the price level.

### The rename, and why the old URL still works

`/take-egypt-home` and `/take-egypt-home/:category` 301 to their `/boutique`
equivalents, in English and in all five prefixed locales — four rules in
`next.config.ts`. A 301 tells Google the page moved rather than vanished, so
the ranking the old address earned transfers, and any link already shared still
arrives somewhere real. The internal names did **not** change: every Sanity
document is still typed `treasureProduct`, `treasureCategory` or
`treasureLandingPage`, and renaming a `_type` would orphan the lot.

Category routes carry the search terms rather than the brand:

| Route | Head terms |
|---|---|
| `/boutique` | what to buy in Egypt, authentic Egyptian souvenirs, gifts from Egypt |
| `/boutique/cartouches` | Egyptian cartouche, gold/silver cartouche, name in hieroglyphs |
| `/boutique/papyrus` | personalised Egyptian papyrus, custom papyrus |
| `/boutique/clothing` | Egyptian clothing, traditional Egyptian clothes |
| `/boutique/essence-oils` | Egyptian perfume oils, essence oils, alcohol-free |

## The two journeys, and why they are the top-level split

Every category page states both paths before it shows a single product, because
which one a visitor is on changes what the page should even offer them:

- **Before you arrive** → choose, personalise, reserve, collect on arrival.
- **Already in Egypt** → check what is in stock, book an appointment, visit,
  try, buy.

The second path is the honest one for clothing and fragrance, where size and
scent cannot be chosen from a screen. Pretending otherwise would produce
returns and disappointment, so those two categories lead with the appointment
and treat the website listing as a preview.

## What is deliberately NOT built

**No checkout.** Deposits are taken by PayPal on photoshoots and experiences
now, but nothing here is priced until it is specified — a cartouche depends on
metal and name length, clothing on a fitting — so there is no amount a cart
could charge. This section stays request-then-confirm. Every CTA is
reserve, enquire, or book an appointment. Building a cart would have been the
single biggest way to make this feel bolted on.

**No per-product pages.** Fifty product URLs with no prices, no materials and
no photographs would be fifty thin pages competing with each other and with the
category page that should rank. Products are cards on their category page and
open a reservation with the piece preselected. When the real catalogue exists —
with specs, weights and photography — per-product pages become worth adding,
and the content model already carries the fields for them.

**No Product or Offer structured data.** Offer markup requires a price and an
availability status. Inventing either is a manual-action risk, not a rich
result. The pages carry BreadcrumbList and FAQPage, which are true today.

## Placeholders

Every sample listing carries `placeholder: true`. That flag:

- renders a visible "Sample listing" marker on the card,
- keeps the item out of any structured data,
- and fails `npm run check:treasures` if the catalogue is ever marked ready
  while placeholders remain.

The sample set is deliberately small. The brief asks for roughly 20 cartouches,
20 papyrus designs and 5 each of clothing and oils; shipping fifty invented
products would be fifty business facts nobody has supplied. The model scales to
those numbers the moment real ones arrive — see "What I need from you".

## What I need from you

Nothing below is guessable, and none of it is invented anywhere in the code.

**Per product, for every category**

- name, short description, photograph
- price, or an explicit "price on request"
- production time
- what is included

**Cartouches** — four real designs are now in, from the Cartouches Collection
sheet: Khufu, Ramsis, Nefertiti and the Tutankhamun bracelet, with their
photographs and the metal each is made in. What that sheet does not state, and
what therefore appears nowhere on the site:

- price for each of the four
- karat of the gold, and the silver purity (925?)
- weight and dimensions
- hallmark / assay information, if any
- chain included or sold separately
- how many characters a cartouche can carry
- production time
- whether the two pendants shown in the Khufu photograph are one product or two

Also worth having: **the original product photographs.** The four on the site
were lifted out of the catalogue PDF at 300×400 and upscaled, which is fine on
a card and will not hold up on a larger layout.

**Papyrus**

- the real design list
- whether photo personalisation is done in-house or by a partner
- image requirements (minimum resolution, orientation)
- whether the customer approves a proof before production
- turnaround

**Clothing**

- the five featured pieces, with sizes actually stocked
- whether items can be reserved to try, or only viewed
- the partner shop: name, district, opening hours

**Essence oils**

- the five oils, with what each actually smells of
- bottle sizes sold
- which products are genuinely alcohol-free (claimed nowhere until confirmed)
- the Egypt Eye signature scent, if it exists

**Operational, across the section**

- where collection happens — hotel delivery, shop pickup, or handover with a guide
- lead time needed before arrival for a personalised piece
- deposit terms, if different from the site's standard 20%
- appointment availability and how far ahead it must be booked

**Do not send** photographs you do not hold the rights to. The sample images
are location and material photographs from Unsplash with credit recorded, and
none of them is presented as a product Egypt Eye sells.

## Claims the code refuses to make

Written down because they are the ones a shopping page reaches for by default:

- "100% natural", "chemical-free", "pure" — unverifiable, and regulated in
  several of the markets Egypt Eye sells to.
- "Airline safe" or any liquid-carriage promise. Container size, packaging and
  destination rules vary by airline and airport. The oils page carries a
  Travel Notes block written to hold verified guidance and, until then, to tell
  travellers to check with their airline.
- "Certified", "hallmarked", "authentic" for metals, until the assay
  information above is supplied.
- Any production time or collection promise.

---

# Managing it

Everything below is edited in the Studio at `/studio`. No deploy, no developer.

## Where each thing lives

| What | Where |
|---|---|
| Products — add, edit, hide, reorder, delete | **The Boutique — Product** |
| Prices, sale prices, "on request" | Each product's **Price**, plus per-variant prices |
| Product photos, gallery, alt text, captions | Each product's **Main photo** and **Gallery** |
| Categories — name, hero, intro, FAQs, order, active | **The Boutique — Category** |
| Landing page — hero, copy, featured products, FAQs | **The Boutique — Landing Page** |

Reordering is the `Display order` number on products and categories: lower
comes first. Gallery images reorder by dragging.

## Why Sanity and not a new admin screen

The site already has a CMS with image upload, replace, delete, reordering,
hotspot cropping, alt text and references built in and already used for tours,
photoshoots and stories. Building a second admin on Supabase would have meant
reimplementing all of that, and leaving the team with two places to learn.

## The pricing model

One model, not four. The four categories look like they need different price
shapes — karat and weight, base plus personalisation, size, bottle — but what
they actually share is three ideas:

- **Variants** — the same piece at a different price. 18k or silver, 50ml or
  15ml, S/M/L. Each carries its own price and stock signal.
- **Paid extras** — an addition on top: photo personalisation, a chain, a box.
- **Specifications** — label/value facts that describe but do not price: karat,
  weight, dimensions, scent, fabric.

Every category's pricing falls out of those, so there is one product form and a
fifth category needs no schema work.

Cards quote the **cheapest** variant as a "from" price, not the first in the
list — the first is an editing accident, the cheapest is a promise the
catalogue can keep. A leftover `originalAmount` lower than the real price
renders no strikethrough, so a mistyped figure cannot become a fake discount.

## Status drives the button

| Status | Button | Card badge |
|---|---|---|
| Available | Reserve this piece | — |
| Pre-order | Pre-order for my trip | Pre-order |
| On request | Request availability | On request |
| Sold out | Currently unavailable (not clickable) | Sold out |
| Hidden | — | filtered out in GROQ, never reaches a page |

**Availability** is separate and optional: In stock / Limited / Out of stock /
Check availability. It is a stock badge, mostly for clothing and oils. A piece
can be `available` to order and `limited` in the shop at the same time.

## Seeding and the one rule about re-running

`?only=treasures` on the migrate endpoint seeds the four categories, the ten
sample listings and the landing document. It uses `createIfNotExists`, which is
**the only block in that route that does** — everything else is code-authored
and meant to be overwritten from the repo, while these are documents Egypt Eye
edits, photographs and prices. Re-running a full migration will never undo that
work.

### Pushing a content change into documents that already exist

`createIfNotExists` protects Studio work, but it also means a change to the
content files never reaches a document that already exists. That is how the
three invented sample cartouches stayed on the live site after the real
catalogue replaced them in the repo: Sanity still held the originals, and
Sanity wins wholesale.

`&update=1` is the way through. It patches rather than replaces:

- only fields the content file **defines** are written, so a price, a
  photograph, a gallery, a variant, an availability or an SEO override that
  exists only in the Studio is untouched;
- a field the content file does not define is **never unset**, so deleting a
  line from a content file cannot blank the document;
- for a field the content file **does** define, the content file wins. A Studio
  edit to that same field is overwritten. That is the whole trade, and it is
  the reason this is opt-in rather than the default.

It is a dry run until `&apply=1` joins it, and the dry run abandons the entire
transaction — nothing of any type is written. Read the diff, then commit it:

    /api/migrate?secret=…&only=treasures&update=1
    /api/migrate?secret=…&only=treasures&update=1&apply=1

Keep `&only=treasures` on an update run, or every other type's full
createOrReplace commits in the same request.

The dry run also lists **orphans** — treasure documents in Sanity that the
content files no longer describe. They are reported and never deleted:
removing a document is destructive, it may be an editor's own work, and it is
two clicks in the Studio. The point is that you know they are there rather than
finding stale listings on the live site.

Array keys are derived from the slug and index rather than generated randomly,
so a re-run produces identical arrays and an unchanged document reports as
unchanged instead of rewriting every block.

## Customer photographs

Unchanged and deliberately so. Papyrus uploads go to a **private** bucket
through the service role. There is no public read, no anon or authenticated
storage policy, and the only way to see one is a signed link that expires in 30
days, sent to the team inbox. `photoUrl` is passed to the team email and
appears in no API response — the route only ever answers `{ok:true}` or an
error string. Customer photographs are never mixed with website imagery, which
lives in Sanity.
