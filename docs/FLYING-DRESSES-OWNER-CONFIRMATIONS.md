# Flying Dresses Egypt — what needs your answer before launch

Everything on the new site is either something you supplied or something marked
as needing your confirmation. Nothing has been invented. This is the list of
what is still open, ordered so the things that cost money or credibility come
first.

You can do all of it from a browser. Where a change is a Sanity Studio edit,
that is said explicitly — nothing here needs a developer or a terminal.

---

## 1. Blocking — the site should not be advertised until these are answered

### 1.1 Confirm the three photoshoot prices are the ones you want to charge

The site shows **Sand Dunes $179**, **Pyramids Rooftop $199**, **Fayoum $349**,
all per person.

**These are now verified, not assumed.** They were read directly out of your
live Sanity dataset (project `eoashi0y`, production): `179`, `199` and `349`,
each with no discount set. All three also match your brochure and what
egypteyetravel.com was displaying.

So there is nothing to correct in the setup — the only question left is the
commercial one: **are these still the prices you want to charge?** If not,
change them in Sanity Studio on each Photoshoot document. Both brands read that
one place, so changing it changes both sites at once and needs no code.

### 1.2 "White Desert / Fayoum" — which is it?

Your brochure calls the $349 shoot **"White Desert / Fayoum"** and then
describes it as *three hours from central Cairo, white sand dunes, waterfalls
and magical lakes*. That description is Fayoum. Egypt's White Desert is at
Farafra — roughly 5–6 hours further on, a different trip with a different cost.

The site currently says **Fayoum**, because your own description is Fayoum.

**If the shoot really does run to the White Desert**, then the distance, the
duration and almost certainly the price on that page are all wrong and need
revisiting together. Please confirm which one it is, and ideally name the exact
sites (the Egypt Eye page says Wadi El Rayan and the Magic Lake).

### 1.3 The cancellation terms contradict themselves

Your brochure sets out both a **15-day** and a **7-day** provision for
amendments and cancellations, and they overlap rather than nest. From the
brochure alone it is not possible to tell what applies to a cancellation made,
say, 10 days out, nor how the charge differs for money paid after the deposit.

**So no cancellation policy has been published.** The site says deposits are
non-refundable, that they can usually be moved to another date or held as
credit, and that the exact notice periods are confirmed in writing when a date
is held. All of that is true and commits you to nothing you have not agreed.

**What is needed:** the actual rule, as a sentence per notice period. For
example: *"More than 15 days before: the deposit moves to another date at no
charge. 7–15 days: the deposit is forfeit. Under 7 days: the deposit is forfeit
and X% of the balance is due."* Once you give us that, it is published as a
proper policy page.

### 1.4 Rental, accessories and men's-wear prices

Three new services are live on the site and all three say **"price on
request"**, with a real enquiry path behind them. That was your instruction and
it is honest, but it is costing you bookings that a published price would win —
particularly on dress rental, where the whole appeal is that it is much cheaper
than a shoot.

Research found dress-rental-only is an established, separately-sold product in
Cappadocia at roughly a fifth of the price of a full shoot, and that **no
Egyptian operator appears to sell it at all**. It is the biggest single
opportunity found in this build. A price would help you take it.

What is needed for each of the three:

- **Dress rental:** the price, the length of the rental window (how many hours
  or days), the security deposit or damage terms, whether hotel delivery is free
  or charged and which areas of Cairo it covers, and which of the twelve dresses
  you are willing to send out unaccompanied — the site currently lists all
  twelve, which assumes all twelve.
- **Accessories:** see 2.1 — there is no list at all yet.
- **Men's wear:** the price as a photoshoot add-on and as a standalone hire.

### 1.5 Confirm the WhatsApp number is on WhatsApp

