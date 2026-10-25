"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * A full-size viewer for a set of photographs.
 *
 * =========================================================================
 * WHY THIS IS NOT A LIBRARY
 * =========================================================================
 * Every lightbox package on npm brings a stylesheet with opinions, a focus
 * manager, and between 15 and 60 kilobytes of JavaScript, onto a brand whose
 * entire stylesheet is a few kilobytes and whose whole job is loading large
 * photographs quickly. What is actually needed is an overlay, two arrows and
 * an escape key. That is this file.
 *
 * =========================================================================
 * THE PARTS PEOPLE SKIP, AND WHY THEY ARE HERE
 * =========================================================================
 * A lightbox is the easiest component in a site to ship broken for keyboard
 * and screen-reader users, because it looks perfect to the person who built
 * it with a mouse. So:
 *
 *   - It is a real modal: `role="dialog"`, `aria-modal`, and a label naming
 *     which photograph of how many is open.
 *   - Focus moves into it on open and RETURNS to the thumbnail that opened it
 *     on close. Without that, closing the overlay dumps a keyboard user back
 *     at the top of the document, which on this page means scrolling past a
 *     hero and four sections to get where they were.
 *   - Tab is trapped inside while it is open. Otherwise the focus ring walks
 *     invisibly through the page underneath.
 *   - Escape closes. Arrow keys move. Both are what anybody who has used one
 *     before will try first.
 *   - The page behind does not scroll, and the scrollbar's width is replaced
 *     as padding so the layout does not jump sideways on open.
 *
 * The image is `unoptimized={false}` and sized generously because this view
 * is the one where the photograph is the entire point; everywhere else on the
 * page ships a smaller file.
 */

export type LightboxFrame = {
  src: string;
  alt: string;
  /** Shown under the photograph. Attribution and what the frame actually is. */
  caption?: string;
  width?: number;
  height?: number;
};

export function Lightbox({
  frames,
  index,
  onClose,
  onIndexChange,
}: {
  frames: LightboxFrame[];
  /** null closes it. */
  index: number | null;
  onClose: () => void;
  onIndexChange: (next: number) => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = index !== null && frames.length > 0;

  const go = useCallback(
    (delta: number) => {
      if (index === null) return;
      // Wraps. At the end of a set the useful thing is the start of it, not a
      // dead arrow the visitor has to work out the meaning of.
      onIndexChange((index + delta + frames.length) % frames.length);
    },
    [index, frames.length, onIndexChange]
  );

  // Keyboard, and the scroll lock. One effect because they share a lifetime.
  useEffect(() => {
    if (!open) return;

    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        go(1);
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        go(-1);
        return;
      }
      if (event.key !== "Tab") return;

      // The focus trap. Without it Tab leaves the dialog and walks the page
      // underneath, where nothing is visible and everything is clickable.
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);

    // Replace the scrollbar's width as padding, or the page jumps sideways
    // by however wide the scrollbar is the moment it is hidden.
    const { body } = document;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = body.style.overflow;
    const prevPad = body.style.paddingRight;
    body.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;

    return () => {
      document.removeEventListener("keydown", onKey);
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPad;
      // Back to the thumbnail they came from, not the top of the document.
      opener?.focus?.();
    };
  }, [open, go, onClose]);

  if (!open || index === null) return null;
  const frame = frames[index];
  if (!frame) return null;

  return (
    <div
      className="fd-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`Photograph ${index + 1} of ${frames.length}`}
      // The backdrop closes it, but only when the backdrop itself is the
      // thing clicked. Without the target check, a click that starts on the
      // photograph and drifts closes the viewer mid-look.
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="fd-lightbox-panel" ref={panelRef}>
        <div className="fd-lightbox-bar">
          <p className="fd-lightbox-count" aria-hidden="true">
            {index + 1} / {frames.length}
          </p>
          <button ref={closeRef} type="button" className="fd-lightbox-close" onClick={onClose}>
            <span aria-hidden="true">&times;</span>
            <span className="fd-sr">Close the photograph viewer</span>
          </button>
        </div>

        <div className="fd-lightbox-stage">
          {frames.length > 1 ? (
            <button type="button" className="fd-lightbox-nav" onClick={() => go(-1)}>
              <span aria-hidden="true">&lsaquo;</span>
              <span className="fd-sr">Previous photograph</span>
            </button>
          ) : null}

          <Image
            key={frame.src}
            src={frame.src}
            alt={frame.alt}
            width={frame.width ?? 1600}
            height={frame.height ?? 1067}
            className="fd-lightbox-img"
            sizes="(min-width: 60rem) 80vw, 96vw"
          />

          {frames.length > 1 ? (
            <button type="button" className="fd-lightbox-nav" onClick={() => go(1)}>
              <span aria-hidden="true">&rsaquo;</span>
              <span className="fd-sr">Next photograph</span>
            </button>
          ) : null}
        </div>

        {frame.caption ? <p className="fd-lightbox-caption">{frame.caption}</p> : null}
      </div>
    </div>
  );
}

/** The open/closed state, so a gallery does not re-implement it each time. */
export function useLightbox() {
  const [index, setIndex] = useState<number | null>(null);
  return {
    index,
    open: (next: number) => setIndex(next),
    close: () => setIndex(null),
    move: (next: number) => setIndex(next),
  };
}
