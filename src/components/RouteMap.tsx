import {
  EGYPT_OUTLINE,
  JORDAN_OUTLINE,
  NILE_DELTA_EAST,
  NILE_DELTA_WEST,
  NILE_PATH,
} from "@/lib/egyptMapGeometry";
import type { PlacePoint } from "@/lib/placeCoords";

// "Where You'll Go" — a small map of Egypt for a single tour or experience,
// with this trip's stops pinned on it in visiting order.
//
// It draws the same country outline and Nile as the full Explore Egypt map
// (shared geometry in lib/egyptMapGeometry.ts) and plots stops at their real
// projected coordinates from lib/placeCoords.ts, so a traveler can see at a
// glance that Aswan really is deep south and Siwa really is out west — the
// context a bare cluster of dots can't give.
//
// It stays deliberately plain compared to the Explore Egypt map: no zooming,
// no land texture, no sea labels, no secondary cities. Land, water, the Nile,
// this tour's stops, and nothing else.

// The country outline spans roughly x 8-92, y 6-80 in the shared coordinate
// space; a couple of units of margin keeps the coastline off the card edge.
const EGYPT_FRAME = { minX: 6, minY: 4, maxX: 94, maxY: 82 };

// A stop this close to the frame edge would have its marker clipped in half,
// so the frame grows instead. Jordan extensions (Amman, Jerash, Ajloun) sit
// north-east of Egypt and are what actually push it — and get a wider margin,
// since otherwise a Jordan-only itinerary crowds the very corner of the card.
const STOP_MARGIN = 6;
const FOREIGN_STOP_MARGIN = 13;

const MARKER_R = 2.5;
const HALO_R = 3.3;

// Two markers closer than this render as one blob with the lower-numbered
// stop buried underneath — which is what happens to Cairo every time Giza is
// on the same itinerary (they sit under 4 units apart at country scale).
const MIN_SEPARATION = 6.2;

const GOLD = "#b17f24";
const GOLD_BRIGHT = "#c9a227";
const INK = "#1c231d";

type Placed = PlacePoint & { px: number; py: number };
type Frame = { minX: number; minY: number; w: number; h: number };

function frameFor(stops: PlacePoint[]): Frame {
  let { minX, minY, maxX, maxY } = EGYPT_FRAME;
  for (const s of stops) {
    const m = s.country ? FOREIGN_STOP_MARGIN : STOP_MARGIN;
    minX = Math.min(minX, s.x - m);
    minY = Math.min(minY, s.y - m);
    maxX = Math.max(maxX, s.x + m);
    maxY = Math.max(maxY, s.y + m);
  }
  return { minX, minY, w: maxX - minX, h: maxY - minY };
}

// Nudges any overlapping pair apart until every marker is legible. At country
// scale a unit is roughly 11km, so a stop stays visibly in the right place —
// it's the same compromise the full Explore Egypt map already makes by hand
// for its own Giza pin.
function separate(points: Placed[], frame: Frame): Placed[] {
  if (points.length < 2) return points;

  for (let pass = 0; pass < 24; pass++) {
    let moved = false;

    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const a = points[i];
        const b = points[j];
        let dx = b.px - a.px;
        let dy = b.py - a.py;
        let dist = Math.hypot(dx, dy);

        if (dist >= MIN_SEPARATION) continue;

        // Two stops on the exact same point have no direction to separate
        // along, so give them one rather than dividing by zero.
        if (dist < 0.001) {
          dx = Math.cos(i + j);
          dy = Math.sin(i + j);
          dist = 1;
        }

        const push = (MIN_SEPARATION - dist) / 2;
        const ux = (dx / dist) * push;
        const uy = (dy / dist) * push;
        a.px -= ux;
        a.py -= uy;
        b.px += ux;
        b.py += uy;
        moved = true;
      }
    }

    // Keep everything inside the frame; the clamp can re-introduce an
    // overlap, which the next pass then works out.
    for (const p of points) {
      p.px = Math.min(frame.minX + frame.w - HALO_R, Math.max(frame.minX + HALO_R, p.px));
      p.py = Math.min(frame.minY + frame.h - HALO_R, Math.max(frame.minY + HALO_R, p.py));
    }

    if (!moved) break;
  }

  return points;
}

