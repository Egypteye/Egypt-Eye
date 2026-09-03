import Link from "next/link";
import { notFound } from "next/navigation";
import { getActor, can } from "@/lib/os/actor";
import { osdb, getOrg } from "@/lib/os/db";
import { listTrips } from "@/lib/os/trips";
import { formatDate, relativeTime, todayInCairo } from "@/lib/os/dates";
import { formatMoney } from "@/lib/os/money";
import { PageHeader, NoAccess, Card, CardHeader, Badge, Stat, EmptyState, Divider, buttonClass } from "@/components/os/ui";
import { Icon } from "@/components/os/icons";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// CLIENT 360
// ---------------------------------------------------------------------------
// Everything Egypt Eye knows about one customer, on one screen: who they are,
// who travels with them, every trip past and future, what they have spent,
// what they asked for last time, and what went wrong.
//
// Contact details are gated separately from the profile itself, because a
// coordinator may legitimately need to know a trip belongs to Fatima Al-Rashid
// without needing her mobile number.
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data } = await osdb().from("os_clients").select("full_name, company_name").eq("id", id).maybeSingle();
  return { title: (data?.company_name as string) || (data?.full_name as string) || "Client" };
}

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "clients.view")) return <NoAccess what="clients" permission="clients.view" />;

  const db = osdb();
  const org = await getOrg();

  const { data: client } = await db.from("os_clients").select("*").eq("id", id).eq("org_id", org.id).maybeSingle();
  if (!client) notFound();

  const allTrips = await listTrips(actor, { clientId: id, order: "date_desc", limit: 200, from: undefined, to: undefined });

  // A field role must not be able to reach a client page by URL for someone
  // they have no connection to.
  if (actor.permissions["clients.view"] === "own" && allTrips.length === 0) {
    return <NoAccess what="this client" permission="clients.view" />;
  }

  const [{ data: travelers }, { data: tags }, { data: taggings }, { data: feedback }, { data: incidents }] = await Promise.all([
    db.from("os_travelers").select("id, full_name, relationship, age_category, nationality, dietary_notes, special_requirements")
      .eq("client_id", id).is("archived_at", null),
    db.from("os_tags").select("id, key, label, color").eq("org_id", org.id),
    db.from("os_taggings").select("tag_id").eq("entity_type", "client").eq("entity_id", id),
    can(actor, "feedback.view")
      ? db.from("os_client_feedback").select("id, rating, nps, comments, highlight, complaint, created_at, os_trips ( ref, title )").eq("client_id", id).order("created_at", { ascending: false })
      : Promise.resolve({ data: null }),
    can(actor, "incidents.view")
      ? db.from("os_incidents").select("id, ref, title, severity, status, occurred_at, os_trips ( ref )").in("trip_id", allTrips.map((t) => t.id).length ? allTrips.map((t) => t.id) : ["00000000-0000-0000-0000-000000000000"])
      : Promise.resolve({ data: null }),
  ]);

  const tagById = new Map((tags ?? []).map((t) => [t.id as string, t]));
  const clientTags = (taggings ?? []).map((row) => tagById.get(row.tag_id as string)).filter(Boolean);

  const today = todayInCairo();
  const past = allTrips.filter((t) => t.tripDate < today);
  const upcoming = allTrips.filter((t) => t.tripDate >= today);
  const showMoney = can(actor, "trips.financials");
  const lifetime = showMoney ? allTrips.filter((t) => t.status !== "cancelled").reduce((s, t) => s + (t.money?.sell ?? 0), 0) : null;
  const showContact = can(actor, "clients.contact");

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const feedbackRows = (feedback ?? []) as any[];
  const incidentRows = (incidents ?? []) as any[];
  /* eslint-enable @typescript-eslint/no-explicit-any */
  const avgRating = feedbackRows.length
    ? Math.round((feedbackRows.reduce((s, f) => s + Number(f.rating ?? 0), 0) / feedbackRows.filter((f) => f.rating).length) * 10) / 10
    : null;

  const socials = [
    ["Instagram", client.instagram, `https://instagram.com/${String(client.instagram ?? "").replace(/^@/, "")}`],
    ["TikTok", client.tiktok, `https://tiktok.com/@${String(client.tiktok ?? "").replace(/^@/, "")}`],
    ["Website", client.website, client.website],
  ].filter(([, value]) => Boolean(value)) as [string, string, string][];

  return (
    <>
      <div className="mb-4">
        <Link href="/os/clients" className="inline-flex items-center gap-1 text-[12.5px] font-medium text-os-muted hover:text-os-text">
          <Icon.ArrowLeft size={14} />All clients
        </Link>
      </div>

      <PageHeader
        eyebrow={client.kind === "agency" ? "Agency client" : "Client"}
        title={(client.company_name as string) || (client.full_name as string)}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <span className="os-nums text-os-faint">{client.code as string}</span>
            {client.vip ? <Badge tone="gold">VIP</Badge> : null}
            {clientTags.map((t) => (
              <span key={t!.id as string} className="rounded px-1.5 py-0.5 text-[11px] font-medium" style={{ background: `${t!.color}22`, color: "#16211c" }}>
                {t!.label as string}
              </span>
            ))}
          </span>
        }
        actions={
          can(actor, "trips.create") ? (
            <Link href="/os/trips/new" className={buttonClass.gold}><Icon.Plus size={15} />New trip</Link>
          ) : null
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Trips" value={allTrips.length} sub={upcoming.length ? `${upcoming.length} upcoming` : "None upcoming"} />
        <Stat label="First travelled" value={past.length ? formatDate(past[past.length - 1].tripDate) : "—"} sub={past.length ? relativeTime(`${past[past.length - 1].tripDate}T12:00:00Z`) : undefined} />
        {showMoney ? (
          <Stat label="Lifetime value" value={formatMoney(lifetime ?? 0, actor.baseCurrency, { compact: true })} sub={`${allTrips.filter((t) => t.status !== "cancelled").length} paid trips`} />
        ) : (
          <Stat label="Nationality" value={(client.nationality as string) ?? "—"} />
        )}
        <Stat label="Satisfaction" value={avgRating ? `${avgRating}/5` : "—"} sub={feedbackRows.length ? `${feedbackRows.length} responses` : "No feedback yet"} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-5">
          {/* ---------------------------------------------------------- */}
          {/* The timeline                                                */}
          {/* ---------------------------------------------------------- */}
          <Card padded={false}>
            <div className="border-b border-os-line px-4 py-3 sm:px-5">
              <CardHeader title="Travel history" subtitle="Every trip, newest first" />
            </div>
            {allTrips.length ? (
              <ol className="px-4 py-3 sm:px-5">
                {allTrips.map((trip, index) => (
                  <li key={trip.id} className="relative flex gap-4 pb-4 last:pb-0">
                    {index < allTrips.length - 1 ? <span className="absolute left-[7px] top-5 h-full w-px bg-os-line" aria-hidden /> : null}
                    <span
                      className="relative mt-1.5 h-[15px] w-[15px] shrink-0 rounded-full border-2 bg-white"
                      style={{ borderColor: trip.tripDate >= today ? "#c9a227" : "#d2d0c6" }}
                      aria-hidden
                    />
                    <Link href={`/os/trips/${trip.ref}`} className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-baseline gap-x-2 text-[12px] text-os-faint">
                        <span className="os-nums font-semibold">{formatDate(trip.tripDate)}</span>
                        <span className="os-nums">{trip.ref}</span>
                        <span className="capitalize">{trip.status.replace(/_/g, " ")}</span>
                      </p>
                      <p className="text-[13.5px] font-medium text-os-text">{trip.title}</p>
                      <p className="text-[11.5px] text-os-muted">
                        {trip.typeName}{trip.locationName ? ` · ${trip.locationName}` : ""} · {trip.guests} guests
                        {trip.money ? ` · ${formatMoney(trip.money.sell, trip.money.currency)}` : ""}
                      </p>
                    </Link>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="px-4 py-6 sm:px-5">
                <EmptyState title="No trips yet" description="This client has a record but has not travelled with us." icon={<Icon.Trip size={22} />} />
              </div>
            )}
          </Card>

          {feedbackRows.length ? (
            <Card padded={false}>
              <div className="border-b border-os-line px-4 py-3 sm:px-5">
                <CardHeader title="What they told us" subtitle="Post-trip feedback, kept separate from public reviews" />
              </div>
              <ul>
                {feedbackRows.map((row) => (
                  <li key={row.id} className="border-b border-os-line/60 px-4 py-3 last:border-0 sm:px-5">
                    <p className="flex items-center gap-2 text-[12px] text-os-faint">
                      <span className="os-nums font-semibold text-os-text">{row.rating ? `${row.rating}/5` : "—"}</span>
                      {row.os_trips?.ref ? <span className="os-nums">{row.os_trips.ref}</span> : null}
                      <span>{relativeTime(row.created_at)}</span>
                    </p>
                    {row.comments ? <p className="mt-1 text-[13px] leading-relaxed text-os-text">{row.comments}</p> : null}
                    {row.complaint ? <p className="mt-1 text-[12.5px] leading-relaxed text-os-amber">Complaint: {row.complaint}</p> : null}
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Profile" />
            <dl className="mt-3 space-y-2.5 text-[13px]">
              <Line label="Full name" value={client.full_name as string} />
              {client.company_name ? <Line label="Company" value={client.company_name as string} /> : null}
              <Line label="Nationality" value={(client.nationality as string) ?? "—"} />
              <Line label="Country" value={(client.country as string) ?? "—"} />
              <Line label="Language" value={(client.language as string) ?? "—"} />
              <Line label="Source" value={(client.source as string) ?? "—"} />
              {client.kind === "agency" && client.commission_pct ? (
                <Line label="Commission" value={`${client.commission_pct}%`} />
              ) : null}
              {client.payment_terms ? <Line label="Payment terms" value={client.payment_terms as string} /> : null}
            </dl>

            <Divider className="my-3.5" />

            {showContact ? (
              <dl className="space-y-2.5 text-[13px]">
                {client.phone ? <Line label="Phone" value={client.phone as string} /> : null}
                {client.whatsapp && client.whatsapp !== client.phone ? <Line label="WhatsApp" value={client.whatsapp as string} /> : null}
                {client.email ? <Line label="Email" value={client.email as string} /> : null}
                {socials.map(([label, value, href]) => (
                  <div key={label} className="flex items-baseline justify-between gap-3">
                    <dt className="text-os-muted">{label}</dt>
                    <dd className="min-w-0 truncate text-right">
                      <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-os-gold hover:underline">{value}</a>
                    </dd>
                  </div>
                ))}
                {client.phone || client.whatsapp ? (
                  <div className="flex gap-2 pt-1">
                    {client.phone ? <a href={`tel:${String(client.phone).replace(/\s/g, "")}`} className={buttonClass.secondary}>Call</a> : null}
                    {client.whatsapp ? (
                      <a href={`https://wa.me/${String(client.whatsapp).replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className={buttonClass.secondary}>WhatsApp</a>
                    ) : null}
                  </div>
                ) : null}
              </dl>
            ) : (
              <p className="text-[12px] leading-relaxed text-os-faint">
                Contact details are restricted. They need the &ldquo;client contact&rdquo; permission, which is separate from being able to
                see the client at all.
              </p>
            )}
          </Card>

          {client.preferences || client.dietary_notes || client.notes ? (
            <Card>
              <CardHeader title="What we know" subtitle="Read this before the trip, not after" />
              {client.preferences ? <Para label="Preferences" body={client.preferences as string} /> : null}
              {client.dietary_notes ? <Para label="Dietary" body={client.dietary_notes as string} /> : null}
              {client.notes ? <Para label="Notes" body={client.notes as string} /> : null}
            </Card>
          ) : null}

          {travelers?.length ? (
            <Card>
              <CardHeader title="Travel party" subtitle="Reused across trips, never retyped" />
              <ul className="mt-2.5 space-y-2.5">
                {travelers.map((t) => (
                  <li key={t.id as string} className="text-[13px]">
                    <p className="font-medium text-os-text">{t.full_name as string}</p>
                    <p className="text-[11.5px] text-os-faint">
                      {[t.relationship, t.age_category, t.nationality].filter(Boolean).join(" · ")}
                    </p>
                    {t.dietary_notes ? <p className="text-[11.5px] text-os-amber">{t.dietary_notes as string}</p> : null}
                    {t.special_requirements ? <p className="text-[11.5px] text-os-amber">{t.special_requirements as string}</p> : null}
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          {incidentRows.length ? (
            <Card padded={false}>
              <div className="border-b border-os-line px-4 py-3">
                <CardHeader title="Incidents on their trips" />
              </div>
              <ul>
                {incidentRows.map((incident) => (
                  <li key={incident.id} className="flex items-start gap-2 border-b border-os-line/60 px-4 py-2.5 last:border-0">
                    <Badge tone={incident.severity === "critical" || incident.severity === "high" ? "red" : "amber"}>{incident.severity}</Badge>
                    <span className="min-w-0">
                      <span className="block text-[12.5px] font-medium leading-snug text-os-text">{incident.title}</span>
                      <span className="block text-[11px] text-os-faint">
                        {incident.os_trips?.ref} · {incident.status} · {relativeTime(incident.occurred_at)}
                      </span>
                    </span>
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

function Para({ label, body }: { label: string; body: string }) {
  return (
    <div className="mt-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-os-faint">{label}</p>
      <p className="mt-0.5 whitespace-pre-line text-[12.5px] leading-relaxed text-os-text">{body}</p>
    </div>
  );
}
