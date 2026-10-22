"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { DIAL_CODES, flagFor } from "@/lib/booking/countryCodes";
import { composePhone, splitPhone } from "@/lib/booking/phone";

/**
 * A phone number, entered as a country chosen from a list plus the rest typed.
 *
 * =========================================================================
 * WHY THE CODE IS A DROPDOWN AND NOT TYPED
 * =========================================================================
 * Asked for directly, and the enquiries show why. They were arriving as
 * "01285343630" — a number that can be dialled from inside Egypt and nowhere
 * else, and that WhatsApp cannot resolve at all, because WhatsApp identifies
 * an account by its full international number. The desk could read those
 * enquiries and not ring them back.
 *
 * A free-text field with a "please include your country code" hint was the
 * first attempt. It is better than nothing, but a hint is advice and a
 * dropdown is a fact: a person cannot submit a number without having said
 * which country it belongs to.
 *
 * =========================================================================
 * IT OWNS NO RULES OF ITS OWN
 * =========================================================================
 * Every judgement about what a usable number is — the trunk zero coming off,
 * the minimum digits, the E.164 ceiling, the wording of each complaint —
 * belongs to src/lib/booking/phone.ts, which the booking popup has used since
 * before this component existed. This is the control; that is the authority.
 *
 * I wrote a second composePhone beside the country list before noticing, with
 * looser rules and no messages. Two functions of the same name in one folder,
 * disagreeing about what a valid number is, is the bug this comment exists to
 * stop somebody re-introducing. There is one.
 *
 * =========================================================================
 * ONE STRING OUT, SO NOTHING DOWNSTREAM CHANGES
 * =========================================================================
 * Every form on this site already keeps the phone as a single string and posts
 * it as one field; the booking flow writes it to a reservation, the enquiry
 * puts it in an email. This keeps that contract exactly: it owns two inputs
 * and emits one E.164 value like "+201285343630". No API route, email
 * template or database column had to learn about a second field.
 */
