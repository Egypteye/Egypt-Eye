import { notFound } from "next/navigation";
import { getActor, can } from "@/lib/os/actor";
import { getTripRecord } from "@/lib/os/trips";
import { osdb } from "@/lib/os/db";
import { findCandidates, findResourceCandidates } from "@/lib/os/conflicts";
import { formatClock, relativeTime } from "@/lib/os/dates";
import { Card, CardHeader, NoAccess, Badge, EmptyState } from "@/components/os/ui";
import { AssignPanel } from "./AssignPanel";
import { AssignmentRow } from "./AssignmentRow";
import { Icon } from "@/components/os/icons";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// CREW AND RESOURCES
// ---------------------------------------------------------------------------
// The assignment screen ranks candidates rather than listing them
// alphabetically, and shows WHY each one is ranked where it is: availability
// first, then language and skills against what this trip needs, then workload,
// then past performance. Every reason is a sentence a human can argue with,
// which is the standard the AI layer will have to meet later too.
//
// Somebody who is genuinely unavailable is shown, greyed, with the reason.
// Hiding them produces the question "where is Ahmed?" every single time.
// ---------------------------------------------------------------------------

const CREW_SLOTS = [
  { key: "guide", label: "Guide" },
  { key: "driver", label: "Driver" },
  { key: "photographer", label: "Photographer" },
  { key: "videographer", label: "Videographer" },
  { key: "coordinator", label: "Coordinator" },
  { key: "representative", label: "Representative" },
];

const RESOURCE_SLOTS = [
  { key: "vehicle", label: "Vehicle", kind: "vehicle" },
  { key: "dress", label: "Dress", kind: "dress" },
  { key: "equipment", label: "Equipment", kind: "equipment" },
];

