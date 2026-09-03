// Shared shapes for server actions. Kept out of the "use server" files
// because those may only export async functions.

export type ActionResult<T = void> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; error: string; detail?: string; blockers?: { label: string; detail: string }[] };

export function ok<T>(data?: T, message?: string): ActionResult<T> {
  return { ok: true, data, message };
}

export function fail(error: string, detail?: string, blockers?: { label: string; detail: string }[]): ActionResult<never> {
  return { ok: false, error, detail, blockers };
}
