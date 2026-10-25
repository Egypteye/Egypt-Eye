# DJ, music and rooftop production: what was built, and what it needs from you

Built 25 October 2026. URL unchanged:
`/flying-dresses/creative/dj-and-music`.

---

## 1. The research finding that became the page's argument

Searched 25 October 2026, across DJ filming venues, studio and location hire,
multi-camera production packages, and the pyramids as a music venue.

**The pyramids are now one of the most aspirational backdrops in electronic
music.** Carl Cox played there in 2023. Tiesto livestreamed a three-hour set in
December 2025. Charlotte de Witte headlined in front of the Great Pyramid in
October 2026. Metro Boomin sold out sets; an Anyma show reportedly drew fifteen
thousand people.

Every one of those is a **festival-scale event inside the complex**, with a
promoter, an event budget and permits. There is also now a legal challenge
seeking to restrict large music events at the site, which is one more reason
this page must not imply any association with them.

So the page sells the opposite, and it is honest: **those artists needed a
festival to play in front of the pyramids. You can rent an hour on a roof that
looks at them, from $150, and leave with footage.** That is the most
competitive thing this business owns and the page now leads with it.

### The commercial shape also came from the research

Filmed-music venues and studios charge roughly **$125 to $250 an hour for the
space**, and the consistent convention is a base hourly rate with production
sold as separately named add-ons. One venue lists a four-hour base rate with a
camera package and a multitrack audio package priced on top. Another states
outright that post-production is not included in a recording fee.

That is exactly the shape you described, so the page uses it rather than
inventing a bundle. **$150 an hour sits in the middle of that range**, which
makes it a competitive number to publish.

---

## 2. The first real price on a Flying Dresses experience page

The page previously said "No price on this page." It now says **From $150 per
hour**, in the hero.

The unit is now part of the data type, not the copy. A rate carried as a plain
number renders as "from $150", which reads as the price of the whole session
and is wrong by however many hours somebody books. The experience record holds
`{ kind: "hourly", fromUsd: 150, unit: "hour" }`, and checks fail if the figure
changes, if the unit is dropped, or if the page shows the number without it.

**The rate is the roof.** Filming, photography, audio recording, editing, set
dressing and the artist photoshoot are production services, quoted separately,
and the page says so directly under the figure and again in the booking
section. A check fails if that exclusion sentence is removed.

No minimum booking, deposit, overtime rate or cancellation policy appears,
because none has been set.

---

## 3. The question you flagged, left open on purpose

You asked for one thing to be verified before publication: **whether audio
recording equipment is inside the $150 hourly rate or is a separate paid
add-on.**

It is not resolved, so the page does not resolve it. Audio recording is listed
as **"Available on request"** while every other service reads "Available as an
add-on", and the page says we will confirm what is available for your date and
what it costs rather than publish a figure that has not been set.

A check fails if anybody marks it as a normal add-on or writes wording that
claims it is included. **This is the main thing I need from you on this page.**

---

## 4. What the page does not soften

Your experience record states, in capitals, that **we do not supply a sound
system, DJ equipment or generators.** That is the single most likely way this
service ruins somebody's session: a DJ who arrives expecting a booth has lost
their shoot.

It now has its own section, high on the page, directly after the gallery, with
the PA, the decks and the generators named individually. Checks fail if the
section stops rendering or if the PA wording is softened to "we provide cameras
and lighting", which is not the same warning.

The same section carries: amplified sound is the venue's call and conditional;
filming inside the archaeological complex is a separately permitted activity
and not what this is; these are private sessions, not public events; and we do
not fly drones.

**On the "2 to 3 angles":** you described it as the intended shooting approach,
so the page describes three *shots* (the wide, the artist, the close detail)
and never counts cameras or operators. Checks fail if a camera count, a crew
size, a photograph count, a video length or a delivery deadline appears.

---

## 5. The gallery, which is the weakest part of this page

**There is no photograph of a DJ, a set, decks, a stage or a filming rig
anywhere in the repository.** Not one.

So the gallery shows three real credited frames that genuinely answer what a DJ
arrives wanting to know (the width of the roof, the skyline, the light at
golden hour and after dark), each captioned with the occasion it was actually
shot at, and then **four designed, labelled gaps** naming the shot that is
missing. Never a stock photograph, and never somebody else's set.

The gallery component now supports those gaps, and the lightbox correctly skips
them: it opens at "Photograph 1 of 3" and arrows between the real frames only.

