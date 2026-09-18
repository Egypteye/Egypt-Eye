/**
 * Every field name that holds a string anywhere in the content files, and
 * how the localizer classifies it.
 *
 * The allowlist in i18n/localizeDeep.ts is the one place a mistake ships
 * silently — a prose field left out stays English in six languages, a key
 * field let in breaks a filter. This prints the whole surface so that
 * judgement is reviewable rather than assumed. Run after adding content
 * fields: npm run i18n:keys
 */
import { tours } from "../src/content/tours.js";
import { experiences } from "../src/content/experiences.js";
import { photoshoots } from "../src/content/photoshoots.js";
import { stories } from "../src/content/stories.js";
import { signatureExperiences } from "../src/content/signatureExperiences.js";
import { destinationHubs } from "../src/content/destinationHubs.js";
import { homepage } from "../src/content/homepage.js";
import { aboutPage } from "../src/content/aboutPage.js";
import { contactPage } from "../src/content/contactPage.js";
import { customizePage } from "../src/content/customizePage.js";
import { listingPages } from "../src/content/listingPages.js";
import { transfersPage } from "../src/content/transfers.js";
import { site } from "../src/content/site.js";
import { classifyKey } from "../src/i18n/localizeDeep.js";

const sources: Record<string, unknown> = {
  tours, experiences, photoshoots, stories, signatureExperiences,
  destinationHubs, homepage, aboutPage, contactPage, customizePage,
  listingPages, transfersPage, site,
};

const seen = new Map<string, { sample: string; count: number; where: Set<string> }>();
function walk(node: unknown, key: string, where: string, depth = 0) {
  if (depth > 12 || node === null || node === undefined) return;
  if (typeof node === "string") {
    const e = seen.get(key) ?? { sample: node, count: 0, where: new Set<string>() };
    e.count++;
    e.where.add(where);
    seen.set(key, e);
    return;
  }
  if (Array.isArray(node)) return node.forEach((i) => walk(i, key, where, depth + 1));
  if (typeof node !== "object") return;
  for (const [k, v] of Object.entries(node as Record<string, unknown>)) walk(v, k, where, depth + 1);
}
for (const [name, value] of Object.entries(sources)) walk(value, "", name);

const rows = [...seen.entries()].map(([key, e]) => ({ key, ...e, verdict: classifyKey(key) }));
const order = { prose: 0, opaque: 1, unclassified: 2 } as const;
rows.sort((a, b) => order[a.verdict] - order[b.verdict] || b.count - a.count);

for (const r of rows) {
  const sample = r.sample.replace(/\s+/g, " ").slice(0, 52);
  console.log(`${r.verdict.padEnd(13)} ${r.key.padEnd(26)} ${String(r.count).padStart(6)}  ${sample}`);
}
const un = rows.filter((r) => r.verdict === "unclassified");
console.log(`\n${rows.length} distinct string fields — ${rows.filter(r=>r.verdict==="prose").length} prose, ${rows.filter(r=>r.verdict==="opaque").length} opaque, ${un.length} unclassified (left in English).`);
