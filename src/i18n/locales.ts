// The languages Egypt Eye sells in, and everything the rest of the app needs
// to know about them. Adding one is a single entry here plus a dictionary
// file — no route, component or config changes anywhere else.
//
// The set is chosen from Egypt's actual inbound market rather than by adding
// languages for the sake of a longer list. Egypt took ~19M visitors in 2025;
// the UK and Russia remain the largest traditional source markets, France,
// Italy and Spain are long-standing European ones, and Arabic covers both
// GCC visitors and the domestic market. English stays the default and also
// serves the US, India and every market without its own translation.
//
// Deliberately left out for now: Chinese and Polish. Both are real and
// growing Egypt markets, but they skew to group-charter and Red Sea package
// travel rather than the private Cairo/Giza tours and photoshoots this
// business sells. They're one entry away if that changes.

export type Locale = "en" | "ar" | "fr" | "es" | "it" | "ru";

export type LocaleInfo = {
  code: Locale;
  /** How speakers of the language name it — what goes in the switcher. */
  nativeName: string;
  /** English name, for aria-labels and admin surfaces. */
  englishName: string;
  dir: "ltr" | "rtl";
  /** BCP-47 tag for <html lang> and hreflang. */
  htmlLang: string;
};

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALES: LocaleInfo[] = [
  { code: "en", nativeName: "English", englishName: "English", dir: "ltr", htmlLang: "en" },
  { code: "ar", nativeName: "العربية", englishName: "Arabic", dir: "rtl", htmlLang: "ar" },
  { code: "fr", nativeName: "Français", englishName: "French", dir: "ltr", htmlLang: "fr" },
  { code: "es", nativeName: "Español", englishName: "Spanish", dir: "ltr", htmlLang: "es" },
  { code: "it", nativeName: "Italiano", englishName: "Italian", dir: "ltr", htmlLang: "it" },
  { code: "ru", nativeName: "Русский", englishName: "Russian", dir: "ltr", htmlLang: "ru" },
];

export const LOCALE_CODES: Locale[] = LOCALES.map((l) => l.code);

export function isLocale(value: string): value is Locale {
  return (LOCALE_CODES as string[]).includes(value);
}

export function localeInfo(code: Locale): LocaleInfo {
  return LOCALES.find((l) => l.code === code) ?? LOCALES[0];
}

/**
 * The URL for a path in a given locale.
 *
 * English keeps the bare paths the site has always used — `/tours`, not
 * `/en/tours` — so every existing link, bookmark and indexed URL still
 * resolves exactly as before. Other locales are prefixed.
 */
export function localePath(path: string, locale: Locale): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return clean;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}

/** Splits a request path into its locale and the path beneath it. */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  const [, maybe, ...rest] = pathname.split("/");
  if (maybe && isLocale(maybe)) {
    return { locale: maybe, path: `/${rest.join("/")}`.replace(/\/$/, "") || "/" };
  }
  return { locale: DEFAULT_LOCALE, path: pathname || "/" };
}
