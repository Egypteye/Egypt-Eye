import { notFound } from "next/navigation";
import { getActor, can } from "@/lib/os/actor";
import { getTripRecord } from "@/lib/os/trips";
import { listTasks, TASK_STATUS_LABEL, PRIORITY_ORDER } from "@/lib/os/tasks";
import { relativeTime, formatDateTime } from "@/lib/os/dates";
import { Card, CardHeader, Badge, EmptyState, NoAccess } from "@/components/os/ui";
import { TaskToggle } from "../../../tasks/TaskToggle";
import { Icon } from "@/components/os/icons";

export const dynamic = "force-dynamic";

// The trip's operational checklist, grouped by phase: before the day, on the
// day, after it. Blocking tasks are marked, because those are the ones holding
// the trip out of Ready and the ones worth doing first.
export default async function TripTasksPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "tasks.view")) return <NoAccess what="tasks" permission="tasks.view" />;

  const trip = await getTripRecord(actor, ref.toUpperCase());
  if (!trip) notFound();

  const tasks = await listTasks(actor, { tripId: trip.id as string, statuses: ["todo", "in_progress", "blocked", "done", "cancelled"], limit: 200 });

  const phases = [
    { key: "pre", label: "Before the day", description: "Everything that has to be true before the crew leaves." },
    { key: "day", label: "On the day", description: "What happens on location." },
    { key: "post", label: "After the trip", description: "Upload, edit, deliver, close." },
  ];

  const done = tasks.filter((t) => t.status === "done").length;
  const blocking = tasks.filter((t) => t.blocking && t.status !== "done");

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader
          title={`${done} of ${tasks.length} done`}
          subtitle={blocking.length
            ? `${blocking.length} task${blocking.length === 1 ? " is" : "s are"} holding this trip out of Ready.`
            : tasks.length ? "Nothing is blocking readiness." : "This trip has no checklist."}
        />
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/[0.07]">
          <div
            className="h-full rounded-full bg-os-green transition-all"
            style={{ width: `${tasks.length ? (done / tasks.length) * 100 : 0}%` }}
          />
        </div>
      </Card>

      {tasks.length === 0 ? (
        <EmptyState
          title="No checklist on this trip"
          description="Checklists are generated from the service type's task template when a trip is created. If this trip predates the template, an administrator can attach one under Admin, templates."
          icon={<Icon.CheckSquare size={24} />}
        />
      ) : (
        phases.map((phase) => {
          const group = tasks
            .filter((t) => t.phase === phase.key)
            .sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9) || String(a.dueAt).localeCompare(String(b.dueAt)));
          if (!group.length) return null;

          return (
            <Card key={phase.key} padded={false}>
              <div className="border-b border-os-line px-4 py-3 sm:px-5">
                <CardHeader
                  title={phase.label}
                  subtitle={phase.description}
                  action={<span className="text-[12px] text-os-faint">{group.filter((t) => t.status === "done").length}/{group.length}</span>}
                />
              </div>
              <ul>
                {group.map((task) => (
                  <li key={task.id} className="flex items-start gap-3 border-b border-os-line/60 px-4 py-3 last:border-0 sm:px-5">
                    <TaskToggle taskId={task.id} status={task.status} />
                    <div className="min-w-0 flex-1">
                      <p className={`text-[13.5px] leading-snug ${task.status === "done" ? "text-os-faint line-through" : "font-medium text-os-text"}`}>
                        {task.title}
                      </p>
                      {task.description && task.status !== "done" ? (
                        <p className="mt-0.5 whitespace-pre-line text-[12px] leading-relaxed text-os-muted">{task.description}</p>
                      ) : null}
                      <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-os-faint">
                        <span>{task.ownerName ?? (task.ownerRoleKey ? `Any ${task.ownerRoleKey.replace(/_/g, " ")}` : "Unassigned")}</span>
                        {task.dueAt ? (
                          <span className={task.overdue ? "text-os-red" : ""} title={formatDateTime(task.dueAt)}>
                            · due {relativeTime(task.dueAt)}
                          </span>
                        ) : null}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      {task.blocking && task.status !== "done" ? <Badge tone="amber">Blocks readiness</Badge> : null}
                      {task.priority === "critical" && task.status !== "done" ? <Badge tone="red">Critical</Badge> : null}
                      {task.status === "blocked" ? <Badge tone="amber">{TASK_STATUS_LABEL.blocked}</Badge> : null}
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          );
        })
      )}
    </div>
  );
}
