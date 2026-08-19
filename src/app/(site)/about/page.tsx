import Image from "next/image";
import { Container } from "@/components/Container";
import { PlaceholderImage } from "@/components/PlaceholderImage";
import { SectionHeading } from "@/components/SectionHeading";
import { site } from "@/content/site";

export const metadata = {
  title: "About Us",
  description: site.positioning,
};

const team = [
  "Fady",
  "Beshoy",
  "Jonathan",
  "Marco",
  "Yousif",
  "Michael",
  "Mena",
  "Tommy",
  "David",
  "Mark",
  "Bavly",
  "George",
  "Bahi",
];

export default function AboutPage() {
  return (
    <>
      <section className="relative">
        <PlaceholderImage tone="giza" className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/10" />
        <Container className="relative flex min-h-[38vh] flex-col justify-end gap-3 pb-14 pt-32">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-light">
            About Us
          </p>
          <h1 className="max-w-2xl font-display text-4xl font-semibold text-cream sm:text-5xl">
            More Than a Travel Agency
          </h1>
        </Container>
      </section>

      <section className="py-20">
        <Container className="grid gap-16">
          <div className="mx-auto max-w-3xl text-center">
            <Image
              src="/brand/egypt-eye-badge-gold.png"
              alt="Egypt Eye seal"
              width={120}
              height={120}
              className="mx-auto mb-6"
            />
            <SectionHeading
              eyebrow="Our Story"
              title="We turn a trip to Egypt into a personalized, memorable experience"
              description={site.description}
              align="center"
            />
          </div>

          <div className="mx-auto max-w-3xl rounded-2xl bg-ink px-8 py-10 text-center">
            <p className="font-display text-xl leading-relaxed text-cream sm:text-2xl">
              &ldquo;{site.positioning}&rdquo;
            </p>
          </div>

          <div>
            <SectionHeading
              eyebrow="What We Do"
              title="Travel + Photography + Personalization + Hospitality"
              align="center"
              description="Four pillars, one team, delivered on every single trip — whether it's a two-hour photoshoot or a ten-day private journey."
            />
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {site.pillars.map((p) => (
                <div key={p.title} className="rounded-2xl border border-black/5 bg-cream p-6 text-center shadow-sm">
                  <p className="font-display text-lg font-semibold text-ink">{p.title}</p>
                  <p className="mt-2 text-sm text-ink-soft/70">{p.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionHeading
              eyebrow="Meet the Team"
              title="The people behind your trip"
              align="center"
              description="Our travelers consistently mention the team by name — friendly, safe, flexible, and always reachable. Here are a few of the faces you might meet."
            />
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {team.map((name) => (
                <span
                  key={name}
                  className="rounded-full bg-sand-dim px-4 py-2 text-sm font-medium text-ink-soft"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
