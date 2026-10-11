"use client";

import { SmartImage } from "@/components/SmartImage";
import {
  OUTFIT_INCLUDED_NOTE,
  mensOutfits,
  womensDresses,
  type Outfit,
} from "@/lib/booking/outfits";
import type { ImageTone } from "@/content/types";

// Choosing an outfit inside the booking sheet, which is the only place a
// choice can actually be recorded against a booking.
//
// WHY IT IS A COUNTED PICKER AND NOT A DROPDOWN
//
// The experience is priced per person and includes an outfit for each, so a
// booking for three may dress three — and in a real group those three rarely
// want the same colour. A single "dress colour" select would force the common
// case (two friends, two colours) into a note field, where it stops being
// data and becomes something a human has to read and retype.
//
// So: choose up to your allowance, in any mix. The allowance is the headcount
// plus any extra dress bought, computed by outfitAllowance() — the same
// function the server runs. It is a CEILING, not a quota: a group of three
// with one man and no men's outfits loaded picks two dresses and books fine,
// and a booking with no outfit chosen at all is still a booking. Nothing here
// blocks checkout, because an outfit preference is not worth losing a sale
// over.
//
// Nothing here is trusted. The browser sends ids and quantities; the server
// re-resolves them against the product's own collection and re-applies the
// allowance. See lib/booking/outfits.ts.

export type OutfitQuantities = Record<string, number>;

export function OutfitPicker({
  outfits,
  allowance,
  value,
  onChange,
  tone = "giza",
}: {
  outfits: readonly Outfit[];
  allowance: number;
  value: OutfitQuantities;
  onChange: (next: OutfitQuantities) => void;
  tone?: ImageTone | string;
}) {
  const dresses = womensDresses(outfits);
  const mens = mensOutfits(outfits);
  if (dresses.length === 0 && mens.length === 0) return null;

  const chosen = Object.values(value).reduce((sum, n) => sum + (n > 0 ? n : 0), 0);
  const room = Math.max(0, allowance - chosen);

  const setQuantity = (id: string, quantity: number) => {
    const next = { ...value };
    if (quantity <= 0) delete next[id];
    else next[id] = quantity;
    onChange(next);
  };

  const toggle = (id: string) => {
    if ((value[id] ?? 0) > 0) setQuantity(id, 0);
    else if (room > 0) setQuantity(id, 1);
  };

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="sr-only">Choose your outfits</legend>

      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="text-sm font-semibold text-ink">What you&rsquo;ll wear</span>
        <span className="text-xs text-ink-soft" aria-live="polite">
          {chosen} of {allowance} chosen
          {chosen > 0 && (
            <>
              {" · "}
              <button
                type="button"
                onClick={() => onChange({})}
                className="underline underline-offset-2 hover:text-ink"
              >
                clear
              </button>
            </>
          )}
        </span>
      </div>

      <p className="text-xs leading-relaxed text-ink-soft">{OUTFIT_INCLUDED_NOTE}</p>

      {dresses.length > 0 && (
        <PickerGroup
          label="Flying dresses"
          outfits={dresses}
          value={value}
          room={room}
          tone={tone}
          allowance={allowance}
          onToggle={toggle}
          onQuantity={setQuantity}
        />
      )}

      {/* Hidden until the business loads real men's outfits in the CMS. */}
      {mens.length > 0 && (
        <PickerGroup
          label="Men&rsquo;s outfits"
          outfits={mens}
          value={value}
          room={room}
          tone={tone}
          allowance={allowance}
          onToggle={toggle}
          onQuantity={setQuantity}
        />
      )}

      {room === 0 && chosen > 0 && (
        <p className="text-xs text-ink-soft">
          That&rsquo;s one for each guest. Remove one to swap it for another colour.
        </p>
      )}
    </fieldset>
  );
}

function PickerGroup({
  label,
  outfits,
  value,
  room,
  tone,
  allowance,
  onToggle,
  onQuantity,
}: {
  label: string;
  outfits: readonly Outfit[];
  value: OutfitQuantities;
  room: number;
  tone: ImageTone | string;
  allowance: number;
  onToggle: (id: string) => void;
  onQuantity: (id: string, quantity: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">{label}</p>
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {outfits.map((outfit) => {
          const quantity = value[outfit.id] ?? 0;
          const selected = quantity > 0;
          const full = !selected && room === 0;
          return (
            <li key={outfit.id}>
              <button
                type="button"
                onClick={() => onToggle(outfit.id)}
                disabled={full}
                // aria-pressed rather than a checkbox role: these are toggle
                // buttons and a screen reader should say "Cherry, pressed".
                aria-pressed={selected}
                aria-label={`${outfit.name}${outfit.image ? "" : " (photo coming soon)"}`}
                title={outfit.note ?? outfit.name}
                className={`group relative block w-full overflow-hidden rounded-lg border text-left transition ${
                  selected
                    ? "border-gold ring-2 ring-gold"
                    : full
                      ? "cursor-not-allowed border-black/5 opacity-40"
                      : "border-black/10 hover:border-gold/50"
                }`}
              >
                {outfit.image ? (
                  <div className="aspect-[3/4]">
                    <SmartImage
                      image={outfit.image}
                      tone={tone}
                      alt=""
                      className="h-full w-full object-cover"
                      sizes="(max-width: 640px) 33vw, 120px"
                    />
                  </div>
                ) : (
                  <div
                    className="aspect-[3/4]"
                    style={{ backgroundColor: outfit.hex ?? "#e9e4da" }}
                    aria-hidden="true"
                  />
                )}

                {/* A tick, not just a ring. Colour alone is not a state a
                    colour-blind customer can read, and on a dark dress the
                    ring is the only other signal. */}
                {selected && (
                  <span
                    aria-hidden="true"
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[11px] font-bold text-ink shadow"
                  >
                    ✓
                  </span>
                )}

                <span className="block truncate bg-cream px-1.5 py-1 text-center text-[11px] font-medium text-ink">
                  {outfit.name}
                </span>
              </button>

              {/* Quantity only appears where more than one is possible, and
                  only on something already chosen — a stepper under every
                  swatch on a solo booking is noise. */}
              {selected && allowance > 1 && (
                <div className="mt-1 flex items-center justify-center gap-1">
                  <button
                    type="button"
                    onClick={() => onQuantity(outfit.id, quantity - 1)}
                    aria-label={`One fewer ${outfit.name}`}
                    className={stepper}
                  >
                    −
                  </button>
                  <span className="min-w-5 text-center text-xs font-semibold text-ink" aria-live="polite">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => onQuantity(outfit.id, quantity + 1)}
                    disabled={room === 0}
                    aria-label={`One more ${outfit.name}`}
                    className={`${stepper} disabled:opacity-30`}
                  >
                    +
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const stepper =
  "flex h-6 w-6 items-center justify-center rounded-full border border-black/10 text-sm leading-none text-ink transition hover:border-gold/50";
