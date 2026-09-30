# Take Egypt Home

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

**Take Egypt Home**, at `/take-egypt-home`.

Rejected: *Egyptian Treasures* — the site's own tagline is already "Unveiling
Egypt's Treasures", and reusing it for a shop blurs the brand's main line.
*Shop* and *Egypt Eye Shopping* were rejected for describing the mechanism
rather than the promise, and for pulling the section toward the generic
souvenir-store positioning the brief explicitly rules out.

Category routes carry the search terms rather than the brand:

| Route | Head terms |
|---|---|
| `/take-egypt-home` | what to buy in Egypt, authentic Egyptian souvenirs, gifts from Egypt |
| `/take-egypt-home/cartouches` | Egyptian cartouche, gold/silver cartouche, name in hieroglyphs |
| `/take-egypt-home/papyrus` | personalised Egyptian papyrus, custom papyrus |
| `/take-egypt-home/clothing` | Egyptian clothing, traditional Egyptian clothes |
| `/take-egypt-home/essence-oils` | Egyptian perfume oils, essence oils, alcohol-free |

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

**No checkout.** The site has no payment rail — transfers, tours and Weekly
Trips all run on request-then-confirm, and this follows them. Every CTA is
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

**Cartouches specifically** — the trust questions for a higher-value purchase:

- metal and karat for each design
- weight and dimensions
- hallmark / assay information, if any
- chain included or sold separately
- how many characters a cartouche can carry

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
