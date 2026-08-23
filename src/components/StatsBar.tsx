import type { ResolvedSiteSettings } from "@/content/types";

// A bold, full-width version of TrustBar's own stat treatment (dark
// background, gold numbers) — not a new visual language. Every tile is
// either computed live from the real catalog (tour/destination counts) or
// sourced from Site Settings → Trust stats bar, which only accepts real
// numbers. A tile with no value simply doesn't render — never a
// placeholder or an invented figure.
export function StatsBar({
  trustStats,
  tourCount,
  destinationCount,
}: {
  trustStats?: ResolvedSiteSettings["trustStats"];
  tourCount: number;
  destinationCount: number;
}) {
  const tiles: { value: string; label: string; href?: string }[] = [];

  if (trustStats?.yearsInEgypt) {
    tiles.push({ value: `${trustStats.yearsInEgypt}+`, label: "Years in Egypt" });
  }
  if (trustStats?.happyGuestsLabel) {
    tiles.push({ value: trustStats.happyGuestsLabel, label: "Happy Guests" });
  }
  tiles.push({ value: `${tourCount}+`, label: "Unique Itineraries" });
  tiles.push({ value: `${destinationCount}+`, label: "Destinations Covered" });
  if (trustStats?.reviewPlatformRating) {
    tiles.push({
      value: `${trustStats.reviewPlatformRating}★`,
      label: trustStats.reviewPlatformName ? `${trustStats.reviewPlatformName} Rating` : "Rating",
      href: trustStats.reviewPlatformUrl,
    });
  }

  return (
    <div className="rounded-3xl bg-ink px-8 py-12 sm:px-14">
      <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-10">
        {tiles.map((t) => {
          const content = (
            <>
              <p className="font-display text-4xl font-bold text-gold-light sm:text-5xl">{t.value}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-cream/60">{t.label}</p>
            </>
          );
          return t.href ? (
            <a key={t.label} href={t.href} target="_blank" rel="noreferrer" className="text-center transition hover:opacity-80">
              {content}
            </a>
          ) : (
            <div key={t.label} className="text-center">
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
