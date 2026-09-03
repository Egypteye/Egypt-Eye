import Link from "next/link";
import { getActor, canAny } from "@/lib/os/actor";
import { ADMIN_NAV, visibleItems } from "@/lib/os/navigation";
import { NoAccess } from "@/components/os/ui";
import { AdminTabs } from "./AdminTabs";
import type { PermissionKey } from "@/lib/os/permissions";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const actor = await getActor();
  if (!actor) return null;

  const holds = (key: PermissionKey) => Boolean(actor.permissions[key]);
  if (!canAny(actor, "admin.users", "admin.roles", "admin.units", "admin.catalog", "admin.templates", "admin.automations", "admin.settings", "admin.integrations", "admin.audit")) {
    return <NoAccess what="the Admin centre" permission="admin.settings" />;
  }

  const items = visibleItems(ADMIN_NAV, holds);

  return (
    <div>
      <div className="mb-4">
        <Link href="/os" className="text-[12.5px] font-medium text-os-muted hover:text-os-text">← Command centre</Link>
      </div>
      <AdminTabs items={items.map(({ href, label, exact }) => ({ href, label, exact }))} />
      <div className="mt-5">{children}</div>
    </div>
  );
}
