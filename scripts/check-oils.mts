import { readFileSync } from "node:fs";
import {
  SCENT_FAMILIES,
  availableFamilies,
  canFilterByProductType,
  familyCounts,
  filterByFamily,
  isScentFamily,
} from "../src/lib/boutique/scentFamilies";
import { treasureProducts } from "../src/content/treasures";

// The oils collection, and the claims it is NOT allowed to make.
//
// The research behind this is docs/oils-research.md. Its finding, in one
// line: we do not know what most of these liquids are. Egyptian Chambers is
// a reference, not our supplier; their prices are UK retail in pounds; and
// nobody has told us what the Cairo shop actually sells. This file exists to
// make sure the site keeps saying so.

const errors: string[] = [];
const ok = (label: string, condition: boolean) => {
  if (!condition) errors.push(label);
};
function code(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/.*$/gm, "$1");
}

const oils = treasureProducts.filter((p) => p.category === "essence-oils");

// ---------------------------------------------------------------------------
// 1. Nothing is claimed about composition, because nothing is known.
// ---------------------------------------------------------------------------
ok("the oils collection exists", oils.length >= 25);
ok(
  "no oil claims to be a pure essential oil",
  oils.every((p) => p.productType === undefined),
);
ok("so the product-type filter cannot be offered", !canFilterByProductType(oils));
// The trap the brief names: a familiar botanical name is not evidence.
for (const slug of ["oil-sandalwood", "oil-frankincense", "oil-lemongrass", "oil-cool-peppermint", "oil-egyptian-rose"]) {
  const p = oils.find((o) => o.slug === slug);
  ok(`${slug} is not described as a pure essential oil`, Boolean(p) && p!.productType === undefined);
}

const prose = oils.map((p) => `${p.name} ${p.blurb} ${p.description ?? ""}`).join(" ");
ok("nothing says 'pure essential oil'", !/pure essential/i.test(prose));
ok("nothing claims organic or therapeutic", !/\borganic\b|therapeutic|medicinal|heals?\b/i.test(prose));
ok("nothing promises how long it lasts", !/lasts? (up to )?\d+ ?hour/i.test(prose));
ok("nothing claims alcohol-free for our stock", !/alcohol[- ]free/i.test(prose));
ok("no invented scent notes", !/top notes?|heart notes?|base notes?/i.test(prose));

// ---------------------------------------------------------------------------
// 2. No price is invented, and the supplier's is never reused.
//
//    Egyptian Chambers prices are POUNDS, from a UK company that is not our
//    supplier. Reusing one would be quoting another business's retail price
//    as ours.
// ---------------------------------------------------------------------------
ok("no oil carries a price", oils.every((p) => p.price?.amount == null));
ok("every unpriced oil is marked a sample", oils.filter((p) => p.price?.amount == null).every((p) => p.placeholder));
ok("no oil is sold online yet", oils.every((p) => p.status === "onRequest" || p.status === "soldOut"));
const all = readFileSync("src/content/treasures.ts", "utf8");
ok("no sterling figure leaked into the catalogue", !/£\s?\d/.test(all));

// ---------------------------------------------------------------------------
// 3. Every record says what is still unknown, so nobody publishes one by
//    accident six months from now.
// ---------------------------------------------------------------------------
const added = oils.filter((p) => p.slug.startsWith("oil-") && p.scentFamily);
ok("the researched oils carry a verification note", added.every((p) => (p.verificationNote ?? "").length > 40));
ok("the note points at the research", added.every((p) => /oils-research/.test(p.verificationNote ?? "")));

// ---------------------------------------------------------------------------
// 4. The filter. Every facet offered must lead somewhere.
// ---------------------------------------------------------------------------
const families = availableFamilies(oils);
const counts = familyCounts(oils);
ok("more than one family is offered", families.length >= 4);
ok("every offered family holds a product", families.every((f) => (counts[f] ?? 0) > 0));
ok("every family key is a known one", families.every(isScentFamily));
ok("no family is offered twice", new Set(families).size === families.length);
ok(
  "every offered family can actually be reached",
  families.every((f) => filterByFamily(oils, [f]).length === counts[f]),
);
ok("no selection shows everything", filterByFamily(oils, []).length === oils.length);
ok("a product in two families is returned once", filterByFamily(oils, ["floral", "fresh"]).filter((p) => p.slug === "oil-egyptian-neroli").length === 1);
ok("the taxonomy has five families", SCENT_FAMILIES.length === 5);
ok("every family has a label", SCENT_FAMILIES.every((f) => f.label.length > 3));

// Every oil is reachable through at least one facet, or the filter hides it.
const researched = oils.filter((p) => (p.scentFamily ?? []).length > 0);
ok("the researched oils all have a family", researched.length === 25);
ok(
  "no researched oil is unreachable by any filter",
  researched.every((p) => (p.scentFamily ?? []).some((f) => families.includes(f))),
);

