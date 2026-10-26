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
import { readFileSync } from "node:fs";
import { weeklyTrips, weeklyTripCategoryLabels } from "../src/content/weeklyTrips";
import {
  deriveDeparture,
  selectFeaturedDeparture,
  countdownTo,
  departureInstantMs,
  parseDepartureClock,
  isAlmostFull,
  todayInCairo,
  type DepartureRow,
} from "../src/lib/departureModel";
import { tours } from "../src/content/tours";
import { hiddenTourSlugs } from "../src/content/hiddenTours";
import { stories } from "../src/content/stories";

// Every slug that has ever been published. Adding a trip means adding its slug
// here; renaming one means deciding what happens to its scheduled departures
// first, then updating this line.
const PUBLISHED_SLUGS = new Set([
  "white-desert-overnight-camp",
  "wadi-el-hitan-moonless-night-camp",
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


// ===========================================================================
// THE BUSINESS RULE: THE WEBSITE DOES NOT PUBLISH HOW FULL A VEHICLE IS.
//
// Everything below this line is about one decision — a visitor learns whether
// they can come, never how many places are left or how many are taken. It is
// asserted in several places because there are several ways to leak the same
// number, and only one of them is the obvious one:
//
//   the pill text            "3 seats left"
//   a progress bar           seats_taken / capacity, drawn
//   the party-size menu      capped at the remaining seats, so it counts them
//   the booking response     seatsLeft returned to the browser
//   structured data          remainingAttendeeCapacity, which Google renders
//
// Four of those five were live. Each assertion here was proven by putting the
// leak back and watching it fail.
// ===========================================================================
// Source is read with its comments stripped. Every assertion below is about
// what the code DOES, and a file that explains why it does not publish a
// seat count would otherwise fail its own check for mentioning one — which
// is how a guard ends up matching its own explanatory comment.
const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/.*$/gm, "$1");
const read = (f: string) => stripComments(readFileSync(f, "utf8"));
const uiManifest = readFileSync("src/i18n/generated/ui-manifest.json", "utf8");

const seatSource = read("src/components/SeatAvailability.tsx");
const pillBlock = seatSource.slice(
  seatSource.indexOf("export function SeatPill"),
  seatSource.indexOf("export function GuaranteeNote"),
);
// The labels are read straight out of the component's own tr() calls, so this
// cannot drift from what is rendered, and the strings stay in the shape the
// i18n extractor can find.
const labels = [...pillBlock.matchAll(/\btr\(\s*"((?:[^"\\]|\\.)*)"\s*\)/g)].map((m) => m[1]!);
// Counted from the TONE table rather than hardcoded, so adding a departure
// state fails here until the state has a label too - which is how the
// "announced" state was caught the first time.
const toneBlock = seatSource.slice(seatSource.indexOf("const TONE"), seatSource.indexOf("export function SeatPill"));
const stateCount = [...toneBlock.matchAll(/^\s{2}([a-z_]+):/gm)].length;
if (stateCount < 6) errors.push(`only ${stateCount} departure states found in the TONE table`);
if (labels.length !== stateCount) {
  errors.push(`SeatPill renders ${labels.length} availability labels for ${stateCount} departure states`);
}
for (const label of labels) {
  if (/\d/.test(label)) errors.push(`availability label "${label}" contains a number`);
  if (label.includes("{n}")) errors.push(`availability label "${label}" interpolates a count`);
}
if (/seatsLeft|seatsTaken|capacity/.test(pillBlock)) {
  errors.push("SeatPill reads a seat count again — it may only render its six labels");
}

// Those labels must be translatable, which means literal tr("...") calls the
// extractor can see. Holding them in a lookup table ships English to every
// other locale, silently.
for (const label of labels) {
  if (!uiManifest.includes(JSON.stringify(label).slice(1, -1))) {
    errors.push(`availability label "${label}" is missing from the UI translation manifest — run npm run i18n:extract`);
  }
}

// No proportion bar, anywhere. A drawn ratio publishes the same fact as the
// number and is harder to notice in review.
for (const f of [
  "src/components/SeatAvailability.tsx",
  "src/components/TripDepartures.tsx",
  "src/components/WeeklyTripsCalendar.tsx",
  "src/components/TripCard.tsx",
  "src/components/FeaturedDeparture.tsx",
]) {
  const src = read(f);
  if (/SeatBar/.test(src)) errors.push(`${f}: renders SeatBar, a filled-versus-available breakdown`);
  if (/seatsTaken\s*\/\s*capacity/.test(src)) errors.push(`${f}: draws seats taken over capacity`);
  if (/seatsLeft/.test(src)) errors.push(`${f}: reads seatsLeft, which is the remaining count`);
}

// The party-size menu must not be sized from the remaining seats.
const tripDepSource = read("src/components/TripDepartures.tsx");
if (/maxSeats\s*=\s*[^;]*seatsLeft/.test(tripDepSource)) {
  errors.push("TripDepartures caps the party-size menu at the seats left, which publishes the count");
}

// The booking response is public. The team email may carry the count; the
// JSON body a browser receives may not.
const seatsApi = read("src/app/api/trip-seats/route.ts");
const responseBlock = seatsApi.slice(seatsApi.lastIndexOf("ok: true"));
if (/^\s*seatsLeft,/m.test(responseBlock)) {
  errors.push("/api/trip-seats returns seatsLeft to the browser");
}

// Structured data is a public surface that search engines render.
const seoSource = read("src/content/seo.ts");
if (/remainingAttendeeCapacity/.test(seoSource)) {
  errors.push("seo.ts publishes remainingAttendeeCapacity — the remaining-seat count under another name");
}
if (!/maximumAttendeeCapacity/.test(seoSource)) {
  errors.push("seo.ts no longer publishes maximumAttendeeCapacity — group size is a real, stated fact and should stay");
}

// "Almost full" has to be true when it is said. The old threshold fired at
// half sold, which was honest only while the pill printed the real number.
if (isAlmostFull(6, 12)) errors.push("a half-sold 12-seater is labelled \"Almost full\"");
if (isAlmostFull(4, 8)) errors.push("a half-sold 8-seater is labelled \"Almost full\"");
if (!isAlmostFull(2, 12)) errors.push("2 left of 12 is not labelled almost full");
if (!isAlmostFull(1, 4)) errors.push("1 left of 4 is not labelled almost full");
if (isAlmostFull(0, 12)) errors.push("a sold-out departure is labelled almost full rather than fully booked");

// ===========================================================================
// THE FEATURED DEPARTURE AND ITS CLOCK
// ===========================================================================
const sampleTrip = weeklyTrips[0]!;
const dayAfter = (n: number) => {
  const d = new Date(`${todayInCairo()}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const row = (over: Partial<DepartureRow> & { id: string; departs_on: string }): DepartureRow => ({
  trip_slug: sampleTrip.slug,
  returns_on: null,
  departure_time: null,
  price_usd: 120,
  child_price_usd: null,
  capacity: 12,
  seats_taken: 0,
  min_seats: 4,
  booking_closes_at: null,
  status: "scheduled",
  cancellation_reason: null,
  meeting_point: null,
  note: null,
  ...over,
});
const dep = (over: Partial<DepartureRow> & { id: string; departs_on: string }) =>
  deriveDeparture(row(over), sampleTrip);

const soldOut = dep({ id: "a", departs_on: dayAfter(3), seats_taken: 12 });
const cancelled = dep({ id: "b", departs_on: dayAfter(5), status: "cancelled" });
const closed = dep({ id: "c", departs_on: dayAfter(7), booking_closes_at: "2000-01-01T00:00:00Z" });
const openSoon = dep({ id: "d", departs_on: dayAfter(9) });
const openLater = dep({ id: "e", departs_on: dayAfter(20) });

if (selectFeaturedDeparture([soldOut, cancelled, closed, openSoon, openLater])?.id !== "d") {
  errors.push("the featured departure is not the soonest bookable one");
}
if (selectFeaturedDeparture([soldOut, cancelled, closed]) !== null) {
  errors.push("a sold-out, cancelled or closed departure was promoted to the featured slot");
}
if (selectFeaturedDeparture([]) !== null) errors.push("an empty schedule produced a featured departure");

// Deterministic on a tie, or the page and the countdown can disagree.
const tieA = dep({ id: "aaa", departs_on: dayAfter(4) });
const tieB = dep({ id: "bbb", departs_on: dayAfter(4) });
if (selectFeaturedDeparture([tieA, tieB])?.id !== selectFeaturedDeparture([tieB, tieA])?.id) {
  errors.push("two departures on the same date pick a different featured trip depending on row order");
}

// A departure that has already left is never featured, whatever its status.
const yesterday = dep({ id: "f", departs_on: dayAfter(-1) });
if (selectFeaturedDeparture([yesterday]) !== null) {
  errors.push("a departure whose date has passed is still being featured");
}

// The clock never runs backwards and never shows a negative.
const past = countdownTo(Date.now() - 60_000, Date.now());
if (!past.done || past.days || past.hours || past.minutes || past.seconds) {
  errors.push("an elapsed countdown is not reported as done with every unit at zero");
}
const ahead = countdownTo(Date.now() + ((2 * 24 + 3) * 60 + 4) * 60_000 + 5_000, Date.now());
if (ahead.days !== 2 || ahead.hours !== 3 || ahead.minutes !== 4 || ahead.done) {
  errors.push(`countdown arithmetic is wrong: ${JSON.stringify(ahead)}`);
}

// The free-text departure time is parsed only when it really is a time.
if (parseDepartureClock("06:30, Cairo")?.hour !== 6) errors.push('"06:30, Cairo" did not parse as 06:30');
if (parseDepartureClock("Pickups from 6am") !== null) errors.push('"Pickups from 6am" was parsed as a clock time');
if (parseDepartureClock(null) !== null) errors.push("a missing departure time was parsed as a clock time");
if (parseDepartureClock("29:00") !== null) errors.push('"29:00" was accepted as a clock time');

// The departure instant is the Cairo wall clock, round-tripping exactly.
// Asserted as a property rather than against offsets typed from memory:
// Egypt observes daylight saving, so the offset is not a constant.
const cairoWallClock = (ms: number) => {
  // A non-finite instant means the date or the clock failed to parse. Left
  // alone, Intl throws a RangeError and this script dies with a stack trace
  // instead of a sentence, which is the least useful way for a guard to fail.
  if (!Number.isFinite(ms)) return "not a real instant";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Cairo",
    hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
  }).format(new Date(ms));
};
for (const date of ["2026-01-15", "2026-06-15", "2026-07-01", "2026-12-15"]) {
  const got = cairoWallClock(departureInstantMs(date, "06:30, Cairo"));
  const [d, t] = got.split(", ");
  const [dd, mm, yyyy] = d!.split("/");
  if (`${yyyy}-${mm}-${dd}` !== date || t !== "06:30") {
    errors.push(`departureInstantMs(${date}, 06:30) lands at ${got} in Cairo, not ${date} 06:30`);
  }
}
// And it genuinely tracks the offset change rather than assuming one.
const summerOffset = Date.UTC(2026, 5, 15, 6, 30) - departureInstantMs("2026-06-15", "06:30");
const winterOffset = Date.UTC(2026, 11, 15, 6, 30) - departureInstantMs("2026-12-15", "06:30");
if (summerOffset === winterOffset) {
  errors.push("the same Cairo offset is used in June and December — daylight saving is not being handled");
}
// No recorded time means the start of the departure day, not an invented hour.
if (cairoWallClock(departureInstantMs("2026-06-15", null)).split(", ")[1] !== "00:00") {
  errors.push("a departure with no recorded time does not count down to the start of its day");
}

// A bad row must never take the page down. departureInstantMs is called
// during render, and Intl throws on a non-finite instant, so a malformed
// departs_on used to 500 the whole hub rather than render one trip without a
// clock. Proven by restoring the throw: red.
for (const bad of ["", "not-a-date", "2026-13-45x", "15/06/2026"]) {
  let threw = false;
  let got: number = 0;
  try {
    got = departureInstantMs(bad, "06:30");
  } catch {
    threw = true;
  }
  if (threw) errors.push(`departureInstantMs("${bad}") throws instead of returning NaN`);
  else if (Number.isFinite(got)) errors.push(`departureInstantMs("${bad}") returned a real instant`);
}
// And the featured panel must not render a clock against one.
const featuredSource = read("src/components/FeaturedDeparture.tsx");
if (!/Number\.isFinite\(targetMs\)/.test(featuredSource)) {
  errors.push("FeaturedDeparture renders a countdown without checking the instant is real");
}

// No prose anywhere may promise a seat count either.
//
// The components were made silent while a trip's own FAQ still said "the
// seats left on this departure are shown on this page and update as they go"
// — true when it was written, false the moment the pills stopped printing a
// number, and live for a while because the guards only read components.
// Only an affirmative claim counts. The page is allowed - required, really -
// to explain the policy, and an earlier version of this flagged the FAQ
// "Why don't you show how many seats are left?" along with the sentence
// distinguishing travellers-still-needed from seats-for-sale. A check that
// fires on the copy explaining the rule is a check people switch off, so it
// reads sentence by sentence and skips any sentence that negates or draws a
// contrast.
const CLAIMS_A_COUNT = [
  /\d+\s*(seats?|places?)\s*(left|remaining|available)/i,
  /(seats?|places?)\s+(left|remaining)\b[^.]{0,60}\b(shown|displayed|listed|update)/i,
  /(shows?|display(s|ed)?|tells? you)\s+how many\s+(seats?|places?)/i,
];
const EXPLAINS_INSTEAD = /\b(do not|don't|doesn't|never|no longer|not\b|rather than|instead of|a different number|why we)\b/i;
const prose: [string, string][] = [];
for (const trip of weeklyTrips) {
  prose.push([`${trip.slug} tagline`, trip.tagline], [`${trip.slug} description`, trip.description]);
  for (const f of trip.faqs ?? []) prose.push([`${trip.slug} faq "${f.question.slice(0, 40)}"`, `${f.question} ${f.answer}`]);
  for (const g of trip.included) prose.push([`${trip.slug} included`, g]);
  for (const h of trip.highlights) prose.push([`${trip.slug} highlight`, h]);
}
for (const m of read("src/app/[locale]/(site)/weekly-trips/page.tsx").matchAll(/"((?:[^"\\]|\\.){40,})"/g)) {
  prose.push(["weekly-trips page copy", m[1]!]);
}
for (const [where, text] of prose) {
  for (const sentence of text.split(/(?<=[.?!])\s+/)) {
    if (EXPLAINS_INSTEAD.test(sentence)) continue;
    if (CLAIMS_A_COUNT.some((p) => p.test(sentence))) {
      errors.push(`${where} claims the site shows a seat count: "${sentence.slice(0, 90)}"`);
      break;
    }
  }
}

// A nullable price must never be interpolated next to a currency symbol.
//
// `${d.priceUsd}` with no price produces "$ per seat" - a dangling dollar
// sign - which shipped on every announced date on the trip page. The absence
// of a price is something to say, not a gap to leave.
for (const f of [
  "src/components/TripDepartures.tsx",
  "src/components/WeeklyTripsCalendar.tsx",
  "src/components/FeaturedDeparture.tsx",
  "src/components/TripCard.tsx",
]) {
  const src = read(f);
  for (const m of src.matchAll(/\$\$\{[^}]*priceUsd[^}]*\}/g)) {
    const snippet = m[0];
    // Allowed only where the surrounding expression has already proved the
    // price is present - a ternary or a guard naming priceUsd and null.
    const around = src.slice(Math.max(0, m.index! - 240), m.index! + 120);
    if (!/priceUsd\s*===\s*null|priceUsd\s*!==\s*null/.test(around)) {
      errors.push(`${f}: renders ${snippet} without checking the price exists`);
    }
  }
}

// The hub must not hardcode how many trips there are.
const hubSource = read("src/app/[locale]/(site)/weekly-trips/page.tsx");
for (const word of ["Five trips", "Six trips", "Seven trips", "Eight trips"]) {
  if (hubSource.includes(word)) {
    errors.push(`the hub says "${word}" — it goes stale the moment a trip is added or withdrawn`);
  }
}

if (errors.length > 0) {
  console.error(`\ncheck-weekly-trips: ${errors.length} problem(s)\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("");
  process.exit(1);
}

console.log(`check-weekly-trips: ok — ${weeklyTrips.length} trips, slugs pinned, related links resolve.`);
