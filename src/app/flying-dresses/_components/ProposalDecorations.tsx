"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { ProposalDecoration } from "@/content/flyingDressProposal";
import { track } from "../_lib/analytics";
import { fdPath } from "../_lib/seo";

/**
 * The decoration collection, and the choice a visitor makes in it.
 *
 * =========================================================================
 * IT IS CURRENTLY EMPTY, AND IT STILL EARNS ITS PLACE
 * =========================================================================
 * The owner has confirmed that a catalogue of proposal setups exists and that
 * customers choose from it. They have not supplied the designs, the names or
 * the photographs. Those are two different facts and this component is built
 * on both.
 *
 * What it must not do is invent entries. A grid of plausible names — "Candlelit
 * Classic", "Rose Arch", "Desert Lanterns" — would look finished, would be
 * entirely fiction, and would be discovered by the first customer who asked
 * for one by name. CLAUDE.md §7.
 *
 * So with an empty catalogue it renders the honest version: how choosing
 * actually works, what to tell us so we can send the right photographs, and
 * the way through to the enquiry. That is more useful than a fake grid and it
 * is not a placeholder — it is what the business currently does.
 *
 * ADDING A REAL DESIGN IS THE WHOLE EDIT. Drop an entry into
 * `proposalDecorations` with its photograph and this becomes a selectable
 * catalogue, with the chosen design carried into the enquiry so nobody has to
 * describe it twice. The selection, the handoff and the tracking are all
 * already here and already work.
 */
export function ProposalDecorations({
  decorations,
  interim,
}: {
  decorations: ProposalDecoration[];
  interim: string;
}) {
  const [chosen, setChosen] = useState<string | null>(null);

  // The enquiry link carries the choice. /enquire resolves every incoming
  // value against the catalogue, so an unknown id selects nothing rather than
  // rendering whatever the query string said — see the note on that page.
  const enquireHref = fdPath(
    `/enquire?experience=rooftop-proposal${chosen ? `&setup=${encodeURIComponent(chosen)}` : ""}`
  );

  return (
    <section className="fd-section-tight fd-sand" id="decoration">
      <div className="fd-shell">
        <div style={{ maxWidth: "46rem" }}>
          <p className="fd-eyebrow">The setup</p>
          <h2 className="fd-display fd-h3" style={{ marginTop: "0.75rem" }}>
            Choosing how it looks
          </h2>
        </div>

        {decorations.length > 0 ? (
          <>
            <ul className="fd-decor-grid" style={{ marginTop: "2.5rem" }}>
              {decorations.map((decoration) => {
                const selected = chosen === decoration.id;
                return (
                  <li key={decoration.id}>
                    <button
                      type="button"
                      className="fd-decor-card"
                      aria-pressed={selected}
                      onClick={() => {
                        const next = selected ? null : decoration.id;
                        setChosen(next);
                        if (next) track("proposal_setup_select", { item: next });
                      }}
                    >
                      <span className="fd-decor-frame">
                        <Image
                          src={decoration.src}
                          alt={decoration.alt}
                          width={1200}
                          height={1500}
                          className="fd-decor-img"
                          sizes="(min-width: 60rem) 22rem, 45vw"
                        />
                      </span>
                      <span className="fd-decor-body">
                        <span className="fd-decor-name">{decoration.name}</span>
                        <span className="fd-decor-desc">{decoration.description}</span>
                        <span className="fd-decor-pick">
                          {selected ? "Selected" : "Choose this setup"}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="fd-hint" style={{ marginTop: "1.25rem", maxWidth: "46rem" }}>
              Choosing one here carries it into the enquiry so you do not have to describe it
              again. Nothing is reserved by choosing, and you can change it later.
            </p>
          </>
        ) : (
          <div className="fd-note" style={{ marginTop: "2.5rem", maxWidth: "46rem" }}>
            <p style={{ margin: 0 }}>{interim}</p>
          </div>
        )}

        <div className="fd-actions" style={{ marginTop: "2rem" }}>
          <Link
            className="fd-btn"
            href={enquireHref}
            onClick={() =>
              track("proposal_cta_click", { item: "decoration", destination: "/enquire" })
            }
          >
            {chosen ? "Enquire about this setup" : "Ask to see the current setups"}
          </Link>
        </div>
      </div>
    </section>
  );
}
