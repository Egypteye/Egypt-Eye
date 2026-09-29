import type { Metadata } from "next";
import Link from "next/link";
import { alternatesFor } from "@/i18n/alternates";
import { getDictionary, getLocale } from "@/i18n/dictionary";
import { localePath } from "@/i18n/locales";
import { trAll } from "@/i18n/T";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { SmartImage } from "@/components/SmartImage";
import { FaqAccordion } from "@/components/FaqAccordion";
import { TripCard } from "@/components/TripCard";
import { WeeklyTripsCalendar } from "@/components/WeeklyTripsCalendar";
import { weeklyTrips, weeklyTripCategoryLabels } from "@/content/weeklyTrips";
import { getUpcomingDepartures } from "@/lib/departures";
import { fromPriceByTrip, nextDepartureByTrip } from "@/lib/departureModel";
import { breadcrumbJsonLd, tripDepartureEventJsonLd } from "@/content/seo";
import { site } from "@/content/site";

// Seat counts are the reason anyone loads this page, so it re-renders every
// minute rather than being baked at build time. A booking made in the last 60
// seconds may not be reflected yet, which is why /api/trip-seats re-checks
// availability under a row lock instead of trusting what the page displayed.
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary();
  const meta = dict.pages["/weekly-trips"];
  return {
    title: meta.title,
    description: meta.description,
    alternates: alternatesFor("/weekly-trips", locale),
  };
}

