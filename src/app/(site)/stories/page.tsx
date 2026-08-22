import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { SmartImage } from "@/components/SmartImage";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";
import { getStories } from "@/sanity/fetchers";
import { estimateReadingTime } from "@/content/readingTime";
import { StoriesGrid } from "./StoriesGrid";

export const metadata: Metadata = {
  title: "Stories",
  description:
    "Editorial travel stories from Egypt Eye — the history, the places, and the rare moments worth building a trip around.",
};

export default async function StoriesPage() {
  const stories = await getStories();
  if (stories.length === 0) {
    return (
      <Container className="py-24 text-center text-ink-soft/60">
        Stories are coming soon.
      </Container>
    );
  }

  const featured = stories.find((s) => s.featured) ?? stories[0];
  const rest = stories.filter((s) => s.slug !== featured.slug);

  return (
    <>
      <section className="py-20">
        <Container>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-dark">Stories</p>
          <h1 className="mt-3 max-w-2xl text-balance font-display text-4xl font-semibold text-ink sm:text-5xl">
            The Journal
          </h1>
          <p className="mt-4 max-w-xl text-ink-soft/75">
            Editorial travel writing from Egypt Eye — the history, the places, and the rare
            moments worth building a trip around.
          </p>
        </Container>
      </section>

      {/* Featured story */}
      <section className="pb-16">
        <Container>
          <Reveal>
            <Link href={`/stories/${featured.slug}`} className="group grid overflow-hidden rounded-3xl bg-ink lg:grid-cols-2">
              <SmartImage
                image={featured.image}
                tone={featured.imageTone}
                alt={featured.title}
                className="min-h-[320px] transition duration-700 ease-out group-hover:scale-[1.02] lg:min-h-[440px]"
              />
              <div className="flex flex-col justify-center gap-4 p-10 sm:p-14">
                {featured.category && (
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-light">
                    {featured.category}
                  </p>
                )}
                <h2 className="text-balance font-display text-3xl font-semibold text-cream sm:text-4xl">
                  {featured.title}
                </h2>
                <p className="text-cream/70">{featured.excerpt}</p>
                <div className="flex items-center gap-4 text-xs text-cream/50">
                  {featured.publishedAt && (
                    <span>
                      {new Date(featured.publishedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  )}
                  <span>{estimateReadingTime(featured.body)} min read</span>
                </div>
                <span className="mt-2 inline-flex w-fit items-center gap-2 text-sm font-semibold text-gold-light transition group-hover:gap-3">
                  Read the story <span aria-hidden="true">→</span>
                </span>
              </div>
            </Link>
          </Reveal>
        </Container>
      </section>

      {rest.length > 0 && (
        <section className="pb-24">
          <Container>
            <SectionHeading eyebrow="More Stories" title="Continue Exploring" />
            <div className="mt-10">
              <StoriesGrid stories={rest} />
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
