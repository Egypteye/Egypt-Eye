import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { PlaceholderImage } from "@/components/PlaceholderImage";
import { FaqAccordion } from "@/components/FaqAccordion";
import { TransferBookingForm } from "./TransferBookingForm";
import { transfersPage } from "@/content/transfers";

export const metadata: Metadata = {
  title: "Private Transfers in Cairo & Giza",
  description:
    "Book a private airport, hotel, or intercity transfer in Cairo and Giza — choose your vehicle, see the price instantly, or request a quote for anything unusual.",
};

export default function TransfersPage() {
  const page = transfersPage;

  return (
    <>
      <section className="relative">
        <PlaceholderImage tone="nile" className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/10" />
        <Container className="relative flex min-h-[38vh] flex-col justify-end gap-3 pb-14 pt-32">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-light">{page.heroEyebrow}</p>
          <h1 className="max-w-2xl font-display text-4xl font-semibold text-cream sm:text-5xl">{page.heroTitle}</h1>
          <p className="max-w-xl text-[15px] text-cream/80">{page.heroDescription}</p>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <SectionHeading
            eyebrow="Book a Transfer"
            title="Get a price in a few clicks"
            description="Most Cairo & Giza routes, plus Alexandria, Ain Sokhna, and Fayoum, price instantly. Anything else, we'll quote by email."
          />
          <div className="mx-auto mt-10 max-w-4xl">
            <TransferBookingForm />
          </div>
        </Container>
      </section>

      <section className="bg-sand-dim py-20">
        <Container className="mx-auto max-w-3xl">
          <SectionHeading eyebrow="Every Transfer Includes" title="What's Taken Care Of" align="center" />
          <ul className="mx-auto mt-10 grid max-w-xl gap-3 sm:grid-cols-2">
            {page.included.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-ink-soft/80">
                <span aria-hidden="true" className="mt-1 text-gold-dark">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="py-20">
        <Container className="mx-auto max-w-3xl">
          <SectionHeading eyebrow="Good to Know" title="Transfer Questions" align="center" />
          <div className="mt-10">
            <FaqAccordion faqs={[...page.faqs]} />
          </div>
        </Container>
      </section>
    </>
  );
}