export default async function TripTeamPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const actor = await getActor();
  if (!actor) return null;

  const trip = await getTripRecord(actor, ref.toUpperCase());
  if (!trip) notFound();

  const canAssign = can(actor, "trips.assign");
  const db = osdb();

  const { data: assignments } = await db
    .from("os_trip_assignments")
    .select(
      "id, role_key, status, rate_amount, rate_currency, field_status, field_status_at, override_reason, assigned_at, " +
      "employee_id, resource_id, os_employees ( full_name, job_title, phone, languages ), os_resources ( name, code, kind )",
    )
    .eq("trip_id", trip.id)
    .not("status", "in", '("released","declined","replaced")')
    .order("role_key");

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const current = (assignments ?? []) as any[];
  /* eslint-enable @typescript-eslint/no-explicit-any */

  // Which roles this trip actually needs, from its type's requirements.
  const { data: type } = await db.from("os_trip_types").select("requirements, name").eq("id", trip.trip_type_id).maybeSingle();
  const requirements = (type?.requirements ?? {}) as Record<string, boolean>;

  const window = { startsAt: trip.starts_at as string, endsAt: trip.ends_at as string };
  const partySize = Number(trip.guests_adults ?? 0) + Number(trip.guests_children ?? 0);

  // Only fetch candidates for roles that are needed and not yet filled — the
  // ranking is real work, and doing it for slots nobody is looking at is waste.
  const openCrewSlots = CREW_SLOTS.filter((s) => requirements[s.key] && !current.some((a) => a.role_key === s.key));
  const openResourceSlots = RESOURCE_SLOTS.filter((s) => requirements[s.key] && !current.some((a) => a.role_key === s.key));

  let clientLanguage: string | null = null;
  if (trip.client_id) {
    const { data: client } = await db.from("os_clients").select("language").eq("id", trip.client_id).maybeSingle();
    clientLanguage = (client?.language as string) ?? null;
  }

  const crewCandidates = canAssign
    ? await Promise.all(
        openCrewSlots.map(async (slot) => ({
          slot,
          candidates: await findCandidates(slot.key, window, {
            tripId: trip.id as string,
            unitId: trip.unit_id as string | null,
            locationId: trip.location_id as string | null,
            languages: clientLanguage ? [clientLanguage] : undefined,
          }),
        })),
      )
    : [];

  const resourceCandidates = canAssign
    ? await Promise.all(
        openResourceSlots.map(async (slot) => ({
          slot,
          candidates: await findResourceCandidates(slot.kind, window, {
            tripId: trip.id as string,
            minCapacity: slot.kind === "vehicle" ? Math.max(1, partySize) : undefined,
            unitId: trip.unit_id as string | null,
          }),
        })),
      )
    : [];

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
      <div className="space-y-5">
        <Card padded={false}>
          <div className="border-b border-os-line px-4 py-3 sm:px-5">
            <CardHeader
              title="On this trip"
              subtitle={current.length ? `${current.length} assigned` : "Nobody assigned yet"}
            />
          </div>
          {current.length ? (
            <ul>
              {current.map((assignment) => (
                <li key={assignment.id} className="border-b border-os-line/60 px-4 py-3 last:border-0 sm:px-5">
                  <AssignmentRow
                    tripRef={ref.toUpperCase()}
                    assignment={{
                      id: assignment.id,
                      roleKey: assignment.role_key,
                      status: assignment.status,
                      name: assignment.os_employees?.full_name ?? assignment.os_resources?.name ?? "Unknown",
                      subtitle: assignment.os_employees?.job_title ?? assignment.os_resources?.code ?? null,
                      fieldStatus: assignment.field_status,
                      fieldStatusAt: assignment.field_status_at ? relativeTime(assignment.field_status_at) : null,
                      overrideReason: assignment.override_reason,
                      assignedAt: relativeTime(assignment.assigned_at),
                    }}
                    canAssign={canAssign}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-6 sm:px-5">
              <EmptyState
                title="Nobody is on this trip yet"
                description={canAssign
                  ? "Pick from the ranked candidates on the right. Anyone with a scheduling conflict is shown with the reason."
                  : "Operations will staff this trip. You will be notified if you are assigned."}
                icon={<Icon.Users size={24} />}
              />
            </div>
          )}
        </Card>

        {current.some((a) => a.field_status) ? (
          <Card>
            <CardHeader title="Field reports" subtitle="What the crew reported from their phones" />
            <ul className="mt-3 space-y-2">
              {current.filter((a) => a.field_status).map((a) => (
                <li key={a.id} className="flex items-center gap-2.5 text-[13px]">
                  <Badge tone={a.field_status === "issue" ? "red" : a.field_status === "completed" ? "green" : "gold"}>
                    {String(a.field_status).replace(/_/g, " ")}
                  </Badge>
                  <span className="font-medium text-os-text">{a.os_employees?.full_name}</span>
                  <span className="text-os-faint">{formatClock(a.field_status_at)}</span>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}
      </div>

      <div className="space-y-5">
        {!canAssign ? (
          <NoAccess what="assigning crew" permission="trips.assign" />
        ) : openCrewSlots.length === 0 && openResourceSlots.length === 0 ? (
          <Card>
            <CardHeader
              title="Fully staffed"
              subtitle={`Every role this ${type?.name ?? "trip"} needs is filled. Add an extra person below if the trip needs one.`}
            />
            <div className="mt-4">
              <AssignPanel
                tripRef={ref.toUpperCase()}
                slots={[...CREW_SLOTS.map((s) => ({ ...s, kind: "crew" as const })), ...RESOURCE_SLOTS.map((s) => ({ key: s.key, label: s.label, kind: "resource" as const }))]}
                candidates={[]}
                resourceCandidates={[]}
                collapsed
              />
            </div>
          </Card>
        ) : (
          <>
            {crewCandidates.map(({ slot, candidates }) => (
              <AssignPanel
                key={slot.key}
                tripRef={ref.toUpperCase()}
                slots={[{ ...slot, kind: "crew" }]}
                candidates={candidates.map((c) => ({
                  id: c.employeeId,
                  name: c.name,
                  subtitle: [c.jobTitle, c.homeCity].filter(Boolean).join(" · "),
                  available: c.available,
                  reasons: c.reasons,
                  meta: [
                    c.languages.length ? c.languages.join(", ") : null,
                    c.avgRating ? `${c.avgRating}/5 rated` : null,
                    `${c.assignmentsThisWeek} this week`,
                  ].filter(Boolean) as string[],
                  conflicts: c.conflicts.map((x) => ({ severity: x.severity, title: x.title, detail: x.detail })),
                }))}
                resourceCandidates={[]}
              />
            ))}
            {resourceCandidates.map(({ slot, candidates }) => (
              <AssignPanel
                key={slot.key}
                tripRef={ref.toUpperCase()}
                slots={[{ key: slot.key, label: slot.label, kind: "resource" }]}
                candidates={[]}
                resourceCandidates={candidates.map((c) => ({
                  id: c.resourceId,
                  name: c.name,
                  subtitle: [c.code, c.capacity ? `seats ${c.capacity}` : null, c.condition].filter(Boolean).join(" · "),
                  available: c.available,
                  reasons: c.reasons,
                  meta: [],
                  conflicts: c.conflicts.map((x) => ({ severity: x.severity, title: x.title, detail: x.detail })),
                }))}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
