# Egypt Eye Travel and Tours — Website

A Next.js rebuild of egypteyetravel.com, designed around three goals: modern,
beautiful, and easy to edit without touching component code.

## Editing content

Everything a non-developer would want to change lives in **`src/content/`** as
plain, commented TypeScript objects — no CMS login needed, no component code
to touch:

| File | What it controls |
|---|---|
| `site.ts` | Brand copy, nav links, contact info, WhatsApp/email, booking policies |
| `tours.ts` | The 11 Popular Tours — pricing, itinerary, included/excluded, ratings |
| `experiences.ts` | The 6 Extra Experiences (felucca, ATV, dinner cruise, food tour) |
| `photoshoots.ts` | The two photoshoot packages (Pyramids, Flying Dress) |
| `testimonials.ts` | Homepage testimonial quotes |
| `stories.ts` | Blog/Stories listing |
| `destinations.ts` | Cities shown on the homepage panel and as checkboxes on the Customize form |
| `interests.ts` | Activity checkboxes on the Customize form |
| `faq.ts` | Homepage FAQ accordion |
| `aggregate.ts` | Derives stat-tile numbers (rating average, tour count, etc.) from the real data above — nothing hardcoded |

To add a new tour: copy an existing object in `tours.ts`, give it a unique
`slug`, and it automatically gets a listing card and its own detail page at
`/tours/<slug>` — no routing code required.

Prices are `{ amount: null }` where the current site didn't publish a fixed
price (shown as "Ask us for today's rate"); fill in a number to show a real
price instead.

## Images

The site currently ships with elegant gradient placeholders (see
`src/components/PlaceholderImage.tsx`) instead of real photos, since this
build environment has no access to your photo library. To swap in real
photos:

1. Drop image files into `public/images/`.
2. Replace the relevant `<PlaceholderImage tone="..." />` usage with a Next.js
   `<Image src="/images/your-photo.jpg" ... />`.

Tours/experiences/photoshoots/stories each carry an `imageTone` field
(`giza`, `nile`, `desert`, `luxor`, `jordan`, `redsea`) controlling the
placeholder's color — useful as a guide for which real photo mood fits.

The homepage hero also auto-rotates through five of these placeholder tones
with a slow Ken Burns zoom (`src/components/HeroSlideshow.tsx`) to stand in
for real photography/video until it's available. To use real video instead,
swap its `<PlaceholderImage>` slides for a `<video autoPlay muted loop>`
pointing at a file in `public/videos/`.

## Brand

- **Logo**: the real Eye of Horus mark, in `public/brand/`:
  - `egypt-eye-mark-gold.png` / `egypt-eye-mark-black.png` — trimmed, web-sized
    (800px) transparent PNGs, used in `Navbar.tsx` and `Footer.tsx`.
  - `egypt-eye-badge-gold.png` — the circular seal version, used on the About page.
  - `originals/` — the untouched files as uploaded (`public/brand/originals/`),
    kept in case a size larger than 800px or a different crop is ever needed.
  - The favicon (`src/app/icon.png`, `src/app/apple-icon.png`) is the gold mark
    composited onto a rounded Midnight Navy square. Re-run
    `node scripts/process-logo-assets.mjs` to regenerate everything above from
    `public/brand/originals/` if the source art changes (uses `sharp`, already
    a transitive dependency of Next.js).
- **Palette**: "Regal Heritage" — Midnight Navy / Royal Gold / Ivory Stone —
  defined as CSS variables at the top of `src/app/globals.css`
  (`--color-ink`, `--color-gold`, `--color-sand`, etc.). Change the hex
  values there to retune the whole site's chrome in one place.

## Development

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # production build
npm run lint
```

## Deployment

This is a standard Next.js App Router project — deploys as-is to
[Vercel](https://vercel.com) (recommended, zero-config) or any Node hosting
that runs `next build && next start`.

## Tech stack

- Next.js 16 (App Router, TypeScript)
- Tailwind CSS v4
- No backend/database — the "Customize Your Tour" form and all booking CTAs
  route to WhatsApp/email, matching the current site's manual booking flow.
