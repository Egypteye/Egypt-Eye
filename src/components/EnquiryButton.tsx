"use client";

import { useState } from "react";
import { EnquiryModal } from "./EnquiryModal";

type ItemType = "tour" | "experience" | "photoshoot";

// Replaces the old plain `mailto:` link, which only ever carried a subject
// line and no real customer details. Opens a short popup form instead —
// the reservations team gets one clear, complete email out of it, and the
// customer doesn't have to leave the page or write the email themselves.
export function EnquiryButton({
  itemType,
  itemTitle,
  itemSlug,
  className = "",
}: {
  itemType: ItemType;
  itemTitle: string;
  itemSlug: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`block w-full rounded-full border border-black/10 py-3 text-center text-sm font-semibold text-ink-soft transition hover:bg-sand-dim ${className}`}
      >
        Email an Enquiry
      </button>
      {open && (
        <EnquiryModal itemType={itemType} itemTitle={itemTitle} itemSlug={itemSlug} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
