import Link from "next/link";
import { Container } from "@/components/Container";
import { SmartImage } from "@/components/SmartImage";
import { SectionHeading } from "@/components/SectionHeading";
import { getStories } from "@/sanity/fetchers";

export const metadata = {
  title: "Stories",
  description: "Travel stories, guides, and journals from Egypt Eye Travel and Tours.",
};

export default async function StoriesPage() {
  const stories = await getStories();

  return (
    <section className="py-20">
      <Container>
        <SectionHeading
          eyebrow="Stories"
          title="From the Journal"
          description="Guides, trip recaps, and behind-the-scenes stories from the road."
        />
        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          {stories.map((s) => (
            <Link
              key={s.slug}
              href={`/stories/${s.slug}`}
              className="group overflow-hidden rounded-2xl border border-black/5 bg-cream shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <SmartImage
                image={s.image}
                tone={s.imageTone}
                alt={s.title}
                className="h-56 w-full transition duration-500 group-hover:scale-105"
              />
              <div className="p-6">
                <h2 className="font-display text-xl font-semibold text-ink">{s.title}</h2>
                <p className="mt-2 text-sm text-ink-soft/70">{s.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
