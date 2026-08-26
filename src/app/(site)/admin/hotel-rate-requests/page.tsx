import { redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { getCurrentUser } from "@/lib/auth/session";
import { NotConfiguredNotice } from "../NotConfiguredNotice";
import { updateRateRequestStatus } from "./actions";

export const metadata = { title: "Hotel Rate Requests", robots: { index: false, follow: false } };

type RateRequest = {
  id: string;
  hotel_name_snapshot: string;
  room_name_snapshot: string | null;
  rooms_count: number | null;
  check_in: string | null;
  check_out: string | null;
  guests: number | null;
  meal_plan: string | null;
  name: string | null;
  email: string;
  message: string | null;
  status: "new" | "contacted" | "closed";
  created_at: string;
};

const STATUSES = ["new", "contacted", "closed"] as const;
const STATUS_STYLES: Record<RateRequest["status"], string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-amber-100 text-amber-700",
  closed: "bg-gray-200 text-gray-600",
};

export default async function AdminHotelRateRequestsPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "reservations")) redirect("/account/login?next=/admin/hotel-rate-requests");
  if (!supabaseAdminConfigured) return <NotConfiguredNotice />;
  const supabase = createAdminSupabaseClient();
  const { data } = await supabase
    .from("hotel_rate_requests")
    .select(
      "id, hotel_name_snapshot, room_name_snapshot, rooms_count, check_in, check_out, guests, meal_plan, name, email, message, status, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(500);

  const requests = (data ?? []) as RateRequest[];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Hotel Rate Requests</h1>
      <p className="mt-2 text-sm text-ink-soft/60">
        Submitted from the &ldquo;Check Latest Rates&rdquo; button on the Hotel Deals pages — reach out with the current
        rate and availability.
      </p>

      <div className="mt-8 flex flex-col gap-3">
        {requests.map((r) => (
          <div key={r.id} className="rounded-2xl border border-black/5 bg-cream p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-base font-semibold text-ink">{r.hotel_name_snapshot}</p>
                <p className="text-sm text-ink-soft/70">
                  {r.name ? `${r.name} — ` : ""}
                  <a href={`mailto:${r.email}`} className="underline">
                    {r.email}
                  </a>
                </p>
                <p className="mt-0.5 text-xs text-ink-soft/50">{new Date(r.created_at).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[r.status]}`}>
                  {r.status}
                </span>
                <div className="flex gap-1">
                  {STATUSES.filter((s) => s !== r.status).map((s) => (
                    <form key={s} action={updateRateRequestStatus.bind(null, r.id, s)}>
                      <button type="submit" className="rounded-full bg-sand-dim px-2.5 py-1 text-xs capitalize text-ink-soft/70 hover:bg-sand-deep">
                        {s}
                      </button>
                    </form>
                  ))}
                </div>
              </div>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-xs text-ink-soft/50">Room</dt>
                <dd className="text-ink">{r.room_name_snapshot ?? "Any"}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-soft/50">Rooms / Guests</dt>
                <dd className="text-ink">
                  {r.rooms_count ?? "—"} / {r.guests ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink-soft/50">Check-in / out</dt>
                <dd className="text-ink">
                  {r.check_in ?? "—"} → {r.check_out ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink-soft/50">Meal Plan</dt>
                <dd className="text-ink">{r.meal_plan ?? "—"}</dd>
              </div>
            </dl>
            {r.message && <p className="mt-3 whitespace-pre-wrap text-sm text-ink-soft/80">{r.message}</p>}
          </div>
        ))}
        {requests.length === 0 && (
          <p className="rounded-2xl border border-black/5 bg-cream p-8 text-center text-sm text-ink-soft/50 shadow-sm">
            No rate requests yet.
          </p>
        )}
      </div>
    </div>
  );
}
