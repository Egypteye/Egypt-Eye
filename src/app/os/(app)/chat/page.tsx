import Link from "next/link";
import { getActor, can } from "@/lib/os/actor";
import { osdb } from "@/lib/os/db";
import { relativeTime } from "@/lib/os/dates";
import { PageHeader, NoAccess, Card, CardHeader, Badge, EmptyState, Avatar } from "@/components/os/ui";
import { MessageComposer } from "./MessageComposer";
import { Icon } from "@/components/os/icons";

export const dynamic = "force-dynamic";
export const metadata = { title: "Channels" };

// ---------------------------------------------------------------------------
// INTERNAL CHANNELS
// ---------------------------------------------------------------------------
// This is not a WhatsApp replacement, and the product does not pretend it is.
// It exists so a decision about a trip lives on that trip forever, rather than
// in a personal chat that leaves the company when the person does.
//
// Trip channels are opened automatically and are the busiest thing here. The
// standing department channels are for the conversations that are not about
// one specific operation.
// ---------------------------------------------------------------------------

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "chat.view")) return <NoAccess what="channels" permission="chat.view" />;

  const params = await searchParams;
  const channelId = (Array.isArray(params.c) ? params.c[0] : params.c) ?? "";

  const db = osdb();

  const { data: memberships } = await db
    .from("os_channel_members")
    .select("channel_id, last_read_at, os_channels ( id, kind, name, trip_id, department, last_message_at, archived_at, os_trips ( ref, title, trip_date ) )")
    .eq("employee_id", actor.employeeId);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const channels = ((memberships ?? []) as any[])
    .map((m) => ({ ...m.os_channels, lastReadAt: m.last_read_at }))
    .filter((c) => c?.id && !c.archived_at)
    .sort((a, b) => String(b.last_message_at ?? "").localeCompare(String(a.last_message_at ?? "")));
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const active = channels.find((c) => c.id === channelId) ?? channels[0] ?? null;

  const { data: messages } = active
    ? await db.from("os_messages")
        .select("id, body, kind, created_at, os_employees ( full_name, avatar_url )")
        .eq("channel_id", active.id).is("deleted_at", null)
        .order("created_at", { ascending: true }).limit(200)
    : { data: [] };

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const rows = (messages ?? []) as any[];
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const teamChannels = channels.filter((c) => c.kind !== "trip");
  const tripChannels = channels.filter((c) => c.kind === "trip");

  return (
    <>
      <PageHeader
        eyebrow="Company"
        title="Channels"
        description="Internal conversation, attached to the work it is about. Client conversations stay where they already happen."
      />

      {channels.length === 0 ? (
        <EmptyState
          title="You are not in any channels"
          description="You join a trip's channel automatically when you are assigned to it, and the department channels when you join a department."
          icon={<Icon.Chat size={26} />}
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
          <div className="space-y-4">
            {teamChannels.length ? (
              <Card padded={false}>
                <div className="border-b border-os-line px-4 py-2.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-os-faint">Teams</p>
                </div>
                <ul>
                  {teamChannels.map((channel) => (
                    <li key={channel.id}>
                      <Link
                        href={`/os/chat?c=${channel.id}`}
                        className={`flex items-center gap-2 border-b border-os-line/60 px-4 py-2.5 transition last:border-0 ${
                          active?.id === channel.id ? "bg-os-gold-soft" : "hover:bg-black/[0.02]"
                        }`}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-medium text-os-text">{channel.name}</span>
                          {channel.last_message_at ? (
                            <span className="block text-[11px] text-os-faint">{relativeTime(channel.last_message_at)}</span>
                          ) : null}
                        </span>
                        {channel.kind === "announcement" ? <Badge tone="gold">All</Badge> : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>
            ) : null}

            {tripChannels.length ? (
              <Card padded={false}>
                <div className="border-b border-os-line px-4 py-2.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-os-faint">Trips</p>
                </div>
                <ul className="os-scroll max-h-[420px] overflow-y-auto">
                  {tripChannels.slice(0, 40).map((channel) => (
                    <li key={channel.id}>
                      <Link
                        href={`/os/chat?c=${channel.id}`}
                        className={`block border-b border-os-line/60 px-4 py-2.5 transition last:border-0 ${
                          active?.id === channel.id ? "bg-os-gold-soft" : "hover:bg-black/[0.02]"
                        }`}
                      >
                        <span className="os-nums block text-[11px] font-semibold text-os-faint">{channel.os_trips?.ref}</span>
                        <span className="block truncate text-[12.5px] font-medium text-os-text">{channel.os_trips?.title ?? channel.name}</span>
                        {channel.last_message_at ? (
                          <span className="block text-[11px] text-os-faint">{relativeTime(channel.last_message_at)}</span>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>
            ) : null}
          </div>

          {active ? (
            <Card padded={false} className="flex h-[70vh] flex-col">
              <div className="border-b border-os-line px-4 py-3 sm:px-5">
                <CardHeader
                  title={active.os_trips?.ref ? `${active.os_trips.ref} — ${active.os_trips.title}` : (active.name ?? "Channel")}
                  subtitle={`${rows.length} message${rows.length === 1 ? "" : "s"}`}
                  action={active.os_trips?.ref ? (
                    <Link href={`/os/trips/${active.os_trips.ref}`} className="text-[12px] font-medium text-os-gold hover:underline">Open trip</Link>
                  ) : null}
                />
              </div>

              <div className="os-scroll flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-5">
                {rows.length ? rows.map((message) => (
                  message.kind === "system" ? (
                    <p key={message.id} className="text-center text-[11.5px] text-os-faint">
                      {message.body} · {relativeTime(message.created_at)}
                    </p>
                  ) : (
                    <div key={message.id} className="flex items-start gap-2.5">
                      <Avatar name={message.os_employees?.full_name ?? "?"} url={message.os_employees?.avatar_url} size={30} />
                      <div className="min-w-0 flex-1">
                        <p className="flex items-baseline gap-2">
                          <span className="text-[12.5px] font-semibold text-os-text">{message.os_employees?.full_name ?? "Unknown"}</span>
                          <span className="text-[11px] text-os-faint">{relativeTime(message.created_at)}</span>
                        </p>
                        <p className="mt-0.5 whitespace-pre-line text-[13px] leading-relaxed text-os-text">{message.body}</p>
                      </div>
                    </div>
                  )
                )) : (
                  <p className="py-10 text-center text-[13px] text-os-muted">Nothing here yet. Start the conversation.</p>
                )}
              </div>

              {can(actor, "chat.post") ? (
                <div className="border-t border-os-line px-4 py-3 sm:px-5">
                  <MessageComposer channelId={active.id} />
                </div>
              ) : null}
            </Card>
          ) : null}
        </div>
      )}
    </>
  );
}
