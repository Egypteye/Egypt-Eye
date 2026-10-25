import Link from "next/link";
import { redirect } from "next/navigation";
import "../globals.css";
import { getCurrentUser, isOsStaff } from "@/lib/auth/session";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { getHeadlineCounts } from "@/lib/os/data";
import { OsNav } from "./OsNav";

// Egypt Eye OS — one place for the booking that reservations, operations and
// social currently each write down separately.
//
// Its own root layout, for the same reason /studio has one: the site's root
// layout moved under [locale] to carry lang/dir, and the OS is a single
// internal tool in one language with nothing to translate.
//
// The font stack is deliberately NOT the brand's. The site is set in Cormorant
// Garamond, a display serif chosen for headlines; this is a dense data screen
// read on a phone in the dark at 6am, where that face turns into hairlines.
// A system UI sans is the right tool, and it loads nothing.

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Egypt Eye OS",
  robots: { index: false, follow: false },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function OsLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // The gate is repeated in every page and every action via requireOsStaff().
  // This one only decides what to draw: a layout cannot protect a server
  // action, which is a POST endpoint reachable without ever rendering a page.
  if (!user) redirect("/account/login?next=/os");
  if (!isOsStaff(user)) redirect("/account");

  const counts = supabaseAdminConfigured
    ? await getHeadlineCounts().catch(() => ({ today: 0, dueFollowUps: 0 }))
    : { today: 0, dueFollowUps: 0 };

  return (
    <html lang="en" className="h-full">
      <body
        className="min-h-full bg-sand-dim text-ink"
        style={{
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}
      >
        <header className="sticky top-0 z-20 border-b border-black/10 bg-ink">
          <div className="mx-auto w-full max-w-6xl px-4 py-3">
            <div className="flex items-center gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-light">Egypt Eye OS</p>
              <span className="ml-auto text-xs text-cream/50">
                {user.firstName ?? user.email}
                <span className="ml-1.5 rounded bg-cream/10 px-1.5 py-0.5 font-semibold uppercase tracking-wider text-cream/70">
                  {user.role}
                </span>
              </span>
            </div>
            <OsNav today={counts.today} dueFollowUps={counts.dueFollowUps} />
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-6">
          {!supabaseAdminConfigured ? (
            <div className="mb-6 rounded-xl border border-dashed border-black/20 bg-cream p-5 text-sm text-ink-soft">
              <p className="font-semibold text-ink">The OS has no database connected on this deployment.</p>
              <p className="mt-1">
                Add <code>SUPABASE_SERVICE_ROLE_KEY</code> and the other Supabase variables, then run migration{" "}
                <code>0025_os_simple.sql</code>. Until then every screen here is empty rather than wrong — nothing
                below is pretending to work.
              </p>
            </div>
          ) : null}
          {children}
        </main>

        <footer className="mx-auto w-full max-w-6xl px-4 pb-10 pt-2">
          <Link href="/account" className="text-xs text-ink-soft/70 underline">
            Leave the OS
          </Link>
        </footer>
      </body>
    </html>
  );
}
