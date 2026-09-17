"use client";

import { usePathname } from "next/navigation";
import { useLocale } from "@/i18n/LocaleProvider";
import { LOCALES, localePath, splitLocale } from "@/i18n/locales";

// The footer's language picker.
//
// A flat row of links rather than the navbar's dropdown: at the very bottom of
// the page a menu would open below the fold or get clipped by the viewport,
// and there are only seven languages — few enough to simply show. It also
// works with JavaScript off, and gives crawlers seven more plain links to the
// translated versions of whatever page they're on.
//
// Like the navbar switcher these are real navigations, not client-side ones,
// because `lang` and `dir` live on <html> and only a document load updates
// them — otherwise switching to Arabic leaves the page laid out left-to-right.

export function LanguageLinks() {
  const { locale, dict } = useLocale();
  const pathname = usePathname() || "/";
  const { path } = splitLocale(pathname);

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-cream/50">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4 shrink-0" aria-hidden="true">
          <circle cx="10" cy="10" r="7.25" />
          <path d="M2.75 10h14.5M10 2.75c1.9 2 2.9 4.5 2.9 7.25s-1 5.25-2.9 7.25c-1.9-2-2.9-4.5-2.9-7.25s1-5.25 2.9-7.25Z" />
        </svg>
        {dict.language.label}
      </span>

      <ul className="flex flex-wrap items-center gap-x-1 gap-y-1.5">
        {LOCALES.map((l) => {
          const active = l.code === locale;
          return (
            <li key={l.code}>
              <a
                href={localePath(path, l.code)}
                hrefLang={l.htmlLang}
                lang={l.htmlLang}
                dir={l.dir}
                aria-current={active ? "true" : undefined}
                className={`inline-block rounded-full px-3 py-1.5 text-sm transition ${
                  active
                    ? "bg-cream/15 font-semibold text-cream"
                    : "text-cream/70 hover:bg-cream/10 hover:text-cream"
                }`}
              >
                {l.nativeName}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