export function PhoneField({
  id,
  value = "",
  onChange,
  required = false,
  name = "phone",
  autoComplete = "tel",
  selectClassName,
  inputClassName,
  wrapperClassName,
  placeholder = "100 123 4567",
  inputLabel,
  errorClassName,
  showInlineError = true,
  describedBy,
  invalid = false,
  disabled = false,
}: {
  id: string;
  /**
   * The composed number, when the parent owns it. Omit this and onChange on a
   * form that submits natively: the hidden input below carries the value.
   */
  value?: string;
  /**
   * The composed E.164 number, and the authority's complaint when there isn't
   * one. BOTH, because a controlled form needs to tell "left blank" apart
   * from "typed something unusable" and the value alone cannot: an entry the
   * authority rejects composes to the empty string, which on an optional
   * field would otherwise read as "no number given" and submit quietly while
   * the person watching is certain they entered one.
   */
  onChange?: (next: string, problem: string | null) => void;
  required?: boolean;
  name?: string;
  autoComplete?: string;
  /** Both brands style their own controls; nothing here assumes a class. */
  selectClassName?: string;
  inputClassName?: string;
  wrapperClassName?: string;
  placeholder?: string;
  /**
   * An accessible name for the number box, for the forms that wrap the whole
   * field in a bare <label> with no htmlFor. Such a label attaches to its
   * first labelable descendant, which here is the country select — and the
   * select already names itself — so the number box is left with no name at
   * all unless one is passed. Forms that give the number box its own
   * <label htmlFor> should leave this unset rather than override it.
   */
  inputLabel?: string;
  /**
   * The brand's own class for an error line. Without one the complaint is set
   * in body colour and reads as a caption rather than a problem, which is
   * most of the point of showing it.
   */
  errorClassName?: string;
  /**
   * False where the parent already renders the complaint itself. The Flying
   * Dresses enquiry form puts every field's error in its own Field wrapper,
   * and this printing a second copy underneath said the same sentence twice.
   */
  showInlineError?: boolean;
  describedBy?: string;
  invalid?: boolean;
  disabled?: boolean;
}) {
  const labelId = useId();
  const errorId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  // The split value is the INITIAL state only. After that the two controls are
  // the source of truth, because re-splitting on every keystroke would fight
  // the person typing: a half-finished number can match a shorter dial code
  // and jump the dropdown to another country mid-word.
  const initial = useMemo(() => splitPhone(value), [value]);
  const [iso, setIso] = useState(initial.iso);
  const [national, setNational] = useState(initial.national);
  const [touched, setTouched] = useState(false);

  // An empty optional field is not a failure, it is a field left blank, so it
  // composes to nothing and complains about nothing. Everything else goes to
  // the authority and takes its answer, message and all.
  const blank = national.trim() === "";
  const result = blank ? null : composePhone(iso, national);
  const composed = result?.ok ? result.e164 : "";
  const problem = blank
    ? required
      ? "Please enter your phone number."
      : null
    : result && !result.ok
      ? result.message
      : null;

  // NATIVE VALIDATION, so a form that posts itself cannot post a broken
  // number. Half this site's forms have no React state and no submit handler
  // worth the name — they build a FormData and send it. Marking the visible
  // input invalid makes the browser refuse the submit and say why, which is
  // the same protection the controlled forms get from their own validators,
  // for no per-form code.
  useEffect(() => {
    inputRef.current?.setCustomValidity(problem ?? "");
  }, [problem]);

  const push = (nextIso: string, nextNational: string) => {
    setIso(nextIso);
    setNational(nextNational);
    const empty = nextNational.trim() === "";
    const next = empty ? null : composePhone(nextIso, nextNational);
    onChange?.(
      next?.ok ? next.e164 : "",
      empty
        ? required
          ? "Please enter your phone number."
          : null
        : next && !next.ok
          ? next.message
          : null
    );
  };

  const showProblem = showInlineError && touched && problem !== null;

  return (
    <div className={wrapperClassName}>
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "stretch" }}>
        <span id={labelId} hidden>
          Country calling code
        </span>
        <select
          id={`${id}-code`}
          name={`${name}CountryCode`}
          className={selectClassName}
          aria-labelledby={labelId}
          value={iso}
          disabled={disabled}
          onChange={(e) => push(e.target.value, national)}
          style={{
            // THE DIAL CODE IS FIRST IN THE OPTION TEXT, AND THAT IS THE
            // POINT. A select shows the selected option's own text and
            // nothing shorter, so with 204 countries in the list something
            // has to be cut: "+20 · Egyp…" loses the end of a country name
            // the person has already chosen, while "🇪🇬 Egypt, +2…" would lose
            // the one piece of information the field exists to capture.
            // Wide enough here for the code plus a short name; long names
            // still truncate, and truncate in the right place.
            flex: "0 0 9.5rem",
            minWidth: 0,
            // A NATIVE SELECT NEXT TO A STYLED INPUT LOOKS LIKE A MISTAKE.
            // Both brands pass their own class, which sets the border, the
            // background and the type — but a select ignores none of that and
            // still paints the operating system's own well and arrow on top,
            // so the pair rendered as one custom box beside one grey system
            // box. Resetting the appearance hands the class back control, and
            // the chevron is drawn here because removing the appearance also
            // removes the only hint that this opens.
            appearance: "none",
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%23767676' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E\")",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 0.7rem center",
            backgroundSize: "0.6rem",
            // Room for the chevron, so a long dial code cannot sit under it.
            paddingRight: "1.9rem",
          }}
        >
          {/* The SAME list the booking popup uses — src/lib/booking/countryCodes
              already held 105 countries, Egypt first, with the reasoning for
              that order written beside it. A second list here would have been a
              second answer to drift from the first. */}
          {/* UNCHOSEN UNTIL CHOSEN. A pre-selected Egypt would be an
              assumption about a number nobody has described yet, and the
              assumption is exactly the bug: somebody typing a British mobile
              into a box already reading "+20" sends us +20 7911 123456. The
              Customize form reached the same conclusion before this one did.
              composePhone already has the wording for an empty code. */}
          <option value="" disabled>
            Code
          </option>
          {DIAL_CODES.map((c) => (
            <option key={c.iso} value={c.iso}>
              {flagFor(c.iso)} {c.dial} · {c.name}
            </option>
          ))}
        </select>
        {/* WHAT A NATIVE FORM ACTUALLY POSTS.
            If the visible box kept `name="phone"` an uncontrolled form would
            post "1285343630" with the country thrown away, which is the bug
            this component exists to kill. The name lives here, on the composed
            value, and the visible box is nameless. Controlled parents are
            unaffected: they still get onChange. */}
        <input type="hidden" name={name} value={composed} />
        <input
          ref={inputRef}
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete={autoComplete}
          className={inputClassName}
          placeholder={placeholder}
          value={national}
          required={required}
          disabled={disabled}
          aria-label={inputLabel}
          aria-invalid={invalid || showProblem ? true : undefined}
          aria-describedby={showProblem ? errorId : describedBy}
          onChange={(e) => push(iso, e.target.value)}
          onBlur={() => setTouched(true)}
          style={{ flex: "1 1 auto", minWidth: 0 }}
        />
      </div>
      {showProblem && (
        <p
          id={errorId}
          role="alert"
          className={errorClassName}
          style={{ marginTop: "0.4rem", fontSize: "0.85rem" }}
        >
          {problem}
        </p>
      )}
    </div>
  );
}
