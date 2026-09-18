import Link from "next/link";
import { osdb, getOrg } from "@/lib/os/db";
import { savedViewLink, unsupportedNote } from "@/lib/os/saved-views";

// The saved-view chip row, for every list page except Trips — which renders
// its own inside the filter bar so the chips sit with the filters they set.
//
// A view is a stored query, translated to a filter URL by
// src/lib/os/saved-views.ts. Nothing here matches on the view's NAME, so a
// renamed view still opens the same list and an edited query changes what it
// shows, which is the whole point of storing the query rather than a link.
//
// Views a person saved for themselves are shown alongside the shared ones;
// the view grants nothing, so what actually appears once you follow the link
// is still decided by the actor's permissions and scope.
export async function SavedViews({
  resource,
  employeeId,
  className = "",
}: {
  resource: string;
  employeeId?: string | null;
  className?: string;
}) {
  const org = await getOrg();
  let query = osdb()
    .from("os_saved_views")
    .select("id, name, query, shared, employee_id")
    .eq("org_id", org.id)
    .eq("resource", resource)
    .order("sort_order");
  query = employeeId ? query.or(`shared.eq.true,employee_id.eq.${employeeId}`) : query.eq("shared", true);

  const { data } = await query;
  const views = data ?? [];
  if (!views.length) return null;

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      <span className="text-[11.5px] font-medium text-os-faint">Saved views</span>
      {views.map((view) => {
        const link = savedViewLink(resource, (view.query ?? {}) as Record<string, unknown>);
        const note = unsupportedNote(link.unsupported);
        return (
          <Link
            key={view.id as string}
            href={link.href}
            title={note}
            className="rounded-full border border-os-line-strong bg-white px-2.5 py-1 text-[12px] text-os-muted transition hover:border-os-gold hover:text-os-text"
          >
            {view.name as string}
            {note ? <span className="ml-1 text-os-amber" aria-label="part of this view is not applied">*</span> : null}
          </Link>
        );
      })}
    </div>
  );
}
