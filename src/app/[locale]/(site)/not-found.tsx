import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { T, trAll } from "@/i18n/T";

export async function generateMetadata(): Promise<Metadata> {
  const ui = await trAll(["Page Not Found"]);
  return {
    title: ui["Page Not Found"],
    robots: { index: false, follow: true },
  };
}

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-5 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-dark">404</p>
      <h1 className="max-w-lg text-balance font-display text-3xl font-semibold text-ink sm:text-4xl"><T>We couldn’t find that page</T></h1>
      <p className="max-w-md text-ink-soft/75"><T>The page you were looking for may have moved or no longer exists. Here are a few places to start instead.</T></p>
      <div className="mt-2 flex flex-wrap justify-center gap-4">
        <Link
          href="/"
          className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink transition hover:bg-gold-light"><T>Back to Home</T></Link>
        <Link
          href="/tours"
          className="rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-ink-soft transition hover:bg-sand-dim"><T>Browse Tours</T></Link>
        <Link
          href="/about#contact"
          className="rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-ink-soft transition hover:bg-sand-dim"><T>Contact Us</T></Link>
      </div>
    </Container>
  );
}