// ---------------------------------------------------------------------------
// 5. The filter is CSS over server-rendered cards, so the collection stays
//    crawlable and works with JavaScript off. Both halves must be present or
//    the filter silently does nothing.
// ---------------------------------------------------------------------------
const page = readFileSync("src/app/[locale]/(site)/boutique/[category]/page.tsx", "utf8");
const css = readFileSync("src/app/globals.css", "utf8");
const filter = readFileSync("src/components/ScentFilter.tsx", "utf8");

ok("the cards carry their families as a data attribute", /data-scent=\{\(product\.scentFamily \?\? \[\]\)\.join\(" "\)\}/.test(page));
ok("every product is still rendered server-side", /products\.map\(\(product, i\) =>/.test(page));
for (const f of SCENT_FAMILIES) {
  ok(`the ${f.key} filter has a CSS rule`, css.includes(`[data-scent-filter][data-active="${f.key}"]`));
}
ok("the filter offers no product-type facet", !/essentialOil|fragranceOil|perfumeOil/.test(code(filter)));
ok("a single-family collection shows no filter at all", /families\.length < 2/.test(filter));

// ---------------------------------------------------------------------------
// 6. The product page, and the claims it must not make.
// ---------------------------------------------------------------------------
const pdp = readFileSync("src/app/[locale]/(site)/boutique/[category]/[product]/page.tsx", "utf8");
const actions = readFileSync("src/components/ProductActions.tsx", "utf8");
const sitemap = readFileSync("src/lib/sitemapEntries.ts", "utf8");

ok("every product has its own page", /generateStaticParams/.test(pdp) && /treasureProducts/.test(pdp));
ok("the page 404s on an unknown product", /notFound\(\)/.test(pdp));

// Offer structured data needs a price and an availability. Emitting either on
// a piece that is still "on request" is a manual action, not a rich result.
ok("a breadcrumb is emitted", /breadcrumbJsonLd/.test(pdp));
ok("no Product or Offer schema is emitted", !/"@type": ?"Product"|productJsonLd|offerJsonLd/.test(code(pdp)));

// The buy button is gated on a real price, by the same function the cartouche
// flow uses. There is no second answer to "can this be bought".
ok("the page asks the shared predicate", /isInstantlyOrderable\(product\)/.test(pdp));
ok("the price passed in comes from the shared function", /unitPriceCents\(product\)/.test(pdp));
ok("no price means no buy button", /unitCents !== null && unitCents > 0/.test(actions));
ok("an unpriced product says why", /still confirming the bottle sizes and the price/.test(actions));
ok("the buy button names the fulfilment", /collected in Egypt/.test(actions));

// Only one gold button renders: four shouting at once is not a hierarchy.
// The two gold buttons in the source are the arms of ONE ternary, so counting
// occurrences would be counting the branch that does not render. What can be
// proven here is that the SECONDARY actions are never gold; that exactly one
// renders is asserted in the browser instead.
ok("buying is primary when possible, asking when not", /buyable \? \(/.test(actions));
ok("the actions block is addressable", /data-product-actions/.test(actions));
const secondary = actions.slice(actions.indexOf("{buyable && ("));
ok("the secondary enquiry is not gold", !/bg-gold /.test(secondary.slice(0, secondary.indexOf("</Link>"))));
ok("the visit button is not gold", !/bg-gold /.test(secondary.slice(secondary.indexOf("offersVisit"))));

// A shop visit is the right answer for fragrance and nonsense for a pendant,
// so the page decides rather than every product carrying the button.
ok("the visit CTA is conditional", /offersVisit && \(/.test(actions));
ok("the condition is the category's own visit section", /offersVisit=\{Boolean\(category\.inEgypt\)\}/.test(pdp));

// The enquiry carries the product, so nobody retypes what they just chose.
ok("the enquiry identifies the product", /product=\$\{encodeURIComponent\(productSlug\)\}/.test(actions));
ok("and the chosen size", /size=\$\{encodeURIComponent\(variant\)\}/.test(actions));

// A sample listing is a product we have not confirmed. Offering Google a page
// of unconfirmed facts is not discoverability.
ok("product pages reach the sitemap", /treasureProductRoutes/.test(sitemap));
ok("sample listings are kept out of it", /\.filter\(\(p\) => !p\.placeholder/.test(sitemap));
ok("so no oil is in the sitemap yet", oils.every((p) => p.placeholder));

if (errors.length > 0) {
  console.error(`\ncheck-oils: ${errors.length} failure(s)\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("");
  process.exit(1);
}

console.log(
  `check-oils: ok — ${oils.length} oils, none claiming to be an essential oil, none carrying a price, every one ` +
    `marked a sample with a note saying what is still unconfirmed; ${families.length} scent families, each ` +
    "reachable and each holding a product, filtered in CSS over server-rendered cards.",
);
