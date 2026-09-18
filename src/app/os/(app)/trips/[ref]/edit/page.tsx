import { notFound } from "next/navigation";
import { getActor, can } from "@/lib/os/actor";
import { getTripRecord } from "@/lib/os/trips";
import { osdb, getOrg } from "@/lib/os/db";
import { Card, CardHeader, NoAccess } from "@/components/os/ui";
import { EditTripForm } from "./EditTripForm";

export const dynamic = "force-dynamic";

export default async function EditTripPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "trips.edit")) return <NoAccess what="editing this trip" permission="trips.edit" />;

  const trip = await getTripRecord(actor, ref.toUpperCase());
  if (!trip) notFound();

  const db = osdb();
  const org = await getOrg();
  const [clients, locations] = await Promise.all([
    db.from("os_clients").select("id, code, full_name, company_name").eq("org_id", org.id).is("archived_at", null).order("full_name").limit(500),
    db.from("os_locations").select("id, name, city").eq("org_id", org.id).eq("active", true).order("name"),
  ]);

  return (
    <Card className="max-w-3xl">
      <CardHeader
        title="Edit the trip"
        subtitle="Changing a date, time or pickup notifies everyone assigned — a driver at the wrong hotel is the expensive version of this mistake."
      />
      <div className="mt-4">
        <EditTripForm
          tripRef={ref.toUpperCase()}
          initial={{
            title: (trip.title as string) ?? "",
            trip_date: (trip.trip_date as string) ?? "",
            start_time: ((trip.start_time as string) ?? "").slice(0, 5),
            end_time: ((trip.end_time as string) ?? "").slice(0, 5),
            location_id: (trip.location_id as string) ?? "",
            pickup_location: (trip.pickup_location as string) ?? "",
            pickup_time: ((trip.pickup_time as string) ?? "").slice(0, 5),
            dropoff_location: (trip.dropoff_location as string) ?? "",
            guests_adults: String(trip.guests_adults ?? 0),
            guests_children: String(trip.guests_children ?? 0),
            client_id: (trip.client_id as string) ?? "",
            source: (trip.source as string) ?? "",
            priority: (trip.priority as string) ?? "normal",
            special_requests: (trip.special_requests as string) ?? "",
            notes_internal: (trip.notes_internal as string) ?? "",
            emergency_notes: (trip.emergency_notes as string) ?? "",
          }}
          clients={(clients.data ?? []).map((c) => ({ id: c.id as string, label: `${(c.company_name as string) || (c.full_name as string)} (${c.code})` }))}
          locations={(locations.data ?? []).map((l) => ({ id: l.id as string, label: `${l.name}${l.city ? ` — ${l.city}` : ""}` }))}
        />
      </div>
    </Card>
  );
}
