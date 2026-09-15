import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getExperiences, getPhotoshoots, getTestimonials, getTours } from "@/sanity/fetchers";
import { getAttributionCoverage, getProductRating } from "@/lib/reviewAttribution";

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

  const [reviews, tours, experiences, photoshoots] = await Promise.all([
    getTestimonials(),
    getTours(),
    getExperiences(),
    getPhotoshoots(),
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
