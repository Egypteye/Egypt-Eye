import type { PlacePoint } from "@/lib/placeCoords";

// "Where You'll Go" — a deliberately small, deliberately plain route map for
// a single tour or experience.
//
// Positions come from lib/placeCoords.ts, which is the same projected
// coordinate space the full Explore Egypt map uses, so the relative geography
// here is real: Aswan really does sit that far south of Cairo, and the route
// line really does run in visiting order. What it is NOT is a country map —
// there's no coastline, no Nile, no labels for seas. A tour page needs to
// answer "which places, in what order, roughly where relative to each other",
// and every extra stroke past that is clutter at this size.
//
// The frame scales to whatever the route actually spans: a Cairo-and-Giza day
// fills the box the same way a Cairo-to-Abu-Simbel week does. Scaling is
// uniform on both axes, so nothing is stretched to fill space — a north-south
// Nile route stays tall and narrow rather than being pulled square.

const VB_W = 100;
const VB_H = 58;
const PAD_X = 13;
const PAD_Y = 11;

// Markers are 8.8 units across, so any two closer than this render as a
// single blob with the lower-numbered one buried underneath — which is
// exactly what happens to Cairo whenever Giza is on the same itinerary.
const MIN_SEPARATION = 9.6;

const GOLD = "#c9a227";
const GOLD_DARK = "#8c6d1f";
const INK_SOFT = "#4a5c4f";

type Placed = PlacePoint & { px: number; py: number };

function layout(stops: PlacePoint[]): Placed[] {
  const innerW = VB_W - PAD_X * 2;
  const innerH = VB_H - PAD_Y * 2;

  const xs = stops.map((s) => s.x);
  const ys = stops.map((s) => s.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spanX = maxX - minX;
  const spanY = maxY - minY;

  // A single stop — or several stops so close together they'd render as one
  // blob — gets centred rather than magnified until the rounding noise
  // between two neighbouring towns looks like a real distance.
  if (spanX < 0.5 && spanY < 0.5) {
    return stops.map((s, i) => ({
      ...s,
      px: VB_W / 2 + (i - (stops.length - 1) / 2) * 14,
      py: VB_H / 2,
    }));
  }

  const scale = Math.min(spanX > 0 ? innerW / spanX : Infinity, spanY > 0 ? innerH / spanY : Infinity);
  const drawnW = spanX * scale;
  const drawnH = spanY * scale;
  const offsetX = (VB_W - drawnW) / 2;
  const offsetY = (VB_H - drawnH) / 2;

  const placed = stops.map((s) => ({
    ...s,
    px: offsetX + (s.x - minX) * scale,
    py: offsetY + (s.y - minY) * scale,
  }));

  return separate(placed);
}

// Cairo and Giza are 20km apart. On a route that also reaches Abu Simbel
// they land about two units apart here, and the second marker drawn covers
// the first completely — so the trip's starting point silently disappears.
//
// This nudges any overlapping pair apart until every marker is legible,
// which trades a small amount of positional precision for the thing the map
// exists to do. It's the same compromise the full Explore Egypt map already
// makes by hand for its own Giza pin. Relative direction is preserved: a
// stop north-west of another still renders north-west of it, just further.
function separate<T extends { px: number; py: number }>(points: T[]): T[] {
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
      p.px = Math.min(VB_W - PAD_X / 2, Math.max(PAD_X / 2, p.px));
      p.py = Math.min(VB_H - PAD_Y / 2, Math.max(PAD_Y / 2, p.py));
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
  /** Shown under a one-location map — the experience or place name. */
  singleLabel?: string;
}) {
  if (stops.length === 0) return null;

  const placed = layout(stops);
  const isSingle = placed.length === 1;
  const polyline = placed.map((p) => `${p.px.toFixed(2)},${p.py.toFixed(2)}`).join(" ");

  return (
    <figure className="mt-4 overflow-hidden rounded-2xl border border-black/5 bg-sand-dim/60">
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="block w-full"
        role="img"
        aria-label={
          isSingle
            ? `Map showing ${placed[0].name}`
            : `Route map: ${placed.map((p) => p.name).join(", then ")}`
        }
      >
        {!isSingle && (
          <polyline
            points={polyline}
            fill="none"
            stroke={GOLD}
            strokeWidth="0.9"
            strokeOpacity="0.55"
            strokeDasharray="2.4 1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {placed.map((p, i) => (
          <g key={`${p.name}-${i}`}>
            <circle cx={p.px} cy={p.py} r="4.4" fill="#fffdf8" fillOpacity="0.95" />
            <circle cx={p.px} cy={p.py} r="3.4" fill={isSingle ? GOLD_DARK : GOLD} />
            {!isSingle && (
              <text
                x={p.px}
                y={p.py}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="3.6"
                fontWeight="700"
                fill="#1c231d"
              >
                {i + 1}
              </text>
            )}
          </g>
        ))}

        {isSingle && singleLabel && (
          <text
            x={VB_W / 2}
            y={VB_H / 2 + 11}
            textAnchor="middle"
            fontSize="4.6"
            fontWeight="600"
            fill={INK_SOFT}
          >
            {singleLabel}
          </text>
        )}
      </svg>

      {!isSingle && (
        <figcaption className="flex flex-wrap gap-x-4 gap-y-1.5 border-t border-black/5 px-4 py-3">
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
