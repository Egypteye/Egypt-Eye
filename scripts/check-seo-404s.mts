/**
 * Pins the URLs that Search Console showed ranking into a 404.
 *
 * WHY THIS IS A SEPARATE FILE FROM check-redirects.
 *
 * check-redirects verifies that the rules which exist are correct: no chains,
 * no loops, permanent where it matters, destinations that resolve. It passed
 * every day while 27 ranking URLs returned 404, and it was not wrong to — it
 * can only check rules that someone wrote. A URL nobody listed is a URL
 * nobody checks.
 *
 * So this file is the list itself, taken from a Search Console export and
 * verified against the live site one URL at a time. Each entry carries the
 * position and impressions it had when it was broken, because that is what
 * makes it worth keeping: /tours/private-luxury-tour-of-egypt was on page one
 * at position 7.1, and a rule deleted as "obviously dead" would put it back
 * there.
 *
 * These are measurements of a past state, not claims about today. They do not
 * update themselves, and they are not evidence of current traffic.
 */
// The same compiler Next itself uses, reached the same way check-redirects
// reaches it. path-to-regexp is not a direct dependency of this project; it
// arrives inside Next, so importing it by bare name fails.
import ptr, { type Key } from "next/dist/compiled/path-to-regexp/index.js";

const { pathToRegexp, compile } = ptr;
import { redirectRules } from "../src/content/redirectRules";

const errors: string[] = [];
const ok = (label: string, condition: boolean) => {
  if (!condition) errors.push(label);
};

const rules = redirectRules();

/** The first rule that claims a URL, the way Next matches: in order. */
function resolve(url: string): string | null {
  for (const rule of rules) {
    const keys: Key[] = [];
    const re = pathToRegexp(rule.source, keys);
    const m = re.exec(url);
    if (!m) continue;
    const params: Record<string, string | string[]> = {};
    keys.forEach((key, i) => {
      const value = m[i + 1];
      params[key.name] =
        key.modifier === "*" || key.modifier === "+" ? (value ? value.split("/") : []) : value;
    });
    return compile(rule.destination, { validate: false })(params).replace(/(.)\/$/, "$1");
  }
  return null;
}

/** [url, destination, position when broken, impressions when broken] */
const WAS_404: [string, string, number, number][] = [
  // Page one. These are the ones that cost real money.
  ["/experiences/private-photoshoot-with-professional-photographer", "/experiences", 9.1, 69],
  ["/tours/private-luxury-tour-of-egypt", "/tours/10-day-private-luxurious-trip", 7.1, 24],
  ["/award-winning/luz-torres-rendon", "/testimonials", 4.8, 13],
  ["/award-winning/brittany", "/testimonials", 6.7, 3],
  ["/tours/best-of-egypt-in-10-days", "/tours/10-day-private-luxurious-trip", 7.4, 10],
  ["/tours/cairo-giza-luxor-trip-6-days", "/tours/6-day-cairo-giza-luxor", 8.6, 16],
  ["/extra-experiences/one-day-tours", "/experiences", 10.6, 9],
  ["/experiences/nile-cruise-dinner-belly-dancer-oriental-shows", "/experiences/nile-cruise-dinner-show", 7.0, 2],
  ["/tours/dahshour-sakkara-and-memphis", "/tours/memphis-saqqara-dahshur-tour", 8.0, 1],
  ["/tours/pyramids-nile-cruise-abu-simbel", "/tours", 3.0, 1],
  ["/experiences/egypt-horse-riding-photography", "/photoshoots/jumping-horse-photoshoot", 11.5, 2],
  ["/tours/egypt-giza-alexandria-khan-el-khalili-pyramids-old-cairo-tour", "/tours/5-day-giza-cairo-alexandria", 10.0, 1],

  // Deeper, but with the impressions to matter.
  ["/2024/04/01/7-best-spots-for-diving-in-egypt", "/stories/is-scuba-diving-in-egypt-worth-it", 31.8, 125],
  ["/2024/04/01/12-best-beach-in-egypt-to-hit-in-2024", "/stories", 12.5, 123],
  ["/contact-us", "/about#contact", 20.3, 74],
  ["/multi-day-tours", "/tours", 35.3, 53],
  ["/populartours", "/tours", 14.1, 35],
  ["/customized-tours", "/customize", 20.0, 20],
  ["/faqs/about-us", "/faq", 23.1, 19],
  ["/tours/tour-to-pyramids-the-egyptian-museum", "/tours", 17.1, 15],
  ["/extra-experiences", "/experiences", 51.0, 5],
  ["/experiences/atv-quad-bikes-at-pyramidss-desert", "/experiences/atv-quad-bikes-sahara", 30.7, 3],
  ["/tours/siwa-oasis-3-days-package-from-cairo", "/tours/siwa-oasis", 65.5, 2],
  ["/2024/04/26/embracing-egypts-rich-tapestry-a-solo-journey-through-siwa-giza-and-cairo", "/stories/siwa-oasis-travel-guide", 7.0, 1],
  ["/tour_category/multi-day-tour", "/tours", 87.0, 1],
  ["/de", "/", 94.0, 1],
];

for (const [url, want, position, impressions] of WAS_404) {
  const got = resolve(url);
  ok(
    `${url} 404s again — it was ranking at position ${position} with ${impressions} impressions when this was found`,
    got !== null
  );
  ok(
    `${url} redirects to ${got ?? "nowhere"} rather than ${want}`,
    got === want
  );
}

// A redirect into a 404 is worse than the 404 it replaced: the cause is now
// hidden behind a 301. These three slugs do not exist under /stories, so the
// generic WordPress date rule would send them there and strand them.
for (const [url] of WAS_404.filter(([u]) => u.startsWith("/2024/"))) {
  const got = resolve(url);
  ok(
    `${url} resolves to ${got}, a /stories/ slug that does not exist — the generic date rule has taken it back`,
    got !== null && !/^\/stories\/(7-best-spots|12-best-beach|embracing-egypts)/.test(got)
  );
}

// Ordering. The specific 2024 rules only work above the generic one, and
// moving them below is an invisible change that restores the bug.
const genericAt = rules.findIndex((r) => r.source.includes(":year"));
const specificAt = rules.findIndex((r) => r.source.includes("7-best-spots-for-diving"));
ok("the generic WordPress date rule is gone", genericAt !== -1);
ok(
  "the specific 2024 rules sit below the generic date rule, so it claims those URLs first and redirects them into a 404",
  specificAt !== -1 && genericAt !== -1 && specificAt < genericAt
);

if (errors.length > 0) {
  console.error(`\ncheck-seo-404s: ${errors.length} problem(s)\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("");
  process.exit(1);
}

const onPageOne = WAS_404.filter(([, , p]) => p <= 10).length;
console.log(
  `check-seo-404s: ok — ${WAS_404.length} URLs that Search Console showed ranking into a 404 now resolve, ` +
    `${onPageOne} of them from page one; the three WordPress posts whose slugs did not survive are mapped ` +
    `explicitly and still sit above the generic date rule that would strand them.`
);
