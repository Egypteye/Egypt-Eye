import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale } from "@/i18n/dictionary";
import { localePath } from "@/i18n/locales";
import { trAll } from "@/i18n/T";
import { Container } from "@/components/Container";
import { SmartImage } from "@/components/SmartImage";
import { Badge } from "@/components/Badge";
import { FaqAccordion } from "@/components/FaqAccordion";
import { TourCard } from "@/components/TourCard";
import { TripDepartures } from "@/components/TripDepartures";
import { PhysicalLevelBar } from "@/components/PhysicalLevelBar";
import { weeklyTrips, weeklyTripBySlug, weeklyTripCategoryLabels } from "@/content/weeklyTrips";
import { getDeparturesForTrip } from "@/lib/departures";
import { getTours } from "@/sanity/fetchers";
import {
  breadcrumbJsonLd,
  faqJsonLd,
  resolveMetadata,
  touristTripJsonLd,
  tripDepartureEventJsonLd,
} from "@/content/seo";
import { site } from "@/content/site";

// Same 60-second window as the hub: the seat counts on this page are the
// reason to visit it, and /api/trip-seats re-checks them under a lock anyway.
export const revalidate = 60;

export function generateStaticParams() {
  return weeklyTrips.map((trip) => ({ slug: trip.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const trip = weeklyTripBySlug(slug);
  if (!trip) return {};
  const locale = await getLocale();
  return resolveMetadata({
    title: trip.title,
    description: trip.tagline,
    seo: trip.seo,
    image: trip.image,
    path: `/weekly-trips/${trip.slug}`,
    locale,
  });
}

export default async function WeeklyTripPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const trip = weeklyTripBySlug(slug);
  if (!trip) notFound();

  const ui = await trAll([
    "Weekly Trips",
    "Breadcrumb",
    "Departs from",
    "Season",
    "Group size",
    "What's included",
    "Not included",
    "Bring with you",
    "How the day runs",
    "Highlights",
    "Questions",
    "Dates & Seats",
    "Pair it with",
    "Prefer this privately?",
    "We run every Weekly Trip as a private trip too — your own vehicle, your own date.",
    "Plan a private version",
  ]);

  const locale = await getLocale();
  const [departures, allTours] = await Promise.all([getDeparturesForTrip(trip.slug), getTours()]);

  const relatedTours = (trip.relatedTourSlugs ?? [])
    .map((s) => allTours.find((t) => t.slug === s))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  const breadcrumbs = breadcrumbJsonLd([
    { name: "Weekly Trips", path: "/weekly-trips" },
    { name: trip.title, path: `/weekly-trips/${trip.slug}` },
  ]);

  // TouristTrip describes the repeatable experience; one Event per departure
  // describes each dated, ticketed occurrence of it. They model different
  // things and are both correct on this page — see content/seo.ts.
  const touristTrip = touristTripJsonLd({
    name: trip.title,
    description: trip.tagline,
    image: trip.image,
    path: `/weekly-trips/${trip.slug}`,
  });

  const events = departures.map((d) =>
    tripDepartureEventJsonLd({
      tripTitle: trip.title,
      tripDescription: trip.tagline,
      tripPath: `/weekly-trips/${trip.slug}`,
      image: trip.image,
      departsOn: d.departsOn,
      returnsOn: d.returnsOn,
      priceUsd: d.priceUsd,
      seatsLeft: d.seatsLeft,
      capacity: d.capacity,
      state: d.state,
      departsFrom: trip.departsFrom,
    })
  );

  const faqSchema = trip.faqs && trip.faqs.length > 0 ? faqJsonLd(trip.faqs) : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(touristTrip) }} />
      {events.map((event, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(event) }} />
      ))}
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}

      <section className="relative">
        <SmartImage
          image={trip.image}
          tone={trip.imageTone}
          alt={trip.title}
          className="absolute inset-0"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/20" />
        <Container className="relative flex min-h-[52vh] flex-col justify-end gap-4 pb-14 pt-32">
          <nav aria-label={ui["Breadcrumb"]} className="flex items-center gap-1.5 text-xs font-medium text-cream/60">
            <Link href={localePath("/weekly-trips", locale)} className="transition hover:text-gold-light">
              {ui["Weekly Trips"]}
            </Link>
            <span aria-hidden>/</span>
            <span className="text-cream/80">{trip.title}</span>
          </nav>
          <div className="flex flex-wrap gap-2">
            <Badge>{weeklyTripCategoryLabels[trip.category]}</Badge>
            <Badge>{trip.duration}</Badge>
          </div>
          <h1 className="max-w-3xl font-display text-4xl font-semibold text-cream sm:text-5xl">{trip.title}</h1>
          <p className="max-w-2xl text-lg text-cream/80">{trip.tagline}</p>
        </Container>
      </section>

      {/* The facts a seat buyer checks before anything else. */}
      <section className="border-b border-black/5 bg-sand/50">
        <Container>
          <dl className="grid gap-4 py-6 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft/85">
                {ui["Departs from"]}
              </dt>
              <dd className="mt-1 font-medium text-ink">{trip.departsFrom}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft/85">
                {ui["Group size"]}
              </dt>
              <dd className="mt-1 font-medium text-ink">
                {departures[0] ? `Up to ${departures[0].capacity} travellers` : (trip.typicalGroupSize ?? "—")}
              </dd>
            </div>
            {trip.season && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft/85">
                  {ui["Season"]}
                </dt>
                <dd className="mt-1 font-medium text-ink">{trip.season}</dd>
              </div>
            )}
          </dl>
        </Container>
      </section>

      {/* Dates first. Everything below is the detail someone reads once they
          have found a date that works — putting the description above it would
          bury the only thing this product exists to show. */}
      <section id="dates" className="scroll-mt-24 py-14">
        <Container>
          <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">{ui["Dates & Seats"]}</h2>
          <div className="mt-6">
            <TripDepartures
              departures={departures}
              tripTitle={trip.title}
              whatsappLink={site.contact.whatsappLink}
            />
          </div>
        </Container>
      </section>

      <section className="border-t border-black/5 py-14">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="text-lg leading-relaxed text-ink-soft/85">{trip.description}</p>

              <h2 className="mt-10 font-display text-2xl font-semibold text-ink">{ui["Highlights"]}</h2>
              <ul className="mt-4 space-y-2.5">
                {trip.highlights.map((h) => (
                  <li key={h} className="flex gap-3 text-ink-soft">
                    <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>

              {trip.plan && trip.plan.length > 0 && (
                <>
                  <h2 className="mt-10 font-display text-2xl font-semibold text-ink">{ui["How the day runs"]}</h2>
                  <ol className="mt-4 space-y-4 border-l border-black/10 pl-5">
                    {trip.plan.map((step) => (
                      <li key={step.title} className="relative">
                        <span
                          aria-hidden
                          className="absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-cream bg-gold"
                        />
                        <h3 className="font-semibold text-ink">{step.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-ink-soft">{step.description}</p>
                      </li>
                    ))}
                  </ol>
                </>
              )}

              {trip.physicalLevel && (
                <div className="mt-10">
                  <PhysicalLevelBar level={trip.physicalLevel} />
                </div>
              )}
            </div>

            <aside className="space-y-6">
              <div className="rounded-2xl border border-black/5 bg-cream p-5">
                <h3 className="font-display text-lg font-semibold text-ink">{ui["What's included"]}</h3>
                <ul className="mt-3 space-y-2">
                  {trip.included.map((item) => (
                    <li key={item} className="flex gap-2.5 text-sm text-ink-soft">
                      <span aria-hidden className="mt-0.5 text-emerald-700">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                {trip.excluded.length > 0 && (
                  <>
                    <h3 className="mt-5 font-display text-base font-semibold text-ink">{ui["Not included"]}</h3>
                    <ul className="mt-2 space-y-1.5">
                      {trip.excluded.map((item) => (
                        <li key={item} className="flex gap-2.5 text-sm text-ink-soft/85">
                          <span aria-hidden className="mt-0.5">—</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              {trip.bringWithYou && trip.bringWithYou.length > 0 && (
                <div className="rounded-2xl border border-gold/25 bg-gold/5 p-5">
                  <h3 className="font-display text-lg font-semibold text-ink">{ui["Bring with you"]}</h3>
                  <ul className="mt-3 space-y-2">
                    {trip.bringWithYou.map((item) => (
                      <li key={item} className="text-sm leading-relaxed text-ink-soft">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          </div>
        </Container>
      </section>

      {trip.faqs && trip.faqs.length > 0 && (
        <section className="bg-sand/40 py-14">
          <Container>
            <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">{ui["Questions"]}</h2>
            <div className="mt-6 max-w-3xl">
              <FaqAccordion faqs={trip.faqs} />
            </div>
          </Container>
        </section>
      )}

      {relatedTours.length > 0 && (
        <section className="py-14">
          <Container>
            <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">{ui["Pair it with"]}</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedTours.map((tour) => (
                <TourCard key={tour.slug} tour={tour} />
              ))}
            </div>
          </Container>
        </section>
      )}

      <section className="pb-16">
        <Container>
          <div className="rounded-3xl bg-ink px-6 py-10 text-center sm:px-12">
            <h2 className="font-display text-2xl font-semibold text-cream">{ui["Prefer this privately?"]}</h2>
            <p className="mx-auto mt-3 max-w-xl text-cream/75">
              {ui["We run every Weekly Trip as a private trip too — your own vehicle, your own date."]}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href={localePath("/customize", locale)}
                className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink transition hover:bg-gold-light"
              >
                {ui["Plan a private version"]}
              </Link>
              <Link
                href={localePath("/weekly-trips", locale)}
                className="rounded-full border border-cream/25 px-6 py-3 text-sm font-semibold text-cream transition hover:border-gold"
              >
                {ui["Weekly Trips"]}
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
