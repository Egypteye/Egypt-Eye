import Link from "next/link";
import { notFound } from "next/navigation";
import { getActor, can } from "@/lib/os/actor";
import { osdb, getOrg } from "@/lib/os/db";
import { relativeTime, formatDuration } from "@/lib/os/dates";
import { NoAccess, Card, CardHeader, Badge, Notice } from "@/components/os/ui";
import { Icon } from "@/components/os/icons";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data } = await osdb().from("os_sops").select("title").eq("slug", slug).maybeSingle();
  return { title: (data?.title as string) ?? "Procedure" };
}

// ---------------------------------------------------------------------------
// A STANDARD OPERATING PROCEDURE
// ---------------------------------------------------------------------------
// The difference between this and a document is the last line: the SOP is
// wired to a task template, so every trip of the matching service type
// generates these steps as real, owned, due-dated tasks. A procedure nobody
// has to open is a procedure that actually gets followed.
// ---------------------------------------------------------------------------
export default async function SopPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "knowledge.view")) return <NoAccess what="procedures" permission="knowledge.view" />;

  const db = osdb();
  const org = await getOrg();

  const { data: sop } = await db
    .from("os_sops")
    .select("*, os_trip_types ( name, key ), os_locations ( name ), os_employees ( full_name ), os_task_templates ( name, key )")
    .eq("org_id", org.id).eq("slug", slug).maybeSingle();
  if (!sop) notFound();

  const { data: steps } = await db
    .from("os_sop_steps").select("id, seq, title, detail, owner_role_key, expected_minutes, evidence_required, critical")
    .eq("sop_id", sop.id).order("seq");

  const totalMinutes = (steps ?? []).reduce((s, step) => s + Number(step.expected_minutes ?? 0), 0);
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const template = (sop as any).os_task_templates;
  const tripType = (sop as any).os_trip_types;
  const place = (sop as any).os_locations;
  const owner = (sop as any).os_employees;
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4">
        <Link href="/os/knowledge" className="inline-flex items-center gap-1 text-[12.5px] font-medium text-os-muted hover:text-os-text">
          <Icon.ArrowLeft size={14} />Knowledge
        </Link>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone="neutral">{sop.category as string}</Badge>
          {tripType?.name ? <Badge tone="gold">{tripType.name}</Badge> : null}
          {place?.name ? <Badge tone="neutral">{place.name}</Badge> : null}
          <Badge tone="neutral">version {sop.version}</Badge>
        </div>

        <h1 className="mt-2 text-[24px] font-semibold leading-tight text-os-text">{sop.title as string}</h1>
        {sop.summary ? <p className="mt-1.5 text-[14px] leading-relaxed text-os-muted">{sop.summary as string}</p> : null}
        <p className="mt-2 text-[11.5px] text-os-faint">
          {owner?.full_name ? `Owned by ${owner.full_name} · ` : ""}
          updated {relativeTime(sop.updated_at as string)}
          {totalMinutes ? ` · about ${formatDuration(totalMinutes)} of work across the procedure` : ""}
        </p>

        {template ? (
          <div className="mt-4">
            <Notice tone="green" title="This procedure runs itself">
              Every {tripType?.name ?? "matching"} trip generates these steps automatically as owned, due-dated tasks from the{" "}
              <span className="font-medium">{template.name}</span> checklist. Nobody has to remember to open this page.
            </Notice>
          </div>
        ) : (
          <div className="mt-4">
            <Notice tone="amber" title="Not yet wired to a checklist">
              This procedure is documented but does not generate tasks. An administrator can attach a task template to it under
              Admin, templates — that is what turns it from a document into a process.
            </Notice>
          </div>
        )}
      </Card>

      <Card className="mt-4" padded={false}>
        <div className="border-b border-os-line px-4 py-3 sm:px-5">
          <CardHeader title="The procedure" subtitle={`${(steps ?? []).length} steps, in order`} />
        </div>
        <ol className="px-4 py-3 sm:px-5">
          {(steps ?? []).map((step, index) => (
            <li key={step.id as string} className="relative flex gap-4 pb-4 last:pb-0">
              {index < (steps ?? []).length - 1 ? <span className="absolute left-[13px] top-7 h-full w-px bg-os-line" aria-hidden /> : null}
              <span className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${step.critical ? "bg-os-ink text-white" : "bg-black/[0.06] text-os-muted"}`}>
                {step.seq as number}
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-[14px] font-medium leading-snug text-os-text">{step.title as string}</p>
                {step.detail ? <p className="mt-0.5 text-[12.5px] leading-relaxed text-os-muted">{step.detail as string}</p> : null}
                <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-os-faint">
                  {step.owner_role_key ? <span className="capitalize">{String(step.owner_role_key).replace(/_/g, " ")}</span> : null}
                  {step.expected_minutes ? <span>· {formatDuration(step.expected_minutes as number)}</span> : null}
                  {step.evidence_required ? <Badge tone="blue">Evidence required</Badge> : null}
                  {step.critical ? <Badge tone="red">Critical</Badge> : null}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
