import type { Metadata } from "next";
import Link from "next/link";
import { alternatesFor } from "@/i18n/alternates";
import { getDictionary, getLocale } from "@/i18n/dictionary";
import { localePath } from "@/i18n/locales";
import { Container } from "@/components/Container";
import { getSiteSettings } from "@/sanity/fetchers";
import { T, trAll } from "@/i18n/T";
import {
  cancellationIntro,
  cancellationLastUpdated,
  cancellationPolicyStrings,
  cancellationSections,
} from "@/content/cancellationPolicy";

// Indexable on purpose, like /privacy and /terms: a published cancellation
// policy is a trust signal for travellers comparing operators, and it is the
// page every other surface links to when it says "see the full policy".
//
// Unlike those two, this page is NOT a draft scaffold — it carries real,
// binding terms, so it deliberately has no "draft structure" banner.
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary();
  const meta = dict.pages["/cancellation-policy"];
  return {
    title: meta.title,
    description: meta.description,
    alternates: alternatesFor("/cancellation-policy", locale),
  };
}

export default async function CancellationPolicyPage() {
  const locale = await getLocale();
  const site = await getSiteSettings();
  const to = (path: string) => localePath(path, locale);

  // One hoisted call covering the policy body plus this page's own chrome —
  // `await tr()` inside the .map() below would not translate.
  const ui = await trAll([
    ...cancellationPolicyStrings,
    "Last updated",
    "Questions about a booking? Contact us at",
  ]);

  return (
    <section className="py-24">
      <Container className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-dark">
          <T>Booking Terms</T>
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-ink sm:text-5xl">
          <T>Cancellation Policy</T>
        </h1>

        <p className="mt-6 text-base leading-relaxed text-ink-soft/80">{ui[cancellationIntro]}</p>

        <p className="mt-4 text-xs uppercase tracking-[0.2em] text-ink-soft/50">
          {ui["Last updated"]}{" "}
          <time dateTime={cancellationLastUpdated}>{cancellationLastUpdated}</time>
        </p>

        <ol className="mt-12 space-y-10">
          {cancellationSections.map((section, i) => (
            <li key={section.id} id={section.id} className="scroll-mt-28">
              <h2 className="font-display text-xl font-semibold text-ink">
                {i + 1}. {ui[section.title]}
              </h2>
              <div className="mt-3 space-y-3">
                {section.blocks.map((block, bi) =>
                  block.kind === "p" ? (
                    <p key={bi} className="text-sm leading-relaxed text-ink-soft/80">
                      {ui[block.text]}
                    </p>
                  ) : (
                    <ul key={bi} className="ml-5 list-disc space-y-1.5 text-sm leading-relaxed text-ink-soft/80 marker:text-gold-dark">
                      {block.items.map((item) => (
                        <li key={item}>{ui[item]}</li>
                      ))}
                    </ul>
                  )
                )}
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-14 rounded-[1.75rem] bg-sand-deep/45 p-1.5 ring-1 ring-black/[0.06]">
          <div className="rounded-[1.375rem] bg-cream px-6 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
            <p className="text-sm text-ink-soft/75">
              {ui["Questions about a booking? Contact us at"]}{" "}
              <a href={`mailto:${site.contact.email}`} className="font-medium text-ink underline underline-offset-2">
                {site.contact.email}
              </a>
              .
            </p>
            <p className="mt-3 text-sm text-ink-soft/60">
              <Link href={to("/terms")} className="underline underline-offset-2 hover:text-ink">
                <T>Terms of Service</T>
              </Link>
              {" · "}
              <Link href={to("/privacy")} className="underline underline-offset-2 hover:text-ink">
                <T>Privacy Policy</T>
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
