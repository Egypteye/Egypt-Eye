import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { SmartImage } from "@/components/SmartImage";
import { SectionHeading } from "@/components/SectionHeading";
import { PriceTag } from "@/components/PriceTag";
import { Reveal } from "@/components/Reveal";
import { Itinerary } from "@/components/Itinerary";
import { CareSection } from "@/components/CareSection";
import { HostCard } from "@/components/HostCard";
import { TestimonialCard } from "@/components/TestimonialCard";
import { FaqAccordion } from "@/components/FaqAccordion";
import {
  getAllSignatureExperienceSlugs,
  getSignatureExperienceBySlug,
  getSiteSettings,
} from "@/sanity/fetchers";
import { breadcrumbJsonLd, resolveMetadata } from "@/content/seo";

export async function generateStaticParams() {
  const slugs = await getAllSignatureExperienceSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const experience = await getSignatureExperienceBySlug(slug);
  if (!experience) return {};
  return resolveMetadata({
    title: experience.name,
    description: experience.shortDescription,
    seo: {
      seoTitle: experience.seoTitle,
      seoDescription: experience.seoDescription,
      canonicalUrl: experience.canonicalUrl,
      ogImage: experience.ogImage,
      noindex: experience.noindex,
    },
    image: experience.heroImage,
    path: `/signature-experiences/${experience.slug}`,
  });
}

