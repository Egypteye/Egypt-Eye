import { getActor, canAny } from "@/lib/os/actor";
import { osdb, getOrg } from "@/lib/os/db";
import { PageHeader, NoAccess, Card, CardHeader, Badge, Table, Th, Td, Notice } from "@/components/os/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Catalog" };

// Business units, services and the lifecycle. The interesting column is
// "readiness contract": adding a new Egypt Eye service is a row here declaring
// what it needs, and readiness, task generation and conflict checking all
// follow from it without a code change.
const REQUIREMENT_LABELS: Record<string, string> = {
  guide: "guide", driver: "driver", photographer: "photographer", videographer: "videographer",
  coordinator: "coordinator", representative: "representative", vehicle: "vehicle", dress: "dress",
  equipment: "equipment", client_contact: "client contact", pickup: "pickup", itinerary: "itinerary",
  tickets: "tickets", supplier_confirmation: "supplier confirmation", media_folder: "media folder",
  pricing: "price", blocking_tasks: "blocking tasks",
};

export default async function CatalogPage() {
  const actor = await getActor();
  if (!actor) return null;
  if (!canAny(actor, "admin.catalog", "admin.units")) return <NoAccess what="the catalog" permission="admin.catalog" />;

  const db = osdb();
  const org = await getOrg();

  const [{ data: units }, { data: types }, { data: statuses }, { data: tags }, { data: locations }] = await Promise.all([
    db.from("os_business_units").select("id, key, name, description, color, active, sort_order").eq("org_id", org.id).order("sort_order"),
    db.from("os_trip_types").select("id, key, name, description, color, default_duration_minutes, requirements, active, os_business_units ( name ), os_task_templates ( name )").eq("org_id", org.id).order("sort_order"),
    db.from("os_trip_statuses").select("id, key, label, category, color, sort_order, requires_readiness, is_terminal, active").eq("org_id", org.id).order("sort_order"),
    db.from("os_tags").select("id, key, label, color, applies_to, description").eq("org_id", org.id).order("key"),
    db.from("os_locations").select("id, name, city, kind, typical_drive_minutes, active").eq("org_id", org.id).order("name"),
  ]);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const typeRows = (types ?? []) as any[];
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Units, services and statuses"
        description="The shape of the business, as configuration rather than code."
      />

      <div className="mb-5">
        <Notice tone="blue" title="Adding a service does not need a developer">
          A service is a row with a readiness contract — what it must have before it can run. Readiness scoring, task
          generation and conflict checking all read that contract, so declaring one is the whole job. Editing these rows is a
          migration for now; the schema and the engines are already configuration-driven.
        </Notice>
      </div>

      <div className="space-y-6">
        <Card padded={false}>
          <div className="border-b border-os-line px-4 py-3 sm:px-5">
            <CardHeader title="Business units" subtitle="Not separate applications — a scoping boundary and an attribute of a trip." />
          </div>
          <Table className="rounded-none border-0">
            <thead><tr><Th>Unit</Th><Th>Key</Th><Th>Description</Th><Th>Status</Th></tr></thead>
            <tbody>
              {(units ?? []).map((unit) => (
                <tr key={unit.id as string}>
                  <Td>
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: unit.color as string }} />
                      <span className="text-[13px] font-medium text-os-text">{unit.name as string}</span>
                    </span>
                  </Td>
                  <Td><code className="rounded bg-black/[0.05] px-1.5 py-0.5 text-[11.5px]">{unit.key as string}</code></Td>
                  <Td className="text-[12px] text-os-muted">{(unit.description as string) ?? "—"}</Td>
                  <Td>{unit.active ? <Badge tone="green">Active</Badge> : <Badge tone="neutral">Inactive</Badge>}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        <Card padded={false}>
          <div className="border-b border-os-line px-4 py-3 sm:px-5">
            <CardHeader title="Services" subtitle="Each one declares what it needs before it can run." />
          </div>
          <Table className="rounded-none border-0">
            <thead><tr><Th>Service</Th><Th>Unit</Th><Th>Duration</Th><Th>Readiness contract</Th><Th>Checklist</Th></tr></thead>
            <tbody>
              {typeRows.map((type) => {
                const requirements = Object.entries((type.requirements ?? {}) as Record<string, boolean>)
                  .filter(([, required]) => required)
                  .map(([key]) => REQUIREMENT_LABELS[key] ?? key);
                return (
                  <tr key={type.id}>
                    <Td>
                      <span className="block text-[13px] font-medium text-os-text">{type.name}</span>
                      <span className="block text-[11px] text-os-faint">{type.key}</span>
                    </Td>
                    <Td className="text-[12px] text-os-muted">{type.os_business_units?.name ?? "—"}</Td>
                    <Td className="os-nums text-[12px] text-os-muted">{Math.round(Number(type.default_duration_minutes) / 60)}h</Td>
                    <Td>
                      <span className="flex flex-wrap gap-1">
                        {requirements.map((requirement) => (
                          <span key={requirement} className="rounded bg-black/[0.05] px-1.5 py-0.5 text-[10.5px] text-os-muted">{requirement}</span>
                        ))}
                        {!requirements.length ? <span className="text-[11.5px] text-os-amber">nothing required</span> : null}
                      </span>
                    </Td>
                    <Td className="text-[12px] text-os-muted">{type.os_task_templates?.name ?? <span className="text-os-amber">none</span>}</Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card>

        <Card padded={false}>
          <div className="border-b border-os-line px-4 py-3 sm:px-5">
            <CardHeader
              title="Trip lifecycle"
              subtitle="Statuses are configuration. The category is what code branches on, so a renamed or added status still behaves sensibly."
            />
          </div>
          <Table className="rounded-none border-0">
            <thead><tr><Th>Status</Th><Th>Category</Th><Th>Gate</Th><Th>Terminal</Th></tr></thead>
            <tbody>
              {(statuses ?? []).map((status) => (
                <tr key={status.id as string}>
                  <Td>
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: status.color as string }} />
                      <span className="text-[13px] font-medium text-os-text">{status.label as string}</span>
                    </span>
                  </Td>
                  <Td className="text-[12px] capitalize text-os-muted">{status.category as string}</Td>
                  <Td>{status.requires_readiness ? <Badge tone="amber">Needs full readiness</Badge> : <span className="text-os-faint">—</span>}</Td>
                  <Td>{status.is_terminal ? <Badge tone="neutral">Terminal</Badge> : <span className="text-os-faint">—</span>}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card padded={false}>
            <div className="border-b border-os-line px-4 py-3">
              <CardHeader title="Tags" subtitle="The company's shared vocabulary" />
            </div>
            <ul className="p-4">
              {(tags ?? []).map((tag) => (
                <li key={tag.id as string} className="mb-2 last:mb-0">
                  <span className="rounded px-1.5 py-0.5 text-[11.5px] font-medium" style={{ background: `${tag.color}22`, color: "#16211c" }}>
                    {tag.label as string}
                  </span>
                  {tag.description ? <span className="ml-2 text-[11.5px] text-os-muted">{tag.description as string}</span> : null}
                </li>
              ))}
            </ul>
          </Card>

          <Card padded={false}>
            <div className="border-b border-os-line px-4 py-3">
              <CardHeader title="Locations" subtitle="Where the operational knowledge lives" />
            </div>
            <ul className="p-4">
              {(locations ?? []).map((location) => (
                <li key={location.id as string} className="mb-1.5 flex items-baseline justify-between gap-3 text-[12.5px] last:mb-0">
                  <span className="text-os-text">{location.name as string}</span>
                  <span className="os-nums shrink-0 text-[11.5px] text-os-faint">
                    {location.city as string}
                    {location.typical_drive_minutes ? ` · ${location.typical_drive_minutes}m` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
