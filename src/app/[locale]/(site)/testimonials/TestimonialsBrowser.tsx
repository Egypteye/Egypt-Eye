"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { TestimonialCard } from "@/components/TestimonialCard";
import { useLocale, useTr } from "@/i18n/LocaleProvider";
import { PLATFORM_LABELS, platformOf } from "@/lib/reviewPolicy";
import { THEME_LABELS, deriveThemes, specificityScore } from "@/lib/reviewThemes";
import type { ReviewPlatform, ReviewTheme } from "@/content/types";
import { t } from "@/i18n/format";
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

function chipClass(active: boolean): string {
  return `rounded-full px-3 py-1.5 text-sm font-medium transition ${
    active ? "bg-ink text-cream" : "bg-sand text-ink-soft/80 hover:bg-sand-dim"
  }`;
}

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
  const { dict } = useLocale();
  const tr = useTr();
  const hash = useSyncExternalStore(subscribe, readHash, readNoHash);

  // Two dimensions beyond category and product, kept as their own state so
  // the hash deep-linking above is untouched: where the review was written,
  // and what the traveller actually talked about.
  //
  // "Mentions" is the one that earns its place. A visitor weighing up a
  // photoshoot wants the reviews that discuss photography, not the newest
  // five — and it is the same relevance signal the product pages use, exposed
  // so a visitor can drive it themselves.
  const [platform, setPlatform] = useState<ReviewPlatform | "all">("all");
  const [theme, setTheme] = useState<ReviewTheme | "all">("all");

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
  const shown = useMemo(() => {
    let list = active.product ? inCategory.filter((e) => e.productKey === active.product) : inCategory;
    if (platform !== "all") list = list.filter((e) => platformOf(e.testimonial) === platform);
    if (theme !== "all") list = list.filter((e) => deriveThemes(e.testimonial).includes(theme));
    // Featured first, then the reviews that actually say something. Recency
    // would put "great, thanks!" above a paragraph describing the day.
    return [...list].sort((a, b) => {
      const f = Number(Boolean(b.testimonial.featured)) - Number(Boolean(a.testimonial.featured));
      if (f !== 0) return f;
      return specificityScore(b.testimonial) - specificityScore(a.testimonial);
    });
  }, [inCategory, active.product, platform, theme]);

  // Only offer a filter that returns something — a chip leading to an empty
  // wall is a dead control.
  const platformChoices = useMemo(() => {
    const seen = new Map<ReviewPlatform, number>();
    for (const e of inCategory) {
      const p = platformOf(e.testimonial);
      seen.set(p, (seen.get(p) ?? 0) + 1);
    }
    return [...seen.entries()].sort((a, b) => b[1] - a[1]);
  }, [inCategory]);

  const themeChoices = useMemo(() => {
    const seen = new Map<ReviewTheme, number>();
    for (const e of inCategory) {
      for (const t of deriveThemes(e.testimonial)) seen.set(t, (seen.get(t) ?? 0) + 1);
    }
    return [...seen.entries()].filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]);
  }, [inCategory]);

  const productChoices = useMemo(
    () => (active.category === "all" ? options : options.filter((o) => o.mega === active.category)),
    [options, active.category]
  );
  const activeProduct = options.find((o) => o.key === active.product);

  const tabs: { key: MegaCategory | "all"; label: string }[] = [
    { key: "all", label: dict.reviews.all },
    ...MEGA_CATEGORIES.map((m) => ({ key: m.mega, label: dict.reviews[m.mega] })),
  ];

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-black/5 pb-6">
        <div className="flex flex-wrap gap-2" role="group" aria-label={dict.reviews.filterByCategory}>
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
              {dict.reviews.jumpTo}
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
                {active.category === "all" ? dict.reviews.anyProduct : dict.reviews.anyInCategory}
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
                {dict.reviews.clear}
              </button>
            )}
          </div>
        )}

        {platformChoices.length > 1 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-ink-soft/70">{tr("Source")}</span>
            <button type="button" onClick={() => setPlatform("all")} className={chipClass(platform === "all")}>
              {tr("All sources")}
            </button>
            {platformChoices.map(([p, n]) => (
              <button key={p} type="button" onClick={() => setPlatform(p)} className={chipClass(platform === p)}>
                {PLATFORM_LABELS[p]} ({n})
              </button>
            ))}
          </div>
        )}

        {themeChoices.length > 1 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-ink-soft/70">{tr("Mentions")}</span>
            <button type="button" onClick={() => setTheme("all")} className={chipClass(theme === "all")}>
              {tr("Anything")}
            </button>
            {themeChoices.map(([t, n]) => (
              <button key={t} type="button" onClick={() => setTheme(t)} className={chipClass(theme === t)}>
                {THEME_LABELS[t]} ({n})
              </button>
            ))}
          </div>
        )}
      </div>

      <p aria-live="polite" className="mt-6 text-sm text-ink-soft/70">
        {activeProduct
          ? t(dict.reviews.showingProduct, { product: activeProduct.title })
          : active.category === "all"
            ? dict.reviews.showingAll
            : t(dict.reviews.showingCategory, {
                category: tabs.find((tab) => tab.key === active.category)?.label ?? "",
              })}
      </p>

      {shown.length === 0 ? (
        <p className="py-16 text-center text-ink-soft/60">
          {dict.reviews.none}{" "}
          <button
            type="button"
            onClick={() => choose(ALL)}
            className="font-semibold text-gold-dark underline underline-offset-4"
          >
            {dict.reviews.seeAll}
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
