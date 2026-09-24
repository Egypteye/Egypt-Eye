import Link from "next/link";
import { notFound } from "next/navigation";
import { getActor, can } from "@/lib/os/actor";
import { osdb, getOrg } from "@/lib/os/db";
import { formatDate, relativeTime } from "@/lib/os/dates";
import { formatMoney } from "@/lib/os/money";
import { PageHeader, NoAccess, Card, CardHeader, Badge, Stat, EmptyState, Table, Th, Td } from "@/components/os/ui";
import { Icon } from "@/components/os/icons";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data } = await osdb().from("os_suppliers").select("name").eq("id", id).maybeSingle();
  return { title: (data?.name as string) ?? "Supplier" };
}

export default async function SupplierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "suppliers.view")) return <NoAccess what="suppliers" permission="suppliers.view" />;

  const db = osdb();
  const org = await getOrg();

  const { data: supplier } = await db.from("os_suppliers").select("*").eq("id", id).eq("org_id", org.id).maybeSingle();
  if (!supplier) notFound();

  const showRates = can(actor, "suppliers.rates") || can(actor, "finance.view");

  const [{ data: services }, { data: costs }, { data: incidents }, { data: reviews }] = await Promise.all([
    db.from("os_supplier_services").select("id, name, category, unit_label, lead_time_hours, notes, active").eq("supplier_id", id).order("category"),
    showRates
      ? db.from("os_trip_cost_lines")
          .select("id, label, amount, currency, base_amount, incurred_on, kind, os_trips ( ref, title, trip_date )")
          .eq("supplier_id", id).order("incurred_on", { ascending: false, nullsFirst: false }).limit(40)
      : Promise.resolve({ data: null }),
    can(actor, "incidents.view")
      ? db.from("os_incidents").select("id, ref, title, severity, status, occurred_at, os_trips ( ref )").eq("subject_supplier_id", id).order("occurred_at", { ascending: false })
      : Promise.resolve({ data: null }),
    db.from("os_performance_reviews").select("id, rating, note, created_at, os_trips ( ref )").eq("supplier_id", id).order("created_at", { ascending: false }).limit(10),
  ]);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const costRows = (costs ?? []) as any[];
  const incidentRows = (incidents ?? []) as any[];
  const reviewRows = (reviews ?? []) as any[];
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const totalSpend = costRows.reduce((s, c) => s + Number(c.base_amount ?? 0), 0);
  const avgRating = reviewRows.length ? Math.round((reviewRows.reduce((s, r) => s + Number(r.rating), 0) / reviewRows.length) * 10) / 10 : null;

  return (
    <>
      <div className="mb-4">
        <Link href="/os/suppliers" className="inline-flex items-center gap-1 text-[12.5px] font-medium text-os-muted hover:text-os-text">
          <Icon.ArrowLeft size={14} />Suppliers
        </Link>
      </div>

      <PageHeader
        eyebrow={`Supplier · ${supplier.code}`}
        title={supplier.name as string}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <span>{[supplier.city, supplier.country].filter(Boolean).join(", ")}</span>
            {((supplier.categories as string[]) ?? []).map((c) => <Badge key={c} tone="neutral">{c.replace(/_/g, " ")}</Badge>)}
            {!supplier.active ? <Badge tone="amber">Inactive</Badge> : null}
          </span>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Rating" value={supplier.rating ? `${Number(supplier.rating).toFixed(1)}/5` : "—"} sub="Relationship rating, set by hand" />
        <Stat label="Post-trip score" value={avgRating ? `${avgRating}/5` : "—"} sub={reviewRows.length ? `${reviewRows.length} evaluations` : "Not evaluated"} />
        <Stat label="Incidents" value={incidentRows.length} tone={incidentRows.length ? "amber" : undefined} sub={incidentRows.length ? "Computed, not opinion" : "None recorded"} />
        {showRates ? (
          <Stat label="Spend on file" value={formatMoney(totalSpend, actor.baseCurrency, { compact: true })} sub={`${costRows.length} cost lines`} />
        ) : (
          <Stat label="Payment terms" value={(supplier.payment_terms as string) ?? "—"} />
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5">
          <Card padded={false}>
            <div className="border-b border-os-line px-4 py-3 sm:px-5">
              <CardHeader title="Services" subtitle="What we buy from them, and how much notice they need" />
            </div>
            {services?.length ? (
              <ul>
                {services.map((service) => (
                  <li key={service.id as string} className="flex items-start justify-between gap-3 border-b border-os-line/60 px-4 py-2.5 last:border-0 sm:px-5">
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-os-text">{service.name as string}</p>
                      <p className="text-[11.5px] text-os-faint">
                        <span className="capitalize">{String(service.category).replace(/_/g, " ")}</span> · {service.unit_label as string}
                        {service.lead_time_hours ? ` · needs ${service.lead_time_hours}h notice` : ""}
                      </p>
                      {service.notes ? <p className="mt-0.5 text-[11.5px] leading-snug text-os-muted">{service.notes as string}</p> : null}
                    </div>
                    {!service.active ? <Badge tone="neutral">Inactive</Badge> : null}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-6 sm:px-5">
                <EmptyState title="No services listed" description="Add what this supplier provides so the calculator can price it." icon={<Icon.Box size={22} />} />
              </div>
            )}
          </Card>

          {showRates && costRows.length ? (
            <Card padded={false}>
              <div className="border-b border-os-line px-4 py-3 sm:px-5">
                <CardHeader title="What we have paid them" subtitle="Every cost line attributed to this supplier" />
              </div>
              <Table className="rounded-none border-0">
                <thead>
                  <tr><Th>Trip</Th><Th>What</Th><Th>When</Th><Th align="right">Amount</Th></tr>
                </thead>
                <tbody>
                  {costRows.map((cost) => (
                    <tr key={cost.id}>
                      <Td>
                        {cost.os_trips?.ref ? (
                          <Link href={`/os/trips/${cost.os_trips.ref}`} className="os-nums text-[12px] font-medium text-os-gold hover:underline">
                            {cost.os_trips.ref}
                          </Link>
                        ) : <span className="text-os-faint">—</span>}
                      </Td>
                      <Td className="text-[12.5px]">{cost.label}</Td>
                      <Td className="os-nums text-[12px] text-os-muted">
                        {cost.incurred_on ? formatDate(cost.incurred_on) : `${cost.kind}`}
                      </Td>
                      <Td align="right" className="os-nums font-medium">{formatMoney(Number(cost.amount), cost.currency)}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          ) : null}
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Contact" />
            <dl className="mt-3 space-y-2.5 text-[13px]">
              {supplier.contact_name ? <Line label="Contact" value={supplier.contact_name as string} /> : null}
              {supplier.phone ? <Line label="Phone" value={supplier.phone as string} /> : null}
              {supplier.email ? <Line label="Email" value={supplier.email as string} /> : null}
              {supplier.payment_terms ? <Line label="Payment terms" value={supplier.payment_terms as string} /> : null}
              {supplier.currency ? <Line label="Bills in" value={supplier.currency as string} /> : null}
              {supplier.contract_reference ? <Line label="Contract" value={supplier.contract_reference as string} /> : null}
              {supplier.contract_expires_on ? <Line label="Contract expires" value={formatDate(supplier.contract_expires_on as string)} /> : null}
            </dl>
            {supplier.phone ? (
              <div className="mt-3 flex gap-2">
                <a href={`tel:${String(supplier.phone).replace(/\s/g, "")}`} className="rounded-lg border border-os-line-strong bg-white px-3 py-2 text-[13px] font-medium text-os-text hover:bg-black/[0.03]">Call</a>
                {supplier.whatsapp ? (
                  <a href={`https://wa.me/${String(supplier.whatsapp).replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-os-line-strong bg-white px-3 py-2 text-[13px] font-medium text-os-text hover:bg-black/[0.03]">WhatsApp</a>
                ) : null}
              </div>
            ) : null}
            {supplier.notes ? (
              <p className="mt-3 rounded-lg bg-black/[0.03] px-3 py-2 text-[12.5px] leading-relaxed text-os-muted">{supplier.notes as string}</p>
            ) : null}
          </Card>

          {incidentRows.length ? (
            <Card padded={false}>
              <div className="border-b border-os-line px-4 py-3">
                <CardHeader title="Incidents they caused" subtitle="The objective half of reliability" />
              </div>
              <ul>
                {incidentRows.map((incident) => (
                  <li key={incident.id} className="flex items-start gap-2 border-b border-os-line/60 px-4 py-2.5 last:border-0">
                    <Badge tone={incident.severity === "critical" || incident.severity === "high" ? "red" : "amber"}>{incident.severity}</Badge>
                    <span className="min-w-0">
                      <span className="block text-[12.5px] font-medium leading-snug text-os-text">{incident.title}</span>
                      <span className="block text-[11px] text-os-faint">
                        {incident.ref}{incident.os_trips?.ref ? ` · ${incident.os_trips.ref}` : ""} · {relativeTime(incident.occurred_at)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          {reviewRows.length ? (
            <Card padded={false}>
              <div className="border-b border-os-line px-4 py-3">
                <CardHeader title="Post-trip evaluations" />
              </div>
              <ul>
                {reviewRows.map((review) => (
                  <li key={review.id} className="border-b border-os-line/60 px-4 py-2.5 last:border-0">
                    <p className="flex items-center gap-2 text-[12px] text-os-faint">
                      <span className="os-nums font-semibold text-os-text">{review.rating}/5</span>
                      {review.os_trips?.ref ? <span className="os-nums">{review.os_trips.ref}</span> : null}
                      <span>{relativeTime(review.created_at)}</span>
                    </p>
                    {review.note ? <p className="mt-0.5 text-[12.5px] leading-relaxed text-os-text">{review.note}</p> : null}
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>
      </div>
    </>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="shrink-0 text-os-muted">{label}</dt>
      <dd className="min-w-0 truncate text-right font-medium text-os-text">{value}</dd>
    </div>
  );
}