export default async function SignatureExperienceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [experience, site] = await Promise.all([
    getSignatureExperienceBySlug(slug),
    getSiteSettings(),
  ]);
  if (!experience) notFound();

  const isComingSoon = experience.status === "comingSoon";
  const enquiryText = encodeURIComponent(
    isComingSoon
      ? `Hi! I'd like to be notified when "${experience.name}" is available.`
      : `Hi! I'd love to know more about "${experience.name}."`
  );
  const whatsappHref = `${site.contact.whatsappLink}?text=${enquiryText}`;
  const ctaLabel = isComingSoon ? "Ask to Be Notified" : "Enquire About This Experience";

  const breadcrumbs = breadcrumbJsonLd([
    { name: "Signature Experiences", path: "/signature-experiences" },
    { name: experience.name, path: `/signature-experiences/${experience.slug}` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      {/* Hero */}
      <section className="relative">
        <SmartImage
          image={experience.heroImage}
          tone={experience.heroImageTone}
          className="absolute inset-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/20" />
        <Container className="relative flex min-h-[74vh] flex-col justify-end gap-5 pb-20 pt-32">
          {isComingSoon && (
            <span className="w-fit rounded-full bg-cream/95 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-ink">
              Coming Soon
            </span>
          )}
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-light">
            {experience.forWhom}
          </p>
          <h1 className="max-w-3xl text-balance font-display text-4xl font-semibold leading-[1.1] text-cream sm:text-6xl">
            {experience.emotionalHeadline}
          </h1>
          <p className="max-w-xl text-lg text-cream/80">{experience.shortDescription}</p>
          <div className="flex flex-wrap items-center gap-6 pt-2">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-ink transition hover:bg-gold-light"
            >
              {ctaLabel}
            </a>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-cream/70">
              {experience.duration && <span>{experience.duration}</span>}
              {experience.groupSize && <span>{experience.groupSize}</span>}
              {experience.location && <span>{experience.location}</span>}
            </div>
          </div>
        </Container>
      </section>

      {/* Who is this for */}
      <section className="py-20">
        <Container className="mx-auto max-w-3xl">
          <Reveal>
            <SectionHeading title={experience.whoIsThisForTitle} align="center" />
            <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-relaxed text-ink-soft/80">
              {experience.whoIsThisForBody}
            </p>
          </Reveal>
        </Container>
      </section>

      {/* Why we created this */}
      <section className="bg-sand-dim py-20">
        <Container className="mx-auto max-w-3xl">
          <Reveal>
            <SectionHeading title={experience.whyWeCreatedThisTitle} align="center" />
            <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-relaxed text-ink-soft/80">
              {experience.whyWeCreatedThisBody}
            </p>
          </Reveal>
        </Container>
      </section>

      {/* The experience — visual storytelling */}
      {experience.experienceHighlights.length > 0 && (
        <section className="py-20">
          <Container>
            <Reveal>
              <SectionHeading
                eyebrow="The Experience"
                title="What a Day Actually Feels Like"
                description={experience.experienceIntro}
              />
            </Reveal>
            <div className="mt-12 grid gap-8 sm:grid-cols-2">
              {experience.experienceHighlights.map((h, i) => (
                <Reveal key={h.title} delay={i * 80}>
                  <div className="overflow-hidden rounded-2xl bg-cream shadow-sm shadow-black/5">
                    <SmartImage
                      image={h.image}
                      tone="desert"
                      alt={h.title}
                      className="aspect-[16/10] w-full"
                    />
                    <div className="p-6">
                      <h3 className="font-display text-lg font-semibold text-ink">{h.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink-soft/75">
                        {h.description}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Itinerary */}
      {experience.itineraryDays.length > 0 && (
        <section className="bg-sand-dim py-20">
          <Container>
            <Reveal>
              <SectionHeading eyebrow="The Itinerary" title="A Journey Through Your Days" />
            </Reveal>
            <Reveal delay={100} className="mt-10">
              <Itinerary days={experience.itineraryDays} />
            </Reveal>
          </Container>
        </section>
      )}

      {/* Everything is taken care of */}
      {experience.careItems.length > 0 && (
        <section className="py-20">
          <Container>
            <Reveal>
              <CareSection
                title={experience.careTitle}
                intro={experience.careIntro}
                items={experience.careItems}
              />
            </Reveal>
          </Container>
        </section>
      )}

      {/* Hosts */}
      {experience.hosts && experience.hosts.length > 0 && (
        <section className="py-20">
          <Container>
            <Reveal>
              <SectionHeading
                eyebrow="Your People"
                title="Meet Your Hosts"
                description="The people responsible for how this experience actually feels, day to day."
              />
            </Reveal>
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {experience.hosts.map((host, i) => (
                <Reveal key={host.slug} delay={i * 80}>
                  <HostCard host={host} />
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Testimonials */}
      {experience.testimonials && experience.testimonials.length > 0 && (
        <section className="bg-sand-dim py-20">
          <Container>
            <Reveal>
              <SectionHeading eyebrow="From Past Guests" title="In Their Words" align="center" />
            </Reveal>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {experience.testimonials.map((t, i) => (
                <Reveal key={`${t.name}-${i}`} delay={i * 80}>
                  <TestimonialCard testimonial={t} />
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* FAQs */}
      {experience.faqs && experience.faqs.length > 0 && (
        <section className="py-20">
          <Container className="mx-auto max-w-3xl">
            <Reveal>
              <SectionHeading eyebrow="Good to Know" title="Questions You Might Have" align="center" />
            </Reveal>
            <Reveal delay={100} className="mt-10">
              <FaqAccordion faqs={experience.faqs} />
            </Reveal>
          </Container>
        </section>
      )}

      {/* Final CTA */}
      <section className="pb-24">
        <Container>
          <Reveal>
            <div className="flex flex-col items-center gap-5 rounded-3xl bg-ink px-8 py-16 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-light">
                {experience.name}
              </p>
              <h2 className="max-w-xl font-display text-3xl font-semibold text-cream sm:text-4xl">
                {isComingSoon ? "Be the First to Know When This Opens" : "This Was Designed for You"}
              </h2>
              <div className="mt-1">
                <PriceTag price={experience.price} />
              </div>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="mt-2 rounded-full bg-gold px-8 py-3.5 text-sm font-semibold text-ink transition hover:bg-gold-light"
              >
                {ctaLabel}
              </a>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
