import Link from "next/link";
import { notFound } from "next/navigation";
import { getActor, can } from "@/lib/os/actor";
import { getTrip } from "@/lib/os/trips";
import { getStatuses } from "@/lib/os/status";
import { formatDate, formatTime, formatDuration } from "@/lib/os/dates";
import { formatMoney } from "@/lib/os/money";
import { Badge, ReadinessRing, buttonClass } from "@/components/os/ui";
import { Icon } from "@/components/os/icons";
import { TripTabs } from "./TripTabs";
import { StatusControl } from "./StatusControl";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// TRIP 360
// ---------------------------------------------------------------------------
// Everything about one operation in one place: who is on it, what it costs,
// what has been decided, what is missing, and the whole conversation. The
// header is constant across every tab because the three facts a coordinator
// checks most — when, how ready, and what the status is — should never be more
// than a glance away.
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  return { title: ref.toUpperCase() };
}

export default async function TripLayout({
  children, params,
}: {
  children: React.ReactNode;
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  const actor = await getActor();
  if (!actor) return null;

  const trip = await getTrip(actor, ref.toUpperCase());
  if (!trip) notFound();

  const statuses = await getStatuses();
  const status = statuses.find((s) => s.key === trip.status);

  return (
    <div>
      <div className="mb-4">
        <Link href="/os/trips" className="inline-flex items-center gap-1 text-[12.5px] font-medium text-os-muted transition hover:text-os-text">
          <Icon.ArrowLeft size={14} />All trips
        </Link>
      </div>

      <header className="mb-4 rounded-xl border border-os-line bg-os-card p-4 sm:p-5">
        <div className="flex flex-wrap items-start gap-4">
          <div className="shrink-0">
            <ReadinessRing score={trip.readinessScore} state={trip.readinessState} size={62} />
            <p className="mt-1 text-center text-[10.5px] font-medium uppercase tracking-[0.06em] text-os-faint">
              {trip.readinessState === "green" ? "Ready" : trip.readinessState === "yellow" ? "At risk" : "Not ready"}
            </p>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="os-nums text-[12px] font-semibold text-os-faint">{trip.ref}</span>
              {trip.typeName ? <Badge tone="neutral">{trip.typeName}</Badge> : null}
              {trip.unitName ? <Badge tone="neutral">{trip.unitName}</Badge> : null}
              {trip.clientVip ? <Badge tone="gold">VIP</Badge> : null}
              {trip.priority === "critical" ? <Badge tone="red">Critical</Badge> : null}
            </div>

            <h1 className="mt-1 text-[20px] font-semibold leading-tight text-os-text sm:text-[23px]">{trip.title}</h1>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-os-muted">
              <span className="os-nums inline-flex items-center gap-1.5">
                <Icon.Calendar size={14} />
                {formatDate(trip.tripDate)} · {formatTime(trip.startTime)}
                {trip.durationMinutes ? ` (${formatDuration(trip.durationMinutes)})` : ""}
              </span>
              {trip.locationName ? <span className="inline-flex items-center gap-1.5"><Icon.Pin size={14} />{trip.locationName}</span> : null}
              {trip.clientName ? (
                <Link href={trip.clientId ? `/os/clients/${trip.clientId}` : "#"} className="inline-flex items-center gap-1.5 hover:text-os-text">
                  <Icon.Client size={14} />{trip.clientName}
                </Link>
              ) : null}
              <span className="inline-flex items-center gap-1.5"><Icon.Users size={14} />{trip.guests} guests</span>
              {trip.money ? (
                <span className="os-nums inline-flex items-center gap-1.5 font-medium text-os-text">
                  <Icon.Money size={14} />{formatMoney(trip.money.sell, trip.money.currency)}
                  <span className={trip.money.marginPct < 22 ? "text-os-amber" : "text-os-muted"}>· {trip.money.marginPct}%</span>
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 os-no-print">
            {can(actor, "trips.status") ? (
              <StatusControl
                tripRef={trip.ref}
                current={trip.status}
                statuses={statuses.map((s) => ({ key: s.key, label: s.label, color: s.color, category: s.category }))}
                canOverride={can(actor, "approvals.decide")}
              />
            ) : status ? (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-os-line-strong bg-white px-2.5 py-2 text-[13px] font-medium">
                <span className="h-2 w-2 rounded-full" style={{ background: status.color }} />
                {status.label}
              </span>
            ) : null}
            <Link href={`/os/trips/${trip.ref}/brief`} className={buttonClass.secondary}>
              <Icon.Print size={15} />Brief
            </Link>
          </div>
        </div>
      </header>

      <TripTabs tripRef={trip.ref} permissions={{
        costs: can(actor, "trips.financials") || can(actor, "finance.view"),
        media: can(actor, "media.view"),
        documents: can(actor, "documents.view"),
        chat: can(actor, "chat.view"),
        tasks: can(actor, "tasks.view"),
      }} />

      <div className="mt-4">{children}</div>
    </div>
  );
}
