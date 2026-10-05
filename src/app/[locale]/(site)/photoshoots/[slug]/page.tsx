import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { SmartImage } from "@/components/SmartImage";
import { PriceTag } from "@/components/PriceTag";
import { SecureDateButton } from "@/components/SecureDateButton";
import { presentDeposit, resolveDeposit } from "@/lib/booking/deposit";
import { depositHeadline } from "@/lib/booking/quote";
import { paymentProviderFor } from "@/lib/booking/activeProvider";
import { resolveRail } from "@/lib/booking/rail";
import { cancellationSummary } from "@/content/cancellationPolicy";
import { ExperienceRatingLink } from "@/components/ExperienceRatingLink";
import { Gallery } from "@/components/Gallery";
import { FaqAccordion } from "@/components/FaqAccordion";
import { AddToJourneyButton } from "@/components/AddToJourneyButton";
import { EnquiryButton } from "@/components/EnquiryButton";
import { WhatsAppBookButton } from "@/components/WhatsAppBookButton";
import { getPhotoshootBySlug, getPhotoshoots, getSiteSettings, getTestimonials } from "@/sanity/fetchers";
import { ProductReviews } from "@/components/ProductReviews";
import { getLocale } from "@/i18n/dictionary";
import { breadcrumbJsonLd, resolveMetadata, touristTripJsonLd } from "@/content/seo";
import { T } from "@/i18n/T";

export async function generateStaticParams() {
  const photoshoots = await getPhotoshoots();
  return photoshoots.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const photoshoot = await getPhotoshootBySlug(slug);
  if (!photoshoot) return {};
  return resolveMetadata({
    locale: await getLocale(),
    title: photoshoot.title,
    description: photoshoot.description,
    seo: photoshoot.seo,
    image: photoshoot.image,
    path: `/photoshoots/${photoshoot.slug}`,
  });
}

