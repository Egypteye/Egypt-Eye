import Link from "next/link";
import { Container } from "@/components/Container";
import { TestimonialCard } from "@/components/TestimonialCard";
import { T, tr, trAll } from "@/i18n/T";
import { t } from "@/i18n/format";
import { getLocale } from "@/i18n/dictionary";
import { localePath } from "@/i18n/locales";
import { PLATFORM_LABELS, platformOf } from "@/lib/reviewPolicy";
import {
  REVIEWS_PER_PAGE,
  productReviewsPagePath,
  reviewPageCount,
  reviewPageSlice,
  type ProductReviewGroup,
} from "@/lib/reviewPages";

// One product's reviews, one page at a time.
//
// Rendered entirely on the server, with no filter state — so there is nothing
// to hydrate and no entry crossing the client boundary as a prop. That is
// worth having, but it is not where the weight went: the flight payload an
// App Router page embeds is roughly 60% of one of these pages too. What
// actually fixed the 6.3MB wall was carrying 48 reviews instead of 2,527.

const n = (value: number) => value.toLocaleString("en-US");

/** The page numbers worth showing: both ends, and a window around here. */
export function pageWindow(current: number, last: number): (number | "gap")[] {
  const keep = new Set<number>([1, last, current - 1, current, current + 1]);
  const pages = [...keep].filter((p) => p >= 1 && p <= last).sort((a, b) => a - b);

  const out: (number | "gap")[] = [];
  let previous = 0;
  for (const page of pages) {
    if (previous && page - previous > 1) out.push("gap");
    out.push(page);
    previous = page;
  }
  return out;
}

const STEP =
  "inline-flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-semibold transition";
const STEP_IDLE = "border border-black/10 text-ink-soft hover:border-gold/40 hover:text-ink";

async function Pagination({
  group,
  page,
  lastPage,
}: {
  group: ProductReviewGroup;
  page: number;
  lastPage: number;
}) {
  if (lastPage <= 1) return null;
  const locale = await getLocale();
  const to = (p: number) => localePath(productReviewsPagePath(group.subject, p), locale);
  const label = await tr("Reviews pagination");

  return (
    <nav aria-label={label} className="mt-12 flex flex-wrap items-center justify-center gap-1.5">
      {page > 1 && (
        <Link href={to(page - 1)} rel="prev" className={`${STEP} ${STEP_IDLE}`}>
          ← <T>Previous</T>
        </Link>
      )}

      {pageWindow(page, lastPage).map((slot, i) =>
        slot === "gap" ? (
          <span key={`gap-${i}`} className="px-1 text-ink-soft/85" aria-hidden="true">
            …
          </span>
        ) : slot === page ? (
          <span key={slot} aria-current="page" className={`${STEP} bg-ink text-cream`}>
            {slot}
          </span>
        ) : (
          <Link key={slot} href={to(slot)} className={`${STEP} ${STEP_IDLE}`}>
            {slot}
          </Link>
        )
      )}

      {page < lastPage && (
        <Link href={to(page + 1)} rel="next" className={`${STEP} ${STEP_IDLE}`}>
          <T>Next</T> →
        </Link>
      )}
    </nav>
  );
}

export async function ProductReviewsView({ group, page }: { group: ProductReviewGroup; page: number }) {
  const locale = await getLocale();
  const to = (href: string) => localePath(href, locale);
  const total = group.entries.length;
  const lastPage = reviewPageCount(total);
  const shown = reviewPageSlice(group.entries, page);
  const from = (page - 1) * REVIEWS_PER_PAGE + 1;
  const sources = [...new Set(shown.map((e) => PLATFORM_LABELS[platformOf(e.testimonial)]))];

  const s = await trAll([
    "{count} reviews from travellers who did this",
    "Showing {from}–{to} of {total}",
    "Page {page} of {last}",
  ] as const);

  return (
    <>
      <section className="pb-4 pt-14">
        <Container>
          <Link href={to("/testimonials")} className="text-sm font-semibold text-gold-dark underline-offset-4 hover:underline">
            ← <T>All traveller reviews</T>
          </Link>

          <h1 className="mt-4 max-w-3xl text-balance font-display text-3xl font-semibold text-ink sm:text-4xl">
            {group.subject.title}
          </h1>

          {/* The count is the claim, so it is stated plainly — and it is the
              real one: every review of this product is on these pages. */}
          <p className="mt-3 text-ink-soft">
            {t(s["{count} reviews from travellers who did this"], { count: n(total) })}
            {sources.length > 0 && <> · {sources.join(" · ")}</>}
          </p>

          <p className="mt-4 text-sm">
            <Link href={to(group.subject.href)} className="font-semibold text-gold-dark underline underline-offset-4">
              <T>See the trip itself</T> →
            </Link>
          </p>

          {/* Ordering is stated rather than assumed: a visitor expecting
              newest-first should be told what they are looking at instead. */}
          <p className="mt-6 max-w-2xl text-xs text-ink-soft/85">
            <T>Ordered by how much each review says rather than by date, so the most detailed come first. Reviews written on another platform are quoted in part, never rewritten, and linked to the original so you can read them in full there. The names of our guides, hosts and photographers have been removed for their privacy — nothing else about a review has been changed.</T>
          </p>
        </Container>
      </section>

      <section className="pb-20">
        <Container>
          <p className="mb-6 text-sm text-ink-soft/85">
            {t(s["Showing {from}–{to} of {total}"], {
              from: n(from),
              to: n(from + shown.length - 1),
              total: n(total),
            })}
            {lastPage > 1 && <> · {t(s["Page {page} of {last}"], { page, last: lastPage })}</>}
          </p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((entry, i) => (
              <TestimonialCard
                key={`${entry.testimonial.name}-${from + i}`}
                testimonial={entry.testimonial}
                productTitle={entry.productTitle}
                productHref={entry.productHref}
              />
            ))}
          </div>

          <Pagination group={group} page={page} lastPage={lastPage} />
        </Container>
      </section>
    </>
  );
}