### The four photographs I need, in priority order

1. **A DJ behind the equipment with the pyramids on the skyline.** This is the
   shot the entire page exists for and we do not have it.
2. **The filming setup mid-session** — the rig, the positions, the crew. This
   is what sells the production services.
3. **Equipment detail**: hands on the controller, faders, the light moving.
4. **An artist portrait on the roof**, from the separate DJ photoshoot.

Also worth having: an after-dark set, and anything that shows power and cabling
in place, because that is the practical question every producer asks.

---

## 6. The enquiry, which is built and tested

Music-specific fields appear **only** when the music session is the chosen
occasion, so nobody booking a photoshoot is asked how many rooftop hours they
want:

- **Rooftop hours**, with the rate in the hint. Validated server-side to a
  sensible range, because this is the one number on the form that multiplies by
  a rate.
- **DJ or artist name.**
- **Production you want quoted** — the seven services as checkboxes, resolved
  against the catalogue server-side so the desk email can only contain services
  we actually offer.
- **A link to your music or a visual reference.**

Tested end to end in a browser: all four reach the WhatsApp draft and the desk
email, the fields stay hidden on a generic photoshoot enquiry and appear when
the music session is selected, and the hours row in the email carries the rate
so a bare "3" cannot be misread.

---

## 7. What I still need from you

1. **Whether audio recording equipment is in the $150 or charged separately.**
   The one thing you explicitly asked to have verified. See §3.
2. **Rates for the production services.** None of filming, photography,
   editing, lighting, set dressing or the artist shoot has a figure. Publishing
   even a "from" on filming would help, because the research shows competitors
   publish camera packages as named prices.
3. **Minimum booking, deposit and cancellation terms** for the rooftop, if any
   exist.
4. **The four photographs in §5.**
5. **An equipment inventory** — exactly what cameras and lighting exist. Your
   record's own open question, and it would let the page be specific where it is
   currently general.
6. **Which venues will agree to amplified music at all, and on what terms.**
   Still open on your record, and it is the difference between this being
   straightforwardly bookable and conditional.
7. **Whether there are sound and equipment suppliers we can genuinely
   introduce people to**, since the page offers that introduction.
8. **Whether a set-dressing catalogue exists** for music sessions. The section
   is built and empty.

---

## 8. Two bugs found and fixed along the way

**Duplicate questions on two pages.** The music page concatenated its own FAQ
list with the experience record's and shipped two copies of "Do you provide the
sound system?" and "Can I play loud on the rooftop?". React caught it with a
duplicate-key error; the visible symptom was a page answering itself twice. The
celebration page had the same fault in a quieter form, asking about group size
and music twice in different words.

Fixed at the source: a merge helper now puts the record's questions first and
drops any page question already answered. **The record wins deliberately** —
the routes build FAQ structured data from the record, and Google requires the
marked-up answer to be the one visible on the page, so a page version
displacing it would make the schema and the page disagree. The record's
answers on both pages were updated to carry the newly confirmed facts (the PA
warning here; the speaker and the one-to-fifteen companions on celebrations).

**Two guards that passed on broken code**, both on this page's most important
section. One tested the file for the PA sentence, which also appears in the FAQ
further down, so deleting the warning left it green. The other tested for the
identifier `notSupplied` anywhere on the page, so gutting the list left the
heading behind and the check passed. Both now test the rendered list and the
data itself. A third tested for "pyramids complex" across a point's title and
detail, and was satisfied by the title alone after the explanation was deleted.

---

## 9. Verification

- `npx tsc --noEmit` — 0 errors. `npm run lint` — clean. `npm run check` —
  25/25.
- **28 new guards, each proven by breaking the thing it names and watching it
  go red**, then restored. Three failed that test on the first pass and were
  rewritten, as described in §8.
- Driven in a real browser at 414px and 1280px: one `h1`, no heading-level
  skips, seven gallery cells (three photographs, four labelled gaps), seven
  production services with their status labels, seven steps, twelve questions
  with no duplicates, no console or page errors, no horizontal overflow, no
  em-dashes.
- The lightbox opens at "Photograph 1 of 3", arrows between the real frames
  only, and closes on Escape — the gaps are correctly excluded.
- Confirmed on the rendered page: the only currency figure is **$150, always
  with "per hour" beside it**.
- The enquiry journey tested end to end, including that the music fields stay
  hidden on other enquiries.
