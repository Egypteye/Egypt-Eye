/**
 * Collects every translatable English string on the site into one manifest.
 *
 * Run: npm run i18n:extract
 *
 * Reads the content modules directly rather than a running site, so it sees
 * the same objects the fetchers hand to pages — including fields no page
 * renders yet. It uses `collectStrings` from the runtime's own localizer, so
 * the manifest is exactly the set of fingerprints the site will look up: no
 * string is translated that nothing asks for, and nothing visible is missed.
 *
 * Sanity content is deliberately NOT read here. A translation for a string an
 * editor writes in Studio belongs beside it in Studio, where they can see and
 * fix it; this manifest covers the content that lives in the repo, which is
 * what the site falls back to and what every page renders today.
 */
import { writeFileSync, readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { collectStrings } from "../src/i18n/localizeDeep.js";
import { fingerprint, isTranslatable } from "../src/i18n/fingerprint.js";

import { tours } from "../src/content/tours.js";
import { experiences } from "../src/content/experiences.js";
import { photoshoots } from "../src/content/photoshoots.js";
import { stories } from "../src/content/stories.js";
import { signatureExperiences } from "../src/content/signatureExperiences.js";
import { destinationHubs } from "../src/content/destinationHubs.js";
import { activityDestinationGroups } from "../src/content/activities.js";
import { homepage } from "../src/content/homepage.js";
import { aboutPage } from "../src/content/aboutPage.js";
import { contactPage } from "../src/content/contactPage.js";
import { customizePage } from "../src/content/customizePage.js";
import { listingPages } from "../src/content/listingPages.js";
import { transfersPage } from "../src/content/transfers.js";
import { site } from "../src/content/site.js";
import { faqs } from "../src/content/faq.js";
import { testimonials } from "../src/content/testimonials.js";
import { agencyTrips } from "../src/content/aboutCredibility.js";
// Already flattened to just the translatable strings, so the walk never
// sees the structural `kind`/`id` fields that carry no prose.
import { cancellationPolicyStrings } from "../src/content/cancellationPolicy.js";
import { egyptCities } from "../src/content/egyptCities.js";

const MANIFEST = "src/i18n/generated/manifest.json";
const UI_MANIFEST = "src/i18n/generated/ui-manifest.json";

const sources: [string, unknown][] = [
  ["tours", tours],
  ["experiences", experiences],
  ["photoshoots", photoshoots],
  ["stories", stories],
  ["signatureExperiences", signatureExperiences],
  ["destinationHubs", destinationHubs],
  ["activityGroups", activityDestinationGroups],
  ["homepage", homepage],
  ["aboutPage", aboutPage],
  ["contactPage", contactPage],
  ["customizePage", customizePage],
  ["listingPages", listingPages],
  ["transfers", transfersPage],
  ["site", site],
  ["faqs", faqs],
  ["testimonials", testimonials],
  ["agencyTrips", agencyTrips],
  // Wrapped under a prose key: collectStrings classifies by field name and
  // an array inherits its parent's key, so a bare top-level array of
  // strings is collected as nothing.
  ["cancellationPolicy", { body: cancellationPolicyStrings }],
  ["egyptCities", egyptCities],
];

const all = new Map<string, string>();
console.log("Source                     strings   new");
for (const [name, value] of sources) {
  const before = all.size;
  const own = collectStrings(value);
  for (const [k, v] of own) all.set(k, v);
  console.log(`${name.padEnd(24)} ${String(own.size).padStart(7)} ${String(all.size - before).padStart(5)}`);
}

// Sorted so the file is diffable: a content edit should show as one changed
// line, not a reshuffle of the whole manifest.
const sorted = Object.fromEntries([...all.entries()].sort(([a], [b]) => (a < b ? -1 : 1)));

const previous: Record<string, string> = existsSync(MANIFEST)
  ? JSON.parse(readFileSync(MANIFEST, "utf8"))
  : {};
const added = Object.keys(sorted).filter((k) => !(k in previous)).length;
const removed = Object.keys(previous).filter((k) => !(k in sorted)).length;

writeFileSync(MANIFEST, JSON.stringify(sorted, null, 0) + "\n");

const words = Object.values(sorted).reduce((n, s) => n + s.split(/\s+/).length, 0);
console.log(`\n${all.size} strings, ${words.toLocaleString()} words → ${MANIFEST}`);
console.log(`(+${added} new, -${removed} no longer used since last extract)`);



// ---------------------------------------------------------------------------
// Sanity, when credentials are available.
//
// Most Studio content mirrors the repo — /api/migrate pushes these same files
// up — so it already fingerprints identically and is translated by the strings
// collected above. Two things are not: text an editor has since rewritten in
// Studio, and documents that only ever existed there. The testimonials are the
// big one: 1,481 of them live in Sanity and none in the repo.
//
// Skipped silently without credentials, because the pipeline has to run for a
// contributor who has never configured Sanity.
// ---------------------------------------------------------------------------

async function fromSanity(): Promise<Map<string, string>> {
  const found = new Map<string, string>();
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    console.log("\nSanity: no NEXT_PUBLIC_SANITY_PROJECT_ID — skipping (repo content only).");
    return found;
  }
  try {
    const { client } = await import("../src/sanity/client.js");
    // Everything editorial, in one pass. `...` pulls each document whole, so a
    // field added in Studio is picked up without editing this query.
    const docs = await client.fetch<unknown[]>(
      `*[_type in ["tour","experience","photoshoot","story","signatureExperience",
                   "destinationHub","testimonial","faq","siteSettings","homepage",
                   "listingPages","aboutPage","contactPage","customizePage"]]{...}`
    );
    collectStrings(docs, found);
    console.log(`\nSanity: ${docs.length} documents, ${found.size} strings`);
  } catch (err) {
    console.warn(`\nSanity: could not read (${(err as Error).message.slice(0, 120)}) — repo content only.`);
  }
  return found;
}

