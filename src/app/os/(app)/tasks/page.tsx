import Link from "next/link";
import { getActor, can } from "@/lib/os/actor";
import { listTasks, PRIORITY_ORDER } from "@/lib/os/tasks";
import { relativeTime, formatDateTime, todayInCairo, nowMs } from "@/lib/os/dates";
import { PageHeader, NoAccess, Card, CardHeader, Badge, Stat, EmptyState, buttonClass } from "@/components/os/ui";
import { TaskToggle } from "./TaskToggle";
import { Icon } from "@/components/os/icons";
import { scopeNote } from "@/lib/os/scope";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tasks" };

// Work across the company, grouped by when it is due rather than by which trip
// it belongs to — because the question a person opens this screen with is
// "what do I have to do now", not "what is outstanding on EE-10482".
export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "tasks.view")) return <NoAccess what="tasks" permission="tasks.view" />;

  const params = await searchParams;
  const one = (key: string) => (Array.isArray(params[key]) ? params[key]![0] : params[key]) as string | undefined;
  const who = one("who") ?? "me";
  const showDone = one("done") === "1";

  const tasks = await listTasks(actor, {
    mineOnly: who === "me",
    statuses: showDone ? ["todo", "in_progress", "blocked", "done"] : ["todo", "in_progress", "blocked"],
    limit: 300,
  });

  const now = nowMs();
  const endOfToday = new Date(`${todayInCairo()}T23:59:59Z`).getTime();
  const endOfWeek = now + 7 * 86_400_000;

  const open = tasks.filter((t) => t.status !== "done");
  const groups = [
    { key: "overdue", label: "Overdue", tone: "red" as const, tasks: open.filter((t) => t.dueAt && new Date(t.dueAt).getTime() < now) },
    { key: "today", label: "Due today", tone: "amber" as const, tasks: open.filter((t) => t.dueAt && new Date(t.dueAt).getTime() >= now && new Date(t.dueAt).getTime() <= endOfToday) },
    { key: "week", label: "This week", tone: "neutral" as const, tasks: open.filter((t) => t.dueAt && new Date(t.dueAt).getTime() > endOfToday && new Date(t.dueAt).getTime() <= endOfWeek) },
    { key: "later", label: "Later", tone: "neutral" as const, tasks: open.filter((t) => t.dueAt && new Date(t.dueAt).getTime() > endOfWeek) },
    { key: "undated", label: "No due date", tone: "neutral" as const, tasks: open.filter((t) => !t.dueAt) },
  ].filter((g) => g.tasks.length);

  const done = tasks.filter((t) => t.status === "done");

  return (
    <>
      <PageHeader
        eyebrow="Work"
        title={who === "me" ? "My tasks" : "All tasks"}
        description={`${open.length} open${open.length ? `, ${open.filter((t) => t.overdue).length} overdue` : ""}.`}
        meta={scopeNote(actor.permissions["tasks.view"] ?? null) ? (
          <p className="text-[12px] text-os-faint">{scopeNote(actor.permissions["tasks.view"] ?? null)}</p>
        ) : null}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Open" value={open.length} />
        <Stat label="Overdue" value={open.filter((t) => t.overdue).length} tone={open.some((t) => t.overdue) ? "red" : undefined} />
        <Stat label="Blocking a trip" value={open.filter((t) => t.blocking).length} tone={open.some((t) => t.blocking) ? "amber" : undefined} />
        <Stat label="Critical" value={open.filter((t) => t.priority === "critical").length} />
      </div>

      <div className="mb-4 flex flex-wrap gap-1">
        <Link href="/os/tasks?who=me" className={`rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium transition ${who === "me" ? "bg-os-ink text-white" : "border border-os-line-strong bg-white text-os-muted hover:text-os-text"}`}>
          Mine
        </Link>
        {actor.permissions["tasks.view"] !== "own" ? (
          <Link href="/os/tasks?who=all" className={`rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium transition ${who === "all" ? "bg-os-ink text-white" : "border border-os-line-strong bg-white text-os-muted hover:text-os-text"}`}>
            Everyone
          </Link>
        ) : null}
        <Link href={`/os/tasks?who=${who}&done=${showDone ? "0" : "1"}`} className="rounded-lg border border-os-line-strong bg-white px-2.5 py-1.5 text-[12.5px] font-medium text-os-muted hover:text-os-text">
          {showDone ? "Hide completed" : "Show completed"}
        </Link>
      </div>

      {open.length === 0 ? (
        <EmptyState
          title={who === "me" ? "Nothing on your list" : "No open tasks"}
          description="Checklists generate themselves when a trip is created, so an empty list means the work is genuinely done."
          action={<Link href="/os/trips" className={buttonClass.secondary}>Go to trips</Link>}
          icon={<Icon.CheckSquare size={26} />}
        />
      ) : (
        <div className="space-y-5">
          {groups.map((group) => (
            <Card key={group.key} padded={false}>
              <div className="border-b border-os-line px-4 py-3 sm:px-5">
                <CardHeader
                  title={group.label}
                  action={<Badge tone={group.tone}>{group.tasks.length}</Badge>}
                />
              </div>
              <ul>
                {group.tasks
                  .sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9) || String(a.dueAt).localeCompare(String(b.dueAt)))
                  .map((task) => (
                    <li key={task.id} className="flex items-start gap-3 border-b border-os-line/60 px-4 py-3 last:border-0 sm:px-5">
                      <TaskToggle taskId={task.id} status={task.status} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13.5px] font-medium leading-snug text-os-text">{task.title}</p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11.5px] text-os-faint">
                          {task.tripRef ? (
                            <Link href={`/os/trips/${task.tripRef}`} className="os-nums font-medium text-os-gold hover:underline">{task.tripRef}</Link>
                          ) : null}
                          {task.tripTitle ? <span className="truncate">{task.tripTitle}</span> : null}
                          {task.dueAt ? (
                            <span className={task.overdue ? "text-os-red" : ""} title={formatDateTime(task.dueAt)}>· due {relativeTime(task.dueAt)}</span>
                          ) : null}
                          {who !== "me" && task.ownerName ? <span>· {task.ownerName}</span> : null}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        {task.priority === "critical" ? <Badge tone="red">Critical</Badge> : task.priority === "high" ? <Badge tone="amber">High</Badge> : null}
                        {task.blocking ? <Badge tone="amber">Blocks readiness</Badge> : null}
                      </div>
                    </li>
                  ))}
              </ul>
            </Card>
          ))}

          {showDone && done.length ? (
            <Card padded={false}>
              <div className="border-b border-os-line px-4 py-3 sm:px-5">
                <CardHeader title="Completed" action={<Badge tone="green">{done.length}</Badge>} />
              </div>
              <ul>
                {done.slice(0, 40).map((task) => (
                  <li key={task.id} className="flex items-start gap-3 border-b border-os-line/60 px-4 py-2.5 last:border-0 sm:px-5">
                    <TaskToggle taskId={task.id} status={task.status} />
                    <span className="min-w-0 flex-1 text-[13px] text-os-faint line-through">{task.title}</span>
                    {task.tripRef ? <span className="os-nums shrink-0 text-[11.5px] text-os-faint">{task.tripRef}</span> : null}
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>
      )}
    </>
  );
}
