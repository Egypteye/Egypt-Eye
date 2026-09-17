import { Container } from "@/components/Container";
import { ExploreMapPanel } from "@/components/ExploreMapPanel";
import { ExploreModeToggle } from "@/components/ExploreModeToggle";
import { DestinationPanel } from "./DestinationPanel";
import { experiencesForHub, photoshootsForHub, storiesForHub, toursForHub } from "./data";
import { egyptCities } from "@/content/egyptCities";
import type { DestinationHub, Experience, Photoshoot, ResolvedListingPages, Story, Tour } from "@/content/types";

export function ExploreEgyptView({
  hubs,
  selectedHub,
  tours,
  experiences,
  photoshoots,
  stories,
  copy,
}: {
  hubs: DestinationHub[];
  selectedHub: DestinationHub;
  tours: Tour[];
  experiences: Experience[];
  photoshoots: Photoshoot[];
  stories: Story[];
  copy: ResolvedListingPages["exploreEgypt"];
}) {
  return (
    <>
      <section className="relative overflow-hidden bg-ink pb-10 pt-28 sm:pb-14 sm:pt-32">
        <div className="bg-hieroglyph-pattern absolute inset-0 opacity-[0.06]" aria-hidden="true" />
        <Container className="relative flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-light">{copy.heroEyebrow}</p>
            <h1 className="max-w-2xl text-balance font-display text-4xl font-semibold text-cream sm:text-5xl">
              {copy.heroTitle}
            </h1>
            <p className="max-w-xl text-[15px] text-cream/70">{copy.heroDescription}</p>
          </div>
          <ExploreModeToggle />
        </Container>
      </section>

      <section className="bg-sand py-10 sm:py-14">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr] lg:items-start lg:gap-10">
            <ExploreMapPanel hubs={hubs} cities={egyptCities} selectedSlug={selectedHub.slug} />

            <DestinationPanel
              hub={selectedHub}
              tours={toursForHub(tours, selectedHub)}
              experiences={experiencesForHub(experiences, selectedHub)}
              photoshoots={photoshootsForHub(photoshoots, selectedHub)}
              stories={storiesForHub(stories, selectedHub)}
            />
          </div>
        </Container>
      </section>
    </>
  );
}
