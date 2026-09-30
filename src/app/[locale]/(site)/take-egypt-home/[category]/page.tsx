import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { SmartImage } from "@/components/SmartImage";
import { Reveal } from "@/components/Reveal";
import { FaqAccordion } from "@/components/FaqAccordion";
import { TreasureRequestForm } from "@/components/TreasureRequestForm";
import { TourCard } from "@/components/TourCard";
import { PhotoshootCard } from "@/components/PhotoshootCard";
import { StoryCard } from "@/components/StoryCard";
import { treasureCategories, TREASURES_PATH } from "@/content/treasures";
import { getTreasureCategories, getTreasureProducts } from "@/sanity/fetchers";
import { availabilityLabel, cardPrice, ctaForStatus, isOrderable, statusLabel } from "@/lib/treasureDisplay";
import { breadcrumbJsonLd, faqJsonLd, resolveMetadata } from "@/content/seo";
import { getPhotoshoots, getStories, getTours } from "@/sanity/fetchers";
import { SmartImage as ProductImage } from "@/components/SmartImage";
import { alternatesFor } from "@/i18n/alternates";
import { getLocale } from "@/i18n/dictionary";
import { localePath } from "@/i18n/locales";
import { localizeContent } from "@/i18n/localizeDeep";
import { T, trAll } from "@/i18n/T";

// One route for four categories, which is not the same as one template for
// four categories: the sections below are each conditional on the category
// actually having that content. Clothing and essence oils carry an `inEgypt`
// block and cartouches and papyrus do not, so the appointment path appears
// only where booking one is genuinely the better route — which is the point
// the brief makes about not copying a product template four times.
//
// No Product or Offer structured data: those require a price and an
// availability status, and inventing either is a manual-action risk rather
// than a rich result. BreadcrumbList and FAQPage are true today, so those ship.

export function generateStaticParams() {
  return treasureCategories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const category = (await getTreasureCategories()).find((c) => c.slug === slug);
  if (!category) return {};
  const locale = await getLocale();
  const path = `${TREASURES_PATH}/${category.slug}`;
  return {
    ...resolveMetadata({
      title: category.heroHeadline,
      description: category.heroSub,
      seo: category.seo,
      path,
      locale,
    }),
    alternates: alternatesFor(path, locale),
  };
}

