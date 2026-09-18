import Link from "next/link";
import { Icon } from "./icons";
import { Badge, ReadinessRing, StatusPill } from "./ui";
import { formatTime, formatDuration, dayLabel } from "@/lib/os/dates";
import { formatMoney } from "@/lib/os/money";
import type { TripListItem } from "@/lib/os/trips";

// ---------------------------------------------------------------------------
// How a trip looks everywhere it appears.
//
// One card and one row, shared by the boards, the calendar, the trip list, the
// client profile and the crew member's own day. A trip that reads differently
// on two screens is a trip two people will describe differently on the phone.
// ---------------------------------------------------------------------------

const CREW_ORDER = ["guide", "driver", "photographer", "videographer", "coordinator", "representative", "vehicle", "dress", "equipment"];

export function CrewChips({ crew, missing }: { crew: TripListItem["crew"]; missing?: string[] }) {
  const sorted = [...crew].sort((a, b) => CREW_ORDER.indexOf(a.roleKey) - CREW_ORDER.indexOf(b.roleKey));
  return (
    <div className="flex flex-wrap items-center gap-1">
      {sorted.map((member, i) => (
        <span
          key={`${member.roleKey}-${member.employeeId ?? member.resourceId}-${i}`}
          className="inline-flex items-center gap-1 rounded-md bg-black/[0.045] px-1.5 py-0.5 text-[11px] text-os-muted"
          title={`${member.roleKey.replace("_", " ")} · ${member.status}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${member.status === "confirmed" ? "bg-os-green" : member.status === "proposed" ? "bg-os-faint" : "bg-os-gold"}`} />
          {member.name}
        </span>
      ))}
      {(missing ?? []).map((role) => (
        <span key={role} className="inline-flex items-center gap-1 rounded-md border border-dashed border-os-red/40 bg-os-red-soft px-1.5 py-0.5 text-[11px] font-medium text-os-red">
          No {role.replace("_", " ")}
        </span>
      ))}
    </div>
  );
}

export function TripCard({ trip, showDate = false }: { trip: TripListItem; showDate?: boolean }) {
  const missingRoles = trip.readinessBlockers
    .filter((b) => ["guide", "driver", "photographer", "videographer", "coordinator", "representative", "vehicle", "dress"].includes(b.key))
    .map((b) => b.key);

  return (
    <Link
      href={`/os/trips/${trip.ref}`}
      className="block rounded-xl border border-os-line bg-os-card p-3.5 transition hover:border-os-line-strong hover:shadow-sm"
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 pt-0.5">
          <ReadinessRing score={trip.readinessScore} state={trip.readinessState} size={42} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="os-nums text-[11.5px] font-semibold text-os-faint">{trip.ref}</span>
            <StatusPill label={trip.status} color={statusColor(trip.status)} />
            {trip.clientVip ? <Badge tone="gold">VIP</Badge> : null}
            {trip.priority === "critical" ? <Badge tone="red">Critical</Badge> : null}
          </div>

          <p className="mt-1 truncate text-[14px] font-semibold leading-snug text-os-text">{trip.title}</p>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-os-muted">
            <span className="os-nums inline-flex items-center gap-1">
              <Icon.Clock size={13} />
              {showDate ? `${dayLabel(trip.tripDate)}, ` : ""}
              {formatTime(trip.startTime)}
              {trip.durationMinutes ? ` · ${formatDuration(trip.durationMinutes)}` : ""}
            </span>
            {trip.locationName ? (
              <span className="inline-flex items-center gap-1 truncate"><Icon.Pin size={13} />{trip.locationName}</span>
            ) : null}
            {trip.clientName ? (
              <span className="inline-flex items-center gap-1 truncate"><Icon.Client size={13} />{trip.clientName}</span>
            ) : null}
            <span className="inline-flex items-center gap-1"><Icon.Users size={13} />{trip.guests}</span>
          </div>

          <div className="mt-2">
            <CrewChips crew={trip.crew} missing={missingRoles} />
          </div>

          {trip.readinessState !== "green" && trip.readinessBlockers.length ? (
            <p className="mt-2 line-clamp-2 text-[11.5px] leading-snug text-os-amber">
              {trip.readinessBlockers[0].blocker}
              {trip.readinessBlockers.length > 1 ? ` (+${trip.readinessBlockers.length - 1} more)` : ""}
            </p>
          ) : null}
        </div>

        {trip.money ? (
          <div className="hidden shrink-0 text-right sm:block">
            <p className="os-nums text-[14px] font-semibold text-os-text">{formatMoney(trip.money.sell, trip.money.currency)}</p>
            <p className={`os-nums text-[11.5px] ${trip.money.marginPct < 22 ? "text-os-amber" : "text-os-muted"}`}>
              {trip.money.marginPct}% margin
            </p>
          </div>
        ) : null}
      </div>
    </Link>
  );
}

