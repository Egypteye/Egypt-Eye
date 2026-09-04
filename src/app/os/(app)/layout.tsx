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

  // The palette is where people go to start something, not only to navigate,
  // so the create routes are offered alongside the destinations — each one
  // gated on the same permission the page behind it enforces.
  const createActions: PaletteAction[] = ([
    { permission: "trips.create", href: "/os/trips/new", label: "New trip", icon: "Trip", description: "Start the operational record for a closed booking." },
    { permission: "clients.create", href: "/os/clients/new", label: "New client", icon: "Users", description: "One record per person or agency, matched against existing ones." },
    { permission: "resources.create", href: "/os/resources/new", label: "Register a resource", icon: "Truck", description: "A vehicle, dress or piece of equipment." },
    { permission: "suppliers.create", href: "/os/suppliers/new", label: "Register a supplier", icon: "Building", description: "A partner the operation pays." },
    { permission: "team.create", href: "/os/team/new", label: "Add a person", icon: "Client", description: "Staff or freelance crew. Creates a record, not a login." },
    { permission: "admin.catalog", href: "/os/admin/catalog/locations/new", label: "Add a location", icon: "Pin", description: "Access, permits and the best hour to be there." },
    { permission: "leads.create", href: "/os/reservations/new", label: "Log an enquiry", icon: "Chat", description: "Somebody asked. Record that it arrived and where from." },
    { permission: "companies.create", href: "/os/partnerships/new", label: "Register a partner", icon: "Building", description: "An agency, operator or hotel that books through us." },
  ] as const)
    .filter((item) => holds(item.permission))
    .map(({ href, label, icon, description }) => ({ href, label, icon, description, group: "Create" }));

  const paletteActions: PaletteAction[] = [
    ...createActions,
    ...groups.flatMap((group) =>
      group.items.map((item) => ({
        href: item.href, label: item.label, icon: item.icon, description: item.description, group: group.label,
      })),
    ),
  ];

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
            "The OS runs on its OWN Supabase project, separate from the website's. Create a second project, add the variables below from it, then run migrations 0018 onward IN THAT PROJECT."}
        </p>
        <ul className="mt-4 space-y-1.5 text-[12.5px] text-os-muted">
          <li><code className="rounded bg-black/[0.05] px-1.5 py-0.5">NEXT_PUBLIC_OS_SUPABASE_URL</code></li>
          <li><code className="rounded bg-black/[0.05] px-1.5 py-0.5">NEXT_PUBLIC_OS_SUPABASE_ANON_KEY</code></li>
          <li><code className="rounded bg-black/[0.05] px-1.5 py-0.5">OS_SUPABASE_SERVICE_ROLE_KEY</code></li>
        </ul>
        <p className="mt-4 text-[12.5px] leading-relaxed text-os-muted">
          The migrations are <code>0018_egypt_eye_os_core.sql</code> (schema),{" "}
          <code>0019_egypt_eye_os_config.sql</code> (roles and permissions, required),{" "}
          <code>0020_egypt_eye_os_demo.sql</code> (demo data, optional),{" "}
          <code>0021_egypt_eye_os_functions.sql</code>, then{" "}
          <code>0022</code>–<code>0024</code> for the commercial layer. Migrations{" "}
          <code>0001</code>–<code>0017</code> belong to the website and must not be run here.
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
