"use client";

import { createContext, useContext } from "react";
import type { Dictionary } from "./dictionaries/en";
import { DEFAULT_LOCALE, type Locale } from "./locales";
import { en } from "./dictionaries/en";

// Client Components can't read root params, so the locale and its dictionary
// are handed down once from the root layout and read from context. Only the
// active language's dictionary crosses the boundary, so adding languages
// never grows the client bundle.

type LocaleContextValue = { locale: Locale; dict: Dictionary };

const LocaleContext = createContext<LocaleContextValue>({ locale: DEFAULT_LOCALE, dict: en });

export function LocaleProvider({
  locale,
  dict,
  children,
}: LocaleContextValue & { children: React.ReactNode }) {
  return <LocaleContext.Provider value={{ locale, dict }}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}
