// The shared geometry behind every map on this site — the full interactive
// Explore Egypt map (components/EgyptMap.tsx) and the small per-tour route
// map (components/RouteMap.tsx) both draw from here, so a correction to the
// coastline or the Nile only ever has to be made once.
//
// A real, accurately-projected map of Egypt — not a stylized illustration.
// The country outline, Sinai peninsula, Nile, and Suez Canal below are
// plotted from real coordinates (a simplified public-domain Egypt border
// polygon, and known city/river coordinates) through a simple equirectangular
// projection with a cosine correction for latitude, computed once:
//
//   x = 8 + (lon - 24.70007) * cos(26.79°) * 7.7348
//   y = 6 + (31.58568 - lat) * 7.7348
//
// which maps Egypt's real bounding box onto a 0-100 (x) by 0-87 (y) viewBox
// with an 8/6-unit margin. destinationHub.mapX/mapY (and egyptCities.ts) in
// the CMS/content are stored in this same coordinate space, run through the
// same projection, so a pin's position is always geographically honest
// rather than eyeballed. lib/placeCoords.ts resolves a place name to a point
// in this space.

export const VIEWBOX_W = 100;
export const VIEWBOX_H = 87;

export const EGYPT_OUTLINE =
  "M78.58,22.12 L76.64,25.23 L75.16,31.07 L73.28,35.1 L71.67,36.45 L69.37,33.96 L66.25,30.5 " +
  "L61.32,19.42 L60.61,20.12 L63.48,28.28 L67.71,36.06 L72.93,48.1 L75.48,52.31 L77.7,56.68 " +
  "L83.9,65.24 L82.52,66.59 L82.75,71.62 L90.79,78.56 L92,80.14 L64.62,80.14 L37.83,80.14 " +
  "L10.07,80.14 L10.07,51.66 L10.07,24.15 L8,17.92 L9.78,13.15 L8.71,9.84 L11.21,6.13 L20.4,6 " +
  "L27.04,8.05 L33.89,10.33 L37.09,11.54 L42.41,9.08 L45.25,6.87 L51.34,6.23 L56.25,7.21 " +
  "L58.13,11.04 L59.73,8.52 L65.26,10.34 L70.65,10.78 L74.04,8.83 L78.58,22.12 Z";

export const NILE_PATH =
  "M51.84,6.28 L53.12,17.92 L52.12,25.46 L49.7,32.88 L52.74,40.08 L56.26,44.87 L62.82,51.62 " +
  "L64.61,63.99 L55.82,77.54";

// The Nile splits into its two main distributaries just north of Cairo,
// fanning out to the Rosetta (west) and Damietta (east) river mouths — a
// real, recognizable feature the single trunk line alone was missing.
export const NILE_DELTA_WEST = "M53.12,17.92 L51.4,13.4 L47.5,7.4";
export const NILE_DELTA_EAST = "M53.12,17.92 L55.6,12.6 L57.1,7.3";

export const SUEZ_CANAL_PATH = "M60.33,8.52 L62.2,18.5";
