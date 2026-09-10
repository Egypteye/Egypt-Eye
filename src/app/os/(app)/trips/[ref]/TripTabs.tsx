"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Tabs that scroll horizontally on a phone rather than wrapping into three
// rows, and that hide the ones this person's permissions do not reach — a
// photographer's trip page has five tabs, not nine with four dead ends.
export function TripTabs({
  tripRef, permissions,
}: {
  tripRef: string;
  permissions: { costs: boolean; media: boolean; documents: boolean; chat: boolean; tasks: boolean };
}) {
  const pathname = usePathname();
  const base = `/os/trips/${tripRef}`;

  const tabs = [
    { href: base, label: "Overview", show: true, exact: true },
    { href: `${base}/team`, label: "Crew and resources", show: true },
    { href: `${base}/itinerary`, label: "Itinerary", show: true },
    { href: `${base}/tasks`, label: "Tasks", show: permissions.tasks },
    { href: `${base}/costs`, label: "Money", show: permissions.costs },
    { href: `${base}/media`, label: "Media", show: permissions.media },
    { href: `${base}/documents`, label: "Documents", show: permissions.documents },
    { href: `${base}/chat`, label: "Channel", show: permissions.chat },
    { href: `${base}/activity`, label: "History", show: true },
  ].filter((t) => t.show);

  return (
    <nav className="os-scroll os-no-print -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex min-w-max items-center gap-1 border-b border-os-line">
        {tabs.map((tab) => {
          const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={`-mb-px inline-block whitespace-nowrap border-b-2 px-3 py-2 text-[13px] font-medium transition ${
                  active ? "border-os-gold text-os-text" : "border-transparent text-os-muted hover:text-os-text"
                }`}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
