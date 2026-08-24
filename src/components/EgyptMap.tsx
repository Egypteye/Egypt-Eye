"use client";

import Link from "next/link";
import type { DestinationHub } from "@/content/types";

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
// with an 8/6-unit margin. destinationHub.mapX/mapY in the CMS are stored in
// this same coordinate space, run through the same projection, so a pin's
// position is always geographically honest rather than eyeballed.
const VIEWBOX_W = 100;
const VIEWBOX_H = 87;

const EGYPT_OUTLINE =
  "M78.58,22.12 L76.64,25.23 L75.16,31.07 L73.28,35.1 L71.67,36.45 L69.37,33.96 L66.25,30.5 " +
  "L61.32,19.42 L60.61,20.12 L63.48,28.28 L67.71,36.06 L72.93,48.1 L75.48,52.31 L77.7,56.68 " +
  "L83.9,65.24 L82.52,66.59 L82.75,71.62 L90.79,78.56 L92,80.14 L64.62,80.14 L37.83,80.14 " +
  "L10.07,80.14 L10.07,51.66 L10.07,24.15 L8,17.92 L9.78,13.15 L8.71,9.84 L11.21,6.13 L20.4,6 " +
  "L27.04,8.05 L33.89,10.33 L37.09,11.54 L42.41,9.08 L45.25,6.87 L51.34,6.23 L56.25,7.21 " +
  "L58.13,11.04 L59.73,8.52 L65.26,10.34 L70.65,10.78 L74.04,8.83 L78.58,22.12 Z";

const NILE_PATH =
  "M51.84,6.28 L53.12,17.92 L52.12,25.46 L49.7,32.88 L52.74,40.08 L56.26,44.87 L62.82,51.62 " +
  "L64.61,63.99 L55.82,77.54";

const SUEZ_CANAL_PATH = "M60.33,8.52 L62.2,18.5";

// Real-world reference labels — not decorative filler, these are the
// actual bodies of water / regions at these coordinates.
const MAP_LABELS = [
  { text: "MEDITERRANEAN SEA", x: 44.5, y: 3.6, size: 2.6 },
  { text: "SINAI", x: 71.5, y: 23.7, size: 2.8 },
  { text: "RED SEA", x: 82, y: 46, size: 2.6, rotate: 78 },
  { text: "WESTERN DESERT", x: 26, y: 42, size: 2.4 },
  { text: "LAKE NASSER", x: 60, y: 74, size: 2 },
];

function distance(a: DestinationHub, b: DestinationHub) {
  return Math.hypot(a.mapX - b.mapX, a.mapY - b.mapY);
}

