import { getActor, can } from "@/lib/os/actor";
import { osdb, getOrg } from "@/lib/os/db";
import { PageHeader, NoAccess, Card } from "@/components/os/ui";
import { NewTripForm } from "./NewTripForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "New trip" };

// The moment the OS begins. The reservation desk has closed a deal somewhere
// outside this system — Instagram, WhatsApp, a booking platform — and this is
// where that becomes an operation with a checklist, a channel, and a readiness
// score.
export default async function NewTripPage() {
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "trips.create")) return <NoAccess what="creating trips" permission="trips.create" />;

  const db = osdb();
  const org = await getOrg();

  const [types, clients, locations] = await Promise.all([
    db.from("os_trip_types").select("id, key, name, description, default_duration_minutes, os_business_units ( name )")
      .eq("org_id", org.id).eq("active", true).order("sort_order"),
    db.from("os_clients").select("id, code, full_name, company_name, vip")
      .eq("org_id", org.id).is("archived_at", null).order("full_name").limit(500),
    db.from("os_locations").select("id, name, city").eq("org_id", org.id).eq("active", true).order("name"),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Reservations"
        title="New trip"
        description="A confirmed booking becomes an operation here. Creating it generates the service's checklist, opens its channel, and starts scoring its readiness."
      />

      <Card className="max-w-3xl">
        <NewTripForm
          types={(types.data ?? []).map((t) => ({
            id: t.id as string,
            name: t.name as string,
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            unit: (t as any).os_business_units?.name ?? null,
            description: (t.description as string) ?? null,
          }))}
          clients={(clients.data ?? []).map((c) => ({
            id: c.id as string,
            label: `${(c.company_name as string) || (c.full_name as string)}${c.vip ? " · VIP" : ""} (${c.code})`,
          }))}
          locations={(locations.data ?? []).map((l) => ({
            id: l.id as string,
            label: `${l.name}${l.city ? ` — ${l.city}` : ""}`,
          }))}
          canSetPrice={can(actor, "trips.financials")}
        />
      </Card>
    </>
  );
}
