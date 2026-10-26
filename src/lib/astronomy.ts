// Lunar and solar geometry, computed rather than copied.
//
// =========================================================================
// WHY THIS EXISTS AT ALL
// =========================================================================
// Egypt Eye sells a stargazing trip whose entire value is the darkness of
// the sky on one particular night. "Book around a new moon" is already on the
// experience page as advice to the customer; this is the same statement made
// precise enough to schedule against.
//
// The alternative was to type a year's worth of new-moon dates off a website
// into a content file. That fails in a specific way: nobody can tell, later,
// whether a date was checked or guessed, and a transcription slip produces a
// departure sold on a promise of darkness under a half-lit moon. Computing it
// means the check script can re-derive every published date from scratch and
// fail the build if one of them no longer sits in a dark window.
//
// The algorithms are Meeus, "Astronomical Algorithms" (2nd ed.):
//   ch. 49  phases of the Moon      - new moon instants, ~1 minute
//   ch. 47  position of the Moon    - principal periodic terms
//   ch. 25  position of the Sun     - low precision
//   ch. 48  illuminated fraction
//
// Truncated to the larger terms, which is the right trade here: the answers
// feed decisions measured in whole nights ("is the moon up, and how bright"),
// not in arcseconds. Validated against independently published new-moon times
// in scripts/check-astronomy.mts - all thirteen of 2027 and both of the
// 2026 months this calendar starts in.
//
// Everything here is pure and free of any server import, so the check script
// and the page can share it.

const RAD = Math.PI / 180;
const sin = (deg: number) => Math.sin(deg * RAD);
const cos = (deg: number) => Math.cos(deg * RAD);

/** Wrap to [0, 360). */
function norm(deg: number): number {
  const d = deg % 360;
  return d < 0 ? d + 360 : d;
}

// ---------------------------------------------------------------------------
// Julian day <-> civil time
// ---------------------------------------------------------------------------

/** Julian Day from a UTC instant. */
export function julianDay(ms: number): number {
  return ms / 86400000 + 2440587.5;
}

/** UTC instant (epoch ms) from a Julian Day. */
export function fromJulianDay(jd: number): number {
  return (jd - 2440587.5) * 86400000;
}

/**
 * Difference between Terrestrial Time and UT, in seconds.
 *
 * Meeus' phase formulae give an instant in TT. Around the late 2020s the gap
 * is a little over a minute and changing slowly; a constant is accurate
 * enough for scheduling a coach and wrong by far less than the hour that
 * would matter.
 */
const DELTA_T_SECONDS = 72;

// ---------------------------------------------------------------------------
// New moon instants - Meeus ch. 49
// ---------------------------------------------------------------------------

/**
 * The instant of the new moon for lunation `k`, as epoch ms (UTC).
 *
 * k = 0 is the new moon of 2000 January 6; it increments by one each
 * synodic month.
 */
export function newMoonInstant(k: number): number {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const T4 = T3 * T;

  let jde =
    2451550.09766 + 29.530588861 * k + 0.00015437 * T2 - 0.00000015 * T3 + 0.00000000073 * T4;

  const E = 1 - 0.002516 * T - 0.0000074 * T2;
  const M = norm(2.5534 + 29.1053567 * k - 0.0000014 * T2 - 0.00000011 * T3);
  const Mp = norm(201.5643 + 385.81693528 * k + 0.0107582 * T2 + 0.00001238 * T3 - 0.000000058 * T4);
  const F = norm(160.7108 + 390.67050284 * k - 0.0016118 * T2 - 0.00000227 * T3 + 0.000000011 * T4);
  const Om = norm(124.7746 - 1.56375588 * k + 0.0020672 * T2 + 0.00000215 * T3);

  jde +=
    -0.4072 * sin(Mp) +
    0.17241 * E * sin(M) +
    0.01608 * sin(2 * Mp) +
    0.01039 * sin(2 * F) +
    0.00739 * E * sin(Mp - M) +
    -0.00514 * E * sin(Mp + M) +
    0.00208 * E * E * sin(2 * M) +
    -0.00111 * sin(Mp - 2 * F) +
    -0.00057 * sin(Mp + 2 * F) +
    0.00056 * E * sin(2 * Mp + M) +
    -0.00042 * sin(3 * Mp) +
    0.00042 * E * sin(M + 2 * F) +
    0.00038 * E * sin(M - 2 * F) +
    -0.00024 * E * sin(2 * Mp - M) +
    -0.00017 * sin(Om) +
    -0.00007 * sin(Mp + 2 * M) +
    0.00004 * sin(2 * Mp - 2 * F) +
    0.00004 * sin(3 * M) +
    0.00003 * sin(Mp + M - 2 * F) +
    0.00003 * sin(2 * Mp + 2 * F) +
    -0.00003 * sin(Mp + M + 2 * F) +
    0.00003 * sin(Mp - M + 2 * F) +
    -0.00002 * sin(Mp - M - 2 * F) +
    -0.00002 * sin(3 * Mp + M) +
    0.00002 * sin(4 * Mp);

  const A = [
    [299.77 + 0.107408 * k - 0.009173 * T2, 0.000325],
    [251.88 + 0.016321 * k, 0.000165],
    [251.83 + 26.651886 * k, 0.000164],
    [349.42 + 36.412478 * k, 0.000126],
    [84.66 + 18.206239 * k, 0.00011],
    [141.74 + 53.303771 * k, 0.000062],
    [207.14 + 2.453732 * k, 0.00006],
    [154.84 + 7.30686 * k, 0.000056],
    [34.52 + 27.261239 * k, 0.000047],
    [207.19 + 0.121824 * k, 0.000042],
    [291.34 + 1.844379 * k, 0.00004],
    [161.72 + 24.198154 * k, 0.000037],
    [239.56 + 25.513099 * k, 0.000035],
    [331.55 + 3.592518 * k, 0.000023],
  ] as const;
  for (const [angle, coeff] of A) jde += coeff * sin(norm(angle));

  return fromJulianDay(jde) - DELTA_T_SECONDS * 1000;
}

