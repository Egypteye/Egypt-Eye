# Egypt Eye Travel and Tours — Website

A Next.js site for egypteyetravel.com with a built-in content backend
([Sanity](https://sanity.io)) — tours, experiences, photoshoots, blog posts,
testimonials, FAQ, and site-wide settings are all editable from a login page
at `/studio`, no code required.

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
