# Deploying Flying Dresses Egypt without touching Egypt Eye

The question this document answers: **can Flying Dresses Egypt go live on its
own Vercel project without putting the live Egypt Eye site at risk?**

Short answer: yes, but **a separate Vercel project is not what makes it safe**.
That assumption is the dangerous part, and this file sets out why and what
actually does the isolating.

Nothing described here has been deployed. Everything lives on the branch
`claude/zealous-volta-ec0mvn`.

---

## 1. What is on the branch that would change Egypt Eye — if merged

**If this branch is never merged into `claude/egypt-eye-travel-website-fckb5t`,
the live Egypt Eye site is not affected at all.** Verified below. But the
branch does modify nine files that already exist in production, and it is worth
knowing exactly which, because a careless merge is the one way this work could
reach the travel site.

| File | Would Egypt Eye change? | What exactly |
| --- | --- | --- |
| `src/content/photoshoots.ts` | **Yes, visibly** | Five men's gawns join the wardrobe, so the outfit picker on the three live Flying Dress product pages gains a men's section. Sand Dunes' fallback price 199→179 and Fayoum's 219→349, matching the live Sanity values, with two strike-through discounts removed that Sanity does not have. |
| `src/proxy.ts` | **Yes, slightly** | The matcher now also matches `/robots.txt` and `/sitemap.xml`, so the proxy function runs for those two paths. They are already in `isLocaleExempt`, so the response is identical — but the Supabase session refresh now runs on them, which is one extra call per crawler hit. |
| `src/app/robots.ts` | **Yes, cosmetically** | Adds `Disallow: /flying-dresses` to the live robots.txt. |
| `src/lib/email/resend.ts` | No functional change | Adds an optional `from` parameter. Every existing caller omits it and behaves byte-for-byte as before. |
| `next.config.ts` | No | Adds a development-only `allowedDevOrigins` entry. `next build` ignores it. |
| `package.json` | No runtime effect | Adds `check:flyingdresses` to the aggregate. |
| `scripts/visual-audit.mts` | No | Tooling. Stops routing a localhost audit through the agent proxy. |
| `CLAUDE.md`, `AGENTS.md` | No | Documentation. |

Plus the new files — `src/app/flying-dresses/**`,
`src/app/api/flying-dresses-enquiry`, `src/content/flyingDresses.ts`,
`src/content/outfitCollection.ts`, `src/lib/email/flyingDresses.ts` — which
add routes but change no existing behaviour.

**Verified, not assumed.** With the whole branch running, every Egypt Eye route
was requested on the Egypt Eye hostname: `/`, `/photoshoots`, `/tours`,
`/boutique`, `/studio`, `/account/login` all 200; `/api/enquiry` and
`/api/bookings/rail` answer exactly as before; `/robots.txt` and `/sitemap.xml`
still serve the Egypt Eye sitemap. Nothing regressed.

---

## 2. Why a separate Vercel project does NOT isolate anything by itself

This is the important part, and the instinct that prompted it was right.

**This repository builds one application.** A second Vercel project created
from the same repo does not build "the Flying Dresses part" — there is no such
thing. It builds the entire Egypt Eye application and serves it on a second
hostname. That deployment contains:

- **34 API routes**, among them `/api/migrate`, `/api/purge-testimonials`,
  `/api/purge-redirected-stories`, `/api/sanity/revalidate`,
  `/api/bookings/paypal/capture`, `/api/webhooks/paypal`,
  `/api/admin/discounts/export` and `/api/reservations`
- **the embedded Sanity Studio** at `/studio`, pointed at the same production
  dataset
- **the admin pages** under `/admin` and the customer account pages under
  `/account`
- **Egypt Eye's whole public site** — every tour, cruise and story

Without intervention, all of that would answer on `flyingdressesegypt.com`.

The CMS-write routes are guarded by a `MIGRATE_SECRET` bearer token and Studio
sits behind Sanity's own login, so this was never an open door. But "guarded by
a secret" is a weaker property than "does not answer", and it depends on which
environment variables the second project is given — which is easy to get wrong
once and hard to notice.

**What actually isolates the two brands is which URLs the hostname answers, not
which Vercel project builds them.**

---

## 3. What now does the isolating

### 3.1 The brand's hostname serves an allow-list

`src/proxy.ts` previously exempted `/api/`, `/auth/` and `/studio` from
rewriting on the Flying Dresses host — correct for one site, wrong for two. It
is now an **allow-list**: that hostname may serve its own page tree, its own
enquiry endpoint, and static assets. Everything else is refused.

A deny-list would let every route added in future through by default. An
allow-list fails closed.

Measured against a running server with `Host: flyingdressesegypt.com`:

