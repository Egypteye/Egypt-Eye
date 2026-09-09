import type { PhysicalLevel, PhysicalLevelTier } from "@/content/types";

// A compact "how hard is this actually?" strip for tour and experience
// pages, plus the one-line PhysicalLevelChip below it that puts the same
// reading on a listing card, so a traveler can rule a tour in or out before
// opening it. Four filled-or-empty segments give the level at a glance; the note
// beside them says what the effort physically consists of on that particular
// outing, which is the part a traveler with a bad knee or a nervous parent
// is really asking about.

const TIERS: PhysicalLevelTier[] = ["easy", "moderate", "active", "challenging"];

const TIER_META: Record<PhysicalLevelTier, { label: string; fill: string; text: string }> = {
  easy: { label: "Easy", fill: "bg-nile", text: "text-nile" },
  moderate: { label: "Moderate", fill: "bg-gold", text: "text-gold-dark" },
  active: { label: "Active", fill: "bg-gold-dark", text: "text-gold-dark" },
  challenging: { label: "Challenging", fill: "bg-terracotta", text: "text-terracotta" },
};

export function PhysicalLevelBar({ level }: { level: PhysicalLevel }) {
  const meta = TIER_META[level.tier];
  const filled = TIERS.indexOf(level.tier) + 1;

  return (
    <div className="rounded-2xl border border-black/5 bg-sand-dim/60 px-5 py-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft/55">
          Physical level
        </span>
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="flex gap-1">
            {TIERS.map((tier, i) => (
              <span
                key={tier}
                className={`h-1.5 w-6 rounded-full ${i < filled ? meta.fill : "bg-ink/10"}`}
              />
            ))}
          </span>
          <span className={`text-sm font-semibold ${meta.text}`}>{meta.label}</span>
        </div>
      </div>
      <p className="mt-2.5 text-sm leading-relaxed text-ink-soft/75">{level.note}</p>
    </div>
  );
}

// The listing-card form: the same four segments at half the size, the tier
// name, and nothing else — a card has no room for the note, and the detail
// page it links to carries that.
export function PhysicalLevelChip({ level }: { level: PhysicalLevel }) {
  const meta = TIER_META[level.tier];
  const filled = TIERS.indexOf(level.tier) + 1;

  return (
    <span className="inline-flex items-center gap-1.5" title={level.note}>
      <span aria-hidden="true" className="flex gap-[3px]">
        {TIERS.map((tier, i) => (
          <span
            key={tier}
            className={`h-1 w-2.5 rounded-full ${i < filled ? meta.fill : "bg-ink/10"}`}
          />
        ))}
      </span>
      <span className={`text-xs font-semibold ${meta.text}`}>
        <span className="sr-only">Physical level: </span>
        {meta.label}
      </span>
    </span>
  );
}
