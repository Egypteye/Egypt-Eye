# What to do from your end

Updated 21 October 2026, after your operating brief. This replaces the
earlier version of this file.

Three kinds of item, and it matters which is which:

- **STEPS** — things to click, in order. About 30 minutes.
- **DECISIONS** — questions where I need you to pick, not research.
- **FACTS** — business information only you have. I will not invent any of it.

Your brief answered six things that were on this list last time. Those are
marked ✅ and removed from the asks.

---

# PART 1 — THE STEPS (about 30 minutes)

## Step 0 — Approve the deploy

**Nothing since the favicon is live.** Everything below is sitting on the
branch `claude/zealous-volta-ec0mvn`:

| What |
|---|
| Service-page audit, meta descriptions, your 20 business rules |
| Six Stories articles |
| The phone hero fix, the Fayoum photo, the twelve dress photos |
| The animated photo ribbon, eighteen browser-default blue links fixed |
| The Studio: five new editable sections |
| Your operating brief: the fourth experience, four real durations, six corrections |

**Do:** tell me to deploy, or merge the branch in GitHub yourself.

Nothing else in Part 1 works until this is done, because the Studio reads its
fields from the deployed app.

## Step 1 — Check two variables exist in Vercel

Vercel → your project → Settings → Environment Variables.

| Name | What it is | If missing |
|---|---|---|
| `SANITY_API_WRITE_TOKEN` | Lets the migration write to Sanity | Sanity → Manage → API → Tokens → Add token, **Editor** permission |
| `MIGRATE_SECRET` | The password on the migration URL | Invent a long random string and add it |

Both are probably already there. You only need to confirm, and to know the
value of `MIGRATE_SECRET` for Step 3.

**Do not send me either value.** They should not be in a chat log.

## Step 2 — Deploy

Vercel deploys on its own once the branch is merged. Wait for the green tick.

## Step 3 — Fill the Studio (one URL, once)

```
https://egypteyetravel.com/api/migrate?secret=YOUR_MIGRATE_SECRET&only=flyingDresses
```

Expect:

```json
{ "ok": true, "details": ["flyingDressSettings", "flyingDressPackage x4",
  "flyingDressAddOn x11", "flyingDressRental x3", "flyingDressOutfit x17"] }
```

Safe to run twice — it creates what is missing and never overwrites your
edits. **Nothing on the site will look different afterwards.**

## Step 4 — Look at it

`https://egypteyetravel.com/studio` → six new ✿ entries in the sidebar:
Settings, Photoshoots, Extras, Hire services, Wardrobe, Galleries.

## Step 5 — Prove it works (two minutes)

1. Open **Flying Dresses — Settings**, change the tagline, add a full stop.
2. **Publish**.
3. Open `/admin/paypal`, click **"Refresh the site from Sanity"**.
4. Look at the browser tab title on flyingdressesegypt.com.

If the full stop is there, you never need me for copy again. Take it back out
the same way.

## Step 6 — The first real edit: the photographs

The wardrobe documents have names and colours but **no photographs** — the
site is still using the files in the repo. Upload each dress photo in
**Wardrobe**, write one line describing it, Publish.

Then the **Photoshoots** hero images. The **Red Sea Yacht has no photograph at
all** and currently shows a labelled gap, which is the one place the site is
visibly incomplete.

---

# PART 2 — DECISIONS (pick, don't research)

## 1. ⚠️ Does the website take payment or not? — the biggest one

Your brief says customers pay via **website checkout, PayPal and payment
links**. The site says, in four places:

> "No payment is taken on this website… we will never ask you to type card
> details into a form here."

Both can't stand. Pick one:

- **A.** Payment happens on the Egypt Eye checkout, as it does today. The site
  is accurate; I soften "never" to something friendlier. *Small change.*
- **B.** Checkout moves onto flyingdressesegypt.com. *A second payment
  integration — weeks, not minutes.*
- **C.** Payment is by link and transfer, sent by your team. *Medium change —
  the current wording is misleading in a different way.*

**My recommendation: A**, until volume justifies B.

## 2. Nine Pyramids: inside the complex, or overlooking it?

Your brief says the Lounge is *"within the Giza pyramid area"*. Your earlier
instruction said the Nine Pyramids rooftop *"is not inside the archaeological
complex"*.

These may be two different venues — a lounge inside and a rooftop outside is
entirely plausible. But a whole Stories article rests on that distinction, and
a session genuinely inside the site has ticketing implications.

**Which is it?**

## 3. Where is the cancellation policy published?

Your brief says it is already on the website. It is not on
flyingdressesegypt.com — because your brochure sets out **both** a 15-day and
a 7-day provision and they overlap, so nobody could tell which applies at ten
days out.

Do you mean the Egypt Eye site? Or is there a policy that never reached this
one? **Send the real notice periods and charges and I will publish them.**

