import Link from "next/link";
import { SmartImage } from "@/components/SmartImage";
import type { Hotel } from "@/lib/hotels";

export function HotelCard({ hotel }: { hotel: Hotel }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-cream shadow-sm transition hover:shadow-lg hover:shadow-black/5">
      <SmartImage
        image={hotel.photos[0]}
        tone="nile"
        alt={hotel.name}
        label={hotel.location}
        className="h-52 w-full transition duration-500 group-hover:scale-105"
      />
      <div className="flex flex-1 flex-col gap-3 p-5">
        {hotel.deal_headline && (
          <span className="w-fit rounded-full bg-gold/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-gold-dark">
            {hotel.deal_headline}
          </span>
        )}
        <h3 className="font-display text-lg font-semibold leading-snug text-ink">{hotel.name}</h3>
        <p className="text-sm text-ink-soft/60">{hotel.location}</p>
        <p className="line-clamp-2 text-sm text-ink-soft/70">{hotel.short_description}</p>
        {hotel.highlights.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {hotel.highlights.slice(0, 3).map((h) => (
              <li key={h} className="rounded-full bg-sand-dim px-2.5 py-1 text-[11px] text-ink-soft/70">
                {h}
              </li>
            ))}
          </ul>
        )}
        <Link
          href={`/hotel-deals/${hotel.slug}`}
          className="mt-auto inline-flex items-center justify-center rounded-full bg-ink py-2.5 text-sm font-semibold text-cream transition hover:bg-gold-dark"
        >
          View Rates
        </Link>
      </div>
    </div>
  );
}
