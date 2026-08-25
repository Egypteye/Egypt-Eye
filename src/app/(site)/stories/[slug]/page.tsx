import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { SmartImage } from "@/components/SmartImage";
import { StoryBody } from "@/components/StoryBody";
import { StoryCard } from "@/components/StoryCard";
import { TourCard } from "@/components/TourCard";
import { SignatureExperienceCard } from "@/components/SignatureExperienceCard";
import { Reveal } from "@/components/Reveal";
import { getStories, getStoryBySlug } from "@/sanity/fetchers";
import { estimateReadingTime } from "@/content/readingTime";
import { urlForImage } from "@/sanity/image";
import { breadcrumbJsonLd, resolveMetadata, siteUrl } from "@/content/seo";
import { site } from "@/content/site";
import type { StoryCountdownBlock, StoryFaqBlock } from "@/content/types";

export async function generateStaticParams() {
  const stories = await getStories();
  return stories.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);
  if (!story) return {};

  return resolveMetadata({
    title: story.title,
    description: story.excerpt,
    seo: {
      seoTitle: story.seoTitle,
      seoDescription: story.seoDescription,
      canonicalUrl: story.canonicalUrl,
      ogImage: story.ogImage,
      noindex: story.noindex,
    },
    image: story.image,
    path: `/stories/${story.slug}`,
  });
}

export default async function StoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);
  if (!story) notFound();

  const readingTime = estimateReadingTime(story.body);
  const publishedDate = story.publishedAt
    ? new Date(story.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : null;

  const articleImageUrl = urlForImage(story.image)?.width(1200).height(630).url();
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: story.title,
    description: story.excerpt,
    image: articleImageUrl,
    datePublished: story.publishedAt,
    dateModified: story.publishedAt,
    author: story.author ? { "@type": "Organization", name: story.author.name } : undefined,
    publisher: {
      "@type": "Organization",
      name: site.name,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/brand/egypt-eye-badge-gold.png`,
      },
    },
  };

  const breadcrumbs = breadcrumbJsonLd([
    { name: "Stories", path: "/stories" },
    { name: story.title, path: `/stories/${story.slug}` },
  ]);

  // If this story carries a Countdown block, surface its event as Event
  // structured data too — using the same verified date/time the countdown
  // itself renders, not a separately-maintained copy.
  const countdownEvent = story.body?.find(
    (b): b is StoryCountdownBlock => b._type === "countdownBlock"
  )?.event;
  const eventJsonLd = countdownEvent
    ? {
        "@context": "https://schema.org",
        "@type": "Event",
        name: countdownEvent.name,
        startDate: countdownEvent.targetDateTime,
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        eventStatus: "https://schema.org/EventScheduled",
        location: countdownEvent.locationName
          ? { "@type": "Place", name: countdownEvent.locationName }
          : undefined,
        description: countdownEvent.supportingText,
      }
    : null;

  // If this story carries an FAQ block, emit FAQPage structured data from
  // the exact same question/answer pairs rendered on the page — never a
  // separately-maintained copy.
  const faqBlocks = story.body?.filter((b): b is StoryFaqBlock => b._type === "faqBlock") ?? [];
  const faqJsonLd =
    faqBlocks.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqBlocks.flatMap((block) =>
            block.faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            }))
          ),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      {eventJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
        />
      )}
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      {/* Hero */}
      <section className="relative">
        <SmartImage image={story.image} tone={story.imageTone} alt={story.title} className="absolute inset-0" priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/20" />
        <Container className="relative flex min-h-[64vh] flex-col justify-end gap-4 pb-16 pt-32">
          {story.category && (
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-light">
              {story.category}
            </p>
          )}
          <h1 className="max-w-3xl text-balance font-display text-4xl font-semibold leading-[1.1] text-cream sm:text-5xl">
            {story.title}
          </h1>
          <p className="max-w-xl text-lg text-cream/80">{story.excerpt}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-cream/60">
            {story.author && <span>{story.author.name}</span>}
            {publishedDate && <span>{publishedDate}</span>}
            <span>{readingTime} min read</span>
          </div>
        </Container>
      </section>

      {/* Body */}
      <section className="py-16">
        <Container className="mx-auto max-w-3xl">
          <Reveal>{story.body && story.body.length > 0 && <StoryBody body={story.body} />}</Reveal>

          {(!story.body || story.body.length === 0) && (
            <p className="text-sm text-ink-soft/50">Full article coming soon.</p>
          )}

          {/* Related experience — dedicated section, in addition to anything
              placed inline in the body via an Experience Card block. */}
          {story.relatedExperience && (
            <Reveal className="not-prose mt-16 rounded-3xl border border-gold/20 bg-sand-dim p-6 sm:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark">
                Want to Experience It?
              </p>
              <div className="mt-6 max-w-sm">
                <SignatureExperienceCard experience={story.relatedExperience} />
              </div>
            </Reveal>
          )}

          {/* Related tours — where this article's subject can actually be
              booked, in addition to any single relatedExperience above. */}
          {story.relatedTours && story.relatedTours.length > 0 && (
            <Reveal className="not-prose mt-16">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark">
                Where This Takes You
              </p>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {story.relatedTours.map((t) => (
                  <TourCard key={t.slug} tour={t} />
                ))}
              </div>
            </Reveal>
          )}

          <Link href="/stories" className="mt-12 inline-block text-sm font-semibold text-gold-dark hover:underline">
            ← Back to all stories
          </Link>
        </Container>
      </section>

      {/* Related stories */}
      {story.relatedStories && story.relatedStories.length > 0 && (
        <section className="bg-sand-dim py-20">
          <Container>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-dark">
              Continue Exploring
            </p>
            <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {story.relatedStories.map((s) => (
                <StoryCard key={s.slug} story={s} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
