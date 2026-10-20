import Link from "next/link";
import { fdSettings } from "./_lib/content";
import { fdPath } from "./_lib/seo";

/**
 * This brand's own 404.
 *
 * Without it, a bad URL under /flying-dresses would fall through to Egypt
 * Eye's not-found page — a travel operator's apology, in a different typeface
 * and a different palette, for a page on a fashion site. A brand with its own
 * root layout needs its own 404 for the same reason it needs its own header.
 *
 * It sends people somewhere useful rather than just apologising: the nav, plus
 * the two things most 404s here are reaching for.
 */
export default async function FlyingDressesNotFound() {
  const { nav } = await fdSettings();

  return (
    <section className="fd-section">
      <div className="fd-shell fd-shell-narrow">
        <p className="fd-eyebrow">404</p>
        <h1 className="fd-display fd-h2">This page is not here</h1>
        <p className="fd-lead fd-muted" style={{ marginTop: "1.5rem" }}>
          The link may be old, or we may have moved something. Everything on the site is one of
          these:
        </p>

        <ul className="fd-list fd-list-2" style={{ marginTop: "2.5rem" }}>
          {nav.map((item) => (
            <li key={item.href}>
              <h2 style={{ font: "inherit", margin: 0 }}>
                <Link className="fd-arrow-link" href={item.href}>
                  {item.label}
                </Link>
              </h2>
            </li>
          ))}
        </ul>

        <div className="fd-actions" style={{ marginTop: "3rem" }}>
          <Link className="fd-btn" href={fdPath()}>
            Back to the start
          </Link>
          <Link className="fd-btn fd-btn-ghost" href={fdPath("/enquire")}>
            Ask us a question
          </Link>
        </div>
      </div>
    </section>
  );
}
