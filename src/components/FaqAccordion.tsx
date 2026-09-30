"use client";

import Link from "next/link";
import { useState } from "react";
import type { Faq } from "@/content/types";

// The collapsed panel stays in the DOM so the open/close can animate over
// grid-template-rows. That is also how an accordion quietly breaks for
// keyboard users: content at 0fr is still focusable, so tabbing walks into
// answers nobody can see. `invisible` takes the closed panel out of the tab
// order without removing it, which keeps the animation and fixes the trap.
export function FaqAccordion({ faqs, idPrefix = "faq" }: { faqs: Faq[]; idPrefix?: string }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-black/5 rounded-2xl border border-black/5 bg-cream">
      {faqs.map((faq, i) => {
        const isOpen = open === i;
        return (
          <div key={faq.question}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              aria-controls={`${idPrefix}-panel-${i}`}
              id={`${idPrefix}-button-${i}`}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
            >
              <span className="font-semibold text-ink">{faq.question}</span>
              <span
                className={`shrink-0 text-xl text-gold-dark transition-transform ${
                  isOpen ? "rotate-45" : ""
                }`}
              >
                +
              </span>
            </button>
            <div
              id={`${idPrefix}-panel-${i}`}
              role="region"
              aria-labelledby={`${idPrefix}-button-${i}`}
              className={`grid transition-all duration-300 ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr] invisible"
              }`}
            >
              <div className="overflow-hidden">
                <div className="px-6 pb-5">
                  <p className="text-sm leading-relaxed text-ink-soft">{faq.answer}</p>
                  {faq.link && (
                    <Link
                      href={faq.link.href}
                      className="mt-3 inline-block text-sm font-semibold text-gold-dark underline-offset-4 hover:underline"
                    >
                      {faq.link.label} →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
