"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { ResolvedSiteSettings } from "@/content/types";
import { useJourneyItems } from "@/lib/journey";
import type { CurrentUser } from "@/lib/auth/session";

export function Navbar({
  siteSettings: site,
  currentUser,
}: {
  siteSettings: ResolvedSiteSettings;
  currentUser: CurrentUser | null;
}) {
  const [open, setOpen] = useState(false);
  const journeyCount = useJourneyItems().length;

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-cream/90 backdrop-blur-md">
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

        <nav className="hidden flex-wrap items-center justify-end gap-x-5 gap-y-2 xl:flex xl:flex-1 xl:px-6">
          {site.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap text-[13px] font-medium text-ink-soft transition hover:text-gold-dark"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2.5 xl:flex">
          <Link
            href="/my-journey"
            className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-gold/30 bg-gold/10 px-3.5 py-2.5 text-[13px] font-semibold text-gold-dark transition hover:bg-gold/20"
          >
            My Journey
            {journeyCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold-dark text-[11px] text-cream">
                {journeyCount}
              </span>
            )}
          </Link>
          <Link
            href="/customize"
            className="whitespace-nowrap rounded-full bg-ink px-4 py-2.5 text-[13px] font-semibold text-cream transition hover:bg-gold-dark"
          >
            Plan My Trip
          </Link>
          <Link
            href={currentUser ? "/account" : "/account/login"}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-ink-soft transition hover:border-gold/40 hover:text-ink"
            aria-label={currentUser ? "My Account" : "Log in"}
            title={currentUser ? `My Account${currentUser.firstName ? ` — ${currentUser.firstName}` : ""}` : "Log in"}
          >
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <circle cx="12" cy="8" r="3.4" />
              <path d="M4.5 20c1.6-4 4.4-6 7.5-6s5.9 2 7.5 6" strokeLinecap="round" />
            </svg>
          </Link>
        </div>

        <button
          className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 xl:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
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
        <nav className="border-t border-black/5 bg-cream xl:hidden">
          <div className="flex flex-col gap-1 px-5 py-4">
            {site.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-sand-dim"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/my-journey"
              className="mt-2 flex items-center justify-center gap-1.5 rounded-lg border border-gold/30 bg-gold/10 px-3 py-2.5 text-sm font-semibold text-gold-dark"
              onClick={() => setOpen(false)}
            >
              My Journey
              {journeyCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold-dark text-[11px] text-cream">
                  {journeyCount}
                </span>
              )}
            </Link>
            <Link
              href="/customize"
              className="mt-2 rounded-full bg-ink px-5 py-2.5 text-center text-sm font-semibold text-cream"
              onClick={() => setOpen(false)}
            >
              Plan My Trip
            </Link>
            <Link
              href={currentUser ? "/account" : "/account/login"}
              className="mt-1 rounded-lg px-3 py-2.5 text-center text-sm font-medium text-ink-soft hover:bg-sand-dim"
              onClick={() => setOpen(false)}
            >
              {currentUser ? `My Account${currentUser.firstName ? ` (${currentUser.firstName})` : ""}` : "Log In / Create Account"}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
