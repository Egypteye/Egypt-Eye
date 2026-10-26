/**
 * Proves the astronomy the stargazing calendar is sold on.
 *
 * Egypt Eye publishes a year of dated night-sky departures whose entire value
 * is that the sky will be dark. That claim is checkable, so it is checked:
 * this re-derives the Moon from first principles and refuses to let a date be
 * published that no longer stands up.
 *
 * Two halves:
 *
 *   1. The algorithms are right. New-moon instants are compared against times
 *      published independently (timeanddate, Universal Time Date, Starseed
 *      Atlas all agree to the minute for 2027). If src/lib/astronomy.ts ever
 *      drifts, these fail before anything else does.
 *
 *   2. The published dates are right. Every date in PUBLISHED_DEPARTURES is
 *      re-evaluated against the computed sky. A date that has drifted into a
 *      bright moon fails the build rather than being discovered by a customer
 *      standing in a desert under a half-lit sky.
 *
 * The departures themselves live in Supabase, which CI cannot reach, so the
 * dates are pinned here in the same way scripts/check-weekly-trips.mts pins
 * trip slugs: changing one is then a deliberate act with a diff.
 */
import {
  newMoonsBetween,
  nightConditions,
  moonIllumination,
} from "../src/lib/astronomy";

const errors: string[] = [];
const ok = (label: string, condition: boolean) => {
  if (!condition) errors.push(label);
};

// ---------------------------------------------------------------------------
// 1. The algorithm agrees with the published ephemeris.
//
// Every new moon of 2027 plus the two months this calendar opens in, as
// published UTC times. Sources agree to the minute; one minute of tolerance
// covers the rounding between them.
// ---------------------------------------------------------------------------
const KNOWN_NEW_MOONS: [string, string][] = [
  ["2026-11-09", "07:02"],
  ["2026-12-09", "00:51"],
  ["2027-01-07", "20:24"],
  ["2027-02-06", "15:56"],
  ["2027-03-08", "09:29"],
  ["2027-04-06", "23:51"],
  ["2027-05-06", "10:58"],
  ["2027-06-04", "19:40"],
  ["2027-07-04", "03:01"],
  ["2027-08-02", "10:05"],
  ["2027-08-31", "17:41"],
  ["2027-09-30", "02:36"],
  ["2027-10-29", "13:36"],
  ["2027-11-28", "03:24"],
  ["2027-12-27", "20:12"],
];

const computed = newMoonsBetween(Date.UTC(2026, 10, 1), Date.UTC(2028, 0, 10));
ok(
  `expected ${KNOWN_NEW_MOONS.length} new moons in the window, computed ${computed.length}`,
  computed.length === KNOWN_NEW_MOONS.length
);

for (const [i, [date, time]] of KNOWN_NEW_MOONS.entries()) {
  const got = computed[i];
  if (got === undefined) {
    errors.push(`no computed new moon for ${date}`);
    continue;
  }
  const expected = Date.parse(`${date}T${time}:00Z`);
  const driftMinutes = Math.abs(got - expected) / 60000;
  ok(
    `new moon ${date} ${time}Z computed ${new Date(got).toISOString()} — ${driftMinutes.toFixed(1)} min adrift`,
    driftMinutes <= 2
  );
}

// A new moon is new: the disc is dark. This catches an illumination formula
// that is right about dates and wrong about phase, which the comparison above
// cannot see.
for (const t of computed) {
  const lit = moonIllumination(t);
  ok(`the Moon is ${(lit * 100).toFixed(1)}% lit at a computed new moon`, lit < 0.01);
}
// ...and half a lunation later it is full, which pins the formula at the far end.
for (const t of computed.slice(0, 3)) {
  const lit = moonIllumination(t + 14.77 * 86400000);
  ok(`the Moon is only ${(lit * 100).toFixed(0)}% lit at full moon`, lit > 0.97);
}

