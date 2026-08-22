import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { SmartImage } from "@/components/SmartImage";
import { Rating } from "@/components/Rating";
import { PriceTag } from "@/components/PriceTag";
import { Gallery } from "@/components/Gallery";
import { getExperienceBySlug, getExperiences, getSiteSettings } from "@/sanity/fetchers";
import { breadcrumbJsonLd, resolveMetadata } from "@/content/seo";

export async function generateStaticParams() {
  const experiences = await getExperiences();
  return experiences.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const experience = await getExperienceBySlug(slug);
  if (!experience) return {};
  return resolveMetadata({
    title: experience.title,
    description: experience.description,
    seo: experience.seo,
    image: experience.image,
    path: `/experiences/${experience.slug}`,
  });
}

export default async function ExperienceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [experience, site] = await Promise.all([getExperienceBySlug(slug), getSiteSettings()]);
  if (!experience) notFound();

  const breadcrumbs = breadcrumbJsonLd([
    { name: "Extra Experiences", path: "/experiences" },
    { name: experience.title, path: `/experiences/${experience.slug}` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <section className="py-14">
      <Container className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <SmartImage
            image={experience.image}
            tone={experience.imageTone}
            alt={experience.title}
            label={experience.duration}
            className="aspect-[16/10] w-full rounded-2xl"
          />
          <h1 className="mt-8 font-display text-3xl font-semibold text-ink sm:text-4xl">
            {experience.title}
          </h1>
          <div className="mt-3">
            <Rating rating={experience.rating} />
          </div>
          <p className="mt-5 leading-relaxed text-ink-soft/80">
            {experience.description}
          </p>

          <div className="mt-8">
            <h2 className="font-display text-xl font-semibold text-ink">
              Included
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-ink-soft/80">
              {experience.included.map((i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-nile">✓</span>
                  {i}
                </li>
              ))}
            </ul>
          </div>

          {experience.gallery && experience.gallery.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-xl font-semibold text-ink">Gallery</h2>
              <div className="mt-4">
                <Gallery images={experience.gallery} alt={experience.title} />
              </div>
            </div>
          )}

          {experience.relatedTours && experience.relatedTours.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-xl font-semibold text-ink">Available On</h2>
              <p className="mt-2 text-sm text-ink-soft/70">Tours this experience pairs naturally with.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {experience.relatedTours.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/tours/${t.slug}`}
                    className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-ink-soft transition hover:border-gold/40 hover:text-ink"
                  >
                    {t.title} →
                  </Link>
                ))}
              </div>
            </div>
          )}

          <Link
            href="/experiences"
            className="mt-10 inline-block text-sm font-semibold text-gold-dark hover:underline"
          >
            ← Back to all experiences
          </Link>
        </div>

        <aside className="h-fit rounded-2xl border border-black/5 bg-cream p-6 shadow-sm lg:sticky lg:top-24">
          <PriceTag price={experience.price} />
          <p className="mt-1 text-xs text-ink-soft/60">per person</p>
          <a
            href={site.contact.whatsappLink}
            target="_blank"
            className="mt-5 block w-full rounded-full bg-ink py-3 text-center text-sm font-semibold text-cream transition hover:bg-gold-dark"
          >
            Book on WhatsApp
          </a>
          <a
            href={`mailto:${site.contact.email}?subject=${encodeURIComponent(
              "Enquiry: " + experience.title
            )}`}
            className="mt-3 block w-full rounded-full border border-black/10 py-3 text-center text-sm font-semibold text-ink-soft transition hover:bg-sand-dim"
          >
            Email an Enquiry
          </a>
        </aside>
      </Container>
      </section>
    </>
  );
}
