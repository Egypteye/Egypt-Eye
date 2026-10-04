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
import { readFileSync } from "node:fs";
import { treasureCategories, treasureProducts, treasureProductsFor } from "../src/content/treasures";
import type { TreasureCategory } from "../src/content/types";
import { mergeTreasureCategoryWithLocal } from "../src/lib/treasureMerge";
import { treasureCategoriesQuery } from "../src/sanity/queries";
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

  // A hot-linked photo with no credit is a licence problem, not a style one.
  // Local /photos files and Sanity uploads are Egypt Eye's own and need none.
  if (typeof category.image === "string" && category.image.startsWith("http") && !category.imageCredit) {
    errors.push(`${where}: hot-links ${new URL(category.image).hostname} with no imageCredit`);
  }
  if (category.image) ok(`${where}: image has no alt text`, Boolean(category.imageAlt));
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

  if (typeof product.image === "string" && product.image.startsWith("http") && !product.imageCredit) {
    errors.push(`${where}: hot-links ${new URL(product.image).hostname} with no imageCredit`);
  }
  if (product.image) ok(`${where}: image has no alt text`, Boolean(product.imageAlt));

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
// What the Studio sends back.
//
// Every check above reads the local content files, which is exactly why they
// all passed while production was down: `personalization` was missing from
// the GROQ projection, so the moment a treasureCategory document existed in
// Sanity the renderer got `undefined` and every build died prerendering
// /take-egypt-home/cartouches. No check that only reads local content can see
// that, and no build without a live Sanity connection can reproduce it.
//
// So this section asserts against the shape Sanity actually returns.
// ---------------------------------------------------------------------------

// The fields the renderer walks without checking first. Each one is a crash,
// not a blank section, if it arrives undefined.
const WALKED_UNGUARDED = ["story", "beforeYouArrive", "trust", "faqs", "personalization"] as const;

// GROQ returns null for a field the document never set, and omits nothing —
// so this is what a freshly-migrated category looks like before an editor has
// typed anything, with `personalization` absent because no such field exists
// in the schema at all.
const fromSanity = {
  slug: "cartouches",
  title: "Cartouches",
  eyebrow: null,
  heroHeadline: null,
  heroSub: null,
  cardHook: null,
  cardBlurb: null,
  story: null,
  beforeYouArrive: null,
  inEgypt: null,
  trust: null,
  faqs: null,
} as unknown as TreasureCategory;

const merged = mergeTreasureCategoryWithLocal(fromSanity);
for (const field of WALKED_UNGUARDED) {
  ok(
    `a category straight out of Sanity has ${field} as an array, not undefined`,
    Array.isArray(merged[field])
  );
}

// A category nobody has a local copy of — an editor created it in the Studio.
// There is nothing to fall back to, so the lists must be empty, not missing.
const inventedInStudio = mergeTreasureCategoryWithLocal({
  slug: "scarabs",
  title: "Scarabs",
} as unknown as TreasureCategory);
for (const field of WALKED_UNGUARDED) {
  ok(`a Studio-only category has ${field} as an array`, Array.isArray(inventedInStudio[field]));
}

// A section an editor deliberately emptied stays empty — clearing a block is
// a real edit, and silently restoring the repo's copy would overrule it.
const cleared = mergeTreasureCategoryWithLocal({
  slug: "cartouches",
  title: "Cartouches",
  story: [],
  trust: [],
} as unknown as TreasureCategory);
ok("an emptied story block stays empty rather than reverting", cleared.story.length === 0);
ok("an emptied trust list stays empty rather than reverting", cleared.trust.length === 0);

// inEgypt is rendered behind a null check, but its steps are then walked
// unguarded — a half-filled block must not be fatal.
const halfInEgypt = mergeTreasureCategoryWithLocal({
  slug: "clothing",
  title: "Clothing",
  inEgypt: { title: "In Egypt", body: "Come to the shop.", steps: null },
} as unknown as TreasureCategory);
ok("a half-filled inEgypt block has steps as an array", Array.isArray(halfInEgypt.inEgypt?.steps));

// The request form's field names are a wire contract with
// /api/treasure-request and the private uploads bucket, so they come from the
// code and never from the Studio, whatever a document happens to carry.
const withStudioFields = mergeTreasureCategoryWithLocal({
  slug: "cartouches",
  title: "Cartouches",
  personalization: [{ kind: "text", name: "renamed_by_an_editor", label: "x", maxLength: 10 }],
} as unknown as TreasureCategory);
const localCartouches = treasureCategories.find((c) => c.slug === "cartouches");
ok(
  "personalization comes from the code, not from Sanity",
  withStudioFields.personalization.every((f, i) => f.name === localCartouches?.personalization[i]?.name)
);

// ---------------------------------------------------------------------------
// And the static half: a required field that the query does not select is the
// bug that caused the outage, so adding one to the type without adding it to
// the projection fails here rather than in production.
// ---------------------------------------------------------------------------
const typesSrc = readFileSync(new URL("../src/content/types.ts", import.meta.url), "utf8");
const typeBlock = typesSrc.match(/export type TreasureCategory = \{([\s\S]*?)\n\};/)?.[1];
if (!typeBlock) {
  errors.push("check-treasures can no longer find the TreasureCategory type — this check is now blind");
} else {
  // Fields the code owns on purpose. Anything else required must be queried.
  const CODE_OWNED = new Set(["personalization", "relatedTourSlugs", "relatedPhotoshootSlugs", "relatedStorySlugs", "imageAlt", "imageCredit"]);
  const required = [...typeBlock.matchAll(/^\s{2}(\w+)(\??):/gm)]
    .filter(([, , optional]) => optional !== "?")
    .map(([, name]) => name);

  ok("the TreasureCategory type is still parseable, with required fields found", required.length > 0);
  for (const field of required) {
    if (CODE_OWNED.has(field)) continue;
    ok(
      `TreasureCategory.${field} is required but treasureCategoriesQuery does not select it — ` +
        `Sanity would return undefined and the page would throw`,
      new RegExp(`\\b${field}\\b`).test(treasureCategoriesQuery)
    );
  }
  // Every code-owned field must actually be filled in by the merge, or it is
  // simply missing rather than deliberately owned.
  for (const field of CODE_OWNED) {
    if (!required.includes(field)) continue;
    ok(`${field} is listed as code-owned but the merge does not supply it`, merged[field as keyof TreasureCategory] !== undefined);
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
