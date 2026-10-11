---
name: sanity-content
description: Rules for changing products, pages or copy that come from Sanity CMS or src/content/*.ts. Use when adding or editing a tour, photoshoot, experience, story, destination or FAQ; when a field edited in code does not appear on the live site; when a Studio document and a content file disagree; when touching src/lib/sanityShape.ts, src/sanity/fetchers.ts or the Studio schema; or when a page renders empty, stale or duplicated after a content change.
allowed-tools: Bash, Read, Edit, Write, Grep, Glob
---

# Sanity and the content files

Two sources describe the same products: `src/content/*.ts` in the repo and
documents in Sanity Studio. Getting their relationship wrong is the most
expensive mistake available in this codebase, and it fails silently.

## The rule: Sanity wins wholesale

Once a Studio document exists for a slug, it **replaces** the content-file
entry entirely. It does not merge field by field. Only `image`, `seo` and
`heroImage` have explicit gap-fillers.

So: **adding a field to `src/content/*.ts` without adding it to the Studio
schema makes that field empty in production** for every product that has a
Studio document. Locally and in review it looks perfect. This already produced
one duplicate-canonical incident on the Pyramids Proposal page.

Whenever you add a field to a content type, change all four:

1. the type in `src/content/types.ts`
2. the entry in `src/content/*.ts`
3. the Studio schema in `src/sanity/`
4. the GROQ projection in `src/sanity/fetchers.ts`
5. the harden function in `src/lib/sanityShape.ts`

Then `npm run check:shape`.

## `hardenX(value, local)` — three cases, not two

In `src/lib/sanityShape.ts`:

- `null` / `undefined` → fall back to the content file's value (Studio never set it)
- `[]` → **keep it empty** (an editor deliberately cleared it)
- no local counterpart → `[]`

Collapsing the middle case into the first resurrects content an editor removed.

## Listing and detail behave differently

- `getPhotoshoots()` returns Sanity's list whenever it is non-empty, so a
  **local-only entry never appears in the grid**.
- `mergePhotoshootWithLocal()` does `if (!result) return local`, so a
  local-only entry **does render at its own URL**.

That asymmetry is why a new product can be live at its URL and invisible in the
listing. If a product "isn't showing", this is usually why: it needs a
published Studio document, not a code change.

## Translations only read the content files

The i18n pipeline extracts from `src/content/*.ts`. Copy that exists **only**
in Sanity is never translated and will appear in English on every locale.

## Caching

Pages are ISR. After a Studio publish, content appears when the path
revalidates, or immediately via the "Refresh the site from Sanity" button on
`/admin/paypal`, which calls `revalidatePath("/", "layout")`. A stale page is
usually a cache, not a bug — check `x-vercel-cache` and `x-nextjs-prerender`
before changing code.

## Never

Invent a price, inclusion, hotel, amenity, duration or availability. Rewrite,
re-order to flatter, or fabricate a review. If a fact is not confirmed by the
owner or an existing source, leave it out and say it is missing.
