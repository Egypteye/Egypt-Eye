import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { getCurrentUser } from "@/lib/auth/session";
import { NotConfiguredNotice } from "../../NotConfiguredNotice";
import {
  addDocument,
  addGuide,
  addHotel,
  addItineraryDay,
  addItineraryItem,
  addTransfer,
  resolveChangeRequest,
  updateReservationStatus,
} from "../actions";

export const metadata = { title: "Reservation", robots: { index: false, follow: false } };

type ItineraryItem = { time?: string; title: string; location?: string; notes?: string };
type ItineraryDay = { day: number; date?: string; title: string; items: ItineraryItem[] };
type Hotel = { name: string; checkIn?: string; checkOut?: string; address?: string; confirmationNumber?: string };
type Transfer = { date?: string; time?: string; from: string; to: string; driverName?: string; driverPhone?: string };
type Guide = { name: string; phone?: string; languages?: string };
type Document = { label: string; url: string };
type JourneyItem = { type: string; slug: string; title: string };
type ChangeRequest = { id: string; request_type: string; payload: { title?: string; slug?: string; note?: string }; status: string; created_at: string };

export default async function AdminReservationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "reservations")) redirect("/account/login?next=/admin/reservations");
  const { id } = await params;
  if (!supabaseAdminConfigured) return <NotConfiguredNotice />;
  const supabase = createAdminSupabaseClient();

  const [{ data: reservation }, { data: changeRequests }] = await Promise.all([
    supabase.from("reservations").select("*").eq("id", id).maybeSingle(),
    supabase.from("reservation_change_requests").select("*").eq("reservation_id", id).order("created_at", { ascending: false }),
  ]);

  if (!reservation) notFound();

  const itinerary = (reservation.itinerary ?? []) as ItineraryDay[];
  const hotels = (reservation.hotels ?? []) as Hotel[];
  const transfers = (reservation.transfers ?? []) as Transfer[];
  const guides = (reservation.guides ?? []) as Guide[];
  const documents = (reservation.documents ?? []) as Document[];
  const journeySnapshot = (reservation.journey_snapshot ?? []) as JourneyItem[];
  const requests = (changeRequests ?? []) as ChangeRequest[];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/admin/reservations" className="text-sm font-semibold text-ink-soft/60 hover:text-ink">
          ← All Reservations
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-mono font-display text-2xl font-semibold text-ink">{reservation.reference}</h1>
          <form action={updateReservationStatus.bind(null, id)} className="flex items-center gap-2">
            <select name="status" defaultValue={reservation.status} className="rounded-lg border border-black/10 bg-cream px-3 py-2 text-sm">
              <option value="requested">Requested</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_trip">In Trip</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button type="submit" className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-cream hover:bg-gold-dark">
              Update Status
            </button>
          </form>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-black/5 bg-cream p-5 text-sm shadow-sm">
          <h2 className="mb-3 font-display text-base font-semibold text-ink">Guest</h2>
          <p className="text-ink">{reservation.guest_name}</p>
          <p className="text-ink-soft/60">{reservation.guest_email}</p>
          {reservation.guest_phone && <p className="text-ink-soft/60">{reservation.guest_phone}</p>}
          <p className="mt-2 text-ink-soft/60">
            {reservation.travelers_adults} adults, {reservation.travelers_children} children
          </p>
          <p className="text-ink-soft/60">
            {reservation.trip_start_date ? new Date(reservation.trip_start_date).toLocaleDateString() : "Dates TBD"}
            {reservation.trip_end_date ? ` – ${new Date(reservation.trip_end_date).toLocaleDateString()}` : ""}
          </p>
          {reservation.preferences && <p className="mt-2 text-ink-soft/60">&ldquo;{reservation.preferences}&rdquo;</p>}
        </div>

        <div className="rounded-2xl border border-black/5 bg-cream p-5 text-sm shadow-sm">
          <h2 className="mb-3 font-display text-base font-semibold text-ink">Journey &amp; Pricing</h2>
          <ul className="flex flex-col gap-1 text-ink">
            {journeySnapshot.map((item, i) => (
              <li key={i}>{item.title}</li>
            ))}
          </ul>
          {reservation.subtotal_estimate !== null && (
            <div className="mt-3 border-t border-black/5 pt-3 text-ink-soft/70">
              <p>Subtotal: ${reservation.subtotal_estimate.toLocaleString()}</p>
              {reservation.discount_amount > 0 && <p>Discount: -${reservation.discount_amount.toLocaleString()}</p>}
              <p className="font-semibold text-ink">Total: ${reservation.total_estimate?.toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>

      {requests.length > 0 && (
        <div className="rounded-2xl border border-gold/20 bg-cream p-5 shadow-sm">
          <h2 className="mb-3 font-display text-base font-semibold text-ink">Change Requests</h2>
          <div className="flex flex-col gap-3">
            {requests.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-sand-dim p-3 text-sm">
                <div>
                  <p className="text-ink">{r.payload?.title ?? r.request_type}</p>
                  {r.payload?.note && <p className="text-ink-soft/60">{r.payload.note}</p>}
                  <p className="text-xs text-ink-soft/40">{new Date(r.created_at).toLocaleString()}</p>
                </div>
                {r.status === "pending" ? (
                  <div className="flex gap-2">
                    <form action={resolveChangeRequest.bind(null, r.id, id, "approved")}>
                      <button type="submit" className="rounded-full bg-nile/10 px-3 py-1.5 text-xs font-semibold text-nile">
                        Approve
                      </button>
                    </form>
                    <form action={resolveChangeRequest.bind(null, r.id, id, "declined")}>
                      <button type="submit" className="rounded-full bg-terracotta/10 px-3 py-1.5 text-xs font-semibold text-terracotta">
                        Decline
                      </button>
                    </form>
                  </div>
                ) : (
                  <span className="rounded-full bg-black/5 px-3 py-1.5 text-xs font-semibold text-ink-soft/60">{r.status}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <AdminListCard
          title="Hotels"
          addAction={addHotel.bind(null, id)}
          existingItems={hotels.map((h, i) => (
            <p key={i} className="text-sm text-ink">{h.name} {h.checkIn && `· ${h.checkIn} – ${h.checkOut}`}</p>
          ))}
        >
          <input name="name" placeholder="Hotel name" className={miniInput} required />
          <div className="flex gap-2">
            <input name="checkIn" type="date" className={miniInput} />
            <input name="checkOut" type="date" className={miniInput} />
          </div>
          <input name="address" placeholder="Address" className={miniInput} />
          <input name="confirmationNumber" placeholder="Confirmation #" className={miniInput} />
        </AdminListCard>

        <AdminListCard
          title="Transfers"
          addAction={addTransfer.bind(null, id)}
          existingItems={transfers.map((t, i) => (
            <p key={i} className="text-sm text-ink">{t.from} → {t.to} {t.date && `· ${t.date} ${t.time ?? ""}`}</p>
          ))}
        >
          <div className="flex gap-2">
            <input name="from" placeholder="From" className={miniInput} required />
            <input name="to" placeholder="To" className={miniInput} required />
          </div>
          <div className="flex gap-2">
            <input name="date" type="date" className={miniInput} />
            <input name="time" type="time" className={miniInput} />
          </div>
          <input name="driverName" placeholder="Driver name" className={miniInput} />
          <input name="driverPhone" placeholder="Driver phone" className={miniInput} />
        </AdminListCard>

        <AdminListCard
          title="Guides"
          addAction={addGuide.bind(null, id)}
          existingItems={guides.map((g, i) => (
            <p key={i} className="text-sm text-ink">{g.name} {g.phone && `· ${g.phone}`}</p>
          ))}
        >
          <input name="name" placeholder="Guide name" className={miniInput} required />
          <input name="phone" placeholder="Phone" className={miniInput} />
          <input name="languages" placeholder="Languages" className={miniInput} />
        </AdminListCard>

        <AdminListCard
          title="Documents"
          addAction={addDocument.bind(null, id)}
          existingItems={documents.map((d, i) => (
            <p key={i} className="text-sm text-ink">{d.label}</p>
          ))}
        >
          <input name="label" placeholder="Label (e.g. Trip Voucher)" className={miniInput} required />
          <input name="url" placeholder="Document URL" className={miniInput} required />
        </AdminListCard>
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg font-semibold text-ink">Itinerary</h2>
        <div className="flex flex-col gap-4">
          {itinerary.map((day, dayIndex) => (
            <div key={dayIndex} className="rounded-2xl border border-black/5 bg-cream p-5 shadow-sm">
              <p className="font-semibold text-ink">
                Day {day.day}: {day.title} {day.date && <span className="text-ink-soft/50">({day.date})</span>}
              </p>
              <ul className="mt-2 flex flex-col gap-1 text-sm text-ink-soft/70">
                {day.items.map((item, i) => (
                  <li key={i}>
                    {item.time && <span className="font-semibold text-gold-dark">{item.time} — </span>}
                    {item.title} {item.location && `· ${item.location}`}
                  </li>
                ))}
              </ul>
              <form action={addItineraryItem.bind(null, id, dayIndex)} className="mt-3 flex flex-wrap gap-2">
                <input name="time" type="time" className={miniInput} />
                <input name="title" placeholder="Activity" required className={miniInput} />
                <input name="location" placeholder="Location" className={miniInput} />
                <button type="submit" className="rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-cream">
                  + Add Item
                </button>
              </form>
            </div>
          ))}
          <form action={addItineraryDay.bind(null, id)} className="flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-black/15 p-4">
            <input name="date" type="date" className={miniInput} />
            <input name="title" placeholder="Day title (e.g. Arrival in Cairo)" required className={miniInput} />
            <button type="submit" className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-cream">
              + Add Day
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const miniInput = "min-w-0 flex-1 rounded-lg border border-black/10 bg-sand px-3 py-1.5 text-sm outline-none focus:border-gold";

function AdminListCard({
  title,
  addAction,
  existingItems,
  children,
}: {
  title: string;
  addAction: (formData: FormData) => Promise<void>;
  existingItems: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-cream p-5 shadow-sm">
      <h3 className="mb-3 font-display text-base font-semibold text-ink">{title}</h3>
      <div className="flex flex-col gap-1.5">{existingItems}</div>
      <form action={addAction} className="mt-3 flex flex-col gap-2">
        {children}
        <button type="submit" className="self-start rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-cream">
          + Add
        </button>
      </form>
    </div>
  );
}
