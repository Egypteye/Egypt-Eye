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

## 6. Setting it up — what I did, and what needs your hands

### Done

**The production branch exists.** `flying-dresses-production` is pushed and
carries this work. It is a sibling of Egypt Eye's branch, not a child of it,
and nothing merges between them.

### Blocked — the Vercel API refuses this session

Creating the project, setting its environment variables, attaching the domain
and changing build settings all fail with the same error:

> 403 forbidden — Not authorized: Trying to access resource under scope
> `egypt-eye-travel`. You must re-authenticate to this scope or use a token
> with access to this scope.

The connector can *list* the team's projects and nothing more. There is no
Vercel CLI installed here, no stored credentials and no `VERCEL_TOKEN`, so the
documented CLI fallback is not available either. These four steps need doing in
the dashboard, by someone with access to that team.

### Dropped — the Sanity CORS origin is not needed

An earlier draft of this document listed it. It was wrong.

Every Sanity call the Flying Dresses pages make is **server-side** — the
booking rail is an async Server Component, and no client component on this
brand references Sanity at all. Server-side fetches do not use CORS. The only
thing that would have needed it is the embedded Studio, and that now returns
404 on this domain.

Adding a CORS origin would widen browser access to the dataset for no benefit,
so it is deliberately not being done.

---

## 7. The four dashboard steps, in order

**Do them in this order.** Step 2 before step 3 is the one that matters — see
the warning.

### 1. Create the project

Vercel → Add New → Project → import **`Egypteye/Egypt-Eye`**.

- **Name:** `flying-dresses-egypt`
- **Framework:** Next.js (auto-detected)
- **Root directory:** leave as the repository root
- Do **not** attach a domain yet

### 2. Set the production branch to `flying-dresses-production`

Project → Settings → **Environments** → **Production** → the branch-tracking
field.

**Not** Settings → Git. An earlier version of this document said Git, which is
where it used to live; current Vercel has moved production-branch configuration
onto the Environments page, and the Git page now only covers the repository
connection, commit comments and deploy hooks.

If it is not on the Environments page either, the reliable fallback is to
delete the project and re-import the repository — the import screen asks which
branch to deploy. Nothing is lost, because a project with no successful
deployment and no domain holds nothing.

> ⚠️ **Do this before attaching the domain.** A new Vercel project defaults its
> production branch to the repository's default branch, which here is
> `claude/egypt-eye-travel-website-fckb5t` — Egypt Eye's. If the domain is
> attached while that is still the setting, **flyingdressesegypt.com will serve
> the Egypt Eye travel site**, and it will do so without the hostname lockdown,
> because that branch does not contain it.
>
> Change the branch, confirm a deployment from `flying-dresses-production` has
> succeeded, and only then attach the domain.

### 3. Set the environment variables

Project → Settings → Environment Variables. Per §4 above. The four public ones
can be set to all environments:

```
NEXT_PUBLIC_SANITY_PROJECT_ID   eoashi0y
NEXT_PUBLIC_SANITY_DATASET      production
NEXT_PUBLIC_FLYING_DRESSES_URL  https://flyingdressesegypt.com
NEXT_PUBLIC_EGYPT_EYE_ORIGIN    https://egypteyetravel.com
```

Then add **`RESEND_API_KEY`** so the enquiry form can send. I have not set it
and will not: it is a secret, and copying one between projects is not a change
to make on someone's behalf without being asked. Use a separate Resend key for
this brand if you can — it is one more thing that cannot leak sideways.

**Add nothing else.** Specifically no `PAYPAL_*`, no `SUPABASE_*`, no
`SANITY_API_WRITE_TOKEN`, no `MIGRATE_SECRET`. §4 explains what each absence
buys.

### 4. Attach the domain — only after step 2 is confirmed

Project → Settings → Domains → add `flyingdressesegypt.com` and
`www.flyingdressesegypt.com`, then point the DNS at Vercel as it instructs.

The app already redirects `www` to the apex, so either spelling works.

### 5. Stop each project building the other's branches

Both projects watch the same repository, so by default each builds previews for
the other's branches. Previews cannot reach production, but they burn build
minutes and make the deployment list confusing.

Settings → Git → **Ignored Build Step** on each project.

> ⚠️ **The exit codes are inverted and this is the usual mistake.** Vercel
> **skips** the build when the command exits **0**, and **proceeds** when it
> exits **1**. Getting it backwards on the Egypt Eye project would stop the
> travel site deploying.

On **flying-dresses-egypt** — build only this brand's branches:

```sh
case "$VERCEL_GIT_COMMIT_REF" in flying-dresses-production|claude/zealous-volta-ec0mvn) exit 1 ;; *) exit 0 ;; esac
```

On **egypt-eye** — skip only this brand's branches, leave everything else
exactly as it is today:

```sh
case "$VERCEL_GIT_COMMIT_REF" in flying-dresses-production|claude/zealous-volta-ec0mvn) exit 0 ;; *) exit 1 ;; esac
```

This is the only step that touches Egypt Eye's configuration. It is written to
be additive — it skips two named branches and changes nothing about how the
production branch or any existing preview branch builds. If you would rather
not touch the Egypt Eye project at all, leave it: the cost is some wasted
preview builds, not any risk.

---

## 8. After it is up

- Check `https://flyingdressesegypt.com/studio` returns **404**, not a login
  screen. That one request confirms the hostname lockdown is live.
- Check the deposit button on a photoshoot page goes to
  `egypteyetravel.com/secure/photoshoot/...` and that the checkout works there
  as it does today.
- Send yourself one message from a WhatsApp button to confirm the number.
- Add the social cover (§ asset checklist) so shared links stop previewing as a
  grey rectangle.

Still outstanding and deliberately separate: **the Egypt Eye fixes** — the five
men's gawns and the two corrected fallback prices — remain on the branch and
reach the travel site only by a merge you approve.