export default async function TreasureCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const locale = await getLocale();
  const to = (path: string) => localePath(path, locale);

  // Everything comes through the fetchers, so the Studio is the source of
  // truth and the content files are only the fallback. `raw` is the
  // untranslated record — related-slug lookups have to run against it, since
  // localizeContent leaves slugs opaque but the objects are copies.
  const [categories, allProducts] = await Promise.all([getTreasureCategories(), getTreasureProducts()]);
  const raw = categories.find((c) => c.slug === slug);
  if (!raw) notFound();

  const [category, products] = await Promise.all([
    localizeContent(raw, locale),
    localizeContent(allProducts.filter((p) => p.category === raw.slug), locale),
  ]);

  const [allTours, allPhotoshoots, allStories] = await Promise.all([
    raw.relatedTourSlugs?.length ? getTours() : Promise.resolve([]),
    raw.relatedPhotoshootSlugs?.length ? getPhotoshoots() : Promise.resolve([]),
    raw.relatedStorySlugs?.length ? getStories() : Promise.resolve([]),
  ]);
  const relatedTours = (raw.relatedTourSlugs ?? [])
    .map((s) => allTours.find((t) => t.slug === s))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));
  const relatedPhotoshoots = (raw.relatedPhotoshootSlugs ?? [])
    .map((s) => allPhotoshoots.find((p) => p.slug === s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const relatedStories = (raw.relatedStorySlugs ?? [])
    .map((s) => allStories.find((story) => story.slug === s))
    .filter((story): story is NonNullable<typeof story> => Boolean(story));

  const ui = await trAll([
    "Sample listing",
    "Photography and final details to come",
    "Take Egypt Home",
  ]);

  const path = `${TREASURES_PATH}/${category.slug}`;
  const breadcrumbs = breadcrumbJsonLd([
    { name: "Take Egypt Home", path: TREASURES_PATH },
    { name: category.title, path },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(category.faqs)) }} />

      {/* Hero */}
      <section className="relative">
        <SmartImage
          image={category.image}
          tone="desert"
          alt={category.imageAlt ?? category.title}
          className="absolute inset-0"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/20" />
        <Container className="relative flex min-h-[46vh] flex-col justify-end gap-4 pb-14 pt-32">
          <nav aria-label="Breadcrumb" className="text-sm text-cream/70">
            <Link href={to(TREASURES_PATH)} className="hover:text-cream">
              {ui["Take Egypt Home"]}
            </Link>
            <span aria-hidden className="mx-2">
              /
            </span>
            <span className="text-cream/90">{category.title}</span>
          </nav>
          <h1 className="max-w-3xl font-display text-4xl font-semibold text-cream sm:text-5xl">
            {category.heroHeadline}
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-cream/85">{category.heroSub}</p>
        </Container>
      </section>

      {/* Cultural context */}
      <section className="border-b border-black/5 bg-sand/40 py-16">
        <Container className="mx-auto max-w-3xl space-y-10">
          {category.story.map((block) => (
            <Reveal key={block.title}>
              <h2 className="font-display text-2xl font-semibold text-ink">{block.title}</h2>
              <p className="mt-3 leading-relaxed text-ink-soft">{block.body}</p>
            </Reveal>
          ))}
        </Container>
      </section>

      {/* The pieces */}
      {products.length > 0 && (
        <section className="py-16">
          <Container>
            <Reveal>
              <h2 className="font-display text-3xl font-semibold text-ink">
                <T>The pieces</T>
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
                <T>
                  Choose one to start the conversation, or send your request without picking — we will suggest what
                  fits what you are after.
                </T>
              </p>
            </Reveal>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product, i) => {
                const price = cardPrice(product);
                const availability = availabilityLabel(product.availability);
                const badge = statusLabel(product.status);
                return (
                  <Reveal key={product.slug} delay={i * 60}>
                    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-black/5 bg-cream shadow-sm">
                      {product.image && (
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <ProductImage
                            image={product.image}
                            tone={product.imageTone ?? "desert"}
                            alt={product.imageAlt ?? product.name}
                            className="h-full w-full"
                            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          />
                        </div>
                      )}
                      <div className="flex flex-1 flex-col p-6">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-display text-lg font-semibold text-ink">{product.name}</h3>
                          <div className="flex shrink-0 flex-col items-end gap-1">
                            {product.placeholder && (
                              <span className="rounded-full bg-black/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                                {ui["Sample listing"]}
                              </span>
                            )}
                            {badge && (
                              <span className="rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-gold-dark">
                                {badge}
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{product.blurb}</p>

                        {product.specs && product.specs.length > 0 && (
                          <dl className="mt-4 space-y-1.5 border-t border-black/5 pt-4">
                            {product.specs.map((spec) => (
                              <div key={spec.label} className="flex justify-between gap-4 text-sm">
                                <dt className="text-ink-soft/85">{spec.label}</dt>
                                <dd className="font-semibold text-ink">{spec.value}</dd>
                              </div>
                            ))}
                          </dl>
                        )}

                        {product.variants && product.variants.length > 0 && (
                          <ul className="mt-4 flex flex-wrap gap-2">
                            {product.variants.map((variant) => (
                              <li
                                key={variant.label}
                                className="rounded-full border border-black/10 px-3 py-1 text-xs font-semibold text-ink-soft"
                              >
                                {variant.label}
                                {typeof variant.price?.amount === "number" && (
                                  <span className="text-ink"> · ${variant.price.amount}</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}

                        <div className="mt-5 flex items-end justify-between gap-4 border-t border-black/5 pt-4">
                          <div>
                            {price.amount ? (
                              <p className="font-display text-lg font-semibold text-ink">
                                {price.from && <span className="text-sm font-normal text-ink-soft">from </span>}
                                {price.amount}
                                {price.was && (
                                  <span className="ml-2 text-sm font-normal text-ink-soft/70 line-through">
                                    {price.was}
                                  </span>
                                )}
                              </p>
                            ) : (
                              <p className="text-sm font-semibold text-ink-soft">{price.note}</p>
                            )}
                            {availability && <p className="mt-0.5 text-xs text-ink-soft/80">{availability}</p>}
                          </div>
                          {isOrderable(product.status) ? (
                            <Link
                              href="#request"
                              className="shrink-0 rounded-full bg-gold px-4 py-2 text-xs font-semibold text-ink transition hover:bg-gold-light"
                            >
                              {ctaForStatus(product.status)}
                            </Link>
                          ) : (
                            <span className="shrink-0 rounded-full bg-black/5 px-4 py-2 text-xs font-semibold text-ink-soft">
                              {ctaForStatus(product.status)}
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </Container>
        </section>
      )}

      {/* Before you arrive */}
      <section className="bg-sand-dim py-16">
        <Container>
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-dark">
              <T>Before you arrive</T>
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-ink">
              <T>How it works</T>
            </h2>
          </Reveal>
          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {category.beforeYouArrive.map((step, i) => (
              <Reveal key={step.title} delay={i * 70}>
                <li className="h-full rounded-2xl border border-black/5 bg-cream p-5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold text-xs font-bold text-ink">
                    {i + 1}
                  </span>
                  <p className="mt-3 font-semibold text-ink">{step.title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{step.description}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      {/* Already in Egypt — only where it is genuinely the better route */}
      {category.inEgypt && (
        <section className="py-16">
          <Container>
            <div className="rounded-3xl border border-gold/20 bg-gold/5 p-8 sm:p-12">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-dark">
                <T>Already in Egypt</T>
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-ink">{category.inEgypt.title}</h2>
              <p className="mt-3 max-w-2xl leading-relaxed text-ink-soft">{category.inEgypt.body}</p>
              <ol className="mt-8 grid gap-6 sm:grid-cols-3">
                {category.inEgypt.steps.map((step, i) => (
                  <li key={step.title} className="rounded-2xl bg-cream p-5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-xs font-bold text-cream">
                      {i + 1}
                    </span>
                    <p className="mt-3 font-semibold text-ink">{step.title}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{step.description}</p>
                  </li>
                ))}
              </ol>
            </div>
          </Container>
        </section>
      )}

      {/* Request */}
      <section id="request" className="scroll-mt-24 bg-sand/40 py-16">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
          <Reveal>
            <div className="lg:sticky lg:top-24">
              <h2 className="font-display text-3xl font-semibold text-ink">
                <T>Start the conversation</T>
              </h2>
              <p className="mt-3 leading-relaxed text-ink-soft">
                <T>
                  Nothing is charged here and nothing is confirmed. You will get a reply with the specification, the
                  price and the date it can be ready.
                </T>
              </p>
              <ul className="mt-8 space-y-3 border-t border-black/5 pt-6">
                {category.trust.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed text-ink-soft">
                    <span aria-hidden className="mt-0.5 text-gold-dark">
                      ✦
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="rounded-3xl border border-black/5 bg-cream p-6 shadow-sm sm:p-8">
              <TreasureRequestForm category={category} products={products} />
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Travel notes — oils only, and deliberately promises nothing */}
      {category.slug === "essence-oils" && (
        <section className="py-16">
          <Container className="mx-auto max-w-3xl">
            <div className="rounded-3xl border border-black/10 bg-cream p-8">
              <h2 className="font-display text-2xl font-semibold text-ink">
                <T>Travel notes</T>
              </h2>
              <p className="mt-3 leading-relaxed text-ink-soft">
                <T>
                  Liquids in hand luggage are limited by container size and total volume, and the rules differ by
                  airline, airport and destination. We are not going to tell you that a particular bottle will be fine
                  in a cabin bag, because that is not ours to promise. Check with the airline you are flying, and if
                  there is any doubt, put it in hold luggage.
                </T>
              </p>
              <p className="mt-4 text-sm text-ink-soft/85">
                <T>
                  Verified guidance for the specific bottle sizes we sell will be published here once we have it in
                  writing from the supplier.
                </T>
              </p>
            </div>
          </Container>
        </section>
      )}

      {/* FAQs */}
      <section className="bg-sand-dim py-16">
        <Container className="mx-auto max-w-3xl">
          <h2 className="font-display text-3xl font-semibold text-ink">
            <T>Questions</T>
          </h2>
          <div className="mt-8">
            <FaqAccordion faqs={category.faqs} idPrefix={`treasure-${category.slug}`} />
          </div>
        </Container>
      </section>

      {/* Internal links into the rest of the site */}
      {(relatedTours.length > 0 || relatedPhotoshoots.length > 0 || relatedStories.length > 0) && (
        <section className="py-16">
          <Container>
            <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
              <T>While you are here</T>
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedTours.map((tour) => (
                <TourCard key={tour.slug} tour={tour} />
              ))}
              {relatedPhotoshoots.map((shoot) => (
                <PhotoshootCard key={shoot.slug} photoshoot={shoot} />
              ))}
              {relatedStories.map((story) => (
                <StoryCard key={story.slug} story={story} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* The other three rooms */}
      <section className="bg-sand/40 py-14">
        <Container>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-dark">
            <T>Also in Take Egypt Home</T>
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {treasureCategories
              .filter((c) => c.slug !== category.slug)
              .map((other) => (
                <Link
                  key={other.slug}
                  href={to(`${TREASURES_PATH}/${other.slug}`)}
                  className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-semibold text-ink-soft transition hover:border-gold/40 hover:text-ink"
                >
                  {other.title} →
                </Link>
              ))}
          </div>
        </Container>
      </section>
    </>
  );
}
