# What I need from you, and what to do in what order

Written 20 October 2026. Nothing below needs a terminal.

There are two kinds of item here and it matters which is which:

- **Steps** — things to click, in order. About 30 minutes.
- **Answers** — business facts only you have. I will not invent any of them,
  which is why eleven pages still say "enquire" instead of a price.

---

# PART 1 — THE STEPS

## Step 0 — Before anything: approve the deploy

Five commits are sitting on the branch `claude/zealous-volta-ec0mvn` and
**none of them are live**. Everything since the favicon is held:

| Commit | What it does |
|---|---|
| `f617ec2` `3332941` `041aa72` | Service page audit, meta descriptions, your business rules |
| `6c183e8` | Six Stories articles |
| `e2c3eb3` | The phone hero fix, the Fayoum photo, the dress photos |
| `1fa9d00` | The animated photo ribbon, eighteen blue links fixed |
| `46410a1` `83af364` | The Studio |

**What to do:** tell me to deploy, or merge the branch yourself in GitHub.
Nothing in Part 1 past this point works until the site has been deployed,
because the Studio reads its fields from the deployed app.

---

## Step 1 — Check two environment variables exist in Vercel

Vercel → your project → Settings → Environment Variables. You are looking for:

| Name | What it is | If it is missing |
|---|---|---|
| `SANITY_API_WRITE_TOKEN` | Lets the migration write to Sanity | Sanity → Manage → API → Tokens → Add token, **Editor** permission. Copy it once; it is never shown again. |
| `MIGRATE_SECRET` | The password on the migration URL | Invent a long random string and add it. |

Both are probably already there — `/api/migrate` has been used before. You
only need to confirm, and to know the value of `MIGRATE_SECRET` for Step 3.

**Do not send me either value.** I do not need them and they should not be in
a chat log. If a token ever leaks, revoke it in Sanity and add a new one.

---

## Step 2 — Deploy

Vercel deploys on its own once the branch is merged. Wait for the green tick.

---

## Step 3 — Fill the Studio (one URL, once)

In your browser, visit:

```
https://egypteyetravel.com/api/migrate?secret=YOUR_MIGRATE_SECRET&only=flyingDresses
```

Replacing `YOUR_MIGRATE_SECRET` with the value from Step 1.

You should see something like:

```json
{ "ok": true, "migrated": 5, "revalidated": true,
  "details": ["flyingDressSettings", "flyingDressPackage x3",
              "flyingDressAddOn x8", "flyingDressRental x3",
              "flyingDressOutfit x17"] }
```

**This is safe to run twice.** It creates what is missing and never touches
what is already there. There is no mode that overwrites your edits.

**Nothing on the website will look different afterwards.** Every value came
from the files the site already renders. That is checked automatically, not
assumed.

---

## Step 4 — Look at it

Go to `https://egypteyetravel.com/studio`. In the left sidebar, below the
Boutique, you will see six new entries marked ✿:

- **Flying Dresses — Settings**
- **Flying Dresses — Photoshoots**
- **Flying Dresses — Extras**
- **Flying Dresses — Hire services**
- **Flying Dresses — Wardrobe**
- **Flying Dresses — Galleries**

---

## Step 5 — Prove it works (two minutes, and worth doing)

1. Open **Flying Dresses — Settings**.
2. Change the tagline slightly. Add a full stop.
3. Click **Publish**.
4. Open `https://egypteyetravel.com/admin/paypal` and click
   **"Refresh the site from Sanity"**.
5. Open `https://www.flyingdressesegypt.com` and look at the browser tab
   title.

If the full stop is there, the whole chain works and you never need me for
copy again. Then take the full stop back out the same way.

Without Step 4 the change still appears — it just waits up to an hour.

---

## Step 6 — The first real edit: upload the dress photographs

The wardrobe documents have names and colours but **no photographs** — the
site is still using the twelve files in the repo. That is on purpose, so
nothing changed when you ran the migration.

For each garment in **Wardrobe**: add the photograph, write one line
describing it, Publish. From then on that dress's picture is yours to change.

Same for the three **Photoshoots** and their hero images.

---

# PART 2 — THE ANSWERS I NEED

Ranked by how much they unblock. Reply in any form — a voice note, a scribbled
list. "We don't do that" is a perfectly good answer and is often the most
useful one, because removing a claim is faster than confirming one.

## Tier 1 — these unblock the most

### 1. Prices for eleven pages
Every experience and hire page says "enquire", which is honest and is also why
none of them can answer the question a visitor arrived with. A *starting*
price is enough: "from $X, depending on the decoration" can go live.

| Page | Needs |
|---|---|
| Marriage proposals | A starting price, and what it includes |
| Gender reveals | A price with video, and one without |
| Birthdays and celebrations | A starting price, or the basis you quote on |
| Anniversaries and romance | A starting price |
| Maternity and family | A price |
| Vow renewals and engagements | A starting price |
| Creators and editorial | Session, half-day, full-day |
| DJ and music | See 5 — the model itself is undecided |
| Rent a dress | Per-day |
| Accessories | Price, or "priced with the dress" |
| Men's wear (gawns) | Per-day |

*Once you answer this you can type these in yourself — they are Studio fields
now.*

### 2. The venue matrix
The rooftop is a hotel's, not ours, and six separate questions across the site
are all asking the same thing. One table settles them. For each rooftop you
have an arrangement with:

