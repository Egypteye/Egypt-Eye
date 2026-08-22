import Link from "next/link";
import type { StoryCardData } from "@/content/types";
import { SmartImage } from "./SmartImage";

export function StoryCard({ story }: { story: StoryCardData }) {
  return (
    <Link
      href={`/stories/${story.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-cream shadow-sm transition hover:shadow-lg hover:shadow-black/5"
    >
      <SmartImage
        image={story.image}
        tone={story.imageTone}
        alt={story.title}
        className="aspect-[4/3] w-full transition duration-500 group-hover:scale-105"
      />
      <div className="flex flex-1 flex-col gap-2 p-6">
        {story.category && (
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gold-dark">
            {story.category}
          </p>
        )}
        <h3 className="font-display text-lg font-semibold leading-snug text-ink">{story.title}</h3>
        <p className="line-clamp-2 text-sm text-ink-soft/70">{story.excerpt}</p>
      </div>
    </Link>
  );
}
