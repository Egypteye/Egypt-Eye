# The Marriage Proposals page: what was built, and what it needs from you

Built 25 October 2026. URL unchanged: `/flying-dresses/celebrations/marriage-proposals`.

---

## 1. The finding that shaped everything

**We have no photograph of a proposal we have run.** Not one, anywhere in the
repository.

What we do have is real, credited agency work from the same rooftop: the
Alessandra couple frames, the Kayan gender reveal with its lit sign and
balloon arch, the Milya flying-dress session, a group shoot, the plateau.

The Alessandra frames look exactly like proposal photography. Captioning them
as a proposal would have been the easiest thing on this project and would have
been fabricated client work. So the gallery shows them, uses them hard, and
**every caption says what the photograph actually is** — a couples shoot, a vow
renewal, a gender reveal. The gallery's own intro says plainly that none of
them is a proposal.

That is not a compromise dressed up as a principle. What the frames genuinely
prove is most of what a customer needs: this is the roof, this is the view,
this is the light at either end of the day, and **this team builds decorated
setups up here** — the gender reveal has an arch, a lit sign, flowers and
evening lighting in shot. A visitor can reason from that. What they cannot do
is be misled.

---

## 2. What the page is now

A dedicated composition, in page order:

1. **Hero** — headline, the promise in three sentences, two CTAs, then the
   Alessandra rooftop frame full width with its credit.
2. **What it includes** — seven inclusions, two columns.
3. **The gallery** — five real frames, editorial lead-plus-pairs layout, every
   one captioned and credited, every one opening a lightbox.
4. **Choosing how it looks** — the decoration section. See §4.
5. **Start to finish** — the seven-step sequence, numbered.
6. **What you can change / Where it happens** — personalisation beside the
   venue, carrying the rooftop-is-not-the-complex distinction.
7. **What you receive** — photography and delivery terms.
8. **How the booking works** — the 25/75 split and the payment methods.
9. **Questions** — from the experience record, so the page and the FAQ
   structured data cannot drift.
10. **Final CTA.**

**The URL, breadcrumbs, metadata and FAQ structured data are still the shared
celebrations route's.** Only the body differs, and only for this one category.
A second route would have duplicated all of that and then drifted from it.

### The lightbox

Written rather than installed — the packages start at 15KB and bring their own
opinions about a stylesheet this brand keeps to a few kilobytes. It is a real
modal: `role="dialog"`, `aria-modal`, Escape to close, arrow keys to move, Tab
trapped inside, focus returned to the thumbnail that opened it, and the page
behind locked without the layout jumping sideways.

**Verified by driving it from the keyboard:** opened with Enter, announced
"Photograph 1 of 5", arrowed to 2 of 5, closed on Escape, focus landed back on
the thumbnail.

---

## 3. What I published, and what I held back

You supplied these and, in the same message, asked for several to be verified
before publishing. Both are recorded. The flag decides what renders.

### Published

| Fact | Where it appears |
|---|---|
| Private hotel rooftop in Giza overlooking the pyramids | Venue section, hero |
| Decoration chosen from your collection | Inclusions, decoration section |
| Setup built before the client arrives | Inclusions, step 5 |
| More than 100 edited photographs | Photography section |
| Speaker on the roof for the client's song | Inclusions, personalisation |
| Google Drive delivery, one year of access | Photography section, step 7 |
| 25% deposit to hold, 75% on the day afterwards | Booking section |
| Cash, PayPal, payment link | Booking section |

### Held back, and why

| Fact | Why it is not on the page |
|---|---|
| **Palm Hotel** | You asked for the venue identity to be verified. Naming a hotel is a public claim about somebody else's business and about an arrangement with them. **Confirm the hotel, that the rooftop arrangement is current, and that they are content to be named.** |
| **Mansouriya Street, near the Sphinx Gate area** | Same, plus a sharper risk: a published address is what somebody types into a map on the morning of their proposal. If any part is approximate they arrive at the wrong gate. **Confirm the exact address.** |
| **Free changing room** | Your own wording was "may be available", and that word matters. Published as a flat promise it becomes something a guest in a dress discovers is untrue at the venue. The page says changing arrangements are confirmed when the date is held, which is true either way. **Confirm whether it is guaranteed and on what terms.** |

All three live in `src/content/flyingDressProposal.ts` with `published: false`
and a note saying what would release them. **Flipping the flag publishes them —
and a check fails if anyone flips one without doing the verification**, which
is the point of recording the note beside it.

