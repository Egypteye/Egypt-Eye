import { destinationHubs } from "@/content/destinationHubs";
import { egyptCities } from "@/content/egyptCities";

// Resolves a place name to a point on the same 0-100 (x) by 0-87 (y)
// coordinate space every other map on this site already uses — the one
// documented in components/EgyptMap.tsx:
//
//   x = 8 + (lon - 24.70007) * cos(26.79°) * 7.7348
//   y = 6 + (31.58568 - lat) * 7.7348
//
// Three sources feed it, in priority order:
//
//   1. destinationHubs — the 13 places Egypt Eye sells trips to. These are
//      authoritative: a few (Giza) carry a small manual nudge so their pin
//      doesn't collide with a neighbour on the full country map, and that
//      hand-tuning should win over a recomputed value.
//   2. egyptCities — 29 more real Egyptian towns already plotted for the
//      Explore Egypt map.
//   3. EXTRA_PLACES below — real sites that tours visit but neither list
//      carries, projected from their real coordinates through the formula
//      above. Nothing here is eyeballed or invented.
//
// Region tags ("Jordan", "Red Sea", "Sinai") deliberately resolve to
// nothing. They're areas, not points, and inventing a pin for the middle of
// the Red Sea would put a marker where no tour actually stops. Tours whose
// `destinations` are only region tags carry an explicit `mapStops` instead.

// `country` is only set where a stop sits outside Egypt, so a map knows to
// draw that neighbour's outline too rather than pinning it onto open sea.
export type PlacePoint = { name: string; x: number; y: number; country?: "Jordan" };

// Real coordinates, projected once (see scripts note above). Latitude and
// longitude for each are the site's own real position, not a guess at where
// it should sit on a drawing.
const EXTRA_PLACES: PlacePoint[] = [
  // Nile Valley sites
  { name: "Memphis", x: 53.2, y: 19.4 },
  { name: "Dendera", x: 63.0, y: 48.1 },
  { name: "Abydos", x: 57.8, y: 47.8 },
  { name: "Lake Nasser", x: 63.6, y: 72.4 },
  // Western Desert
  { name: "White Desert", x: 31.8, y: 39.9 },
  { name: "Wadi El Hitan", x: 44.8, y: 23.9 },
  // Red Sea coast & islands
  { name: "Soma Bay", x: 72.1, y: 42.6 },
  { name: "Giftun Island", x: 71.8, y: 39.8 },
  // Sinai sites
  { name: "Ras Mohammed", x: 73.9, y: 35.8 },
  { name: "Abu Galum", x: 76.1, y: 28.9 },
  { name: "Colored Canyon", x: 76.9, y: 25.0 },
  // Jordan
  { name: "Petra", x: 82.2, y: 15.7, country: "Jordan" },
  { name: "Wadi Rum", x: 82.0, y: 21.5, country: "Jordan" },
  { name: "Dead Sea", x: 82.9, y: 6.7, country: "Jordan" },
  { name: "Amman", x: 85.4, y: 3.2, country: "Jordan" },
  { name: "Jerash", x: 85.3, y: 0.6, country: "Jordan" },
  { name: "Ajloun", x: 84.3, y: 0.2, country: "Jordan" },
  { name: "Aqaba", x: 79.2, y: 21.9, country: "Jordan" },
];

function buildIndex(): Map<string, PlacePoint> {
  const index = new Map<string, PlacePoint>();
  const add = (key: string, point: PlacePoint) => {
    const k = key.trim().toLowerCase();
    if (k && !index.has(k)) index.set(k, point);
  };

  for (const hub of destinationHubs) {
    const point = { name: hub.name, x: hub.mapX, y: hub.mapY };
    add(hub.name, point);
    for (const alias of hub.matchNames ?? []) add(alias, point);
  }
  for (const city of egyptCities) {
    add(city.name, { name: city.name, x: city.mapX, y: city.mapY });
  }
  for (const place of EXTRA_PLACES) add(place.name, place);

  // A few names tours use that differ from the canonical entry above.
  const alias = (from: string, to: string) => {
    const target = index.get(to.toLowerCase());
    if (target) add(from, target);
  };
  alias("Saint Catherine", "St. Catherine");
  alias("St Catherine", "St. Catherine");
  alias("Rosetta", "Rosetta (Rashid)");
  alias("Bahariya", "Bahariya Oasis");
  alias("Farafra", "Farafra Oasis");
  alias("Dakhla", "Dakhla Oasis");
  alias("Kharga", "Kharga Oasis");
  alias("Siwa Oasis", "Siwa");
  alias("Sharm el-Sheikh", "Sharm El Sheikh");
  alias("Abu Simbel Temple", "Abu Simbel");

  return index;
}

const PLACE_INDEX = buildIndex();

export function findPlace(name: string): PlacePoint | undefined {
  return PLACE_INDEX.get(name.trim().toLowerCase());
}

/**
 * Turns a list of place names into mappable points, in the order given,
 * dropping anything that isn't a real single location (region tags) and
 * collapsing repeats so a route doesn't draw a leg from a place to itself.
 */
export function resolveStops(names: readonly string[] | undefined): PlacePoint[] {
  if (!names) return [];
  const out: PlacePoint[] = [];
  for (const name of names) {
    const point = findPlace(name);
    if (!point) continue;
    if (out.some((p) => p.name === point.name)) continue;
    out.push(point);
  }
  return out;
}
