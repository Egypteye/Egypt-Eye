import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { Reveal } from "@/components/Reveal";
import { SmartImage } from "@/components/SmartImage";
import { ProductActions } from "@/components/ProductActions";
import { treasureCategories, treasureProducts, TREASURES_PATH } from "@/content/treasures";
import { getTreasureCategories, getTreasureProducts } from "@/sanity/fetchers";
import { availabilityLabel, priceDisplay, statusLabel } from "@/lib/treasureDisplay";
import { isInstantlyOrderable, unitPriceCents } from "@/lib/boutique/cartoucheOrder";
import { familyLabel } from "@/lib/boutique/scentFamilies";
import { breadcrumbJsonLd, resolveMetadata } from "@/content/seo";
import { jsonLdScript } from "@/content/jsonLd";
import { alternatesFor } from "@/i18n/alternates";
import { getLocale } from "@/i18n/dictionary";
import { localePath } from "@/i18n/locales";
import { localizeContent } from "@/i18n/localizeDeep";
import { T } from "@/i18n/T";

// A product's own page.
//
// It exists because the four things a customer might want to do with a bottle
// of oil — buy it, ask about it, come and smell it, or go and shop for a day
// — do not fit on a card in a grid, and stacking four buttons on every card
// would wreck the collection page for everyone just browsing.
//
// WHAT IS DELIBERATELY ABSENT
//
// No Product or Offer structured data unless the product has a real price.
// Offer requires a price and an availability, and emitting either on a piece
// that is still "on request" is a manual action from Google rather than a
// rich result. The breadcrumb is true today, so that ships regardless.
//
// No buy button on a product with no price. See docs/oils-research.md: every
// oil in the Boutique is unconfirmed, and a price we have not been given is
// not a price.

type Params = { category: string; product: string };

export function generateStaticParams() {
  return treasureProducts
    .filter((p) => treasureCategories.some((c) => c.slug === p.category))
    .map((p) => ({ category: p.category, product: p.slug }));
}

async function load(slug: string, categorySlug: string) {
  const [products, categories] = await Promise.all([getTreasureProducts(), getTreasureCategories()]);
  const product = products.find((p) => p.slug === slug && p.category === categorySlug);
  const category = categories.find((c) => c.slug === categorySlug);
  return product && category ? { product, category } : null;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { category: categorySlug, product: slug } = await params;
  const found = await load(slug, categorySlug);
  if (!found) return {};
  const locale = await getLocale();
  const path = `${TREASURES_PATH}/${categorySlug}/${slug}`;
  return {
    ...resolveMetadata({
      title: `${found.product.name} — ${found.category.title}`,
      description: found.product.blurb,
      seo: found.product.seo,
      image: found.product.image,
      path,
      locale,
    }),
    alternates: alternatesFor(path, locale),
  };
}

