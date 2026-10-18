import type { Metadata } from "next";
import Link from "next/link";
import { alternatesFor } from "@/i18n/alternates";
import { getDictionary, getLocale } from "@/i18n/dictionary";
import { Container } from "@/components/Container";
import { getSiteSettings } from "@/sanity/fetchers";
import { T, trAll } from "@/i18n/T";
import { termsIntro, termsLastUpdated, termsSections } from "@/content/terms";

// Indexable on purpose. A real operator's terms and privacy policy are a
// trust signal — for travellers comparing agencies and for Google reading the
// site as a business — and there is nothing private on either page.
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary();
  const meta = dict.pages["/terms"];
  return {
    title: meta.title,
    description: meta.description,
    alternates: alternatesFor("/terms", locale),
  };
}

export default async function TermsPage() {
  const site = await getSiteSettings();
  const sections = termsSections(site.legal);

  const t = await trAll([
    termsIntro,
    ...sections.flatMap((s) => [
      s.title,
      ...(s.hrefLabel ? [s.hrefLabel] : []),
      ...s.blocks.flatMap((b) => (b.kind === "p" ? [b.text] : b.items)),
    ]),
    "Legal",
    "Terms of Service",
    "Last updated",
  ]);

  return (
    <section className="py-24">
      <Container className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-dark">
          <T>Legal</T>
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-ink sm:text-5xl">
          <T>Terms of Service</T>
        </h1>
        <p className="mt-3 text-sm text-ink-soft/85">
          {t["Last updated"]} {termsLastUpdated}
        </p>
        <p className="mt-6 text-lg leading-relaxed text-ink-soft">{t[termsIntro]}</p>

        <div className="mt-12 space-y-12">
          {sections.map((section, i) => (
            <div key={section.id} id={section.id}>
              <h2 className="font-display text-2xl font-semibold text-ink">
                {i + 1}. {t[section.title]}
              </h2>
              <div className="mt-3 space-y-3">
                {section.blocks.map((block) =>
                  block.kind === "p" ? (
                    <p key={block.text} className="text-ink-soft">
                      {t[block.text]}
                    </p>
                  ) : (
                    <ul key={block.items.join("|")} className="list-disc space-y-2 pl-5 text-ink-soft">
                      {block.items.map((item) => (
                        <li key={item}>{t[item]}</li>
                      ))}
                    </ul>
                  ),
                )}
              </div>
              {section.href && section.hrefLabel && (
                <Link
                  href={section.href}
                  className="mt-4 inline-block text-sm font-semibold text-ink underline underline-offset-4 transition hover:text-gold-dark"
                >
                  {t[section.hrefLabel]}
                </Link>
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
