"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon, type IconName } from "./icons";
import { Avatar } from "./ui";

// ---------------------------------------------------------------------------
// THE OS SHELL
// ---------------------------------------------------------------------------
// Two genuinely different layouts, not one shrunk down:
//
//   Desktop — a persistent dark rail on the left. Operations lives in this
//   product all day and needs everything one click away, plus the density to
//   see forty trips without scrolling.
//
//   Mobile — a bottom tab bar with the five things a field employee actually
//   does, big enough to hit with a thumb while holding a camera bag. The full
//   navigation is behind "More", because a driver does not need the price
//   book on a phone at 05:45.
// ---------------------------------------------------------------------------

type Item = { href: string; label: string; icon: IconName; exact?: boolean; description?: string };
type Group = { label: string; items: Item[] };

export function Shell({
  groups, mobileItems, user, unread, children,
}: {
  groups: Group[];
  mobileItems: Item[];
  user: { name: string; displayName: string; roleLabel: string; avatarUrl: string | null; href: string };
  unread: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (item: Item) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <div className="os-root min-h-screen">
      {/* ---------------------------------------------------------------- */}
      {/* Desktop rail                                                      */}
      {/* ---------------------------------------------------------------- */}
      <aside className="os-no-print fixed inset-y-0 left-0 z-40 hidden w-[236px] flex-col bg-os-ink lg:flex">
        <Link href="/os" className="flex items-center gap-2.5 px-5 py-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-os-gold text-[13px] font-bold text-os-ink">EE</span>
          <span className="min-w-0">
            <span className="os-wordmark block text-[11px] font-semibold text-os-gold">EGYPT EYE</span>
            <span className="block text-[11px] font-medium text-white/45">Operating System</span>
          </span>
        </Link>

        <nav className="os-scroll flex-1 overflow-y-auto px-3 pb-4">
          {groups.map((group) => (
            <div key={group.label} className="mb-4">
              <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/30">{group.label}</p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const Glyph = Icon[item.icon];
                  const active = isActive(item);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        title={item.description}
                        className={`flex items-center gap-2.5 rounded-lg px-2 py-[7px] text-[13px] transition ${
                          active ? "bg-white/[0.1] font-semibold text-white" : "text-white/60 hover:bg-white/[0.05] hover:text-white"
                        }`}
                      >
                        <span className={active ? "text-os-gold" : "text-white/40"}><Glyph size={17} /></span>
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/[0.08] p-3">
          <Link href={user.href} className="flex items-center gap-2.5 rounded-lg px-2 py-2 transition hover:bg-white/[0.05]">
            <Avatar name={user.name} url={user.avatarUrl} size={30} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12.5px] font-semibold text-white">{user.name}</span>
              <span className="block truncate text-[11px] text-white/45">{user.roleLabel}</span>
            </span>
          </Link>
        </div>
      </aside>

      {/* ---------------------------------------------------------------- */}
      {/* Top bar                                                           */}
      {/* ---------------------------------------------------------------- */}
      <div className="lg:pl-[236px]">
        <header className="os-no-print sticky top-0 z-30 border-b border-os-line bg-os-canvas/85 backdrop-blur-md">
          <div className="flex h-14 items-center gap-2 px-4 sm:px-6">
            <Link href="/os" className="flex items-center gap-2 lg:hidden">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-os-ink text-[11px] font-bold text-os-gold">EE</span>
            </Link>

            <button
              onClick={() => window.dispatchEvent(new Event("os:open-command"))}
              className="ml-auto flex items-center gap-2 rounded-lg border border-os-line-strong bg-white px-2.5 py-1.5 text-[12.5px] text-os-faint transition hover:border-os-gold/50 hover:text-os-muted lg:ml-0 lg:mr-auto lg:w-[300px]"
              aria-label="Search or run a command"
            >
              <Icon.Search size={15} />
              <span className="hidden truncate sm:inline">Search or jump to…</span>
              <kbd className="ml-auto hidden rounded border border-os-line px-1 text-[10px] lg:inline">⌘K</kbd>
            </button>

            <Link
              href="/os/notifications"
              className="relative rounded-lg p-2 text-os-muted transition hover:bg-black/[0.04] hover:text-os-text"
              aria-label={unread ? `${unread} unread notifications` : "Notifications"}
            >
              <Icon.Bell size={18} />
              {unread > 0 ? (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-os-red px-1 text-[9.5px] font-bold text-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              ) : null}
            </Link>

            <Link href={user.href} className="rounded-lg p-1 lg:hidden" aria-label="Your workspace">
              <Avatar name={user.name} url={user.avatarUrl} size={28} />
            </Link>
          </div>
        </header>

        <main className="px-4 pb-24 pt-5 sm:px-6 lg:pb-10">{children}</main>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Mobile tab bar                                                    */}
      {/* ---------------------------------------------------------------- */}
      <nav className="os-no-print fixed inset-x-0 bottom-0 z-40 border-t border-os-line bg-white/95 backdrop-blur-md lg:hidden">
        <ul className="flex items-stretch">
          {mobileItems.slice(0, 4).map((item) => {
            const Glyph = Icon[item.icon];
            const active = isActive(item);
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  className={`flex h-14 flex-col items-center justify-center gap-0.5 text-[10.5px] font-medium transition ${
                    active ? "text-os-text" : "text-os-faint"
                  }`}
                >
                  <span className={active ? "text-os-gold" : ""}><Glyph size={19} /></span>
                  <span className="truncate px-1">{item.label}</span>
                </Link>
              </li>
            );
          })}
          <li className="flex-1">
            <button
              onClick={() => setMoreOpen(true)}
              className="flex h-14 w-full flex-col items-center justify-center gap-0.5 text-[10.5px] font-medium text-os-faint"
            >
              <Icon.Menu size={19} />
              More
            </button>
          </li>
        </ul>
      </nav>

      {moreOpen ? (
        <div className="os-no-print fixed inset-0 z-50 bg-black/45 lg:hidden" onClick={() => setMoreOpen(false)} role="presentation">
          <div
            className="os-fade absolute inset-x-0 bottom-0 max-h-[82vh] overflow-y-auto rounded-t-2xl bg-white p-4 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[15px] font-semibold text-os-text">Everything</p>
              <button onClick={() => setMoreOpen(false)} className="rounded-lg p-2 text-os-muted" aria-label="Close">
                <Icon.Close size={18} />
              </button>
            </div>
            {groups.map((group) => (
              <div key={group.label} className="mb-4">
                <p className="pb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-os-faint">{group.label}</p>
                <ul className="grid grid-cols-2 gap-2">
                  {group.items.map((item) => {
                    const Glyph = Icon[item.icon];
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setMoreOpen(false)}
                          className="flex items-center gap-2 rounded-xl border border-os-line px-3 py-2.5 text-[13px] font-medium text-os-text"
                        >
                          <span className="text-os-muted"><Glyph size={17} /></span>
                          <span className="truncate">{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
