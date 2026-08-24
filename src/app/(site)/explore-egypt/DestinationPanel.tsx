import Link from "next/link";
import type { DestinationHub, Experience, Photoshoot, Story, Tour } from "@/content/types";
import { SmartImage } from "@/components/SmartImage";
import { TourCard } from "@/components/TourCard";
import { ExperienceCard } from "@/components/ExperienceCard";
import { PhotoshootCard } from "@/components/PhotoshootCard";
import { StoryCard } from "@/components/StoryCard";
import { AddToJourneyButton } from "@/components/AddToJourneyButton";

function PanelSection({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  if (count === 0) return null;
  return (
    <div className="border-t border-black/5 pt-6">
      <h3 className="font-display text-lg font-semibold text-ink">
        {title} <span className="text-sm font-sans font-normal text-ink-soft/50">({count})</span>
      </h3>
      <div className="mt-4 grid gap-5 sm:grid-cols-2">{children}</div>
    </div>
  );
}

export function DestinationPanel({
  hub,
  tours,
  experiences,
  photoshoots,
  stories,
}: {
  hub: DestinationHub;
  tours: Tour[];
  experiences: Experience[];
  photoshoots: Photoshoot[];
  stories: Story[];
}) {
  const MAX = 4;
  const isEmpty = tours.length === 0 && experiences.length === 0 && photoshoots.length === 0 && stories.length === 0;

  return (
    <div key={hub.slug} className="animate-fade-up overflow-hidden rounded-3xl border border-gold/15 bg-cream shadow-xl shadow-black/5">
      <SmartImage image={hub.image} tone={hub.imageTone} alt={hub.name} className="h-56 w-full sm:h-72" priority />
      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            {hub.region && (
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark">{hub.region}</p>
            )}
            <h2 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-3xl">{hub.name}</h2>
            <p className="mt-1 text-sm text-ink-soft/70">{hub.tagline}</p>
          </div>
          <AddToJourneyButton type="destination" slug={hub.slug} title={hub.name} subtitle={hub.region} />
        </div>

        <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-ink-soft/80">{hub.intro}</p>

        {isEmpty ? (
          <p className="mt-8 border-t border-black/5 pt-6 text-sm text-ink-soft/60">
            More tours and experiences for {hub.name} are on the way — in the meantime,{" "}
            <Link href="/customize" className="font-semibold text-gold-dark underline">
              tell us what you have in mind
            </Link>{" "}
            and we&rsquo;ll build it for you.
          </p>
        ) : (
          <div className="mt-6 flex flex-col gap-6">
            <PanelSection title="Tours" count={tours.length}>
              {tours.slice(0, MAX).map((tour) => (
                <TourCard key={tour.slug} tour={tour} />
              ))}
            </PanelSection>
            <PanelSection title="Experiences" count={experiences.length}>
              {experiences.slice(0, MAX).map((experience) => (
                <ExperienceCard key={experience.slug} experience={experience} />
              ))}
            </PanelSection>
            <PanelSection title="Photoshoots" count={photoshoots.length}>
              {photoshoots.slice(0, MAX).map((photoshoot) => (
                <PhotoshootCard key={photoshoot.slug} photoshoot={photoshoot} />
              ))}
            </PanelSection>
            <PanelSection title="Stories" count={stories.length}>
              {stories.slice(0, MAX).map((story) => (
                <StoryCard key={story.slug} story={story} />
              ))}
            </PanelSection>
          </div>
        )}
      </div>
    </div>
  );
}
