import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { addDays, todayInCairo } from "./model";

// Every read in the OS, in one place.
//
// The service-role client is used throughout, because ops_* tables have RLS on
// with no client policies at all (migration 0025) — the same arrangement as
// newsletter_subscribers. That is only safe because nothing in this module is
// reachable without a caller that has already passed requireOsStaff(): the
// `server-only` import above makes importing it from a client component a
// build error rather than a leak.

export type OsBooking = {
  id: string;
  ref: string;
  guestName: string;
  guestPhone: string | null;
  guestEmail: string | null;
  source: string | null;
  serviceType: string | null;
  pax: number;
  totalCents: number;
  depositCents: number;
  remainingCents: number;
  status: "confirmed" | "cancelled" | "completed";
  cancellationReason: string | null;
  reservationOwner: string | null;
  notes: string | null;
  leadId: string | null;
  createdAt: string;
};

export type OsBookingDay = {
  id: string;
  bookingId: string;
  serviceDate: string;
  serviceType: string | null;
  serviceLocation: string | null;
  pickupTime: string | null;
  pickupLocation: string | null;
  operatorName: string | null;
  guideName: string | null;
  inclusions: string[];
  inclusionsNotes: string | null;
  notes: string | null;
  photographer: string | null;
  assist: string | null;
  dataCollected: boolean;
  photoLink: string | null;
};

/** A day row with the booking it belongs to — one line of the day sheet. */
export type DaySheetRow = OsBookingDay & { booking: OsBooking };

export type OsLead = {
  id: string;
  guestName: string;
  platform: string | null;
  contact: string | null;
  requestedOn: string;
  travelWindow: string | null;
  interest: string | null;
  pax: number | null;
  itineraryStatus: "not_sent" | "sent";
  lastFollowUpOn: string | null;
  nextFollowUpOn: string | null;
  outcome: "pending" | "booked" | "lost";
  notes: string | null;
  owner: string | null;
  createdAt: string;
};

const BOOKING_COLUMNS =
  "id, ref, guest_name, guest_phone, guest_email, source, service_type, pax, total_cents, deposit_cents, remaining_cents, status, cancellation_reason, reservation_owner, notes, lead_id, created_at";

const DAY_COLUMNS =
  "id, booking_id, service_date, service_type, service_location, pickup_time, pickup_location, operator_name, guide_name, inclusions, inclusions_notes, notes, photographer, assist, data_collected, photo_link";

const LEAD_COLUMNS =
  "id, guest_name, platform, contact, requested_on, travel_window, interest, pax, itinerary_status, last_follow_up_on, next_follow_up_on, outcome, notes, owner, created_at";

type Row = Record<string, unknown>;

const text = (value: unknown): string | null => (typeof value === "string" && value !== "" ? value : null);

// Money is stored as integer cents, which supabase-js hands back as a
// number. Coerced and floored anyway: a non-integer here would mean the
// column type changed under us, and silently carrying a fraction of a cent
// into the arithmetic is worse than treating it as the whole cents it claims
// to be.
const cents = (value: unknown): number => {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : 0;
};

// An embedded to-one relation. supabase-js types `os_bookings(...)` as an
// array even for a many-to-one foreign key, while the server sends a single
// object — so both shapes are accepted rather than trusting either.
//
// The embeds are NOT given a friendlier alias anywhere a filter is applied to
// them. A top-level filter on an embedded resource has to name it the same
// way the select does, and getting that pairing wrong fails at request time
// against the live database — which is the one place this code cannot be
// tried out before the team is relying on it. Using the table name in both
// places removes the question.
function embedded(value: Row | Row[]): Row {
  return Array.isArray(value) ? (value[0] ?? {}) : value;
}

function toBooking(row: Row): OsBooking {
  return {
    id: String(row.id),
    ref: String(row.ref),
    guestName: String(row.guest_name),
    guestPhone: text(row.guest_phone),
    guestEmail: text(row.guest_email),
    source: text(row.source),
    serviceType: text(row.service_type),
    pax: Number(row.pax),
    totalCents: cents(row.total_cents),
    depositCents: cents(row.deposit_cents),
    remainingCents: cents(row.remaining_cents),
    status: (row.status as OsBooking["status"]) ?? "confirmed",
    cancellationReason: text(row.cancellation_reason),
    reservationOwner: text(row.reservation_owner),
    notes: text(row.notes),
    leadId: text(row.lead_id),
    createdAt: String(row.created_at),
  };
}

function toDay(row: Row): OsBookingDay {
  return {
    id: String(row.id),
    bookingId: String(row.booking_id),
    serviceDate: String(row.service_date),
    serviceType: text(row.service_type),
    serviceLocation: text(row.service_location),
    pickupTime: text(row.pickup_time),
    pickupLocation: text(row.pickup_location),
    operatorName: text(row.operator_name),
    guideName: text(row.guide_name),
    inclusions: Array.isArray(row.inclusions) ? row.inclusions.map(String) : [],
    inclusionsNotes: text(row.inclusions_notes),
    notes: text(row.notes),
    photographer: text(row.photographer),
    assist: text(row.assist),
    dataCollected: row.data_collected === true,
    photoLink: text(row.photo_link),
  };
}

