import Link from "next/link";
import { addDays } from "@/lib/os/model";

// The fortnight ahead, as one row of dates with a count on each.
//
// This is the part of the operations spreadsheet that genuinely worked: the
// tabs along the bottom told you at a glance which days were busy. A strip of
// dates does the same job without anyone having to create a tab by hand.

const WEEKDAY = new Intl.DateTimeFormat("en-GB", { weekday: "narrow", timeZone: "UTC" });

function dayNumber(date: string): { weekday: string; day: number } {
  const [y, m, d] = date.split("-").map(Number);
  return { weekday: WEEKDAY.format(new Date(Date.UTC(y, m - 1, d))), day: d };
}

export function WeekStrip({
  from,
  span,
  counts,
  today,
}: {
  from: string;
  span: number;
  counts: Record<string, number>;
  today: string;
}) {
  const dates = Array.from({ length: span }, (_, i) => addDays(from, i));

  return (
    <div className="-mx-4 overflow-x-auto px-4">
      <div className="flex gap-1.5 pb-1">
        {dates.map((date) => {
          const { weekday, day } = dayNumber(date);
          const count = counts[date] ?? 0;
          const isToday = date === today;
          return (
            <Link
              key={date}
              href={isToday ? "/os" : `/os/day/${date}`}
              aria-current={isToday ? "page" : undefined}
              className={`flex w-14 shrink-0 flex-col items-center rounded-lg border px-1 py-2 transition ${
                isToday
                  ? "border-ink bg-ink text-cream"
                  : count > 0
                    ? "border-gold/40 bg-cream text-ink hover:border-gold"
                    : "border-black/10 bg-cream/60 text-ink-soft/60 hover:border-black/25"
              }`}
            >
              <span className="text-xs uppercase opacity-70">{weekday}</span>
              <span className="text-base font-bold tabular-nums">{day}</span>
              {/* An empty day shows a dash rather than a 0: a column of zeroes
                  reads as broken data, a dash reads as nothing booked. */}
              <span className="text-xs font-semibold">{count > 0 ? count : "–"}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
