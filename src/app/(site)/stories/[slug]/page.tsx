import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { Container } from "@/components/Container";
import { SmartImage } from "@/components/SmartImage";
import { urlForImage } from "@/sanity/image";
import { getStories, getStoryBySlug } from "@/sanity/fetchers";

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
  return { title: story.title, description: story.excerpt };
}

const portableTextComponents: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      const src = urlForImage(value)?.width(1200).url();
      if (!src) return null;
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={src} alt="" className="my-6 w-full rounded-2xl" />;
    },
  },
};

export default async function StoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);
  if (!story) notFound();

  return (
    <section className="py-14">
      <Container className="mx-auto max-w-3xl">
        <SmartImage
          image={story.image}
          tone={story.imageTone}
          alt={story.title}
          className="aspect-[16/9] w-full rounded-2xl"
        />
        {story.publishedAt && (
          <p className="mt-8 text-xs font-semibold uppercase tracking-wide text-gold-dark">
            {new Date(story.publishedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        )}
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">
          {story.title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-soft/80">{story.excerpt}</p>

        {story.body && story.body.length > 0 ? (
          <div className="prose prose-lg mt-8 max-w-none text-ink-soft/85 prose-headings:font-display prose-headings:text-ink prose-a:text-gold-dark">
            <PortableText value={story.body} components={portableTextComponents} />
          </div>
        ) : (
          <p className="mt-6 text-sm text-ink-soft/50">
            Full article coming soon — write it in the{" "}
            <Link href="/studio" className="underline">
              Studio
            </Link>
            .
          </p>
        )}

        <Link href="/stories" className="mt-10 inline-block text-sm font-semibold text-gold-dark hover:underline">
          ← Back to all stories
        </Link>
      </Container>
    </section>
  );
}
