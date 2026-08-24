"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useJourneyItems } from "@/lib/journey";

// Segmented "EXPLORE EGYPT / MY JOURNEY" switch shown at the top of both
// /explore-egypt and /my-journey — the two modes the map feature is built
// around. Journey count comes live from localStorage via useJourneyItems().
export function ExploreModeToggle() {
  const pathname = usePathname();
  const journeyCount = useJourneyItems().length;
  const onJourney = pathname?.startsWith("/my-journey");

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-gold/25 bg-cream/90 p-1 shadow-sm shadow-black/5 backdrop-blur-sm">
      <Link
        href="/explore-egypt"
        className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition ${
          !onJourney ? "bg-ink text-cream" : "text-ink-soft hover:text-ink"
        }`}
      >
        Explore Egypt
      </Link>
      <Link
        href="/my-journey"
        className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition ${
          onJourney ? "bg-ink text-cream" : "text-ink-soft hover:text-ink"
        }`}
      >
        My Journey
        {journeyCount > 0 && (
          <span
            className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] normal-case ${
              onJourney ? "bg-gold text-ink" : "bg-gold-dark text-cream"
            }`}
          >
            {journeyCount}
          </span>
        )}
      </Link>
    </div>
  );
}
