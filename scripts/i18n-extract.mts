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
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { collectStrings } from "../src/i18n/localizeDeep.js";

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

const MANIFEST = "src/i18n/generated/manifest.json";

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