## 4. Solo / Couple / Maternity / VIP / Red Sea

Your brief lists these as package names. The site sells by **location**. Are
they a superseded scheme, or rates that sit *across* locations (a Couple rate
at the rooftop, a VIP rate at Fayoum)? The second fits your per-person pricing
and would be a real structural change.

## 5. Delivery: one week, or six to ten days?

Your brief says within one week. The site has promised **6 to 10 days** since
launch. I did not tighten it — that binds every booking already taken.
**Confirm and it changes everywhere in one edit.**

## 6. The remaining four from before

- **Cross-domain links.** The two sites don't link. Keep separate (current),
  link them, or move the seven flying-dress articles across? *I recommend
  keeping them separate; moving them is the only option that can lose
  something that works.*
- **Stock photos or labelled gaps** for the celebration and hire cards that
  have no photograph.
- **Your logo says "FLYING DRESS" singular; everything else says "Dresses".**
  Which is the real name?
- **PayPal shortcut:** if you just want the three priced shoots taking money
  now, send **one payment link per package** and I'll wire them in.

---

# PART 3 — FACTS I STILL NEED

## ✅ Answered by your brief — no longer asking

| Was asked | Your answer |
|---|---|
| Deposit percentage | 25%, balance after the experience |
| Who supplies what | In-house photographers, video, stylists. Decorations via external supplier's catalogue |
| DJ / music equipment | You provide your own |
| Where special events happen | Rooftop only |
| Rescheduling | First change free |
| Durations | Rooftop 45 min · Desert 1.5h · Fayoum 4–6h · Yacht 6h |

## Tier 1 — unblocks the most

### Prices
Your brief says to use "the current approved pricing schedule" — which I don't
have. Needed:

- **The eleven experience and hire pages** still saying "enquire": proposals,
  gender reveals, birthdays, anniversaries, maternity, vow renewals, creators,
  DJ/music, dress rental, accessories, men's wear. *A starting price is enough.*
- **The Red Sea yacht**, plus what it includes (transport? the yacht? catering?)
- **Companion fee** for someone attending but not photographed
- **Male participant rate**
- **Nine Pyramids Lounge**, **professional video**, **additional retouching**

*Once you send these you can type them in yourself — they're Studio fields.*

### The venue matrix
One table answers six questions across the site. For each rooftop:
name · standing or per-booking arrangement · **after dark?** · **amplified
music?** · **max group size** · **catering?** · **which reveal mechanisms**
(confetti, smoke, balloons, none).

### Transport boundary
Your brief says free "within the designated Giza service area" and a possible
fee beyond. **Where is that boundary, and what are the rates past it?** The
site now says a charge may apply; it can't say more without this.

## Tier 2 — rental terms

Your brief lists these as unconfirmed and they're the gap stopping the hire
pages being sellable: **security deposit amount · return deadline · damage
assessment rules · late fees · delivery charges · rental-specific cancellation.**

## Tier 3 — smaller, still needed

- **Exact dress count.** The site says twelve, by name, with photographs. Your
  brief says "approximately 12… exact inventory count remains to be
  confirmed." If it isn't twelve, the wardrobe page is wrong in a way a
  customer can count.
- **Vow renewal wording** — the sentence distinguishing a symbolic ceremony
  from a legal one should be read by someone qualified.
- **Commercial music video permissions** — anything needed beyond the venue's.
- **Commercial licensing terms** — drafted internally, so the case-by-case
  answer starts from a position. Low priority.

---

# PART 4 — NOT YOURS TO TOUCH (decided, not forgotten)

| Thing | Why |
|---|---|
| Domain, checkout origin | Wrong value takes the site down or kills every Book button |
| PayPal / Supabase credentials | Secrets. Vercel environment variables only — never a CMS, never a chat |
| Deposit percentage | One authority for money, on the Egypt Eye side where it's calculated. Two editable copies can disagree about what a customer owes |
| Layout numbers | Measured. The menu's six-item ceiling is a warning with its reasoning |
| Translations | The pipeline reads code files, not Sanity. Copy written only in the Studio stays English on every locale |

**Two things from your brief that should NOT go on the site:** the ~90%
availability figure (your brief calls it an estimate, not a guarantee — on a
public page it reads as a promise about *their* date), and any dress count you
haven't confirmed.

---

# PART 5 — STILL NEEDS A DEVELOPER

| What | Size | Priority |
|---|---|---|
| The eight celebration and creative categories | 784 lines | **Highest** — where the eleven unpriced pages live |
| The six Stories articles | 734 lines | Medium |
| The collaborate page | 125 lines | Low |
| Experience photographs | — | Medium |

Say the word and I'll do the categories next — that turns the Tier 1 price
question into something you answer in the Studio yourself.
