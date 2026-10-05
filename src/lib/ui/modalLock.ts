// Whether a modal currently owns the screen.
//
// This exists because of two bugs found by driving the booking popup in a real
// browser rather than by reading the markup, and neither would have been
// visible any other way.
//
// The first: the floating WhatsApp bubble is `fixed bottom-6 right-6 z-50`,
// the booking dialog was also z-50, and the bubble comes later in the DOM — so
// on a phone the green circle sat directly on top of the dialog's primary
// button. Playwright refused to click it, reporting that the WhatsApp link
// "intercepts pointer events", which is exactly what a thumb would have found.
//
// The second, and worse: the newsletter popup opens nine seconds after the
// page loads, on a timer that fires once. Nine seconds is well inside the time
// it takes to fill in a date, a phone number and a few extras, so it would
// appear over a half-finished booking — and dismissing it is the kind of
// interruption that loses the booking entirely.
//
// A z-index alone fixes neither properly. Stacking the newsletter behind the
// dialog would leave it waiting there, revealed the moment the customer
// finishes. So the rule is explicit instead: while a modal is open, nothing
// else may open over it, and the floating buttons get out of the way.

const ATTR = "data-modal-open";

let depth = 0;
const listeners = new Set<(locked: boolean) => void>();

function publish() {
  const locked = depth > 0;
  if (typeof document !== "undefined") {
    // Reflected onto the body as well as held in the counter, so the state is
    // visible in devtools and usable from CSS if it is ever needed there.
    if (locked) document.body.setAttribute(ATTR, "true");
    else document.body.removeAttribute(ATTR);
  }
  for (const listener of listeners) listener(locked);
}

/**
 * Claims the screen for a modal. Returns the release function.
 *
 * Counted rather than boolean: two modals closing out of order would
 * otherwise leave the lock stuck on or released early, and a stuck lock means
 * the newsletter never appears again for that visitor.
 */
export function lockModals(): () => void {
  depth += 1;
  publish();
  let released = false;
  return () => {
    if (released) return;
    released = true;
    depth = Math.max(0, depth - 1);
    publish();
  };
}

export function modalsLocked(): boolean {
  return depth > 0;
}

/** Subscribes to the lock. Calls back immediately with the current state. */
export function onModalLockChange(listener: (locked: boolean) => void): () => void {
  listeners.add(listener);
  listener(depth > 0);
  return () => {
    listeners.delete(listener);
  };
}
