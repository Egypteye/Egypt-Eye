import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Reveal } from "@/components/Reveal";
import { SmartImage } from "@/components/SmartImage";
import {
  SHOPPING_TOURS_PATH,
  shoppingAreas,
  shoppingToursPage,
} from "@/content/shoppingTours";
import { TREASURES_PATH } from "@/content/treasures";
import { breadcrumbJsonLd, resolveMetadata } from "@/content/seo";
import { jsonLdScript } from "@/content/jsonLd";
import { alternatesFor } from "@/i18n/alternates";
import { getLocale } from "@/i18n/dictionary";
import { localePath } from "@/i18n/locales";
import { T } from "@/i18n/T";

// The shopping-tour landing page.
//
// It describes two real quarters of Cairo and what is made in them, and it
// does NOT describe a product, because there is not a confirmed one yet. No
// itinerary, no duration, no price, no inclusions, no pickup, no partner
// workshops — see the header of src/content/shoppingTours.ts for why.
//
// When an area's `confirmed` flag goes true, the detail it carries appears
// here. Until then the page is honest about being a conversation rather than
// a booking, and the action is an enquiry rather than a checkout.

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    ...resolveMetadata({
      title: shoppingToursPage.title,
      description: shoppingToursPage.intro,
      seo: shoppingToursPage.seo,
      path: SHOPPING_TOURS_PATH,
      locale,
    }),
    alternates: alternatesFor(SHOPPING_TOURS_PATH, locale),
  };
}

export default async function ShoppingToursPage() {
  const locale = await getLocale();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(breadcrumbJsonLd([{ name: "Shopping Tours", path: SHOPPING_TOURS_PATH }])),
        }}
      />

      <section className="border-b border-black/5 bg-sand/40 py-16 lg:py-20">
        <Container className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-dark">
              {shoppingToursPage.eyebrow}
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold text-ink sm:text-5xl">
              {shoppingToursPage.title}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft">{shoppingToursPage.intro}</p>
          </Reveal>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="grid gap-8 lg:grid-cols-2">
            {shoppingAreas.map((area, i) => (
              <Reveal key={area.slug} delay={i * 80}>
                <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-black/5 bg-cream shadow-sm">
                  <div className="relative aspect-[16/9]">
                    <SmartImage
                      image={area.image}
                      tone={area.imageTone}
                      alt={area.imageAlt ?? area.name}
                      label={area.name}
                      className="h-full w-full"
                      sizes="(min-width: 1024px) 50vw, 100vw"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-7">
                    <h2 className="font-display text-2xl font-semibold text-ink">{area.name}</h2>
                    <p className="mt-3 leading-relaxed text-ink-soft">{area.about}</p>

                    <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark">
                      <T>Known for</T>
                    </p>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {area.knownFor.map((craft) => (
                        <li
                          key={craft}
                          className="rounded-full border border-black/10 px-3 py-1 text-sm text-ink-soft"
                        >
                          {craft}
                        </li>
                      ))}
                    </ul>

                    {/* Only shown once there is something real behind it. */}
                    {area.confirmed ? (
                      <div className="mt-5 space-y-2 border-t border-black/5 pt-5 text-sm">
                        {area.duration && (
                          <p className="text-ink-soft">
                            <span className="font-semibold text-ink">Duration</span> · {area.duration}
                          </p>
                        )}
                        {area.pickup && (
                          <p className="text-ink-soft">
                            <span className="font-semibold text-ink">Pickup</span> · {area.pickup}
                          </p>
                        )}
                        {area.included && area.included.length > 0 && (
                          <ul className="mt-2 space-y-1 text-ink-soft">
                            {area.included.map((item) => (
                              <li key={item}>· {item}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <p className="mt-5 border-t border-black/5 pt-5 text-sm leading-relaxed text-ink-soft/85">
                        <T>
                          The route is built around what you actually want to buy, so the length of the day, what
                          it costs and how we collect you are settled in the conversation rather than fixed here.
                        </T>
                      </p>
                    )}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-black/5 bg-sand-dim py-16">
        <Container className="mx-auto max-w-3xl space-y-10">
          {shoppingToursPage.body.map((block) => (
            <Reveal key={block.title}>
              <h2 className="font-display text-2xl font-semibold text-ink">{block.title}</h2>
              <p className="mt-3 leading-relaxed text-ink-soft">{block.body}</p>
            </Reveal>
          ))}
        </Container>
      </section>

      <section className="py-16">
        <Container className="mx-auto max-w-2xl text-center">
          <Reveal>
            <h2 className="font-display text-3xl font-semibold text-ink">
              <T>Tell us what you are after</T>
            </h2>
            <p className="mt-3 leading-relaxed text-ink-soft">
              <T>
                Oils, copper, cotton, a cartouche, or no idea yet — say so and we will tell you which quarter is
                worth the day and what it realistically involves. Nothing is charged for asking.
              </T>
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={localePath("/customize", locale)}
                className="rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-ink shadow-md shadow-gold/25 transition hover:bg-gold-light"
              >
                <T>Ask about a shopping day</T>
              </Link>
              <Link
                href={localePath(TREASURES_PATH, locale)}
                className="rounded-full border border-black/10 px-7 py-3.5 text-sm font-semibold text-ink-soft transition hover:border-gold/30 hover:text-ink"
              >
                <T>Browse the Boutique instead</T>
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
