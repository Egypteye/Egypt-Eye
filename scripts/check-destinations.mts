/**
 * Guards the Explore Egypt map against two silent content-drift failures
 * that both shipped to production before this check existed:
 *
 *   1. A secondary city marker telling visitors "we don't run tours here
 *      yet" about a place we actively sell (Dahab, Saqqara, Edfu, Bahariya
 *      and seven others were doing exactly that).
 *   2. A tour/experience/photoshoot reachable from no destination hub at
 *      all, so the destination system — the site's main topical internal
 *      linking layer — never links to it.
 *
 * Both are invisible in the UI and in a build: the page renders fine, it
 * just says the wrong thing or silently drops a product. Run in CI.
 */
import { destinationHubs } from "../src/content/destinationHubs";
import { egyptCities } from "../src/content/egyptCities";
import { tours } from "../src/content/tours";
import { activities } from "../src/content/activities";
import { photoshoots } from "../src/content/photoshoots";

type Tagged = { slug: string; destinations?: string[] };

// Jordan is sold, but sits outside the "Explore Egypt" map by design — not
// an unlinked Egyptian destination. Egyptian region-wide tags ("Red Sea",
// "Sinai") are deliberately NOT exempt here: they always accompany a more
// specific tag on a correctly-tagged product, so a item carrying only one
// of them is genuinely unlinked and should surface.
const NON_HUB_TAGS = new Set(["Jordan", "Petra", "Wadi Rum", "Dead Sea"]);

// Known-unlinked products, recorded rather than silently exempted. Each one
// is a real gap awaiting a content decision; the check prints them on every
// run so they can't be forgotten. Currently empty — keep it that way by
// resolving the tag rather than adding an entry, unless the answer genuinely
// needs someone who knows how the trip is sold.
const UNRESOLVED = new Map<string, string>([]);

const hubBySlug = new Map(destinationHubs.map((h) => [h.slug, h]));
const allMatchNames = new Set(destinationHubs.flatMap((h) => h.matchNames));

const catalogue: { kind: string; items: Tagged[] }[] = [
  { kind: "tour", items: tours as Tagged[] },
  { kind: "experience", items: activities as Tagged[] },
  { kind: "photoshoot", items: photoshoots as Tagged[] },
];

const errors: string[] = [];

// 1. Every city marker claiming "not offered" must really not be offered,
//    and every hubSlug must point at a hub that exists and actually covers it.
for (const city of egyptCities) {
  const sellsIt = catalogue.flatMap(({ kind, items }) =>
    items
      .filter((i) => (i.destinations ?? []).includes(city.name))
      .map((i) => `${kind} ${i.slug}`),
  );

  if (city.hubSlug) {
    const hub = hubBySlug.get(city.hubSlug);
    if (!hub) {
      errors.push(`${city.slug}: hubSlug "${city.hubSlug}" is not a real hub`);
    } else if (sellsIt.length === 0) {
      errors.push(
        `${city.slug}: has hubSlug "${city.hubSlug}" but nothing is tagged "${city.name}" — ` +
          `the marker promises tours that don't exist`,
      );
    }
  } else if (sellsIt.length > 0) {
    errors.push(
      `${city.slug}: marker says "we don't run tours here yet", but we sell ${sellsIt.length} — ` +
        `${sellsIt.join(", ")}. Give it a hubSlug or promote it to a hub.`,
    );
  }
}

// 2. Nothing in the catalogue may be unreachable from every hub.
for (const { kind, items } of catalogue) {
  for (const item of items) {
    const tags = item.destinations ?? [];
    if (tags.length === 0) continue;
    if (tags.every((t) => NON_HUB_TAGS.has(t))) continue;
    if (UNRESOLVED.has(item.slug)) continue;
    if (!tags.some((t) => allMatchNames.has(t)))
      errors.push(
        `${kind} ${item.slug}: tagged ${JSON.stringify(tags)}, which no hub's matchNames cover — ` +
          `it is linked from no destination page.`,
      );
  }
}

if (errors.length > 0) {
  console.error(`\ncheck-destinations: ${errors.length} problem(s)\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("");
  process.exit(1);
}

console.log(
  `check-destinations: ok — ${destinationHubs.length} hubs, ${egyptCities.length} secondary markers, ` +
    `${catalogue.reduce((n, c) => n + c.items.length, 0)} catalogue items.`,
);
for (const [slug, why] of UNRESOLVED) console.log(`  ! ${slug}: ${why}`);
