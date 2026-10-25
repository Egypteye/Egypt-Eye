"use client";

import { useRouter } from "next/navigation";
import { ActionForm } from "../../ActionForm";
import { Field, Panel, TextArea } from "../../Fields";
import {
  INCLUSION_SUGGESTIONS,
  LOCATION_SUGGESTIONS,
  SERVICE_TYPE_SUGGESTIONS,
  SOURCE_SUGGESTIONS,
} from "@/lib/os/model";
import type { OsLead } from "@/lib/os/data";
import { createBooking } from "../actions";

export function NewBookingForm({
  lead,
  today,
  owner,
}: {
  lead: OsLead | null;
  today: string;
  owner: string;
}) {
  const router = useRouter();

  return (
    <ActionForm
      action={createBooking}
      submitLabel="Create booking"
      submittingLabel="Creating…"
      // Straight to the new booking, which is where the pick-up times and
      // the crew get filled in.
      onSuccess={(result) => {
        if (result.ref) router.push(`/os/bookings/${result.ref}`);
      }}
    >
      {lead ? <input type="hidden" name="lead_id" value={lead.id} /> : null}

      <div className="space-y-4">
        <Panel title="Guest">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Guest name" name="guest_name" required defaultValue={lead?.guestName} />
            <Field
              label="Guests"
              name="pax"
              type="number"
              min={1}
              required
              defaultValue={lead?.pax ?? 2}
            />
            <Field
              label="Phone / WhatsApp"
              name="guest_phone"
              defaultValue={lead?.contact}
              hint="The crew calls this number when a guest isn't at the lobby."
            />
            <Field label="Email" name="guest_email" type="email" />
            <Field
              label="Booked via"
              name="source"
              suggestions={SOURCE_SUGGESTIONS}
              defaultValue={lead?.platform}
              hint="Egypt Eye's own booking, or an Airbnb / Booking.com one."
            />
            <Field label="Reservation owner" name="reservation_owner" defaultValue={owner} />
          </div>
        </Panel>

        <Panel
          title="Dates"
          description="A multi-day trip becomes one row per day on the day sheet — the crew works a day at a time."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First day" name="start_date" type="date" required defaultValue={today} />
            <Field
              label="Last day"
              name="end_date"
              type="date"
              hint="Leave blank for a single day."
            />
            <Field label="Service" name="service_type" suggestions={SERVICE_TYPE_SUGGESTIONS} />
            <Field label="Where" name="service_location" suggestions={LOCATION_SUGGESTIONS} />
          </div>
          <p className="mt-3 text-xs text-ink-soft">
            Pick-up times, drivers and guides are set per day on the booking&rsquo;s own screen — usually by
            operations, once the day is close enough to know. Inclusions such as{" "}
            {INCLUSION_SUGGESTIONS.slice(0, 3).join(", ")} go there too.
          </p>
        </Panel>

        <Panel
          title="Money"
          description="Stored once, on the booking. It is never repeated per day, so a four-day trip counts once."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Total (USD)" name="total_usd" type="number" min={0} step="0.01" defaultValue={0} />
            <Field
              label="Deposit paid (USD)"
              name="deposit_usd"
              type="number"
              min={0}
              step="0.01"
              defaultValue={0}
              hint="What's left is worked out from these two — never typed in."
            />
          </div>
        </Panel>

        <Panel title="Notes">
          <TextArea label="Anything the crew should know" name="notes" rows={3} />
        </Panel>
      </div>
    </ActionForm>
  );
}
