import { getLocale } from "./dictionary";
import { uiDictionary, uiSay } from "./ui";

/**
 * A user-facing string written in a Server Component.
 *
 *   <h2><T>What's Included</T></h2>
 *
 * The English stays in the source, where it is readable in review and in a
 * diff — there is no key indirection to look up, and no way for a key to
 * outlive the string it named. The pipeline picks the text up from here and
 * the store translates it; an edit to the English falls back to the new
 * English rather than showing a translation of the old wording.
 *
 * Children must be a single plain string so the extractor can find it. For a
 * prop — a placeholder, an aria-label — use `tr()` instead.
 */
export async function T({ children }: { children: string }) {
  return <>{await tr(children)}</>;
}

/** The same lookup, for props and anywhere JSX won't do. */
export async function tr(text: string): Promise<string> {
  const locale = await getLocale();
  return uiSay(await uiDictionary(locale), text);
}

/** Several at once, so a component with a dozen labels awaits once. */
export async function trAll<K extends string>(texts: readonly K[]): Promise<Record<K, string>> {
  const locale = await getLocale();
  const dict = await uiDictionary(locale);
  return Object.fromEntries(texts.map((t) => [t, uiSay(dict, t)])) as Record<K, string>;
}
