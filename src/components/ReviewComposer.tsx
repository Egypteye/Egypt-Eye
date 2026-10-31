"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTr } from "@/i18n/LocaleProvider";
import { DRAFT_STORAGE_KEY, GOOGLE_REVIEW_URL } from "@/content/googleReviews";

/**
 * Write your review here, then publish it on Google.
 *
 * =========================================================================
 * WHAT THIS IS, AND WHAT IT CANNOT BE
 * =========================================================================
 * It is a composer and a launchpad. It is NOT a submission form, and nothing
 * here sends a review anywhere — because nothing can.
 *
 * Google has no API, endpoint, OAuth flow or URL parameter that accepts a
 * review written somewhere else. The Business Profile API reads reviews and
 * posts owner replies; it cannot create one. The review link opens Google's
 * own form with an empty box, and there is no documented parameter that
 * fills it. Every third-party service that advertises "one form, posts to
 * Google" is doing exactly what this does: clipboard and a link.
 *
 * So the honest design is to say so. The button says "Copy and continue to
 * Google" rather than "Submit", and the page never claims the review is
 * published — only Google can know that, and it tells the traveller itself.
 *
 * =========================================================================
 * NO GATING. THIS IS THE RULE THAT MATTERS MOST
 * =========================================================================
 * Every rating continues to Google by the same path. One star and five stars
 * get the same button, the same text and the same destination.
 *
 * Routing unhappy customers to a private form while sending happy ones to
 * Google is "review gating", and Google prohibits it under its Fake
 * Engagement policy — enforcement ranges from stripping reviews to
 * restricting the whole profile. It is also the single easiest thing to
 * introduce here by accident, with one `rating >= 4` in a condition, and it
 * would look like a helpful feature in a diff. check-review-page.mts fails if
 * the star value is ever read anywhere but the display of the stars
 * themselves.
 *
 * =========================================================================
 * THE CLIPBOARD, AND WHY THERE IS ALWAYS A VISIBLE FALLBACK
 * =========================================================================
 * navigator.clipboard needs a secure context and a user gesture, and it still
 * fails or is refused in in-app browsers — which is where a lot of this
 * traffic lands, because the link arrives in WhatsApp. So the copy is
 * attempted, the outcome is shown honestly, and the text stays selectable on
 * screen either way: a traveller who sees "couldn't copy" can still select it
 * by hand. The flow never depends on the clipboard having worked.
 */

const STARS = [1, 2, 3, 4, 5] as const;

type CopyState = "idle" | "copied" | "failed";

