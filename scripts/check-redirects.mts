/**
 * Guards the redirects, whose failure mode is silent and expensive.
 *
 * A redirect that stops matching does not throw, does not fail a build and
 * does not look different in the Studio. The page simply 404s, Google drops
 * it, and the first signal is a traffic report weeks later. So the rules are
 * tested the way a crawler meets them: a URL in, a destination out.
 *
 * It reads the same list next.config.ts returns from `redirects()` — one
 * module, imported by both — so a rule edited there is a rule tested here, and
 * matches with the same path-to-regexp Next itself compiles it with.
 *
 * The three properties worth asserting, in the order they cost money:
 *   1. Every retired URL lands somewhere real — no 404s where links point.
 *   2. No destination is itself a source, which would be a redirect loop.
 *   3. Live URLs are untouched, so nothing that works today starts bouncing.
 */
import ptr, { type Key } from "next/dist/compiled/path-to-regexp/index.js";

const { pathToRegexp, compile } = ptr;
import { redirectRules, type RedirectRule } from "../src/content/redirectRules";

const errors: string[] = [];
function ok(label: string, condition: boolean) {
  if (!condition) errors.push(label);
}

// The same list next.config.ts returns from redirects().
const rules: RedirectRule[] = redirectRules();
ok("the redirect list came back empty", rules.length > 0);

/** What a visitor asking for this URL actually gets. Null means no redirect. */
function resolve(url: string): { to: string; permanent: boolean } | null {
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
    // A trailing slash from an empty :path* is Next's own normalisation, not a
    // different URL — strip it so the expectations below read as addresses.
    const to = compile(rule.destination, { validate: false })(params).replace(/(.)\/$/, "$1");
    return { to, permanent: rule.permanent !== false };
  }
  return null;
}

// ---------------------------------------------------------------------------
// The Boutique rename. Four rules, because English keeps the bare path while
// the other five languages are prefixed — /fr/take-egypt-home is a real URL
// somebody may have linked, and it has to move too.
const MOVED: [string, string][] = [
  ["/take-egypt-home", "/boutique"],
  ["/take-egypt-home/cartouches", "/boutique/cartouches"],
  ["/take-egypt-home/papyrus", "/boutique/papyrus"],
  ["/take-egypt-home/clothing", "/boutique/clothing"],
  ["/take-egypt-home/essence-oils", "/boutique/essence-oils"],
  ["/fr/take-egypt-home", "/fr/boutique"],
  ["/ar/take-egypt-home", "/ar/boutique"],
  ["/es/take-egypt-home/cartouches", "/es/boutique/cartouches"],
  ["/it/take-egypt-home/papyrus", "/it/boutique/papyrus"],
  ["/ru/take-egypt-home/essence-oils", "/ru/boutique/essence-oils"],
];

for (const [from, to] of MOVED) {
  const hit = resolve(from);
  ok(`${from} does not redirect anywhere — a linked URL that now 404s`, hit !== null);
  ok(`${from} goes to ${hit?.to ?? "nowhere"} rather than ${to}`, hit?.to === to);
  // A 302 tells Google the move is temporary and withholds the ranking. For a
  // rename that is never coming back, that is the whole value thrown away.
  ok(`${from} redirects temporarily — a rename needs a permanent 301`, hit?.permanent === true);
}

// ---------------------------------------------------------------------------
// The new addresses must NOT redirect. A destination that is also a source is
// a loop, and a browser shows it as ERR_TOO_MANY_REDIRECTS rather than a page.
for (const live of [
  "/boutique",
  "/boutique/cartouches",
  "/fr/boutique",
  "/ar/boutique/papyrus",
]) {
  const hit = resolve(live);
  ok(`${live} redirects to ${hit?.to} — the new URL must be the end of the chain`, hit === null);
}

// No rule anywhere may point at something another rule moves on again. One hop
// is a redirect; two is a chain that leaks ranking and can close into a loop.
for (const rule of rules) {
  // Only literal destinations can be checked without inventing parameters.
  if (/[:*]/.test(rule.destination)) continue;
  const onward = resolve(rule.destination.split("#")[0]);
  ok(
    `${rule.source} redirects to ${rule.destination}, which redirects on to ${onward?.to} — a chain`,
    onward === null
  );
}

// ---------------------------------------------------------------------------
// Pages that exist today, which no rename may start bouncing.
for (const live of ["/", "/tours", "/photoshoots", "/experiences", "/stories", "/about", "/customize"]) {
  ok(`${live} redirects to ${resolve(live)?.to} — a working page must stay put`, resolve(live) === null);
}

// And the older rules this file now also covers, so they cannot rot unnoticed.
ok("/sitemap_index.xml no longer reaches the sitemap", resolve("/sitemap_index.xml")?.to === "/sitemap.xml");
ok("/blog no longer reaches the stories index", resolve("/blog")?.to === "/stories");
ok("/blog/:slug no longer reaches a story", resolve("/blog/some-post")?.to === "/stories/some-post");
ok("/contact no longer reaches the About page", resolve("/contact")?.to === "/about#contact");
ok(
  "a WordPress date permalink no longer reaches its story",
  resolve("/2024/04/01/pyramids-guide")?.to === "/stories/pyramids-guide"
);
ok(
  "a numeric WordPress experience id no longer reaches the listing",
  resolve("/experiences/425")?.to === "/experiences"
);

// ---------------------------------------------------------------------------
if (errors.length > 0) {
  console.error(`\ncheck-redirects: ${errors.length} problem(s)\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("");
  process.exit(1);
}
console.log(
  `check-redirects: ok — ${rules.length} rules; every retired URL lands on a real page with a 301, ` +
    "the new addresses are the end of the chain, and nothing live redirects."
);
