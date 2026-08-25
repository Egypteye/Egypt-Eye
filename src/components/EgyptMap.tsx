"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MOOD_COLORS } from "@/lib/moodColors";
import type { DestinationHub, EgyptCity, Mood } from "@/content/types";

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
// rather than eyeballed.
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

// The Nile splits into its two main distributaries just north of Cairo,
// fanning out to the Rosetta (west) and Damietta (east) river mouths — a
// real, recognizable feature the single trunk line alone was missing.
const NILE_DELTA_WEST = "M53.12,17.92 L51.4,13.4 L47.5,7.4";
const NILE_DELTA_EAST = "M53.12,17.92 L55.6,12.6 L57.1,7.3";

const SUEZ_CANAL_PATH = "M60.33,8.52 L62.2,18.5";

// Real-world reference labels — not decorative filler, these are the
// actual bodies of water / regions at these coordinates.
const MAP_LABELS = [
  { text: "MEDITERRANEAN SEA", x: 44.5, y: 3.6, size: 2.6 },
  { text: "SINAI", x: 71.5, y: 23.7, size: 2.8 },
  { text: "RED SEA", x: 82, y: 46, size: 2.6, rotate: 78 },
  { text: "WESTERN DESERT", x: 26, y: 42, size: 2.4 },
  { text: "LAKE NASSER", x: 60, y: 74, size: 2 },
  { text: "GULF OF SUEZ", x: 65.5, y: 16.5, size: 1.7, rotate: 62 },
  { text: "GULF OF AQABA", x: 79, y: 26.5, size: 1.7, rotate: 62 },
];

const MIN_SCALE = 1;
const MAX_SCALE = 4.5;
const ZOOM_STEP = 1.6;

type Point = { x: number; y: number };
type View = { scale: number; tx: number; ty: number };

function clampView(next: View, rect: DOMRect | null): View {
  const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next.scale));
  if (!rect) return { scale, tx: 0, ty: 0 };
  const minTx = -(rect.width * (scale - 1));
  const minTy = -(rect.height * (scale - 1));
  return {
    scale,
    tx: Math.min(0, Math.max(minTx, next.tx)),
    ty: Math.min(0, Math.max(minTy, next.ty)),
  };
}

