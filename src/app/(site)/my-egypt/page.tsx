import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { EgyptMap } from "@/components/EgyptMap";
import { getCurrentUser } from "@/lib/auth/session";
import { getActiveReservation, getTripPhase } from "@/lib/myEgypt";
import { hydrateJourneyRefs } from "@/lib/journeyHydrate";
import { matchHubsForItems } from "@/lib/destinationMatch";
import { getDestinationHubs, getExperiences, getPhotoshoots, getSiteSettings } from "@/sanity/fetchers";
import { CountdownBanner } from "./CountdownBanner";
import { PackingChecklist } from "./PackingChecklist";
import { AddExperienceButton } from "./AddExperienceButton";
import { ConciergeWidget } from "./ConciergeWidget";

export const metadata: Metadata = {
  title: "My Egypt",
  robots: { index: false, follow: true },
};

type ItineraryItem = { time?: string; title: string; location?: string; notes?: string };
type ItineraryDay = { day: number; date?: string; title: string; items: ItineraryItem[] };
type Hotel = { name: string; checkIn?: string; checkOut?: string; address?: string; confirmationNumber?: string };
type Transfer = { date?: string; time?: string; from: string; to: string; driverName?: string; driverPhone?: string };
type Guide = { name: string; phone?: string; languages?: string };
type Document = { label: string; url: string };

