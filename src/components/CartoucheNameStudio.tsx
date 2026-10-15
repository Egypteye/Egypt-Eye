"use client";

import { useId, useMemo, useState } from "react";
import { CARTOUCHE_VIEWBOX, LOOP, TIE_Y, signFontSize, signPositions } from "@/lib/hieroglyphs/cartoucheLayout";
import { CartoucheOrderPanel, type OrderableChoice } from "@/components/CartoucheOrderPanel";
import {
  CARTOUCHE_CAPACITY,
  spellName,
  type SpelledLetter,
} from "@/lib/hieroglyphs/signs";

// "See your name in hieroglyphs" — the panel on /boutique/cartouches.
//
// It is an explorer, not a second order form. The category already has a
// required "Name to be written" field in the enquiry, so this fills THAT
// rather than collecting the name twice: type here, press the button, and the
// name lands in the form below with the spelling attached for the workshop.
//
// Everything it shows comes from one call to spellName(), so the preview, the
// counter, the per-sign cards and the line sent to the desk cannot disagree
// with each other.

const FIELD_ID = "treasure-cartoucheName";

export function CartoucheNameStudio({
  capacity = CARTOUCHE_CAPACITY,
  // Only pieces that have a real price in the CMS reach here. The server
  // decides that, not this component — see isInstantlyOrderable. When the
  // list is empty, which it is in production today because every cartouche is
  // "on request", there is no buy button and the enquiry is the way through.
  orderable = [],
}: {
  capacity?: number;
  orderable?: OrderableChoice[];
}) {
  const [name, setName] = useState("");
  const [applied, setApplied] = useState(false);
  const inputId = useId();

  const spelling = useMemo(() => spellName(name, capacity), [name, capacity]);
  const { signCount, unsupported, hasContent } = spelling;
  const over = hasContent && signCount > capacity;

  // Writes into the enquiry form's existing field rather than adding a second
  // one. React tracks an input's value on the DOM node, so setting .value
  // directly is ignored on re-render — going through the native setter and
  // dispatching an input event is what makes a controlled OR uncontrolled
  // field actually take it.
  const useInEnquiry = () => {
    const field = document.getElementById(FIELD_ID) as HTMLInputElement | null;
    if (!field) return;
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
    setter?.call(field, name.trim());
    field.dispatchEvent(new Event("input", { bubbles: true }));
    field.scrollIntoView({ behavior: "smooth", block: "center" });
    field.focus({ preventScroll: true });
    setApplied(true);
  };

  return (
    <section
      aria-labelledby="cartouche-studio"
      className="overflow-hidden rounded-3xl border border-black/5 bg-cream shadow-sm"
    >
      <div className="border-b border-black/5 bg-sand-dim px-6 py-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-dark">Try it now</p>
        <h2 id="cartouche-studio" className="mt-1 font-display text-2xl font-semibold text-ink">
          See your name in hieroglyphs
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
          Hieroglyphs follow sound rather than spelling, the same way Egyptian scribes wrote foreign
          names like Ptolemy and Cleopatra. Type a name to see which signs it uses, what each one is
          a picture of, and how our workshop in Luxor reads it.
        </p>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        {/* ---------------------------------------------------------------- */}
        {/* Input + the cartouche itself                                     */}
        {/* ---------------------------------------------------------------- */}
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor={inputId} className="text-sm font-semibold text-ink">
              Your name
            </label>
            <input
              id={inputId}
              type="text"
              inputMode="text"
              autoComplete="off"
              spellCheck={false}
              maxLength={40}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setApplied(false);
              }}
              placeholder="Omar"
              className="mt-2 w-full rounded-full border border-black/10 bg-sand px-5 py-3 font-display text-lg text-ink outline-none transition placeholder:text-ink-soft/40 focus:border-gold focus:ring-2 focus:ring-gold/30"
            />
          </div>

          <Cartouche spelling={spelling} over={over} />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p
              className={`text-sm font-semibold ${over ? "text-terracotta" : "text-ink"}`}
              aria-live="polite"
            >
              {hasContent ? `${signCount} of ${capacity} signs` : `Up to ${capacity} signs`}
            </p>
            {hasContent && (
              <button
                type="button"
                onClick={() => {
                  setName("");
                  setApplied(false);
                }}
                className="text-sm text-ink-soft underline underline-offset-2 transition hover:text-ink"
              >
                Clear
              </button>
            )}
          </div>

          {/* Honest messages. Nothing is hidden and nothing is dropped. */}
          {over && (
            <p className="rounded-xl bg-terracotta/10 px-4 py-3 text-sm leading-relaxed text-ink">
              <strong>{spelling.signCount} signs is more than one cartouche holds.</strong> A shorter
              form of the name usually fits — or ask us about a larger piece when you enquire, and we
              will tell you what is possible.
            </p>
          )}
          {unsupported.length > 0 && (
            <p className="rounded-xl bg-sand-deep/60 px-4 py-3 text-sm leading-relaxed text-ink">
              These characters have no hieroglyphic sign and are not shown:{" "}
              <strong>{unsupported.join(" ")}</strong>. Writing the name the way it sounds in English
              usually works — tell us in the enquiry and we will help.
            </p>
          )}

          {hasContent && (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={useInEnquiry}
                className={
                  orderable.length > 0
                    ? "rounded-full border border-gold/50 px-6 py-3 text-sm font-semibold text-ink transition hover:bg-gold/10"
                    : "rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink shadow-md shadow-gold/25 transition hover:bg-gold-light"
                }
              >
                {orderable.length > 0 ? "Ask about customisation" : "Use this name in my enquiry"}
              </button>
              {applied && (
                <p className="text-xs text-ink-soft" aria-live="polite">
                  Added to the form below. You can still change it there.
                </p>
              )}
              <p className="text-xs leading-relaxed text-ink-soft/85">
                A preview, not a proof. The workshop sets the final layout, and we confirm the
                spelling with you before anything is engraved.
              </p>
            </div>
          )}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* What each sign is                                                */}
        {/* ---------------------------------------------------------------- */}
        <div>
          {!hasContent ? (
            <p className="rounded-2xl border border-dashed border-black/10 px-5 py-8 text-center text-sm text-ink-soft">
              Type a name and each sign will be explained here.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {spelling.letters.map((entry, i) => (
                <LetterRow key={`${entry.input}-${i}`} entry={entry} />
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Buying it outright. Renders only for a piece with a real price; the
          enquiry above is always available either way. */}
      {orderable.length > 0 && (
        <div className="border-t border-black/5 bg-sand/40 p-6">
          <CartoucheOrderPanel
            choices={orderable}
            spelling={spelling}
            engravedName={name.trim()}
            onAskInstead={useInEnquiry}
          />
        </div>
      )}
    </section>
  );
}

/**
 * The cartouche itself — upright, as the workshop makes it.
 *
 * Drawn as SVG rather than a CSS pill so the proportions and the knot at the
 * foot are exact rather than approximated. A cartouche is a loop of rope laid
 * around a name with the ends tied off at the bottom; the tie is the detail
 * that makes it read as a piece of jewellery instead of a rounded rectangle,
 * and it is the first thing lost when this is built out of border-radius.
 *
 * Signs stack top to bottom, which is how a vertical cartouche is actually
 * read, and the type size is computed from how many there are so a one-sign
 * name and a four-sign name both sit comfortably inside the same shape.
 */

function Cartouche({ spelling, over }: { spelling: ReturnType<typeof spellName>; over: boolean }) {
  const signs = spelling.signs;
  const size = signFontSize(signs.length);
  const centres = signPositions(signs.length);

  return (
    <div className="flex items-center justify-center rounded-2xl bg-gradient-to-b from-sand-deep to-sand-dim px-4 py-6">
      <svg
        viewBox={`0 0 ${CARTOUCHE_VIEWBOX.w} ${CARTOUCHE_VIEWBOX.h}`}
        className="h-[clamp(15rem,42vw,20rem)] w-auto"
        role="img"
        aria-label={
          signs.length
            ? `Your name written with ${signs.length} hieroglyphic signs, inside a cartouche`
            : "An empty cartouche"
        }
      >
        {/* The rope loop. */}
        <rect
          x={LOOP.x}
          y={LOOP.y}
          width={LOOP.w}
          height={LOOP.h}
          rx={LOOP.r}
          fill="var(--color-cream)"
          stroke={over ? "var(--color-terracotta)" : "var(--color-gold-dark)"}
          strokeWidth={3}
        />
        {/* The ends of the rope, tied off below the loop. */}
        <line
          x1={18}
          y1={TIE_Y}
          x2={102}
          y2={TIE_Y}
          stroke={over ? "var(--color-terracotta)" : "var(--color-gold-dark)"}
          strokeWidth={3}
          strokeLinecap="round"
        />
        <g stroke={over ? "var(--color-terracotta)" : "var(--color-gold-dark)"} strokeWidth={2}>
          <rect
            x={52}
            y={TIE_Y - 9}
            width={16}
            height={18}
            fill="var(--color-cream)"
            strokeWidth={2.5}
          />
          {/* The binding across the knot. */}
          {[56, 60, 64].map((x) => (
            <line key={x} x1={x} y1={TIE_Y - 7} x2={x} y2={TIE_Y + 7} strokeWidth={1.4} />
          ))}
        </g>

        {signs.length === 0 ? (
          <text
            x={CARTOUCHE_VIEWBOX.w / 2}
            y={CARTOUCHE_VIEWBOX.h / 2}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-ink-soft/25 font-display"
            fontSize={26}
          >
            — —
          </text>
        ) : (
          signs.map((sign, i) => (
            <text
              key={`${sign.gardiner}-${i}`}
              x={CARTOUCHE_VIEWBOX.w / 2}
              y={centres[i]}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={size}
              className="font-hieroglyph fill-ink"
            >
              {sign.glyph}
            </text>
          ))
        )}
      </svg>
    </div>
  );
}

function LetterRow({ entry }: { entry: SpelledLetter }) {
  if (!entry.mapping) {
    return (
      <li className="flex items-center gap-3 rounded-xl border border-dashed border-black/10 px-3 py-2.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sand-deep/50 font-display text-lg text-ink-soft">
          {entry.input}
        </span>
        <p className="text-sm text-ink-soft">No hieroglyphic sign for this character.</p>
      </li>
    );
  }

  const { letter, signs, caveat, meaning } = entry.mapping;
  return (
    <li className="flex gap-3 rounded-xl border border-black/5 bg-sand px-3 py-2.5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/15 font-display text-lg font-semibold text-ink">
        {letter}
      </span>
      <span
        aria-hidden
        className="font-hieroglyph flex h-10 min-w-10 shrink-0 items-center justify-center rounded-lg bg-cream px-1.5 text-[26px] leading-none text-ink"
      >
        {signs.map((s) => s.glyph).join("")}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-ink-soft">
          read as <strong className="text-sm text-ink">{signs.map((s) => s.sound).join(" + ")}</strong>
        </p>
        <p className="mt-1 text-xs leading-relaxed text-ink-soft">
          {signs.map((s) => `A picture of ${s.depicts}. ${s.note}`).join(" ")}
        </p>
        {meaning && (
          // The workshop's own reading, off their card. Not Egyptology, not a
          // translation, and labelled so nobody mistakes it for either.
          <p className="mt-1.5 text-[11px] leading-relaxed text-ink-soft">
            <span className="font-semibold text-gold-dark">The workshop reads this as:</span>{" "}
            <span className="italic">{meaning}</span>
          </p>
        )}
        {caveat && (
          <p className="mt-1.5 rounded-lg bg-sand-deep/50 px-2.5 py-1.5 text-[11px] leading-relaxed text-ink-soft">
            {caveat}
          </p>
        )}
      </div>
    </li>
  );
}
