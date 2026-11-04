/**
 * Guards robots.txt, whose failure mode is that the site keeps working.
 *
 * A wrong Disallow does not break a page, throw an error or fail a build. The
 * page serves normally to every human who visits it and quietly stops being
 * fetched by Google, and the only symptom is a traffic line that bends down a
 * few weeks later. On a site where one deploy already moved indexed pages
 * from 93 to 262, that is not a margin worth guessing with.
 *
 * Two directions, both checked:
 *
 *   BLOCKING WHAT SHOULD BE CRAWLED. robots.txt matches on literal prefix, so
 *   `Disallow: /it` blocks `/italy-combo` too. There is no such page today,
 *   which is exactly why nobody would notice the rule that kills it — so
 *   every URL in the English sitemap is tested against every rule.
 *
 *   CRAWLING WHAT SHOULD BE BLOCKED. The unpublished languages are the reason
 *   this change exists: ~1,500 URLs that are `noindex` by design and were
 *   still consuming the crawl budget of an English site sitting at 14%
 *   indexed. Each unpublished locale must be blocked at both its bare
 *   landing page and its children.
 *
 * And the invariant that ties robots.txt to the sitemap: a locale is in
 * exactly one of them, never both and never neither.
 */
import { existsSync, readFileSync } from "node:fs";
import { LOCALES, DEFAULT_LOCALE } from "../src/i18n/locales";
import { isLocalePublished } from "../src/i18n/readiness";
import {
  ALWAYS_DISALLOWED,
  isDisallowed,
  robotsDisallows,
  unpublishedLocaleDisallows,
} from "../src/content/robotsPolicy";

const errors: string[] = [];
const ok = (label: string, condition: boolean) => {
  if (!condition) errors.push(label);
};

const rules = robotsDisallows();

// ---------------------------------------------------------------------------
// 1. The private and internal paths are still blocked.
// ---------------------------------------------------------------------------
for (const path of ALWAYS_DISALLOWED) {
  ok(`robots.txt no longer disallows ${path}`, rules.includes(path));
}
ok(
  "/os is crawlable — it is the internal workspace, carrying guest names, phone numbers and " +
    "what each booking sold for",
  isDisallowed("/os/bookings", rules)
);
ok("/studio is crawlable", isDisallowed("/studio", rules));
ok("/api/ is crawlable", isDisallowed("/api/enquiry", rules));

// ---------------------------------------------------------------------------
// 2. /flying-dresses stays crawlable.
//
// It 308s to the brand's own domain, and Google cannot follow a redirect on a
// URL it may not fetch. Blocking it would strand every indexed address on
// this domain permanently. This is written down in app/robots.ts; it is
// asserted here because "add the other brand to the Disallow list" is a
// plausible-looking edit that would undo it.
// ---------------------------------------------------------------------------
ok(
  "/flying-dresses is disallowed, so Google cannot follow the 308 to the brand's own domain and " +
    "those URLs can never be consolidated out of this one's index",
  !isDisallowed("/flying-dresses/packages", rules)
);

// ---------------------------------------------------------------------------
// 3. No URL offered to Google is blocked from Google.
//
// The real test of the locale rules. Reads the generated sitemap's own
// entries rather than a list retyped here, so a page added tomorrow is
// covered without anyone remembering to add it.
// ---------------------------------------------------------------------------
const SITEMAP_SAMPLE = "scripts/fixtures/en-sitemap-paths.txt";
let sitemapPaths: string[] = [];
if (existsSync(SITEMAP_SAMPLE)) {
  sitemapPaths = readFileSync(SITEMAP_SAMPLE, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("#"));
}
ok(
  `${SITEMAP_SAMPLE} is missing or empty, so the "robots.txt does not block the sitemap" ` +
    "assertion has nothing to test",
  sitemapPaths.length > 200
);

for (const path of sitemapPaths) {
  const hit = rules.find((r) => isDisallowed(path, [r]));
  if (hit) {
    errors.push(
      `robots.txt rule ${JSON.stringify(hit)} blocks ${path}, which is in the English sitemap — ` +
        "the page is submitted to Google and forbidden to Google at the same time"
    );
  }
}

// These are the collisions the two-letter prefixes would cause. None of these
// pages exists today; that is the point — the rule that blocks them would ship
// unnoticed and only the traffic would show it.
for (const path of [
  "/italy-combo",
  "/arabic-calligraphy-workshop",
  "/esna-lock-cruise",
  "/frankincense-boutique",
  "/ruins-of-memphis",
  "/experiences/italian-speaking-guide",
]) {
  const hit = rules.find((r) => isDisallowed(path, [r]));
  if (hit) {
    errors.push(
      `robots.txt rule ${JSON.stringify(hit)} would block a future English page at ${path} — ` +
        "anchor the locale rules rather than using a bare two-letter prefix"
    );
  }
}

