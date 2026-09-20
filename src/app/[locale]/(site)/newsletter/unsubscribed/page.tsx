import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { T, trAll } from "@/i18n/T";

export async function generateMetadata(): Promise<Metadata> {
  const ui = await trAll(["Unsubscribed"]);
  return {
    title: ui["Unsubscribed"],
    robots: { index: false, follow: true },
  };
}

export default async function NewsletterUnsubscribedPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const ui = await trAll([
    "You've been unsubscribed",
    "That link isn't valid",
    "You won't receive any more Egypt Eye marketing emails. You can still log in to your account any time — this only affects marketing emails, not your account or reservation details.",
    "This unsubscribe link is invalid or has already been used.",
  ]);

  return (
    <section className="bg-sand py-20 sm:py-28">
      <Container className="mx-auto max-w-lg text-center">
        <h1 className="font-display text-3xl font-semibold text-ink">
          {status === "ok" ? ui["You've been unsubscribed"] : ui["That link isn't valid"]}
        </h1>
        <p className="mt-4 text-ink-soft/80">
          {status === "ok"
            ? ui["You won't receive any more Egypt Eye marketing emails. You can still log in to your account any time — this only affects marketing emails, not your account or reservation details."]
            : ui["This unsubscribe link is invalid or has already been used."]}
        </p>
        <Link href="/" className="mt-8 inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition hover:bg-gold-dark"><T>Back to Egypt Eye</T></Link>
      </Container>
    </section>
  );
}
