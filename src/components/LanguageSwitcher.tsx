"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import { LOCALES, localePath, splitLocale, type Locale } from "@/i18n/locales";

// The language menu.
//
// Switching keeps you on the page you were reading rather than dumping you on
// the homepage: the current path is stripped of its locale prefix and rebuilt
// under the new one, so /ar/tours/1-day-giza-tour becomes /tours/1-day-giza-tour
// in English and /fr/tours/1-day-giza-tour in French.
//
// Plain <a> rather than next/link on purpose. A locale change swaps the
// document's `lang` and `dir`, which live on <html> and are set by the root
// layout — a client-side navigation would keep the old ones until a reload,
// which is exactly how a switched-to-Arabic page ends up rendering
// left-to-right.

export function LanguageSwitcher({ tone = "light" }: { tone?: "light" | "dark" }) {
  const { locale, dict } = useLocale();
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  // usePathname gives the browser path, which for English has no prefix —
  // splitLocale handles both shapes.
  const { path } = splitLocale(pathname);
  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  const trigger =
    tone === "dark"
      ? "text-cream/80 hover:text-cream"
      : "text-ink-soft hover:text-ink";

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={dict.language.choose}
        className={`inline-flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-sm font-medium transition hover:border-gold/40 ${trigger}`}
      >
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4 shrink-0" aria-hidden="true">
          <circle cx="10" cy="10" r="7.25" />
          <path d="M2.75 10h14.5M10 2.75c1.9 2 2.9 4.5 2.9 7.25s-1 5.25-2.9 7.25c-1.9-2-2.9-4.5-2.9-7.25s1-5.25 2.9-7.25Z" />
        </svg>
        <span>{current.nativeName}</span>
        <svg viewBox="0 0 20 20" fill="currentColor" className={`h-3.5 w-3.5 shrink-0 transition ${open ? "rotate-180" : ""}`} aria-hidden="true">
          <path d="M5.5 7.5 10 12l4.5-4.5H5.5Z" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          aria-label={dict.language.label}
          // start-0 rather than left-0 so the menu hangs off the correct edge
          // once the document flips to RTL.
          className="absolute start-0 z-50 mt-2 min-w-[11rem] overflow-hidden rounded-2xl border border-black/10 bg-cream py-1 shadow-lg shadow-black/5"
        >
          {LOCALES.map((l) => {
            const active = l.code === locale;
            return (
              <a
                key={l.code}
                href={localePath(path, l.code as Locale)}
                hrefLang={l.htmlLang}
                lang={l.htmlLang}
                dir={l.dir}
                role="menuitem"
                aria-current={active ? "true" : undefined}
                className={`flex items-center justify-between gap-3 px-4 py-2.5 text-sm transition ${
                  active ? "bg-sand-dim font-semibold text-ink" : "text-ink-soft hover:bg-sand-dim/60 hover:text-ink"
                }`}
              >
                <span>{l.nativeName}</span>
                <span className="text-xs uppercase tracking-wide text-ink-soft/50">{l.code}</span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
