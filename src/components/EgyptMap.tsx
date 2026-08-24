"use client";

import Link from "next/link";
import type { DestinationHub } from "@/content/types";

// A stylized, hand-illustrated impression of Egypt — not a literal
// geographic projection — built as a single SVG so every pin position is
// just a CMS-editable percentage (destinationHub.mapX/mapY) rather than
// real coordinates. Deliberately schematic: a soft desert silhouette, the
// Nile threading south to north, and the Sinai peninsula, enough to orient
// a visitor without competing with the destination pins themselves.

const EGYPT_OUTLINE =
  "M8,11 C16,8 26,7 34,8 C38,4 44,4 47,8 C52,7 57,8 60,11 C66,10 74,11 80,15 C87,18 92,26 92,34 " +
  "C92,42 87,47 80,49 C76,50 71,49 67,47 C64,49 61,52 62,57 C64,66 63,75 60,82 " +
  "C57,88 50,92 42,92 C32,92 20,91 12,88 C7,86 5,81 6,75 C4,60 4,45 5,30 C5,22 5,15 8,11 Z";

const NILE_PATH = "M43,10 Q40,20 41,27 Q38,36 44,45 Q49,51 47,57 Q45,64 45,70 Q43,77 38,83";

const SINAI_PATH = "M67,16 C74,14 82,17 87,23 C91,28 91,36 87,41 C83,45 77,45 73,42 C69,38 66,32 65,26 Z";

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

  return (
    <div
      className={`relative aspect-[10/11] w-full overflow-hidden rounded-[2rem] border border-gold/15 bg-gradient-to-b from-sand-dim to-sand-deep/60 shadow-inner shadow-black/5 ${className}`}
    >
      <div className="bg-hieroglyph-pattern absolute inset-0 opacity-40" aria-hidden="true" />
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <path d={EGYPT_OUTLINE} fill="var(--color-sand)" stroke="var(--color-gold-dark)" strokeWidth="0.5" strokeOpacity="0.5" />
        <path d={SINAI_PATH} fill="var(--color-sand-dim)" stroke="var(--color-gold-dark)" strokeWidth="0.6" strokeOpacity="0.65" />
        <path
          d={NILE_PATH}
          fill="none"
          stroke="var(--color-nile-light)"
          strokeWidth="1"
          strokeOpacity="0.55"
          strokeLinecap="round"
        />
        {routePoints.length > 1 && (
          <polyline
            points={routePoints.map((h) => `${h.mapX},${h.mapY}`).join(" ")}
            fill="none"
            stroke="var(--color-gold-dark)"
            strokeWidth="0.6"
            strokeDasharray="1.6 1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>

      {hubs.map((hub) => {
        const active = hub.slug === selectedSlug;
        const onRoute = routeSlugs?.includes(hub.slug) ?? false;
        const dimmed = routeSlugs !== undefined && !onRoute;
        const interactive = Boolean(onSelect || linkBase);

        const inner = (
          <>
            <span className="relative flex h-3.5 w-3.5 items-center justify-center">
              {active && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-dark/60" />
              )}
              <span
                className={`relative h-2.5 w-2.5 rounded-full border transition group-hover:scale-125 ${
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
                active
                  ? "bg-gold-dark text-cream"
                  : "bg-cream/90 text-ink-soft group-hover:bg-cream group-hover:text-ink"
              }`}
            >
              {hub.name}
            </span>
          </>
        );

        const sharedClassName = `group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 transition ${
          interactive ? "cursor-pointer" : "cursor-default"
        } ${dimmed ? "opacity-40" : "opacity-100"}`;
        const style = { left: `${hub.mapX}%`, top: `${hub.mapY}%` };

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
    </div>
  );
}
