import Link from "next/link";
import { requireOsStaff } from "@/lib/auth/session";
import { canManageBookings, canSeeMoney } from "@/lib/auth/roles";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { firstDates, listBookings } from "@/lib/os/data";
import { formatDate, formatUsd } from "@/lib/os/model";

// Every booking, newest first. The register, not a dashboard.

export const dynamic = "force-dynamic";
export const metadata = { title: "Bookings — Egypt Eye OS", robots: { index: false, follow: false } };

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-nile/10 text-nile",
  completed: "bg-black/5 text-ink-soft",
  cancelled: "bg-terracotta/10 text-terracotta",
};

export default async function OsBookingsPage() {
  const user = await requireOsStaff();
  const mayCreate = canManageBookings(user.role);
  const showMoney = canSeeMoney(user.role);

  const bookings = supabaseAdminConfigured ? await listBookings() : [];
  const dates = supabaseAdminConfigured ? await firstDates(bookings.map((b) => b.id)) : {};

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-xl font-bold text-ink">Bookings</h1>
        {mayCreate ? (
          <Link
            href="/os/bookings/new"
            className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-cream"
          >
            New booking
          </Link>
        ) : null}
      </div>

      {bookings.length === 0 ? (
        <p className="rounded-xl border border-dashed border-black/15 bg-cream px-5 py-10 text-center text-sm text-ink-soft">
          No bookings yet.
          {mayCreate ? " Add the first one and it appears on its day sheet straight away." : ""}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-black/10 bg-cream shadow-sm">
          <table className="w-full min-w-[46rem] text-left text-sm">
            <thead className="border-b border-black/10 bg-sand-deep/30 text-xs uppercase tracking-wider text-ink-soft">
              <tr>
                <th className="px-3 py-2.5 font-semibold">Ref</th>
                <th className="px-3 py-2.5 font-semibold">Guest</th>
                <th className="px-3 py-2.5 font-semibold">Service</th>
                <th className="px-3 py-2.5 font-semibold">First day</th>
                <th className="px-3 py-2.5 text-right font-semibold">Pax</th>
                {showMoney ? <th className="px-3 py-2.5 text-right font-semibold">Total</th> : null}
                {showMoney ? <th className="px-3 py-2.5 text-right font-semibold">To collect</th> : null}
                <th className="px-3 py-2.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-b border-black/5 last:border-0 hover:bg-sand-deep/20">
                  <td className="px-3 py-2.5">
                    <Link href={`/os/bookings/${booking.ref}`} className="font-bold text-gold-dark underline">
                      {booking.ref}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 font-medium text-ink">
                    {booking.guestName}
                    {booking.source ? (
                      <span className="ml-1.5 text-xs text-ink-soft">via {booking.source}</span>
                    ) : null}
                  </td>
                  <td className="px-3 py-2.5 text-ink-soft">{booking.serviceType ?? "—"}</td>
                  <td className="px-3 py-2.5 text-ink-soft">
                    {dates[booking.id] ? formatDate(dates[booking.id]) : "No days set"}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-ink">{booking.pax}</td>
                  {showMoney ? (
                    <td className="px-3 py-2.5 text-right tabular-nums text-ink">{formatUsd(booking.totalUsd)}</td>
                  ) : null}
                  {showMoney ? (
                    <td
                      className={`px-3 py-2.5 text-right tabular-nums font-semibold ${
                        booking.remainingUsd > 0 ? "text-terracotta" : "text-nile"
                      }`}
                    >
                      {booking.remainingUsd > 0 ? formatUsd(booking.remainingUsd) : "—"}
                    </td>
                  ) : null}
                  <td className="px-3 py-2.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[booking.status]}`}
                    >
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