export function EgyptMap({
  hubs,
  cities = [],
  selectedSlug,
  onSelect,
  linkBase,
  routeSlugs,
  moodFilter,
  className = "",
}: {
  hubs: DestinationHub[];
  /** Real Egyptian cities/towns without tours yet — shown as secondary, non-navigating markers. */
  cities?: EgyptCity[];
  selectedSlug?: string | null;
  onSelect?: (slug: string) => void;
  /** When set, pins are real links to `${linkBase}/${slug}` instead of buttons — used on /explore-egypt for real, crawlable per-destination URLs. */
  linkBase?: string;
  routeSlugs?: string[];
  /** Highlights hubs/cities tagged with this mood, dimming everything else. */
  moodFilter?: Mood | null;
  className?: string;
}) {
  const interactive = Boolean(onSelect || linkBase);
  const containerRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>({ scale: 1, tx: 0, ty: 0 });
  const [isGesturing, setIsGesturing] = useState(false);
  const [openCitySlug, setOpenCitySlug] = useState<string | null>(null);

  const pointersRef = useRef(new Map<number, Point>());
  const dragRef = useRef<{ lastX: number; lastY: number; moved: boolean } | null>(null);
  const pinchRef = useRef<{ startDist: number; startScale: number } | null>(null);
  const suppressClickRef = useRef(false);

  const routePoints = (routeSlugs ?? [])
    .map((slug) => hubs.find((h) => h.slug === slug))
    .filter((h): h is DestinationHub => Boolean(h));

  // The color a matching pin takes on while a mood filter is active — the
  // same color as the mood button itself (shared lookup in lib/moodColors).
  const moodColor = moodFilter ? MOOD_COLORS[moodFilter] : null;

  function getContainerPoint(clientX: number, clientY: number): Point {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  // Zooms so that container-relative point `at` stays visually fixed —
  // "zoom toward the cursor / pinch center" instead of always toward the
  // map's middle, which is what makes pinch/wheel zoom feel natural.
  function zoomAt(at: Point, nextScaleRaw: number) {
    const rect = containerRef.current?.getBoundingClientRect() ?? null;
    setView((v) => {
      const nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, nextScaleRaw));
      const ratio = nextScale / v.scale;
      const tx = at.x * (1 - ratio) + v.tx * ratio;
      const ty = at.y * (1 - ratio) + v.ty * ratio;
      return clampView({ scale: nextScale, tx, ty }, rect);
    });
  }

  function panBy(dx: number, dy: number) {
    const rect = containerRef.current?.getBoundingClientRect() ?? null;
    setView((v) => clampView({ scale: v.scale, tx: v.tx + dx, ty: v.ty + dy }, rect));
  }

  function zoomButton(factor: number) {
    const rect = containerRef.current?.getBoundingClientRect();
    const at = rect ? { x: rect.width / 2, y: rect.height / 2 } : { x: 0, y: 0 };
    zoomAt(at, view.scale * factor);
  }

  function resetView() {
    setView({ scale: 1, tx: 0, ty: 0 });
  }

  // Wheel zoom needs preventDefault to stop the page from scrolling while
  // the cursor is over the map — React's onWheel is passive by default, so
  // this is wired as a real (non-passive) listener instead.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !interactive) return;
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const at = getContainerPoint(e.clientX, e.clientY);
      const factor = e.deltaY < 0 ? 1.14 : 1 / 1.14;
      zoomAt(at, view.scale * factor);
    }
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [interactive, view.scale]);

  function handlePointerDown(e: React.PointerEvent) {
    if (!interactive) return;
    // Pointer capture redirects the *click* that follows a tap to whatever
    // element holds the capture — if we captured on the container for a
    // pointerdown that started on a pin or a zoom button, that control's own
    // onClick would never fire. So panning only ever starts when the
    // pointerdown lands on empty map surface, never on an interactive
    // descendant (pins, zoom controls, the reset button).
    if ((e.target as HTMLElement).closest("button, a")) return;
    containerRef.current?.setPointerCapture?.(e.pointerId);
    pointersRef.current.set(e.pointerId, getContainerPoint(e.clientX, e.clientY));
    setIsGesturing(true);

    if (pointersRef.current.size === 1) {
      dragRef.current = { lastX: e.clientX, lastY: e.clientY, moved: false };
    } else if (pointersRef.current.size === 2) {
      const pts = [...pointersRef.current.values()];
      pinchRef.current = {
        startDist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y),
        startScale: view.scale,
      };
      dragRef.current = null;
    }
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, getContainerPoint(e.clientX, e.clientY));

    if (pointersRef.current.size === 2 && pinchRef.current) {
      const pts = [...pointersRef.current.values()];
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const mid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
      zoomAt(mid, pinchRef.current.startScale * (dist / (pinchRef.current.startDist || 1)));
      return;
    }

    if (dragRef.current) {
      const dx = e.clientX - dragRef.current.lastX;
      const dy = e.clientY - dragRef.current.lastY;
      if (Math.abs(dx) + Math.abs(dy) > 3) dragRef.current.moved = true;
      if (dragRef.current.moved && view.scale > 1) panBy(dx, dy);
      dragRef.current.lastX = e.clientX;
      dragRef.current.lastY = e.clientY;
    }
  }

  function handlePointerUp(e: React.PointerEvent) {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) pinchRef.current = null;
    if (dragRef.current?.moved) suppressClickRef.current = true;
    dragRef.current = null;
    if (pointersRef.current.size === 0) setIsGesturing(false);
  }

  function handleClickCapture(e: React.MouseEvent) {
    if (suppressClickRef.current) {
      e.preventDefault();
      e.stopPropagation();
      suppressClickRef.current = false;
    }
  }

  const openCity = cities.find((c) => c.slug === openCitySlug);

  return (
    <div
      ref={containerRef}
      className={`group/map relative overflow-hidden rounded-[2rem] border border-gold/15 shadow-inner shadow-black/10 ${interactive ? "touch-none" : ""} ${className}`}
      style={{ aspectRatio: `${VIEWBOX_W} / ${VIEWBOX_H}` }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClickCapture={handleClickCapture}
    >
      {/* Water — sits behind the transformed layer; the land polygon drawn
          on top covers everything that isn't sea, so only the
          Mediterranean, Red Sea, and the Gulfs of Suez/Aqaba show this tone.
          Left un-zoomed/panned so it always fills the frame as an ambient
          backdrop. */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(160deg, #cfe4e3 0%, #a9cfd2 45%, #8fbfc6 100%)" }}
        aria-hidden="true"
      />

      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.scale})`,
          transformOrigin: "0 0",
          transitionProperty: isGesturing ? "none" : "transform",
          transitionDuration: "220ms",
          transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <svg viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`} preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <defs>
            <linearGradient id="landGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f6f1e6" />
              <stop offset="40%" stopColor="#efe4c8" />
              <stop offset="75%" stopColor="#e4d3a8" />
              <stop offset="100%" stopColor="#d8c290" />
            </linearGradient>
            <clipPath id="landClip">
              <path d={EGYPT_OUTLINE} />
            </clipPath>
            <filter id="landShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0.4" stdDeviation="0.6" floodColor="#0b1930" floodOpacity="0.22" />
            </filter>
          </defs>

          {/* Land — one real, single connected polygon (simplified from an actual
              Egypt border dataset) that already includes the Sinai peninsula via
              the Gulf of Suez / Gulf of Aqaba indentations, not a separate shape. */}
          <path d={EGYPT_OUTLINE} fill="url(#landGradient)" stroke="#8a7239" strokeWidth="0.4" strokeOpacity="0.65" filter="url(#landShadow)" />

          {/* Land texture, clipped so it never bleeds into the sea — two dot
              scales layered for a bit more depth than a single flat pattern. */}
          <g clipPath="url(#landClip)">
            <pattern id="landDotsFine" width="2.2" height="2.2" patternUnits="userSpaceOnUse">
              <circle cx="0.4" cy="0.4" r="0.16" fill="#b17f24" fillOpacity="0.16" />
            </pattern>
            <pattern id="landDotsCoarse" width="5" height="5" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.3" fill="#8a7239" fillOpacity="0.14" />
            </pattern>
            <rect x="0" y="0" width={VIEWBOX_W} height={VIEWBOX_H} fill="url(#landDotsFine)" />
            <rect x="0" y="0" width={VIEWBOX_W} height={VIEWBOX_H} fill="url(#landDotsCoarse)" />
          </g>

          {/* Suez Canal */}
          <path d={SUEZ_CANAL_PATH} fill="none" stroke="#4a90a4" strokeWidth="0.5" strokeDasharray="0.8 0.6" strokeLinecap="round" />

          {/* Nile, with its Delta fan to the Rosetta/Damietta mouths */}
          <path d={NILE_PATH} fill="none" stroke="#0f4a4d" strokeWidth="1.3" strokeOpacity="0.16" strokeLinecap="round" />
          <path d={NILE_PATH} fill="none" stroke="#16686c" strokeWidth="0.55" strokeOpacity="0.85" strokeLinecap="round" />
          <path d={NILE_DELTA_WEST} fill="none" stroke="#16686c" strokeWidth="0.42" strokeOpacity="0.75" strokeLinecap="round" />
          <path d={NILE_DELTA_EAST} fill="none" stroke="#16686c" strokeWidth="0.42" strokeOpacity="0.75" strokeLinecap="round" />

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
              fillOpacity={0.65}
              stroke="#f6f1e6"
              strokeWidth={0.35}
              strokeOpacity={0.5}
              paintOrder="stroke"
              fontFamily="ui-sans-serif, system-ui"
              fontWeight={700}
              letterSpacing="0.15em"
              transform={label.rotate ? `rotate(${label.rotate} ${label.x} ${label.y})` : undefined}
            >
              {label.text}
            </text>
          ))}
        </svg>

        {/* Secondary markers — real Egyptian cities Egypt Eye doesn't run
            tours in yet. Smaller, hollow, and non-navigating: clicking one
            opens an inline note instead of a dead link or a full page. */}
        {cities.map((city) => {
          const matchesMood = moodFilter ? (city.mood ?? []).includes(moodFilter) : true;
          const open = city.slug === openCitySlug;
          return (
            <button
              key={city.slug}
              type="button"
              onClick={() => {
                if (!interactive) return;
                setOpenCitySlug((cur) => (cur === city.slug ? null : city.slug));
              }}
              aria-label={`${city.name} — no tours here yet`}
              aria-expanded={open}
              disabled={!interactive}
              className={`group absolute flex h-4 w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center transition hover:z-10 focus-visible:z-10 ${
                interactive ? "cursor-pointer" : "cursor-default"
              } ${open ? "z-10" : "z-0"} ${matchesMood ? "opacity-90" : "opacity-30"}`}
              style={{ left: `${(city.mapX / VIEWBOX_W) * 100}%`, top: `${(city.mapY / VIEWBOX_H) * 100}%` }}
            >
              {/* The label is absolutely positioned and pointer-events-none
                  so it never grows this button's hit area — with 42+ pins on
                  the map, a label's box (even invisible, at opacity-0) would
                  otherwise reach into and swallow clicks meant for a
                  neighboring pin in a dense cluster. Shown only once this
                  pin is clicked open (not on hover) — with 30+ secondary
                  cities, showing every label at once buried the map. */}
              <span
                className={`h-1.5 w-1.5 rounded-full border shadow-sm transition group-hover:scale-150 ${
                  open
                    ? "border-ink bg-cream"
                    : matchesMood && moodColor
                      ? `${moodColor.border} ${moodColor.dot}`
                      : "border-ink-soft/50 bg-cream/70"
                }`}
              />
              <span
                className={`pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-1.5 py-0.5 text-[8.5px] font-medium tracking-wide text-cream/90 backdrop-blur-sm transition sm:text-[9px] ${
                  open ? "opacity-100" : "opacity-0"
                }`}
              >
                {city.name}
              </span>
            </button>
          );
        })}

        {hubs.map((hub) => {
          const active = hub.slug === selectedSlug;
          const onRoute = routeSlugs?.includes(hub.slug) ?? false;
          const matchesMood = moodFilter ? (hub.mood ?? []).includes(moodFilter) : true;
          const dimmed = (routeSlugs !== undefined && !onRoute) || !matchesMood;

          // Label is absolutely positioned + pointer-events-none for the
          // same reason as the city markers above: it must never enlarge
          // this pin's hit area into a neighboring pin's space. Shown only
          // for the currently-selected/clicked hub (not on hover, not for
          // every hub at once) — with 13 hubs plus 30+ secondary cities,
          // showing every label buried the map.
          const inner = (
            <>
              <span className="relative flex h-4 w-4 items-center justify-center">
                {active && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-dark/60" />}
                <span
                  className={`relative h-3 w-3 rounded-full border-[1.5px] shadow-md transition group-hover:scale-125 ${
                    active
                      ? "border-cream bg-gold-dark shadow-[0_0_0_4px_rgba(177,127,36,0.28)]"
                      : onRoute
                        ? "border-cream bg-nile-light"
                        : matchesMood && moodColor
                          ? `border-cream ${moodColor.dot}`
                          : "border-cream bg-ink"
                  }`}
                />
              </span>
              <span
                className={`pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-full bg-gold-dark px-2.5 py-1 text-[10px] font-semibold tracking-wide text-cream shadow-md transition sm:text-[11px] ${
                  active ? "opacity-100" : "opacity-0"
                }`}
              >
                {hub.name}
              </span>
            </>
          );

          const sharedClassName = `group absolute flex h-4 w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center transition hover:z-10 focus-visible:z-10 ${
            active ? "z-10" : "z-0"
          } ${interactive ? "cursor-pointer" : "cursor-default"} ${dimmed ? "opacity-40" : "opacity-100"}`;
          const style = { left: `${(hub.mapX / VIEWBOX_W) * 100}%`, top: `${(hub.mapY / VIEWBOX_H) * 100}%` };

          if (linkBase) {
            return (
              <Link
                key={hub.slug}
                href={`${linkBase}/${hub.slug}`}
                aria-current={active ? "true" : undefined}
                className={sharedClassName}
                style={style}
                onClick={() => setOpenCitySlug(null)}
                scroll={false}
              >
                {inner}
              </Link>
            );
          }

          return (
            <button
              key={hub.slug}
              type="button"
              onClick={() => {
                setOpenCitySlug(null);
                onSelect?.(hub.slug);
              }}
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

      {/* Compass */}
      <div className="pointer-events-none absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border border-ink/15 bg-cream/85 text-[9px] font-bold text-ink-soft/70 backdrop-blur-sm">
        N
        <svg viewBox="0 0 24 24" className="absolute h-3.5 w-3.5 -translate-y-[9px]" fill="currentColor" aria-hidden="true">
          <path d="M12 2l4 12-4-3-4 3z" />
        </svg>
      </div>

      {/* Zoom controls — only on the real, interactive map (never the
          decorative homepage preview, which passes neither onSelect nor
          linkBase and has pointer-events disabled anyway). */}
      {interactive && (
        <div className="absolute bottom-3 right-3 flex flex-col overflow-hidden rounded-xl border border-ink/10 bg-cream/90 shadow-md backdrop-blur-sm">
          <button
            type="button"
            aria-label="Zoom in"
            disabled={view.scale >= MAX_SCALE}
            onClick={() => zoomButton(ZOOM_STEP)}
            className="flex h-8 w-8 items-center justify-center text-ink-soft transition hover:bg-sand-dim disabled:opacity-30"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M10 4v12M4 10h12" strokeLinecap="round" />
            </svg>
          </button>
          <div className="h-px bg-ink/10" />
          <button
            type="button"
            aria-label="Zoom out"
            disabled={view.scale <= MIN_SCALE}
            onClick={() => zoomButton(1 / ZOOM_STEP)}
            className="flex h-8 w-8 items-center justify-center text-ink-soft transition hover:bg-sand-dim disabled:opacity-30"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M4 10h12" strokeLinecap="round" />
            </svg>
          </button>
          {(view.scale !== 1 || view.tx !== 0 || view.ty !== 0) && (
            <>
              <div className="h-px bg-ink/10" />
              <button
                type="button"
                aria-label="Reset view"
                onClick={resetView}
                className="flex h-8 w-8 items-center justify-center text-ink-soft transition hover:bg-sand-dim"
              >
                <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M4 4v4h4M16 16v-4h-4M15.5 7.5A6 6 0 0 0 5 6M4.5 12.5A6 6 0 0 0 15 14" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          )}
        </div>
      )}

      {/* "Not yet offered" note for a secondary city — a bottom drawer so
          its position never has to track a pin through pan/zoom. */}
      {openCity && (
        <div className="absolute inset-x-0 bottom-0 z-10 animate-fade-up rounded-t-2xl border-t border-ink/10 bg-cream/95 p-4 shadow-[0_-8px_24px_rgba(0,0,0,0.12)] backdrop-blur-sm sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft/50">{openCity.region}</p>
              <p className="mt-0.5 font-display text-base font-semibold text-ink sm:text-lg">{openCity.name}</p>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpenCitySlug(null)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-soft/60 transition hover:bg-sand-dim hover:text-ink"
            >
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <p className="mt-2 max-w-md text-[13px] leading-relaxed text-ink-soft/75">
            We don&rsquo;t run tours here yet — but we&rsquo;re always adding new destinations. Tell us you&rsquo;re
            interested and we&rsquo;ll see what we can arrange.
          </p>
          <Link
            href="/customize"
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-gold-dark hover:underline"
          >
            Suggest {openCity.name} to us
            <svg viewBox="0 0 20 20" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M7 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}
