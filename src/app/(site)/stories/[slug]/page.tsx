import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { SmartImage } from "@/components/SmartImage";
import { StoryBody } from "@/components/StoryBody";
import { StoryCard } from "@/components/StoryCard";
import { SignatureExperienceCard } from "@/components/SignatureExperienceCard";
import { Reveal } from "@/components/Reveal";
import { getStories, getStoryBySlug } from "@/sanity/fetchers";
import { estimateReadingTime } from "@/content/readingTime";
import { urlForImage } from "@/sanity/image";
import type { StoryCountdownBlock } from "@/content/types";

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

  const title = story.seoTitle || story.title;
  const description = story.seoDescription || story.excerpt;
  const ogImageUrl = urlForImage(story.ogImage || story.image)?.width(1200).height(630).url();

  return {
    title,
    description,
    alternates: story.canonicalUrl ? { canonical: story.canonicalUrl } : undefined,
    openGraph: {
      type: "article",
      title,
      description,
      images: ogImageUrl ? [ogImageUrl] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImageUrl ? [ogImageUrl] : undefined,
    },
  };
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

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: story.title,
    description: story.excerpt,
    datePublished: story.publishedAt,
    author: story.author ? { "@type": "Organization", name: story.author.name } : undefined,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Stories", item: "/stories" },
      { "@type": "ListItem", position: 2, name: story.title, item: `/stories/${story.slug}` },
    ],
  };

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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {eventJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
        />
      )}

      {/* Hero */}
      <section className="relative">
        <SmartImage image={story.image} tone={story.imageTone} className="absolute inset-0" />
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
            <p className="text-sm text-ink-soft/50">
              Full article coming soon — write it in the{" "}
              <Link href="/studio" className="underline">
                Studio
              </Link>
              .
            </p>
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