export default async function PhotoshootDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [photoshoot, site, testimonials] = await Promise.all([
    getPhotoshootBySlug(slug),
    getSiteSettings(),
    getTestimonials(),
  ]);
  if (!photoshoot) notFound();

  // Emitted from the exact pairs the accordion below renders — structured
  // data that says something the page doesn't is a manual-action risk, not a
  // rich result.
  const faqJsonLd =
    photoshoot.faqs && photoshoot.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: photoshoot.faqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }
      : null;

  const breadcrumbs = breadcrumbJsonLd([
    { name: "Photoshoots", path: "/photoshoots" },
    { name: photoshoot.title, path: `/photoshoots/${photoshoot.slug}` },
  ]);
  const touristTrip = touristTripJsonLd({
    name: photoshoot.title,
    description: photoshoot.description,
    image: photoshoot.image,
    path: `/photoshoots/${photoshoot.slug}`,
    // See the tour page: no visible rating, so no aggregateRating markup.
  });

  // The deposit door, shown only for a product somebody switched on.
  const deposit = resolveDeposit(photoshoot, site.defaultDepositUsd);
  // The figure on the button comes from the same function that will do the
  // charging. They were two functions once — the page fell back to the
  // site-wide default and the checkout did not — and the result was a button
  // showing an amount next to a PayPal window that never opened.
  const headline = depositHeadline(photoshoot, "photoshoot", site.defaultDepositUsd);
  const depositLabel = headline?.label ?? (deposit.bookable ? presentDeposit(deposit.amountUsd).deposit : "");
  const perPerson = headline?.perPerson ?? false;
  // Asked once, in lib/booking/rail.ts, and read here — the same answer the
  // booking route acts on. Deriving it separately is how a page came to say
  // "held, not charged" about money the route captures.
  const paymentMode = resolveRail(deposit, paymentProviderFor({ isAdmin: false })).moneyMode;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(touristTrip) }} />
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}
    <section className="py-14">
      <Container className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <SmartImage
            image={photoshoot.image}
            tone={photoshoot.imageTone}
            alt={photoshoot.title}
            label={photoshoot.locations.join(" · ")}
            priority
            className="aspect-[16/10] w-full rounded-2xl"
          />
          <h1 className="mt-8 font-display text-3xl font-semibold text-ink sm:text-4xl">
            {photoshoot.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-soft">
            <span>⏱ {photoshoot.duration}</span>
            <ExperienceRatingLink
              type="photoshoot"
              slug={photoshoot.slug}
            />
          </div>
          <p className="mt-5 leading-relaxed text-ink-soft">
            {photoshoot.description}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {photoshoot.goodFor.map((g) => (
              <span
                key={g}
                className="rounded-full bg-sand-dim px-3 py-1.5 text-xs font-semibold text-ink-soft"
              >
                {g}
              </span>
            ))}
          </div>

          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            <div>
              <h2 className="font-display text-lg font-semibold text-ink"><T>Included</T></h2>
              <ul className="mt-3 space-y-2 text-sm text-ink-soft">
                {photoshoot.included.map((i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-nile">✓</span>
                    {i}
                  </li>
                ))}
              </ul>
            </div>
            {photoshoot.addOns && (
              <div>
                <h2 className="font-display text-lg font-semibold text-ink"><T>Optional Add-Ons</T></h2>
                <ul className="mt-3 space-y-2 text-sm text-ink-soft">
                  {photoshoot.addOns.map((i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-gold-dark">+</span>
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-8">
            <h2 className="font-display text-lg font-semibold text-ink"><T>What you receive</T></h2>
            <ul className="mt-3 space-y-2 text-sm text-ink-soft">
              {photoshoot.delivery.map((i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-gold-dark">✦</span>
                  {i}
                </li>
              ))}
            </ul>
          </div>

          {photoshoot.faqs && photoshoot.faqs.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-lg font-semibold text-ink"><T>Good to know</T></h2>
              <div className="mt-4">
                <FaqAccordion faqs={[...photoshoot.faqs]} />
              </div>
            </div>
          )}

          {photoshoot.gallery && photoshoot.gallery.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-lg font-semibold text-ink"><T>Gallery</T></h2>
              <div className="mt-4">
                <Gallery images={photoshoot.gallery} alt={photoshoot.title} />
              </div>
            </div>
          )}

          <Link
            href="/photoshoots"
            className="mt-10 inline-block text-sm font-semibold text-gold-dark hover:underline"
          >
            ← Back to all photoshoot packages
          </Link>
        </div>

        <aside className="h-fit rounded-2xl border border-black/5 bg-cream p-6 shadow-sm lg:sticky lg:top-24">
          {deposit.bookable && (
            <div className="mb-5">
              <SecureDateButton
                productType="photoshoot"
                productSlug={photoshoot.slug}
                productTitle={photoshoot.title}
                depositLabel={depositLabel}
                paymentMode={paymentMode}
                cancellationSummary={cancellationSummary}
                cancellationHref="/cancellation-policy"
                timeSlots={photoshoot.timeSlots}
                extras={photoshoot.extras}
                perPerson={perPerson}
                quotable={{
                  slug: photoshoot.slug,
                  title: photoshoot.title,
                  bookable: photoshoot.bookable,
                  depositUsd: photoshoot.depositUsd ?? site.defaultDepositUsd,
                  depositBasis: photoshoot.depositBasis,
                  depositMaxUsd: photoshoot.depositMaxUsd,
                  extras: photoshoot.extras,
                }}
                productKind="photoshoot"
                className="block w-full rounded-full bg-gold px-5 py-4 text-center text-base font-semibold text-ink shadow-md shadow-gold/25 transition hover:bg-gold-light hover:shadow-lg"
              />
              {/* The button says what you get to do; this line says what it
                  costs and what the risk is. The refund promise is what makes
                  paying before a date is confirmed reasonable, and "no account
                  needed" is the other reason people abandon a booking. */}
              <p className="mt-2 text-center text-xs leading-relaxed text-ink-soft">
                {paymentMode === "none"
                  ? "Our team confirms your date personally."
                  : paymentMode === "hold"
                    ? `${depositLabel}${perPerson ? " per person" : ""} deposit held, not charged · no account needed · released if we cannot confirm your date`
                    : `${depositLabel}${perPerson ? " per person" : ""} deposit · no account needed · fully refunded if we cannot confirm your date`}
              </p>
            </div>
          )}
          <PriceTag price={photoshoot.price} />
          <p className="mt-1 text-xs text-ink-soft/85"><T>per session</T></p>
          <WhatsAppBookButton
            whatsappLink={site.contact.whatsappLink}
            context={{ page: "this photoshoot's page", item: photoshoot.title }}
            className="mt-5 block w-full rounded-full bg-ink py-3 text-center text-sm font-semibold text-cream transition hover:bg-gold-dark"><T>Book on WhatsApp</T></WhatsAppBookButton>
          <EnquiryButton itemType="photoshoot" itemTitle={photoshoot.title} itemSlug={photoshoot.slug} className="mt-3" />

          <div className="mt-4 border-t border-black/5 pt-4">
            <AddToJourneyButton
              type="photoshoot"
              slug={photoshoot.slug}
              title={photoshoot.title}
              subtitle={photoshoot.duration}
              className="w-full justify-center"
            />
          </div>
        </aside>
      </Container>
    </section>

      {/* Photography reviews specifically: a traveller describing how the
          photographer worked is the single most persuasive thing on a shoot
          page, and far more use here than a generic five stars. */}
      <Container>
        <ProductReviews
          reviews={testimonials}
          subject={{ type: "photoshoot", slug: photoshoot.slug, title: photoshoot.title }}
          themes={["photography", "flying-dress", "proposal", "birthday", "couples"]}
        />
      </Container>
    </>
  );
}