export function RouteMap({
  stops,
  singleLabel,
}: {
  stops: PlacePoint[];
  /** Shown beside a one-location pin — the experience or place name. */
  singleLabel?: string;
}) {
  if (stops.length === 0) return null;

  const showJordan = stops.some((s) => s.country === "Jordan");
  const frame = frameFor(stops);
  const placed = separate(
    stops.map((s) => ({ ...s, px: s.x, py: s.y })),
    frame,
  );
  const isSingle = placed.length === 1;
  const polyline = placed.map((p) => `${p.px.toFixed(2)},${p.py.toFixed(2)}`).join(" ");

  // The single-stop label sits under its pin, flipped above when the pin is
  // near the bottom edge, and pulled inward horizontally so a coastal stop's
  // name doesn't run off the card.
  const labelBelow = isSingle && placed[0].py < frame.minY + frame.h - 9;
  const labelX = isSingle
    ? Math.min(frame.minX + frame.w - 17, Math.max(frame.minX + 17, placed[0].px))
    : 0;
  const labelY = isSingle ? placed[0].py + (labelBelow ? 7.6 : -6.2) : 0;

  return (
    <figure className="mt-4 overflow-hidden rounded-2xl border border-black/5 bg-sand-dim/60">
      <svg
        viewBox={`${frame.minX} ${frame.minY} ${frame.w} ${frame.h}`}
        className="block w-full"
        role="img"
        aria-label={
          isSingle
            ? `Map showing ${placed[0].name}`
            : `Map showing the route: ${placed.map((p) => p.name).join(", then ")}`
        }
      >
        {/* Water fills the frame; the land polygon on top covers everything
            that isn't sea, so only the Mediterranean, the Red Sea and the
            two gulfs show this tone. */}
        <rect
          x={frame.minX}
          y={frame.minY}
          width={frame.w}
          height={frame.h}
          fill="#cfe0e2"
          fillOpacity="0.55"
        />

        <g fill="#f4ecd9" stroke="#8a7239" strokeWidth="0.35" strokeOpacity="0.5">
          {/* Jordan is drawn only for the Jordan-extension tours — without it
              their stops would pin onto open water east of Sinai. */}
          {showJordan && <path d={JORDAN_OUTLINE} />}
          <path d={EGYPT_OUTLINE} />
        </g>

        <g fill="none" stroke="#16686c" strokeOpacity="0.45" strokeLinecap="round">
          <path d={NILE_PATH} strokeWidth="0.5" />
          <path d={NILE_DELTA_WEST} strokeWidth="0.38" />
          <path d={NILE_DELTA_EAST} strokeWidth="0.38" />
        </g>

        {!isSingle && (
          <polyline
            points={polyline}
            fill="none"
            stroke={GOLD}
            strokeWidth="0.7"
            strokeOpacity="0.8"
            strokeDasharray="1.8 1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {placed.map((p, i) => (
          <g key={`${p.name}-${i}`}>
            <circle cx={p.px} cy={p.py} r={HALO_R} fill="#fffdf8" fillOpacity="0.95" />
            <circle cx={p.px} cy={p.py} r={MARKER_R} fill={isSingle ? GOLD : GOLD_BRIGHT} />
            {!isSingle && (
              <text
                x={p.px}
                y={p.py}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="2.7"
                fontWeight="700"
                fill={INK}
              >
                {i + 1}
              </text>
            )}
          </g>
        ))}

        {isSingle && singleLabel && (
          <g fontSize="3.4" fontWeight="700" textAnchor="middle">
            {/* The halo is a separate stroked copy underneath rather than a
                `paint-order` stroke on one element, so the name stays legible
                over the coastline in every renderer. */}
            <text x={labelX} y={labelY} stroke="#fffdf8" strokeWidth="1.6" strokeOpacity="0.9" fill="none">
              {singleLabel}
            </text>
            <text x={labelX} y={labelY} fill={INK}>
              {singleLabel}
            </text>
          </g>
        )}
      </svg>

      {!isSingle && (
        <figcaption className="flex flex-wrap gap-x-4 gap-y-1.5 border-t border-black/5 bg-cream/50 px-4 py-3">
          {placed.map((p, i) => (
            <span key={`${p.name}-legend-${i}`} className="flex items-center gap-1.5 text-xs text-ink-soft/75">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-ink">
                {i + 1}
              </span>
              {p.name}
            </span>
          ))}
        </figcaption>
      )}
    </figure>
  );
}
