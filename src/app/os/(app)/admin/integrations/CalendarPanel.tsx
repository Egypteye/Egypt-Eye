"use client";

import { useAction, ActionFeedback, Spinner } from "@/components/os/action";
import { Card, CardHeader, Badge, Notice, Table, Th, Td, buttonClass } from "@/components/os/ui";
import { formatDateTime } from "@/lib/os/dates";
import {
  testCalendarConnection,
  publishCalendarNow,
  retryFailedCalendarPublishes,
} from "@/lib/os/actions/calendar";
import type { CalendarSyncStatus } from "@/lib/os/calendar-sync";

// ---------------------------------------------------------------------------
// GOOGLE CALENDAR — the operator's view of a background job
// ---------------------------------------------------------------------------
// A queue that publishes on a schedule is invisible until it breaks, and an
// integration that breaks invisibly is worse than one that was never built:
// people stop checking the OS because "it's in the calendar", and then the
// calendar is three days stale and nobody knows.
//
// So the counts are on screen, every failure is named with the trip it belongs
// to and Google's own words for why, and the two things you would otherwise
// wait an hour to learn — can it reach the calendar, and does publishing
// actually work — are buttons.
// ---------------------------------------------------------------------------

export function CalendarPanel({ status }: { status: CalendarSyncStatus }) {
  const test = useAction(testCalendarConnection);
  const publish = useAction(publishCalendarNow);
  const retry = useAction(retryFailedCalendarPublishes);
  const busy = test.pending || publish.pending || retry.pending;

  const { counts } = status;
  const total = counts.synced + counts.pending + counts.removing + counts.failed;

  return (
    <Card className={status.configured ? "" : "border-dashed"}>
      <CardHeader
        title="Google Calendar"
        subtitle="Confirmed trips, published to a shared calendar the crew can subscribe to."
      />

      {!status.configured ? (
        <div className="mt-2.5">
          <Notice tone="amber" title="Built, not connected">
            The publishing engine is here and the hourly sweep will start using it the moment three variables exist:{" "}
            <code className="rounded bg-black/[0.05] px-1">GOOGLE_SERVICE_ACCOUNT_EMAIL</code>,{" "}
            <code className="rounded bg-black/[0.05] px-1">GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY</code> and{" "}
            <code className="rounded bg-black/[0.05] px-1">GOOGLE_CALENDAR_ID</code>. Until then nothing is published and
            nothing pretends to be — see the README for the five-minute setup.
          </Notice>
        </div>
      ) : (
        <>
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <Badge tone="green">Connected</Badge>
            <span className="text-[12px] text-os-faint">{status.calendarId}</span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Count label="In step" value={counts.synced} tone="green" />
            <Count label="Waiting" value={counts.pending + counts.removing} />
            <Count label="Failed" value={counts.failed} tone={counts.failed ? "red" : undefined} />
            <Count label="Removed" value={counts.removed} />
          </div>

          <p className="mt-2.5 text-[12px] leading-relaxed text-os-muted">
            {total === 0
              ? "Nothing queued yet. The hourly sweep picks up every publishable trip on its next run — or press Publish now."
              : `Last published ${status.lastSyncedAt ? formatDateTime(status.lastSyncedAt) : "never"}. The sweep runs hourly; a trip you change is queued immediately and goes out on the next run.`}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <button className={buttonClass.secondary} disabled={busy} onClick={() => test.run()}>
              {test.pending ? <Spinner /> : null} Test connection
            </button>
            <button className={buttonClass.primary} disabled={busy} onClick={() => publish.run()}>
              {publish.pending ? <Spinner /> : null} Publish now
            </button>
            {counts.failed > 0 ? (
              <button className={buttonClass.secondary} disabled={busy} onClick={() => retry.run()}>
                {retry.pending ? <Spinner /> : null} Try the {counts.failed} failed again
              </button>
            ) : null}
          </div>

          <div className="mt-2.5 space-y-2">
            <ActionFeedback result={test.result} onDismiss={test.clear} />
            <ActionFeedback result={publish.result} onDismiss={publish.clear} />
            <ActionFeedback result={retry.result} onDismiss={retry.clear} />
          </div>

          {status.failures.length ? (
            <div className="mt-3.5">
              <p className="mb-1.5 text-[12.5px] font-semibold text-os-text">Trips that did not publish</p>
              <Table>
                <thead>
                  <tr>
                    <Th>Trip</Th>
                    <Th>What Google said</Th>
                    <Th align="right">Tries</Th>
                    <Th align="right">Last tried</Th>
                  </tr>
                </thead>
                <tbody>
                  {status.failures.map((failure, index) => (
                    <tr key={`${failure.ref}-${index}`}>
                      <Td>
                        <span className="font-medium text-os-text">{failure.ref}</span>
                        <span className="block text-[11.5px] text-os-faint">{failure.title}</span>
                      </Td>
                      <Td className="text-os-red">{failure.error}</Td>
                      <Td align="right">{failure.attempts}</Td>
                      <Td align="right">{failure.at ? formatDateTime(failure.at) : "—"}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : null}
        </>
      )}

      <p className="mt-3.5 text-[11.5px] leading-relaxed text-os-faint">
        One-way, deliberately. The OS is the schedule and the Google event is a copy of it — anyone dragging an event in their
        own calendar app moves the copy, and the next publish puts it back. Client phone numbers and email addresses are never
        written to the event: a shared calendar is the loosest container in the company, and whoever it is shared with next
        reads everything already on it.
      </p>
    </Card>
  );
}

function Count({ label, value, tone }: { label: string; value: number; tone?: "green" | "red" }) {
  const colour = tone === "green" ? "text-os-green" : tone === "red" ? "text-os-red" : "text-os-text";
  return (
    <div className="rounded-lg border border-os-line bg-black/[0.015] px-3 py-2">
      <p className={`text-[18px] font-semibold tabular-nums ${colour}`}>{value}</p>
      <p className="text-[11.5px] text-os-muted">{label}</p>
    </div>
  );
}
