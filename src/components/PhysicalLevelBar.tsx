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

// The listing-card form: a label, the same four segments at half size, and
// the tier name. The note stays on the detail page, which has room for it.
//
// The label is not decoration. Four gold dashes and the word "Moderate",
// sitting on a travel card next to a duration and a star rating, could be
// read as almost anything — a difficulty, a price band, a popularity score.
// Saying "Physical level" is what makes it mean one thing.
export function PhysicalLevelChip({ level }: { level: PhysicalLevel }) {
  const meta = TIER_META[level.tier];
  const filled = TIERS.indexOf(level.tier) + 1;

  return (
    <span className="inline-flex items-center gap-2 text-xs" title={level.note}>
      <span className="font-semibold uppercase tracking-[0.12em] text-ink-soft/50">
        Physical level
      </span>
      <span aria-hidden="true" className="flex gap-[3px]">
        {TIERS.map((tier, i) => (
          <span
            key={tier}
            className={`h-1 w-2.5 rounded-full ${i < filled ? meta.fill : "bg-ink/10"}`}
          />
        ))}
      </span>
      <span className={`font-semibold ${meta.text}`}>{meta.label}</span>
    </span>
  );
}