export function ReviewComposer() {
  const tr = useTr();
  const uid = useId();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [copied, setCopied] = useState<CopyState>("idle");
  const textRef = useRef<HTMLTextAreaElement>(null);

  // ----------------------------------------------------------------------
  // The textarea is UNCONTROLLED, and that is the design rather than a
  // shortcut. Restoring a draft into React state on mount means calling
  // setState inside an effect, which React 19 rejects as a cascading render —
  // and the value is not needed in state by anything: the button label is
  // fixed, and the click handler reads the element. So the draft is restored
  // by writing to the DOM node, which is exactly what an effect is for.
  // ----------------------------------------------------------------------
  useEffect(() => {
    const el = textRef.current;
    if (!el || el.value) return;
    try {
      const saved = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) el.value = saved;
    } catch {
      // Private mode, blocked storage. The composer works without it.
    }
  }, []);

  async function copyAndContinue() {
    const trimmed = (textRef.current?.value ?? "").trim();
    let ok = false;
    try {
      if (trimmed && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(trimmed);
        ok = true;
      }
    } catch {
      ok = false;
    }
    setCopied(trimmed ? (ok ? "copied" : "failed") : "idle");

    // Opened after the copy attempt so the clipboard write still happens
    // inside the click's user gesture. A new tab, so the draft above survives
    // on the tab they came from.
    window.open(GOOGLE_REVIEW_URL, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="rounded-3xl border border-black/5 bg-cream p-6 shadow-sm sm:p-8">
      {/* Stars. Radio semantics so it is one control to a screen reader and
          arrow keys move between options, rather than five unrelated buttons. */}
      <fieldset className="border-0 p-0">
        {/* Not "How was your Egypt experience?" — the page's own h1 already
            asks that, and asking twice in two different sizes reads as a
            template that nobody proofread. */}
        <legend className="font-display text-lg text-ink">
          {tr("Your rating")}
        </legend>
        <div className="mt-3 flex items-center gap-1" onMouseLeave={() => setHovered(0)}>
          {STARS.map((value) => {
            const active = (hovered || rating) >= value;
            return (
              <label
                key={value}
                className="cursor-pointer p-1"
                onMouseEnter={() => setHovered(value)}
              >
                <input
                  type="radio"
                  name={`${uid}-rating`}
                  value={value}
                  checked={rating === value}
                  onChange={() => setRating(value)}
                  className="sr-only"
                />
                <span className="sr-only">
                  {tr("{n} stars").replace("{n}", String(value))}
                </span>
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden
                  className={`h-9 w-9 transition ${active ? "fill-gold" : "fill-black/15"}`}
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </label>
            );
          })}
        </div>
        {/* Deliberately the same sentence at every rating. See the header. */}
        <p className="mt-2 text-xs text-ink-soft">
          {tr("Whatever your rating, the next step is the same — your honest review goes to Google.")}
        </p>
      </fieldset>

      <div className="mt-6">
        <label htmlFor={`${uid}-text`} className="font-display text-lg text-ink">
          {tr("Tell other travellers about it")}
        </label>
        <p className="mt-1 text-xs text-ink-soft">
          {tr("In your own words. What you did, who guided you, what you would tell a friend.")}
        </p>
        <textarea
          id={`${uid}-text`}
          ref={textRef}
          defaultValue=""
          onChange={(e) => {
            setCopied("idle");
            // Saved as they type, so a tab that reloads on the way back from
            // Google — which is what an in-app browser often does — does not
            // cost them the review they just wrote.
            try {
              sessionStorage.setItem(DRAFT_STORAGE_KEY, e.target.value);
            } catch {
              // Nothing to do; the draft simply is not saved.
            }
          }}
          rows={7}
          maxLength={5000}
          placeholder={tr("We spent three days in Cairo and…")}
          className="mt-3 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm leading-relaxed text-ink outline-none transition focus:border-gold"
        />
      </div>

      {/* ------------------------------------------------------------------
          WHY THIS SITS ABOVE THE BUTTON AND NOT BELOW IT

          Google opens in a NEW TAB. The moment this button is pressed the
          traveller is looking at Google, not at this page, so anything
          written below the button is on a tab they have left — it may as
          well not exist. These steps have to be read before the tap, which
          is the only reason they are here rather than in the confirmation.

          Numbered because it is a real sequence in a form they are about to
          see, not decoration: paste, then photos, then post.

          Step 2 is the whole point of the list. Photos cannot be carried
          across — a browser will not let a script fill a file input, the
          clipboard holds text or one image but never both, and Google's
          photo control is a picker rather than a paste target. The
          traveller's pictures are already on their phone and Google's own
          photo button is right there, so the shortest path is to tell them
          to use it.
          ------------------------------------------------------------------ */}
      <div className="mt-6 rounded-2xl bg-sand-dim/60 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
          {tr("Next, on Google")}
        </p>
        <ol className="mt-2 space-y-1.5 text-sm leading-relaxed text-ink">
          <li>{tr("1. Paste your review")}</li>
          <li>{tr("2. Tap the photo icon and add a few pictures")}</li>
          <li>{tr("3. Press Post")}</li>
        </ol>
      </div>

      <button
        type="button"
        onClick={copyAndContinue}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-4 text-sm font-semibold text-cream transition hover:bg-ink/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        {tr("Copy my review and continue to Google")}
      </button>

      {/* Said before they leave, not after they come back: this page never
          learns whether the review was published, and must not imply it did. */}
      <p className="mt-3 text-center text-xs leading-relaxed text-ink-soft">
        {tr("Google opens in a new tab. Google publishes your review, under your own Google account.")}
      </p>

      {copied === "copied" && (
        <p className="mt-3 rounded-2xl bg-gold/10 px-4 py-3 text-center text-xs text-ink">
          {tr("Copied. Paste it into the review box on Google.")}
        </p>
      )}
      {copied === "failed" && (
        <p className="mt-3 rounded-2xl bg-gold/10 px-4 py-3 text-center text-xs text-ink">
          {tr("Your browser would not let us copy it. Select your review above and copy it by hand — it is still here.")}
        </p>
      )}
    </div>
  );
}
