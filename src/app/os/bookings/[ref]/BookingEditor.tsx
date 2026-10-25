"use client";

import Link from "next/link";
import { useState } from "react";
import { ActionButton, ActionForm } from "../../ActionForm";
import { Checkbox, Field, Panel, ReadOnlyNotice, TextArea } from "../../Fields";
import type { OsBooking, OsBookingDay } from "@/lib/os/data";
import {
  INCLUSION_SUGGESTIONS,
  LOCATION_SUGGESTIONS,
  SERVICE_TYPE_SUGGESTIONS,
  SOURCE_SUGGESTIONS,
  formatCents,
  formatTime,
  remainingCents,
  usdToCents,
} from "@/lib/os/model";
import {
  addBookingDay,
  removeBookingDay,
  setBookingStatus,
  updateBookingDetails,
  updateBookingMoney,
  updateDayContent,
  updateDayLogistics,
} from "../actions";

// The editable parts of a booking.
//
// Each panel is its own form bound to its own server action, rather than one
// big save. That is what makes the permission split real: operations posting
// the day's pick-up time cannot carry a changed price along with it, because
// the price is not a field in the form they submit and updateDayLogistics
// would not write it if it were.
//
// Where a role may look but not change, the fields are disabled AND the
// action refuses — the disabled attribute is a courtesy to the person, not a
// security measure, since anyone can post to the action directly.

export function BookingDetailsForm({ booking, editable }: { booking: OsBooking; editable: boolean }) {
  return (
    <Panel
      title="Guest & service"
      footer={editable ? undefined : <ReadOnlyNotice>Only the reservations desk can change these.</ReadOnlyNotice>}
    >
      <ActionForm
        action={updateBookingDetails.bind(null, booking.id)}
        submitLabel="Save details"
        disabled={!editable}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Guest name" name="guest_name" required defaultValue={booking.guestName} disabled={!editable} />
          <Field label="Guests" name="pax" type="number" min={1} required defaultValue={booking.pax} disabled={!editable} />
          <Field label="Phone / WhatsApp" name="guest_phone" defaultValue={booking.guestPhone} disabled={!editable} />
          <Field label="Email" name="guest_email" type="email" defaultValue={booking.guestEmail} disabled={!editable} />
          <Field
            label="Booked via"
            name="source"
            suggestions={SOURCE_SUGGESTIONS}
            defaultValue={booking.source}
            disabled={!editable}
          />
          <Field
            label="Service"
            name="service_type"
            suggestions={SERVICE_TYPE_SUGGESTIONS}
            defaultValue={booking.serviceType}
            disabled={!editable}
          />
          <Field
            label="Reservation owner"
            name="reservation_owner"
            defaultValue={booking.reservationOwner}
            disabled={!editable}
            className="sm:col-span-2"
          />
          <TextArea label="Notes" name="notes" defaultValue={booking.notes} disabled={!editable} className="sm:col-span-2" />
        </div>
      </ActionForm>
    </Panel>
  );
}

export function BookingMoneyForm({ booking, editable }: { booking: OsBooking; editable: boolean }) {
  // The inputs are in dollars, because that is what a person types and what
  // an invoice says. They are converted to cents exactly once, server-side,
  // by the action — so these two numbers are dollars and are only ever used
  // for the preview line below, never saved.
  const [totalDollars, setTotalDollars] = useState(booking.totalCents / 100);
  const [depositDollars, setDepositDollars] = useState(booking.depositCents / 100);
  const dueCents = remainingCents(
    usdToCents(totalDollars) ?? 0,
    usdToCents(depositDollars) ?? 0,
  );

  return (
    <Panel
      title="Money"
      description="Held once, here. Day sheets read it; they never carry their own copy."
      footer={
        editable ? undefined : (
          <ReadOnlyNotice>
            You can see this because the balance is collected on the ground, but only the reservations desk can
            change it.
          </ReadOnlyNotice>
        )
      }
    >
      <ActionForm
        action={updateBookingMoney.bind(null, booking.id)}
        submitLabel="Save money"
        disabled={!editable}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wider text-ink-soft">Total (USD)</span>
            <input
              name="total_usd"
              type="number"
              min={0}
              step="0.01"
              defaultValue={booking.totalCents / 100}
              disabled={!editable}
              onChange={(event) => setTotalDollars(Number(event.target.value) || 0)}
              className="mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-ink shadow-sm disabled:bg-black/5 disabled:text-ink-soft"
            />
          </label>
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wider text-ink-soft">
              Deposit paid (USD)
            </span>
            <input
              name="deposit_usd"
              type="number"
              min={0}
              step="0.01"
              defaultValue={booking.depositCents / 100}
              disabled={!editable}
              onChange={(event) => setDepositDollars(Number(event.target.value) || 0)}
              className="mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-ink shadow-sm disabled:bg-black/5 disabled:text-ink-soft"
            />
          </label>
        </div>
        <p className={`mt-3 text-sm font-semibold ${dueCents === 0 ? "text-nile" : "text-terracotta"}`}>
          {dueCents < 0
            ? "The deposit is more than the total — this won't save."
            : dueCents > 0
              ? `To collect: ${formatCents(dueCents)}`
              : "Paid in full."}
        </p>
      </ActionForm>
    </Panel>
  );
}

