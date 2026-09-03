import { notFound } from "next/navigation";
import { getActor, can } from "@/lib/os/actor";
import { getTripRecord } from "@/lib/os/trips";
import { osdb } from "@/lib/os/db";
import { relativeTime, formatDate } from "@/lib/os/dates";
import { Card, CardHeader, NoAccess, Badge, EmptyState } from "@/components/os/ui";
import { DocumentForm } from "./DocumentForm";
import { Icon } from "@/components/os/icons";

export const dynamic = "force-dynamic";

// Vouchers, confirmations, tickets, contracts. Visibility is a real field, not
// a label: a passport scan filed as "management" is not shown to the crew
// assigned to the trip, because "can see the trip" must not silently imply
// "can see the client's identity documents".
const KIND_LABELS: Record<string, string> = {
  voucher: "Voucher", invoice: "Invoice", supplier_confirmation: "Supplier confirmation",
  contract: "Contract", ticket: "Ticket", trip_brief: "Trip brief", client_document: "Client document",
  identity: "Identity document", insurance: "Insurance", permit: "Permit", internal: "Internal", other: "Other",
};

const VISIBILITY_LABELS: Record<string, string> = {
  internal: "Anyone on the trip",
  management: "Management only",
  finance: "Finance only",
  client: "Shareable with the client",
  assigned_crew: "Assigned crew",
};

export default async function TripDocumentsPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "documents.view")) return <NoAccess what="documents" permission="documents.view" />;

  const trip = await getTripRecord(actor, ref.toUpperCase());
  if (!trip) notFound();

  const { data } = await osdb()
    .from("os_documents")
    .select("id, title, kind, url, visibility, expires_on, created_at, os_employees ( full_name )")
    .eq("trip_id", trip.id)
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const all = (data ?? []) as any[];
  /* eslint-enable @typescript-eslint/no-explicit-any */

  // Visibility enforced here, on the server, after the module permission.
  const visible = all.filter((doc) => {
    switch (doc.visibility) {
      case "management": return can(actor, "analytics.financial") || can(actor, "admin.users");
      case "finance": return can(actor, "finance.view");
      default: return true;
    }
  });
  const hidden = all.length - visible.length;

  return (
    <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      <Card padded={false}>
        <div className="border-b border-os-line px-4 py-3 sm:px-5">
          <CardHeader
            title="Documents"
            subtitle={hidden ? `${visible.length} visible to you, ${hidden} restricted` : `${visible.length} attached`}
          />
        </div>
        {visible.length ? (
          <ul>
            {visible.map((doc) => (
              <li key={doc.id} className="border-b border-os-line/60 px-4 py-3 last:border-0 sm:px-5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge tone="neutral">{KIND_LABELS[doc.kind] ?? doc.kind}</Badge>
                  <Badge tone={doc.visibility === "client" ? "blue" : doc.visibility === "internal" ? "neutral" : "amber"}>
                    {VISIBILITY_LABELS[doc.visibility] ?? doc.visibility}
                  </Badge>
                  {doc.expires_on ? <Badge tone="amber">Expires {formatDate(doc.expires_on)}</Badge> : null}
                </div>
                <p className="mt-1 text-[13.5px] font-medium text-os-text">{doc.title}</p>
                {doc.url ? (
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="mt-0.5 inline-flex items-center gap-1 text-[12px] text-os-gold hover:underline">
                    <Icon.Link size={12} />Open
                  </a>
                ) : null}
                <p className="mt-0.5 text-[11.5px] text-os-faint">
                  {doc.os_employees?.full_name ?? "Someone"} · {relativeTime(doc.created_at)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-4 py-6 sm:px-5">
            <EmptyState
              title="No documents on this trip"
              description="Supplier confirmations, tickets and vouchers belong here. A booking that exists only as a phone call does not exist, and readiness will keep saying so."
              icon={<Icon.Doc size={24} />}
            />
          </div>
        )}
      </Card>

      {can(actor, "documents.manage") ? (
        <Card>
          <CardHeader title="Attach a document" subtitle="A link to the file, plus who may see it." />
          <div className="mt-3">
            <DocumentForm tripRef={ref.toUpperCase()} tripId={trip.id as string} />
          </div>
        </Card>
      ) : null}
    </div>
  );
}
