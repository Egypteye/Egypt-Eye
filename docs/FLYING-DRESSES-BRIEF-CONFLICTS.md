# Where the October 2026 operating brief and the live website disagree

The brief says, in §15: *"Where the live website differs from the operating
information confirmed by management, the discrepancy should be reviewed and
resolved before changes are published,"* and *"The operational information in
this document should not automatically override a published customer
commitment without management review."*

So this file is the list of places where it does differ. Everything here is
**unchanged on the site** and waiting for your answer. Everything applied is
in the commit; this is only what was not.

---

## 1. Does the website take payment, or does it not?

**The brief, §12.1:** customers can book and pay through *website checkout,
PayPal, and payment links.*

**The site today**, in four places, says the opposite in strong terms:

> "No payment is taken on this website. Nothing on these pages charges a card,
> and we will never ask you to type card details into a form here."

> "You do not book on this website. You enquire, and we confirm."

This is the single largest discrepancy in the brief, and it is not a wording
fix. The current language is a trust promise, written deliberately, and it is
also *currently true* of flyingdressesegypt.com: there is no checkout on that
domain. The Book button hands over to `egypteyetravel.com/secure/...`, which
is where a card is actually charged.

So there are three readings and they need different work:

| If you mean | Then |
|---|---|
| **A.** Payment happens on the Egypt Eye side, as now | The site is already accurate. The wording could say "we take payment, on our secure checkout" instead of "never", which is friendlier and still true. Small copy change. |
| **B.** Payment should happen on flyingdressesegypt.com | That is the PayPal "Option B" from before — a second checkout to build. Weeks, not minutes. |
| **C.** Payment happens by link and bank transfer, sent by the team | The current wording is misleading in a different way, because a payment link *is* a card payment the business sent you. Medium copy change. |

**Nothing changed. Tell me A, B or C.**

---

## 2. Nine Pyramids: inside the complex, or overlooking it?

**The brief, §5:** *"An additional photography session at Nine Pyramids
Lounge, **within the Giza pyramid area**, can be added to an existing
package."*

**Your earlier instruction:** *"The Nine Pyramids rooftop offers pyramid
views; it is **not** inside the archaeological complex."*

These may well both be true of two different places — a lounge inside the site
and a rooftop outside it are entirely plausible as separate venues. But I
cannot tell from here, and the distinction is load-bearing:

- It is the subject of a whole Stories article, *"A rooftop with a view of the
  pyramids is not the pyramid complex"*, which exists because competitors blur
  exactly this.
- A session genuinely inside the archaeological area has ticketing and
  permit implications the rooftop does not.

**What I did:** added the Nine Pyramids Lounge as an extra, priced on request,
describing it only as "a different setting" and saying nothing about which
side of the fence it is on. **Confirm which it is** and I will make both the
add-on and the article precise.

### RESOLVED, October 2026

You confirmed it: it is the **Nine Pyramids View, inside the Giza complex**,
offered on request. Not a lounge.

The extra now says exactly that, and it matches how Egypt Eye already sells
the same vantage point by name, so the two brands finally describe one place
the same way. `scripts/check-flying-dresses.mts` fails if the word "Lounge"
comes back anywhere in this brand's content, or if the extra stops saying it
is inside the Giza complex, because that is the part carrying the ticketing
and permit implications.

Still outstanding on this one: **what it costs**, and whether access needs
arranging per date. The extra says "on request" until you give us a figure.

---

## 3. "The cancellation policy is already published on its website"

**The brief, §13.** It is not, on this one. `cancellation.published` is
`false` on flyingdressesegypt.com and the site says only that terms are
confirmed in writing when a date is held.

That was deliberate: your brochure sets out **both** a 15-day and a 7-day
provision for amendments and cancellations, and they overlap rather than nest,
so it is not determinable which applies to a cancellation made ten days out.

Two possibilities: the brief means the **Egypt Eye Travel** site, which does
publish one; or there is a policy you consider published that never reached
this site. **Which?** If you send the real notice periods and charges, I will
publish them here.

---

## 4. Package names: Solo, Couple, Maternity, VIP, Red Sea

**The brief, §15** lists these as "previously identified" and says their
current availability and inclusions "should be verified against the live
website."

The live site sells **by location**, not by party size: Sand Dunes, Pyramids
Rooftop, Fayoum, and now Red Sea. Only "Red Sea" appears in both lists.

So either those five are an older scheme now superseded, or they are a pricing
dimension that sits *across* the locations — a Couple rate at the rooftop, a
VIP rate at Fayoum. The second reading fits §8, which prices per participating
person with a reduced companion fee and a separate male rate.

**Nothing changed.** If it is the second, that is a real structural change —
each location would carry several rates — and I need the matrix before
building it.

---

## 5. Delivery: one week, or six to ten days?

**The brief, §4.1:** *"the expected delivery timeframe is within one week."*

**The site:** "delivered in 6 to 10 days", in the inclusions, the FAQ and on
every shoot page.

I did **not** tighten it. Shortening a published delivery promise from ten days
to seven is a commitment the operation has to keep on every booking, including
the ones already taken. If seven days is the real standard, say so and I will
change it everywhere in one edit — it is a Studio field now.

---

## 6. Two claims the brief contains that should NOT go on the site

Flagging these so nobody later mistakes them for approved copy.

- **"approximately 90% of requested bookings"** (§11). The brief itself calls
  this an operational estimate and explicitly not a guarantee. A conversion
  figure like that on a public page reads as a promise about *your* date.
- **"approximately 12 flying dresses… exact inventory count remains to be
  confirmed"** (§3). The site says twelve, definitively, and lists them by
  name with photographs. If the real number is not twelve, the wardrobe page
  is wrong in a way a customer can count.

---

## What WAS applied from the brief

For completeness, so you can see the line I drew. All of this is in the commit:

- The **fourth experience** (Ain Sokhna yacht), which the site did not mention
  at all — added, with no price, because the brief confirms the product and
  explicitly does not confirm the price.
- **Real durations per experience**, replacing "30 to 45 minutes" printed for
  every product on five pages. It was right for the rooftop only.
- **Transport qualified**: free within the Giza service area, possible charge
  from further out in Cairo including New Cairo.
- **A Reel is included** with every experience, and the old "Two Instagram
  Reels" extra now says so rather than selling you something you already have.
- **Unedited images free on request**, as compressed JPGs, not RAW.
- **Professional video**, **additional retouching** and the **Nine Pyramids
  session** added as extras, all priced on request.
- **"Stylist"** rather than "assistant", which is both your word and the more
  accurate one.
- **Sizing language softened** from "cut to fit all sizes" to adjustable,
  wide-ranging and confirmed per person — per the brief's own warning against
  guaranteeing universal fit.
