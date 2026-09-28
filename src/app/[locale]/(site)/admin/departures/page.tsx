import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { NotConfiguredNotice } from "../NotConfiguredNotice";
import { getPastDepartures, getUpcomingDepartures } from "@/lib/departures";
import { weeklyTrips } from "@/content/weeklyTrips";
import { formatDateRange } from "@/lib/departureModel";
import { CreateDepartureForm, DepartureActions } from "./DepartureForms";

export const metadata = { title: "Weekly Trip Departures", robots: { index: false, follow: false } };

// The operating screen for Weekly Trips: what's scheduled, how full it is,
// and whether it's going to run.
//
// The "needs N more" column is the one worth watching. A departure sitting
// below its minimum a week out is the signal to promote it or to cancel it
// early enough that travellers can rebook — which is the difference between
// this product being trustworthy and being a lottery.

const STATE_STYLES: Record<string, string> = {
  open: "bg-emerald-50 text-emerald-800",
  almost_full: "bg-amber-50 text-amber-900",
  sold_out: "bg-rose-50 text-rose-800",
  closed: "bg-black/5 text-ink-soft/70",
  departed: "bg-black/5 text-ink-soft/70",
  cancelled: "bg-rose-50 text-rose-800",
};

const STATE_LABELS: Record<string, string> = {
  open: "Open",
  almost_full: "Almost full",
  sold_out: "Sold out",
  closed: "Closed",
  departed: "Departed",
  cancelled: "Cancelled",
};

export default async function AdminDeparturesPage() {
  const user = await getCurrentUser();
  if (user?.role !== "admin") redirect("/admin/reservations");
  if (!supabaseAdminConfigured) return <NotConfiguredNotice />;

  const [upcoming, past] = await Promise.all([getUpcomingDepartures(200), getPastDepartures(12)]);

  // Departures that have already left but nobody has closed off. Left visible
  // rather than auto-completed, because "did that actually run" is a question
  // only the team can answer.
  const needsClosing = past.filter((d) => d.state === "departed");

  const belowMinimum = upcoming.filter((d) => d.state !== "cancelled" && !d.guaranteed);
  const totalSeatsSold = upcoming.reduce((n, d) => n + d.seatsTaken, 0);

  const stats = [
    { label: "Upcoming departures", value: upcoming.length },
    { label: "Seats sold on them", value: totalSeatsSold },
    { label: "Below minimum", value: belowMinimum.length },
    { label: "Waiting to be closed", value: needsClosing.length },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-ink">Weekly Trip Departures</h1>
        <Link href="/weekly-trips" className="text-sm font-medium text-gold-dark hover:underline">
          View the public page →
        </Link>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-black/5 bg-cream p-4 shadow-sm">
            <p className="text-2xl font-bold text-ink">{s.value}</p>
            <p className="mt-0.5 text-sm text-ink-soft/70">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <CreateDepartureForm
          trips={weeklyTrips.map((t) => ({ slug: t.slug, title: t.title, nights: t.nights }))}
        />
      </div>

      <h2 className="mt-10 font-display text-xl font-semibold text-ink">Upcoming</h2>
      {upcoming.length === 0 ? (
        <p className="mt-3 rounded-2xl border border-black/5 bg-cream p-6 text-sm text-ink-soft/70">
          Nothing scheduled yet. Add the first date above and it appears on the site straight away.
        </p>
      ) : (
        <ul className="mt-3 space-y-3">
          {upcoming.map((d) => (
            <li key={d.id} className="rounded-2xl border border-black/5 bg-cream p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-ink">{d.trip.title}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATE_STYLES[d.state]}`}>
                      {STATE_LABELS[d.state]}
                    </span>
                    {!d.guaranteed && d.state !== "cancelled" && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
                        Needs {d.seatsToGuarantee} more to run
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-ink-soft/80">
                    {formatDateRange(d.departsOn, d.returnsOn, "en-GB")}
                    {d.departureTime ? ` · ${d.departureTime}` : ""}
                  </p>
                  {d.cancellationReason && <p className="mt-1 text-sm text-rose-800">{d.cancellationReason}</p>}
                  {d.note && <p className="mt-1 text-sm text-ink-soft/60">{d.note}</p>}
                </div>
                <div className="text-right">
                  <p className="font-display text-lg font-semibold text-ink">
                    {d.seatsTaken}/{d.capacity}
                  </p>
                  <p className="text-xs text-ink-soft/60">seats · ${d.priceUsd} each</p>
                  <p className="mt-0.5 text-xs font-medium text-ink-soft/70">
                    ${(d.seatsTaken * d.priceUsd).toFixed(0)} booked
                  </p>
                </div>
              </div>
              <DepartureActions departure={d} />
            </li>
          ))}
        </ul>
      )}

      {needsClosing.length > 0 && (
        <>
          <h2 className="mt-10 font-display text-xl font-semibold text-ink">Waiting to be closed off</h2>
          <p className="mt-1 text-sm text-ink-soft/70">
            These dates have passed. Marking one completed removes it from the public calendar.
          </p>
          <ul className="mt-3 space-y-3">
            {needsClosing.map((d) => (
              <li key={d.id} className="rounded-2xl border border-black/5 bg-cream p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="font-semibold text-ink">{d.trip.title}</span>
                    <p className="text-sm text-ink-soft/70">
                      {formatDateRange(d.departsOn, d.returnsOn, "en-GB")} · {d.seatsTaken} travelled
                    </p>
                  </div>
                </div>
                <DepartureActions departure={d} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
