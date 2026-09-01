import Image from "next/image";
import type { ReactNode } from "react";

// Presentational primitives used only by the About page. They exist so the
// page file reads as a sequence of sections rather than a wall of utility
// classes, and so the two visual motifs this page introduces — the recessed
// photo frame and the hairline index row — are defined once.

/**
 * A photo sitting in a shallow tray rather than flat on the background: an
 * outer shell with a hairline, a small inset, and an inner plate with its own
 * concentric radius. Every photo on this page is one of Egypt Eye's own trip
 * shots, and the frame is there to make them read as prints on a table.
 */
export function Frame({
  children,
  tone = "light",
  className = "",
}: {
  children: ReactNode;
  /** "dark" for ink sections, "light" for cream/sand ones. */
  tone?: "dark" | "light";
  className?: string;
}) {
  const shell =
    tone === "dark"
      ? "bg-white/[0.06] ring-1 ring-white/12"
      : "bg-sand-deep/45 ring-1 ring-black/[0.06]";
  return (
    <div className={`rounded-[2rem] p-1.5 ${shell} ${className}`}>
      <div className="relative overflow-hidden rounded-[1.625rem] bg-ink/5">{children}</div>
    </div>
  );
}

/**
 * A framed trip photo with the caption the deck gives it. `ratio` keeps each
 * photo at its own native crop instead of forcing a shared box — the mosaic
 * depends on it, and so does not squash anybody.
 */
export function Photo({
  src,
  alt,
  ratio = "4 / 5",
  caption,
  tone = "light",
  sizes,
  priority = false,
  className = "",
}: {
  src: string;
  alt: string;
  ratio?: string;
  caption?: ReactNode;
  tone?: "dark" | "light";
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Frame tone={tone} className={className}>
      <div className="relative w-full" style={{ aspectRatio: ratio }}>
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
        {caption && (
          <span className="absolute bottom-3 left-3 rounded-full bg-ink/65 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cream/90 backdrop-blur-sm">
            {caption}
          </span>
        )}
      </div>
    </Frame>
  );
}

/**
 * The deck's own three-segment rule, borrowed as this page's section marker.
 */
export function Rule({ tone = "light", className = "" }: { tone?: "dark" | "light"; className?: string }) {
  const on = tone === "dark" ? "bg-gold-light" : "bg-gold";
  const off = tone === "dark" ? "bg-white/20" : "bg-black/10";
  return (
    <span className={`flex items-center gap-1 ${className}`} aria-hidden="true">
      <span className={`h-[3px] w-7 rounded-full ${on}`} />
      <span className={`h-[3px] w-3 rounded-full ${off}`} />
      <span className={`h-[3px] w-3 rounded-full ${off}`} />
    </span>
  );
}

/**
 * A counted figure. `source` is not decoration — it names what the number
 * counts and where it comes from, which is the only reason a number belongs
 * on this page at all.
 */
export function Numeral({
  value,
  label,
  source,
  tone = "dark",
}: {
  value: string;
  label: string;
  source: string;
  tone?: "dark" | "light";
}) {
  const isDark = tone === "dark";
  return (
    <div
      className={`flex flex-col rounded-[1.75rem] p-1.5 ${
        isDark ? "bg-white/[0.06] ring-1 ring-white/12" : "bg-sand-deep/45 ring-1 ring-black/[0.06]"
      }`}
    >
      <div
        className={`flex h-full flex-col rounded-[1.375rem] px-6 py-7 ${
          isDark ? "bg-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]" : "bg-cream shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
        }`}
      >
        <p
          className={`font-display text-[2.75rem] font-semibold leading-none tabular-nums sm:text-5xl ${
            isDark ? "text-gold-light" : "text-gold-dark"
          }`}
        >
          {value}
        </p>
        <p className={`mt-3 text-sm font-semibold ${isDark ? "text-cream" : "text-ink"}`}>{label}</p>
        <p className={`mt-auto pt-3 text-xs leading-relaxed ${isDark ? "text-cream/55" : "text-ink-soft/65"}`}>
          {source}
        </p>
      </div>
    </div>
  );
}

/**
 * One line of an index — a travel agency, a VIP guest. Reads as a manifest
 * entry rather than a card, which is the point: this is a record, not a
 * marketing grid.
 */
export function IndexRow({
  primary,
  secondary,
  tertiary,
  tone = "light",
}: {
  primary: string;
  secondary?: string;
  tertiary?: string;
  tone?: "dark" | "light";
}) {
  const isDark = tone === "dark";
  return (
    <li
      className={`flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t py-3.5 ${
        isDark ? "border-white/10" : "border-black/[0.07]"
      }`}
    >
      <span className={`font-display text-lg font-semibold ${isDark ? "text-cream" : "text-ink"}`}>{primary}</span>
      {secondary && (
        <span className={`text-sm ${isDark ? "text-gold-light/85" : "text-gold-dark"}`}>{secondary}</span>
      )}
      {tertiary && (
        <span
          className={`ml-auto text-xs font-semibold uppercase tracking-[0.14em] tabular-nums ${
            isDark ? "text-cream/40" : "text-ink-soft/55"
          }`}
        >
          {tertiary}
        </span>
      )}
    </li>
  );
}

/** A plain wordmark pill for partner names we render as type, not as logos. */
export function Wordmark({ children, tone = "light" }: { children: ReactNode; tone?: "dark" | "light" }) {
  return (
    <span
      className={`rounded-full border px-4 py-2 text-sm font-semibold tracking-wide ${
        tone === "dark"
          ? "border-white/12 bg-white/[0.04] text-cream/80"
          : "border-black/[0.07] bg-cream text-ink-soft"
      }`}
    >
      {children}
    </span>
  );
}
