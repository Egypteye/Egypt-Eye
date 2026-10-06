"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ResolvedSiteSettings } from "@/content/types";
import { useJourneyItems } from "@/lib/journey";
import { useSessionUser } from "@/lib/auth/useSessionUser";
import { useLocale, useTr } from "@/i18n/LocaleProvider";
import { localePath } from "@/i18n/locales";
import { LanguageSwitcher } from "./LanguageSwitcher";
import {
  HEADER_ACCENTS,
  HEADER_DROPDOWN_LAST,
  HEADER_HIDDEN,
  HEADER_LABELS,
  HEADER_PRIMARY,
  type NavAccent,
} from "@/content/navGroups";

// Which pages are in the bar, which are in the "More" dropdown and which are
// footer-only lives in content/navGroups.ts — see the note at the top of it.
// It used to be a list of English LABELS matched against site.nav, which is
// how Signature Experiences came to have no link anywhere: the label was
// listed, site.nav never carried it, and the lookup quietly found nothing.
// Everything here matches on href instead.

/**
 * The two new accents, and the one that was already intended.
 *
 * Both new colours clear WCAG AA as text: terracotta is 5.12:1 on cream and
 * 4.86:1 on the dropdown's hover tint, nile is 7.75:1. Gold itself is 2.38:1
 * and is deliberately not used for text anywhere here — it is a background.
 */
const ACCENT_CLASSES: Record<NavAccent, { bar: string; sheet: string }> = {
  // Unique Photoshoots — the brand amber. Nile green was the first choice and
  // was wrong: rgb(65,87,65) against a default of rgb(74,92,79) is a colour
  // only a colour picker can see, so the item did not stand out at all. The
  // test is whether it reads as different, not whether a class was applied.
  photoshoots: { bar: "text-gold-dark hover:text-gold", sheet: "text-gold-dark" },
  // Customize Your Tour — the only item that starts something rather than
  // going somewhere, so it gets a tinted pill instead of just coloured text.
  customize: {
    bar: "text-terracotta hover:text-terracotta/80",
    sheet: "bg-terracotta/10 text-terracotta hover:bg-terracotta/15",
  },
};

