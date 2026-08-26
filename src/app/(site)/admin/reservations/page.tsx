import Link from "next/link";
import { redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { getCurrentUser } from "@/lib/auth/session";
import { NotConfiguredNotice } from "../NotConfiguredNotice";

export const metadata = { title: "Reservations", robots: { index: false, follow: false } };

type Reservation = {
  id: string;
  reference: string;
  guest_name: string;
  guest_email: string;
  status: string;
  trip_start_date: string | null;
  total_estimate: number | null;
  created_at: string;
};

const STATUS_STYLE: Record<string, string> = {
  requested: "bg-gold/15 text-gold-dark",
  confirmed: "bg-nile/10 text-nile",
  in_trip: "bg-nile/20 text-nile",
  completed: "bg-black/5 text-ink-soft/60",
  cancelled: "bg-terracotta/10 text-terracotta",
};

export default async function AdminReservationsPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "reservations")) redirect("/account/login?next=/admin/reservations");
  if (!supabaseAdminConfigured) return <NotConfiguredNotice />;
  const supabase = createAdminSupabaseClient();
  const { data } = await supabase
    .from("reservations")
    .select("id, reference, guest_name, guest_email, status, trip_start_date, total_estimate, created_at")
    .order("created_at", { ascending: false })
    .limit(300);

  const reservations = (data ?? []) as Reservation[];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Reservations</h1>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-black/5 bg-cream shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-black/5 text-xs uppercase tracking-wide text-ink-soft/50">
            <tr>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Guest</th>
              <th className="px-4 py-3">Trip Start</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Requested</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((r) => (
              <tr key={r.id} className="border-b border-black/5 last:border-0 hover:bg-sand-dim">
                <td className="px-4 py-3">
                  <Link href={`/admin/reservations/${r.id}`} className="font-mono font-semibold text-gold-dark hover:underline">
                    {r.reference}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink">
                  {r.guest_name}
                  <span className="block text-xs text-ink-soft/50">{r.guest_email}</span>
                </td>
                <td className="px-4 py-3 text-ink-soft/60">{r.trip_start_date ? new Date(r.trip_start_date).toLocaleDateString() : "—"}</td>
                <td className="px-4 py-3 text-ink-soft/70">{r.total_estimate !== null ? `$${r.total_estimate.toLocaleString()}` : "Quote"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[r.status] ?? ""}`}>{r.status}</span>
                </td>
                <td className="px-4 py-3 text-ink-soft/50">{new Date(r.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {reservations.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-soft/50">
                  No reservations yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
