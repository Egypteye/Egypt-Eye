import Link from "next/link";
import { requireOsStaff } from "@/lib/auth/session";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { getDaySheet, getUpcomingCounts } from "@/lib/os/data";
import { addDays, formatDate, todayInCairo } from "@/lib/os/model";
import { DaySheet } from "./DaySheet";
import { WeekStrip } from "./WeekStrip";

// The first screen of the morning: everything happening today.
//
// Deliberately the landing page rather than a dashboard of numbers. The
// question this tool exists to answer is "who am I collecting, from where, at
// what time" — and the answer should need no clicks.

export const dynamic = "force-dynamic";
export const metadata = { title: "Today — Egypt Eye OS", robots: { index: false, follow: false } };

const WEEK_SPAN = 14;

export default async function OsTodayPage() {
  const user = await requireOsStaff();
  const today = todayInCairo();

  if (!supabaseAdminConfigured) {
    return (
      <div>
        <h1 className="text-xl font-bold text-ink">Today — {formatDate(today)}</h1>
      </div>
    );
  }

  const [rows, counts] = await Promise.all([getDaySheet(today), getUpcomingCounts(today, WEEK_SPAN)]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-xl font-bold text-ink">Today — {formatDate(today)}</h1>
        <Link
          href={`/os/day/${addDays(today, 1)}`}
          className="text-sm font-semibold text-gold-dark underline"
        >
          Tomorrow →
        </Link>
      </div>

      <WeekStrip from={today} span={WEEK_SPAN} counts={counts} today={today} />

      <DaySheet rows={rows} role={user.role} />
    </div>
  );
}
