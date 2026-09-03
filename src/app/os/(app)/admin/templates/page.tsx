import { getActor, can } from "@/lib/os/actor";
import { osdb, getOrg } from "@/lib/os/db";
import { PageHeader, NoAccess, Card, CardHeader, Badge, Notice } from "@/components/os/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Templates" };

// Checklists are the mechanism that turns a written procedure into work that
// actually happens. Each item is owned by a ROLE rather than a person, so the
// template survives staff changes, and due dates are relative to the trip's
// own start rather than an absolute date somebody typed.
export default async function TemplatesPage() {
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "admin.templates")) return <NoAccess what="templates" permission="admin.templates" />;

  const db = osdb();
  const org = await getOrg();

  const [{ data: templates }, { data: items }] = await Promise.all([
    db.from("os_task_templates").select("id, key, name, description, active, os_trip_types ( name )").eq("org_id", org.id).order("key"),
    db.from("os_task_template_items").select("id, template_id, seq, title, description, owner_role_key, priority, offset_days, offset_hours, phase, blocking").order("seq"),
  ]);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const templateRows = (templates ?? []) as any[];
  const itemRows = (items ?? []) as any[];
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Templates"
        description="The checklists every trip generates. This is what turns a written procedure into work that actually happens."
      />

      <div className="mb-5">
        <Notice tone="blue" title="Two details make these work rather than annoy">
          Steps are owned by a role, not a person, so a template survives someone leaving — the role resolves to whoever is
          actually assigned when the trip is created. And due times are relative to the trip&apos;s own start, so &ldquo;confirm
          the pickup&rdquo; is due the evening before every trip rather than on a date somebody typed once.
        </Notice>
      </div>

      <div className="space-y-5">
        {templateRows.map((template) => {
          const steps = itemRows.filter((i) => i.template_id === template.id);
          const blocking = steps.filter((s) => s.blocking).length;
          return (
            <Card key={template.id} padded={false}>
              <div className="border-b border-os-line px-4 py-3 sm:px-5">
                <CardHeader
                  title={template.name}
                  subtitle={template.description}
                  action={
                    <span className="flex flex-wrap items-center gap-1.5">
                      {template.os_trip_types?.name ? <Badge tone="gold">{template.os_trip_types.name}</Badge> : <Badge tone="neutral">Not attached</Badge>}
                      <Badge tone="neutral">{steps.length} steps</Badge>
                      {blocking ? <Badge tone="amber">{blocking} block readiness</Badge> : null}
                    </span>
                  }
                />
              </div>
              <ul>
                {steps.map((step) => (
                  <li key={step.id} className="flex items-start gap-3 border-b border-os-line/60 px-4 py-2.5 last:border-0 sm:px-5">
                    <span className="os-nums w-6 shrink-0 text-[12px] font-semibold text-os-faint">{step.seq}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium leading-snug text-os-text">{step.title}</p>
                      {step.description ? <p className="mt-0.5 text-[12px] leading-relaxed text-os-muted">{step.description}</p> : null}
                      <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-os-faint">
                        {step.owner_role_key ? <span className="capitalize">{String(step.owner_role_key).replace(/_/g, " ")}</span> : <span className="text-os-amber">no owner role</span>}
                        <span>· due {describeOffset(step.offset_days, step.offset_hours)}</span>
                        <span>· {step.phase === "pre" ? "before the day" : step.phase === "day" ? "on the day" : "after"}</span>
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      {step.priority === "critical" ? <Badge tone="red">Critical</Badge> : step.priority === "high" ? <Badge tone="amber">High</Badge> : null}
                      {step.blocking ? <Badge tone="amber">Blocks readiness</Badge> : null}
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>
    </>
  );
}

function describeOffset(days: number, hours: number): string {
  if (days === 0 && hours === 0) return "at the trip start";
  const parts: string[] = [];
  if (days) parts.push(`${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"}`);
  if (hours) parts.push(`${Math.abs(hours)} hour${Math.abs(hours) === 1 ? "" : "s"}`);
  const total = days * 24 + hours;
  return `${parts.join(" ")} ${total < 0 ? "before" : "after"} the start`;
}
