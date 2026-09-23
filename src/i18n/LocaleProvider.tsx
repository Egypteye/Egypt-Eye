"use client";

import { createContext, useContext } from "react";
import type { Dictionary } from "./dictionaries/en";
import { DEFAULT_LOCALE, type Locale } from "./locales";
import { en } from "./dictionaries/en";
import { say, type ContentDictionary } from "./contentStore";

// Client Components can't read root params, so the locale and its dictionary
// are handed down once from the root layout and read from context. Only the
// active language's dictionary crosses the boundary, so adding languages
// never grows the client bundle.

type LocaleContextValue = {
  locale: Locale;
  dict: Dictionary;
  /**
   * The page-level UI strings, so a Client Component can translate the same
   * way a Server Component does. A few hundred short strings — small enough
   * to cross the boundary, unlike the catalogue store.
   */
  ui: ContentDictionary;
  /**
   * Whether the site has any collected reviews at all.
   *
   * Only ExperienceRatingLink reads it, and only to decide whether to render
   * at all. It lives here because that chip appears on every product card
   * and hero across the site, and threading a prop through all of them would
   * mean every card's caller had to know about reviews.
   */
  hasReviews: boolean;
};

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  dict: en,
  ui: {},
  hasReviews: false,
});

export function LocaleProvider({
  locale,
  dict,
  ui,
  hasReviews,
  children,
}: LocaleContextValue & { children: React.ReactNode }) {
  return (
    <LocaleContext.Provider value={{ locale, dict, ui, hasReviews }}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}

/**
 * The Client Component form of `tr()`.
 *
 *   const tr = useTr();
 *   <input placeholder={tr("Your name")} />
 *
 * Deliberately the same call shape as the server helper so the extractor
 * finds both with one pattern, and so moving a component across the
 * server/client boundary doesn't mean rewriting its strings.
 */
export function useTr(): (text: string) => string {
  const { ui } = useContext(LocaleContext);
  return (text: string) => say(ui, text);
}
