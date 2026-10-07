/**
 * Guards navigation, whose failure mode is a page nobody can find.
 *
 * The header and the footer used to be the same list, so tidying the menu
 * meant taking pages off the site. They are now a selection and a grouping of
 * site.nav (see content/navGroups.ts), which is better but introduces exactly
 * one new way to lose a page: hide it from the header and forget to put it in
 * a footer section. Nothing throws, nothing fails a build, the page is still
 * live — it simply has no link.
 *
 * The opposite mistake is just as easy and looks like a fix: linking a page
 * that is deliberately unlinked. Signature Experiences and Hotel Deals are
 * WITHDRAWN (content/withdrawnSections.ts) — gone from the nav, the footer,
 * every internal link and the sitemap, noindex, with the URLs still answering
 * old links. Finding them missing from the menu and "restoring" them would
 * undo a decision, so that direction is asserted too.
 */
import {
  FOOTER_SECTIONS,
  HEADER_ACCENTS,
  HEADER_DROPDOWN_LAST,
  HEADER_HIDDEN,
  HEADER_LABELS,
  HEADER_PRIMARY,
  footerHrefs,
} from "../src/content/navGroups";
import { site } from "../src/content/site";
import { canonicalNavHref } from "../src/content/navGroups";
import { redirectRules } from "../src/content/redirectRules";
import { treasureCategories } from "../src/content/treasures";
import { isWithdrawnPath, withdrawnSectionPaths } from "../src/content/withdrawnSections";
import { readdir } from "node:fs/promises";

const errors: string[] = [];
function ok(label: string, condition: boolean) {
  if (!condition) errors.push(label);
}

const footer = footerHrefs();
const footerSet = new Set(footer);

// ---------------------------------------------------------------------------
// 1. Reachability. The one property the whole split depends on.
for (const item of site.nav) {
  if (item.href === "/") continue; // The logo is the Home link, by design.
  ok(
    `${item.href} ("${item.label}") is in site.nav but no footer section links it — hidden from the header means footer-only, not gone`,
    footerSet.has(item.href)
  );
}

// Every page the header hides must be somewhere in the footer. Same property
// as above, asserted from the other direction so neither list can drift.
for (const href of HEADER_HIDDEN) {
  ok(`${href} is hidden from the header and not in the footer either`, footerSet.has(href));
}

// A page promoted into the bar without being in site.nav still needs a footer
// home, or it is reachable only while it happens to be in the bar.
for (const entry of HEADER_PRIMARY) {
  ok(`${entry.href} is in the header bar but no footer section links it`, footerSet.has(entry.href));
}

// ---------------------------------------------------------------------------
// 1b. The other direction: a withdrawn section must have no link at all.
for (const href of footer) {
  ok(
    `the footer links ${href}, which belongs to a withdrawn section — withdrawn means no link, not a broken one`,
    !isWithdrawnPath(href)
  );
}
for (const entry of HEADER_PRIMARY) {
  ok(`the header bar links ${entry.href}, which is withdrawn`, !isWithdrawnPath(entry.href));
}
for (const href of Object.keys(HEADER_ACCENTS)) {
  ok(`${href} is accented in the header but withdrawn`, !isWithdrawnPath(href));
}
ok(
  `withdrawnSectionPaths is empty — this check would then prove nothing`,
  withdrawnSectionPaths.length > 0
);

// ---------------------------------------------------------------------------
// 2. Nothing is listed twice. A duplicate link is how the old footer carried
//    /testimonials in two places, and it reads as a mistake because it is one.
const seen = new Set<string>();
for (const href of footer) {
  ok(`${href} appears in more than one footer section`, !seen.has(href));
  seen.add(href);
}

// ---------------------------------------------------------------------------
// 3. The header composition the user asked for, asserted rather than assumed.
const inBar = new Set(HEADER_PRIMARY.map((e) => e.href));
const dropdown = site.nav
  .filter((i) => !inBar.has(i.href) && !HEADER_HIDDEN.includes(i.href) && i.href !== HEADER_DROPDOWN_LAST)
  .map((i) => i.href);
const headerMenu = [...dropdown, HEADER_DROPDOWN_LAST];

for (const gone of ["/explore-egypt", "/partners", "/testimonials", "/weekly-trips"]) {
  ok(`${gone} is back in the header menu`, !headerMenu.includes(gone) && !inBar.has(gone));
}
ok(
  "Customize Your Tour is not the last item in the dropdown",
  headerMenu[headerMenu.length - 1] === "/customize"
);
ok("Customize Your Tour left the header entirely", headerMenu.includes("/customize"));
ok('the header does not relabel The Boutique as "Shop"', HEADER_LABELS["/boutique"] === "Shop");
ok(
  "the Shop label leaked outside the header — the footer and the page must still say The Boutique",
  FOOTER_SECTIONS.some((s) => s.links.some((l) => l.href === "/boutique" && l.label === "The Boutique"))
);