export default async function TreasureProductPage({ params }: { params: Promise<Params> }) {
  const { category: categorySlug, product: slug } = await params;
  const found = await load(slug, categorySlug);
  if (!found) notFound();

  const locale = await getLocale();
  const { product, category } = await localizeContent(found, locale);
  const path = `${TREASURES_PATH}/${categorySlug}/${slug}`;
  const price = priceDisplay(product.price);
  const badge = statusLabel(product.status);
  const availability = availabilityLabel(product.availability);
  const orderable = isInstantlyOrderable(product);
  const families = product.scentFamily ?? [];

  const related = (await getTreasureProducts())
    .filter((p) => p.category === categorySlug && p.slug !== slug)
    .filter((p) => families.length === 0 || (p.scentFamily ?? []).some((f) => families.includes(f)))
    .slice(0, 3);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            breadcrumbJsonLd([
              { name: "The Boutique", path: TREASURES_PATH },
              { name: category.title, path: `${TREASURES_PATH}/${categorySlug}` },
              { name: product.name, path },
            ])
          ),
        }}
      />

      <section className="border-b border-black/5 bg-sand/40 py-10">
        <Container>
          <nav aria-label="Breadcrumb" className="text-sm text-ink-soft">
            <Link href={localePath(TREASURES_PATH, locale)} className="transition hover:text-ink">
              <T>The Boutique</T>
            </Link>
            <span aria-hidden className="px-2 text-ink-soft/50">
              /
            </span>
            <Link
              href={localePath(`${TREASURES_PATH}/${categorySlug}`, locale)}
              className="transition hover:text-ink"
            >
              {category.title}
            </Link>
            <span aria-hidden className="px-2 text-ink-soft/50">
              /
            </span>
            <span className="text-ink">{product.name}</span>
          </nav>
        </Container>
      </section>

      <section className="py-12 lg:py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
            {/* The bottle */}
            <Reveal>
              <div className="overflow-hidden rounded-3xl border border-black/5 bg-sand-dim">
                {product.image ? (
                  <div className="relative aspect-square">
                    <SmartImage
                      image={product.image}
                      tone={product.imageTone ?? "desert"}
                      alt={product.imageAlt ?? product.name}
                      className="h-full w-full"
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      priority
                    />
                  </div>
                ) : (
                  // No invented photograph. A consistent, quiet placeholder is
                  // more honest than a stock image of somebody else's bottle.
                  <div className="flex aspect-square flex-col items-center justify-center gap-3 px-8 text-center">
                    <span aria-hidden className="font-display text-5xl text-gold-dark/30">
                      {product.name.slice(0, 1)}
                    </span>
                    <p className="text-sm text-ink-soft/80">
                      <T>Photograph coming. We only use pictures of the actual bottle.</T>
                    </p>
                  </div>
                )}
              </div>
            </Reveal>

            {/* What it is, and what you can do about it */}
            <div className="flex flex-col">
              <Reveal>
                <div className="flex flex-wrap items-center gap-2">
                  {product.placeholder && (
                    <span className="rounded-full bg-black/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                      <T>Sample listing</T>
                    </span>
                  )}
                  {badge && (
                    <span className="rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-gold-dark">
                      {badge}
                    </span>
                  )}
                  {families.map((f) => (
                    <Link
                      key={f}
                      href={localePath(`${TREASURES_PATH}/${categorySlug}`, locale)}
                      className="rounded-full border border-black/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink-soft transition hover:border-gold/40"
                    >
                      {familyLabel(f)}
                    </Link>
                  ))}
                </div>

                <h1 className="mt-4 font-display text-4xl font-semibold text-ink">{product.name}</h1>
                <p className="mt-3 text-lg leading-relaxed text-ink-soft">{product.blurb}</p>
                {product.description && (
                  <p className="mt-4 leading-relaxed text-ink-soft">{product.description}</p>
                )}
              </Reveal>

              {product.specs && product.specs.length > 0 && (
                <Reveal>
                  <dl className="mt-6 space-y-2 border-t border-black/5 pt-5">
                    {product.specs.map((spec) => (
                      <div key={spec.label} className="flex justify-between gap-4 text-sm">
                        <dt className="text-ink-soft/85">{spec.label}</dt>
                        <dd className="font-semibold text-ink">{spec.value}</dd>
                      </div>
                    ))}
                  </dl>
                </Reveal>
              )}

              <Reveal>
                <div className="mt-6 border-t border-black/5 pt-5">
                  {price.amount ? (
                    <p className="font-display text-2xl font-semibold text-ink">{price.amount}</p>
                  ) : (
                    <p className="text-sm font-semibold text-ink-soft">{price.note}</p>
                  )}
                  {availability && <p className="mt-1 text-xs text-ink-soft/80">{availability}</p>}
                </div>
              </Reveal>

              <Reveal>
                <div className="mt-6">
                  <ProductActions
                    productSlug={product.slug}
                    productName={product.name}
                    categorySlug={categorySlug}
                    productPath={path}
                    variants={(product.variants ?? []).map((v) => v.label)}
                    unitCents={orderable ? (unitPriceCents(product) ?? 0) : null}
                    offersVisit={Boolean(category.inEgypt)}
                    unavailableReason={
                      categorySlug === "essence-oils"
                        ? "Fragrance is not something to buy from a photograph, so we do not sell it online. Ask us about this one, or come and smell the range — both are free."
                        : undefined
                    }
                  />
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </section>

      {related.length > 0 && (
        <section className="border-t border-black/5 bg-sand/40 py-14">
          <Container>
            <Reveal>
              <h2 className="font-display text-2xl font-semibold text-ink">
                <T>You might also like</T>
              </h2>
            </Reveal>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {related.map((p, i) => (
                <Reveal key={p.slug} delay={i * 60}>
                  <Link
                    href={localePath(`${TREASURES_PATH}/${categorySlug}/${p.slug}`, locale)}
                    className="flex h-full flex-col rounded-2xl border border-black/5 bg-cream p-5 transition hover:border-gold/30"
                  >
                    <h3 className="font-display text-lg font-semibold text-ink">{p.name}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{p.blurb}</p>
                  </Link>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
