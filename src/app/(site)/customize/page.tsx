import { Container } from "@/components/Container";
import { SmartImage } from "@/components/SmartImage";
import { SectionHeading } from "@/components/SectionHeading";
import { TrustBar } from "@/components/TrustBar";
import { Reveal } from "@/components/Reveal";
import { CustomizeForm } from "./CustomizeForm";
import { getCustomizePage, getExperiences, getPhotoshoots, getSiteSettings, getTours } from "@/sanity/fetchers";

export const metadata = {
  title: "Customize Your Tour",
  description:
    "Tell us your dates, interests, and pace — we'll design a private Egypt or Jordan itinerary around you.",
};

export default async function CustomizePage() {
  const [tours, experiences, photoshoots, site, page] = await Promise.all([
    getTours(),
    getExperiences(),
    getPhotoshoots(),
    getSiteSettings(),
    getCustomizePage(),
  ]);

  return (
    <>
      <section className="relative">
        <SmartImage image={page.bannerImage.image} tone={page.bannerImage.tone} className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/10" />
        <Container className="relative flex min-h-[42vh] flex-col justify-end gap-3 pb-14 pt-32">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-light">{page.eyebrow}</p>
          <h1 className="max-w-2xl font-display text-4xl font-semibold text-cream sm:text-5xl">{page.headline}</h1>
          <p className="max-w-xl text-cream/80">{page.subtext}</p>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <Reveal>
            <TrustBar tours={tours} experiences={experiences} photoshoots={photoshoots} />
          </Reveal>
        </Container>
      </section>

      <section className="pb-24">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <SectionHeading
              eyebrow={page.formIntroEyebrow}
              title={page.formIntroTitle}
              description={page.formIntroDescription}
            />
            <ol className="mt-8 space-y-6">
              {page.steps.map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/20 text-sm font-bold text-gold-dark">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-ink">{step.title}</p>
                    <p className="text-sm text-ink-soft/70">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <Reveal>
            <CustomizeForm sections={page.formSections} siteSettings={site} />
          </Reveal>
        </Container>
      </section>
    </>
  );
}
