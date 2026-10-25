"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { MusicSetup } from "@/content/flyingDressMusic";
import { track } from "../_lib/analytics";
import { fdPath } from "../_lib/seo";

/**
 * Set dressing for a music session.
 *
 * EMPTY, AND THAT IS THE HONEST STATE. Nothing has been supplied for
 * music-session set dressing, and the experience record's own unanswered
 * question is the equipment inventory. So this renders how it actually works:
 * describe the direction, send a reference, and we come back with what can be
 * built on the roof for your date.
 *
 * A separate array from the celebration and proposal catalogues on purpose. A
 * DJ setup is not a birthday setup with the balloons taken out, and sharing
 * one list would put flowers in front of a techno producer.
 *
 * Adding a real entry is the whole edit. The selection and the enquiry handoff
 * below already work.
 */
export function MusicSetups({ setups, interim }: { setups: MusicSetup[]; interim: string }) {
  const [chosen, setChosen] = useState<string | null>(null);

  const enquireHref = fdPath(
    `/enquire?experience=rooftop-music-session${chosen ? `&setup=${encodeURIComponent(chosen)}` : ""}`
  );

  return (
    <section className="fd-section-tight" id="setups">
      <div className="fd-shell">
        <div style={{ maxWidth: "46rem" }}>
          <p className="fd-eyebrow">The look</p>
          <h2 className="fd-display fd-h3" style={{ marginTop: "0.75rem" }}>
            Set dressing and visual direction
          </h2>
        </div>

        {setups.length > 0 ? (
          <ul className="fd-decor-grid" style={{ marginTop: "2.5rem" }}>
            {setups.map((setup) => {
              const selected = chosen === setup.id;
              return (
                <li key={setup.id}>
                  <button
                    type="button"
                    className="fd-decor-card"
                    aria-pressed={selected}
                    onClick={() => {
                      const next = selected ? null : setup.id;
                      setChosen(next);
                      if (next) track("music_setup_select", { item: next });
                    }}
                  >
                    <span className="fd-decor-frame">
                      <Image
                        src={setup.src}
                        alt={setup.alt}
                        width={1200}
                        height={1500}
                        className="fd-decor-img"
                        sizes="(min-width: 60rem) 22rem, 45vw"
                      />
                    </span>
                    <span className="fd-decor-body">
                      <span className="fd-decor-name">{setup.name}</span>
                      <span className="fd-decor-desc">{setup.description}</span>
                      <span className="fd-decor-pick">
                        {selected ? "Selected" : "Choose this setup"}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="fd-note" style={{ marginTop: "2.5rem", maxWidth: "46rem" }}>
            <p style={{ margin: 0 }}>{interim}</p>
          </div>
        )}

        <div className="fd-actions" style={{ marginTop: "2rem" }}>
          <Link
            className="fd-btn fd-btn-ghost"
            href={enquireHref}
            onClick={() => track("music_cta_click", { item: "setups", destination: "/enquire" })}
          >
            {chosen ? "Enquire about this setup" : "Send us your visual direction"}
          </Link>
        </div>
      </div>
    </section>
  );
}
