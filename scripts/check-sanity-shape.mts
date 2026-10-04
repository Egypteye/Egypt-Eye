/**
 * Guards the property that a Studio edit cannot take the site down.
 *
 * Take Egypt Home stopped production for two days and three deploys because
 * `TreasureCategory.personalization` was required by its type and absent from
 * the GROQ projection: the first Studio document made it undefined, and the
 * request form walked it. That was one instance of a class.
 *
 * The class has two halves, and both are invisible to everything else:
 *
 *   1. a required field the projection does not select -> always undefined,
 *   2. a required field an editor cleared -> null from GROQ.
 *
 * `safeFetch` casts its result, so the compiler sees a complete object either
 * way. Every other check reads the local content files, which are complete by
 * construction, so they stay green while the site will not build. And no
 * build without a live Sanity connection can reproduce it at all.
 *
 * So this file asserts against the shape Sanity actually returns.
 */
import { readFileSync, readdirSync } from "node:fs";
import type { DestinationHub, Experience, Photoshoot, SignatureExperience, Tour } from "../src/content/types";
import {
  hardenDestinationHub,
  hardenExperience,
  hardenPhotoshoot,
  hardenSignatureExperience,
  hardenTour,
} from "../src/lib/sanityShape";
import { tours as localTours } from "../src/content/tours";

const errors: string[] = [];
const ok = (label: string, condition: boolean) => {
  if (!condition) errors.push(label);
};

// The required array fields of each Sanity-backed type, and the function that
// has to guarantee them. Derived from types.ts rather than written out, so a
// new required array added to a type fails here until it is hardened.
const COVERED: Record<string, (doc: Record<string, unknown>) => Record<string, unknown>> = {
  Tour: (d) => hardenTour(d as unknown as Tour) as unknown as Record<string, unknown>,
  Experience: (d) => hardenExperience(d as unknown as Experience) as unknown as Record<string, unknown>,
  Photoshoot: (d) => hardenPhotoshoot(d as unknown as Photoshoot) as unknown as Record<string, unknown>,
  DestinationHub: (d) => hardenDestinationHub(d as unknown as DestinationHub) as unknown as Record<string, unknown>,
  SignatureExperience: (d) =>
    hardenSignatureExperience(d as unknown as SignatureExperience) as unknown as Record<string, unknown>,
};

const types = readFileSync(new URL("../src/content/types.ts", import.meta.url), "utf8");

function requiredArrayFields(typeName: string): string[] {
  const block = types.match(new RegExp(`export type ${typeName} = \\{([\\s\\S]*?)\\n\\};`))?.[1];
  if (!block) {
    errors.push(`check-sanity-shape can no longer find the ${typeName} type — this check is now blind`);
    return [];
  }
  return [...block.matchAll(/^\s{2}(\w+)(\??):\s*([^;]+);/gm)]
    .filter(([, , optional, type]) => optional !== "?" && (type.includes("[]") || type.trim().startsWith("Array<")))
    .map(([, name]) => name);
}

for (const [typeName, harden] of Object.entries(COVERED)) {
  const fields = requiredArrayFields(typeName);
  ok(`${typeName}: no required array fields found, so this check is asserting nothing`, fields.length > 0);

  // 1. A document straight out of Sanity with nothing filled in. GROQ returns
  //    null for every unset field, and omits a field the projection lacks.
  const empty = harden(Object.fromEntries(fields.map((f) => [f, null])));
  for (const field of fields) {
    ok(`${typeName}.${field} is null from Sanity and is not hardened to an array`, Array.isArray(empty[field]));
  }

  // 2. A document where the field is absent entirely — the personalization case.
  const absent = harden({ slug: "x" });
  for (const field of fields) {
    ok(`${typeName}.${field} is absent from the projection and is not hardened`, Array.isArray(absent[field]));
  }

  // 3. A field an editor deliberately emptied stays empty. Restoring the
  //    repo's copy here would silently overrule a real edit.
  const cleared = harden(Object.fromEntries(fields.map((f) => [f, []])));
  for (const field of fields) {
    ok(`${typeName}.${field} was emptied in the Studio and did not stay empty`, (cleared[field] as unknown[]).length === 0);
  }
}

// A local counterpart is the better fallback than [] where one exists: a tour
// that has never been edited in the Studio should still show its highlights.
const giza = localTours.find((t) => t.highlights.length > 0);
if (!giza) {
  errors.push("no local tour has highlights, so the fallback cannot be asserted");
} else {
  const fromSanity = hardenTour({ slug: giza.slug } as unknown as Tour, giza);
  ok("a tour with nothing set falls back to the local highlights", fromSanity.highlights === giza.highlights);
  ok("a tour with nothing set falls back to the local included list", fromSanity.included === giza.included);
  const emptied = hardenTour({ slug: giza.slug, highlights: [] } as unknown as Tour, giza);
  ok("an emptied highlights list is not refilled from local content", emptied.highlights.length === 0);
}

// Nested relations render through the same cards, so they carry the same risk.
const withRelations = hardenTour({
  slug: "t",
  relatedExperiences: [{ slug: "e", included: null }],
} as unknown as Tour);
ok(
  "a nested related experience is hardened too",
  Array.isArray(withRelations.relatedExperiences?.[0]?.included)
);
const nestedTour = hardenExperience({
  slug: "e",
  relatedTours: [{ slug: "t", destinations: null }],
} as unknown as Experience);
ok("a nested related tour is hardened too", Array.isArray(nestedTour.relatedTours?.[0]?.destinations));

// ---------------------------------------------------------------------------
// Every document type needs a way into it in the Studio.
//
// src/sanity/structure.ts is an explicit list with no fallback to
// documentTypeListItems(), so a schema type that is not named there simply
// has no entry in the sidebar. That is how Take Egypt Home shipped: schemas,
// documents and migration all in place, and no way to reach any of it without
// a developer, which was the one thing the section was asked to avoid.
// ---------------------------------------------------------------------------
const structure = readFileSync(new URL("../src/sanity/structure.ts", import.meta.url), "utf8");
const schemaDir = new URL("../src/sanity/schemaTypes/", import.meta.url);

const documentTypes = new Set<string>();
for (const file of readdirSync(schemaDir)) {
  if (!file.endsWith(".ts") || file === "index.ts") continue;
  const src = readFileSync(new URL(file, schemaDir), "utf8");
  for (const m of src.matchAll(/name:\s*"(\w+)",[\s\S]{0,120}?type:\s*"document"/g)) {
    documentTypes.add(m[1]);
  }
}

ok("no document types found, so this check is asserting nothing", documentTypes.size > 0);
for (const type of documentTypes) {
  ok(
    `the "${type}" document type has no entry in the Studio sidebar — it cannot be reached in structure.ts`,
    new RegExp(`"${type}"`).test(structure)
  );
}

// ---------------------------------------------------------------------------
if (errors.length > 0) {
  console.error(`\ncheck-sanity-shape: ${errors.length} problem(s)\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("");
  process.exit(1);
}

const covered = Object.keys(COVERED)
  .map((t) => `${t} (${requiredArrayFields(t).length})`)
  .join(", ");
console.log(`check-sanity-shape: ok — required arrays guaranteed for ${covered}, nested relations included.`);
