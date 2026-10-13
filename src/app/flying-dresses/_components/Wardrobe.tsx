"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { Outfit } from "@/lib/booking/outfits";
import { fdPath } from "../_lib/seo";

/**
 * The wardrobe: browse the collection, filter it, open a garment large, and
 * carry a choice into the enquiry.
 *
 * -------------------------------------------------------------------------
 * WHAT IT WILL NOT DO
 * -------------------------------------------------------------------------
 * It does not show a price, it does not say "available", and it does not hold
 * anything. Outfits carry no price field at all (lib/booking/outfits.ts), and
 * nothing in this codebase tracks dress stock — so a chosen dress is a
 * PREFERENCE that travels into the first message, and the copy says exactly
 * that rather than implying a reservation. Promising a specific garment on a
 * date three weeks out and failing on the day is worse than being plain now.
 *
 * -------------------------------------------------------------------------
 * HOW A CHOICE TRAVELS
 * -------------------------------------------------------------------------
 * Through the URL: "Enquire about this one" is a real <Link> to
 * /enquire?dress=<id>. Not component state, not a context, not localStorage.
 * That means the choice survives a reload, can be shared or bookmarked, works
 * with the browser's back button, and — because it is an anchor — works
 * before this component has hydrated at all.
 *
 * -------------------------------------------------------------------------
 * THE LIGHTBOX
 * -------------------------------------------------------------------------
 * A native <dialog> opened with showModal(), which gives focus trapping,
 * Escape-to-close, inert background content and the ::backdrop for free.
 * Arrow keys move between garments. The one thing native dialog does not do
 * is restore focus reliably across browsers, so that is done by hand.
 */

/**
 * A presentational grouping of the twelve colours into five families.
 *
 * This is a UI convenience for finding a dress, not a claim about the
 * garments: nobody at the business calls Ginger a "warm" dress. Ids are listed
 * explicitly rather than derived from the hex values, because a hue
 * calculation would quietly re-sort the filter the next time a swatch is
 * nudged, and because BronZey and Golden belong in different families to the
 * eye while sitting close together in hue.
 */
const COLOUR_FAMILIES: { id: string; label: string; ids: string[] }[] = [
  { id: "warm", label: "Red & warm", ids: ["cherry", "ginger", "bronzey"] },
  { id: "green", label: "Green", ids: ["emerald", "verdant"] },
  { id: "blue", label: "Blue & aqua", ids: ["navy", "aqua"] },
  { id: "violet", label: "Violet", ids: ["lavender", "orchid"] },
  { id: "neutral", label: "Black, white & gold", ids: ["black", "snowy", "golden"] },
];

type Filter = "all" | "dresses" | "mens" | string;

