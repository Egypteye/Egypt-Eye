import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { SmartImage } from "@/components/SmartImage";
import { Rating } from "@/components/Rating";
import { PriceTag } from "@/components/PriceTag";
import { Gallery } from "@/components/Gallery";
import { AddToJourneyButton } from "@/components/AddToJourneyButton";
import { EnquiryButton } from "@/components/EnquiryButton";
import { getExperienceBySlug, getExperiences, getSiteSettings } from "@/sanity/fetchers";
import { breadcrumbJsonLd, resolveMetadata, touristTripJsonLd } from "@/content/seo";

export async function generateStaticParams() {
  const experiences = await getExperiences();
  return experiences.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const experience = await getExperienceBySlug(slug);
  if (!experience) return {};
  return resolveMetadata({
    title: experience.title,
    description: experience.description,
    seo: experience.seo,
    image: experience.image,
    path: `/experiences/${experience.slug}`,
  });
}

export default async function ExperienceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [experience, site] = await Promise.all([getExperienceBySlug(slug), getSiteSettings()]);
  if (!experience) notFound();

  const breadcrumbs = breadcrumbJsonLd([
    { name: "Extra Experiences", path: "/experiences" },
    { name: experience.title, path: `/experiences/${experience.slug}` },
  ]);
  const touristTrip = touristTripJsonLd({
    name: experience.title,
    description: experience.description,
    image: experience.image,
    path: `/experiences/${experience.slug}`,
    rating: experience.rating,
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(touristTrip) }} />
      <section className="py-14">
      <Container className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <SmartImage
            image={experience.image}
            tone={experience.imageTone}
            alt={experience.title}
            label={experience.duration}
            priority
            className="aspect-[16/10] w-full rounded-2xl"
          />
          {/* Photo credit sits with the photo, as a caption — Unsplash doesn't
              require attribution, but crediting the photographer is both
              decent and the only way the source stays traceable later. */}
          {experience.imageCredit?.creator && (
            <p className="mt-2 text-right text-xs text-ink-soft/45">
              Photo:{" "}
              {experience.imageCredit.sourceUrl ? (
                <a
                  href={experience.imageCredit.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline-offset-2 hover:underline"
                >
                  {experience.imageCredit.creator} / {experience.imageCredit.source}
                </a>
              ) : (
                `${experience.imageCredit.creator} / ${experience.imageCredit.source}`
              )}
            </p>
          )}
          <h1 className="mt-7 font-display text-3xl font-semibold text-ink sm:text-4xl">
            {experience.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
            <Rating rating={experience.rating} />
            {experience.location && (
              <span className="inline-flex items-center gap-1.5 text-sm text-ink-soft/70">
                <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-gold-dark" fill="currentColor" aria-hidden="true">
                  <path d="M10 2a5.5 5.5 0 0 0-5.5 5.5c0 3.9 4.7 9.7 5 10.05a.65.65 0 0 0 1 0c.3-.35 5-6.15 5-10.05A5.5 5.5 0 0 0 10 2Zm0 7.6a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2Z" />
                </svg>
                {experience.location}
              </span>
            )}
          </div>
          <p className="mt-5 leading-relaxed text-ink-soft/80">
            {experience.description}
          </p>

          {experience.steps && experience.steps.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-xl font-semibold text-ink">What You&rsquo;ll Do</h2>
              <ol className="mt-5 space-y-0">
                {experience.steps.map((step, i) => (
                  <li key={step.title} className="relative flex gap-4 pb-6 last:pb-0">
                    {/* The rail linking the markers, stopped short on the
                        last step so it doesn't dangle past the final stop. */}
                    {i < experience.steps!.length - 1 && (
                      <span aria-hidden="true" className="absolute left-[13px] top-8 bottom-0 w-px bg-gold/25" />
                    )}
                    <span className="relative z-10 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold/15 text-xs font-bold tabular-nums text-gold-dark ring-4 ring-cream">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-display text-base font-semibold text-ink">{step.title}</p>
                      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft/80">{step.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="mt-10">
            <h2 className="font-display text-xl font-semibold text-ink">
              Included
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-ink-soft/80">
              {experience.included.map((i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-nile">✓</span>
                  {i}
                </li>
              ))}
            </ul>
          </div>

          {experience.goodToKnow && experience.goodToKnow.length > 0 && (
            <div className="mt-10 rounded-2xl border border-black/5 bg-sand-dim p-6">
              <h2 className="font-display text-xl font-semibold text-ink">Good to Know</h2>
              <p className="mt-1.5 text-sm text-ink-soft/60">
                The practical truth about this one — timings, conditions, and what we can&rsquo;t promise.
              </p>
              <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-ink-soft/80">
                {experience.goodToKnow.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <span aria-hidden="true" className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {experience.gallery && experience.gallery.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-xl font-semibold text-ink">Gallery</h2>
              <div className="mt-4">
                <Gallery images={experience.gallery} alt={experience.title} />
              </div>
            </div>
          )}

          {experience.relatedTours && experience.relatedTours.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-xl font-semibold text-ink">Available On</h2>
              <p className="mt-2 text-sm text-ink-soft/70">Tours this experience pairs naturally with.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {experience.relatedTours.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/tours/${t.slug}`}
                    className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-ink-soft transition hover:border-gold/40 hover:text-ink"
                  >
                    {t.title} →
                  </Link>
                ))}
              </div>
            </div>
          )}

          <Link
            href="/experiences"
            className="mt-10 inline-block text-sm font-semibold text-gold-dark hover:underline"
          >
            ← Back to all experiences
          </Link>
        </div>

        <aside className="h-fit rounded-2xl border border-black/5 bg-cream p-6 shadow-sm lg:sticky lg:top-24">
          <PriceTag price={experience.price} />
          <p className="mt-1 text-xs text-ink-soft/60">per person</p>
          <a
            href={site.contact.whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="mt-5 block w-full rounded-full bg-ink py-3 text-center text-sm font-semibold text-cream transition hover:bg-gold-dark"
          >
            Book on WhatsApp
          </a>
          <EnquiryButton itemType="experience" itemTitle={experience.title} itemSlug={experience.slug} className="mt-3" />

          <div className="mt-4 border-t border-black/5 pt-4">
            <AddToJourneyButton
              type="experience"
              slug={experience.slug}
              title={experience.title}
              subtitle={experience.duration}
              suggestions={experience.relatedTours?.map((t) => ({
                type: "tour" as const,
                slug: t.slug,
                title: t.title,
                subtitle: t.duration,
              }))}
              className="w-full justify-center"
            />
          </div>
        </aside>
      </Container>
      </section>
    </>
  );
}
