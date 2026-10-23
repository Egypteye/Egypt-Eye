# What you can edit without a developer, and what you cannot

Audited 20 October 2026, against the live `eoashi0y / production` dataset.

---

## 1. The finding

The two brands are in opposite states, and the numbers are not close.

**Egypt Eye Travel is already well covered.** Eighteen schema types, a
structured desk, six singleton page documents, and real content in all of
them:

| Type | Published documents |
|---|---|
| Testimonials | 2,527 |
| Stories | 234 |
| Tours | 79 |
| Extra experiences | 23 |
| Treasure products | 16 |
| Destination hubs | 13 |
| Photoshoot packages | 7 |
| FAQ items | 6 |
| Signature experiences | 5 |

Plus `siteSettings`, which is unusually thorough: brand, hero, contact,
socials, nav, trust badges, destinations, interests, footer, pillars, review
figures and the policies — including the default deposit percentage.

**Flying Dresses Egypt was covered by nothing.** It had exactly one schema,
`flyingDressGallery`, and a query of the production dataset returned **zero
documents of it**. The comment in `src/sanity/structure.ts` said the galleries
were "the one part the owner can change without a developer". In practice it
was not one part. It was none.

Everything on that site — three prices, twelve dresses, five gawns, eight
experience categories, every headline, every FAQ answer, the contact details,
the menu — lived in `src/content/flyingDresses.ts` and could only be changed by
editing TypeScript and redeploying.

That is why every request about that brand in recent sessions needed a code
change: a price, a photograph, a sentence, a menu item.

---

## 2. What this change makes editable

Five new document types, reachable in the Studio under the ✿ entries.

| Studio entry | Controls | Replaces |
|---|---|---|
| **Settings** | Business name, tagline, description, the hero headline and the paragraph under it, email, phone (one field — the dial and WhatsApp links are derived from it), location, social accounts, what every photoshoot includes, payment methods and the payment note, the cancellation summary and whether a full policy is published, the main menu | `brand`, `contact`, `nav`, `payment`, `cancellation`, `packageIncludes` |
| **Photoshoots** | All three: name, title, eyebrow, order, **price**, the Egypt Eye product it books against, intro, search description, why-this bullets, getting there, art direction, hero photograph and its description, fallback gradient, the shoot timeline, the price explanation, FAQs | `packages[]` |
| **Extras** | Label, price (or "on request"), whether it is a starting price, the home-page line, the fuller description, order | `addOns[]` |
| **Hire services** | All three: name, title, summary, intro, price, how it works, what you get, **what you do not get**, FAQs, order | `rentalServices[]` |
| **Wardrobe** | Every dress and gawn: name, kind, **photograph**, description, colour swatch, which shoot it came from, order, and a retire switch | `FLYING_DRESS_COLLECTION`, `MENS_OUTFITS`, `dressPhotos` |
| **Galleries** | Already existed; now reachable and used | `flyingDressGalleries.ts` |

Seventeen pages read through this. The menu, the business name and the
WhatsApp number reach the header; the name reaches the wordmark and the page
titles; prices reach the home page, the photoshoots index, each shoot page,
the pricing page, the FAQ answers and the structured data Google reads.

### Changes appear without a deploy

Content edits do not need a build. Pages revalidate on a one-hour window, or
immediately via **"Refresh the site from Sanity"** on `/admin/paypal`, which
calls `revalidatePath("/", "layout")`.

**Schema changes do need a deploy**, and that is not a limitation anyone can
remove: this Studio is served by the Next.js app at `/studio`, so it reads its
field definitions from the deployed bundle. Adding a new *kind* of thing is a
code change. Adding, editing, reordering, retiring and publishing *content* is
not.

---

## 3. Safeguards

- **Singletons cannot be duplicated or deleted.** Settings documents lost
  their Delete and Duplicate actions and are gone from the global create menu.
  Both failures were silent before: a duplicate is simply never read, so you
  could spend an afternoon filling in a document with no effect on the site and
  nothing would say so. This covers Egypt Eye's six singletons too.
- **Retire rather than delete.** A garment has a "no longer available" switch
  that hides it from the site and keeps the record. Deleting one is a garment a
  past booking can no longer name, and there is no undo.
- **The identifier warning.** A garment's id is stored on bookings. The field
  says, in those words, that changing it does not error — it just stops
  matching.
- **Price fields are marked.** The one field on the form that can cost real
  money does not look like the others, and it says what it does and does not
  change.
- **Zero is not empty.** An extra with no price reads "on request". A zero
  would read "free". The validation refuses a zero and says why.