export default async function MyEgyptPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/account/login?next=/my-egypt");

  const reservation = await getActiveReservation(user.id);
  if (!reservation) {
    return (
      <section className="bg-sand py-24">
        <Container className="mx-auto max-w-lg text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-dark">My Egypt</p>
          <h1 className="mt-3 font-display text-3xl font-semibold text-ink">Your private travel dashboard</h1>
          <p className="mt-4 text-ink-soft/70">
            My Egypt unlocks once one of your reservations is confirmed by our team — your countdown, itinerary,
            hotels, and everything else will live here.
          </p>
          <Link href="/account" className="mt-8 inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition hover:bg-gold-dark">
            View My Account
          </Link>
        </Container>
      </section>
    );
  }

  const [hydrated, allHubs, allExperiences, allPhotoshoots, site] = await Promise.all([
    hydrateJourneyRefs(reservation.journey_snapshot.map((i) => ({ type: i.type as "tour" | "experience" | "photoshoot" | "destination", slug: i.slug }))),
    getDestinationHubs(),
    getExperiences(),
    getPhotoshoots(),
    getSiteSettings(),
  ]);

  const visitedHubs = matchHubsForItems(allHubs, hydrated);
  const phase = getTripPhase(reservation);

  const alreadyIncluded = new Set(reservation.journey_snapshot.map((i) => i.slug));
  const suggestedExperiences = allExperiences
    .filter((e) => !alreadyIncluded.has(e.slug))
    .filter((e) => (e.destinations ?? []).some((tag) => visitedHubs.some((h) => h.matchNames.includes(tag))))
    .slice(0, 4);
  const suggestedPhotoshoots = allPhotoshoots
    .filter((p) => !alreadyIncluded.has(p.slug))
    .filter((p) => (p.destinations ?? []).some((tag) => visitedHubs.some((h) => h.matchNames.includes(tag))))
    .slice(0, 2);

  const itinerary = reservation.itinerary as ItineraryDay[];
  const hotels = reservation.hotels as Hotel[];
  const transfers = reservation.transfers as Transfer[];
  const guides = reservation.guides as Guide[];
  const documents = reservation.documents as Document[];

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayItinerary = phase === "in_trip" ? itinerary.find((d) => d.date === todayStr) : undefined;

  return (
    <>
      <section className="relative overflow-hidden bg-ink pb-12 pt-28 sm:pb-16 sm:pt-32">
        <div className="bg-star-field animate-drift-stars absolute inset-0 opacity-30" aria-hidden="true" />
        <Container className="relative">
          <CountdownBanner tripStartDate={reservation.trip_start_date} tripEndDate={reservation.trip_end_date} />
          <p className="mt-4 text-center text-xs font-medium uppercase tracking-widest text-cream/50">
            Reference {reservation.reference} · {reservation.travelers_adults} adult
            {reservation.travelers_adults === 1 ? "" : "s"}
            {reservation.travelers_children > 0 ? `, ${reservation.travelers_children} child${reservation.travelers_children === 1 ? "" : "ren"}` : ""}
          </p>
        </Container>
      </section>

      <section className="bg-sand py-12 sm:py-16">
        <Container className="mx-auto flex max-w-3xl flex-col gap-10">
          {todayItinerary && (
            <div className="rounded-3xl border border-gold/30 bg-cream p-6 shadow-xl shadow-black/5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark">Today</p>
              <h2 className="mt-1 font-display text-xl font-semibold text-ink">{todayItinerary.title}</h2>
              <ul className="mt-4 flex flex-col gap-3">
                {todayItinerary.items.map((item, i) => (
                  <li key={i} className="rounded-xl bg-sand-dim p-4 text-sm">
                    {item.time && <p className="font-semibold text-gold-dark">{item.time}</p>}
                    <p className="font-medium text-ink">{item.title}</p>
                    {item.location && <p className="text-ink-soft/60">{item.location}</p>}
                    {item.notes && <p className="mt-1 text-ink-soft/60">{item.notes}</p>}
                  </li>
                ))}
              </ul>
              <a
                href={site.contact.whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block text-sm font-semibold text-gold-dark underline"
              >
                Need help? Talk to Egypt Eye
              </a>
            </div>
          )}

          {visitedHubs.length > 0 && (
            <div>
              <h2 className="mb-4 font-display text-lg font-semibold text-ink">Your Destinations</h2>
              <EgyptMap hubs={allHubs} routeSlugs={visitedHubs.map((h) => h.slug)} linkBase="/explore-egypt" />
            </div>
          )}

          <div>
            <h2 className="mb-4 font-display text-lg font-semibold text-ink">Your Itinerary</h2>
            {itinerary.length === 0 ? (
              <p className="rounded-2xl border border-black/5 bg-cream p-6 text-sm text-ink-soft/60">
                Your day-by-day itinerary will appear here once our team finalizes it.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {itinerary.map((day) => (
                  <details key={day.day} className="group rounded-2xl border border-black/5 bg-cream p-5 open:shadow-sm">
                    <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-ink">
                      <span>
                        Day {day.day}: {day.title}
                      </span>
                      <span className="text-ink-soft/40 transition group-open:rotate-180">▾</span>
                    </summary>
                    <ul className="mt-4 flex flex-col gap-3 border-t border-black/5 pt-4">
                      {day.items.map((item, i) => (
                        <li key={i} className="text-sm">
                          {item.time && <span className="font-semibold text-gold-dark">{item.time} — </span>}
                          <span className="text-ink">{item.title}</span>
                          {item.location && <span className="text-ink-soft/60"> · {item.location}</span>}
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <InfoCard title="Hotels">
              {hotels.length === 0 ? (
                <EmptyNote text="Hotel details will appear here once confirmed." />
              ) : (
                hotels.map((h, i) => (
                  <div key={i} className="text-sm">
                    <p className="font-semibold text-ink">{h.name}</p>
                    {(h.checkIn || h.checkOut) && (
                      <p className="text-ink-soft/60">
                        {h.checkIn && new Date(h.checkIn).toLocaleDateString()}
                        {h.checkOut && ` – ${new Date(h.checkOut).toLocaleDateString()}`}
                      </p>
                    )}
                    {h.address && <p className="text-ink-soft/60">{h.address}</p>}
                    {h.confirmationNumber && <p className="text-ink-soft/50">Confirmation: {h.confirmationNumber}</p>}
                  </div>
                ))
              )}
            </InfoCard>

            <InfoCard title="Transfers">
              {transfers.length === 0 ? (
                <EmptyNote text="Transfer details will appear here once confirmed." />
              ) : (
                transfers.map((t, i) => (
                  <div key={i} className="text-sm">
                    <p className="font-semibold text-ink">
                      {t.from} → {t.to}
                    </p>
                    <p className="text-ink-soft/60">
                      {t.date && new Date(t.date).toLocaleDateString()} {t.time}
                    </p>
                    {t.driverName && <p className="text-ink-soft/50">Driver: {t.driverName}{t.driverPhone ? ` · ${t.driverPhone}` : ""}</p>}
                  </div>
                ))
              )}
            </InfoCard>

            <InfoCard title="Your Guides">
              {guides.length === 0 ? (
                <EmptyNote text="Guide information will appear here once assigned." />
              ) : (
                guides.map((g, i) => (
                  <div key={i} className="text-sm">
                    <p className="font-semibold text-ink">{g.name}</p>
                    {g.phone && <p className="text-ink-soft/60">{g.phone}</p>}
                    {g.languages && <p className="text-ink-soft/50">{g.languages}</p>}
                  </div>
                ))
              )}
            </InfoCard>

            <InfoCard title="Documents">
              {documents.length === 0 ? (
                <EmptyNote text="Vouchers and documents will appear here as they're ready." />
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {documents.map((d, i) => (
                    <li key={i}>
                      <a href={d.url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-gold-dark underline">
                        {d.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </InfoCard>
          </div>

          <InfoCard title="Packing Checklist">
            <PackingChecklist reservationId={reservation.id} />
          </InfoCard>

          {(suggestedExperiences.length > 0 || suggestedPhotoshoots.length > 0) && (
            <div>
              <h2 className="mb-1 font-display text-lg font-semibold text-ink">Make Your Journey Even More Yours</h2>
              <p className="mb-4 text-sm text-ink-soft/60">Based on your destinations — request an addition and we&rsquo;ll follow up.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {[...suggestedExperiences, ...suggestedPhotoshoots].map((item) => (
                  <div key={item.slug} className="flex items-center justify-between gap-3 rounded-2xl border border-black/5 bg-cream p-4 shadow-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{item.title}</p>
                      <p className="text-xs text-ink-soft/50">{item.duration}</p>
                    </div>
                    <AddExperienceButton reservationId={reservation.id} slug={item.slug} title={item.title} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="mb-1 font-display text-lg font-semibold text-ink">Ask Egypt Eye</h2>
            <p className="mb-4 text-sm text-ink-soft/60">Your private concierge — grounded in your actual trip details.</p>
            <ConciergeWidget reservationId={reservation.id} whatsappLink={site.contact.whatsappLink} />
          </div>

          <InfoCard title="Important Contacts">
            <div className="flex flex-col gap-2 text-sm">
              <a href={site.contact.whatsappLink} target="_blank" rel="noreferrer" className="font-semibold text-gold-dark underline">
                WhatsApp Egypt Eye — {site.contact.whatsapp}
              </a>
              <a href={`mailto:${site.contact.email}`} className="text-ink-soft/70 hover:text-ink">
                {site.contact.email}
              </a>
              <p className="text-ink-soft/50">Urgent (while traveling): {site.contact.urgentBooking}</p>
            </div>
          </InfoCard>
        </Container>
      </section>
    </>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-cream p-5 shadow-sm">
      <h3 className="mb-3 font-display text-base font-semibold text-ink">{title}</h3>
      {children}
    </div>
  );
}

function EmptyNote({ text }: { text: string }) {
  return <p className="text-sm text-ink-soft/50">{text}</p>;
}
