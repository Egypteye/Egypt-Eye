# Egypt Eye Travel and Tours — Website

A Next.js site for egypteyetravel.com with a built-in content backend
([Sanity](https://sanity.io)) — tours, experiences, photoshoots, blog posts,
testimonials, FAQ, and site-wide settings are all editable from a login page
at `/studio`, no code required.

This repository also contains **Egypt Eye OS**, the company's internal
operating system, at `/os`. It is a separate product sharing one identity
provider: the public site sells the trip, and the OS runs it. See
**[EGYPT-EYE-OS.md](EGYPT-EYE-OS.md)** for what it does, how to switch it on,
and how it is built.

## Editing content (the day-to-day way)

Once Sanity is set up (see below) and the site is deployed, go to
**`yoursite.com/studio`**, log in, and edit:

- **Tours**, **Extra Experiences**, **Photoshoot Packages** — copy, pricing,
  itineraries, included/excluded lists, photos
- **Blog Posts** — title, cover photo, excerpt, and a full rich-text article
  body (headings, bold/italic, links, inline images)
- **Testimonials**, **FAQ** — add/edit/reorder freely
- **Site Settings** — brand copy, contact info, social links, booking
  policies (one singleton entry, always at the top of the sidebar)

Changes go live within about a minute (no rebuild, no re-upload). Photos are
uploaded directly in the Studio — drag and drop, Sanity handles hosting,
optimization, and cropping automatically.

### If Sanity isn't set up yet

The site still works with zero configuration: every content type falls back
to plain data files in `src/content/*.ts` (the original copy this site
shipped with) whenever Sanity has nothing for it. That fallback is
per-content-type, so you can migrate gradually — e.g. tours can come from
Sanity while blog posts still come from `stories.ts`, with no code changes
either way. See `src/sanity/fetchers.ts` if you want to see exactly how that
decision is made.

## Setting up Sanity (one-time)

1. Go to **[sanity.io](https://sanity.io)** and create a free account.
2. Create a new project (any name). Note its **Project ID**, shown on the
   project's dashboard.
3. In Vercel (see Deployment below), add these environment variables:
   - `NEXT_PUBLIC_SANITY_PROJECT_ID` — the Project ID from step 2
   - `NEXT_PUBLIC_SANITY_DATASET` — `production` (Sanity creates this dataset
     by default)
4. Redeploy. Visit `yoursite.com/studio` and log in with the same account —
   you'll see the content types listed above, all empty.

### Populating it with the existing content

Rather than re-typing all 11 tours, 6 experiences, 2 photoshoots, etc. by
hand, a one-time migration copies everything from `src/content/*.ts` into
Sanity for you:

1. In [sanity.io/manage](https://sanity.io/manage) → your project → **API →
   Tokens**, create a token with **Editor** permissions. Copy it.
2. In Vercel, add two more environment variables:
   - `SANITY_API_WRITE_TOKEN` — the token from step 1
   - `MIGRATE_SECRET` — any random password-like string you make up
3. Redeploy, then visit (once, in your browser):
   ```
   https://yoursite.com/api/migrate?secret=YOUR_MIGRATE_SECRET
   ```
   You'll see a JSON summary of everything that was created. Refresh
   `/studio` — it's now populated.
4. It's safe to visit that URL again later (e.g. after editing
   `src/content/*.ts` further) — it re-syncs from the local files without
   creating duplicates, but note it **will overwrite** any edits already
   made directly in the Studio for those same tours/experiences/etc.
   Afterwards, remove `MIGRATE_SECRET` from Vercel's environment variables
   (or just don't reuse the URL) so the endpoint can't be triggered by
   anyone who happens to guess it.

## Setting up instant content updates

By default, a page you edit in Studio can take up to an hour to show up on
the live site (a deliberate tradeoff to keep hosting costs down — see the
comment on `REVALIDATE_SECONDS` in `src/sanity/fetchers.ts`). This makes
publishing show up immediately instead, via a webhook Sanity calls the
moment you hit Publish.

1. In Vercel → Project → Settings → Environment Variables, add
   `SANITY_REVALIDATE_SECRET` — any random string you make up yourself
   (same idea as `CRON_SECRET` / `MIGRATE_SECRET` above).
2. In [sanity.io/manage](https://sanity.io/manage) → your project → **API →
   Webhooks**, click **Create webhook**:
   - **Name**: anything, e.g. "Revalidate site"
   - **URL**: `https://yoursite.com/api/sanity/revalidate`
   - **Dataset**: `production`
   - **Trigger on**: Create, Update, and Delete (leave the filter blank —
     it should fire for every document type)
   - **HTTP method**: `POST`
   - **HTTP Headers**: add one — `Authorization` = `Bearer YOUR_SECRET`
     (the exact same string as `SANITY_REVALIDATE_SECRET` in Vercel)
   - Save.
3. Redeploy so Vercel picks up the new environment variable. From then on,
   publishing anything in Studio refreshes the live site within a few
   seconds — no need to wait, and no need to touch this again.

## Setting up email delivery (Resend)

The **Customize Your Tour** form (`/customize`) submits to `/api/customize-request`,
which emails the details to whatever address is in **Site Settings → Contact →
Email** via [Resend](https://resend.com). Without this configured, the form
returns an error instead of sending.

1. Go to **[resend.com](https://resend.com)** and create a free account
   (100 emails/day, 3,000/month on the free tier — plenty for a contact form).
2. **Verify a sending domain** so email can reach *any* inbox reliably —
   Resend → **Domains** → **Add Domain**, enter your real domain (e.g.
   `egypteyetravel.com`), and add the DNS records it shows you (a few TXT/CNAME
   records) wherever your domain's DNS is managed. Verification usually takes
   a few minutes once the records are added.
   - You *can* skip this and test immediately with Resend's shared
     `onboarding@resend.dev` sender, but it will only deliver to the email
     address you signed up to Resend with — fine for a quick test, not for
     production, since real submissions need to reach your actual inbox.
3. Resend → **API Keys** → **Create API Key** (Sending access is enough).
   Copy it — you won't be able to see it again.
4. In Vercel → Project → Settings → Environment Variables, add:
   - `RESEND_API_KEY` — the key from step 3
   - `RESEND_FROM_EMAIL` — once your domain is verified, something like
     `Egypt Eye Travel <bookings@egypteyetravel.com>`. Leave unset to use the
     shared `onboarding@resend.dev` sender (only reaches your Resend
     account's own email, per the caveat above).
5. Redeploy (or trigger one from the Vercel dashboard — env var changes
   don't apply to already-running deployments). Submit the Customize Your
   Tour form once to confirm the email arrives.

## Setting up the Pinterest integration

Every published Story (blog article) gets pinned to Pinterest automatically —
a photo, an SEO-friendly title/description, and a link back to the article —
both as a one-time backfill of everything already published, and on its own for
every new story going forward. Nothing is ever pinned twice. See `/admin/pinterest`
for connection status and to run the initial backfill.

1. Create a **Pinterest Business account** if you don't already have one (or
   convert a personal account — free, in Pinterest's settings), then a
   **Developer App** at [developers.pinterest.com/apps](https://developers.pinterest.com/apps).
2. On that app's settings, add this as an allowed **redirect URI** (use your
   real domain): `https://yourdomain.com/api/pinterest/oauth/callback`
3. In Vercel → Project → Settings → Environment Variables, add:
   - `PINTEREST_APP_ID` and `PINTEREST_APP_SECRET` — from the app you just
     created.
   - `CRON_SECRET` — any random string you make up. This is what proves the
     daily sync request in `vercel.json` actually came from Vercel's own
     scheduler, not a random visitor hitting the URL.
4. Run the new `supabase/migrations/0016_pinterest_connection.sql` migration
   in the Supabase SQL editor (same as every other migration in
   `supabase/migrations/`) — this is where the Pinterest connection (access
   token, refresh token, which board to pin to) is stored.
5. Redeploy, then visit `/admin/pinterest`: click **Connect Pinterest**,
   authorize Egypt Eye on Pinterest, pick which board new Pins should go to,
   then click **Pin Remaining Stories** (repeatable — it does 25 at a time) to
   work through the backfill of everything already published. After that,
   the daily cron job takes over for every new story on its own (Vercel
   Hobby plans only allow once-a-day crons — an hourly schedule fails
   deployment outright rather than silently downgrading).

## Setting up the AI concierge

There's no public chat widget on the site (removed by request — it used to
float bottom-right above the WhatsApp button). The one remaining AI feature is
**"Ask Egypt Eye"**, the concierge inside a customer's **My Egypt** portal
after they've reserved a tour (`src/app/api/concierge/route.ts`) — it only
ever answers using that signed-in customer's own reservation details, grounded
in the site's real tours/policies/FAQs (`src/content/chatContext.ts`), and is
explicitly instructed never to invent a price or a detail that isn't in that
context.

It runs on **Google Gemini's free tier** — no credit card required.

1. Go to **[aistudio.google.com/apikey](https://aistudio.google.com/apikey)**,
   sign in with a Google account, and click **Create API key**.
2. In Vercel → Project → Settings → Environment Variables, add:
   - `GEMINI_API_KEY` — the key from step 1
3. Redeploy. Until this is set, "Ask Egypt Eye" shows an error instead of
   answering — nothing else on the site depends on this key.

The free tier's rate limit is generous for a small business site; if you ever
outgrow it, the same code works with a paid Gemini key with no changes.

## Setting up accounts, newsletter & the 4% discount system

Customer accounts, the newsletter signup, unique discount codes, saved
journeys, reservations, and the "My Egypt" portal all run on
**[Supabase](https://supabase.com)** — a free hosted Postgres database with
built-in secure authentication (password hashing, email verification,
password reset are all handled by Supabase Auth, not by this codebase).
Without it configured, the site still works exactly as before — the
account/newsletter/reservation UI shows a "not set up yet" state instead of
crashing.

1. Go to **[supabase.com](https://supabase.com)** → sign up (free, no card
   required) → **New Project**.
2. Once it's ready, open the **SQL Editor** and run the contents of
   `supabase/migrations/0001_init.sql` from this repo once. It creates every
   table (profiles, newsletter subscribers, discount campaigns/codes,
   journeys, reservations, etc.) with Row Level Security already configured,
   and seeds the default "Newsletter 4% Off" campaign.
3. Go to **Authentication → Email Templates** and turn on **Confirm email**
   (this is what makes email verification real, not simulated). Under
   **Authentication → URL Configuration**, set the **Site URL** to your real
   domain (or `http://localhost:3000` for local dev).
4. Go to **Project Settings → API** and copy three values into Vercel →
   Project → Settings → Environment Variables (and your local `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` — **secret**, never exposed to the browser;
     only server code (Route Handlers, Server Actions) is allowed to use it.
5. Also set `NEXT_PUBLIC_SITE_URL` to your real domain — verification,
   password reset, and unsubscribe links are built from it.
6. Redeploy. Discount emails and account emails reuse the same Resend setup
   from **Setting up email delivery** above — no separate email provider
   needed.

### Making yourself an admin

The admin dashboards (`/admin`) check `profiles.role = 'admin'`. After
creating your own account on the live site, open Supabase → **Table
Editor → profiles**, find your row, and change `role` from `customer` to
`admin`.

### Payments

There's no payment provider wired in yet — reservations are requests the
Egypt Eye team follows up on by email/WhatsApp, exactly like the existing
Customize Your Tour flow. The `reservations` table is deliberately shaped so
a real checkout (Stripe, using its Coupons/Promotion Codes API rather than a
second parallel discount system) can be added later without a rework — see
`supabase/migrations/0001_init.sql`'s comments.

## Setting up Egypt Eye OS (the internal operating system)

Egypt Eye OS lives at **`yoursite.com/os`**. It is where the company operates
*after* the reservation desk closes a deal — trips, crew, vehicles, dresses,
suppliers, costs, approvals, incidents, the content pipeline, and the knowledge
that would otherwise live in one person's head.

It runs on the same Supabase project as customer accounts, so there is no
second database to create.

1. Add two environment variables in Vercel → Settings → Environment Variables:

   - `SUPABASE_SERVICE_ROLE_KEY` — from supabase.com → your project → Project
     Settings → API → **service_role**. Never expose this to the browser and
     never prefix it `NEXT_PUBLIC_`. The OS needs it because every internal
     table has Row Level Security enabled with no client policy at all — the
     browser's key can read and write nothing there, and all access goes
     through server code that checks a permission first.
   - `CRON_SECRET` — any random string you make up. It protects the
     automation sweep. `vercel.json` already schedules the call, daily at
     05:00 UTC (07:00 in Cairo), so the overnight alerts land before anyone
     starts work.

     The daily cadence is deliberate: Vercel's Hobby plan allows two cron
     jobs and will only trigger them once a day, and this project already
     uses one for the Pinterest sync. On Pro you can change that schedule to
     `0 * * * *` for an hourly sweep, which makes the enquiry response-time
     alert markedly more useful — it is the one thing in the sweep where a
     day's delay costs something real. Nothing else in the OS depends on how
     often it runs, and the endpoint returns 503 rather than running open if
     `CRON_SECRET` is missing.

2. In Supabase → SQL Editor, run these files from `supabase/migrations/`,
   in order. All are safe to re-run.

   - `0018_egypt_eye_os_core.sql` — the schema
   - `0019_egypt_eye_os_config.sql` — permissions, roles, services, statuses
   - `0020_egypt_eye_os_demo.sql` — realistic demo data (optional, but the
     fastest way to see what the product does; every trip is dated relative to
     the day you run it)
   - `0021_egypt_eye_os_functions.sql` — reference sequences and search
   - `0022_egypt_eye_commercial.sql` — the commercial layer: partner
     companies, leads, deals, agreements and the links back to trips. It also
     promotes any existing `kind = 'agency'` client into a company, keeping
     the person as its contact — nothing is deleted and no history moves.
   - `0023_egypt_eye_commercial_config.sql` — commercial permissions, the two
     pipelines and their stages, lost reasons and the published lead-scoring
     rules
   - `0024_egypt_eye_commercial_demo.sql` — commercial demo data (optional),
     which connects to the trips 0020 already created

3. Link your own login to a staff record. Sign up at `/account/signup` if you
   have not, then in the SQL Editor:

   ```sql
   update public.os_employees
   set user_id = (select id from auth.users where email = 'you@egypteyetravel.com')
   where code = 'EE-001';   -- the Owner in the demo data
   ```

4. Open `yoursite.com/os`.

To see how the permission system behaves, link your account to a different code
and reload — `EE-003` (Operations) plans and staffs every trip but cannot see a
selling price anywhere, while `EE-017` (Driver) sees only their own runs. The
full list is in [EGYPT-EYE-OS.md](EGYPT-EYE-OS.md).

## Images

Every tour/experience/photoshoot/blog post has an optional **Photo** field
in the Studio. Until a real photo is uploaded, the site shows an elegant
gradient placeholder instead (see `src/components/PlaceholderImage.tsx` and
`SmartImage.tsx`, which decides which one to render). Each item also has a
"Placeholder color" field controlling that gradient's mood — useful as a
guide for which real photo fits once you have one.

The homepage hero also auto-rotates through five of these placeholder tones
with a slow Ken Burns zoom (`src/components/HeroSlideshow.tsx`) to stand in
for real photography/video. To use real video instead, swap its
`<PlaceholderImage>` slides for a `<video autoPlay muted loop>` pointing at
a file in `public/videos/`.

## Brand

- **Logo**: the real Eye of Horus mark, in `public/brand/`:
  - `egypt-eye-mark-gold.png` / `egypt-eye-mark-black.png` — trimmed, web-sized
    (800px) transparent PNGs, used in `Navbar.tsx` and `Footer.tsx`.
  - `egypt-eye-badge-gold.png` — the circular seal version, used on the About page.
  - `originals/` — the untouched files as uploaded, kept in case a size
    larger than 800px or a different crop is ever needed.
  - The favicon (`src/app/icon.png`, `src/app/apple-icon.png`) is the gold
    mark composited onto a rounded Midnight Navy square. Re-run
    `node scripts/process-logo-assets.mjs` to regenerate everything above
    from `public/brand/originals/` if the source art changes (uses `sharp`,
    already a transitive dependency of Next.js).
- **Palette**: "Regal Heritage" — Midnight Navy / Royal Gold / Ivory Stone —
  defined as CSS variables at the top of `src/app/globals.css`
  (`--color-ink`, `--color-gold`, `--color-sand`, etc.). Change the hex
  values there to retune the whole site's chrome in one place.

## Development

```bash
npm install
cp .env.local.example .env.local   # fill in your Sanity project ID + dataset
npm run dev       # http://localhost:3000  (and /studio)
npm run build     # production build
npm run lint
```

## Deployment

This site needs a real Next.js server (not just static files) because of
the embedded `/studio` CMS and content that updates without a rebuild.
Deploy to **[Vercel](https://vercel.com)**:

1. Import the GitHub repo into Vercel (zero-config — it auto-detects
   Next.js).
2. Add the environment variables from **Setting up Sanity** above under
   Project → Settings → Environment Variables.
3. Deploy. Every push to the connected branch redeploys automatically.

Point your real domain at the Vercel project under Settings → Domains once
you're ready to go live.

**If a push doesn't show up under Deployments** (rare, but the GitHub→Vercel
webhook for a given push can occasionally drop): clicking **Redeploy** on an
existing deployment won't fix it — that button rebuilds the exact same commit
that deployment already used, it doesn't pull anything newer. If the branch's
latest commit truly isn't listed at all under Deployments, push a small new
commit (even a trivial one) to re-trigger a fresh webhook delivery, or use
`vercel --prod` from the CLI to force a deploy of the current `HEAD` directly.

### If you need static shared hosting instead (e.g. Hostinger)

This is a real trade-off, not a small setting: static hosting can't run
`/studio` or update content without a manual rebuild-and-reupload each
time, so the Sanity CMS workflow above won't apply. If shared hosting is a
hard requirement, `next.config.hostinger-export.ts.example` in this repo is
the config that was used for that (rename it to `next.config.ts`, remove
the Sanity/`/studio` routes, and content edits go back to editing
`src/content/*.ts` and re-uploading `out/`).

## Tech stack

- Next.js 16 (App Router, TypeScript), deployed on Vercel
- Tailwind CSS v4
- [Sanity](https://sanity.io) (embedded Studio at `/studio`) for tours,
  experiences, photoshoots, blog posts, testimonials, FAQ, and site settings
  — with automatic fallback to `src/content/*.ts` for anything not yet
  migrated in
- No custom database/backend beyond Sanity — the "Customize Your Tour" form
  and all booking CTAs route to WhatsApp/email, matching the original
  site's manual booking flow
