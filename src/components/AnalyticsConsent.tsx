"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { useTr } from "@/i18n/LocaleProvider";
import { CONSENT_STORAGE_KEY, type ConsentChoice } from "@/content/analytics";

/**
 * The cookie notice. Shown once, until a choice is made.
 *
 * =========================================================================
 * WHY IT EXISTS AT ALL
 * =========================================================================
 * GA4 writes the `_ga` cookie. That is not a cookie the site needs in order
 * to work, so under ePrivacy/GDPR a visitor in the EU or UK has to agree
 * before it is set — and Egypt Eye sells into Europe. The privacy policy also
 * promised, in writing and before any of this existed: "If we ever add
 * something that needs your consent, we will ask for it, and this page will
 * say so before it happens."
 *
 * =========================================================================
 * ACCEPT AND DECLINE ARE THE SAME SIZE
 * =========================================================================
 * Deliberate, and the one thing here most likely to be "improved" later. A
 * banner where refusing is harder than accepting — greyed out, buried in a
 * second screen, styled as a link beside a filled button — is dark-pattern
 * consent, and regulators across the EU have treated it as no consent at all,
 * which would make the data unusable rather than merely rude. So the two
 * controls match, and check-analytics.mts fails if they stop matching.
 *
 * =========================================================================
 * WHY useSyncExternalStore AND NOT AN EFFECT
 * =========================================================================
 * The answer lives in localStorage, which does not exist on the server, so
 * the banner must not render until the stored answer has been read and found
 * missing — otherwise every returning visitor who already answered sees it
 * flash. The obvious way to do that is read it in an effect and setState,
 * and React 19 rejects that as a cascading render.
 *
 * localStorage is precisely what useSyncExternalStore is for: a server
 * snapshot of "never show", a client snapshot read from storage, and an
 * emit after a choice so the banner closes. The snapshot is a boolean, so it
 * compares by value and cannot loop.
 *
 * `memoryChoice` covers blocked storage. Without it a browser that refuses
 * localStorage would re-read "unanswered" after every choice and the banner
 * would never close — a private-window visitor would be stuck with it.
 */
/** Set when storage is unavailable, so a choice still sticks for the visit. */
let memoryChoice: ConsentChoice | null = null;

const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

function shouldAsk(): boolean {
  if (memoryChoice) return false;
  try {
    const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return stored !== "granted" && stored !== "denied";
  } catch {
    // Storage blocked. Asking is the conservative outcome; nothing is stored
    // either way, and memoryChoice above closes the banner once answered.
    return true;
  }
}

export function AnalyticsConsent() {
  const tr = useTr();
  const visible = useSyncExternalStore(subscribe, shouldAsk, () => false);

  function choose(choice: ConsentChoice) {
    memoryChoice = choice;
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
    } catch {
      // The choice still applies to this visit via memoryChoice.
    }
    // Consent Mode v2: this is what actually permits or withholds the cookie.
    // Sent for "denied" too, so the tag is told explicitly rather than left
    // waiting on wait_for_update.
    window.gtag?.("consent", "update", {
      analytics_storage: choice === "granted" ? "granted" : "denied",
    });

    // NO page_view IS SENT HERE, and that is deliberate — an earlier version
    // did, and a browser test caught it double-counting.
    //
    // The reasoning that looked right: "the pageview was withheld while
    // storage was denied, so send it now." It was not withheld. Under Consent
    // Mode a denied visitor still reaches Google, as a cookieless ping, so
    // the page_view for this page has already been sent. Sending another on
    // accept records the same page twice — which is the duplicate-pageview
    // problem this implementation exists to avoid, reintroduced at the one
    // moment nobody would look for it.
    //
    // Nothing is lost by staying quiet: the session simply begins cookieless
    // and becomes identified from the next navigation on.
    for (const listener of listeners) listener();
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={tr("Cookies")}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-cream/95 px-4 py-4 backdrop-blur-sm sm:px-6"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-ink-soft">
          {tr(
            "We would like to use Google Analytics to see which pages travellers find useful. It sets a cookie. Nothing is stored unless you agree, and the site works either way."
          )}{" "}
          <Link
            href="/privacy"
            className="underline decoration-gold underline-offset-4 transition hover:text-ink"
          >
            {tr("Privacy policy")}
          </Link>
        </p>
        {/* Equal weight, equal size. See the header. */}
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => choose("denied")}
            className="min-h-[44px] flex-1 rounded-full border border-ink/20 px-5 py-2 text-sm font-semibold text-ink transition hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:flex-none"
          >
            {tr("No thanks")}
          </button>
          <button
            type="button"
            onClick={() => choose("granted")}
            className="min-h-[44px] flex-1 rounded-full border border-ink/20 bg-ink px-5 py-2 text-sm font-semibold text-cream transition hover:bg-ink/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:flex-none"
          >
            {tr("Allow")}
          </button>
        </div>
      </div>
    </div>
  );
}