export function Wardrobe({
  dresses,
  mensOutfits,
  /** Shown above the grid. Lets one component serve the full wardrobe page
      and the narrower men's-wear section. */
  showFilters = true,
  initialFilter = "all",
}: {
  dresses: Outfit[];
  mensOutfits: Outfit[];
  showFilters?: boolean;
  initialFilter?: Filter;
}) {
  const [filter, setFilter] = useState<Filter>(initialFilter);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  const all = useMemo(() => [...dresses, ...mensOutfits], [dresses, mensOutfits]);

  const shown = useMemo(() => {
    if (filter === "all") return all;
    if (filter === "dresses") return dresses;
    if (filter === "mens") return mensOutfits;
    const family = COLOUR_FAMILIES.find((f) => f.id === filter);
    if (!family) return all;
    return dresses.filter((d) => family.ids.includes(d.id));
  }, [filter, all, dresses, mensOutfits]);

  // Opening and closing the native dialog. Kept in an effect so the dialog's
  // real open state always follows `openIndex` rather than drifting from it.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (openIndex !== null && !dialog.open) {
      dialog.showModal();
    } else if (openIndex === null && dialog.open) {
      dialog.close();
    }
  }, [openIndex]);

  const close = useCallback(() => {
    setOpenIndex(null);
    // Native dialog returns focus to the document body in some browsers, which
    // drops a keyboard visitor back at the top of the page. Put it back on the
    // tile they opened.
    const target = returnFocusRef.current;
    if (target) {
      requestAnimationFrame(() => target.focus());
    }
  }, []);

  const step = useCallback(
    (delta: number) => {
      setOpenIndex((current) => {
        if (current === null) return current;
        const next = current + delta;
        if (next < 0 || next >= shown.length) return current;
        return next;
      });
    },
    [shown.length]
  );

  // Arrow keys while the lightbox is open. Bound to the dialog rather than the
  // document so it cannot interfere with the page behind it.
  const onDialogKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    }
  };

  const open = openIndex === null ? null : shown[openIndex];

  return (
    <>
      {showFilters ? (
        <div className="fd-swatch-row" role="group" aria-label="Filter the collection">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
            Everything ({all.length})
          </FilterChip>
          {COLOUR_FAMILIES.map((family) => (
            <FilterChip
              key={family.id}
              active={filter === family.id}
              onClick={() => setFilter(family.id)}
              dot={dresses.find((d) => family.ids.includes(d.id))?.hex}
            >
              {family.label}
            </FilterChip>
          ))}
          {mensOutfits.length > 0 ? (
            <FilterChip active={filter === "mens"} onClick={() => setFilter("mens")}>
              Men&rsquo;s attire ({mensOutfits.length})
            </FilterChip>
          ) : null}
        </div>
      ) : null}

      {/* aria-live so a keyboard or screen-reader visitor is told the grid
          changed when they press a filter, which is otherwise a silent
          visual-only update. */}
      <p className="fd-sr" aria-live="polite">
        {shown.length} {shown.length === 1 ? "garment" : "garments"} shown
      </p>

      <ul
        className="fd-grid fd-reveal-group"
        style={{ ["--fd-min" as string]: "11rem", listStyle: "none", margin: "2rem 0 0", padding: 0 }}
      >
        {shown.map((outfit, index) => (
          <li key={outfit.id}>
            <button
              type="button"
              className="fd-outfit"
              onClick={(event) => {
                returnFocusRef.current = event.currentTarget;
                setOpenIndex(index);
              }}
            >
              <OutfitMedia outfit={outfit} />
              <p className="fd-outfit-name">{outfit.name}</p>
              <p className="fd-outfit-note">
                {outfit.image
                  ? "View larger"
                  : outfit.category === "mens-outfit"
                    ? "Photo on request"
                    : "Photo coming soon"}
              </p>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        className="fd-lightbox"
        ref={dialogRef}
        aria-labelledby={titleId}
        onClose={() => setOpenIndex(null)}
        onKeyDown={onDialogKeyDown}
        // A click on the backdrop lands on the dialog element itself, never on
        // its inner wrapper — which is how this distinguishes "clicked outside"
        // from "clicked the image".
        onClick={(event) => {
          if (event.target === dialogRef.current) close();
        }}
      >
        {open ? (
          <div className="fd-lightbox-inner">
            <div className="fd-lightbox-bar">
              <p id={titleId} className="fd-display fd-h4" style={{ margin: 0 }}>
                {open.name}
              </p>
              <button type="button" className="fd-icon-btn" onClick={close}>
                <span aria-hidden="true">×</span>
                <span className="fd-sr">Close</span>
              </button>
            </div>

            <div className="fd-lightbox-stage">
              {open.hex ? (
                <div
                  className="fd-lightbox-colour"
                  style={{ ["--fd-outfit-colour" as string]: open.hex }}
                  role="img"
                  aria-label={`${open.name} — a colour swatch. No photograph of this dress has been published yet.`}
                />
              ) : (
                <div className="fd-lightbox-colour fd-outfit-monogram" style={{ position: "static" }}>
                  {open.name.charAt(0)}
                </div>
              )}
            </div>

            <div className="fd-lightbox-bar">
              <div>
                <p className="fd-muted" style={{ margin: 0, fontSize: "var(--fd-step--1)" }}>
                  {openIndex !== null ? `${openIndex + 1} of ${shown.length}` : null}
                  {" · "}
                  {open.category === "mens-outfit"
                    ? "Traditional attire. Ask us for photographs of the actual garment."
                    : "A colour swatch, not the fabric. Ask us for photographs."}
                </p>
                <Link
                  className="fd-btn fd-btn-light"
                  style={{ marginTop: "0.75rem" }}
                  href={fdPath(
                    `/enquire?${open.category === "mens-outfit" ? "mens" : "dress"}=${encodeURIComponent(open.id)}`
                  )}
                >
                  Enquire about this one
                </Link>
              </div>

              <div className="fd-lightbox-nav">
                <button
                  type="button"
                  className="fd-icon-btn"
                  onClick={() => step(-1)}
                  disabled={openIndex === 0}
                >
                  <span aria-hidden="true">‹</span>
                  <span className="fd-sr">Previous garment</span>
                </button>
                <button
                  type="button"
                  className="fd-icon-btn"
                  onClick={() => step(1)}
                  disabled={openIndex !== null && openIndex >= shown.length - 1}
                >
                  <span aria-hidden="true">›</span>
                  <span className="fd-sr">Next garment</span>
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}

function FilterChip({
  active,
  onClick,
  dot,
  children,
}: {
  active: boolean;
  onClick: () => void;
  dot?: string;
  children: React.ReactNode;
}) {
  return (
    <button type="button" className="fd-swatch" aria-pressed={active} onClick={onClick}>
      {dot ? <span className="fd-swatch-dot" style={{ background: dot }} aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

/**
 * The garment's picture — or the honest stand-in for one.
 *
 * Three cases, and the distinction matters:
 *   - a photograph exists    -> show it
 *   - a dress with a colour  -> show the colour, labelled as a colour
 *   - a gawn with no colour  -> show a monogram
 *
 * The third case is why men's outfits carry no `hex`. A swatch is a fair
 * stand-in for a dress sold by colour name and a misleading one for a garment
 * sold by regional cut: there is no colour that "Bahary Gawn" means, so
 * inventing one would be inventing a product attribute.
 */
function OutfitMedia({ outfit }: { outfit: Outfit }) {
  return (
    <span className="fd-outfit-media">
      {outfit.hex ? (
        <span
          className="fd-outfit-colour"
          style={{ ["--fd-outfit-colour" as string]: outfit.hex }}
          aria-hidden="true"
        />
      ) : (
        <span className="fd-outfit-monogram" aria-hidden="true">
          {outfit.name.charAt(0)}
        </span>
      )}
    </span>
  );
}
