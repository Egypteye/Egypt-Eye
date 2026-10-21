"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// The whole navigation: three places, because there are three things to do.
//
// Every role sees every tab. The teams are nine people who already share a
// WhatsApp group, and hiding operations' day sheet from the desk that sold the
// booking is the kind of tidiness that makes a tool get abandoned for a
// spreadsheet. What differs by role is what each screen lets you CHANGE, which
// is enforced in the server actions rather than by hiding a link.

const TABS = [
  { href: "/os", label: "Today", countKey: "today" as const },
  { href: "/os/bookings", label: "Bookings", countKey: null },
  { href: "/os/follow-ups", label: "Follow-ups", countKey: "dueFollowUps" as const },
];

export function OsNav({ today, dueFollowUps }: { today: number; dueFollowUps: number }) {
  const pathname = usePathname();
  const counts = { today, dueFollowUps };

  return (
    <nav className="mt-2 flex gap-1">
      {TABS.map((tab) => {
        // Exact match for /os, prefix for the rest, so /os/bookings/EE-0001
        // still highlights Bookings without /os also lighting up everywhere.
        const active = tab.href === "/os" ? pathname === "/os" : pathname.startsWith(tab.href);
        const count = tab.countKey ? counts[tab.countKey] : 0;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${
              active ? "bg-cream text-ink" : "text-cream/70 hover:bg-cream/10 hover:text-cream"
            }`}
          >
            {tab.label}
            {count > 0 ? (
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
                  active ? "bg-ink text-cream" : "bg-gold text-ink"
                }`}
              >
                {count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
