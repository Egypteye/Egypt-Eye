import Link from "next/link";
import type { DaySheetRow } from "@/lib/os/data";
import { canSeeMoney, type UserRole } from "@/lib/auth/session";
import { formatTime, formatCents, totalsForDays } from "@/lib/os/model";

// The day sheet — what the ground crew reads each morning.
//
// Replaces one tab per date in the operations spreadsheet. The cards carry the
// same columns, in the order they are needed: who and how many, then when and
// where to collect them, then who is driving and guiding, then what is
// included, and last what to collect in cash.

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-ink-soft/70">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}

function DayCard({ row, role }: { row: DaySheetRow; role: UserRole }) {
  const time = formatTime(row.pickupTime);
  const showMoney = canSeeMoney(role);
  const serviceType = row.serviceType ?? row.booking.serviceType;

  return (
    <article className="overflow-hidden rounded-xl border border-black/10 bg-cream shadow-sm">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-black/5 bg-sand-deep/40 px-4 py-3">
        {/* The pick-up time is the first thing anyone looks for, so it is the
            largest thing on the card. A missing one says so out loud rather
            than leaving a gap that reads as "no pick-up needed". */}
        <p className={`text-lg font-bold tabular-nums ${time ? "text-ink" : "text-terracotta"}`}>
          {time ?? "Time TBC"}
        </p>
        <h3 className="text-base font-semibold text-ink">{row.booking.guestName}</h3>
        <span className="rounded-full bg-ink/10 px-2 py-0.5 text-xs font-semibold text-ink">
          {row.booking.pax} {row.booking.pax === 1 ? "guest" : "guests"}
        </span>
        {serviceType ? (
          <span className="rounded-full bg-nile/15 px-2 py-0.5 text-xs font-semibold text-nile">{serviceType}</span>
        ) : null}
        <Link
          href={`/os/bookings/${row.booking.ref}`}
          className="ml-auto text-xs font-bold text-gold-dark underline"
        >
          {row.booking.ref}
        </Link>
      </div>

      <dl className="grid gap-x-6 gap-y-3 px-4 py-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Pick-up from" value={row.pickupLocation} />
        <Field label="Where" value={row.serviceLocation} />
        <Field
          label="Guest phone"
          value={
            row.booking.guestPhone ? (
              // tel: because this card is read on a phone and the crew's first
              // action when a guest is not at the lobby is to call them.
              <a href={`tel:${row.booking.guestPhone.replace(/[^\d+]/g, "")}`} className="underline">
                {row.booking.guestPhone}
              </a>
            ) : null
          }
        />
        <Field label="Driver / operator" value={row.operatorName} />
        <Field label="Guide" value={row.guideName} />
        <Field label="Photographer" value={row.photographer} />
        <Field label="Assist" value={row.assist} />
        <Field label="Includes" value={row.inclusions.length > 0 ? row.inclusions.join(", ") : null} />
        <Field label="Notes on inclusions" value={row.inclusionsNotes} />
        <Field label="Notes" value={row.notes} />
      </dl>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-black/5 px-4 py-3 text-sm">
        {showMoney ? (
          <>
            <span className="text-ink-soft">
              Total <strong className="font-semibold text-ink">{formatCents(row.booking.totalCents)}</strong>
            </span>
            <span className="text-ink-soft">
              Deposit <strong className="font-semibold text-ink">{formatCents(row.booking.depositCents)}</strong>
            </span>
            {/* The number the driver is accountable for. Styled as the loudest
                thing in the row when it is not zero. */}
            {row.booking.remainingCents > 0 ? (
              <span className="rounded-lg bg-terracotta/10 px-2.5 py-1 font-bold text-terracotta">
                Collect {formatCents(row.booking.remainingCents)}
              </span>
            ) : (
              <span className="rounded-lg bg-nile/10 px-2.5 py-1 font-semibold text-nile">Paid in full</span>
            )}
          </>
        ) : null}

        <span
          className={`ml-auto rounded-lg px-2.5 py-1 text-xs font-semibold ${
            row.dataCollected ? "bg-nile/10 text-nile" : "bg-black/5 text-ink-soft"
          }`}
        >
          {row.dataCollected ? "Content data collected" : "Content data not collected"}
        </span>
        {row.photoLink ? (
          <a
            href={row.photoLink}
            target="_blank"
            rel="noreferrer noopener"
            className="text-xs font-semibold text-gold-dark underline"
          >
            Photos →
          </a>
        ) : null}
      </div>
    </article>
  );
}

export function DaySheet({ rows, role }: { rows: DaySheetRow[]; role: UserRole }) {
  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-black/15 bg-cream px-5 py-10 text-center text-sm text-ink-soft">
        Nothing scheduled for this date.
      </p>
    );
  }

  // Counted per booking, not per row: a four-day trip is one booking on four
  // day sheets, and its money must not be added up four times.
  const totals = totalsForDays(
    rows.map((row) => ({
      bookingId: row.booking.id,
      totalCents: row.booking.totalCents,
      depositCents: row.booking.depositCents,
    })),
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 rounded-xl border border-black/10 bg-cream px-4 py-3 text-sm">
        <span className="font-semibold text-ink">
          {rows.length} {rows.length === 1 ? "service" : "services"}
        </span>
        <span className="text-ink-soft">
          {totals.bookings} {totals.bookings === 1 ? "booking" : "bookings"}
        </span>
        <span className="text-ink-soft">
          {rows.reduce((n, row) => n + row.booking.pax, 0)} guests
        </span>
        {canSeeMoney(role) && totals.remainingCents > 0 ? (
          <span className="ml-auto font-semibold text-terracotta">
            {formatCents(totals.remainingCents)} to collect
          </span>
        ) : null}
      </div>
      {rows.map((row) => (
        <DayCard key={row.id} row={row} role={role} />
      ))}
    </div>
  );
}
