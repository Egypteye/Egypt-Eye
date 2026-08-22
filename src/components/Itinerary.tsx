"use client";

import { useState } from "react";
import type { SignatureItineraryDay } from "@/content/types";
import { SmartImage } from "./SmartImage";

// A time-based, expandable day journey rather than a flat "Day 1 / Day 2"
// list — day selector tabs + an expandable vertical timeline per day, so
// the itinerary reads as a journey through a day, not a spreadsheet.
export function Itinerary({ days }: { days: SignatureItineraryDay[] }) {
  const [activeDay, setActiveDay] = useState(0);
  const [openItem, setOpenItem] = useState<number | null>(0);
  const day = days[activeDay];

  if (!day) return null;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {days.map((d, i) => (
          <button
            key={d.dayNumber}
            type="button"
            onClick={() => {
              setActiveDay(i);
              setOpenItem(0);
            }}
            className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${
              i === activeDay ? "bg-ink text-cream" : "bg-sand-dim text-ink-soft hover:bg-sand-deep"
            }`}
          >
            Day {d.dayNumber}
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.5fr]">
        {day.image && (
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <SmartImage
              image={day.image}
              tone="desert"
              alt={day.title}
              className="aspect-[4/3] w-full rounded-2xl"
            />
          </div>
        )}

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark">
            Day {day.dayNumber}
          </p>
          <h3 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">
            {day.title}
          </h3>
          {day.description && <p className="mt-3 text-ink-soft/75">{day.description}</p>}

          <ol className="mt-8 border-l border-gold/25 pl-6">
            {day.items.map((item, i) => {
              const isOpen = openItem === i;
              return (
                <li key={`${day.dayNumber}-${i}`} className="relative pb-8 last:pb-0">
                  <span className="absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-ink">
                    {i + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => setOpenItem(isOpen ? null : i)}
                    className="flex w-full flex-col items-start gap-1 text-left sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-x-2 text-xs font-semibold uppercase tracking-wide text-gold-dark">
                        {item.time && <span>{item.time}</span>}
                        {item.category && item.time && <span className="text-ink-soft/30">·</span>}
                        {item.category && (
                          <span className="normal-case tracking-normal text-ink-soft/55">{item.category}</span>
                        )}
                      </div>
                      <p className="mt-1 font-display text-lg font-semibold text-ink">{item.title}</p>
                    </div>
                    <span
                      className={`shrink-0 text-lg text-gold-dark transition-transform ${isOpen ? "rotate-45" : ""}`}
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="mt-3 space-y-2 text-sm leading-relaxed text-ink-soft/75">
                        {item.description && <p>{item.description}</p>}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft/55">
                          {item.duration && <span>⏱ {item.duration}</span>}
                          {item.location && <span>📍 {item.location}</span>}
                          {item.includedOrOptional === "optional" && (
                            <span className="font-semibold text-terracotta">Optional add-on</span>
                          )}
                        </div>
                        {item.notes && <p className="italic text-ink-soft/60">{item.notes}</p>}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
