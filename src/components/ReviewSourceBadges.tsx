import type { ReviewSourceSummary } from "@/content/types";
import { PLATFORM_LABELS, freshSummaries } from "@/lib/reviewPolicy";

// "4.9 from 312 reviews on Tripadvisor →", linked to the listing.
//
// The single strongest trust element on the site, and the one with the least
// attached risk. It republishes nothing — no review text, no photo, no
// copyrighted content — so the copyright and Google-policy questions that
// govern imported reviews simply do not arise. What it does is borrow the
// credibility a platform has already earned, and hand the visitor a link to
// go and check it, which is exactly the "real source" step of the chain.
//
// It also works from day one. Egypt Eye can publish these before importing a
// single review, and they stay true as the platforms accumulate more.
//
// Each badge shows when it was last checked, and stops showing entirely once
// that is more than six months old (see reviewPolicy). A hand-maintained
// review count with no date is a number nobody can evaluate, and an
// out-of-date one is the kind of claim the FTC and the CMA treat as a
// misrepresentation rather than an oversight — so the design makes going
// stale visible instead of silent.

function Stars({ score }: { score: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          viewBox="0 0 20 20"
          className={`h-3.5 w-3.5 ${n <= Math.round(score) ? "text-gold" : "text-black/15"}`}
          fill="currentColor"
        >
          <path d="M10 15.27 16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z" />
        </svg>
      ))}
    </span>
  );
}

export function ReviewSourceBadges({
  summaries,
  tone = "light",
  className = "",
}: {
  summaries: ReviewSourceSummary[];
  tone?: "light" | "dark";
  className?: string;
}) {
  const shown = freshSummaries(summaries);
  if (shown.length === 0) return null;

  const dark = tone === "dark";

  return (
    <ul className={`flex flex-wrap gap-3 ${className}`}>
      {shown.map((s) => (
        <li key={`${s.platform}-${s.url}`}>
          <a
            href={s.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className={`flex min-w-[13rem] flex-col gap-1 rounded-2xl border px-4 py-3 transition ${
              dark
                ? "border-cream/15 bg-cream/5 hover:border-gold/60"
                : "border-black/5 bg-cream shadow-sm hover:shadow-md"
            }`}
          >
            <span
              className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${dark ? "text-cream/55" : "text-ink-soft/50"}`}
            >
              {PLATFORM_LABELS[s.platform]}
            </span>
            <span className="flex items-center gap-2">
              {typeof s.score === "number" && (
                <>
                  <span className={`font-display text-xl font-semibold ${dark ? "text-cream" : "text-ink"}`}>
                    {s.score.toFixed(1)}
                  </span>
                  <Stars score={s.score} />
                </>
              )}
            </span>
            <span className={`text-sm ${dark ? "text-cream/70" : "text-ink-soft/70"}`}>
              {s.count.toLocaleString()} review{s.count === 1 ? "" : "s"} · {s.label}
            </span>
            <span className={`text-[11px] ${dark ? "text-cream/45" : "text-ink-soft/45"}`}>
              Checked{" "}
              <time dateTime={s.checkedOn}>
                {new Date(`${s.checkedOn}T12:00:00Z`).toLocaleDateString("en-GB", {
                  month: "short",
                  year: "numeric",
                  timeZone: "UTC",
                })}
              </time>{" "}
              · view on {PLATFORM_LABELS[s.platform]} →
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