/** Every new moon between two instants, in order. */
export function newMoonsBetween(fromMs: number, toMs: number): number[] {
  const startYear = new Date(fromMs).getUTCFullYear();
  const k = Math.floor((startYear - 2000) * 12.3685) - 2;
  const out: number[] = [];
  for (let i = 0; i < 400; i++) {
    const t = newMoonInstant(k + i);
    if (t > toMs) break;
    if (t >= fromMs) out.push(t);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Positions - Meeus ch. 25 (Sun) and ch. 47 (Moon), truncated
// ---------------------------------------------------------------------------

type Equatorial = { ra: number; dec: number; distanceKm: number };

function centuries(ms: number): number {
  return (julianDay(ms) - 2451545) / 36525;
}

function obliquity(T: number): number {
  return 23.439291 - 0.0130042 * T - 0.00000016 * T * T + 0.000000504 * T * T * T;
}

function toEquatorial(lonDeg: number, latDeg: number, distanceKm: number, T: number): Equatorial {
  const eps = obliquity(T);
  const sl = sin(lonDeg);
  const cl = cos(lonDeg);
  const sb = sin(latDeg);
  const cb = cos(latDeg);
  const se = sin(eps);
  const ce = cos(eps);
  const ra = Math.atan2(sl * ce - (sb / cb) * se, cl) / RAD;
  const dec = Math.asin(sb * ce + cb * se * sl) / RAD;
  return { ra: norm(ra), dec, distanceKm };
}

/** The Sun, geometric. */
export function sunPosition(ms: number): Equatorial & { lonDeg: number } {
  const T = centuries(ms);
  const L0 = norm(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const M = norm(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * sin(M) +
    (0.019993 - 0.000101 * T) * sin(2 * M) +
    0.000289 * sin(3 * M);
  const trueLon = L0 + C;
  const e = 0.016708634 - 0.000042037 * T - 0.0000001267 * T * T;
  const v = M + C;
  const R = (1.000001018 * (1 - e * e)) / (1 + e * cos(v));
  const distanceKm = R * 149597870.7;
  return { ...toEquatorial(trueLon, 0, distanceKm, T), lonDeg: trueLon };
}

/**
 * The Moon, using the principal periodic terms of Meeus ch. 47.
 *
 * Truncated to the terms above roughly 0.01 degrees, which is a long way
 * below anything that changes a scheduling decision.
 */
export function moonPosition(ms: number): Equatorial & { lonDeg: number; latDeg: number } {
  const T = centuries(ms);
  const Lp = norm(218.3164477 + 481267.88123421 * T - 0.0015786 * T * T);
  const D = norm(297.8501921 + 445267.1114034 * T - 0.0018819 * T * T);
  const M = norm(357.5291092 + 35999.0502909 * T - 0.0001536 * T * T);
  const Mp = norm(134.9633964 + 477198.8675055 * T + 0.0087414 * T * T);
  const F = norm(93.272095 + 483202.0175233 * T - 0.0036539 * T * T);

  const lon =
    Lp +
    (6.288774 * sin(Mp) +
      1.274027 * sin(2 * D - Mp) +
      0.658314 * sin(2 * D) +
      0.213618 * sin(2 * Mp) +
      -0.185116 * sin(M) +
      -0.114332 * sin(2 * F) +
      0.058793 * sin(2 * D - 2 * Mp) +
      0.057066 * sin(2 * D - M - Mp) +
      0.053322 * sin(2 * D + Mp) +
      0.045758 * sin(2 * D - M) +
      -0.040923 * sin(M - Mp) +
      -0.034720 * sin(D) +
      -0.030383 * sin(M + Mp) +
      0.015327 * sin(2 * D - 2 * F) +
      -0.012528 * sin(Mp + 2 * F) +
      0.010980 * sin(Mp - 2 * F) +
      0.010675 * sin(4 * D - Mp) +
      0.010034 * sin(3 * Mp) +
      0.008548 * sin(4 * D - 2 * Mp));

  const lat =
    5.128122 * sin(F) +
    0.280602 * sin(Mp + F) +
    0.277693 * sin(Mp - F) +
    0.173237 * sin(2 * D - F) +
    0.055413 * sin(2 * D - Mp + F) +
    0.046271 * sin(2 * D - Mp - F) +
    0.032573 * sin(2 * D + F) +
    0.017198 * sin(2 * Mp + F) +
    0.009266 * sin(2 * D + Mp - F) +
    0.008822 * sin(2 * Mp - F) +
    0.008216 * sin(2 * D - M - F);

  const distanceKm =
    385000.56 +
    (-20905.355 * cos(Mp) +
      -3699.111 * cos(2 * D - Mp) +
      -2955.968 * cos(2 * D) +
      -569.925 * cos(2 * Mp) +
      48.888 * cos(M) +
      -3.149 * cos(2 * F) +
      246.158 * cos(2 * D - 2 * Mp) +
      -152.138 * cos(2 * D - M - Mp) +
      -170.733 * cos(2 * D + Mp) +
      -204.586 * cos(2 * D - M) +
      -129.620 * cos(M - Mp) +
      108.743 * cos(D) +
      104.755 * cos(M + Mp)) /
      1000;

  return {
    ...toEquatorial(norm(lon), lat, distanceKm, T),
    lonDeg: norm(lon),
    latDeg: lat,
  };
}

// ---------------------------------------------------------------------------
// What a person standing in the desert actually sees
// ---------------------------------------------------------------------------

/** Greenwich mean sidereal time in degrees. */
function gmst(ms: number): number {
  const jd = julianDay(ms);
  const T = centuries(ms);
  return norm(
    280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * T * T - (T * T * T) / 38710000
  );
}

/** Altitude above the horizon, in degrees, for an observer at lat/lon. */
export function altitude(body: Equatorial, ms: number, latDeg: number, lonDeg: number): number {
  const H = norm(gmst(ms) + lonDeg - body.ra);
  return (
    Math.asin(sin(latDeg) * sin(body.dec) + cos(latDeg) * cos(body.dec) * cos(H)) / RAD
  );
}

/**
 * The fraction of the Moon's disc that is lit, 0 to 1 - Meeus ch. 48.
 *
 * This is the number that decides whether a night is worth selling. 0.00 is
 * new; above roughly 0.30 the Milky Way starts visibly washing out, which is
 * the thing the trip is sold on.
 */
export function moonIllumination(ms: number): number {
  const s = sunPosition(ms);
  const m = moonPosition(ms);
  const psi = Math.acos(
    sin(s.dec) * sin(m.dec) + cos(s.dec) * cos(m.dec) * cos(s.ra - m.ra)
  ) / RAD;
  const i =
    Math.atan2(s.distanceKm * sin(psi), m.distanceKm - s.distanceKm * cos(psi)) / RAD;
  return (1 + cos(i)) / 2;
}

/** Where Egypt Eye actually runs the stargazing: Wadi El Hitan, Fayoum. */
export const WADI_EL_HITAN = { lat: 29.2667, lon: 30.0417 } as const;

export type NightConditions = {
  /** Illuminated fraction of the Moon at local midnight, 0-1. */
  moonIllumination: number;
  /** Highest the Moon gets between 20:00 and 04:00 local, in degrees. */
  moonMaxAltitude: number;
  /** Hours in that window with the Moon below the horizon and the Sun well down. */
  darkHours: number;
  /** True when the window is genuinely dark enough to sell a Milky Way on. */
  isDark: boolean;
};

/**
 * What the sky does over one night at Wadi El Hitan.
 *
 * The window is 20:00 to 04:00 local, which is the part of the night this
 * trip is actually out in. A moon that sets at 21:00 barely matters; a moon
 * that rises at 01:00 ruins the second half of the session, and the pair of
 * numbers below is what distinguishes the two - which a "days from new moon"
 * figure cannot do.
 *
 * `isDark` deliberately requires BOTH a faint moon and real dark hours. A
 * 15%-lit crescent that is up all night is not the same product as a 15%-lit
 * crescent that set at dusk.
 */
export function nightConditions(
  localMidnightUtcMs: number,
  site: { lat: number; lon: number } = WADI_EL_HITAN
): NightConditions {
  const illum = moonIllumination(localMidnightUtcMs);

  let maxAlt = -90;
  let darkHours = 0;
  // 20:00 the previous evening through 04:00, stepped every 20 minutes.
  for (let minutes = -4 * 60; minutes <= 4 * 60; minutes += 20) {
    const t = localMidnightUtcMs + minutes * 60000;
    const moonAlt = altitude(moonPosition(t), t, site.lat, site.lon);
    const sunAlt = altitude(sunPosition(t), t, site.lat, site.lon);
    if (moonAlt > maxAlt) maxAlt = moonAlt;
    // Astronomical twilight ends at -18 degrees; the Moon counts as absent
    // once it is below the horizon.
    if (sunAlt < -18 && moonAlt < 0) darkHours += 20 / 60;
  }

  return {
    moonIllumination: illum,
    moonMaxAltitude: maxAlt,
    darkHours,
    isDark: illum <= 0.25 && darkHours >= 4,
  };
}