Every WhatsApp button on the site goes to **+20 109 761 6533**, which you
confirmed as the number for calls and WhatsApp. Please send yourself one message
through a button on the live site to confirm it lands. If that number is not
registered with WhatsApp, every WhatsApp button dead-ends into "this phone
number is not registered" — and WhatsApp is the main conversion channel.

**Note:** your brochure listed a second number, +20 128 534 3630. You named only
the one, so only the one is published. Say if the second should be shown too.

---

## 2. Content gaps that are visibly holding the site back

### 2.1 Nobody has named a single accessory

Your brochure says *"Accessories and men's outfits are available"* and never
says what they are. So the accessories page describes the service honestly and
asks the visitor to ask — it is the one deliberately short page on the site.

The grid is already built. **Send names and photographs and the page fills
itself**, with no code change.

### 2.2 What distinguishes the two Saeedy gawns, and the two Bahary ones?

Your brochure numbers five men's garments and repeats two of the names:

> 1 Saeedy Gawn · 2 Saeedy Gawn · 3 Bahary Gawn · 4 Bahary Gawn · 5 Classic Plain Gawn

The site shows them exactly like that, numbers included, because the numbers are
the only thing telling each pair apart. Nothing has been invented to fill the
gap — no fabrics, no colours, no cuts.

**What is needed:** a few words on each, or simply photographs (see the asset
checklist), plus confirmation that 1–5 is how you actually refer to them rather
than an artefact of the list.

### 2.3 There are no reviews on the site

Deliberately. Nothing reachable gave a quotable review with a traceable name
attached, and a photography brand cannot come back from inventing social proof.
Where testimonials would normally sit, the home page carries verifiable
operational facts instead and says plainly that reviews are not up yet.

**What is needed:** real reviews with real attribution, or a link to a review
platform where they already live. The moment those exist they go in — including
as structured data, which can only legitimately carry ratings that are visible
on the page.

### 2.4 Dress sizes

Not published anywhere, because nothing confirmed them. The site says to ask.
If there is a size range you are confident about, it belongs on the wardrobe
page — it is one of the most common pre-booking questions.

### 2.5 The real story of the business

The About page has no founding date, no client count, no team biographies and no
awards, because none of those were verifiable. What it has instead is a precise,
checkable account of how a shoot actually runs, which earns more trust than
unverifiable claims — but it is thinner than it should be.

**What is needed:** who founded it and when, who is on the team, roughly how
many shoots you have run. Anything you can stand behind.

---

## 3. Decisions about how the site is set up

### 3.1 Instant Booking — already on, nothing to do

**Verified in your Sanity dataset: `bookable` is `true` on all three
flying-dress shoots** (and on all seven photoshoots). So instant booking works
on the new site from the moment it goes live — the booking rail reads that same
switch.

**The deposit is 25%.** Neither the individual shoots nor your site settings set
a percentage (`depositPercent` and `defaultDepositPercent` are both empty), so
the code's default of 25% applies. That matches what the live Egypt Eye pages
show. If you want a different percentage for these shoots, set it per shoot in
Studio — do not change the code default, because that moves every product.

The new site uses the existing rail and the same PayPal account. There is no
second payment integration, deliberately: two integrations is how two sites
start quoting two different deposits for one shoot.

Where a switch is ever turned off, or a shoot loses its price, the new site
shows the enquiry path instead of a booking button — never a button that cannot
take a booking.

### 3.2 The booking step currently looks like Egypt Eye

When someone clicks "Choose your date & pay the deposit", they land on the
existing Egypt Eye booking page. Same team, same shoot, same PayPal — but it is
styled as Egypt Eye, so there is a visible seam at the most sensitive moment in
the funnel.

That was a deliberate choice. The alternative was copying a 1,200-line form that
collects dates, headcounts, extras and outfits and then runs PayPal, and a
second copy of a payment form is exactly how two sites start quoting two
different deposits for one shoot.

