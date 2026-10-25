# Anniversaries, Maternity and Vow Renewals: what was built

Built 25 October 2026. URLs unchanged:
`/flying-dresses/celebrations/anniversaries-and-romance`,
`/flying-dresses/celebrations/maternity-and-family`,
`/flying-dresses/celebrations/vow-renewals-and-engagements`.

---

## 1. An error I shipped, and have now fixed

Four pages carried the caption **"Photographed at a vow renewal"** on the
golden-hour couple frame. It is not a vow renewal.

That shoot is **Alessandra and Gianluca's anniversary**, September 2026. They
travel somewhere new each anniversary and photograph it in their wedding
clothes, and in September the dress came to Egypt. It is written up as a story
on the Egypt Eye site. I found it while auditing these three pages, not before
shipping the caption.

Corrected on the proposal, gender reveal, celebration and music pages, and the
check vocabulary updated so "anniversary shoot" is a recognised occasion.

**It changes which page has evidence.** The anniversary page turns out to be
the only one of these three with real photographs of its own occasion. The vow
renewal page has none at all, which I had previously believed it did.

---

## 2. Your rate card, now live on four pages

You gave me this: *"Location reservation is $150 per hour. Flying dresses
photoshoot at the rooftop is $200 per person. The regular photoshoot is $100
per person. Photography for events are with extra fees. Yet decoration in these
services are included."*

It is now a single file, `flyingDressRates.ts`, and every page reads from it.
Two pages holding their own copy of a number is how two pages quote different
figures at the same customer.

| Page | Priced at |
|---|---|
| Anniversaries | $100 per person, or $199 with a dress |
| Maternity and family | $199 per person with a dress, $100 without |
| Vow renewals | $150 per hour, photography quoted on top |

**The unit is part of the figure, never separate.** $150 is per *hour* and $199
is per *person*; either rendered bare is wrong by a factor of however many
hours or people. A check fails if the amount and the unit are ever split.

**A session is priced per person. An event is the room by the hour.** That is
why the vow renewal is priced differently: a ceremony is an event, so it is the
rooftop by the hour with the photography quoted on top, exactly as you
described. A check fails if the ceremony is ever repriced per person, because
that silently drops the event photography fee.

**Decoration is included**, said on every one of the three pages. The research
is why I gave it that much room: comparable services either charge for styling
separately or do not offer it.

### Both pricing questions are now answered

**The flying dress photoshoot is $199 per person**, not $200, which you
confirmed when I asked. That matches the Pyramids Rooftop package, which has
carried $199 with a verified flag all along, so there is now one figure for one
product rather than two a dollar apart. Nobody notices a difference that size
until a customer does.

The three FAQ answers that quoted the figure in prose now **interpolate it from
the rate card** rather than repeating it, so the next correction is one edit
instead of four. The check that catches a stray figure on these pages now
derives what it allows from the rate card too: the old version hardcoded
100/150/200 and would have passed three FAQ answers still saying $200.

**Decoration is NOT included in birthdays**, which you confirmed. The birthday
page already said *"Arranged for you"* and priced in the quotation, so nothing
changed there, which is the right outcome.

What did change is that inclusion is now a **per-occasion flag** rather than a
fact of the shared rate card. A shared module stating a blanket "decoration is
included" is one import away from making that false claim on the birthday page.
Two checks now hold the line in both directions: these three must say it, and
the birthday page must not.

---

## 3. The decisions you gave me, and what I did with them

**Private dining: not confirmed, leave it off.** Done. It is also removed from
the anniversary record's extras so it cannot reappear, and a check fails if the
page ever mentions a rooftop dinner. This costs us the single strongest upsell
competitors have: Rome bundles a rooftop proposal shoot with dinner at €500,
Paris includes champagne on a private terrace, Los Cabos bundles dinner with
the shoot. It is still the right call until a venue has agreed it. **If one
has, this is the highest-value thing you could confirm.**

