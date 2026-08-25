import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/Container";
import { SmartImage } from "@/components/SmartImage";
import { SectionHeading } from "@/components/SectionHeading";
import { TestimonialCard } from "@/components/TestimonialCard";
import { getAboutPage, getContactPage, getSiteSettings, getTestimonials } from "@/sanity/fetchers";

export const metadata = {
  title: "About & Contact — Egypt Eye Travel and Tours",
  description:
    "We show you Egypt, take care of you, customize the trip, and professionally capture it — tour operator, experience company, and photography studio in one. Reach us via WhatsApp or email.",
};

export default async function AboutPage() {
  const [site, page, contact, testimonials] = await Promise.all([
    getSiteSettings(),
    getAboutPage(),
    getContactPage(),
    getTestimonials(),
  ]);
  const featuredTestimonials = testimonials.slice(0, 6);

  return (
    <>
      <section className="relative">
        <SmartImage image={page.heroImage.image} tone={page.heroImage.tone} className="absolute inset-0" priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/10" />
        <Container className="relative flex min-h-[38vh] flex-col justify-end gap-3 pb-14 pt-32">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-light">
            {page.heroEyebrow}
          </p>
          <h1 className="max-w-2xl font-display text-4xl font-semibold text-cream sm:text-5xl">
            {page.heroHeadline}
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
              eyebrow={page.storyEyebrow}
              title={page.storyTitle}
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
              eyebrow={page.whatWeDoEyebrow}
              title={page.whatWeDoTitle}
              align="center"
              description={page.whatWeDoDescription}
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
              eyebrow={page.teamEyebrow}
              title={page.teamTitle}
              align="center"
              description={page.teamDescription}
            />
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {page.teamMembers.map((name) => (
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

      {/* Contact — folded in here rather than a separate /contact page. */}
      <section id="contact" className="bg-sand-dim py-20">
        <Container>
          <SectionHeading eyebrow={contact.heroEyebrow} title="Get in Touch" align="center" />
          <div className="mx-auto mt-10 grid max-w-3xl gap-8 sm:grid-cols-2">
            <a
              href={site.contact.whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-black/5 bg-cream p-8 shadow-sm transition hover:border-gold/30 hover:shadow-lg hover:shadow-black/5"
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
                WhatsApp
              </p>
              <p className="mt-2 font-display text-xl font-semibold text-ink">
                {site.contact.whatsapp}
              </p>
              <p className="mt-1 text-sm text-ink-soft/70">{contact.whatsappCardDescription}</p>
            </a>

            <a
              href={`mailto:${site.contact.email}`}
              className="rounded-2xl border border-black/5 bg-cream p-8 shadow-sm transition hover:border-gold/30 hover:shadow-lg hover:shadow-black/5"
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
                Email
              </p>
              <p className="mt-2 font-display text-xl font-semibold text-ink">
                {site.contact.email}
              </p>
              <p className="mt-1 text-sm text-ink-soft/70">{contact.emailCardDescription}</p>
            </a>
          </div>

          <div className="mt-16">
            <SectionHeading eyebrow={contact.policiesEyebrow} title={contact.policiesTitle} align="center" />
            <div className="mx-auto mt-10 grid max-w-3xl gap-8 sm:grid-cols-2">
              <div className="rounded-2xl bg-cream p-6 shadow-sm">
                <p className="font-display text-lg font-semibold text-ink">Deposit &amp; Payment</p>
                <p className="mt-2 text-sm text-ink-soft/75">{site.policies.deposit}</p>
                <p className="mt-2 text-sm text-ink-soft/75">{site.policies.currency}</p>
              </div>
              <div className="rounded-2xl bg-cream p-6 shadow-sm">
                <p className="font-display text-lg font-semibold text-ink">Children&rsquo;s Pricing</p>
                <ul className="mt-2 space-y-1 text-sm text-ink-soft/75">
                  {site.policies.children.map((c) => (
                    <li key={c.age}>
                      <span className="font-medium text-ink">{c.age}:</span> {c.price}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-ink-soft/60">{site.policies.childrenNote}</p>
              </div>
              <div className="rounded-2xl bg-cream p-6 shadow-sm">
                <p className="font-display text-lg font-semibold text-ink">Your Voucher</p>
                <p className="mt-2 text-sm text-ink-soft/75">{site.policies.voucher}</p>
              </div>
              <div className="rounded-2xl bg-cream p-6 shadow-sm">
                <p className="font-display text-lg font-semibold text-ink">Cancellation Policy</p>
                <p className="mt-2 text-sm text-ink-soft/75">{site.policies.cancellation}</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Testimonials — only shown once real, collected reviews exist in the
          CMS. A short teaser here, with a link through to the full page. */}
      {featuredTestimonials.length > 0 && (
        <section className="bg-sand-dim py-20">
          <Container>
            <SectionHeading
              eyebrow="Traveler Stories"
              title="What Our Travelers Say"
              description="Real words from real trips — a small sample of what's waiting for you on the full page."
              align="center"
            />
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredTestimonials.map((t, i) => (
                <TestimonialCard key={`${t.name}-${i}`} testimonial={t} />
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                href="/testimonials"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-cream transition hover:bg-gold-dark"
              >
                Read All Reviews
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M7 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
