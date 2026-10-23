import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOsStaff } from "@/lib/auth/session";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { getDaySheet, getUpcomingCounts } from "@/lib/os/data";
import { addDays, formatDate, isIsoDate, todayInCairo } from "@/lib/os/model";
import { DaySheet } from "../../DaySheet";
import { WeekStrip } from "../../WeekStrip";

// Any single date's sheet. Same screen as Today, reached from the date strip.

export const dynamic = "force-dynamic";
export const metadata = { title: "Day sheet — Egypt Eye OS", robots: { index: false, follow: false } };

const WEEK_SPAN = 14;

export default async function OsDayPage({ params }: { params: Promise<{ date: string }> }) {
  const user = await requireOsStaff();
  const { date } = await params;

  // Validated rather than passed through: an unparseable date would otherwise
  // reach Postgres as a cast error and surface as a 500 on a URL a person can
  // type by hand.
  if (!isIsoDate(date)) notFound();

  const today = todayInCairo();

  if (!supabaseAdminConfigured) {
    return <h1 className="text-xl font-bold text-ink">{formatDate(date)}</h1>;
  }

  // The strip is centred a few days back so the days just gone are still
  // reachable — a photo link or a collected balance often lands after the day.
  const stripFrom = addDays(date, -3);
  const [rows, counts] = await Promise.all([getDaySheet(date), getUpcomingCounts(stripFrom, WEEK_SPAN)]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-xl font-bold text-ink">{formatDate(date)}</h1>
        <div className="flex gap-4 text-sm font-semibold">
          <Link href={`/os/day/${addDays(date, -1)}`} className="text-gold-dark underline">
            ← Previous
          </Link>
          {date !== today ? (
            <Link href="/os" className="text-gold-dark underline">
              Today
            </Link>
          ) : null}
          <Link href={`/os/day/${addDays(date, 1)}`} className="text-gold-dark underline">
            Next →
          </Link>
        </div>
      </div>

      <WeekStrip from={stripFrom} span={WEEK_SPAN} counts={counts} today={today} />

      <DaySheet rows={rows} role={user.role} />
    </div>
  );
}
