import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOsStaff } from "@/lib/auth/session";
import { canEditContent, canEditLogistics, canEditMoney, canManageBookings, canSeeMoney } from "@/lib/auth/roles";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { getBookingByRef } from "@/lib/os/data";
import { formatDate, formatCents, whatsappMessage } from "@/lib/os/model";
import { CopyButton } from "../../ActionForm";
import { Panel } from "../../Fields";
import { AddDayForm, BookingDetailsForm, BookingMoneyForm, DayPanel, StatusForm } from "./BookingEditor";

// One booking: who it is, what it costs, and every day of it.
//
// All three teams land here, and each sees the same page with different parts
// writable. Nothing is hidden behind a tab — the operations crew reading the
// pick-up time and the desk reading the balance are looking at one record,
// which is the entire point of the OS existing.

export const dynamic = "force-dynamic";
export const metadata = { title: "Booking — Egypt Eye OS", robots: { index: false, follow: false } };

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-nile/10 text-nile",
  completed: "bg-black/5 text-ink-soft",
  cancelled: "bg-terracotta/10 text-terracotta",
};

export default async function BookingPage({ params }: { params: Promise<{ ref: string }> }) {
  const user = await requireOsStaff();
  const { ref } = await params;

  // With no database there is nothing to show, and a 404 would hide the
  // layout's explanation of why. The banner above already says what is
  // missing, so this says what it would have shown.
  if (!supabaseAdminConfigured) {
    return (
      <p className="rounded-xl border border-dashed border-black/15 bg-cream px-5 py-10 text-center text-sm text-ink-soft">
        Booking {ref} can&rsquo;t be loaded until the database is connected.
      </p>
    );
  }

  const found = await getBookingByRef(decodeURIComponent(ref));
  if (!found) notFound();

  const { booking, days } = found;
  const showMoney = canSeeMoney(user.role);

  // Composed server-side so the message is identical whoever copies it, and
  // so it stays available as the body if the WhatsApp Business API is ever
  // configured — see whatsappMessage() for why there is no Send button.
  //
  // Built ONLY for a role allowed to see the money. The message states the
  // total, the deposit and the balance to collect, so rendering it to the
  // social team would hand them in one block exactly what the rest of this
  // page is careful not to show them. The crew hand-off is the desk's and
  // operations' job in any case.
  const handoff = !showMoney
    ? null
    : whatsappMessage(
        {
          ref: booking.ref,
          guestName: booking.guestName,
          guestPhone: booking.guestPhone,
          pax: booking.pax,
          serviceType: booking.serviceType,
          source: booking.source,
          totalCents: booking.totalCents,
          depositCents: booking.depositCents,
          notes: booking.notes,
        },
        days.map((day) => ({
          serviceDate: day.serviceDate,
          serviceType: day.serviceType ?? booking.serviceType,
          serviceLocation: day.serviceLocation,
          pickupTime: day.pickupTime,
          pickupLocation: day.pickupLocation,
          operatorName: day.operatorName,
          guideName: day.guideName,
          inclusions: day.inclusions,
          notes: day.notes,
        })),
      );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="text-xl font-bold text-ink">{booking.guestName}</h1>
          <span className="text-sm font-bold text-gold-dark">{booking.ref}</span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[booking.status]}`}>
            {booking.status}
          </span>
        </div>
        <Link href="/os/bookings" className="text-sm font-semibold text-gold-dark underline">
          ← All bookings
        </Link>
      </div>

      {booking.status === "cancelled" && booking.cancellationReason ? (
        <p className="rounded-xl border border-terracotta/30 bg-terracotta/5 px-4 py-3 text-sm text-ink">
          <strong>Cancelled:</strong> {booking.cancellationReason}
        </p>
      ) : null}

      {showMoney ? (
        <div className="flex flex-wrap gap-3">
          {[
            { label: "Total", value: formatCents(booking.totalCents), tone: "text-ink" },
            { label: "Deposit paid", value: formatCents(booking.depositCents), tone: "text-ink" },
            {
              label: "To collect",
              value: booking.remainingCents > 0 ? formatCents(booking.remainingCents) : "Nothing",
              tone: booking.remainingCents > 0 ? "text-terracotta" : "text-nile",
            },
            { label: "Guests", value: String(booking.pax), tone: "text-ink" },
            { label: "Days", value: String(days.length), tone: "text-ink" },
          ].map((stat) => (
            <div key={stat.label} className="min-w-28 flex-1 rounded-xl border border-black/10 bg-cream px-4 py-3">
              <p className={`text-lg font-bold tabular-nums ${stat.tone}`}>{stat.value}</p>
              <p className="text-xs text-ink-soft">{stat.label}</p>
            </div>
          ))}
        </div>
      ) : null}

      {handoff ? (
        <Panel
          title="Hand-off to the crew"
          description="The message for the WhatsApp group, built from this booking. Copy it and paste it in."
        >
          <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-lg bg-white px-3 py-2 text-xs leading-relaxed text-ink">
            {handoff}
          </pre>
          <div className="mt-3">
            <CopyButton text={handoff} />
          </div>
          <p className="mt-2 text-xs text-ink-soft">
            The OS can&rsquo;t post into a WhatsApp group by itself — that needs the paid WhatsApp Business Cloud
            API, with a registered number and approved templates. Rather than a Send button that quietly does
            nothing, this is the real message, ready to paste.
          </p>
        </Panel>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <BookingDetailsForm booking={booking} editable={canManageBookings(user.role)} />
        {showMoney ? <BookingMoneyForm booking={booking} editable={canEditMoney(user.role)} /> : null}
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-ink">
          Days of service ({days.length})
        </h2>
        {days.map((day) => (
          <DayPanel
            key={day.id}
            day={day}
            heading={formatDate(day.serviceDate)}
            canEditLogistics={canEditLogistics(user.role)}
            canEditContent={canEditContent(user.role)}
            canRemove={canManageBookings(user.role) && days.length > 1}
          />
        ))}
        {canManageBookings(user.role) ? <AddDayForm bookingId={booking.id} /> : null}
      </div>

      {canManageBookings(user.role) ? <StatusForm booking={booking} /> : null}
    </div>
  );
}
