# Backend audit: what you can change, what you cannot, and what it will take

Audited 29 October 2026, from the code rather than from memory. Every claim
below was read out of the repository or queried from the live Sanity dataset.

**Where the backend is:** `flyingdressesegypt.com/studio` (or
`egypteyetravel.com/studio` — same backend, same login).

---

## 1. The short version

| | Flying Dresses |
|---|---|
| Studio document types | **9** (4 were built this week) |
| Published documents | **40** (verified by query, 29 October) |
| Pages you can fully edit | 3 of 17 |
| Pages you can partly edit | 7 of 17 |
| Pages still entirely in code | 7 of 17 |

Roughly **6,900 lines** of Flying Dresses content live in `src/content/`.
About a third of it is now reachable from the Studio. The rest is listed in
section 4 with what each piece would take.

The Egypt Eye side is a different story and is in much better shape: 2,527
testimonials, 234 stories, 79 tours, 33 experiences, 16 shop products, 13
destinations and 7 photoshoots are all Studio documents already, plus
singletons for the homepage, site settings, about, contact, customise and
listing pages.

---

## 2. What you can change today

### ✿ Flying Dresses — Settings
The brand name, tagline and description. The home hero headline, its accent
and the supporting line. Email, phone, location, social links. The "what every
package includes" list. The payment note and methods. The cancellation
summary. The main menu.

### ✿ Flying Dresses — Rates *(built this week)*
The three amounts — rooftop per hour, flying dress per person, regular per
person — plus each one's label and description, and the three sentences
printed under the money on the occasion pages.

### ✿ Flying Dresses — Photoshoots
The four packages: name, title, eyebrow, order, price, duration note, intro,
meta description, "why this one", getting there, visual direction.

### ✿ Flying Dresses — Extras
The eleven add-ons.

### ✿ Flying Dresses — Hire services
The three hire services.

### ✿ Flying Dresses — Wardrobe
All eighteen garments — thirteen dresses and five gawns — including their
photographs.

### ✿ Flying Dresses — Proposals page *(built this week)*
Headline, seven inclusions, four personalisation entries, seven sequence
steps, venue description, the "not inside the complex" paragraph, the
decoration catalogue, and the photography section. Plus the three switches
for the venue name, the street address and the changing room.

### ✿ Flying Dresses — Gender reveal page *(built this week)*
The secret section, six inclusions, four mechanism points, three colour
themes, the decoration catalogue, seven steps, photography and video, and the
practical block.

### ✿ Flying Dresses — Galleries
A schema exists but **no document has ever been created**, so the home gallery
currently renders from the code. Creating one would take it over.

---

## 3. What you cannot change, page by page

| Page | Editable now | Still in code |
|---|---|---|
| `/` home | Hero, brand, packages, menu | The six-frame gallery, the story rail, the eight category cards, five inline paragraphs |
| `/about` | Contact, packages, wardrobe counts | Every heading and paragraph on the page |
| `/wardrobe` | **Everything** | — |
| `/packages` | **Everything** | — |
| `/rentals` | The three services | The thirteen accessories and their lookbook notes |
| `/experiences` | Package names and prices | The eight category descriptions |
| `/experiences/[slug]` | Package detail | The experience records, their FAQs, extras and open questions |
| `/celebrations` | — | The eight category cards |
| `/celebrations/marriage-proposals` | **Everything** | — |
| `/celebrations/gender-reveals` | **Everything** | — |
| `/celebrations/birthdays-and-celebrations` | — | All of it: the celebration lines, shoot styles, cake, music, guests, transport, steps, payment, venue, FAQs, decorations |
| `/celebrations/anniversaries-and-romance` | The rates and the three sentences | Everything else |
| `/celebrations/maternity-and-family` | The rates and the three sentences | Everything else |
| `/celebrations/vow-renewals-and-engagements` | The rates and the three sentences | Everything else |
| `/creative/dj-and-music` | — | All of it, including six places where `$150` is typed as plain text and will **not** follow the rate card |
| `/creative/creators-and-editorial` | — | The category description |
| `/collaborate` | — | The collaboration categories and the form copy |
| `/enquire` | Draws on packages and wardrobe | The enquiry options, the urgent-call copy |
| `/faq` | Prices quoted from packages | **29 questions and answers written inline in the page itself** |
| `/stories` and `/stories/[slug]` | — | All nine stories, their clusters and their links |