- Its name, and whether the arrangement is standing or booked each time
- Does it permit sessions **after dark**?
- Does it permit **amplified music**, and on what conditions?
- Maximum **group size**
- Is **catering or private dining** genuinely available, and on what terms?
- Which **reveal mechanisms** are allowed (confetti, smoke, balloons, none)?

Until this exists the site cannot say an evening, a DJ set, a dinner or a
particular reveal is available — only that it may be, subject to the venue.

### 3. Suppliers: which are real, which are aspirational
For each, a supplier you can reliably call, or remove it from the site?
Live musician / DJ · cake, flowers, refreshments · transport to and from the
hotel · hair and makeup · a celebrant for vow renewals · sound equipment and
generators.

## Tier 2 — decisions, no homework

### 4. PayPal and instant booking
Today the Book button hands over to `egypteyetravel.com/secure/...`, where the
deposit is calculated. That is one payment integration and one authority for
money, which is the right shape. Two options:

- **A. Leave it.** Simplest, safest, already works. The customer briefly sees
  the other brand's domain at checkout.
- **B. Checkout on the Flying Dresses domain.** Better for the brand, and it
  means a second PayPal integration to build and keep in step.

I recommend **A** until the volume justifies B. Your call, not mine.

*Alternatively*, if you just want the three photoshoots to take money now:
send me **one PayPal payment link per package** ($179 / $199 / $349) and I
will wire them in without building anything.

### 5. The DJ and music model
Not the number — the shape. A coordination fee on top of a shoot? An hourly
production rate? A package? Custom quote only?
Also: **the equipment inventory** — exactly which cameras and lights exist, so
the page can be specific instead of saying "our equipment".

### 6. Delivery standard for the experience pages
The home page claims "more than a hundred colour-graded photographs" for the
three photoshoots. Does that figure apply to the celebration and creative
sessions too? If not, what does — how many images, within how many days?

### 7. The two sites: should they link to each other?
`egypteyetravel.com` already publishes seven flying-dress articles, including
a 21,000-character guide. The sites currently do not link, because your rule
is to keep them separate.

- **A. Keep them separate** (current). Costs some search authority both ways.
- **B. Linked in public.** A few honest links each way.
- **C. Move the seven articles to the Flying Dresses domain with redirects.**
  **Not recommended** — it moves established pages to a domain with no
  history, and it is the only option that can lose something that works today.

### 8. Photographs for the empty cards
Several celebration and hire cards have no photograph and show a labelled gap.
You said I may use Pexels or Unsplash if the Drive had nothing. I have not,
because this brand's rule is that a visitor must never mistake a stock photo
for your work — so I want you to pick:

- **A. Use stock**, clearly credited and never captioned as your shoot.
- **B. Keep the labelled gaps** until you shoot them.

### 9. Your logo says "FLYING DRESS Egypt". The site says "Flying Dresses Egypt".
Singular in the artwork, plural everywhere else — the domain, the brochure,
every page. Which is the real name? If it is the plural, the logo needs a
corrected export. If it is the singular, I change the site.

## Tier 3 — needs a qualified eye, not a decision

### 10. The cancellation policy
Your brochure sets out **both** a 15-day and a 7-day provision for amendments
and cancellations, and they overlap rather than nest. It is not determinable
which applies to a cancellation made ten days out. The site currently says the
terms are confirmed in writing when a date is held — true, useful, and commits
you to nothing. To publish a real policy I need the actual notice periods and
charges.

Related: **the deposit percentage and deadline**, for the deposit-led model in
your rule 10.

### 11. Two sentences someone qualified should read
- **Vow renewal wording.** The page distinguishes a symbolic ceremony from a
  legal one. That is the sentence stopping a customer believing they are
  legally married.
- **Commercial music video permissions.** Whether anything beyond the venue's
  permission is needed, confirmed against an authoritative source.

### 12. Commercial licensing terms
Per your rule 9 these are handled case by case and are not advertised. Worth
drafting standard internal terms so the case-by-case answer starts from a
position rather than from nothing. Low priority.

---

# PART 3 — WHAT I AM NOT ASKING FOR, AND WHY

So you know these are decided, not forgotten.

| Thing | Why you do not need to touch it |
|---|---|
| The domain, the checkout origin | Technical. Wrong value takes the site down or kills every Book button. Kept out of the Studio deliberately. |
| PayPal / Supabase credentials | Secrets. They live in Vercel's environment variables and must never appear in a CMS or a chat. |
| The deposit percentage | One authority for money. It lives on the Egypt Eye side where the deposit is actually calculated. Two editable copies is two numbers that can disagree about what a customer owes. |
| Layout numbers | Measured. The menu's six-item ceiling is surfaced as a warning with its reasoning, which is the part you can act on. |
| Translations | The translation pipeline reads the code files, not Sanity. Copy written only in the Studio stays English on every locale. A real limit, and it applies to the travel site too. |

---

# PART 4 — STILL IN CODE

Honest list of what still needs me. Scoped, not attempted, because a type that
looks editable and is not is worse than one that is obviously missing.

| Still needs a developer | Size | Priority |
|---|---|---|
| The eight celebration and creative categories | 784 lines | **Highest** — this is where the eleven unpriced pages live |
| The six Stories articles | 734 lines | Medium |
| The collaborate page | 125 lines | Low |
| Experience photographs | — | Medium, pairs with the categories |

Say the word and I will do the categories next, which would make Tier 1
question 1 something you can answer directly in the Studio.
