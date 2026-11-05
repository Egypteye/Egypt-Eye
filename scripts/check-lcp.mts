/**
 * Guards the handful of things that quietly destroy Largest Contentful Paint.
 *
 * This exists because of a one-word regression. `priority` on a Next
 * `<Image>` does three things — eager loading, high fetch priority, and a
 * `<link rel="preload">` in the document head — and HeroSlideshow applied it
 * to every slide. Six full-bleed photographs went into the head as
 * high-priority preloads, five of them for slides at `opacity-0` that nobody
 * would see for twenty-six seconds, and the browser had no way to know which
 * one mattered.
 *
 * PageSpeed Insights, mobile, 4 November 2026: LCP 9.6s, against 1.6s on
 * desktop. Nine image preloads in the head. The hero itself flagged for
 * having no high-priority request. Nothing was broken, nothing errored, and
 * the page looked perfect on the desktop everyone develops on — which is
 * exactly the kind of failure that needs a check rather than a reviewer.
 *
 * The rule is the one Next's own documentation gives: `priority` belongs on
 * the LCP element and nothing else. One per screen.
 */
import { readFileSync, existsSync } from "node:fs";

const errors: string[] = [];
const ok = (label: string, condition: boolean) => {
  if (!condition) errors.push(label);
};

const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/.*$/gm, "$1");

// ---------------------------------------------------------------------------
// 1. The hero marks exactly one slide priority, and it is the first.
//
// Asserted on the expression rather than on a count of the word, because the
// bug was a bare `priority` inside a .map() — one occurrence in the source,
// six in the output. Counting occurrences would have passed on it.
// ---------------------------------------------------------------------------
const hero = stripComments(readFileSync("src/components/HeroSlideshow.tsx", "utf8"));

ok(
  "HeroSlideshow renders its slides in a .map() but no longer gates `priority` on the index, so " +
    "every slide is preloaded at high priority and the browser cannot tell which is the LCP image " +
    "— this is the exact change that took mobile LCP to 9.6s",
  /priority=\{\s*i\s*===\s*0\s*\}/.test(hero)
);
ok(
  "HeroSlideshow passes a bare `priority` (not `priority={i === 0}`), which applies it to every slide",
  !/(?:^|[^=\w])priority\s*(?:\/>|$|\n)/m.test(hero) || /priority=\{/.test(hero)
);

// ---------------------------------------------------------------------------
// 2. Nothing below the fold on the homepage asks to be preloaded.
//
// The components the homepage renders are walked from its own source, so a
// section added later is covered without anyone updating a list here.
// ---------------------------------------------------------------------------
const HOMEPAGE = "src/app/[locale]/(site)/page.tsx";
const homepage = stripComments(readFileSync(HOMEPAGE, "utf8"));
const imported = [...homepage.matchAll(/import\s*\{([^}]+)\}\s*from\s*"@\/components\/([A-Za-z]+)"/g)]
  .map((m) => m[2])
  .filter((name) => homepage.includes(`<${name}`));

ok(
  `no components were resolved from ${HOMEPAGE}, so the scan below has nothing to inspect`,
  imported.length > 5
);

// HeroSlideshow is the one place a priority image belongs on this page: it is
// the LCP element. Everything else the homepage renders is below the fold.
const ALLOWED_PRIORITY = new Set(["HeroSlideshow"]);
for (const name of imported) {
  if (ALLOWED_PRIORITY.has(name)) continue;
  const file = `src/components/${name}.tsx`;
  if (!existsSync(file)) continue;
  // Declaring the prop or forwarding it (`priority={priority}`) is fine;
  // asserting it is not. Matched as the three shapes a JSX boolean prop is
  // actually written in, rather than one clever regex: the first draft of
  // this used a single alternation and passed on a bare `priority` sitting on
  // its own line — which is precisely how the HeroSlideshow bug was written.
  const src = stripComments(readFileSync(file, "utf8"))
    .replace(/priority\?:\s*boolean;?/g, "")
    .replace(/priority\s*=\s*false/g, "")
    .replace(/priority=\{\s*priority\s*\}/g, "");
  const passes =
    /^\s*priority\s*$/m.test(src) || // on its own line
    /\spriority\s*\/?>/.test(src) || // last prop before the tag closes
    /priority=\{\s*true\s*\}/.test(src); // written out explicitly
  ok(
    `${file} is rendered on the homepage below the fold and marks an image \`priority\`, which ` +
      "preloads it at high priority and competes with the hero for the LCP slot",
    !passes
  );
}

// ---------------------------------------------------------------------------
// 3. The hero image is not lazy-loaded.
//
// The opposite mistake, and the one that follows naturally from fixing the
// first: gating priority on the index is right, but if the gate is ever
// inverted or the first slide loses it, the LCP element becomes lazy and
// Lighthouse's "LCP resources shouldn't use loading=lazy" fires instead.
// ---------------------------------------------------------------------------
ok(
  "HeroSlideshow sets loading=\"lazy\" on its slides, which would make the LCP image lazy-loaded",
  !/loading=\s*["{]\s*["']?lazy/.test(hero)
);

// ---------------------------------------------------------------------------
// 4. SmartImage still forwards priority at all.
//
// Every image on the site goes through it. If it stopped passing the prop,
// `priority={i === 0}` above would be silently inert and the hero would have
// no high-priority request — which is a slow page with a green check.
// ---------------------------------------------------------------------------
const smart = stripComments(readFileSync("src/components/SmartImage.tsx", "utf8"));
ok(
  "SmartImage no longer forwards `priority` to next/image, so marking the hero slide priority " +
    "does nothing and the LCP image is fetched at default priority",
  /priority=\{\s*priority\s*\}/.test(smart)
);

// ---------------------------------------------------------------------------
if (errors.length > 0) {
  console.error(`\ncheck-lcp: ${errors.length} problem(s)\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("");
  process.exit(1);
}

console.log(
  `check-lcp: ok — the hero preloads its first slide and only its first slide, none of the ` +
    `${imported.length} components the homepage renders below it asks to be preloaded, the hero is ` +
    "not lazy-loaded, and SmartImage still forwards priority so the request is actually made."
);
