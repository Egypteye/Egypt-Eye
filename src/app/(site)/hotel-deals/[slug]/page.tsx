import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { SmartImage } from "@/components/SmartImage";
import { RateRequestButton } from "../RateRequestButton";
import { getHotelBySlug, isRateExpired, type HotelRoom } from "@/lib/hotels";
import { resolveMetadata } from "@/content/seo";

function formatPrice(amount: number): string {
  return `$${amount.toLocaleString("en-US")}`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const hotel = await getHotelBySlug(slug);
  if (!hotel) return {};
  return resolveMetadata({
    title: `${hotel.name} — Egypt Eye Hotel Deals`,
    description: hotel.short_description,
    image: hotel.photos[0],
    path: `/hotel-deals/${hotel.slug}`,
  });
}

function RateTable({ room }: { room: HotelRoom }) {
  const rates = [...room.rates].sort((a, b) => a.display_order - b.display_order);
  return (
    <div className="overflow-hidden rounded-2xl border border-black/5">
      <table className="w-full text-left text-sm">
        <thead className="bg-sand-dim text-xs uppercase tracking-wide text-ink-soft/50">
          <tr>
            <th className="px-4 py-3">Occupancy</th>
            <th className="px-4 py-3">Meal Plan</th>
            <th className="px-4 py-3 text-right">Rate / Night</th>
          </tr>
        </thead>
        <tbody>
          {rates.map((rate) => {
            const showPrice = !rate.contact_for_rate && rate.price_per_night != null && !isRateExpired(rate);
            return (
              <tr key={rate.id} className="border-t border-black/5">
                <td className="px-4 py-3 capitalize text-ink">{rate.occupancy}</td>
                <td className="px-4 py-3 text-ink-soft/70">{rate.meal_plan}</td>
                <td className="px-4 py-3 text-right font-semibold">
                  {showPrice ? (
                    <span className="text-ink">
                      {formatPrice(rate.price_per_night!)}
                      <span className="ml-1 text-xs font-normal text-ink-soft/50">/ night</span>
                    </span>
                  ) : (
                    <span className="text-ink-soft/60">Contact us for latest rate</span>
                  )}
                </td>
              </tr>
            );
          })}
          {rates.length === 0 && (
            <tr>
              <td colSpan={3} className="px-4 py-4 text-center text-ink-soft/50">
                Contact us for latest rate
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default async function HotelDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const hotel = await getHotelBySlug(slug);
  if (!hotel) notFound();

  const rooms = [...hotel.rooms].sort((a, b) => a.display_order - b.display_order);

  return (
    <>
      <section className="relative">
        <SmartImage image={hotel.photos[0]} tone="nile" alt={hotel.name} className="absolute inset-0" priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/15" />
        <Container className="relative flex min-h-[46vh] flex-col justify-end gap-3 pb-14 pt-32">
          {hotel.deal_headline && (
            <span className="w-fit rounded-full bg-gold px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink">
              {hotel.deal_headline}
            </span>
          )}
          <h1 className="max-w-2xl font-display text-4xl font-semibold text-cream sm:text-5xl">{hotel.name}</h1>
          <p className="text-[15px] text-cream/80">{hotel.location}</p>
        </Container>
      </section>

      {hotel.photos.length > 1 && (
        <section className="py-8">
          <Container>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {hotel.photos.slice(1, 5).map((photo, i) => (
                <SmartImage key={i} image={photo} tone="nile" alt={`${hotel.name} photo ${i + 2}`} className="aspect-[4/3] rounded-xl" />
              ))}
            </div>
          </Container>
        </section>
      )}

      <section className="py-10">
        <Container className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <SectionHeading eyebrow="About This Hotel" title={hotel.name} />
            <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-ink-soft/80">
              {hotel.full_description || hotel.short_description}
            </p>

            {hotel.amenities.length > 0 && (
              <div className="mt-8">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft/50">Amenities</p>
                <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {hotel.amenities.map((a) => (
                    <li key={a} className="flex items-center gap-2 text-sm text-ink-soft/80">
                      <span aria-hidden="true" className="text-gold-dark">
                        ✓
                      </span>
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {hotel.child_family_policy && (
              <div className="mt-8 rounded-2xl bg-sand-dim p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft/50">Child &amp; Family Policy</p>
                <p className="mt-2 text-sm text-ink-soft/80">{hotel.child_family_policy}</p>
              </div>
            )}

            {hotel.special_notes && (
              <div className="mt-4 rounded-2xl border border-gold/20 bg-gold/5 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gold-dark">Special Notes</p>
                <p className="mt-2 text-sm text-ink-soft/80">{hotel.special_notes}</p>
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-gold/15 bg-cream p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft/50">Egypt Eye Deal</p>
              <p className="mt-2 text-sm text-ink-soft/70">
                {hotel.deal_description || "Ask us about our current rate for this hotel."}
              </p>
              <RateRequestButton
                hotelId={hotel.id}
                hotelName={hotel.name}
                rooms={rooms.map((r) => ({ id: r.id, name: r.name }))}
                className="mt-5 w-full"
              />
              <p className="mt-3 text-xs text-ink-soft/50">
                Hotel rates are subject to change based on travel dates, availability, seasonality, and hotel
                conditions. Send an enquiry to confirm the latest available rate.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-sand-dim py-16">
        <Container>
          <SectionHeading
            eyebrow="Rooms &amp; Rates"
            title="Room Types &amp; Indicative Rates"
            description="Rates shown are indicative, not guaranteed. Hotel rates are subject to change based on travel dates, availability, seasonality, and hotel conditions — send an enquiry to confirm the latest available rate."
          />
          <div className="mt-10 flex flex-col gap-8">
            {rooms.map((room) => (
              <div key={room.id} className="rounded-2xl bg-cream p-6 shadow-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-display text-lg font-semibold text-ink">
                    {room.name}
                    {room.room_category === "suite" && (
                      <span className="ml-2 rounded-full bg-gold/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold-dark">
                        Suite
                      </span>
                    )}
                  </h3>
                  <p className="text-xs uppercase tracking-wide text-ink-soft/50">
                    {room.view ? `${room.view} · ` : ""}
                    Up to {room.max_occupancy} guests
                  </p>
                </div>
                {room.description && <p className="mt-2 text-sm text-ink-soft/70">{room.description}</p>}
                <div className="mt-4">
                  <RateTable room={room} />
                </div>
              </div>
            ))}
            {rooms.length === 0 && (
              <p className="text-center text-sm text-ink-soft/60">Room details coming soon — contact us for current rates.</p>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}
