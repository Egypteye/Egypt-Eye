import Link from "next/link";
import { getCompanyRating } from "@/sanity/fetchers";

// Egypt Eye's company-wide review figure, shown deliberately once on a page.
//
// Reviews come in through the WhatsApp follow-up after a trip or a shoot and
// are about the company, so this is the honest home for the total: one line
// that says what it is, rather than the same number stamped onto every card
// in a grid. It links to /testimonials so the claim is checkable — the
// reviews it counts are right there.
export async function CompanyReviews({ className = "" }: { className?: string }) {
  const rating = await getCompanyRating();
  if (!rating || rating.count === 0) return null;

  return (
    <Link
      href="/testimonials"
      className={`inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-full border border-black/5 bg-sand-dim/70 px-4 py-2 text-sm transition hover:border-gold/40 ${className}`}
    >
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-4 w-4 shrink-0 text-gold"
        aria-hidden="true"
      >
        <path d="M10 1.5l2.6 5.6 6.15.62-4.63 4.2 1.3 6.08L10 14.9l-5.42 3.1 1.3-6.08-4.63-4.2 6.15-.62L10 1.5z" />
      </svg>
      {typeof rating.score === "number" && (
        <span className="font-semibold text-ink">{rating.score.toFixed(1)}</span>
      )}
      <span className="font-semibold text-ink">{rating.count.toLocaleString()}</span>
      <span className="text-ink-soft/70">
        traveler review{rating.count === 1 ? "" : "s"} across every Egypt Eye trip &amp; shoot
      </span>
    </Link>
  );
}