### Never published

**No price.** No figure has been set for any proposal package, so the page
carries a payment *split* and an explicit sentence saying the price is quoted
rather than published. A check fails if any currency amount appears anywhere on
this page or in its content file.

**No turnaround promise.** You gave the gallery's expiry (one year) but not a
delivery deadline, so the page states the expiry and says plainly that we do
not publish a deadline. "Within X days" is the easiest promise in photography
to break.

---

## 4. The decoration catalogue

You confirmed a catalogue exists and that customers choose from it. You did not
supply the designs, the names or the photographs. Those are two different
facts and the section is built on both.

**It is fully built and currently empty.** With no entries it renders the
honest version: how choosing works, what to tell us so we send the right
photographs, and the route into the enquiry. With entries it becomes a
selectable catalogue, and the chosen design carries into the enquiry form so
nobody describes it twice — the selection, the handoff, the server-side
resolution and the tracking are all written and working already.

**Adding a design is one edit**: drop it into `proposalDecorations` with its
photograph. A check fails any entry whose image is missing from `public/`, and
any entry carrying a price.

What I did not do is invent entries. A grid of plausible names would have
looked finished, been fiction, and been discovered by the first customer who
asked for one by name.

---

## 5. Photographs I need from you

In rough priority order:

1. **Any proposal you have actually run.** The single highest-value asset on
   this list. The setup, the moment, the reaction, the portraits afterwards.
   Until one exists the gallery can only argue by analogy.
2. **The decoration catalogue**, one frame per design, plus the name you call
   each one. This turns an empty section into a browsable catalogue and a
   working selection.
3. **The venue itself** — the roof empty, in daylight and after dark. The
   current frames all have people in them, so nobody can see the space.
4. **An evening or after-dark setup.** Every frame on the page is daylight or
   golden hour. If evening proposals are offered, nothing shows what one looks
   like.
5. **Details** — flowers, candles, signage, lighting, close up. Premium
   proposal pages lean heavily on these and we have none.

---

## 6. Competitor research, and what I took from it

Looked at the pages you listed plus comparable proposal and destination
experience pages, 25 October 2026.

**What the good ones do that we now do:**

- Answer "where exactly" early and unambiguously. Several competitors are
  deliberately vague about whether a shoot is inside the archaeological
  complex; being plain about it is a trust advantage, not a limitation.
- Show the process as a numbered sequence. It is the question underneath
  "how does this work" and a list is the honest shape of the answer.
- Separate the deliverable from the experience. Photography gets its own
  section because it is what the customer keeps.
- Make the money legible without publishing a price. The 25/75 split set large
  answers "how much do I pay now" without inventing a figure.

**What they do that I deliberately did not:**

- **Testimonials and star ratings.** Common on every competitor page. We have
  no authorised customer quote, so there are none. Fabricating them is the
  fastest way to lose the trust the rest of the page is building.
- **"Packages" with prices.** No figure has been set.
- **Countdown timers, "only 2 dates left", urgency badges.** Aggressive on a
  purchase this emotional, and in our case unverifiable.

**Recommendations that need your approval:**

1. **Set a price, or a from-price.** This is the biggest single conversion
   lever on the page. Every competitor publishes one. We cannot.
2. **Decide on video.** The experience record lists a cinematic film and
   vertical reels as in-house extras, but the brief says not to promise video
   unless confirmed for this service, so the page does not mention it. If it is
   real, say so and it goes on.
3. **Confirm whether evening proposals are offered**, and what the venue allows
   after dark. The page currently says the light differs at either end of the
   day without claiming an evening slot is bookable.
4. **Authorise one customer testimonial** if any past client would agree. One
   real quote would do more than any copy change available to me.

---

## 7. Verification

- `npx tsc --noEmit` — 0 errors. `npm run lint` — clean. `npm run check` —
  24/24.
- **15 new guards, each proven by breaking the thing it names and watching it
  go red**, then restored. Three needed a second pass: two were matching their
  own explanatory comments or a second occurrence of an identifier, and one
  test broke the wrong occurrence.
- Driven in a real browser at 414px and 1280px: five gallery frames and five
  captions all load, seven steps, three payment cells, four FAQs, one `h1`, no
  heading-level skips, no console or page errors.
- Confirmed on the rendered page: **no price anywhere, and no venue name or
  street address.**
- The other seven celebration categories still render the generic body; their
  route, metadata and structured data are untouched.
