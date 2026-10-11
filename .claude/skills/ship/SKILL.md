---
name: ship
description: The pre-flight sequence for committing and pushing this repository, whose default branch deploys straight to a live site taking card payments. Use before any git commit or push here, when asked to ship, deploy or release, when deciding whether a change is safe to land, or when verifying that a deploy actually reached production.
allowed-tools: Bash, Read, Grep, Glob
---

# Shipping

`claude/egypt-eye-travel-website-fckb5t` **is the default branch**. No PR, no
staging. A push deploys to a live travel business that takes real deposits.

## Before every commit

```bash
npx tsc --noEmit      # must be 0 errors
npm run lint          # must be clean
npm run check         # 16 offline checks, all ok
```

All three, every time, in that order. `npm run check` is cheap; running it is
never the slow part of a mistake.

For any change to a rendered page, also `npm run audit:visual` and **look at
the screenshots** (see the `visual-verify` skill).

## `next build` in the cloud sandbox

It compiles and type-checks, then stalls at "Collecting page data" because the
sandbox has no DNS to Sanity. That is the environment. "Compiled successfully"
plus "Finished TypeScript" with 0 errors is the available signal; take it and
move on. Kill the stalled process per-PID — `pkill -f "next build"` has killed
its own shell here (exit 144) and silently skipped the commit that followed.

## Read your own diff before committing

`git diff` and look for: gratuitous reformatting mixed into a behaviour change,
a check you added that would also pass on the broken code, an import left
unused, a debug log. Keep the change minimal — do not widen it.

## Pushing

```bash
git push -u origin claude/egypt-eye-travel-website-fckb5t
```

Retry up to 4 times with 2s/4s/8s/16s backoff on network failure only. Never
force-push. Do not open a PR unless asked.

## A pushed commit is not a deployed site

Verify the deploy landed before claiming the change is live. Pick something
observable that the new code changes — a response header, a payload size, a
new admin row — and check it against production:

```bash
curl -sS -o /dev/null -D - https://egypteyetravel.com/ | grep -iE 'age:|x-vercel-cache'
```

ISR means a cached page can serve old content after a deploy; a cache-busting
query string does **not** bypass it for a prerendered page. Hit a dynamic
route, or an asset the new build renamed, to see the new deployment.

## Never without being asked

Run a live payment. Change a production credential or provider setting. Delete
customer data. Load-test production. Rotate a secret (prepare it and hand the
owner the steps instead).
