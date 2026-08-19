import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { PlaceholderImage } from "@/components/PlaceholderImage";
import { stories, getStoryBySlug } from "@/content/stories";

export function generateStaticParams() {
  return stories.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const story = getStoryBySlug(slug);
  if (!story) return {};
  return { title: story.title, description: story.excerpt };
}

export default async function StoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = getStoryBySlug(slug);
  if (!story) notFound();

  return (
    <section className="py-14">
      <Container className="mx-auto max-w-3xl">
        <PlaceholderImage tone={story.imageTone} className="aspect-[16/9] w-full rounded-2xl" />
        <h1 className="mt-8 font-display text-3xl font-semibold text-ink sm:text-4xl">
          {story.title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-soft/80">{story.excerpt}</p>
        <p className="mt-6 text-sm text-ink-soft/50">
          Full article coming soon — add the complete write-up to{" "}
          <code className="rounded bg-sand-dim px-1.5 py-0.5">src/content/stories.ts</code>.
        </p>
        <Link href="/stories" className="mt-10 inline-block text-sm font-semibold text-gold-dark hover:underline">
          ← Back to all stories
        </Link>
      </Container>
    </section>
  );
}