export function TripRow({ trip }: { trip: TripListItem }) {
  return (
    <tr className="transition hover:bg-black/[0.02]">
      <td className="border-b border-os-line/70 px-3 py-2.5">
        <Link href={`/os/trips/${trip.ref}`} className="block">
          <span className="os-nums block text-[11.5px] font-semibold text-os-faint">{trip.ref}</span>
          <span className="block truncate text-[13px] font-medium text-os-text">{trip.title}</span>
        </Link>
      </td>
      <td className="os-nums whitespace-nowrap border-b border-os-line/70 px-3 py-2.5 text-[12.5px] text-os-muted">
        {dayLabel(trip.tripDate)}
        <span className="block text-[11.5px] text-os-faint">{formatTime(trip.startTime)}</span>
      </td>
      <td className="border-b border-os-line/70 px-3 py-2.5 text-[12.5px] text-os-muted">
        {trip.clientName ?? "—"}
        {trip.clientVip ? <Badge tone="gold" className="ml-1.5">VIP</Badge> : null}
      </td>
      <td className="border-b border-os-line/70 px-3 py-2.5 text-[12.5px] text-os-muted">{trip.typeName ?? "—"}</td>
      <td className="border-b border-os-line/70 px-3 py-2.5"><StatusPill label={trip.status} color={statusColor(trip.status)} /></td>
      <td className="border-b border-os-line/70 px-3 py-2.5">
        <span className="inline-flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${trip.readinessState === "green" ? "bg-os-green" : trip.readinessState === "yellow" ? "bg-os-amber" : "bg-os-red"}`} />
          <span className="os-nums text-[12.5px] font-medium text-os-text">{trip.readinessScore}%</span>
        </span>
      </td>
      <td className="border-b border-os-line/70 px-3 py-2.5">
        <CrewChips crew={trip.crew.slice(0, 3)} />
      </td>
      {trip.money ? (
        <td className="os-nums border-b border-os-line/70 px-3 py-2.5 text-right text-[12.5px]">
          <span className="block font-medium text-os-text">{formatMoney(trip.money.sell, trip.money.currency)}</span>
          <span className={trip.money.marginPct < 22 ? "text-os-amber" : "text-os-faint"}>{trip.money.marginPct}%</span>
        </td>
      ) : null}
    </tr>
  );
}

// The status colours the demo configuration ships with. Statuses are
// configurable, so a screen that has loaded the status table passes the real
// colour through StatusPill; this is only the fallback for compact contexts.
const STATUS_COLORS: Record<string, string> = {
  draft: "#9ca3af",
  confirmed: "#5c7a5f",
  planning: "#8faa8f",
  assigned: "#c9a227",
  ready: "#2f7a55",
  in_progress: "#c9a227",
  completed: "#4a5c4f",
  content_pending: "#a8562e",
  client_follow_up: "#8c6d1f",
  closed: "#16211c",
  cancelled: "#b3261e",
};

export function statusColor(key: string): string {
  return STATUS_COLORS[key] ?? "#8d9791";
}