---

## 4. What it would take to close the gap

In the order I would do it, highest value first.

**1. Birthdays & private celebrations** — 549 lines, one page.
The last of the four big celebration pages. Same shape as the two already
done, so it is largely mechanical now.

**2. DJ & music** — 391 lines, one page, plus the `$150` sweep.
Worth doing next specifically because of the sweep: six places quote the
rooftop rate as typed text today, so changing it in the Studio would leave
them stale. This is the same bug class I fixed on the occasion pages.

**3. The three occasion pages** — 742 lines, one schema covering all three.
Anniversaries, maternity and vow renewals share one component, so one
document type with a slug covers them.

**4. The FAQ page** — 29 inline questions.
The single largest block of customer-facing text that has no home in a
content file at all. It is written straight into the page component.

**5. Experiences and categories** — 878 lines.
The eight category descriptions and the experience records behind them. This
one is structural: a lot of other pages read from it.

**6. Stories** — 1,315 lines, nine stories.
The Egypt Eye side already has a `story` schema to copy, so this is the
best-understood of the remaining work.

**7. Accessories** — 237 lines, thirteen items.
**8. Collaborations** — 125 lines.
**9. Home and about page prose** — the inline paragraphs.
**10. Photographs everywhere** — the frames placed this week still live in the
asset registry. This one needs care: see section 5.

---

## 5. What is locked on purpose, and why

These are not gaps. Each was a deliberate decision, and I would push back
before changing any of them.

**The domain and the site URL.** An editor who can change the domain can take
the site off the internet, and the canonical URLs, the sitemap and every share
image are built on it.

**PayPal credentials, Supabase keys, and the deposit percentage.** Money
authorities. The proposal's 25% deposit is in the code because the figure and
the sentence spelling it out in words would otherwise be two places holding
one number.

**The charging unit.** "$150 per hour" versus "per person" is the charging
model, not a price. Whole paragraphs are written on the distinction between a
session priced per head and an event priced by the hour.

**Any rendered price string.** You type `175`; the site writes "per hour"
itself. A price text box beside a price number is two places to change one
figure, and the failure is silent.

**The gender reveal's payment terms.** No deposit or balance field exists on
that page and the schema refuses one, because nothing has ever been agreed for
that service. The proposal's terms were supplied for the proposal.

**The records of absence.** The notes saying no price has been set, no venue
is named, no payment terms exist. They are what the automated checks read to
prove each absence is deliberate rather than an oversight.

**Photograph provenance.** Every image slot carries whether it is your own
work, a location shot, a styled composite or a labelled gap. The checks read
the *bytes* of every file claiming to be your photography and fail on
generated-media provenance. When photographs become editable (item 10 above),
that protection has to survive the move, which is why it is last and not
first.

---

## 6. The limit of the safety net

Worth stating plainly now that real copy is editable.

**The automated checks read the code, not the Studio.** All 26 of them run
against the repository. They will catch a price in the fallback text, a field
the query silently ignores, a photograph claiming to be yours that is
generated, a caption that stops saying what a photograph is.

They cannot see what you type into a box. If you put a figure into the gender
reveal's quotation note, it goes live and no check will stop it.

Three things stand between you and that:

1. Every risky field carries a warning in its own description in the Studio.
2. Clearing a field falls back to the code rather than publishing a blank.
3. Telling me when you set a price, so the booking flow and the rest of the
   site can be made to agree with it.

That is the whole of the protection, and it is a real change from when
everything needed a developer.

---

## 7. Two things waiting on you

**The decoration catalogues are empty.** Both the proposals page and the
gender reveal page have a working catalogue with nothing in it. Adding one
design — id, name, description, photograph — turns "we will send you what is
available" into a real choice that carries into the enquiry. This is the
longest-standing open item on the whole project.

**The three held facts.** The venue name, the street address and the changing
room are recorded and switched off. Only you can verify them, and now only you
need to.