function toLead(row: Row): OsLead {
  return {
    id: String(row.id),
    guestName: String(row.guest_name),
    platform: text(row.platform),
    contact: text(row.contact),
    requestedOn: String(row.requested_on),
    travelWindow: text(row.travel_window),
    interest: text(row.interest),
    pax: row.pax === null || row.pax === undefined ? null : Number(row.pax),
    itineraryStatus: (row.itinerary_status as OsLead["itineraryStatus"]) ?? "not_sent",
    lastFollowUpOn: text(row.last_follow_up_on),
    nextFollowUpOn: text(row.next_follow_up_on),
    outcome: (row.outcome as OsLead["outcome"]) ?? "pending",
    notes: text(row.notes),
    owner: text(row.owner),
    createdAt: String(row.created_at),
  };
}

/**
 * The day sheet: every service happening on one date.
 *
 * Cancelled bookings are left out — the crew should not be sent to one — but
 * the booking itself is kept in the database with its reason, so the desk can
 * still explain the gap a week later.
 */
export async function getDaySheet(date: string): Promise<DaySheetRow[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("ops_booking_days")
    .select(`${DAY_COLUMNS}, ops_bookings!inner(${BOOKING_COLUMNS})`)
    .eq("service_date", date)
    .neq("ops_bookings.status", "cancelled")
    .order("pickup_time", { ascending: true, nullsFirst: false });

  if (error) throw new Error(`Could not load the day sheet: ${error.message}`);

  return (data ?? []).map((row) => {
    const { ops_bookings: booking, ...day } = row as unknown as Row & {
      ops_bookings: Row | Row[];
    };
    return { ...toDay(day), booking: toBooking(embedded(booking)) };
  });
}

/** How many services each of the next `span` days holds — the week strip. */
export async function getUpcomingCounts(from: string, span: number): Promise<Record<string, number>> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("ops_booking_days")
    .select("service_date, ops_bookings!inner(status)")
    .gte("service_date", from)
    .lte("service_date", addDays(from, span - 1))
    .neq("ops_bookings.status", "cancelled");

  if (error) throw new Error(`Could not count upcoming days: ${error.message}`);

  const counts: Record<string, number> = {};
  for (const row of (data ?? []) as Row[]) {
    const date = String(row.service_date);
    counts[date] = (counts[date] ?? 0) + 1;
  }
  return counts;
}

export async function listBookings(limit = 100): Promise<OsBooking[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("ops_bookings")
    .select(BOOKING_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Could not load bookings: ${error.message}`);
  return (data ?? []).map((row) => toBooking(row as Row));
}

/** The first service date of each booking, for the list screen. */
export async function firstDates(bookingIds: string[]): Promise<Record<string, string>> {
  if (bookingIds.length === 0) return {};
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("ops_booking_days")
    .select("booking_id, service_date")
    .in("booking_id", bookingIds)
    .order("service_date", { ascending: true });

  if (error) throw new Error(`Could not load booking dates: ${error.message}`);

  const out: Record<string, string> = {};
  for (const row of (data ?? []) as Row[]) {
    const id = String(row.booking_id);
    if (!(id in out)) out[id] = String(row.service_date);
  }
  return out;
}

export async function getBookingByRef(
  ref: string,
): Promise<{ booking: OsBooking; days: OsBookingDay[] } | null> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("ops_bookings")
    .select(BOOKING_COLUMNS)
    .eq("ref", ref)
    .maybeSingle();

  if (error) throw new Error(`Could not load that booking: ${error.message}`);
  if (!data) return null;

  const booking = toBooking(data as Row);
  const { data: dayRows, error: dayError } = await supabase
    .from("ops_booking_days")
    .select(DAY_COLUMNS)
    .eq("booking_id", booking.id)
    .order("service_date", { ascending: true });

  if (dayError) throw new Error(`Could not load that booking's days: ${dayError.message}`);

  return { booking, days: (dayRows ?? []).map((row) => toDay(row as Row)) };
}

export async function listLeads(includeClosed = false): Promise<OsLead[]> {
  const supabase = createAdminSupabaseClient();
  let query = supabase.from("ops_followups").select(LEAD_COLUMNS);
  if (!includeClosed) query = query.eq("outcome", "pending");

  const { data, error } = await query.order("next_follow_up_on", { ascending: true, nullsFirst: false }).limit(300);
  if (error) throw new Error(`Could not load the follow-up list: ${error.message}`);
  return (data ?? []).map((row) => toLead(row as Row));
}

export async function getLead(id: string): Promise<OsLead | null> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase.from("ops_followups").select(LEAD_COLUMNS).eq("id", id).maybeSingle();
  if (error) throw new Error(`Could not load that lead: ${error.message}`);
  return data ? toLead(data as Row) : null;
}

/** The two numbers on the nav: today's services, and follow-ups due. */
export async function getHeadlineCounts(): Promise<{ today: number; dueFollowUps: number }> {
  const supabase = createAdminSupabaseClient();
  const today = todayInCairo();

  const [days, leads] = await Promise.all([
    supabase
      .from("ops_booking_days")
      .select("id, ops_bookings!inner(status)", { count: "exact", head: true })
      .eq("service_date", today)
      .neq("ops_bookings.status", "cancelled"),
    supabase
      .from("ops_followups")
      .select("id", { count: "exact", head: true })
      .eq("outcome", "pending")
      .lte("next_follow_up_on", today),
  ]);

  return { today: days.count ?? 0, dueFollowUps: leads.count ?? 0 };
}
