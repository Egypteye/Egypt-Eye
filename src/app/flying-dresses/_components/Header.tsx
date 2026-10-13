"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { brand, flyingDressEnquiry, nav, whatsappHref } from "@/content/flyingDresses";
import { fdPath } from "../_lib/seo";

/**
 * The header.
 *
 * A client component for one reason: the mobile drawer has open/closed state.
 * Everything else here is a link, and the whole thing is small enough that
 * splitting the static half into a server component would cost more in
 * indirection than it saves in bytes.
 *
 * ACCESSIBILITY DECISIONS
 *
 * - The drawer is a plain nav, not a modal dialog. It covers the viewport
 *   below the header but the header stays interactive, so trapping focus
 *   inside it would make the close button unreachable by keyboard from
 *   outside. Escape closes it; the toggle keeps focus.
 * - `aria-expanded` lives on the button that controls the drawer, and
 *   `aria-controls` points at it, which is what tells a screen reader the
 *   relationship rather than leaving it to the visual arrangement.
 * - Body scroll is locked while it is open, because a full-height overlay you
 *   can scroll the page behind is disorienting on a phone.
 * - The drawer closes on navigation. Without that, tapping a link on a phone
 *   changes the page underneath an overlay that is still covering it, which
 *   reads as a broken link.
 */
export function FlyingDressesHeader({ logo }: { logo?: string | null }) {
  const pathname = usePathname();
  const drawerId = useId();

  /**
   * The drawer's open state, DERIVED from the route rather than reset by an
   * effect.
   *
   * It stores the path the drawer was opened on, so the moment the pathname
   * changes `open` is false again — the drawer closes on navigation with no
   * effect, no setState during render, and no frame where an overlay is still
   * covering a page that has already changed underneath it.
   *
   * The obvious version of this is a useEffect on pathname calling
   * setOpen(false), which React's own lint rules now flag
   * (react-hooks/set-state-in-effect) and which renders once with the drawer
   * still open before correcting itself.
   */
  const [openFor, setOpenFor] = useState<string | null>(null);
  const open = openFor === pathname;
  const setOpen = (next: boolean) => setOpenFor(next ? pathname : null);

  // Escape closes; scroll locks while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      // setOpenFor rather than the setOpen helper: the helper closes over
      // `pathname` and is a new function every render, so depending on it
      // would re-subscribe this listener on each one. The state setter is
      // stable.
      if (event.key === "Escape") setOpenFor(null);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  const isCurrent = (href: string) =>
    pathname === href || (href !== fdPath() && pathname.startsWith(`${href}/`));

  return (
    <header className="fd-header">
      <div className="fd-shell fd-header-inner">
        {/* The supplied logo when it is in the repository, the typeset
            wordmark otherwise. See _lib/logo.ts — dropping the file in is the
            whole switch. `priority` because this is in the first viewport on
            every page and is part of what the brand is recognised by. */}
        <Link className="fd-wordmark" href={fdPath()} aria-label={`${brand.name} — home`}>
          {logo ? (
            <Image
              src={logo}
              alt={brand.name}
              width={320}
              height={120}
              priority
              className="fd-wordmark-img"
            />
          ) : (
            <>
              <span className="fd-wordmark-name">{brand.shortName}</span>
              <span className="fd-wordmark-sub">Egypt</span>
            </>
          )}
        </Link>

        <nav className="fd-nav" aria-label="Main">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isCurrent(item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Link className="fd-btn fd-header-cta" href={fdPath("/enquire")}>
            Plan your shoot
          </Link>

          <button
            type="button"
            className="fd-burger"
            aria-expanded={open}
            aria-controls={drawerId}
            onClick={() => setOpen(!open)}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span className="fd-sr">{open ? "Close menu" : "Open menu"}</span>
          </button>
        </div>
      </div>

      {open ? (
        <nav className="fd-drawer" id={drawerId} aria-label="Main">
          <ul>
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} aria-current={isCurrent(item.href) ? "page" : undefined}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="fd-actions">
            <Link className="fd-btn fd-btn-block" href={fdPath("/enquire")}>
              Plan your shoot
            </Link>
            <a
              className="fd-btn fd-btn-ghost fd-btn-block"
              href={whatsappHref(flyingDressEnquiry())}
              target="_blank"
              rel="noopener noreferrer"
            >
              Message on WhatsApp
              <span className="fd-sr"> (opens in a new tab)</span>
            </a>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
