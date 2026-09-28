// What every departure server action answers with.
//
// In its own module rather than in actions.ts because that file is marked
// "use server", where every export has to be an async server function. A type
// is erased before it gets that far, but keeping it out avoids relying on that
// and makes the constraint obvious to the next person adding an export.
export type ActionResult = { ok: true } | { ok: false; error: string };
