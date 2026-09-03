import Link from "next/link";
import { redirect } from "next/navigation";
import { Shell } from "@/components/os/Shell";
import { CommandPalette, type PaletteAction } from "@/components/os/CommandPalette";
import { LiveRefresh } from "@/components/os/LiveRefresh";
import { getActor } from "@/lib/os/actor";
import { osConfigured, friendlyError, getOrg } from "@/lib/os/db";
import { unreadCount } from "@/lib/os/notify";
import { NAV, visibleNav } from "@/lib/os/navigation";
import type { PermissionKey } from "@/lib/os/permissions";

// Auth-gated and per-user. Declared explicitly so a build without the Supabase
// environment fails loudly rather than shipping a cached, signed-out shell.
export const dynamic = "force-dynamic";

export default async function OsLayout({ children }: { children: React.ReactNode }) {
  if (!osConfigured) {
    return <SetupNotice />;
  }

  let actor;
  try {
    actor = await getActor();
  } catch (error) {
    const friendly = friendlyError(error);
    return <SetupNotice title={friendly.title} detail={friendly.detail} />;
  }

  if (!actor) redirect("/os/sign-in");

  if (actor.status === "suspended" || actor.status === "left") {
    return <SuspendedNotice name={actor.displayName} />;
  }

  const permissions = actor.permissions;
  const holds = (key: PermissionKey) => Boolean(permissions[key]);

  const groups = visibleNav(NAV, holds).map((g) => ({
    label: g.label,
    items: g.items.map(({ href, label, icon, exact, description }) => ({ href, label, icon, exact, description })),
  }));

  // The mobile tab bar is the four most-used destinations this person can
  // reach, in nav order, with "My day" always first — a field employee's whole
  // relationship with the OS starts there.
  const flat = groups.flatMap((g) => g.items);
  const preferred = ["/os/me", "/os/tomorrow", "/os/trips", "/os/tasks", "/os"];
  const mobileItems = [
    ...preferred.map((href) => flat.find((i) => i.href === href)).filter(Boolean),
    ...flat,
  ].filter((item, index, all): item is NonNullable<typeof item> =>
    Boolean(item) && all.findIndex((other) => other?.href === item?.href) === index,
  ).slice(0, 4);

  const paletteActions: PaletteAction[] = groups.flatMap((group) =>
    group.items.map((item) => ({
      href: item.href, label: item.label, icon: item.icon, description: item.description, group: group.label,
    })),
  );

  await getOrg();
  const unread = await unreadCount(actor.employeeId);
  const roleLabel = describeRoles(actor.roles.map((r) => r.name));

  return (
    <>
      <Shell
        groups={groups}
        mobileItems={mobileItems}
        unread={unread}
        user={{
          name: actor.name,
          displayName: actor.displayName,
          roleLabel,
          avatarUrl: actor.avatarUrl,
          href: "/os/me",
        }}
      >
        {children}
      </Shell>
      <CommandPalette actions={paletteActions} />
      <LiveRefresh />
    </>
  );
}

function describeRoles(roleNames: string[]): string {
  if (!roleNames.length) return "No role assigned";
  if (roleNames.length === 1) return roleNames[0];
  return `${roleNames[0]} +${roleNames.length - 1}`;
}

function SetupNotice({ title, detail }: { title?: string; detail?: string } = {}) {
  return (
    <div className={`os-root flex min-h-screen items-center justify-center px-6`}>
      <div className="max-w-lg rounded-2xl border border-os-line bg-white p-8">
        <p className="os-wordmark text-[11px] font-semibold text-os-gold">EGYPT EYE</p>
        <h1 className="mt-2 text-[22px] font-semibold text-os-text">
          {title ?? "Egypt Eye OS is not connected to a database yet"}
        </h1>
        <p className="mt-3 text-[13.5px] leading-relaxed text-os-muted">
          {detail ??
            "The OS runs on the same Supabase project as the website. Add the environment variables below, then run the migrations in supabase/migrations/ in order."}
        </p>
        <ul className="mt-4 space-y-1.5 text-[12.5px] text-os-muted">
          <li><code className="rounded bg-black/[0.05] px-1.5 py-0.5">NEXT_PUBLIC_SUPABASE_URL</code></li>
          <li><code className="rounded bg-black/[0.05] px-1.5 py-0.5">NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
          <li><code className="rounded bg-black/[0.05] px-1.5 py-0.5">SUPABASE_SERVICE_ROLE_KEY</code></li>
        </ul>
        <p className="mt-4 text-[12.5px] leading-relaxed text-os-muted">
          The migrations are <code>0018_egypt_eye_os_core.sql</code> (schema),{" "}
          <code>0019_egypt_eye_os_config.sql</code> (roles and permissions, required),{" "}
          <code>0020_egypt_eye_os_demo.sql</code> (demo data, optional) and{" "}
          <code>0021_egypt_eye_os_functions.sql</code>.
        </p>
        <Link href="/" className="mt-6 inline-block text-[13px] font-semibold text-os-gold hover:underline">
          ← Back to the website
        </Link>
      </div>
    </div>
  );
}

function SuspendedNotice({ name }: { name: string }) {
  return (
    <div className={`os-root flex min-h-screen items-center justify-center px-6`}>
      <div className="max-w-md rounded-2xl border border-os-line bg-white p-8 text-center">
        <h1 className="text-[20px] font-semibold text-os-text">This account is not active</h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-os-muted">
          {name}, your Egypt Eye OS access is currently suspended. Speak to an administrator.
        </p>
        <Link href="/" className="mt-6 inline-block text-[13px] font-semibold text-os-gold hover:underline">
          ← Back to the website
        </Link>
      </div>
    </div>
  );
}
