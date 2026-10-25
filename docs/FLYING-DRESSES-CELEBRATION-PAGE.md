# Birthdays and Private Celebrations: what was built, and what it needs from you

Built 25 October 2026. URL unchanged:
`/flying-dresses/celebrations/birthdays-and-celebrations`.

---

## 1. What the competitor research actually found

Searched 25 October 2026, across Giza rooftop venues, Cairo photoshoot
operators, graduation photographers and experience-booking platforms.

**Nobody is selling what you are selling.** The businesses at Giza sell
*photoshoots*: a flying dress session at around $180, a private pyramids
session at around $100, photographers working the plateau for graduations. The
rooftop venues sell *dinner with a view*. The cake results were a London
bakery. Not one published page combines decoration, a cake, your own music,
two styles of photography and your people into one coordinated evening.

That changed the page's whole argument. It does not compete on the price of a
photoshoot, which it would lose. It competes on the thing nobody else offers:
**somebody organises the entire evening.** That is why both photoshoots are
presented as part of it rather than as options you pick between, and why the
most carefully built section on the page is about what each element *costs*
rather than about adjectives.

What the good experience pages do that we now do: answer "where exactly" early
and unambiguously, show the process as a numbered sequence, and separate the
deliverable from the experience. What they do that I deliberately did not:
testimonials and star ratings (we have no authorised customer quote), a
published price (none has been set), and urgency badges.

---

## 2. The four labels, and why they are on the page

Every element carries one, visibly:

| Label | Means | Used for |
|---|---|---|
| **Included** | Part of the celebration itself | The rooftop, the speaker, both photoshoots, your companions |
| **Arranged for you** | We coordinate it, priced in your quotation | The decoration, the cake |
| **Additional charge** | On top of the quotation | Transport |
| **Quoted for you** | Real, terms not published | The quotation itself |

This is the single most common place a premium experience page misleads: one
undifferentiated "what's included" list, with the charges discovered later.
It is now a **type** in the code, not a tone of voice, so no line can be added
to this page without somebody deciding which of the four it is.

### The one that matters most: transport

Your **flying dress photoshoot packages include door-to-door transport in the
published price.** Transport for a celebration is an **additional charge.**

A visitor who has read `/experiences` arrives here already believing the first
thing, correctly, about a different product. So the page says the difference
out loud in three places: the overview line, the transport section, and the
FAQ. The enquiry form's pickup field and the desk email both say it too. A
check fails the build if transport is ever reclassified as included.

---

## 3. What the page is now

In order: hero and the group photograph; what the evening is, with all eight
elements and their charge labels; the gallery; the two photoshoots side by
side; what you are celebrating plus the decoration catalogue; the cake; music
beside guests; transport; the seven-step sequence; the quotation beside the
venue; twelve questions plus your own two; the final call to action.

The URL, breadcrumbs, metadata and FAQ structured data are still the shared
celebrations route's. Only the body differs, and only for this category.

---

## 4. Where every fact came from, and the one conflict I had to resolve

Two sources: the long-standing `private-celebration` record, and your October
2026 celebration brief. The brief **added six things** the record does not
carry: the speaker, custom cake preparation, both photoshoots as part of the
experience, one to fifteen companions, and transport within Cairo and Giza at
an additional charge.

**The conflict was music.** Your brief says speakers are available for your own
songs. Your existing record says "Amplified music on a rooftop is never
assumed. It is checked with the venue for your date", and answers the music
question with "Sometimes, and it depends on the venue, the hour and how loud."

Those are not actually in conflict once you separate the *equipment* from the
*permission*. There is a speaker and you can send your songs: that is your
brief, and it is on the page as a plain statement. How loud and how late
remains the venue's call: that is your record, and it stays, because a rooftop
above a hotel full of sleeping guests has rules whatever equipment we own.

**Not on the page: a DJ, a live musician or a professional sound system.** Your
brief names all three as things not to advertise without separate
confirmation. Your record does list a musician or DJ as a *partner* extra, so
it is not impossible, it is simply not something this page promises. Say the
word and it goes on.

---

## 5. The photographs, which is the weakest part of this page

**We have never photographed a birthday on this roof. Not one frame.** There
are no cake photographs, no birthday decoration photographs, and no balloon
photographs except the ones in the gender reveal frame. (The only other
"balloon" images in the repository are the Giza tethered-balloon attraction,
which is a completely different thing and is not used here.)

So the gallery shows real, credited work from the same rooftop, says in its own
first sentence that none of it is a birthday, and captions every frame with the
occasion it was actually shot at.

The one genuinely decorated setup we own is the **Kayan gender reveal**: a
balloon arch, lit letters, flowers and evening lighting, built by this team on
this roof. It is the gallery's lead frame and the "casual photoshoot" example
precisely because it is the **only evidence that we decorate anything**, and it
is labelled a gender reveal every single time it appears.