export function EgyptMap({
  hubs,
  selectedSlug,
  onSelect,
  linkBase,
  routeSlugs,
  className = "",
}: {
  hubs: DestinationHub[];
  selectedSlug?: string | null;
  onSelect?: (slug: string) => void;
  /** When set, pins are real links to `${linkBase}/${slug}` instead of buttons — used on /explore-egypt for real, crawlable per-destination URLs. */
  linkBase?: string;
  routeSlugs?: string[];
  className?: string;
}) {
  const routePoints = (routeSlugs ?? [])
    .map((slug) => hubs.find((h) => h.slug === slug))
    .filter((h): h is DestinationHub => Boolean(h));

  // A pin only gets a permanent label if nothing else sits within reach —
  // otherwise (Cairo/Giza, Hurghada/El Gouna) it shows a label on
  // hover/focus/selection instead of jamming two names on top of each other.
  const CROWD_THRESHOLD = 9;
  const isCrowded = (hub: DestinationHub) => hubs.some((other) => other.slug !== hub.slug && distance(hub, other) < CROWD_THRESHOLD);

  return (
    <div
      className={`group/map relative overflow-hidden rounded-[2rem] border border-gold/15 shadow-inner shadow-black/10 ${className}`}
      style={{ aspectRatio: `${VIEWBOX_W} / ${VIEWBOX_H}` }}
    >
      {/* Water — sits behind the SVG; the land polygon drawn on top covers
          everything that isn't sea, so only the Mediterranean, Red Sea, and
          the Gulfs of Suez/Aqaba show this tone. */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(160deg, #cfe4e3 0%, #a9cfd2 45%, #8fbfc6 100%)" }}
        aria-hidden="true"
      />

      <svg viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`} preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="landGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f4efe2" />
            <stop offset="55%" stopColor="#ebe0c8" />
            <stop offset="100%" stopColor="#e0d2ac" />
          </linearGradient>
          <clipPath id="landClip">
            <path d={EGYPT_OUTLINE} />
          </clipPath>
        </defs>

        {/* Land — one real, single connected polygon (simplified from an actual
            Egypt border dataset) that already includes the Sinai peninsula via
            the Gulf of Suez / Gulf of Aqaba indentations, not a separate shape. */}
        <path d={EGYPT_OUTLINE} fill="url(#landGradient)" stroke="#8a7239" strokeWidth="0.45" strokeOpacity="0.6" />

        {/* Land texture, clipped so it never bleeds into the sea */}
        <g clipPath="url(#landClip)" opacity="0.5">
          <pattern id="landDots" width="3" height="3" patternUnits="userSpaceOnUse">
            <circle cx="0.5" cy="0.5" r="0.22" fill="#b17f24" fillOpacity="0.25" />
          </pattern>
          <rect x="0" y="0" width={VIEWBOX_W} height={VIEWBOX_H} fill="url(#landDots)" />
        </g>

        {/* Suez Canal */}
        <path d={SUEZ_CANAL_PATH} fill="none" stroke="#4a90a4" strokeWidth="0.5" strokeDasharray="0.8 0.6" strokeLinecap="round" />

        {/* Nile */}
        <path d={NILE_PATH} fill="none" stroke="#0f4a4d" strokeWidth="1.3" strokeOpacity="0.16" strokeLinecap="round" />
        <path d={NILE_PATH} fill="none" stroke="#16686c" strokeWidth="0.55" strokeOpacity="0.85" strokeLinecap="round" />

        {routePoints.length > 1 && (
          <polyline
            points={routePoints.map((h) => `${h.mapX},${h.mapY}`).join(" ")}
            fill="none"
            stroke="#b17f24"
            strokeWidth="0.6"
            strokeDasharray="1.6 1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {MAP_LABELS.map((label) => (
          <text
            key={label.text}
            x={label.x}
            y={label.y}
            fontSize={label.size}
            fill="#0b1930"
            fillOpacity={label.text.includes("SEA") ? 0.35 : 0.4}
            fontFamily="ui-sans-serif, system-ui"
            fontWeight={600}
            letterSpacing="0.15em"
            transform={label.rotate ? `rotate(${label.rotate} ${label.x} ${label.y})` : undefined}
          >
            {label.text}
          </text>
        ))}
      </svg>

      {hubs.map((hub) => {
        const active = hub.slug === selectedSlug;
        const onRoute = routeSlugs?.includes(hub.slug) ?? false;
        const dimmed = routeSlugs !== undefined && !onRoute;
        const interactive = Boolean(onSelect || linkBase);
        const alwaysLabel = !isCrowded(hub) || active;

        const inner = (
          <>
            <span className="relative flex h-3.5 w-3.5 items-center justify-center">
              {active && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-dark/60" />}
              <span
                className={`relative h-2.5 w-2.5 rounded-full border shadow-sm transition group-hover:scale-125 ${
                  active
                    ? "border-cream bg-gold-dark shadow-[0_0_0_3px_rgba(177,127,36,0.25)]"
                    : onRoute
                      ? "border-cream bg-nile-light"
                      : "border-cream bg-ink/70"
                }`}
              />
            </span>
            <span
              className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide shadow-sm transition sm:text-[11px] ${
                alwaysLabel ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
              } ${active ? "bg-gold-dark text-cream" : "bg-cream/95 text-ink-soft group-hover:bg-cream group-hover:text-ink"}`}
            >
              {hub.name}
            </span>
          </>
        );

        const sharedClassName = `group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 transition ${
          interactive ? "cursor-pointer" : "cursor-default"
        } ${dimmed ? "opacity-40" : "opacity-100"}`;
        const style = { left: `${(hub.mapX / VIEWBOX_W) * 100}%`, top: `${(hub.mapY / VIEWBOX_H) * 100}%` };

        if (linkBase) {
          return (
            <Link key={hub.slug} href={`${linkBase}/${hub.slug}`} aria-current={active ? "true" : undefined} className={sharedClassName} style={style}>
              {inner}
            </Link>
          );
        }

        return (
          <button
            key={hub.slug}
            type="button"
            onClick={() => onSelect?.(hub.slug)}
            aria-pressed={active}
            aria-label={hub.name}
            disabled={!onSelect}
            className={sharedClassName}
            style={style}
          >
            {inner}
          </button>
        );
      })}

      {/* Compass */}
      <div className="pointer-events-none absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border border-ink/15 bg-cream/80 text-[9px] font-bold text-ink-soft/70 backdrop-blur-sm">
        N
        <svg viewBox="0 0 24 24" className="absolute h-3.5 w-3.5 -translate-y-[9px]" fill="currentColor" aria-hidden="true">
          <path d="M12 2l4 12-4-3-4 3z" />
        </svg>
      </div>
    </div>
  );
}
