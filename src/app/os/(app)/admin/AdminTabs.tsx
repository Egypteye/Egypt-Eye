"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminTabs({ items }: { items: { href: string; label: string; exact?: boolean }[] }) {
  const pathname = usePathname();
  return (
    <nav className="os-scroll -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex min-w-max items-center gap-1 border-b border-os-line">
        {items.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`-mb-px inline-block whitespace-nowrap border-b-2 px-3 py-2 text-[13px] font-medium transition ${
                  active ? "border-os-gold text-os-text" : "border-transparent text-os-muted hover:text-os-text"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
