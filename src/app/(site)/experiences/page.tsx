import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { SmartImage } from "@/components/SmartImage";
import { ExperienceCard } from "@/components/ExperienceCard";
import { Reveal } from "@/components/Reveal";
import { activityDestinationGroups } from "@/content/activities";
import type { Experience } from "@/content/types";
import { getExperiences, getListingPages } from "@/sanity/fetchers";
import { siteUrl } from "@/content/seo";

export const metadata: Metadata = {
  title: "Things to Do in Egypt — Activities & Extra Experiences",
  description:
    "Camel rides at Giza, kayaking on the Nile, 4x4 safaris and camping in Fayoum, ballooning over Luxor, Red Sea island days and Siwa's salt lakes — Egypt Eye's activities, by destination.",
  alternates: { canonical: `${siteUrl}/experiences` },
};

// Groups an activity under the FIRST of its `destinations` tags that a group
// claims. Anything unclaimed lands in a trailing bucket rather than vanishing
// off the page — adding an activity should never require touching this file.
function groupByDestination(experiences: Experience[]) {
  const buckets = new Map<string, Experience[]>();
  const leftovers: Experience[] = [];

  for (const e of experiences) {
    const primary = e.destinations?.[0];
    const group = primary
      ? activityDestinationGroups.find((g) => g.match.includes(primary))
      : undefined;
    if (!group) {
      leftovers.push(e);
      continue;
    }
    const existing = buckets.get(group.key);
    if (existing) existing.push(e);
    else buckets.set(group.key, [e]);
  }

  const groups = activityDestinationGroups
    .map((g) => ({ ...g, items: buckets.get(g.key) ?? [] }))
    .filter((g) => g.items.length > 0);

  if (leftovers.length > 0) {
    groups.push({
      key: "more",
      name: "More Experiences",
      blurb: "Everything else we run as an add-on.",
      match: [],
      items: leftovers,
    });
  }

  return groups;
}

export default async function ExperiencesPage() {
  const [experiences, listingPages] = await Promise.all([getExperiences(), getListingPages()]);
  const page = listingPages.experiences;
  const groups = groupByDestination(experiences);

  return (
    <>
      <section className="relative">
        <SmartImage
          image="/photos/pexels-38498244.jpg"
          tone="desert"
          alt="A desert oasis lake in Egypt's Western Desert"
          className="absolute inset-0"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/10" />
        <Container className="relative flex min-h-[38vh] flex-col justify-end gap-3 pb-14 pt-32">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-light">{page.heroEyebrow}</p>
          <h1 className="max-w-2xl font-display text-4xl font-semibold text-cream sm:text-5xl">{page.heroTitle}</h1>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <SectionHeading title={page.sectionTitle} description={page.sectionDescription} />

          {/* Jump bar — the catalogue is long enough that a visitor who
              already knows where they're going shouldn't have to scroll it. */}
          {groups.length > 1 && (
            <nav aria-label="Jump to a destination" className="mt-8 flex flex-wrap gap-2">
              {groups.map((g) => (
                <a
                  key={g.key}
                  href={`#${g.key}`}
                  className="rounded-full border border-black/10 bg-cream px-4 py-2 text-sm font-semibold text-ink-soft transition-colors duration-200 hover:border-gold/50 hover:bg-gold/10 hover:text-gold-dark"
                >
                  {g.name}
                  <span className="ml-2 text-xs font-normal text-ink-soft/50">{g.items.length}</span>
                </a>
              ))}
            </nav>
          )}
        </Container>
      </section>

      {groups.map((group, i) => (
        <section
          key={group.key}
          id={group.key}
          className={`scroll-mt-24 py-14 ${i % 2 === 1 ? "bg-sand-dim" : ""}`}
        >
          <Container>
            <Reveal>
              <div className="max-w-2xl">
                <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">{group.name}</h2>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-soft/75">{group.blurb}</p>
              </div>
            </Reveal>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((e) => (
                <ExperienceCard key={e.slug} experience={e} />
              ))}
            </div>
          </Container>
        </section>
      ))}

      <section className="bg-ink py-16">
        <Container className="flex flex-col items-center gap-5 text-center">
          <h2 className="max-w-2xl text-balance font-display text-2xl font-semibold text-cream sm:text-3xl">
            Any of these can be built into a longer trip
          </h2>
          <p className="max-w-xl text-[15px] leading-relaxed text-cream/70">
            Tell us which ones caught your eye and roughly when you&rsquo;re travelling, and we&rsquo;ll come back with
            an itinerary that fits them together properly — transport, timings and all.
          </p>
          <Link
            href="/customize"
            className="group mt-1 inline-flex items-center gap-3 rounded-full bg-gold py-2.5 pl-6 pr-2.5 text-sm font-semibold text-ink transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-gold-light active:scale-[0.98]"
          >
            Customize Your Tour
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink/10 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px">
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M7 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </Link>
        </Container>
      </section>
    </>
  );
}