export default async function WeeklyTripsPage() {
  const ui = await trAll([
    "Weekly Trips",
    "Join a trip",
    "Upcoming Departures",
    "Every date we're running, soonest first.",
    "The Trips",
    "Six trips out of Cairo, run on fixed dates through the season.",
    "How It Works",
    "Good to Know",
    "Sunrise over the Western Desert",
    "Want the whole thing to yourself?",
    "Every one of these runs as a private trip too — your own vehicle, your own dates, nobody else along. That's most of what we do.",
    "Plan a private trip",
    "Browse private tours",
    "Airport & city transfers",
    "Add a photoshoot",
  ]);

  const locale = await getLocale();
  const departures = await getUpcomingDepartures();

  const fromPrices = fromPriceByTrip(departures);
  const nextByTrip = nextDepartureByTrip(departures);
  const countByTrip = new Map<string, number>();
  for (const d of departures) {
    if (d.bookable) countByTrip.set(d.trip.slug, (countByTrip.get(d.trip.slug) ?? 0) + 1);
  }

  const breadcrumbs = breadcrumbJsonLd([{ name: "Weekly Trips", path: "/weekly-trips" }]);

  // One Event per upcoming departure. This is what makes a dated trip
  // eligible to surface for "Wadi El Hitan trip in November" rather than only
  // for the evergreen trip name.
  const events = departures.map((d) =>
    tripDepartureEventJsonLd({
      tripTitle: d.trip.title,
      tripDescription: d.trip.tagline,
      tripPath: `/weekly-trips/${d.trip.slug}`,
      image: d.trip.image,
      departsOn: d.departsOn,
      returnsOn: d.returnsOn,
      priceUsd: d.priceUsd,
      seatsLeft: d.seatsLeft,
      capacity: d.capacity,
      state: d.state,
      departsFrom: d.trip.departsFrom,
    })
  );

  const steps = [
    {
      title: "Pick a date",
      body: "Every departure we've scheduled is on this page with its price and how many seats are left. No enquiry needed to find that out.",
    },
    {
      title: "Reserve your seat",
      body: "Name, email, how many of you. Your seats are held immediately — that's what drops the seat count everyone else sees.",
    },
    {
      title: "We confirm",
      body: "One of the team messages you to confirm your pickup point and arrange payment. Nothing is charged through this website.",
    },
    {
      title: "Turn up",
      body: "You travel with a small group of other travellers, an Egypt Eye vehicle and a guide who runs the route regularly.",
    },
  ];

  const faqs = [
    {
      question: "How is this different from your private tours?",
      answer:
        "Almost entirely. A private tour is your own vehicle, your own guide and any date you like, priced for the group. A Weekly Trip is a fixed date we've already scheduled, priced per seat, shared with other travellers up to a set cap. The trips here exist because travelling alone or as a pair on a private desert run is expensive, and sharing the vehicle is what makes these destinations affordable. If you'd rather have it to yourself, we run every one of these privately too.",
    },
    {
      question: "What happens if not enough people book?",
      answer:
        "Each departure has a minimum group size, and the page tells you how many more are needed before it's confirmed to run. If a trip doesn't reach it, we contact everyone booked, move you to another date or refund in full. You pay nothing for a trip that doesn't run.",
    },
    {
      question: "Are the seat counts real?",
      answer:
        "Yes. The number shown is the actual remaining capacity on that vehicle, and it drops the moment someone reserves. If two people reserve the last seats at the same time, only one booking succeeds — the other is offered the waitlist rather than quietly oversold.",
    },
    {
      question: "How do I pay?",
      answer:
        "Not through this site. Reserving holds your seat, then a member of the team contacts you to confirm details and arrange payment directly — the same way our private tours work.",
    },
    {
      question: "Can I book for a group of friends?",
      answer:
        "Up to ten seats in one booking, as long as that many are left. Beyond that you're most of a vehicle already, so message us and we'll usually run it privately for a similar price per person.",
    },
    {
      question: "What if a trip is sold out?",
      answer:
        "Join the waitlist on the trip's page. Nothing is held and nothing is owed, but if someone drops out we work down the list in order — and we'll tell you first when the next date for that trip goes up.",
    },
    {
      question: "Why isn't every trip running all year?",
      answer:
        "Because Egypt's seasons are real operating limits rather than a preference. The Western Desert is genuinely dangerous in high summer and we don't run it between May and September. Each trip states its own season, and Alexandria is the one we'd point you at in July.",
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      {events.map((event, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(event) }}
        />
      ))}

      <section className="relative">
        <SmartImage
          image={weeklyTrips[0]?.image}
          tone="desert"
          alt={ui["Sunrise over the Western Desert"]}
          className="absolute inset-0"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/15" />
        <Container className="relative flex min-h-[42vh] flex-col justify-end gap-3 pb-14 pt-32">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-light">{ui["Join a trip"]}</p>
          <h1 className="max-w-2xl font-display text-4xl font-semibold text-cream sm:text-5xl">
            {ui["Weekly Trips"]}
          </h1>
          <p className="max-w-xl text-lg text-cream/80">
            Fixed dates. Limited seats. Somewhere in Egypt worth the drive.
          </p>
        </Container>
      </section>

      {/* Answers the "what is this" question before the calendar, because the
          rest of the site says private-tours-only and this needs explaining. */}
      <section className="border-b border-black/5 bg-sand/50 py-12">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-lg leading-relaxed text-ink-soft/85">
              Most of what Egypt Eye does is private. Weekly Trips are the deliberate exception: a
              handful of destinations we run on <strong className="text-ink">set dates</strong>, where you
              buy a <strong className="text-ink">seat</strong> rather than the whole vehicle — and travel
              with a small group of other people doing the same. It makes the long desert runs affordable
              for one or two travellers, and it means you can look at a calendar and simply join something.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <SectionHeading
            eyebrow={ui["Upcoming Departures"]}
            title={ui["Upcoming Departures"]}
            description={ui["Every date we're running, soonest first."]}
          />
          <div className="mt-8">
            <WeeklyTripsCalendar departures={departures} categoryLabels={weeklyTripCategoryLabels} />
          </div>
        </Container>
      </section>

      <section className="bg-sand/40 py-16">
        <Container>
          <SectionHeading
            eyebrow={ui["The Trips"]}
            title={ui["The Trips"]}
            description={ui["Six trips out of Cairo, run on fixed dates through the season."]}
          />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {weeklyTrips.map((trip) => (
              <TripCard
                key={trip.slug}
                trip={trip}
                nextDeparture={nextByTrip.get(trip.slug)}
                fromPrice={fromPrices.get(trip.slug)}
                departureCount={countByTrip.get(trip.slug)}
              />
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <SectionHeading eyebrow={ui["How It Works"]} title={ui["How It Works"]} />
          <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <li key={step.title} className="rounded-2xl border border-black/5 bg-cream p-5 shadow-sm">
                <span className="font-display text-2xl font-semibold text-gold-dark">{i + 1}</span>
                <h3 className="mt-2 font-display text-lg font-semibold text-ink">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{step.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="bg-sand/40 py-16">
        <Container>
          <SectionHeading eyebrow={ui["Good to Know"]} title={ui["Good to Know"]} />
          <div className="mx-auto mt-8 max-w-3xl">
            <FaqAccordion faqs={faqs} />
          </div>
        </Container>
      </section>

      {/* The rest of the catalogue, so this section isn't a cul-de-sac. */}
      <section className="py-16">
        <Container>
          <div className="rounded-3xl bg-ink px-6 py-12 text-center sm:px-12">
            <h2 className="font-display text-2xl font-semibold text-cream sm:text-3xl">
              {ui["Want the whole thing to yourself?"]}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-cream/75">
              {ui["Every one of these runs as a private trip too — your own vehicle, your own dates, nobody else along. That's most of what we do."]}
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                href={localePath("/customize", locale)}
                className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink transition hover:bg-gold-light"
              >
                {ui["Plan a private trip"]}
              </Link>
              <Link
                href={localePath("/tours", locale)}
                className="rounded-full border border-cream/25 px-6 py-3 text-sm font-semibold text-cream transition hover:border-gold"
              >
                {ui["Browse private tours"]}
              </Link>
              <Link
                href={localePath("/transfers", locale)}
                className="rounded-full border border-cream/25 px-6 py-3 text-sm font-semibold text-cream transition hover:border-gold"
              >
                {ui["Airport & city transfers"]}
              </Link>
              <Link
                href={localePath("/photoshoots", locale)}
                className="rounded-full border border-cream/25 px-6 py-3 text-sm font-semibold text-cream transition hover:border-gold"
              >
                {ui["Add a photoshoot"]}
              </Link>
            </div>
            <p className="mt-6 text-sm text-cream/60">
              Questions about a date?{" "}
              <a href={site.contact.whatsappLink} target="_blank" rel="noopener noreferrer" className="underline">
                Message us on WhatsApp
              </a>
              .
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
