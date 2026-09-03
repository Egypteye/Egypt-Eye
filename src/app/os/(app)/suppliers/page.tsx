import Link from "next/link";
import { getActor, can } from "@/lib/os/actor";
import { supplierPerformance, periodPresets } from "@/lib/os/analytics";
import { todayInCairo } from "@/lib/os/dates";
import { formatMoney } from "@/lib/os/money";
import { osdb, getOrg } from "@/lib/os/db";
import { PageHeader, NoAccess, Table, Th, Td, Badge, Stat, EmptyState, buttonClass } from "@/components/os/ui";
import { Icon } from "@/components/os/icons";

export const dynamic = "force-dynamic";
export const metadata = { title: "Suppliers" };

// Partners, with the number that actually decides whether to keep using them:
// incidents caused, next to spend. The subjective rating is maintained by
// hand; the incident count is computed and cannot be talked up.
export default async function SuppliersPage() {
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "suppliers.view")) return <NoAccess what="suppliers" permission="suppliers.view" />;

  const today = todayInCairo();
  const org = await getOrg();
  const [performance, { data: suppliers }] = await Promise.all([
    supplierPerformance(actor, periodPresets(today).year),
    osdb().from("os_suppliers")
      .select("id, code, name, contact_name, phone, email, city, categories, payment_terms, currency, rating, contract_expires_on, active")
      .eq("org_id", org.id).is("archived_at", null).order("name"),
  ]);

  const perfById = new Map(performance.map((p) => [p.id, p]));
  const rows = suppliers ?? [];
  const showSpend = can(actor, "suppliers.rates") || can(actor, "finance.view");
  const totalSpend = showSpend ? performance.reduce((s, p) => s + (p.spend ?? 0), 0) : null;
  const withIncidents = performance.filter((p) => p.incidents > 0).length;

  return (
    <>
      <PageHeader
        eyebrow="Records"
        title="Suppliers"
        description="Who we buy from, what we pay, and how often they cost us a morning."
        actions={
          can(actor, "suppliers.create") ? (
            <Link href="/os/suppliers/new" className={buttonClass.gold}><Icon.Plus size={15} />Register supplier</Link>
          ) : null
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Suppliers" value={rows.length} sub={`${rows.filter((s) => s.active).length} active`} />
        {showSpend ? (
          <Stat label="Spend, 12 months" value={formatMoney(totalSpend ?? 0, actor.baseCurrency, { compact: true })} />
        ) : (
          <Stat label="Categories" value={new Set(rows.flatMap((s) => (s.categories as string[]) ?? [])).size} />
        )}
        <Stat label="Caused incidents" value={withIncidents} tone={withIncidents ? "amber" : undefined} sub={withIncidents ? "In the last 12 months" : "None recorded"} />
        <Stat
          label="Contracts expiring"
          value={rows.filter((s) => s.contract_expires_on && String(s.contract_expires_on) <= today.slice(0, 4) + "-12-31").length}
        />
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No suppliers yet"
          description="Register the partners the operation depends on, so their rates and reliability are company knowledge rather than one person's contacts list."
          icon={<Icon.Building size={26} />}
          action={can(actor, "suppliers.create") ? <Link href="/os/suppliers/new" className={buttonClass.gold}>Register the first one</Link> : undefined}
        />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Supplier</Th><Th>Provides</Th><Th>Terms</Th><Th>Rating</Th>
              <Th>Trips</Th><Th>Incidents</Th>
              {showSpend ? <Th align="right">Spend</Th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((supplier) => {
              const perf = perfById.get(supplier.id as string);
              return (
                <tr key={supplier.id as string} className="transition hover:bg-black/[0.02]">
                  <Td>
                    <Link href={`/os/suppliers/${supplier.id}`} className="block">
                      <span className="block text-[13px] font-medium text-os-text">{supplier.name as string}</span>
                      <span className="block text-[11.5px] text-os-faint">
                        {supplier.code as string}{supplier.city ? ` · ${supplier.city}` : ""}
                      </span>
                    </Link>
                  </Td>
                  <Td>
                    <span className="flex flex-wrap gap-1">
                      {((supplier.categories as string[]) ?? []).map((c) => (
                        <span key={c} className="rounded bg-black/[0.05] px-1.5 py-0.5 text-[10.5px] capitalize text-os-muted">{c.replace(/_/g, " ")}</span>
                      ))}
                    </span>
                  </Td>
                  <Td className="text-[12px] text-os-muted">{(supplier.payment_terms as string) ?? "—"}</Td>
                  <Td className="os-nums">{supplier.rating ? `${Number(supplier.rating).toFixed(1)}/5` : "—"}</Td>
                  <Td className="os-nums">{perf?.trips ?? 0}</Td>
                  <Td>
                    {perf?.incidents ? <Badge tone="amber">{perf.incidents}</Badge> : <span className="text-os-faint">0</span>}
                  </Td>
                  {showSpend ? (
                    <Td align="right" className="os-nums font-medium">{formatMoney(perf?.spend ?? 0, actor.baseCurrency)}</Td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </>
  );
}