**The decision for you:** restyling that page in the Flying Dresses identity is
real work on the payment path and deserves its own careful change. Say the word
and it gets done properly. Until then the handoff is signposted rather than
hidden — the page says the checkout runs on the Egypt Eye booking page.

### 3.3 Point the domain, then decide about the URLs

`flyingdressesegypt.com` did not resolve while this was built, so the site has
not been tested on its own domain.

Once you point it at the Vercel project:

- `flyingdressesegypt.com` serves the Flying Dresses home page.
- `flyingdressesegypt.com/wardrobe`, `/rentals` and so on all work.
- The pages are also reachable at `egypteyetravel.com/flying-dresses/...` for
  review. Those copies are blocked from search engines, so they cannot compete
  with the real domain.

**One follow-up decision:** the canonical URLs currently keep a `/flying-dresses`
segment, which keeps every page static and fast but means the addresses search
engines index read `flyingdressesegypt.com/flying-dresses/wardrobe`. Shortening
them to `flyingdressesegypt.com/wardrobe` is a small, separate change that is
best made once the domain is live and can be tested. Worth doing — just not
worth guessing at before DNS exists.

### 3.4 Email sending for the new brand

Enquiries email `info@flyingdressesegypt.com` and the customer gets a receipt.
For those to actually send, Resend needs a verified sender for the
flyingdressesegypt.com domain, and `FLYING_DRESSES_FROM_EMAIL` set in the Vercel
environment. Until that is done the form shows an error and offers WhatsApp
instead — it does not fail silently.

### 3.5 Languages

The Egypt Eye site is translated into six languages. The Flying Dresses site is
**English only**, and its content is deliberately kept out of the translation
pipeline so it cannot quietly run up a translation bill nobody approved. Say if
you want it translated.

---

## 4. Fixed, for your information

- **Men's outfits now appear in the booking picker, and this is verified.** The
  Egypt Eye rooftop page has been telling customers *"we have traditional
  Egyptian attire for men in five styles"* while the outfit picker offered only
  dresses. The five gawns from your brochure are now in the collection.

  This repository has a rule that Sanity content replaces the code's copy
  wholesale, so there was a real risk the gawns would appear in testing and be
  invisible in production. **Checked against your live dataset: not one of the
  seven photoshoot documents has any outfits typed into it**, so the code's
  wardrobe is what production uses — and the five gawns will appear. No
  photographs yet; see the asset checklist.
- **One wardrobe, one list.** The twelve dresses and five gawns now live in a
  single file both brands read, so the two sites can never disagree about a
  garment.

---

## 5. A separate bug found on the live Egypt Eye site — not fixed here

While auditing, the live `/photoshoots` page was found to show **two different
prices for the same product on one page**: the listing says Fayoum $349 while
the FAQ text on the same page says $219. The same mismatch affects five other
products — the Exclusive Pyramids shoot ($100 vs $75), the Jumping Horse ($125
vs $120), the Running Horse ($185 vs $160) and the Proposal Setup ($350 vs $150).

The listings read live prices from Sanity; the FAQ paragraphs have older prices
written into their text, so they do not update when you change a price. Both
halves are now confirmed from both ends: Sanity holds 349, 100, 125, 185 and
350, and the FAQ prose holds 219, 75, 120, 160 and 150.

**Two related fallback prices were corrected as part of this work**, because the
new brand reads the same figures and would have inherited the error: the
repository's offline copy of the Sand Dunes price said $199 (live: $179) and
Fayoum said $219 (live: $349), both with strike-through "discounts" your Sanity
data does not have. Those only ever showed if the CMS were unreachable — the one
moment a wrong price is most expensive and least likely to be noticed. A new
check now fails if the two brands ever disagree about one shoot's price.

A visitor reading the FAQ sees a cheaper price than the one they are asked to
pay. **This was deliberately left alone**: it changes customer-facing pricing
copy on six live products and should be a reviewed change of its own, not folded
into a new brand's launch. It is worth doing soon.