| Path | Result |
| --- | --- |
| `/`, `/wardrobe`, `/rentals` | **200** — the brand's pages |
| `/robots.txt` | **200** — the brand's own |
| `/api/flying-dresses-enquiry` | **405** on GET — reachable, POST-only, correct |
| `/studio` | **404** |
| `/admin`, `/account` | **404** |
| `/photoshoots`, `/tours` | **404** |
| `/api/migrate` | **404** |
| `/api/bookings/rail` | **404** |
| `/api/webhooks/paypal` | **404** |
| `/api/enquiry` | **404** |
| `/auth/callback` | **404** |

`scripts/check-flying-dresses.mts` asserts these properties, and each assertion
was proven by breaking it and watching the check go red.

### 3.2 The Flying Dresses project needs no PayPal credentials at all

The deposit button links **absolutely** to
`https://egypteyetravel.com/secure/photoshoot/<slug>` rather than to a relative
path. So the checkout, the capture, the webhook, the reservation row and the
emails all stay on the Egypt Eye deployment, which already does them.

This is the strongest isolation available, because it is not a guard but an
absence: **a deployment with no PayPal credentials cannot take a payment.** It
also makes "the same PayPal" literally true — not the same account configured
twice, the same checkout.

---

## 4. The environment variables to give the Flying Dresses project

The principle: **give it the least that makes its own pages work.** Everything
withheld is a class of mistake that becomes impossible.

| Variable | Give it? | Why |
| --- | --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | **Yes** | Read-only; needed for prices and the booking rail's availability check. |
| `NEXT_PUBLIC_SANITY_DATASET` | **Yes** | Same. |
| `RESEND_API_KEY` | **Yes** | The enquiry form emails the desk. |
| `FLYING_DRESSES_FROM_EMAIL` | **Yes** | So mail arrives as Flying Dresses, not Egypt Eye. Needs a Resend-verified sender on the domain. |
| `NEXT_PUBLIC_FLYING_DRESSES_URL` | **Yes** | `https://flyingdressesegypt.com`, for canonicals and the sitemap. |
| `NEXT_PUBLIC_EGYPT_EYE_ORIGIN` | Optional | Defaults to `https://egypteyetravel.com`. Only set it if the travel site moves. |
| **`PAYPAL_*` (all)** | **No** | It cannot and must not take money. |
| **`SUPABASE_SERVICE_ROLE_KEY`** | **No** | Nothing on this brand's pages writes to the database. |
| **`NEXT_PUBLIC_SUPABASE_*`** | **No** | No accounts, no login on this brand. |
| **`MIGRATE_SECRET`** and other maintenance secrets | **No** | Those routes 404 here anyway. Withholding it is the second lock. |
| **`SANITY_API_WRITE_TOKEN`** | **No** | This brand only reads. |

Without a Supabase URL the enquiry route's rate limiter degrades to allowing
requests rather than failing them — acceptable for a form that only sends an
email, and the honeypot still applies. Say the word if you would rather it had
a rate-limit store of its own.

---

## 5. The remaining shared surfaces, stated plainly

Even after all of the above, two things are genuinely shared and cannot be
separated without duplicating the business:

1. **The Sanity dataset.** Both sites read the same photoshoot documents, which
   is the point — one price, one wardrobe, one Instant Booking switch. The
   Flying Dresses deployment only ever reads, and holds no write token.
2. **The Resend account**, if one key is used for both. A separate Resend API
   key for the Flying Dresses domain would remove even that, and is worth doing
   when the sender domain is verified.

Everything else — payments, database, admin, CMS editing, customer accounts —
is now on the Egypt Eye deployment alone.

---

## 6. Next steps, in order, for your approval

Nothing below has been done.

1. **Create the second Vercel project.** Same GitHub repo
   (`Egypteye/Egypt-Eye`), **production branch set to a Flying Dresses branch —
   not Egypt Eye's**. The two projects then deploy from two branches and never
   interfere.
2. **Set its environment variables** per §4 — and confirm the PayPal and
   Supabase ones are absent rather than merely unset in one environment.
3. **Add `flyingdressesegypt.com`** (and `www.`) as domains on that project
   only, and point the DNS at it.
4. **Stop the Egypt Eye project building this branch.** By default a Vercel
   project builds preview deployments for every branch in its repo. Those are
   previews and cannot reach production, but they burn build minutes and are
   confusing. An Ignored Build Step on the Egypt Eye project settles it.
5. **Add the Sanity CORS origin** for the new domain if the booking rail's
   availability check needs it.
6. **Decide separately about the Egypt Eye fixes.** The five men's gawns and the
   two corrected fallback prices are genuine improvements to the travel site and
   are currently sitting on this branch. They reach Egypt Eye only by a
   deliberate merge, and that should be its own reviewed change — not a
   side-effect of launching a second brand.

Steps 1 to 5 touch no Egypt Eye configuration. Step 6 is the only one that
changes the live travel site, and it is deliberately last and separate.