const fromCms = await fromSanity();
if (fromCms.size > 0) {
  const before = all.size;
  for (const [k, v] of fromCms) all.set(k, v);
  const merged = Object.fromEntries([...all.entries()].sort(([a], [b]) => (a < b ? -1 : 1)));
  writeFileSync(MANIFEST, JSON.stringify(merged, null, 0) + "\n");
  console.log(`  +${all.size - before} strings only in Sanity → ${all.size} total`);
}

// ---------------------------------------------------------------------------
// UI strings: the ones written into components rather than into content.
//
// Found by scanning source for the two call shapes, which is reliable because
// they are the only shapes the helpers accept: `<T>text</T>` and `tr("text")`
// (server), `useTr()`'s `tr("text")` (client). A string that is neither is not
// translatable, which is exactly the signal the audit below reports.
// ---------------------------------------------------------------------------

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === "node_modules" || entry === "generated") continue;
      sourceFiles(full, out);
    } else if (/\.tsx?$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

const T_ELEMENT = /<T>\s*\{?\s*["'`]?([^<>{}"'`][^<>]*?)["'`]?\s*\}?\s*<\/T>/g;
const TR_CALL = /\btr\(\s*"((?:[^"\\]|\\.)*)"\s*\)/g;
const TR_ALL = /\btrAll\(\s*\[([\s\S]*?)\]\s*\)/g;

const ui = new Map<string, string>();
const add = (text: string) => {
  const clean = text.replace(/\\"/g, '"').replace(/\s+/g, " ").trim();
  if (clean && isTranslatable(clean)) ui.set(fingerprint(clean), clean);
};

for (const file of sourceFiles("src")) {
  const src = readFileSync(file, "utf8");
  for (const m of src.matchAll(T_ELEMENT)) add(m[1]);
  for (const m of src.matchAll(TR_CALL)) add(m[1]);
  for (const m of src.matchAll(TR_ALL)) {
    for (const s of m[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)) add(s[1]);
  }
}

const uiSorted = Object.fromEntries([...ui.entries()].sort(([a], [b]) => (a < b ? -1 : 1)));
writeFileSync(UI_MANIFEST, JSON.stringify(uiSorted, null, 0) + "\n");
console.log(`${ui.size} UI strings → ${UI_MANIFEST}`);
