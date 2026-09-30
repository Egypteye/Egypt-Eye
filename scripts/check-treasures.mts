/**
 * Guards Take Egypt Home, whose failure mode is a sentence rather than a crash.
 *
 * This section sells commissioned objects with no settled price, made by
 * people Egypt Eye works with rather than employs. Every risk here is the same
 * risk: a claim appearing on the page that nobody has verified. A price on a
 * sample listing, a karat nobody measured, "100% natural" on a bottle whose
 * composition is unknown — each renders perfectly and each is a promise the
 * business then has to keep.
 *
 * So the checks are about truth, not structure:
 *
 *   - a sample listing may not carry a price or a specification,
 *   - the claims that need evidence may not appear anywhere in the content,
 *   - every internal link resolves,
 *   - and the four categories stay wired to real routes.
 */
import { treasureCategories, treasureProducts, treasureProductsFor } from "../src/content/treasures";
import { tours } from "../src/content/tours";
import { hiddenTourSlugs } from "../src/content/hiddenTours";
import { photoshoots } from "../src/content/photoshoots";
import { stories } from "../src/content/stories";

const errors: string[] = [];
const ok = (label: string, condition: boolean) => {
  if (!condition) errors.push(label);
};

const tourSlugs = new Set(tours.map((t) => t.slug));
const photoshootSlugs = new Set(photoshoots.map((p) => p.slug));
const storySlugs = new Set(stories.filter((s) => s.status === "published").map((s) => s.slug));

// ---------------------------------------------------------------------------
// Claims that need evidence. Written as patterns because the point is to catch
// the phrasing a shopping page reaches for by reflex, wherever it appears —
// hero, story, FAQ or product blurb.
// ---------------------------------------------------------------------------
const UNSUPPORTED = [
  { pattern: /\b100%\s*(natural|pure|organic)/i, why: "a composition claim nobody has verified" },
  { pattern: /\bchemical[- ]free\b/i, why: "a composition claim nobody has verified" },
  { pattern: /\bairline[- ]safe\b|\ballowed on (all|any|every) flight/i, why: "a carriage rule that varies by airline" },
  { pattern: /\bhallmark(ed)?\b/i, why: "an assay claim that needs the supplier's paperwork" },
  { pattern: /\bcertified\b/i, why: "a certification claim that needs paperwork" },
  { pattern: /\bguarantee[ds]?\b/i, why: "a guarantee the business has not defined" },
];

function scan(where: string, text: string) {
  for (const { pattern, why } of UNSUPPORTED) {
    if (pattern.test(text)) {
      errors.push(`${where}: says "${text.match(pattern)?.[0]}" — ${why}. See docs/take-egypt-home.md.`);
    }
  }
}

for (const category of treasureCategories) {
  const where = `treasures[${category.slug}]`;

  scan(`${where}.heroHeadline`, category.heroHeadline);
  scan(`${where}.heroSub`, category.heroSub);
  scan(`${where}.cardBlurb`, category.cardBlurb);
  for (const block of category.story) scan(`${where}.story`, `${block.title} ${block.body}`);
  for (const item of category.trust) scan(`${where}.trust`, item);
  for (const faq of category.faqs) scan(`${where}.faq`, `${faq.question} ${faq.answer}`);

  ok(`${where}: no FAQs — this is the section where people have the most questions`, category.faqs.length > 0);
  ok(`${where}: no trust statements`, category.trust.length > 0);
  ok(`${where}: no before-arrival steps, which is the whole proposition`, category.beforeYouArrive.length > 0);
  ok(`${where}: no personalisation fields, so the form would ask nothing`, category.personalization.length > 0);

  // A photo field means a private bucket and a signed link, so it may not be
  // added casually — see supabase/migrations/0019_treasure_uploads.sql.
  const photoFields = category.personalization.filter((f) => f.kind === "photo");
  ok(`${where}: more than one photo field, which the request route does not support`, photoFields.length <= 1);

  for (const slug of category.relatedTourSlugs ?? []) {
    ok(`${where}: relatedTourSlugs "${slug}" is not a tour`, tourSlugs.has(slug));
    ok(`${where}: relatedTourSlugs "${slug}" is a withheld tour with no public page`, !hiddenTourSlugs.has(slug));
  }
  for (const slug of category.relatedPhotoshootSlugs ?? []) {
    ok(`${where}: relatedPhotoshootSlugs "${slug}" is not a photoshoot`, photoshootSlugs.has(slug));
  }
  for (const slug of category.relatedStorySlugs ?? []) {
    ok(`${where}: relatedStorySlugs "${slug}" is not a published story`, storySlugs.has(slug));
  }

  ok(`${where}: no products at all, so the page has nothing to show`, treasureProductsFor(category.slug).length > 0);
}

// ---------------------------------------------------------------------------
// Products.
// ---------------------------------------------------------------------------
const categorySlugs = new Set(treasureCategories.map((c) => c.slug));
const seen = new Set<string>();

for (const product of treasureProducts) {
  const where = `treasureProducts[${product.slug}]`;
  ok(`${where}: duplicate slug`, !seen.has(product.slug));
  seen.add(product.slug);

  ok(`${where}: category "${product.category}" does not exist`, categorySlugs.has(product.category));
  scan(where, `${product.name} ${product.blurb}`);

  // The core rule. A sample listing is an idea, and an idea with a price on it
  // is a quote nobody authorised.
  if (product.placeholder) {
    ok(
      `${where}: is a placeholder but carries a price. Remove the price, or drop placeholder once it is real.`,
      product.price === undefined
    );
    ok(
      `${where}: is a placeholder but carries specs. Those are business facts — drop placeholder first.`,
      !product.specs || product.specs.length === 0
    );
  }
}

// ---------------------------------------------------------------------------
if (errors.length > 0) {
  console.error(`\ncheck-treasures: ${errors.length} problem(s)\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("");
  process.exit(1);
}

const placeholders = treasureProducts.filter((p) => p.placeholder).length;
console.log(
  `check-treasures: ok — ${treasureCategories.length} categories, ${treasureProducts.length} listings ` +
    `(${placeholders} still samples awaiting real data), every internal link resolves, no unverified claims.`
);
