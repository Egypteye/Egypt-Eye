import { notFound } from "next/navigation";
import { getActor, can } from "@/lib/os/actor";
import { getTripRecord } from "@/lib/os/trips";
import { osdb } from "@/lib/os/db";
import { relativeTime } from "@/lib/os/dates";
import { Card, CardHeader, NoAccess, Badge, EmptyState, Notice } from "@/components/os/ui";
import { MediaForm } from "./MediaForm";
import { VerifyButton } from "./VerifyButton";
import { Icon } from "@/components/os/icons";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// MEDIA
// ---------------------------------------------------------------------------
// No photograph is ever stored in this database. A photoshoot's raw folder is
// routinely tens of gigabytes, Google Drive is better at holding it than any
// application table, and Egypt Eye already works that way.
//
// What the OS adds is the part Drive cannot answer: which folder belongs to
// which trip, who may see it, and whether anyone has actually confirmed it
// opens. That last one matters more than it sounds — a dead delivery link
// discovered by the client is worse than no link at all, so verification is a
// recorded human act, not an assumption.
// ---------------------------------------------------------------------------

const KIND_LABELS: Record<string, string> = {
  raw_photos: "Raw photos",
  edited_photos: "Edited photos",
  videos: "Videos",
  client_delivery: "Client delivery",
  behind_the_scenes: "Behind the scenes",
  social_content: "Social content",
  other: "Other",
};

export default async function TripMediaPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "media.view")) return <NoAccess what="media links" permission="media.view" />;

  const trip = await getTripRecord(actor, ref.toUpperCase());
  if (!trip) notFound();

  const db = osdb();
  const { data: links } = await db
    .from("os_media_links")
    .select("id, kind, title, url, provider, visibility, item_count, added_at, verified_at, os_employees!os_media_links_added_by_fkey ( full_name )")
    .eq("trip_id", trip.id)
    .order("added_at", { ascending: false });

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const rows = (links ?? []) as any[];
  /* eslint-enable @typescript-eslint/no-explicit-any */
  const delivery = rows.find((r) => r.kind === "client_delivery");

  return (
    <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-5">
        {delivery && !delivery.verified_at ? (
          <Notice tone="amber" title="The client delivery link has not been verified">
            Open it from outside the Egypt Eye Google account and confirm it works, then mark it verified. The content
            pipeline will not let a shoot be marked delivered until somebody has.
          </Notice>
        ) : null}

        <Card padded={false}>
          <div className="border-b border-os-line px-4 py-3 sm:px-5">
            <CardHeader title="Linked folders" subtitle={`${rows.length} link${rows.length === 1 ? "" : "s"}`} />
          </div>
          {rows.length ? (
            <ul>
              {rows.map((link) => (
                <li key={link.id} className="border-b border-os-line/60 px-4 py-3 last:border-0 sm:px-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge tone={link.kind === "client_delivery" ? "gold" : "neutral"}>{KIND_LABELS[link.kind] ?? link.kind}</Badge>
                        <Badge tone={link.visibility === "client" ? "blue" : "neutral"}>{link.visibility}</Badge>
                        {link.verified_at ? <Badge tone="green">Verified</Badge> : <Badge tone="amber">Not verified</Badge>}
                      </div>
                      <p className="mt-1 text-[13.5px] font-medium text-os-text">{link.title}</p>
                      <a
                        href={link.url} target="_blank" rel="noopener noreferrer"
                        className="mt-0.5 inline-flex max-w-full items-center gap-1 truncate text-[12px] text-os-gold hover:underline"
                      >
                        <Icon.Link size={12} />
                        <span className="truncate">{link.url}</span>
                      </a>
                      <p className="mt-0.5 text-[11.5px] text-os-faint">
                        {link.os_employees?.full_name ?? "Someone"} · {relativeTime(link.added_at)}
                        {link.item_count ? ` · ${link.item_count} files` : ""}
                      </p>
                    </div>
                    {can(actor, "media.manage") && !link.verified_at ? (
                      <VerifyButton mediaId={link.id} tripRef={ref.toUpperCase()} />
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-6 sm:px-5">
              <EmptyState
                title="No media linked yet"
                description="Paste the Google Drive folder link once the raw files are uploaded. Nothing is stored here — only the link and who may see it."
                icon={<Icon.Folder size={24} />}
              />
            </div>
          )}
        </Card>
      </div>

      <div className="space-y-5">
        {can(actor, "media.manage") ? (
          <Card>
            <CardHeader title="Add a link" subtitle="Google Drive, Dropbox, WeTransfer or a video host." />
            <div className="mt-3">
              <MediaForm tripRef={ref.toUpperCase()} />
            </div>
          </Card>
        ) : null}

        <Card>
          <CardHeader title="Why links, not uploads" />
          <p className="mt-2 text-[12.5px] leading-relaxed text-os-muted">
            A single photoshoot produces tens of gigabytes of raw files. Storing that in the operating system would make it
            slow and expensive without making it better — Drive already does the job well, and the crew already works there.
          </p>
          <p className="mt-2 text-[12.5px] leading-relaxed text-os-muted">
            What lives here instead is the thing Drive cannot tell you: which folder belongs to which trip, who is allowed to
            see it, whether the client delivery link has actually been checked, and whether a completed shoot is still
            missing its upload.
          </p>
          <p className="mt-2 text-[12.5px] leading-relaxed text-os-muted">
            Automatic Drive folder creation is designed and registered as an automation, and is switched off until a Google
            service account is configured. It is listed in the Admin centre with exactly that reason rather than as a button
            that appears to work.
          </p>
        </Card>
      </div>
    </div>
  );
}
