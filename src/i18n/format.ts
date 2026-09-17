// Kept apart from dictionary.ts so Client Components can use it: that module
// imports next/root-params, which Next refuses to bundle into the client
// graph — even for a pure helper sitting next to it.

/** Fills {placeholders} in a dictionary string. */
export function t(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in values ? String(values[key]) : match
  );
}
