/**
 * Guards the Weekly Trips catalogue against the failures that a build can't
 * see, because every one of them still compiles and still renders a page.
 *
 * The important one is the slug. A departure row in Supabase points at a trip
 * by slug, and that reference is not a foreign key — it can't be, because the
 * trips live in version control rather than in the database. So renaming a
 * trip's slug silently orphans every departure the team has already scheduled:
 * they vanish from the site with no error anywhere, and the first sign is a
 * customer asking why their trip disappeared.
 *
 * This can't check the live database from CI, so it does the next best thing:
 * it pins the slugs. Changing one is then a deliberate act that fails the
 * build and makes you write the migration, rather than an accident.
 */
import { weeklyTrips, weeklyTripCategoryLabels } from "../src/content/weeklyTrips";
import { tours } from "../src/content/tours";
import { hiddenTourSlugs } from "../src/content/hiddenTours";
import { stories } from "../src/content/stories";

// Every slug that has ever been published. Adding a trip means adding its slug
// here; renaming one means deciding what happens to its scheduled departures
// first, then updating this line.
const PUBLISHED_SLUGS = new Set([
  "white-desert-overnight-camp",
  "wadi-el-hitan-fayoum-day-trip",
  "dahshur-saqqara-memphis-day-trip",
  "siwa-oasis-long-weekend",
  "sinai-bedouin-beach-camp",
  "alexandria-coast-day-trip",
]);

const errors: string[] = [];

const tourSlugs = new Set(tours.map((t) => t.slug));
const storySlugs = new Set(stories.filter((s) => s.status === "published").map((s) => s.slug));
const seen = new Set<string>();

for (const trip of weeklyTrips) {
  const where = `weeklyTrips[${trip.slug}]`;

  if (seen.has(trip.slug)) errors.push(`${where}: duplicate slug`);
  seen.add(trip.slug);

  if (!PUBLISHED_SLUGS.has(trip.slug)) {
    errors.push(
      `${where}: slug is not in PUBLISHED_SLUGS. If this is a new trip, add it there. ` +
        `If you renamed an existing trip, its scheduled departures in trip_departures ` +
        `still point at the OLD slug and will disappear from the site — migrate them first.`,
    );
  }

  // A trip with no photo renders a flat colour gradient where the hero should
  // be, which is exactly the failure that shipped across the stories grid.
  if (!trip.image) errors.push(`${where}: no image`);

  if (!weeklyTripCategoryLabels[trip.category]) {
    errors.push(`${where}: category "${trip.category}" has no label`);
  }

  // nights and duration are shown next to each other and are the basis of the
  // day-trip/overnight filter, so they have to agree.
  if (trip.nights === 0 && /night/i.test(trip.duration)) {
    errors.push(`${where}: nights is 0 but duration says "${trip.duration}"`);
  }
  if (trip.nights > 0 && !/night|day/i.test(trip.duration)) {
    errors.push(`${where}: nights is ${trip.nights} but duration doesn't say so ("${trip.duration}")`);
  }

  if (trip.included.length === 0) errors.push(`${where}: nothing listed as included`);

  for (const slug of trip.relatedTourSlugs ?? []) {
    if (!tourSlugs.has(slug)) errors.push(`${where}: relatedTourSlugs "${slug}" is not a tour`);
    else if (hiddenTourSlugs.has(slug)) {
      errors.push(`${where}: relatedTourSlugs "${slug}" is a withheld tour — it has no public page`);
    }
  }

  for (const slug of trip.relatedStorySlugs ?? []) {
    if (!storySlugs.has(slug)) {
      errors.push(`${where}: relatedStorySlugs "${slug}" is not a published story`);
    }
  }
}

for (const slug of PUBLISHED_SLUGS) {
  if (!seen.has(slug)) {
    errors.push(
      `${slug}: listed in PUBLISHED_SLUGS but no longer in weeklyTrips. Departures scheduled ` +
        `against it will be hidden from the site — remove them, or restore the trip.`,
    );
  }
}

if (errors.length > 0) {
  console.error(`\ncheck-weekly-trips: ${errors.length} problem(s)\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("");
  process.exit(1);
}

console.log(`check-weekly-trips: ok — ${weeklyTrips.length} trips, slugs pinned, related links resolve.`);