export function DayPanel({
  day,
  heading,
  canEditLogistics,
  canEditContent,
  canRemove,
}: {
  day: OsBookingDay;
  heading: string;
  canEditLogistics: boolean;
  canEditContent: boolean;
  canRemove: boolean;
}) {
  const time = formatTime(day.pickupTime);

  return (
    <Panel
      title={heading}
      description={time ? `Pick-up ${time}` : "Pick-up time not set"}
      footer={
        canRemove ? (
          <ActionButton
            action={removeBookingDay.bind(null, day.id)}
            label="Remove this day"
            variant="danger"
            confirm="Remove this day from the booking? The crew will no longer see it on that date."
          />
        ) : undefined
      }
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-soft">On the ground</h3>
          <ActionForm
            action={updateDayLogistics.bind(null, day.id)}
            submitLabel="Save day"
            disabled={!canEditLogistics}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Service"
                name="service_type"
                suggestions={SERVICE_TYPE_SUGGESTIONS}
                defaultValue={day.serviceType}
                disabled={!canEditLogistics}
              />
              <Field
                label="Where"
                name="service_location"
                suggestions={LOCATION_SUGGESTIONS}
                defaultValue={day.serviceLocation}
                disabled={!canEditLogistics}
              />
              <Field
                label="Pick-up time"
                name="pickup_time"
                type="time"
                defaultValue={time}
                disabled={!canEditLogistics}
                hint="Leave blank if it isn't decided — it shows as TBC, not midnight."
              />
              <Field
                label="Pick-up from"
                name="pickup_location"
                defaultValue={day.pickupLocation}
                disabled={!canEditLogistics}
                placeholder="Hotel or meeting point"
              />
              <Field
                label="Driver / operator"
                name="operator_name"
                defaultValue={day.operatorName}
                disabled={!canEditLogistics}
              />
              <Field label="Guide" name="guide_name" defaultValue={day.guideName} disabled={!canEditLogistics} />
              <TextArea
                label="Inclusions"
                name="inclusions"
                defaultValue={day.inclusions.join(", ")}
                disabled={!canEditLogistics}
                hint={`Commas or new lines. e.g. ${INCLUSION_SUGGESTIONS.slice(0, 4).join(", ")}`}
                className="sm:col-span-2"
              />
              <Field
                label="Notes on inclusions"
                name="inclusions_notes"
                defaultValue={day.inclusionsNotes}
                disabled={!canEditLogistics}
                className="sm:col-span-2"
              />
              <TextArea
                label="Day notes"
                name="notes"
                defaultValue={day.notes}
                disabled={!canEditLogistics}
                className="sm:col-span-2"
              />
            </div>
          </ActionForm>
          {!canEditLogistics ? (
            <div className="mt-2">
              <ReadOnlyNotice>Your role can&rsquo;t change the logistics of a day.</ReadOnlyNotice>
            </div>
          ) : null}
        </div>

        <div>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-soft">Content</h3>
          <ActionForm
            action={updateDayContent.bind(null, day.id)}
            submitLabel="Save content"
            disabled={!canEditContent}
          >
            <div className="grid gap-3">
              <Field
                label="Photographer"
                name="photographer"
                defaultValue={day.photographer}
                disabled={!canEditContent}
              />
              <Field label="Assist" name="assist" defaultValue={day.assist} disabled={!canEditContent} />
              <Checkbox
                label="Content data collected"
                name="data_collected"
                defaultChecked={day.dataCollected}
                disabled={!canEditContent}
              />
              <Field
                label="Photo / video link"
                name="photo_link"
                type="url"
                defaultValue={day.photoLink}
                disabled={!canEditContent}
                hint="A link to the gallery — never upload the files themselves here."
              />
            </div>
          </ActionForm>
          {!canEditContent ? (
            <div className="mt-2">
              <ReadOnlyNotice>Your role can&rsquo;t change the content fields.</ReadOnlyNotice>
            </div>
          ) : null}
        </div>
      </div>
    </Panel>
  );
}

export function AddDayForm({ bookingId }: { bookingId: string }) {
  return (
    <Panel title="Add a day" description="An extension, or a second day sold after the first.">
      <ActionForm action={addBookingDay.bind(null, bookingId)} submitLabel="Add day">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Date" name="service_date" type="date" required />
          <Field label="Service" name="service_type" suggestions={SERVICE_TYPE_SUGGESTIONS} />
          <Field label="Where" name="service_location" suggestions={LOCATION_SUGGESTIONS} />
        </div>
      </ActionForm>
    </Panel>
  );
}

export function StatusForm({ booking }: { booking: OsBooking }) {
  const [status, setStatus] = useState(booking.status);

  return (
    <Panel
      title="Status"
      description="A booking is never deleted. Cancelling keeps the record, and the reason, so an empty day can still be explained."
    >
      <ActionForm
        action={async (formData: FormData) =>
          setBookingStatus(
            booking.id,
            String(formData.get("status")) as OsBooking["status"],
            String(formData.get("cancellation_reason") ?? ""),
          )
        }
        submitLabel="Save status"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wider text-ink-soft">Status</span>
            <select
              name="status"
              value={status}
              onChange={(event) => setStatus(event.target.value as OsBooking["status"])}
              className="mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-ink shadow-sm"
            >
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          {/* The reason field appears only for a cancellation, because that is
              the only status the database requires one for — and requiring it
              is what keeps an empty day explainable a week later. */}
          {status === "cancelled" ? (
            <Field
              label="Reason"
              name="cancellation_reason"
              required
              defaultValue={booking.cancellationReason}
              hint="Required — it is the only record of why."
            />
          ) : null}
        </div>
      </ActionForm>
      <p className="mt-3 text-xs text-ink-soft">
        Cancelled bookings drop off every day sheet so nobody is sent out, but stay in{" "}
        <Link href="/os/bookings" className="underline">
          the register
        </Link>{" "}
        with their payment history intact.
      </p>
    </Panel>
  );
}
