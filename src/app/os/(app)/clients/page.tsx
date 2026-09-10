import Link from "next/link";
import { getActor, can } from "@/lib/os/actor";
import { osdb, getOrg } from "@/lib/os/db";
import { tripScopeFor } from "@/lib/os/scope";
import { formatDate } from "@/lib/os/dates";
import { formatMoney } from "@/lib/os/money";
import { PageHeader, NoAccess, Table, Th, Td, Badge, EmptyState, buttonClass, Stat } from "@/components/os/ui";
import { Icon } from "@/components/os/icons";
import { SavedViews } from "@/components/os/SavedViews";

export const dynamic = "force-dynamic";
export const metadata = { title: "Clients" };

// One permanent record per customer, B2C and B2B in the same book. A returning
// guest is matched to their existing record rather than duplicated, which is
// the only reason "they booked with us in March" is answerable six months later.
export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "clients.view")) return <NoAccess what="clients" permission="clients.view" />;

  const params = await searchParams;
  const q = (Array.isArray(params.q) ? params.q[0] : params.q) ?? "";
  const kind = (Array.isArray(params.kind) ? params.kind[0] : params.kind) ?? "";
  const tag = (Array.isArray(params.tag) ? params.tag[0] : params.tag) ?? "";

  const db = osdb();
  const org = await getOrg();

  // A field role with 'own' scope only ever sees the clients whose trips they
  // are on — the same rule the search box obeys.
  const scope = await tripScopeFor(actor, "clients.view");
  let allowedIds: string[] | null = null;
  if (scope.kind === "own") {
    const { data } = await db.from("os_trips").select("client_id").in("id", scope.tripIds.length ? scope.tripIds : ["00000000-0000-0000-0000-000000000000"]);
    allowedIds = Array.from(new Set((data ?? []).map((r) => r.client_id as string).filter(Boolean)));
  }

  let query = db
    .from("os_clients")
    .select("id, code, kind, full_name, company_name, country, nationality, vip, source, first_trip_on, last_trip_on, created_at")
    .eq("org_id", org.id)
    .is("archived_at", null)
    .order("full_name")
    .limit(400);

  if (allowedIds) query = query.in("id", allowedIds.length ? allowedIds : ["00000000-0000-0000-0000-000000000000"]);
  if (kind) query = query.eq("kind", kind);
  if (q.trim()) {
    const term = q.replace(/[%,()]/g, " ").trim();
    if (term) query = query.or(`full_name.ilike.%${term}%,company_name.ilike.%${term}%,code.ilike.%${term}%,email.ilike.%${term}%`);
  }

  const [{ data: clients }, { data: tags }, { data: taggings }, { data: trips }] = await Promise.all([
    query,
    db.from("os_tags").select("id, key, label, color").eq("org_id", org.id).contains("applies_to", ["client"]),
    db.from("os_taggings").select("tag_id, entity_id").eq("entity_type", "client"),
    can(actor, "trips.financials")
      ? db.from("os_trips").select("client_id, sell_amount, status").eq("org_id", org.id).is("archived_at", null).neq("status", "cancelled")
      : Promise.resolve({ data: null }),
  ]);

  const tagById = new Map((tags ?? []).map((t) => [t.id as string, t]));
  const tagsByClient = new Map<string, { label: string; color: string; key: string }[]>();
  for (const row of taggings ?? []) {
    const t = tagById.get(row.tag_id as string);
    if (!t) continue;
    const list = tagsByClient.get(row.entity_id as string) ?? [];
    list.push({ label: t.label as string, color: t.color as string, key: t.key as string });
    tagsByClient.set(row.entity_id as string, list);
  }

  const spendByClient = new Map<string, { trips: number; spend: number }>();
  for (const trip of trips ?? []) {
    if (!trip.client_id) continue;
    const entry = spendByClient.get(trip.client_id as string) ?? { trips: 0, spend: 0 };
    entry.trips += 1;
    entry.spend += Number(trip.sell_amount ?? 0);
    spendByClient.set(trip.client_id as string, entry);
  }

  let rows = clients ?? [];
  if (tag) rows = rows.filter((c) => (tagsByClient.get(c.id as string) ?? []).some((t) => t.key === tag));

  const agencies = rows.filter((c) => c.kind === "agency").length;
  const vips = rows.filter((c) => c.vip).length;
  const repeat = rows.filter((c) => (spendByClient.get(c.id as string)?.trips ?? 0) > 1).length;

  return (
    <>
      <PageHeader
        eyebrow="Records"
        title="Clients"
        description={`${rows.length} record${rows.length === 1 ? "" : "s"}. One per person or agency — never a second one for a returning guest.`}
        actions={
          <>
            {can(actor, "clients.export") ? (
              <a href="/api/os/export/clients" className={buttonClass.secondary}><Icon.Download size={15} />Export</a>
            ) : null}
            {can(actor, "clients.create") ? (
              <Link href="/os/clients/new" className={buttonClass.gold}><Icon.Plus size={15} />New client</Link>
            ) : null}
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Clients" value={rows.length} />
        <Stat label="Repeat customers" value={repeat} sub={rows.length ? `${Math.round((repeat / rows.length) * 100)}% of the book` : undefined} />
        <Stat label="VIP" value={vips} />
        <Stat label="Agencies" value={agencies} sub="B2B partners" />
      </div>

      <form className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-os-line-strong bg-white px-2.5 py-1.5 sm:max-w-sm">
          <span className="text-os-faint"><Icon.Search size={15} /></span>
          <input name="q" defaultValue={q} placeholder="Name, company, code or email" className="w-full bg-transparent text-[13px] focus:outline-none" />
        </div>
        <select name="kind" defaultValue={kind} className="rounded-lg border border-os-line-strong bg-white px-2.5 py-1.5 text-[12.5px]">
          <option value="">Everyone</option>
          <option value="individual">Travellers</option>
          <option value="agency">Agencies</option>
        </select>
        <select name="tag" defaultValue={tag} className="rounded-lg border border-os-line-strong bg-white px-2.5 py-1.5 text-[12.5px]">
          <option value="">Any tag</option>
          {(tags ?? []).map((t) => <option key={t.id as string} value={t.key as string}>{t.label as string}</option>)}
        </select>
        <button type="submit" className={buttonClass.secondary}>Filter</button>
      </form>

      <SavedViews resource="clients" employeeId={actor.employeeId} className="mb-4" />

      {rows.length === 0 ? (
        <EmptyState
          title="No clients match"
          description={q || kind || tag ? "Try a different search, or clear the filters." : "The client book is empty. Add the first record."}
          action={can(actor, "clients.create") ? <Link href="/os/clients/new" className={buttonClass.gold}>New client</Link> : undefined}
          icon={<Icon.Client size={26} />}
        />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Client</Th><Th>Country</Th><Th>Source</Th><Th>Tags</Th>
              <Th>Trips</Th><Th>Last trip</Th>
              {can(actor, "trips.financials") ? <Th align="right">Lifetime value</Th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((client) => {
              const stats = spendByClient.get(client.id as string);
              return (
                <tr key={client.id as string} className="transition hover:bg-black/[0.02]">
                  <Td>
                    <Link href={`/os/clients/${client.id}`} className="block">
                      <span className="block text-[13px] font-medium text-os-text">
                        {(client.company_name as string) || (client.full_name as string)}
                        {client.vip ? <Badge tone="gold" className="ml-1.5">VIP</Badge> : null}
                      </span>
                      <span className="os-nums block text-[11.5px] text-os-faint">
                        {client.code as string}{client.kind === "agency" ? " · Agency" : ""}
                      </span>
                    </Link>
                  </Td>
                  <Td className="text-os-muted">{(client.country as string) ?? (client.nationality as string) ?? "—"}</Td>
                  <Td className="text-os-muted">{(client.source as string) ?? "—"}</Td>
                  <Td>
                    <span className="flex flex-wrap gap-1">
                      {(tagsByClient.get(client.id as string) ?? []).slice(0, 3).map((t) => (
                        <span key={t.key} className="rounded px-1.5 py-0.5 text-[10.5px] font-medium" style={{ background: `${t.color}22`, color: "#16211c" }}>
                          {t.label}
                        </span>
                      ))}
                    </span>
                  </Td>
                  <Td className="os-nums">{stats?.trips ?? 0}</Td>
                  <Td className="os-nums text-os-muted">{client.last_trip_on ? formatDate(client.last_trip_on as string) : "—"}</Td>
                  {can(actor, "trips.financials") ? (
                    <Td align="right" className="os-nums font-medium">{formatMoney(stats?.spend ?? 0, actor.baseCurrency)}</Td>
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
