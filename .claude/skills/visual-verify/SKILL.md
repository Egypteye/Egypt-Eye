---
name: visual-verify
description: Open real pages in a real browser and check what they actually look like and do, at phone, tablet and desktop sizes. Use when changing any page, component, layout, style or image; when asked whether something looks right, is responsive, is accessible, or is slow; when investigating a rendering, hydration, layout or Core Web Vitals problem; or before saying a visual change is finished. Covers scripts/visual-audit.mts, screenshot review, payload limits and what the tool cannot tell you.
allowed-tools: Bash, Read, Edit, Write, Grep, Glob
---

# Seeing the page

Writing CSS and believing it is how an 18 MB homepage survived in this project
for months. Every other check in `scripts/` reads source files; none of them
could see a rendered page. This one can.

## Run it

```bash
npm run audit:visual                                   # live site, 5 key pages
npx tsx scripts/visual-audit.mts --base https://<preview>.vercel.app
npx tsx scripts/visual-audit.mts --pages / /tours      # narrow it
npx tsx scripts/visual-audit.mts --out .visual-audit   # default output dir
```

It takes a **URL, not a build**, so the same command checks a Vercel preview
before merge and production after. Output: `report.md`, `report.json`, and a
PNG per page per viewport in `.visual-audit/` (gitignored).

Exit code 1 on errors, 0 on warnings and notes — so it can gate a deploy
without a heading-order nit blocking a release.

## Then actually look at the screenshots

`Read` the PNGs. The script cannot tell you a page is ugly, that a headline is
illegible over its hero image, or that a layout is unbalanced. It reports
facts; judgement is yours. A run with zero errors and an unreadable hero is a
failed page.

## What it checks

Per page, per viewport: HTTP status, console errors, uncaught exceptions,
failed requests, screenshot. On the mobile pass only: axe-core violations,
heading structure, `<img>` without alt, SEO head tags, tap targets under 44px
(grouped by label), rendered text length and DOM node count.

**Payload thresholds are not style opinions.** Over 200,000 characters of
rendered text, or over 5,000 DOM nodes, is an error: that page is slow on a
phone however it looks. The next-largest page here is ~341 KB of HTML; if
something is 50× that, a component is rendering a whole dataset.

## Two traps, both already paid for

**Grouped output is the feature.** "5126 tap targets are too small" reads as a
broken check and gets ignored. "2674× `a "View on Tripadvisor" 104x20`" names
the component. That grouping is what found the 18 MB homepage.

**In this cloud sandbox, outbound goes through a proxy that mangles some
responses.** It produces MIME-type errors and 502s on `_next/static/*` assets
that are entirely the proxy's fault — fetched directly with `curl -D -` those
assets return `text/css` and `application/javascript` correctly. It also
returns an occasionally blank page, so a run reporting `0` interactive
elements is a bad load, not an empty site; re-run before believing it.
**Always confirm a network or MIME finding with a direct `curl` before
reporting it as a site defect.**

## When the browser is not available

`npm run audit:visual` exits 2 with instructions if no Chromium is found. In
this sandbox one is at `/opt/pw-browsers/chromium` and is found automatically;
elsewhere set `CHROME_PATH` or run `npx playwright install chromium`.

`next dev` cannot run in the cloud sandbox (no DNS to Sanity), so audit the
deployed site instead of localhost. **If you could not run a browser at all,
say the visual verification did not happen.** Do not infer appearance from
source.
