import { getCatalogStats, getOverallRating } from "@/content/aggregate";
import type { Experience, Photoshoot, Tour } from "@/content/types";

const badges = [
  {
    icon: "shield",
    title: "Private, Not Pooled",
    body: "Every tour is your own vehicle and guide — we never merge bookings into larger group tours.",
  },
  {
    icon: "coin",
    title: "One Price, Nothing Added Later",
    body: "Once your tour is confirmed, the price is guaranteed. No surprise add-ons, no shop-stop detours.",
  },
  {
    icon: "chat",
    title: "A Real Reply, Fast",
    body: "Message us on WhatsApp and hear back from an actual person — not a bot — usually within hours.",
  },
];

const icons: Record<string, React.ReactNode> = {
  shield: (
    <path d="M12 2 4 5v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V5l-8-3Zm-1.2 13.6L7 11.8l1.4-1.4 2.4 2.4L15.6 8l1.4 1.4-6.2 6.2Z" />
  ),
  coin: (
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15v1h-2v-1.05c-1.6-.25-2.7-1.2-2.85-2.6h1.85c.1.6.65 1 1.5 1 .8 0 1.4-.35 1.4-.95 0-.55-.45-.8-1.65-1.1-1.6-.4-2.85-.95-2.85-2.5 0-1.2 1-2.1 2.6-2.35V6h2v1.05c1.4.25 2.4 1.1 2.55 2.4H13.7c-.1-.5-.55-.85-1.25-.85-.7 0-1.2.3-1.2.8 0 .5.5.7 1.65 1 1.75.4 2.9 1 2.9 2.6 0 1.3-1 2.2-2.85 2.5Z" />
  ),
  chat: (
    <path d="M4 4h16v12H7l-3 3V4Zm3 4h10v2H7V8Zm0 3h7v2H7v-2Z" />
  ),
};

export function TrustBar({
  tours,
  experiences,
  photoshoots,
}: {
  tours: Tour[];
  experiences: Experience[];
  photoshoots: Photoshoot[];
}) {
  const { average, reviewCount } = getOverallRating(tours, experiences, photoshoots);
  const catalogStats = getCatalogStats(tours, experiences, photoshoots);

  return (
    <div className="grid gap-px overflow-hidden rounded-2xl bg-black/5 sm:grid-cols-3">
      {badges.map((b) => (
        <div key={b.title} className="flex gap-4 bg-cream p-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold-dark">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
              {icons[b.icon]}
            </svg>
          </span>
          <div>
            <p className="font-semibold text-ink">{b.title}</p>
            <p className="mt-1 text-sm text-ink-soft/70">{b.body}</p>
          </div>
        </div>
      ))}
      <div className="flex items-center justify-center gap-8 bg-ink p-6 text-cream sm:col-span-3">
        <Stat value={`${average}★`} label={`${reviewCount} reviews`} />
        <Stat value={String(catalogStats.tourCount)} label="Private Tours" />
        <Stat value={String(catalogStats.destinationCount)} label="Destinations" />
        <Stat value={`${catalogStats.experienceCount + catalogStats.photoshootCount}`} label="Add-On Experiences" />
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="font-display text-2xl font-semibold text-gold-light">{value}</p>
      <p className="text-xs uppercase tracking-wide text-cream/60">{label}</p>
    </div>
  );
}