export function Navbar({ siteSettings: site }: { siteSettings: ResolvedSiteSettings }) {
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const journeyCount = useJourneyItems().length;
  const { locale, dict } = useLocale();
  const tr = useTr();
  // Nav labels are translated by href, not by their English text, and every
  // nav link is rewritten into the active language so browsing never drops
  // the visitor back into English.
  // HEADER_LABELS is checked first and deliberately: "Shop" is what the menu
  // calls The Boutique, and only the menu. A translation for the href still
  // wins over it, so a localised menu is never overridden by English.
  const label = (item: { href: string; label: string }) =>
    dict.nav.byHref[item.href] ?? HEADER_LABELS[item.href] ?? item.label;
  const accent = (href: string) => HEADER_ACCENTS[href];
  const to = (href: string) => localePath(href, locale);
  // Presentation only — which account link/avatar to show. Every protected
  // page still authorizes server-side; see useSessionUser's own comment.
  const currentUser = useSessionUser();

  // The bar. Resolved by href against site.nav so the Studio's label and the
  // translations still win, with navGroups' own label as the fallback for a
  // page site.nav does not list.
  const primaryNav = HEADER_PRIMARY.map((entry) => {
    const fromNav = site.nav.find((item) => item.href === entry.href);
    return { href: entry.href, label: fromNav?.label ?? entry.label };
  });

  // Everything else, minus the four that are footer-only now, with Customize
  // Your Tour pinned last. Anything the Studio adds to the nav that this file
  // has never heard of lands here rather than disappearing.
  const inBar = new Set(HEADER_PRIMARY.map((entry) => entry.href));
  const dropdown = site.nav.filter(
    (item) => !inBar.has(item.href) && !HEADER_HIDDEN.includes(item.href) && item.href !== HEADER_DROPDOWN_LAST
  );
  const lastItem = site.nav.find((item) => item.href === HEADER_DROPDOWN_LAST);
  const moreNav = lastItem ? [...dropdown, lastItem] : dropdown;

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y <= 80) setNavHidden(false);
        else if (y > lastY) setNavHidden(true);
        else if (y < lastY) setNavHidden(false);
        lastY = y;
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMoreOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const hidden = navHidden && !open && !moreOpen;

  return (
    <header
      className={`sticky top-0 z-50 border-b border-black/5 bg-cream/90 backdrop-blur-md transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
        hidden ? "pointer-events-none -translate-y-3 opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink p-1.5 ring-1 ring-gold/40">
            <Image
              src="/brand/egypt-eye-mark-gold.png"
              alt=""
              width={40}
              height={40}
              className="h-full w-full object-contain"
              priority
            />
          </span>
          <span className="font-display text-lg font-semibold leading-tight text-ink">
            {site.shortName}
          </span>
        </Link>

        <nav className="hidden items-center justify-center gap-x-6 lg:flex lg:flex-1 lg:px-6">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={to(item.href)}
              className={`whitespace-nowrap text-[13px] font-semibold transition ${
                accent(item.href)
                  ? ACCENT_CLASSES[accent(item.href)!].bar
                  : "text-ink-soft hover:text-gold-dark"
              }`}
            >
              {label(item)}
            </Link>
          ))}

          {moreNav.length > 0 && (
            <div className="relative" ref={moreRef}>
              <button
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                aria-expanded={moreOpen}
                className="flex items-center gap-1 whitespace-nowrap text-[13px] font-semibold text-ink-soft transition hover:text-gold-dark"
              >
                {dict.nav.more}
                <svg
                  viewBox="0 0 20 20"
                  className={`h-3.5 w-3.5 transition-transform duration-300 ${moreOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M5 7.5l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <div
                className={`absolute right-0 top-full z-10 mt-3 w-56 origin-top-right rounded-2xl border border-black/5 bg-cream p-2 shadow-xl shadow-black/10 transition-[transform,opacity] duration-200 ease-out ${
                  moreOpen ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0"
                }`}
              >
                {moreNav.map((item) => {
                  const tone = accent(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={to(item.href)}
                      onClick={() => setMoreOpen(false)}
                      /* The pinned last item is separated by a rule as well as
                         coloured, so it reads as the action at the end of the
                         list rather than one more destination in it. */
                      className={`block whitespace-nowrap rounded-lg px-3 py-2 text-[13px] font-semibold transition ${
                        item.href === HEADER_DROPDOWN_LAST
                          ? "mt-1 border-t border-black/5 pt-2.5"
                          : ""
                      } ${
                        tone
                          ? ACCENT_CLASSES[tone].sheet
                          : "text-ink-soft hover:bg-sand-dim hover:text-gold-dark"
                      }`}
                    >
                      {label(item)}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </nav>

        <div className="hidden items-center gap-2.5 lg:flex">
          <LanguageSwitcher />
          <Link
            href={to("/my-journey")}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-gold/30 bg-gold/10 px-3.5 py-2.5 text-[13px] font-semibold text-gold-dark transition hover:bg-gold/20"
          >
            {dict.nav.myJourney}
            {journeyCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold-dark text-[11px] text-cream">
                {journeyCount}
              </span>
            )}
          </Link>
          <Link
            href={to("/customize")}
            className="whitespace-nowrap rounded-full bg-ink px-4 py-2.5 text-[13px] font-semibold text-cream transition hover:bg-gold-dark"
          >
            {dict.nav.planMyTrip}
          </Link>
          <Link
            href={to(currentUser ? "/account" : "/account/login")}
            className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-black/10 text-ink-soft transition hover:border-gold/40 hover:text-ink"
            aria-label={currentUser ? tr("My Account") : tr("Log in")}
            title={currentUser ? `${tr("My Account")}${currentUser.firstName ? ` — ${currentUser.firstName}` : ""}` : tr("Log in")}
          >
            {currentUser?.avatarUrl ? (
              <Image src={currentUser.avatarUrl} alt="" width={40} height={40} className="h-full w-full object-cover" />
            ) : (
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <circle cx="12" cy="8" r="3.4" />
                <path d="M4.5 20c1.6-4 4.4-6 7.5-6s5.9 2 7.5 6" strokeLinecap="round" />
              </svg>
            )}
          </Link>
        </div>

        <button
          className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={dict.nav.toggleMenu}
          aria-expanded={open}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
            {open ? (
              <path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="border-t border-black/5 bg-cream lg:hidden">
          <div className="flex flex-col gap-1 px-5 py-4">
            {/* Language first in the mobile sheet: a visitor who can't read
                the menu needs to reach this before anything else. */}
            <div className="mb-2 border-b border-black/5 pb-3">
              <LanguageSwitcher />
            </div>
            {/* The same selection the desktop header shows, in the same
                order — bar items first, then the dropdown. This rendered
                site.nav in full, which is the long list the header no longer
                has: the four footer-only pages appeared here regardless. */}
            {[...primaryNav, ...moreNav].map((item) => {
              const tone = accent(item.href);
              return (
                <Link
                  key={item.href}
                  href={to(item.href)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-semibold ${
                    item.href === HEADER_DROPDOWN_LAST ? "mt-1 border-t border-black/5 pt-3" : ""
                  } ${tone ? ACCENT_CLASSES[tone].sheet : "text-ink-soft hover:bg-sand-dim"}`}
                  onClick={() => setOpen(false)}
                >
                  {label(item)}
                </Link>
              );
            })}
            <Link
              href={to("/my-journey")}
              className="mt-2 flex items-center justify-center gap-1.5 rounded-lg border border-gold/30 bg-gold/10 px-3 py-2.5 text-sm font-semibold text-gold-dark"
              onClick={() => setOpen(false)}
            >
              {dict.nav.myJourney}
              {journeyCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold-dark text-[11px] text-cream">
                  {journeyCount}
                </span>
              )}
            </Link>
            <Link
              href={to("/customize")}
              className="mt-2 rounded-full bg-ink px-5 py-2.5 text-center text-sm font-semibold text-cream"
              onClick={() => setOpen(false)}
            >
              {dict.nav.planMyTrip}
            </Link>
            <Link
              href={to(currentUser ? "/account" : "/account/login")}
              className="mt-1 rounded-lg px-3 py-2.5 text-center text-sm font-semibold text-ink-soft hover:bg-sand-dim"
              onClick={() => setOpen(false)}
            >
              {currentUser ? `${tr("My Account")}${currentUser.firstName ? ` (${currentUser.firstName})` : ""}` : tr("Log In / Create Account")}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
