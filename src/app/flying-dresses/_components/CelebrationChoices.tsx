"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { CelebrationDecoration } from "@/content/flyingDressBirthday";
import { celebrationOccasions } from "@/content/flyingDressBirthday";
import { track } from "../_lib/analytics";
import { fdPath } from "../_lib/seo";

/**
 * What you are celebrating, and how it looks.
 *
 * =========================================================================
 * TWO LISTS, IN OPPOSITE STATES, AGAIN
 * =========================================================================
 * The OCCASION is confirmed: the experience record names birthdays,
 * graduations and reunions by hand, and it is the single most useful thing
 * the desk can know before it replies, because a thirtieth and a graduation
 * are not planned the same way. Choosing one carries it into the enquiry.
 *
 * The DECORATION CATALOGUE is empty, and that is the honest state. The
 * record's own unanswered question is "Which decoration designs suit a
 * birthday rather than a proposal." Nobody has supplied birthday designs,
 * names or photographs, so the section renders how choosing actually works
 * and offers to send what is available, rather than a grid of names somebody
 * here invented. Adding a real design is the whole edit; the selection and
 * the handoff below already work. CLAUDE.md §7.
 */
export function CelebrationChoices({
  decorations,
  interim,
}: {
  decorations: CelebrationDecoration[];
  interim: string;
}) {
  const [occasion, setOccasion] = useState<string | null>(null);
  const [setup, setSetup] = useState<string | null>(null);

  // The enquiry link carries both. /enquire resolves every incoming value
  // against the catalogue, so an unknown id selects nothing rather than
  // rendering whatever the query string said.
  const enquireHref = fdPath(
    `/enquire?experience=private-celebration` +
      (occasion ? `&occasion=${encodeURIComponent(occasion)}` : "") +
      (setup ? `&setup=${encodeURIComponent(setup)}` : "")
  );

  return (
    <section className="fd-section-tight fd-sand" id="decoration">
      <div className="fd-shell">
        <div style={{ maxWidth: "46rem" }}>
          <p className="fd-eyebrow">The setup</p>
          <h2 className="fd-display fd-h3" style={{ marginTop: "0.75rem" }}>
            Start with what you are celebrating
          </h2>
          <p className="fd-muted" style={{ marginTop: "1rem" }}>
            It changes the evening more than the decoration does. A thirtieth, a graduation and a
            reunion of people who live in four countries want three different shapes of night.
          </p>
        </div>

        <ul className="fd-decor-grid" style={{ marginTop: "2.5rem" }}>
          {celebrationOccasions.map((option) => {
            const selected = occasion === option.id;
            return (
              <li key={option.id}>
                <button
                  type="button"
                  className="fd-decor-card"
                  aria-pressed={selected}
                  onClick={() => {
                    const next = selected ? null : option.id;
                    setOccasion(next);
                    if (next) track("celebration_occasion_select", { item: next });
                  }}
                >
                  <span className="fd-decor-body">
                    <span className="fd-decor-name">{option.label}</span>
                    <span className="fd-decor-desc">{option.detail}</span>
                    <span className="fd-decor-pick">{selected ? "Selected" : "Start here"}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <p className="fd-hint" style={{ marginTop: "1.25rem", maxWidth: "46rem" }}>
          Choosing one carries it into the enquiry so you do not have to explain it twice. Nothing
          is reserved by choosing, and you can change it later.
        </p>

        <div style={{ maxWidth: "46rem", marginTop: "3rem" }}>
          <h3 className="fd-display fd-h4">Then the decoration</h3>
        </div>

        {decorations.length > 0 ? (
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
                      if (next) track("celebration_setup_select", { item: next });
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
        ) : (
          <div className="fd-note" style={{ marginTop: "1.5rem", maxWidth: "46rem" }}>
            <p style={{ margin: 0 }}>{interim}</p>
          </div>
        )}

        <div className="fd-actions" style={{ marginTop: "2rem" }}>
          <Link
            className="fd-btn"
            href={enquireHref}
            onClick={() =>
              track("celebration_cta_click", { item: "decoration", destination: "/enquire" })
            }
          >
            {occasion || setup ? "Enquire with these choices" : "Ask to see the current setups"}
          </Link>
        </div>
      </div>
    </section>
  );
}