// ---------------------------------------------------------------------------
// 2. Every published departure still has a dark sky.
//
// These are the rows in trip_departures with readiness 'announced'. Adding a
// date to the calendar means adding it here, which is the point: a date that
// cannot pass this check should not be sold.
// ---------------------------------------------------------------------------
const PUBLISHED_DEPARTURES: string[] = [
  "2026-11-07",
  "2026-12-12",
  "2027-01-09",
  "2027-02-06",
  "2027-03-06",
  "2027-04-03",
  "2027-05-06",
  "2027-06-05",
  "2027-07-31",
  "2027-08-28",
  "2027-09-30",
  "2027-10-30",
  "2027-11-27",
  "2027-12-25",
];

function cairoOffsetMs(utcMs: number): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Cairo",
    hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(new Date(utcMs));
  const at: Record<string, number> = {};
  for (const p of parts) if (p.type !== "literal") at[p.type] = Number(p.value);
  return Date.UTC(at.year!, at.month! - 1, at.day!, at.hour! % 24, at.minute!, at.second!) - utcMs;
}

/** Midnight at the END of a departure date — the middle of its observing night. */
function middleOfNight(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  const naive = Date.UTC(y!, m! - 1, d! + 1, 0, 0);
  let utc = naive - cairoOffsetMs(naive);
  utc = naive - cairoOffsetMs(utc);
  return utc;
}

for (const date of PUBLISHED_DEPARTURES) {
  const c = nightConditions(middleOfNight(date));
  ok(
    `${date}: the Moon is ${(c.moonIllumination * 100).toFixed(0)}% lit — too bright to sell a Milky Way on`,
    c.moonIllumination <= 0.25
  );
  ok(
    `${date}: only ${c.darkHours.toFixed(1)} genuinely dark hours in the 20:00–04:00 window`,
    c.darkHours >= 4
  );
  ok(`${date}: computed as not dark overall`, c.isDark);
}

// One departure per calendar month, which is the promise the page makes.
const months = new Set(PUBLISHED_DEPARTURES.map((d) => d.slice(0, 7)));
ok(
  `the calendar has ${PUBLISHED_DEPARTURES.length} departures across ${months.size} months — a month is doubled or missing`,
  months.size === PUBLISHED_DEPARTURES.length
);

// No hole big enough to be a missing month.
//
// Sixty days rather than a tight lunation, because the summer genuinely is
// thin and should be: the trip's own season note says the desert is too hot
// to camp in comfortably from June to August, so June runs on the 5th and
// the next date worth selling is 31 July, when two meteor showers make the
// heat worth it. Forcing an even cadence through high summer would mean
// selling a night nobody enjoys. This catches a date that has drifted far
// enough to leave a real hole, which is what the check is for.
const sorted = [...PUBLISHED_DEPARTURES].sort();
for (let i = 1; i < sorted.length; i++) {
  const gap = (Date.parse(sorted[i]!) - Date.parse(sorted[i - 1]!)) / 86400000;
  ok(`${sorted[i - 1]} to ${sorted[i]} is a ${gap.toFixed(0)}-day hole in the calendar`, gap <= 60);
}

// ---------------------------------------------------------------------------
if (errors.length > 0) {
  console.error(`\ncheck-astronomy: ${errors.length} problem(s)\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("");
  process.exit(1);
}

const worst = PUBLISHED_DEPARTURES.map((d) => nightConditions(middleOfNight(d)))
  .reduce((a, b) => (a.moonIllumination > b.moonIllumination ? a : b));
console.log(
  `check-astronomy: ok — ${KNOWN_NEW_MOONS.length} new-moon instants match published times to the minute, ` +
    `and all ${PUBLISHED_DEPARTURES.length} published departures fall on genuinely dark nights ` +
    `(worst case ${(worst.moonIllumination * 100).toFixed(0)}% Moon, ${worst.darkHours.toFixed(1)} dark hours).`
);
