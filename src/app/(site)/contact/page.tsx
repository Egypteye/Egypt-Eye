import { Container } from "@/components/Container";
import { SmartImage } from "@/components/SmartImage";
import { SectionHeading } from "@/components/SectionHeading";
import { getContactPage, getSiteSettings } from "@/sanity/fetchers";

export const metadata = {
  title: "Contact Egypt Eye",
  description:
    "Reach Egypt Eye Travel and Tours via WhatsApp or email for bookings, questions, or urgent support during your trip.",
};

export default async function ContactPage() {
  const [site, page] = await Promise.all([getSiteSettings(), getContactPage()]);

  return (
    <>
      <section className="relative">
        <SmartImage image={page.heroImage.image} tone={page.heroImage.tone} className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/10" />
        <Container className="relative flex min-h-[34vh] flex-col justify-end gap-3 pb-14 pt-32">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-light">
            {page.heroEyebrow}
          </p>
          <h1 className="max-w-2xl font-display text-4xl font-semibold text-cream sm:text-5xl">
            {page.heroHeadline}
          </h1>
        </Container>
      </section>

      <section className="py-16">
        <Container className="grid gap-8 sm:grid-cols-3">
          <a
            href={site.contact.whatsappLink}
            target="_blank"
            className="rounded-2xl border border-black/5 bg-cream p-8 shadow-sm transition hover:border-gold/30 hover:shadow-lg hover:shadow-black/5"
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
              WhatsApp
            </p>
            <p className="mt-2 font-display text-xl font-semibold text-ink">
              {site.contact.whatsapp}
            </p>
            <p className="mt-1 text-sm text-ink-soft/70">{page.whatsappCardDescription}</p>
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
            <p className="mt-1 text-sm text-ink-soft/70">{page.emailCardDescription}</p>
          </a>

          <div className="rounded-2xl border border-black/5 bg-cream p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
              Urgent Booking
            </p>
            <p className="mt-2 font-display text-xl font-semibold text-ink">
              {site.contact.urgentBooking}
            </p>
            <p className="mt-1 text-sm text-ink-soft/70">{page.urgentCardDescription}</p>
          </div>
        </Container>
      </section>

      <section className="bg-sand-dim py-16">
        <Container>
          <SectionHeading eyebrow={page.policiesEyebrow} title={page.policiesTitle} />
          <div className="mt-10 grid gap-8 sm:grid-cols-2">
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
        </Container>
      </section>
    </>
  );
}
