import Link from "next/link";
import { getActor, can } from "@/lib/os/actor";
import { osdb, getOrg } from "@/lib/os/db";
import { relativeTime, formatDate, nowMs } from "@/lib/os/dates";
import { PageHeader, NoAccess, Card, Badge, Stat, EmptyState, Notice } from "@/components/os/ui";
import { StageControl } from "./StageControl";
import { Icon } from "@/components/os/icons";

export const dynamic = "force-dynamic";
export const metadata = { title: "Content pipeline" };

// ---------------------------------------------------------------------------
// THE CONTENT PIPELINE
// ---------------------------------------------------------------------------
// Every shoot from the moment the shutter stops to the moment the client opens
// their gallery. A kanban because the question is always "what is stuck", and
// a stuck column is visible from across a room in a way a list is not.
//
// Delivery has a real gate: a job cannot be marked Delivered unless a client
// delivery link exists AND a named person has confirmed it opens from outside
// the company Google account. That single check prevents the most common and
// most embarrassing delivery failure there is.
// ---------------------------------------------------------------------------

const STAGES = [
  { key: "shoot_complete", label: "Shot", hint: "Camera down, nothing uploaded yet." },
  { key: "upload_pending", label: "Upload pending", hint: "Raw files still on a card. Chased automatically after 24 hours." },
  { key: "uploaded", label: "Uploaded", hint: "Raws are in Drive and the editor can start." },
  { key: "editing", label: "Editing", hint: "Being worked on." },
  { key: "quality_check", label: "Quality check", hint: "Second pair of eyes before it goes out." },
  { key: "ready", label: "Ready", hint: "Approved, waiting to be sent." },
  { key: "delivered", label: "Delivered", hint: "The client has it and the link was verified." },
];

export default async function ContentPage() {
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "content.view")) return <NoAccess what="the content pipeline" permission="content.view" />;

  const db = osdb();
  const org = await getOrg();

  const { data } = await db
    .from("os_content_jobs")
    .select(
      "id, stage, promised_at, uploaded_at, delivered_at, expected_photo_count, delivered_photo_count, marketing_permission, notes, " +
      "editor:os_employees!os_content_jobs_editor_employee_id_fkey ( full_name ), " +
      "photographer:os_employees!os_content_jobs_photographer_employee_id_fkey ( full_name ), " +
      "os_trips ( ref, title, trip_date, os_clients ( full_name, vip ) )",
    )
    .eq("org_id", org.id)
    .order("promised_at", { nullsFirst: false });

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const jobs = (data ?? []) as any[];
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const now = nowMs();
  const late = jobs.filter((j) => j.stage !== "delivered" && j.promised_at && new Date(j.promised_at).getTime() < now);
  const awaitingUpload = jobs.filter((j) => j.stage === "upload_pending");
  const delivered = jobs.filter((j) => j.stage === "delivered");
  const canEdit = can(actor, "content.edit");

  return (
    <>
      <PageHeader
        eyebrow="Creative"
        title="Content pipeline"
        description="Every shoot from the shutter to the client's inbox. Seven working days is the promise."
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="In the pipeline" value={jobs.filter((j) => j.stage !== "delivered").length} />
        <Stat label="Awaiting upload" value={awaitingUpload.length} tone={awaitingUpload.length ? "amber" : undefined} sub={awaitingUpload.length ? "Raws still not in Drive" : "Everything uploaded"} />
        <Stat label="Past the promise" value={late.length} tone={late.length ? "red" : undefined} />
        <Stat label="Delivered" value={delivered.length} />
      </div>

      {late.length ? (
        <div className="mb-5">
          <Notice tone="red" title={`${late.length} shoot${late.length === 1 ? " is" : "s are"} past the delivery promise`}>
            {late.map((j) => j.os_trips?.ref).filter(Boolean).join(", ")} — the client was told seven working days.
          </Notice>
        </div>
      ) : null}

      {jobs.length === 0 ? (
        <EmptyState
          title="Nothing in the pipeline"
          description="A content job opens automatically when a shoot is marked completed. Nothing has finished shooting yet."
          icon={<Icon.Camera size={26} />}
        />
      ) : (
        <div className="os-scroll overflow-x-auto pb-2">
          <div className="flex min-w-max gap-3">
            {STAGES.map((stage) => {
              const column = jobs.filter((j) => j.stage === stage.key);
              return (
                <div key={stage.key} className="w-[260px] shrink-0">
                  <div className="mb-2">
                    <div className="flex items-baseline justify-between gap-2">
                      <h2 className="text-[13px] font-semibold text-os-text">{stage.label}</h2>
                      <span className="os-nums text-[12px] text-os-faint">{column.length}</span>
                    </div>
                    <p className="text-[11px] leading-snug text-os-faint">{stage.hint}</p>
                  </div>

                  <div className="space-y-2">
                    {column.map((job) => {
                      const isLate = job.stage !== "delivered" && job.promised_at && new Date(job.promised_at).getTime() < now;
                      return (
                        <Card key={job.id} padded={false} className={isLate ? "border-os-red/30" : ""}>
                          <div className="p-3">
                            <Link href={`/os/trips/${job.os_trips?.ref}`} className="block">
                              <p className="os-nums text-[11px] font-semibold text-os-faint">{job.os_trips?.ref}</p>
                              <p className="mt-0.5 text-[13px] font-medium leading-snug text-os-text">{job.os_trips?.title}</p>
                              <p className="mt-0.5 text-[11.5px] text-os-muted">
                                {job.os_trips?.os_clients?.full_name ?? "No client"}
                                {job.os_trips?.trip_date ? ` · shot ${formatDate(job.os_trips.trip_date)}` : ""}
                              </p>
                            </Link>

                            <div className="mt-2 flex flex-wrap gap-1">
                              {job.os_trips?.os_clients?.vip ? <Badge tone="gold">VIP</Badge> : null}
                              {isLate ? <Badge tone="red">Late</Badge> : null}
                              {job.marketing_permission ? <Badge tone="green">Can publish</Badge> : <Badge tone="neutral">No marketing rights</Badge>}
                            </div>

                            <p className="mt-2 text-[11px] text-os-faint">
                              {job.photographer?.full_name ? `Shot by ${job.photographer.full_name}` : ""}
                              {job.editor?.full_name ? ` · edited by ${job.editor.full_name}` : ""}
                            </p>
                            {job.promised_at ? (
                              <p className={`text-[11px] ${isLate ? "text-os-red" : "text-os-faint"}`}>
                                {job.delivered_at ? `Delivered ${relativeTime(job.delivered_at)}` : `Promised ${relativeTime(job.promised_at)}`}
                              </p>
                            ) : null}
                            {job.notes ? <p className="mt-1 text-[11px] leading-snug text-os-amber">{job.notes}</p> : null}

                            {canEdit ? (
                              <div className="mt-2.5">
                                <StageControl jobId={job.id} stage={job.stage} stages={STAGES.map((s) => ({ key: s.key, label: s.label }))} />
                              </div>
                            ) : null}
                          </div>
                        </Card>
                      );
                    })}
                    {column.length === 0 ? (
                      <p className="rounded-lg border border-dashed border-os-line px-3 py-4 text-center text-[11.5px] text-os-faint">
                        Empty
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