### Photographs I need from you, in priority order

1. **A birthday you have actually run.** The highest-value asset on this list
   by a distance. The decorated setup, the cake, the moment everyone sings,
   the group afterwards.
2. **Cakes.** The cake has its own section and not one photograph. Every
   competitor selling cakes shows them.
3. **The birthday decoration designs**, one frame per design plus the name you
   call each one. Turns an empty catalogue into a browsable, selectable one.
4. **A table or dining setup on the roof**, if celebrations use one. Nothing
   on the page shows where fifteen people would actually sit.
5. **Group photography that is not a flying dress session.** The one group
   frame we have is six women in dresses; a birthday group looks different.
6. **An evening or after-dark setup.** Most of the page is daylight or golden
   hour.

---

## 6. The enquiry journey, which is built and tested

The celebration fields appear **only** when the chosen occasion is a
celebration, so somebody hiring a dress is not asked about their cake:

- **What you are celebrating** — a birthday, a graduation, a reunion or
  something else. Chosen on the page, carried into the form, the email and the
  WhatsApp draft.
- **A cake, if you would like one** — occasion, message, style, and anything
  anybody cannot eat.
- **Songs you want playing.**
- **Transport** — a checkbox that says it is an additional charge. Ticking it
  relabels the pickup field from "Where you are staying" to "Pickup address"
  and changes its hint.
- **Companions** — the existing people field.

**Tested in a real browser, end to end**: the occasion carries from the page to
the WhatsApp draft; all four values arrive; the fields are hidden on a rental
enquiry and on a photoshoot with no occasion set, and appear the moment a
celebration is chosen; a tampered-with link cannot inject an occasion we do not
offer; the transport request is read as a strict `true` on the server, so a
string in that field cannot become a transport booking.

---

## 7. What I could not verify, and need from you

1. **A price, or a from-price.** Your record still says "PRICE. Nothing set for
   celebrations of any size." No price appears anywhere and a check enforces
   it. This is the biggest conversion lever on the page.
2. **Payment terms.** Whether the proposal's 25/75 applies here or something
   else does. Nothing is assumed; `termsSet: false` records the absence
   deliberately and a check fails if anybody flips it.
3. **Does "1 to 15 companions" mean fifteen *in addition* to the person
   booking, or fifteen in total?** You asked me to verify this and I cannot.
   The page is worded so it reads correctly either way and states no maximum
   total headcount. Confirm it and the wording gets sharper.
4. **Transport terms**: roughly what it costs, and whether "Cairo and Giza"
   has edges you would want stated. No price, vehicle, journey time or list of
   districts is published.
5. **Cake terms**: whether there is an ordering deadline, and whether dietary
   requirements can be met. The page explicitly declines to publish flavours,
   sizes, dietary options, a price or a cut-off, and says the cake comes
   through a supplier.
6. **The decoration designs for birthdays.** Your record's own open question is
   "Which decoration designs suit a birthday rather than a proposal."
7. **Deliverables for the two photoshoots**: roughly how many photographs, how
   long each session runs, and when they arrive. None is published, because
   none has been set for a celebration. The photoshoot *packages* carry "100+
   photographs" and a stated length, but those are a different product at a
   different price and borrowing their figures would be inventing a promise.
8. **Whether a DJ or musician can be offered** (see §4).
9. **One authorised customer quote**, if any past client would agree. Every
   competitor page has testimonials and we have none.

---

## 8. Verification

- `npx tsc --noEmit` — 0 errors. `npm run lint` — clean. `npm run check` —
  25/25.
- **35 new guards, each proven by breaking the thing it names and watching it
  go red**, then restored. **Two of them failed that test on the first pass**
  and were rewritten: one searched the file for a sentence that also appears in
  the FAQ further down, so blanking the real one left it green; the other
  tested for one match where the pickup field adapts in two places, so breaking
  the label left the hint's copy behind. Both now test the actual values. A
  third gap was caught by lint: the guard block read the chooser component and
  asserted nothing about it.
- Driven in a real browser at 414px and 1280px: one `h1`, no heading-level
  skips, five gallery frames with five captions each naming a real occasion,
  twelve charge labels, four occasion cards, seven steps, fourteen questions,
  all ten images loaded, no console or page errors, no horizontal overflow.
- Confirmed on the rendered page: **no price, no percentage, no venue name, no
  Google Drive, no photograph count, no em-dashes.**
- One layout defect found by looking at the screenshots and fixed: the two
  photoshoot columns were rendering 656px and 485px wide, because the shared
  split grid is 1.15fr/0.85fr for prose-beside-a-note. The same aspect ratio
  gave two different heights and the headings did not line up. A comparison
  whose halves are different sizes reads as a preference, so an even variant
  was added and applied to the two genuinely symmetric sections.
