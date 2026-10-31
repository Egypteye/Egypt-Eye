import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { ReviewComposer } from "@/components/ReviewComposer";
import { GoogleReviewsPanel } from "@/components/GoogleReviewsPanel";
import { getGoogleReviews, readableReviews } from "@/lib/google/reviews";
import { getLocale } from "@/i18n/dictionary";
import { alternatesFor } from "@/i18n/alternates";
import { localePath } from "@/i18n/locales";
import { trAll } from "@/i18n/T";

/**
 * egypteyetravel.com/review — the link printed on cards, sent after a tour,
 * and encoded in QR codes.
 *
 * =========================================================================
 * WHY THIS IS A PAGE AND NOT A REDIRECT
 * =========================================================================
 * A redirect to g.page/r/<opaque id>/review is what this replaced. It worked,
 * but the thing a traveller saw before Google loaded was a hostname they had
 * never seen attached to a string of characters, which is what a phishing
 * link looks like. A branded page costs one tap and buys the recognition that
 * makes the tap happen at all.
 *
 * =========================================================================
 * WHAT THIS PAGE DOES NOT DO
 * =========================================================================
 * It does not submit anything to Google, because nothing can: the Business
 * Profile API reads reviews and posts owner replies, and has no method that
 * creates one. There is no documented URL parameter that pre-fills Google's
 * review box either. So the page composes and hands over, and says so in
 * those words.
 *
 * It also never claims a review was published. Only Google knows that, and
 * Google tells the traveller itself.
 *
 * =========================================================================
 * NO STRUCTURED DATA ON THIS PAGE
 * =========================================================================
 * Deliberately no Review or AggregateRating markup over the Google reviews
 * below. Google's review-snippet guidance says not to aggregate ratings from
 * other sites, and a business's own pages are not eligible for star snippets
 * regardless. src/lib/reviewPolicy.ts already encodes that rule for the
 * testimonials wall; this page holds the same line.
 */

const CANONICAL = "/review";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: "Leave a Review",
    description:
      "Share your Egypt Eye Travel experience and publish it on Google, so other travellers can find it.",
    alternates: alternatesFor(CANONICAL, locale),
  };
}

export default async function ReviewPage() {
  const locale = await getLocale();
  const state = await getGoogleReviews();

  const ui = await trAll([
    "How Was Your Egypt Experience?",
    "Your experience matters to us. Share your journey with Egypt Eye Travel and help other travellers discover Egypt.",
    "What travellers say on Google",
    "Read them all on Google",
    "Reviews shown here are published on Google by the travellers who wrote them. Egypt Eye cannot edit or remove them.",
    "You publish it on Google yourself, under your own Google account. It takes about a minute.",
    "Would rather send it to us privately instead?",
    "Write to us directly",
  ]);

  const reviews = state.status === "ok" ? readableReviews(state.data) : [];
  const total = state.status === "ok" ? state.data.totalCount : 0;
  const average = state.status === "ok" ? state.data.averageRating : null;

  // Formatted here rather than in the panel so the count sits inside a
  // sentence that says whose figure it is and what it counts — it includes
  // ratings left with no words, so it is never a count of the cards shown.
  const summaryLabel = `from ${total.toLocaleString("en-US")} reviews on Google`;

  return (
    <section className="py-14 sm:py-20">
      <Container className="max-w-3xl">
        <h1 className="font-display text-3xl leading-tight text-ink sm:text-4xl">
          {ui["How Was Your Egypt Experience?"]}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-soft">
          {
            ui[
              "Your experience matters to us. Share your journey with Egypt Eye Travel and help other travellers discover Egypt."
            ]
          }
        </p>
        <p className="mt-2 text-sm text-ink-soft">
          {ui["You publish it on Google yourself, under your own Google account. It takes about a minute."]}
        </p>

        <div className="mt-8">
          <ReviewComposer />
        </div>

        {/* The private route is offered to everyone, in the same words, after
            the Google step rather than instead of it for anybody. Steering
            lower ratings here and higher ones to Google would be review
            gating, which Google prohibits — see ReviewComposer's header. */}
        <p className="mt-6 text-center text-sm text-ink-soft">
          {ui["Would rather send it to us privately instead?"]}{" "}
          <Link
            href={localePath("/testimonials", locale)}
            className="underline decoration-gold underline-offset-4 transition hover:text-ink"
          >
            {ui["Write to us directly"]}
          </Link>
        </p>
      </Container>

      {reviews.length > 0 && (
        <Container className="mt-16">
          <GoogleReviewsPanel
            reviews={reviews}
            averageRating={average}
            heading={ui["What travellers say on Google"]}
            summaryLabel={summaryLabel}
            readOnGoogleLabel={ui["Read them all on Google"]}
            attribution={
              ui[
                "Reviews shown here are published on Google by the travellers who wrote them. Egypt Eye cannot edit or remove them."
              ]
            }
            locale={locale}
          />
        </Container>
      )}
    </section>
  );
}
