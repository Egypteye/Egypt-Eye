import type { Metadata } from "next";
import { alternatesFor } from "@/i18n/alternates";
import { getDictionary, getLocale } from "@/i18n/dictionary";
import { Container } from "@/components/Container";
import { getSiteSettings } from "@/sanity/fetchers";
import { T, trAll } from "@/i18n/T";
import { POLICY_UPDATED, policySections } from "@/lib/privacy/policy";

// Indexable on purpose. A real operator's terms and privacy policy are a
// trust signal — for travellers comparing agencies and for Google reading the
// site as a business — and there is nothing private on either page.
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary();
  const meta = dict.pages["/privacy"];
  return {
    title: meta.title,
    description: meta.description,
    alternates: alternatesFor("/privacy", locale),
  };
}

export default async function PrivacyPage() {
  const site = await getSiteSettings();
  const sections = policySections(site.contact, site.legal);

  // Every string on the page in one await. The wording lives in
  // lib/privacy/policy.ts, not here, so a check script can read it without a
  // browser and without `server-only` getting in the way.
  const strings = sections.flatMap((s) => [
    s.title,
    ...s.body,
    ...(s.items ?? []).flatMap((i) => [i.label, i.text]),
  ]);
  const t = await trAll([
    ...strings,
    "Legal",
    "Privacy Policy",
    "In short",
    "We ask for what a booking needs, we never see your card number, we do not sell anything to anyone, and we delete what we no longer need. The detail is below.",
    "Last updated",
  ]);

  return (
    <section className="py-24">
      <Container className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-dark">
          <T>Legal</T>
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-ink sm:text-5xl">
          <T>Privacy Policy</T>
        </h1>
        <p className="mt-3 text-sm text-ink-soft/85">
          {t["Last updated"]} {POLICY_UPDATED}
        </p>

        <div className="mt-8 rounded-2xl border border-gold/30 bg-gold/5 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-dark">
            {t["In short"]}
          </p>
          <p className="mt-2 text-ink-soft">
            {
              t[
                "We ask for what a booking needs, we never see your card number, we do not sell anything to anyone, and we delete what we no longer need. The detail is below."
              ]
            }
          </p>
        </div>

        <div className="mt-12 space-y-12">
          {sections.map((section, i) => (
            <div key={section.title}>
              <h2 className="font-display text-2xl font-semibold text-ink">
                {i + 1}. {t[section.title]}
              </h2>
              <div className="mt-3 space-y-3">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-ink-soft">
                    {t[paragraph]}
                  </p>
                ))}
              </div>
              {section.items && (
                <dl className="mt-5 space-y-4 border-l-2 border-sand pl-5">
                  {section.items.map((item) => (
                    <div key={item.label}>
                      <dt className="font-semibold text-ink">{t[item.label]}</dt>
                      <dd className="mt-1 text-ink-soft">{t[item.text]}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