// Two accents, and they must be different from each other — "its own
// different unique color" is the requirement, so one shared colour fails.
const accented = Object.entries(HEADER_ACCENTS);
ok("Customize Your Tour has no accent", HEADER_ACCENTS["/customize"] !== undefined);
ok("Unique Photoshoots has no accent", HEADER_ACCENTS["/photoshoots"] !== undefined);
ok(
  "Customize Your Tour and Unique Photoshoots share an accent",
  HEADER_ACCENTS["/customize"] !== HEADER_ACCENTS["/photoshoots"]
);
ok(
  "two accents now resolve to the same colour",
  new Set(accented.map(([, tone]) => tone)).size === accented.length
);

// ---------------------------------------------------------------------------
// 4. The sections the user named are present and not empty.
for (const heading of ["Shop", "Partner With Us", "Join a Trip"]) {
  const section = FOOTER_SECTIONS.find((s) => s.heading === heading);
  ok(`the footer has no "${heading}" section`, section !== undefined);
  ok(`the "${heading}" section is empty`, (section?.links.length ?? 0) > 0);
}
const joinATrip = FOOTER_SECTIONS.find((s) => s.heading === "Join a Trip");
for (const href of ["/weekly-trips", "/explore-egypt"]) {
  ok(`"Join a Trip" does not link ${href}`, Boolean(joinATrip?.links.some((l) => l.href === href)));
}
ok(
  "Traveler Reviews is not in any footer section",
  FOOTER_SECTIONS.some((s) => s.links.some((l) => l.href === "/testimonials"))
);
ok(
  "every footer section has a heading",
  FOOTER_SECTIONS.every((s) => s.heading.trim().length > 0)
);

// ---------------------------------------------------------------------------
// 5. Every footer href is a real route. A heading over a 404 is worse than no
//    heading, and these are hand-written rather than derived.
const appDir = "src/app/[locale]/(site)";
const routes = new Set<string>(["/"]);
for (const entry of await readdir(appDir, { withFileTypes: true })) {
  if (!entry.isDirectory() || entry.name.startsWith("[") || entry.name.startsWith("(")) continue;
  routes.add(`/${entry.name}`);
}
// The Boutique's categories are Studio content rather than directories.
for (const category of treasureCategories) routes.add(`/boutique/${category.slug}`);

for (const href of footer) {
  const top = `/${href.split("/")[1]}`;
  ok(
    `the footer links ${href}, which is not a page on this site`,
    routes.has(href) || routes.has(top)
  );
}

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// No navigation link may point at a URL that redirects.
//
// A redirected nav link still "works", which is why this went unnoticed on the
// live site: after the Boutique rename the Studio's nav kept /take-egypt-home,
// so the header showed the old name and 308'd every visitor who clicked it,
// while the footer on the same page showed the new one. Both the label and the
// hidden list are matched by href, so a stale href silently opts out of both.
const literalRedirects = new Map(
  redirectRules()
    .filter((rule) => !rule.source.includes(":") && !rule.source.includes("*"))
    .map((rule) => [rule.source, rule.destination])
);

// site.nav carries {href,label}; footerHrefs() returns bare strings. Keeping
// them in one loop made link.href undefined for every footer entry, so that
// half of this asserted nothing.
const navTargets: { href: string; what: string }[] = [
  ...site.nav.map((item) => ({ href: item.href, what: `header nav "${item.label}"` })),
  ...footer.map((href) => ({ href, what: "footer link" })),
];

for (const { href, what } of navTargets) {
  const target = literalRedirects.get(href);
  ok(
    `${what} points at ${href}, which redirects to ${target} — link the destination directly`,
    target === undefined
  );
}

// And the normaliser has to actually resolve the rename it exists for.
for (const [from, to] of literalRedirects) {
  ok(
    `canonicalNavHref leaves ${from} un-normalised, so a stale Studio entry would still render it`,
    canonicalNavHref(from) === to || to.includes(":")
  );
}
ok(
  "canonicalNavHref leaves a path with no redirect alone",
  canonicalNavHref("/photoshoots") === "/photoshoots"
);

if (errors.length > 0) {
  console.error(`\ncheck-nav: ${errors.length} problem(s)\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("");
  process.exit(1);
}
console.log(
  `check-nav: ok — ${site.nav.length} nav pages, ${footer.length} footer links in ` +
    `${FOOTER_SECTIONS.length} sections; every page the header hides is linked in the footer, ` +
    "nothing is listed twice, and both accents are distinct."
);
