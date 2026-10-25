"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { RevealDecoration, RevealTheme } from "@/content/flyingDressGenderReveal";
import { track } from "../_lib/analytics";
import { fdPath } from "../_lib/seo";

/**
 * How the reveal looks: the colour theme, and the decoration behind it.
 *
 * =========================================================================
 * TWO LISTS IN ONE SECTION, IN OPPOSITE STATES
 * =========================================================================
 * The colour theme is CONFIRMED. The experience record says a customer picks
 * "a choice from our existing decoration designs, in a colour theme you pick",
 * so the three options below are a real choice a real customer makes, and
 * choosing one carries it into the enquiry.
 *
 * The decoration catalogue is EMPTY, and that is the honest state. The record's
 * own unanswered questions include "Which decoration designs exist for this,
 * and photographs of them." So the catalogue is fully built and renders the
 * interim copy until somebody supplies the designs. Dropping an entry into
 * `revealDecorations` with its photograph is the whole edit; the selection and
 * the handoff below already work.
 *
 * What this must not do is invent designs. A grid of plausible names would look
 * finished, be fiction, and be discovered by the first customer who asked for
 * one by name. CLAUDE.md §7.
 *
 * =========================================================================
 * WHY THE COLOUR OPTIONS ARE NOT "PINK" AND "BLUE"
 * =========================================================================
 * Because the person using this chooser usually does not know the answer. A
 * parent who is about to find out cannot pick the revealing colour, so a
 * pink-or-blue toggle is incoherent for the one visitor it is aimed at. The
 * real question is whether the decoration is allowed to give anything away and
 * who decides its colour, which is what the three options are. See the note in
 * content/flyingDressGenderReveal.ts.
 */
export function RevealThemes({
  themes,
  themeNote,
  decorations,
  interim,
}: {
  themes: RevealTheme[];
  themeNote: string;
  decorations: RevealDecoration[];
  interim: string;
}) {
  const [theme, setTheme] = useState<string | null>(null);
  const [setup, setSetup] = useState<string | null>(null);

  // The enquiry link carries both choices. /enquire resolves every incoming
  // value against the catalogue, so an unknown id selects nothing rather than
  // rendering whatever the query string said.
  const enquireHref = fdPath(
    `/enquire?experience=gender-reveal` +
      (theme ? `&theme=${encodeURIComponent(theme)}` : "") +
      (setup ? `&setup=${encodeURIComponent(setup)}` : "")
  );

  return (
    <section className="fd-section-tight fd-sand" id="decoration">
      <div className="fd-shell">
        <div style={{ maxWidth: "46rem" }}>
          <p className="fd-eyebrow">The setup</p>
          <h2 className="fd-display fd-h3" style={{ marginTop: "0.75rem" }}>
            Choosing how it looks
          </h2>
          <p className="fd-muted" style={{ marginTop: "1rem" }}>
            Two decisions, and the first one matters more than people expect. It is whether the
            decoration is allowed to give anything away before the moment.
          </p>
        </div>

        <ul className="fd-decor-grid" style={{ marginTop: "2.5rem" }}>
          {themes.map((option) => {
            const selected = theme === option.id;
            return (
              <li key={option.id}>
                <button
                  type="button"
                  className="fd-decor-card"
                  aria-pressed={selected}
                  onClick={() => {
                    const next = selected ? null : option.id;
                    setTheme(next);
                    if (next) track("reveal_theme_select", { item: next });
                  }}
                >
                  <span className="fd-decor-body">
                    <span className="fd-decor-name">{option.label}</span>
                    <span className="fd-decor-desc">{option.detail}</span>
                    <span className="fd-decor-pick">
                      {selected ? "Selected" : "Start here"}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <p className="fd-hint" style={{ marginTop: "1.25rem", maxWidth: "46rem" }}>
          {themeNote}
        </p>

        {decorations.length > 0 ? (
          <>
            <h3 className="fd-display fd-h4" style={{ marginTop: "3rem" }}>
              The designs
            </h3>
            <ul className="fd-decor-grid" style={{ marginTop: "1.5rem" }}>
              {decorations.map((decoration) => {
                const selected = setup === decoration.id;
                return (
                  <li key={decoration.id}>
                    <button
                      type="button"
                      className="fd-decor-card"
                      aria-pressed={selected}
                      onClick={() => {
                        const next = selected ? null : decoration.id;
                        setSetup(next);
                        if (next) track("reveal_setup_select", { item: next });
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
                          {selected ? "Selected" : "Choose this design"}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
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
              track("reveal_cta_click", { item: "decoration", destination: "/enquire" })
            }
          >
            {theme || setup ? "Enquire with these choices" : "Ask to see the current setups"}
          </Link>
        </div>
      </div>
    </section>
  );
}