- **The menu stops at six**, with the measurement in the warning: a seventh
  item does not overflow the bar, it squeezes the logo to nothing between
  1152px and 1400px, invisibly on a laptop and on a phone.
- **Description lengths** are checked against the 110–160 band Google renders,
  with the actual character count in the message.
- **Clearing a list empties the section.** It does not quietly restore the
  repo's copy. That is the documented three-case rule and it is now tested.
- **Nothing can break the build.** Every list is hardened at the boundary; a
  cleared field empties a section rather than ending a deploy.

---

## 4. What is deliberately NOT in the Studio

Not an oversight in any case. Each of these is either technical configuration
or a money authority, and a CMS field is the wrong place for both.

| Not editable | Why |
|---|---|
| The domain and site URL | Canonical URLs, the sitemap and every share image are built on it. An editor who can change it can take the site off the internet. |
| `EGYPT_EYE_ORIGIN` | Where checkout hands over to. Wrong value = a dead Book button on every page. |
| PayPal credentials, Supabase keys, API tokens | Secrets. They live in environment variables and must never appear in a CMS. |
| The deposit percentage | One authority for money (CLAUDE.md §5). It lives on the Egypt Eye side where the deposit is actually computed, in integer cents. Two editable copies is two numbers that can disagree about what a customer owes. |
| Layout breakpoints, the nav ceiling | Measured constants. The ceiling is surfaced as a *warning* with its reasoning, which is the editable part. |
| `priceConfidence`, `confirm[]`, `imageIsPlaceholder` | Bookkeeping about what the business has and has not verified. Read by check scripts; an editor cannot answer them correctly from a form. A Studio-only item inherits "unconfirmed", which is the honest default. |
| The cancellation *ambiguity* note | A record of an unresolved contradiction in the brochure, for whoever writes the real policy. Not published copy. |
| Translations | The i18n pipeline extracts from `src/content/*.ts`. Copy that exists only in Sanity is never translated and appears in English on every locale. This is a real limit and it applies to the travel site too. |

---

## 5. Still hardcoded, and worth doing next

Honest list. These were audited and deliberately not attempted in this pass,
because each needs its own schema and page wiring, and a half-wired type is
worse than an obviously missing one.

| Still in code | Lines | Notes |
|---|---|---|
| `flyingDressExperiences.ts` | 784 | Eight celebration and creative categories. The next most valuable, because it holds the eleven unpriced pages. |
| `flyingDressStories.ts` | 734 | The six articles. A `story` schema already exists for the travel site and is a close model. |
| `flyingDressCollaborations.ts` | 125 | The collaborate page. |
| `aboutCredibility.ts` | 300 | Shared with the travel site's about page. |
| Experience photographs (`_lib/assets.ts`) | — | Slot-based, with labelled gaps for missing frames. Wiring it to Sanity means teaching the gap behaviour to the image field, which the gallery schema already does. |

---

## 6. How this was verified

The sandbox cannot reach Sanity over DNS — `next build` stalls at "Collecting
page data" for exactly this reason (CLAUDE.md §8). So the chain was verified in
pieces rather than claimed:

1. **The schemas** were created in the real dataset as a **draft** settings
   document. The site's client runs `useCdn: true` with no token, so it reads
   published content only: a query with the `published` perspective returned
   **0** documents, confirming nothing live changed.
2. **The projection** was run against the real document using the exact GROQ
   string from `fetchers.ts`, and returned every field in the expected shape.
3. **The merge rules** were extracted into `_lib/contentMerge.ts`, which
   imports nothing from the Sanity client — so `scripts/check-flying-dresses`
   can reach them, which is the CLAUDE.md §6 pattern. The real payload is
   captured as a fixture and the check asserts that publishing the seed changes
   **nothing**: same name, same headline, same WhatsApp number, same menu, same
   inclusions, cancellation policy still unpublished.
4. **Seven new assertions**, each proven by breaking it and watching it go red,
   including the three-case array rule and a price of 0 being a price. One of
   them passed on broken code first time and was rewritten — it only tested
   `null`, so a merge treating an empty document list as "this brand has no
   products" went undetected.
5. **The pages** were rendered with Sanity unreachable. All seventeen return
   200, the log shows the intended "falling back to local content", and the
   prices, menu and WhatsApp number are byte-for-byte what they were.

### What is left to confirm, and only you can do it

The draft settings document is waiting in the Studio. Publishing it is
**provably a no-op** by the check above, but the final hop — Studio edit →
live page — can only be seen on a deployed site, and nothing has been
deployed. When you approve a deploy, the order is: deploy, open the Studio,
publish the settings document, confirm the site is unchanged, then change one
headline and watch it move.
