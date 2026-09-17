"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/Container";
import { EgyptMap } from "@/components/EgyptMap";
import { ExploreModeToggle } from "@/components/ExploreModeToggle";
import { SmartImage } from "@/components/SmartImage";
import { TourCard } from "@/components/TourCard";
import { ExperienceCard } from "@/components/ExperienceCard";
import { PhotoshootCard } from "@/components/PhotoshootCard";
import { clearJourneyItems, removeJourneyItem, useJourneyItems } from "@/lib/journey";
import { SuggestionToast, type JourneySuggestion } from "@/components/AddToJourneyButton";
import type { DestinationHub } from "@/content/types";
import type { JourneyDetailsResponse } from "@/app/api/journey/route";

type Status = "idle" | "ready" | "error";

const EMPTY_DETAILS: JourneyDetailsResponse = { tours: [], experiences: [], photoshoots: [], destinations: [] };

export function MyJourneyClient({ allHubs }: { allHubs: DestinationHub[] }) {
  const items = useJourneyItems();
  const [fetchedDetails, setDetails] = useState<JourneyDetailsResponse | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [suggestionsDismissed, setSuggestionsDismissed] = useState(false);
  const details = items.length === 0 ? EMPTY_DETAILS : fetchedDetails;

  useEffect(() => {
    if (items.length === 0) return;
    let cancelled = false;
    fetch("/api/journey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: items.map(({ type, slug }) => ({ type, slug })) }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load journey details");
        return res.json() as Promise<JourneyDetailsResponse>;
      })
      .then((data) => {
        if (!cancelled) {
          setDetails(data);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [items]);

  // Every destination the visitor is actually visiting: hubs explicitly
  // added via "Add to My Journey" on a destination panel, plus any hub
  // whose name matches a tag on a selected tour/experience/photoshoot —
  // same matching used on the Explore Egypt destination panels.
  const visitedHubs = useMemo(() => {
    if (!details) return [];
    const slugs = new Set(details.destinations.map((d) => d.slug));
    const tagged = [
      ...details.tours.flatMap((t) => t.destinations ?? []),
      ...details.experiences.flatMap((e) => e.destinations ?? []),
      ...details.photoshoots.flatMap((p) => p.destinations ?? []),
    ];
    for (const hub of allHubs) {
      if (tagged.some((tag) => hub.matchNames.includes(tag))) slugs.add(hub.slug);
    }
    return allHubs.filter((h) => slugs.has(h.slug)).sort((a, b) => a.order - b.order);
  }, [details, allHubs]);

  const tripDays = useMemo(
    () => (details ? details.tours.reduce((sum, t) => sum + (t.lengthDays || 0), 0) : 0),
    [details]
  );

  // "You might also like" — pooled from the related tours/experiences of
  // everything already in the journey, minus anything already added. Same
  // data (Tour.relatedExperiences / Experience.relatedTours) that powers
  // the add-to-journey suggestion toast on individual tour/experience
  // pages, just aggregated across the whole journey instead of one item.
  const journeySuggestions = useMemo<JourneySuggestion[]>(() => {
    if (!details) return [];
    const inJourney = new Set([
      ...details.tours.map((t) => `tour:${t.slug}`),
      ...details.experiences.map((e) => `experience:${e.slug}`),
    ]);
    const seen = new Set<string>();
    const suggestions: JourneySuggestion[] = [];
    for (const tour of details.tours) {
      for (const experience of tour.relatedExperiences ?? []) {
        const key = `experience:${experience.slug}`;
        if (inJourney.has(key) || seen.has(key)) continue;
        seen.add(key);
        suggestions.push({ type: "experience", slug: experience.slug, title: experience.title, subtitle: experience.duration });
      }
    }
    for (const experience of details.experiences) {
      for (const tour of experience.relatedTours ?? []) {
        const key = `tour:${tour.slug}`;
        if (inJourney.has(key) || seen.has(key)) continue;
        seen.add(key);
        suggestions.push({ type: "tour", slug: tour.slug, title: tour.title, subtitle: tour.duration });
      }
    }
    return suggestions;
  }, [details]);

  const isEmpty = items.length === 0;

  return (
    <>
      <section className="relative overflow-hidden bg-ink pb-10 pt-28 sm:pb-14 sm:pt-32">
        <div className="bg-hieroglyph-pattern absolute inset-0 opacity-[0.06]" aria-hidden="true" />
        <Container className="relative flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-light">My Journey</p>
            <h1 className="max-w-2xl text-balance font-display text-4xl font-semibold text-cream sm:text-5xl">
              {isEmpty ? "Your journey is still a blank page" : "The Egypt you're planning"}
            </h1>
            <p className="max-w-xl text-[15px] text-cream/70">
              {isEmpty
                ? "Browse Explore Egypt, Tours, Experiences, or Photoshoots and tap “Add to My Journey” on anything that catches your eye."
                : "Everything you've added, in one place — remove anything that doesn't belong, then request it or hand it to us to customize."}
            </p>
          </div>
          <ExploreModeToggle />
        </Container>
      </section>

      <section className="bg-sand py-10 sm:py-14">
        <Container>
          {isEmpty ? (
            <div className="mx-auto flex max-w-md flex-col items-center gap-5 rounded-3xl border border-gold/15 bg-cream p-10 text-center shadow-sm">
              <p className="text-sm text-ink-soft/70">Nothing added yet.</p>
              <Link
                href="/explore-egypt"
                className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition hover:bg-gold-dark"
              >
                Start Exploring Egypt
              </Link>
            </div>
          ) : (
            <div className="grid gap-10 lg:grid-cols-[minmax(0,380px)_1fr] lg:items-start">
              <div className="flex flex-col gap-6 lg:sticky lg:top-24">
                <div>
                  <h2 className="mb-3 font-display text-lg font-semibold text-ink">Your Route</h2>
                  <EgyptMap hubs={allHubs} routeSlugs={visitedHubs.map((h) => h.slug)} linkBase="/explore-egypt" />
                </div>

                <div className="rounded-2xl border border-gold/15 bg-cream p-5 shadow-sm">
                  <dl className="flex flex-col gap-3 text-sm">
                    <div className="flex items-center justify-between">
                      <dt className="text-ink-soft/60">Destinations</dt>
                      <dd className="font-semibold text-ink">{visitedHubs.length || "—"}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-ink-soft/60">Tours selected</dt>
                      <dd className="font-semibold text-ink">{details?.tours.length ?? 0}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-ink-soft/60">Experiences selected</dt>
                      <dd className="font-semibold text-ink">{details?.experiences.length ?? 0}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-ink-soft/60">Photoshoots selected</dt>
                      <dd className="font-semibold text-ink">{details?.photoshoots.length ?? 0}</dd>
                    </div>
                    {tripDays > 0 && (
                      <div className="flex items-center justify-between border-t border-black/5 pt-3">
                        <dt className="text-ink-soft/60">Estimated trip length</dt>
                        <dd className="font-semibold text-gold-dark">{tripDays}+ days</dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div className="flex flex-col gap-2.5">
                  <Link
                    href="/customize"
                    className="rounded-full border border-ink/15 px-5 py-3 text-center text-sm font-semibold text-ink transition hover:bg-ink hover:text-cream"
                  >
                    Customize My Trip
                  </Link>
                  <Link
                    href="/reserve"
                    className="rounded-full bg-ink px-5 py-3 text-center text-sm font-semibold text-cream transition hover:bg-gold-dark"
                  >
                    Request This Journey
                  </Link>
                </div>

                <div className="flex justify-center">
                  {confirmingClear ? (
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-ink-soft/60">Clear everything?</span>
                      <button
                        type="button"
                        onClick={() => {
                          clearJourneyItems();
                          setConfirmingClear(false);
                        }}
                        className="font-semibold text-terracotta hover:underline"
                      >
                        Yes, clear all
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingClear(false)}
                        className="font-semibold text-ink-soft/60 hover:text-ink"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmingClear(true)}
                      className="text-xs font-semibold text-ink-soft/50 transition hover:text-terracotta"
                    >
                      Clear all selections
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-10">
                {items.length > 0 && status === "idle" && (
                  <p className="text-sm text-ink-soft/60">Loading your journey…</p>
                )}
                {status === "error" && (
                  <p className="text-sm text-terracotta">
                    Couldn&rsquo;t load the latest details for your journey — your selections are still saved.
                  </p>
                )}

                {visitedHubs.length > 0 && (
                  <div>
                    <h3 className="mb-4 font-display text-lg font-semibold text-ink">
                      Destinations <span className="text-sm font-sans font-normal text-ink-soft/50">({visitedHubs.length})</span>
                    </h3>
                    <div className="grid gap-5 sm:grid-cols-2">
                      {visitedHubs.map((hub) => (
                        <div
                          key={hub.slug}
                          className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-black/5 bg-cream p-3 shadow-sm"
                        >
                          <SmartImage image={hub.image} tone={hub.imageTone} alt={hub.name} className="h-16 w-16 shrink-0 rounded-xl" />
                          <div className="min-w-0 flex-1">
                            <Link href={`/explore-egypt/${hub.slug}`} className="font-display text-sm font-semibold text-ink hover:text-gold-dark">
                              {hub.name}
                            </Link>
                            <p className="truncate text-xs text-ink-soft/60">{hub.tagline}</p>
                          </div>
                          {details?.destinations.some((d) => d.slug === hub.slug) ? (
                            <button
                              type="button"
                              onClick={() => removeJourneyItem("destination", hub.slug)}
                              aria-label={`Remove ${hub.name}`}
                              className="shrink-0 text-ink-soft/40 hover:text-terracotta"
                            >
                              ×
                            </button>
                          ) : (
                            <span className="shrink-0 text-[10px] uppercase tracking-wide text-ink-soft/40">via selection</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {details && details.tours.length > 0 && (
                  <div>
                    <h3 className="mb-4 font-display text-lg font-semibold text-ink">
                      Tours <span className="text-sm font-sans font-normal text-ink-soft/50">({details.tours.length})</span>
                    </h3>
                    <div className="grid gap-5 sm:grid-cols-2">
                      {details.tours.map((tour) => (
                        <div key={tour.slug} className="relative">
                          <button
                            type="button"
                            onClick={() => removeJourneyItem("tour", tour.slug)}
                            aria-label={`Remove ${tour.title} from My Journey`}
                            className="absolute right-3 top-3 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-ink/70 text-cream backdrop-blur-sm transition hover:bg-terracotta"
                          >
                            ×
                          </button>
                          <TourCard tour={tour} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {details && details.experiences.length > 0 && (
                  <div>
                    <h3 className="mb-4 font-display text-lg font-semibold text-ink">
                      Experiences <span className="text-sm font-sans font-normal text-ink-soft/50">({details.experiences.length})</span>
                    </h3>
                    <div className="grid gap-5 sm:grid-cols-2">
                      {details.experiences.map((experience) => (
                        <div key={experience.slug} className="relative">
                          <button
                            type="button"
                            onClick={() => removeJourneyItem("experience", experience.slug)}
                            aria-label={`Remove ${experience.title} from My Journey`}
                            className="absolute right-3 top-3 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-ink/70 text-cream backdrop-blur-sm transition hover:bg-terracotta"
                          >
                            ×
                          </button>
                          <ExperienceCard experience={experience} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {details && details.photoshoots.length > 0 && (
                  <div>
                    <h3 className="mb-4 font-display text-lg font-semibold text-ink">
                      Photoshoots <span className="text-sm font-sans font-normal text-ink-soft/50">({details.photoshoots.length})</span>
                    </h3>
                    <div className="grid gap-5 sm:grid-cols-2">
                      {details.photoshoots.map((photoshoot) => (
                        <div key={photoshoot.slug} className="relative">
                          <button
                            type="button"
                            onClick={() => removeJourneyItem("photoshoot", photoshoot.slug)}
                            aria-label={`Remove ${photoshoot.title} from My Journey`}
                            className="absolute right-3 top-3 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-ink/70 text-cream backdrop-blur-sm transition hover:bg-terracotta"
                          >
                            ×
                          </button>
                          <PhotoshootCard photoshoot={photoshoot} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </Container>
      </section>

      {!suggestionsDismissed && journeySuggestions.length > 0 && (
        <SuggestionToast
          label="Based on your journey — travelers also like"
          suggestions={journeySuggestions}
          onClose={() => setSuggestionsDismissed(true)}
        />
      )}
    </>
  );
}