// ---------------------------------------------------------------------------
// 4. Every unpublished language is blocked, at both forms of its URL.
// ---------------------------------------------------------------------------
const unpublished = LOCALES.filter((l) => l.code !== DEFAULT_LOCALE && !isLocalePublished(l.code));
for (const l of unpublished) {
  ok(
    `/${l.code} is not offered to Google but its landing page is still crawlable, so it keeps ` +
      "consuming crawl budget the English pages need",
    isDisallowed(`/${l.code}`, rules)
  );
  ok(
    `/${l.code}/* is not offered to Google but its pages are still crawlable`,
    isDisallowed(`/${l.code}/tours`, rules)
  );
}

// ---------------------------------------------------------------------------
// 5. Every published language is crawlable.
//
// The failure this prevents is the worst one available here: a language in
// the sitemap and in robots.txt's Disallow at once, which asks Google to
// index a page it is forbidden to read.
// ---------------------------------------------------------------------------
const published = LOCALES.filter((l) => l.code !== DEFAULT_LOCALE && isLocalePublished(l.code));
for (const l of published) {
  ok(
    `/${l.code} is published to the sitemap AND disallowed in robots.txt — Google is being asked ` +
      "to index a page it is not allowed to fetch",
    !isDisallowed(`/${l.code}`, rules) && !isDisallowed(`/${l.code}/tours`, rules)
  );
}

// No language is published today, so the loop above runs zero times and
// proves nothing. The question it is meant to answer — does publishing a
// language actually unblock it? — is the one that matters, because getting it
// wrong submits a URL to Google and forbids it in the same deploy. So it is
// asked directly, of a simulated published set.
for (const code of ["fr", "ar"]) {
  const simulated = robotsDisallows((l) => l === code);
  ok(
    `publishing ${code} would leave it blocked in robots.txt: the sitemap would offer /${code} ` +
      "while robots.txt forbade it",
    !isDisallowed(`/${code}`, simulated) && !isDisallowed(`/${code}/tours`, simulated)
  );
  const stillBlocked = LOCALES.filter((l) => l.code !== DEFAULT_LOCALE && l.code !== code);
  for (const other of stillBlocked) {
    ok(
      `publishing ${code} would also unblock ${other.code}, which is not published`,
      isDisallowed(`/${other.code}/tours`, simulated)
    );
  }
}
ok(
  "English itself is disallowed",
  !isDisallowed("/", rules) && !isDisallowed("/tours", rules) && !isDisallowed("/stories", rules)
);

// ---------------------------------------------------------------------------
// 6. The two lists are generated from one authority.
//
// Without this the rules could be hardcoded and drift: a language published
// in the sitemap while robots.txt still blocks it, or unpublished while
// robots.txt still allows the crawl. Asserting the count ties the generated
// list to isLocalePublished rather than to whatever someone typed.
// ---------------------------------------------------------------------------
ok(
  `the locale rules (${unpublishedLocaleDisallows().length}) do not match two per unpublished ` +
    `language (${unpublished.length} unpublished), so robots.txt is no longer generated from ` +
    "isLocalePublished and can disagree with the sitemap",
  unpublishedLocaleDisallows().length === unpublished.length * 2
);

const robotsSource = readFileSync("src/app/robots.ts", "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, " ")
  .replace(/(^|[^:])\/\/.*$/gm, "$1");
ok(
  "src/app/robots.ts writes its own Disallow list instead of calling robotsDisallows(), so the " +
    "rules and the sitemap can drift apart",
  /disallow\s*:\s*robotsDisallows\s*\(\s*\)/.test(robotsSource)
);

// ---------------------------------------------------------------------------
if (errors.length > 0) {
  console.error(`\ncheck-robots: ${errors.length} problem(s)\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("");
  process.exit(1);
}

console.log(
  `check-robots: ok — ${rules.length} rules; ${ALWAYS_DISALLOWED.length} private paths blocked and ` +
    `/flying-dresses deliberately not; all ${unpublished.length} unpublished languages blocked at ` +
    `both their landing page and their children; all ${published.length} published ones crawlable; ` +
    `none of ${sitemapPaths.length} English sitemap URLs blocked, nor any of 6 future pages whose ` +
    "names start with a locale code; and the list is generated from isLocalePublished, not typed."
);
