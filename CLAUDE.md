@AGENTS.md

# Egypt Eye Travel — what will bite you

Live travel business. Next.js 16 App Router (Turbopack) + TypeScript + Tailwind,
Sanity CMS, Supabase, Resend, PayPal, Vercel.

This file is deliberately short: it loads on every session, so it holds only
what is both high-frequency and costly to get wrong. Depth lives in
`.claude/skills/`, which load when the task needs them.

## 1. This branch is production

`claude/egypt-eye-travel-website-fckb5t` **is the default branch**. There is no
PR and no staging. Every push deploys to a site taking real card payments.
Before any commit: `npm run check` (28 offline checks), `npx tsc --noEmit`,
`npm run lint`. All three green, every time. See the `ship` skill.

## 2. The owner has no terminal

They work from a browser, the Vercel dashboard, Sanity Studio and the Supabase
SQL editor. A fix that requires them to run a local command is not a fix.
Diagnostics belong on an `/admin` page, not in a log — a `console.error` is not
a channel that reaches them.

## 3. Sanity wins wholesale over `src/content/*.ts`

Once a Studio document exists it **replaces** the content-file entry entirely.
Only `image`, `seo` and `heroImage` have gap-fillers. A field you added to the
content file but not to the Studio schema silently becomes empty in production.
This has already caused one duplicate-canonical incident. See the
`sanity-content` skill before touching content or `src/lib/sanityShape.ts`.

## 4. A check that passes on the broken code checks nothing

Every assertion in `scripts/` must be proven by reverting the fix and watching
it go red. This is not ceremony. Three separate guards written in this project
passed on the broken version: one matched its own explanatory comment, one read
the whole file so a different function satisfied it, and one used
`ok(condition, message)` in a file whose `ok` takes `(label, condition)` — so a
non-empty string was always-true. Revert it. Watch it fail. Then restore.

## 5. Money is integer cents, end to end

One rounding, at the end. `productRail()`, `isInstantBookable()` and
`financials()` are single authorities — do not compute a second answer beside
them. `attempt.quote` is a jsonb snapshot of the agreed figures, not current
ones. Never tell a customer a booking is confirmed because PayPal captured.

## 6. `server-only` puts code out of reach of the check scripts

So pure, testable logic is split out: `paypalBody.ts`, `quoteSelfTest.ts`,
`breakdown.ts`, `security/secrets.ts`, `security/clientIp.ts`,
`content/jsonLd.ts`. Follow that pattern rather than making a check impossible.

## 7. Do not invent business facts

No invented prices, inclusions, hotels, amenities, availability, ratings or
reviews. Reviews are real and must not be rewritten, re-ordered to flatter, or
fabricated. No black-hat SEO: no keyword stuffing, hidden text, cloaking, fake
schema or doorway pages.

## 8. In the cloud sandbox, `next build` cannot finish

It compiles and type-checks, then stalls at "Collecting page data" because the
sandbox has no DNS to Sanity. That is the environment, not your code. Treat
"compiled + 0 type errors" as the available signal, and verify rendering with
`npm run audit:visual` against the deployed site.

## Checks

`npm run check` runs 28. `npm run audit:visual` opens real pages in real
Chromium. `scripts/check-sql.sh` is **not** in the aggregate.
