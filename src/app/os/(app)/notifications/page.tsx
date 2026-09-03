import Link from "next/link";
import { getActor } from "@/lib/os/actor";
import { osdb } from "@/lib/os/db";
import { relativeTime, formatDateTime } from "@/lib/os/dates";
import { PageHeader, Card, Badge, EmptyState } from "@/components/os/ui";
import { MarkAllRead } from "./MarkAllRead";
import { Icon } from "@/components/os/icons";

export const dynamic = "force-dynamic";
export const metadata = { title: "Notifications" };

// Three levels, and only three. A system that notifies about everything trains
// people to read nothing, and then the one line that mattered — "tomorrow's
// 05:45 trip has no driver" — is lost in the pile.
export default async function NotificationsPage() {
  const actor = await getActor();
  if (!actor) return null;

  const { data } = await osdb()
    .from("os_notifications")
    .select("id, level, category, title, body, href, read_at, created_at")
    .eq("employee_id", actor.employeeId)
    .order("created_at", { ascending: false })
    .limit(150);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const rows = (data ?? []) as any[];
  /* eslint-enable @typescript-eslint/no-explicit-any */
  const unread = rows.filter((n) => !n.read_at);

  return (
    <>
      <PageHeader
        eyebrow="For you"
        title="Notifications"
        description={unread.length ? `${unread.length} unread.` : "Everything is read."}
        actions={unread.length ? <MarkAllRead /> : null}
      />

      {rows.length === 0 ? (
        <EmptyState
          title="Nothing yet"
          description="You will hear about assignments, tasks, approvals waiting on you, and anything critical on a trip you are on."
          icon={<Icon.Bell size={26} />}
        />
      ) : (
        <Card padded={false} className="max-w-3xl">
          <ul>
            {rows.map((notification) => (
              <li key={notification.id} className={`border-b border-os-line/60 last:border-0 ${notification.read_at ? "" : "bg-os-gold-soft/30"}`}>
                <Link href={notification.href ?? "#"} className="flex items-start gap-3 px-4 py-3 transition hover:bg-black/[0.02] sm:px-5">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                    notification.level === "critical" ? "bg-os-red" : notification.level === "warning" ? "bg-os-amber" : "bg-os-blue"
                  }`} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] font-medium leading-snug text-os-text">{notification.title}</span>
                    {notification.body ? <span className="mt-0.5 block text-[12.5px] leading-relaxed text-os-muted">{notification.body}</span> : null}
                    <span className="mt-1 flex flex-wrap items-center gap-1.5">
                      <Badge tone={notification.level === "critical" ? "red" : notification.level === "warning" ? "amber" : "neutral"}>
                        {notification.category}
                      </Badge>
                      <span className="text-[11px] text-os-faint" title={formatDateTime(notification.created_at)}>
                        {relativeTime(notification.created_at)}
                      </span>
                    </span>
                  </span>
                  {notification.href ? <Icon.ChevronRight size={15} /> : null}
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
