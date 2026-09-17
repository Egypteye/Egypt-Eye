"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { TestimonialCard } from "@/components/TestimonialCard";
import {
  MEGA_CATEGORIES,
  megaAnchor,
  type MegaCategory,
  type ReviewEntry,
  type ReviewFilterOption,
} from "@/lib/reviewSubjects";

// One wall of reviews with the filters on top, rather than a page of separate
// stacked sections. Every review is in the markup from the first byte — the
// filters only narrow what's shown — so the page stays static, search engines
// see the whole wall, and nothing is a click away from being read.
//
// The star chip on a product links here with that product's key in the hash.
// Reading the hash rather than a query string is what keeps the page
// statically rendered: `useSearchParams` would opt the whole route out of
// prerendering, which is the exact bug that left /tours shipping zero tour
// links earlier in this project.

type Filter = { category: MegaCategory | "all"; product: string | null };

const ALL: Filter = { category: "all", product: null };

function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}
const readHash = () => window.location.hash.slice(1);
const readNoHash = () => "";

export function TestimonialsBrowser({
  entries,
  options,
}: {
  entries: ReviewEntry[];
  options: ReviewFilterOption[];
}) {
  const hash = useSyncExternalStore(subscribe, readHash, readNoHash);

  // What the hash asks for: a product key, or one of the three categories.
  const fromHash = useMemo<Filter | null>(() => {
    if (!hash) return null;
    const product = options.find((o) => o.key === hash);
    if (product) return { category: product.mega, product: product.key };
    const mega = MEGA_CATEGORIES.find((m) => megaAnchor(m.mega) === hash);
    if (mega) return { category: mega.mega, product: null };
    return null;
  }, [hash, options]);

  // A click overrides the hash, but only until the hash itself changes — which
  // is what makes a second deep-link arrival win without needing an effect to
  // reset anything.
  const [override, setOverride] = useState<(Filter & { hash: string }) | null>(null);
  const active: Filter = override?.hash === hash ? override : fromHash ?? ALL;

  const choose = (next: Filter) => setOverride({ ...next, hash });

  const inCategory = useMemo(
    () => (active.category === "all" ? entries : entries.filter((e) => e.mega === active.category)),
    [entries, active.category]
  );
  const shown = useMemo(
    () => (active.product ? inCategory.filter((e) => e.productKey === active.product) : inCategory),
    [inCategory, active.product]
  );

  const productChoices = useMemo(
    () => (active.category === "all" ? options : options.filter((o) => o.mega === active.category)),
    [options, active.category]
  );
  const activeProduct = options.find((o) => o.key === active.product);

  const tabs: { key: MegaCategory | "all"; label: string }[] = [
    { key: "all", label: "All Reviews" },
    ...MEGA_CATEGORIES.map((m) => ({ key: m.mega, label: m.label })),
  ];

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-black/5 pb-6">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter reviews by category">
          {tabs.map((tab) => {
            const on = active.category === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                aria-pressed={on}
                // Changing category clears the product: a tour selected under
                // Tours is meaningless once you're looking at Photoshoots.
                onClick={() => choose({ category: tab.key, product: null })}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  on
                    ? "bg-ink text-cream"
                    : "border border-black/10 text-ink-soft hover:border-gold/40 hover:text-ink"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {productChoices.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="review-product" className="text-sm text-ink-soft/70">
              Jump to
            </label>
            <select
              id="review-product"
              value={active.product ?? ""}
              onChange={(e) => {
                const key = e.target.value;
                if (!key) return choose({ category: active.category, product: null });
                const picked = options.find((o) => o.key === key);
                choose({ category: picked ? picked.mega : active.category, product: key });
              }}
              className="max-w-full rounded-full border border-black/10 bg-cream px-4 py-2 text-sm text-ink-soft transition hover:border-gold/40 focus:outline-none focus:ring-2 focus:ring-gold/40"
            >
              <option value="">
                {active.category === "all" ? "Any tour, shoot or service" : "Anything in this category"}
              </option>
              {productChoices.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.title}
                </option>
              ))}
            </select>

            {activeProduct && (
              <button
                type="button"
                onClick={() => choose({ category: active.category, product: null })}
                className="text-sm font-semibold text-gold-dark underline underline-offset-4"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      <p aria-live="polite" className="mt-6 text-sm text-ink-soft/70">
        {activeProduct
          ? `Reviews of ${activeProduct.title}`
          : active.category === "all"
            ? "Every review, newest arrivals included"
            : `Every ${tabs.find((t) => t.key === active.category)?.label.toLowerCase()} review`}
      </p>

      {shown.length === 0 ? (
        <p className="py-16 text-center text-ink-soft/60">
          No reviews here yet.{" "}
          <button
            type="button"
            onClick={() => choose(ALL)}
            className="font-semibold text-gold-dark underline underline-offset-4"
          >
            See all reviews
          </button>
          .
        </p>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((entry, i) => (
            <TestimonialCard
              key={`${entry.testimonial.name}-${i}`}
              testimonial={entry.testimonial}
              productTitle={entry.productTitle}
              productHref={entry.productHref}
            />
          ))}
        </div>
      )}
    </div>
  );
}
