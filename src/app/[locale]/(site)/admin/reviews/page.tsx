import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import {
  getExperiences,
  getPhotoshoots,
  getReviewSourceSummaries,
  getTestimonials,
  getTours,
} from "@/sanity/fetchers";
import { getAttributionCoverage, getProductRating } from "@/lib/reviewAttribution";
import {
  PLATFORM_LABELS,
  SUMMARY_STALE_AFTER_DAYS,
  isSummaryFresh,
  platformOf,
  reviewComplianceIssues,
  summaryAgeDays,
} from "@/lib/reviewPolicy";
import { deriveThemes, THEME_LABELS } from "@/lib/reviewThemes";

export const metadata = { title: "Review Attribution", robots: { index: false, follow: false } };

// How well the imported WhatsApp reviews resolve onto products.
//
// A review counts toward a specific tour only when its Context names that
// tour — everything else falls back to the company-wide total. This page
// exists so that fallback is visible and fixable rather than permanent: the
// unmatched list below is sorted biggest-first, so editing the top few
// contexts in Studio (or setting the review's product reference) moves the
// most reviews onto products for the least work.
export default async function AdminReviewsPage() {
  const user = await getCurrentUser();
  if (user?.role !== "admin") redirect("/admin/reservations");

  const [reviews, tours, experiences, photoshoots, summaries] = await Promise.all([
    getTestimonials(),
    getTours(),
    getExperiences(),
    getPhotoshoots(),
    getReviewSourceSummaries(),
  ]);

  const products = [...tours, ...experiences, ...photoshoots].map((p) => ({
    slug: p.slug,
    title: p.title,
  }));
  const coverage = getAttributionCoverage(reviews, products);

  const withOwnReviews = products
    .map((p) => ({ ...p, rating: getProductRating(p, reviews) }))
    .filter((p) => p.rating)
    .sort((a, b) => (b.rating?.count ?? 0) - (a.rating?.count ?? 0));

  const pct = coverage.total > 0 ? Math.round((coverage.attributed / coverage.total) * 100) : 0;

  // Anything that would make a review indefensible if someone looked at it.
  const flagged = reviews
    .map((r) => ({ review: r, issues: reviewComplianceIssues(r) }))
    .filter((r) => r.issues.length > 0);

  // How the review mix breaks down by platform, and how many carry no theme at
  // all — a review with no themes is one no product page will ever select,
  // so it counts toward the total and does nothing else.
  const byPlatform = new Map<string, number>();
  let untagged = 0;
  for (const r of reviews) {
    const p = platformOf(r);
    byPlatform.set(p, (byPlatform.get(p) ?? 0) + 1);
    if (deriveThemes(r).length === 0) untagged += 1;
  }

  const themeCounts = new Map<string, number>();
  for (const r of reviews) {
    for (const t of deriveThemes(r)) themeCounts.set(t, (themeCounts.get(t) ?? 0) + 1);
  }
  const topThemes = [...themeCounts.entries()].sort((a, b) => b[1] - a[1]);

  const staleSummaries = summaries.filter((s) => !isSummaryFresh(s));

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Review Attribution</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-soft/70">
        Reviews whose <strong>Context</strong> names a product show as that product&rsquo;s own rating.
        The rest still count toward the Egypt Eye total shown everywhere else — they&rsquo;re real
        reviews, just not evidence about one tour.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Reviews imported" value={coverage.total.toLocaleString()} />
        <Stat label="Matched to a product" value={coverage.attributed.toLocaleString()} />
        <Stat label="Company total only" value={coverage.unattributed.toLocaleString()} />
        <Stat label="Coverage" value={`${pct}%`} />
      </div>

      {flagged.length > 0 && (
        <section className="mt-10 rounded-2xl border border-amber-300/50 bg-amber-50/60 p-5">
          <h2 className="font-display text-lg font-semibold text-ink">
            Needs attention ({flagged.length})
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm text-ink-soft/75">
            These are live on the site. A third-party review with no link back can&rsquo;t be verified by a
            reader, which is the thing consumer-review rules actually care about.
          </p>
          <ul className="mt-4 space-y-2">
            {flagged.slice(0, 40).map(({ review, issues }, i) => (
              <li key={`${review.name}-${i}`} className="rounded-xl bg-white/70 px-4 py-2.5">
                <p className="text-sm font-semibold text-ink">
                  {review.name}{" "}
                  <span className="font-normal text-ink-soft/60">· {PLATFORM_LABELS[platformOf(review)]}</span>
                </p>
                {issues.map((issue) => (
                  <p key={issue} className="text-xs text-amber-900">
                    {issue}
                  </p>
                ))}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold text-ink">Platform ratings badges</h2>
        <p className="mt-2 max-w-2xl text-sm text-ink-soft/70">
          Shown on the homepage and Customer Stories. Each hides itself once it&rsquo;s more than{" "}
          {SUMMARY_STALE_AFTER_DAYS} days old, because a review count nobody has re-checked stops being a
          fact. Re-check the numbers on the platform and update the date in Studio.
        </p>
        {summaries.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft/60">
            None published yet. Add one per listing under &ldquo;Review source (ratings badge)&rdquo; in
            Studio — these work before any review text is imported, and are the strongest trust element
            available.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-black/5 rounded-2xl border border-black/5 bg-cream">
            {summaries.map((s) => {
              const age = summaryAgeDays(s);
              const stale = !isSummaryFresh(s);
              return (
                <li key={`${s.platform}-${s.url}`} className="flex items-center justify-between gap-4 px-5 py-3">
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-ink">{s.label}</span>
                    <span className="text-xs text-ink-soft/60">
                      {PLATFORM_LABELS[s.platform]} · {s.count.toLocaleString()} reviews
                      {typeof s.score === "number" ? ` · ${s.score.toFixed(1)}★` : ""}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      stale ? "bg-rose-100 text-rose-800" : "bg-emerald-50 text-emerald-800"
                    }`}
                  >
                    {stale ? `Hidden — ${age} days old` : `Checked ${age} days ago`}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
        {staleSummaries.length > 0 && (
          <p className="mt-3 text-sm font-medium text-rose-800">
            {staleSummaries.length} badge{staleSummaries.length === 1 ? " is" : "s are"} hidden from the site
            until re-checked.
          </p>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold text-ink">Where reviews came from</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[...byPlatform.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([p, n]) => (
              <div key={p} className="rounded-2xl border border-black/5 bg-cream p-4">
                <p className="font-display text-xl font-semibold text-ink">{n.toLocaleString()}</p>
                <p className="text-xs text-ink-soft/60">{PLATFORM_LABELS[p as keyof typeof PLATFORM_LABELS]}</p>
              </div>
            ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold text-ink">What travellers mention</h2>
        <p className="mt-2 max-w-2xl text-sm text-ink-soft/70">
          Read from each review&rsquo;s own words. This is what decides which reviews appear on which product
          page — a review with no themes is counted in the total but will never be selected for a page.
        </p>
        {untagged > 0 && (
          <p className="mt-2 text-sm text-ink-soft/70">
            <strong>{untagged}</strong> review{untagged === 1 ? "" : "s"} mention nothing specific enough to
            place. Usually short ones like &ldquo;great experience&rdquo; — nothing to fix, they just carry
            less weight.
          </p>
        )}
        {topThemes.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {topThemes.map(([t, n]) => (
              <li
                key={t}
                className="rounded-full border border-black/10 bg-cream px-3 py-1.5 text-sm text-ink-soft"
              >
                {THEME_LABELS[t as keyof typeof THEME_LABELS]}{" "}
                <span className="font-semibold text-ink">{n}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold text-ink">
          Products showing their own rating ({withOwnReviews.length})
        </h2>
        {withOwnReviews.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft/60">
            None yet — no review Context exactly matches a product title.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-black/5 rounded-2xl border border-black/5 bg-cream">
            {withOwnReviews.map((p) => (
              <li key={p.slug} className="flex items-center justify-between gap-4 px-5 py-3">
                <span className="min-w-0 truncate text-sm text-ink">{p.title}</span>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-ink-soft">
                  {p.rating?.count.toLocaleString()}
                  {typeof p.rating?.score === "number" && ` · ${p.rating.score.toFixed(2)}★`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold text-ink">
          Unmatched contexts ({coverage.topUnmatched.length})
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-ink-soft/70">
          Biggest first. To move a group onto a product, either edit its Context in Studio to the
          product&rsquo;s exact title, or set that review&rsquo;s product reference — the reference
          always wins over the text.
        </p>
        {coverage.topUnmatched.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft/60">Every review is matched to a product.</p>
        ) : (
          <ul className="mt-4 divide-y divide-black/5 rounded-2xl border border-black/5 bg-cream">
            {coverage.topUnmatched.slice(0, 60).map((row) => (
              <li key={row.context} className="flex items-center justify-between gap-4 px-5 py-3">
                <span className="min-w-0 truncate text-sm text-ink-soft">{row.context}</span>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-ink-soft/70">
                  {row.count.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-cream p-5">
      <p className="font-display text-2xl font-semibold text-ink">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-ink-soft/60">{label}</p>
    </div>
  );
}
