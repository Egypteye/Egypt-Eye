import { notFound } from "next/navigation";
import { getActor, can } from "@/lib/os/actor";
import { getTripRecord, getTrip } from "@/lib/os/trips";
import { osdb } from "@/lib/os/db";
import { formatDateTime, relativeTime, formatTime } from "@/lib/os/dates";
import { Card, CardHeader, NoAccess, Avatar, Badge } from "@/components/os/ui";
import { MessageComposer } from "../../../chat/MessageComposer";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// THE TRIP CHANNEL
// ---------------------------------------------------------------------------
// Not a WhatsApp replacement. It exists so that a decision about EE-10482 lives
// on EE-10482 forever, instead of in a personal chat that leaves the company
// when the person does.
//
// The header repeats the operational facts on purpose: someone reading the
// conversation at 22:00 should not have to switch tabs to remember who the
// driver is or where the pickup is.
// ---------------------------------------------------------------------------

export default async function TripChatPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "chat.view")) return <NoAccess what="the trip channel" permission="chat.view" />;

  const upper = ref.toUpperCase();
  const [record, trip] = await Promise.all([getTripRecord(actor, upper), getTrip(actor, upper)]);
  if (!record || !trip) notFound();

  const db = osdb();
  const { data: channel } = await db.from("os_channels").select("id, name").eq("trip_id", record.id).maybeSingle();

  if (!channel) {
    return (
      <Card>
        <CardHeader
          title="This trip has no channel"
          subtitle="Channels are opened automatically when a trip is created. This trip predates that, or the channel was archived."
        />
      </Card>
    );
  }

  const [{ data: messages }, { data: membership }] = await Promise.all([
    db.from("os_messages")
      .select("id, body, kind, created_at, employee_id, os_employees ( full_name, avatar_url )")
      .eq("channel_id", channel.id).is("deleted_at", null)
      .order("created_at", { ascending: true }).limit(200),
    db.from("os_channel_members").select("employee_id").eq("channel_id", channel.id).eq("employee_id", actor.employeeId).maybeSingle(),
  ]);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const rows = (messages ?? []) as any[];
  /* eslint-enable @typescript-eslint/no-explicit-any */
  const isMember = Boolean(membership);

  return (
    <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
      <Card padded={false} className="flex h-[70vh] flex-col">
        <div className="border-b border-os-line px-4 py-3 sm:px-5">
          <CardHeader
            title={channel.name ?? `${upper} channel`}
            subtitle={`${rows.length} message${rows.length === 1 ? "" : "s"}`}
            action={isMember ? <Badge tone="green">You are in this channel</Badge> : <Badge tone="neutral">Read only</Badge>}
          />
        </div>

        <div className="os-scroll flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-5">
          {rows.length ? rows.map((message) => (
            message.kind === "system" ? (
              <p key={message.id} className="text-center text-[11.5px] text-os-faint" title={formatDateTime(message.created_at)}>
                {message.body}
                <span className="ml-1.5">· {relativeTime(message.created_at)}</span>
              </p>
            ) : (
              <div key={message.id} className="flex items-start gap-2.5">
                <Avatar name={message.os_employees?.full_name ?? "?"} url={message.os_employees?.avatar_url} size={30} />
                <div className="min-w-0 flex-1">
                  <p className="flex items-baseline gap-2">
                    <span className="text-[12.5px] font-semibold text-os-text">{message.os_employees?.full_name ?? "Unknown"}</span>
                    <span className="text-[11px] text-os-faint" title={formatDateTime(message.created_at)}>{relativeTime(message.created_at)}</span>
                  </p>
                  <p className="mt-0.5 whitespace-pre-line text-[13px] leading-relaxed text-os-text">{message.body}</p>
                </div>
              </div>
            )
          )) : (
            <p className="py-8 text-center text-[13px] text-os-muted">
              Nothing has been said about this trip yet.
            </p>
          )}
        </div>

        {can(actor, "chat.post") && isMember ? (
          <div className="border-t border-os-line px-4 py-3 sm:px-5">
            <MessageComposer channelId={channel.id as string} />
          </div>
        ) : (
          <div className="border-t border-os-line px-4 py-3 text-[12.5px] text-os-muted sm:px-5">
            {can(actor, "chat.post")
              ? "You can read this channel because you can see the trip, but only assigned crew can post in it."
              : "You do not have permission to post."}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="Trip at a glance" subtitle="So nobody has to switch tabs mid-conversation" />
        <dl className="mt-3 space-y-2.5 text-[13px]">
          <Line label="Client" value={trip.clientName ?? "Not set"} />
          <Line label="When" value={`${trip.tripDate} · ${formatTime(trip.startTime)}`} />
          <Line label="Pickup" value={trip.pickupLocation ?? "Not recorded"} />
          <Line label="Location" value={trip.locationName ?? "Not set"} />
          <Line label="Guests" value={String(trip.guests)} />
          {trip.crew.map((member, i) => (
            <Line key={i} label={member.roleKey.replace(/_/g, " ")} value={member.name} />
          ))}
        </dl>
      </Card>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="shrink-0 capitalize text-os-muted">{label}</dt>
      <dd className="min-w-0 truncate text-right font-medium text-os-text">{value}</dd>
    </div>
  );
}
