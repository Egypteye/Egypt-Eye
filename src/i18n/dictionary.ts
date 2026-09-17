import { notFound } from "next/navigation";
import { DEFAULT_LOCALE, isLocale, type Locale } from "./locales";
import { en, type Dictionary } from "./dictionaries/en";
import { ar } from "./dictionaries/ar";
import { de } from "./dictionaries/de";
import { fr } from "./dictionaries/fr";
import { es } from "./dictionaries/es";
import { it } from "./dictionaries/it";
import { ru } from "./dictionaries/ru";

// Dictionaries are imported statically rather than dynamically because they
// are small, typed against the English one, and needed during static
// generation of every page in every language — a dynamic import would buy
// nothing and cost a await-per-page.

const DICTIONARIES: Record<Locale, Dictionary> = { en, ar, de, fr, es, it, ru };

export type { Dictionary };

export function dictionaryFor(locale: Locale): Dictionary {
  return DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];
}

/**
 * The dictionary for the locale in the URL.
 *
 * Reads the locale from the route's root param, so any Server Component —
 * however deeply nested, and including shared utilities — can call this
 * without the locale being threaded through as a prop. That is what makes
 * translating 56 routes a matter of swapping strings rather than rewriting
 * every component signature.
 */
export async function getDictionary(): Promise<Dictionary> {
  const { locale } = await import("next/root-params");
  const value = await locale();
  if (!value || !isLocale(value)) notFound();
  return dictionaryFor(value);
}

/** The active locale, for Server Components that need the code itself. */
export async function getLocale(): Promise<Locale> {
  const { locale } = await import("next/root-params");
  const value = await locale();
  if (!value || !isLocale(value)) notFound();
  return value;
}

export { t } from "./format";