**Celebrant: "do the best with your understanding."** I have kept it **off the
page**. A celebrant is a person who has to physically turn up to a ceremony.
Promising one we cannot produce does not disappoint a customer, it ruins the
event, and your own record flags it as unverified. The page says couples bring
their own words, which your record confirms most do, and that if they want
somebody to lead them they should ask and we will answer honestly for their
date. A check fails if a celebrant is ever promised.

**Maternity photographs: none yet, use labelled gaps.** Done, three of them:
a maternity session, a family across three generations, and a pregnancy
announcement. The real frames show the location and the dresses, each captioned
with what it actually is.

---

## 4. The legal statement on the vow renewal page

This is the most important paragraph on any of these three pages, and your
record's wording is used **verbatim** rather than rewritten.

The research supports it: UK registrars and professional celebrants word a
renewal exactly this way, as having no legal standing and not being legally
binding on those who take part. It is now the page's prominent feature section
rather than only an answer in the FAQ.

**Your record still flags that this wording wants a legal review before
publication.** It was already published and I have not changed a word of it, so
nothing new has been claimed, but **that flag stays open** and I am not treating
the research as a substitute for a lawyer reading it.

A check now fails if any of its three claims is removed: no legal officiation,
nothing signed has legal effect, and the embassy is where a legal ceremony
actually happens.

---

## 5. One composition, not three pages

These three do not differ the way the proposal, gender reveal, celebration and
music pages do. All three are a rooftop, an included decoration, a directed
session and photographs afterwards. Three components differing only in their
nouns is how four pages drift apart over a year, and this repository has the
scars.

So the shape lives in one component and everything that differs is data,
including the one section each occasion genuinely needs that the others do not:

- **Anniversaries** — how a surprise is kept from a partner.
- **Maternity** — which dress, and will it fit.
- **Vow renewals** — the legal statement.

---

## 6. Photographs I need, in priority order

1. **A vow renewal ceremony**: the words being said, the guests watching, and
   the styled setup before anyone arrives. The page has two labelled gaps for
   exactly these.
2. **A maternity session in a flowing dress.** The page is built around the
   dress and shows no pregnancy.
3. **A family in one frame**, ideally across generations. Nothing in the
   collection shows a family, or a child.
4. **A pregnancy announcement frame.**
5. **An evening couple session after dark.** We sell evening lighting on the
   anniversary page and have no photograph of one with a couple in it.

---

## 7. Still open

1. **Private dining**, if a venue has agreed it. See §3. The highest-value
   thing you could confirm: it is the core premium offer competitors sell.
2. **A celebrant**, if one is genuinely available.
3. **Legal review** of the vow renewal wording. Your own flag, still open.
4. **Hair and makeup** for maternity: a supplier we can reliably call on? The
   page presents it as something to ask about rather than something we offer.
5. **How many photographs a session delivers, and when they arrive.** The rates
   are now set; the deliverable is not, on any of the three.

*(The two pricing questions from the first version of this document are
answered and closed. See §2.)*

---

## 8. Verification

- `npx tsc --noEmit` — 0 errors. `npm run lint` — clean. `npm run check` —
  25/25.
- **New guards, each proven by breaking the thing it names and watching it go
  red**, then restored. **Seven failed that test on the first pass** and were
  rewritten. The pattern was the same each time: the guard matched text that
  also appeared somewhere else. An import line satisfied two "does the page
  render this" checks. A heading reading "It creates no legal marriage" kept
  the legal check green while the sentence under it had been deleted. The word
  "embassy" in a second bullet did the same. The legal guard now requires all
  three of its claims, in the details rather than the headings. One of my own
  regexes was wrong ("no legal effect" where the copy says "has legal effect")
  and the guard caught me.
- Driven in a browser at 414px and 1280px on all three: one `h1` each, no
  heading-level skips, rates rendering with their units, **no photograph
  appearing twice on any page**, no duplicate questions, no console or page
  errors, no horizontal overflow, no em-dashes.
- Two imagery faults found by looking at the rendered pages rather than by a
  check, both now guarded: the route renders a category photograph above the
  body, and two of these pages added a hero of their own and put the same frame
  in the gallery underneath, so one photograph appeared three times. And the
  anniversary page pointed at a story that lives on the Egypt Eye site, so that
  whole section silently rendered nothing.
