import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";

export const metadata: Metadata = {
  title: "Subscription Confirmed",
  robots: { index: false, follow: true },
};

export default async function NewsletterConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  return (
    <section className="bg-sand py-20 sm:py-28">
      <Container className="mx-auto max-w-lg text-center">
        {status === "ok" ? (
          <>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold-dark">Subscribed</p>
            <h1 className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">You&rsquo;re confirmed 🇪🇬</h1>
            <p className="mt-4 text-ink-soft/80">
              Check your inbox — we&rsquo;ve just sent your unique 4% off code, ready whenever you&rsquo;re ready to plan
              your Egypt journey.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link href="/explore-egypt" className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition hover:bg-gold-dark">
                Plan My Egypt
              </Link>
              <Link href="/account/signup" className="rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition hover:bg-ink hover:text-cream">
                Create My Account
              </Link>
            </div>
          </>
        ) : status === "unsubscribed" ? (
          <>
            <h1 className="font-display text-3xl font-semibold text-ink">You&rsquo;re unsubscribed</h1>
            <p className="mt-4 text-ink-soft/80">
              This email is currently unsubscribed from Egypt Eye emails. Want back in?{" "}
              <Link href="/#newsletter" className="font-semibold text-gold-dark underline">
                Subscribe again
              </Link>
              .
            </p>
          </>
        ) : (
          <>
            <h1 className="font-display text-3xl font-semibold text-ink">That link isn&rsquo;t valid</h1>
            <p className="mt-4 text-ink-soft/80">
              This confirmation link is invalid or has already been used. If you&rsquo;re trying to subscribe,{" "}
              <Link href="/#newsletter" className="font-semibold text-gold-dark underline">
                try again here
              </Link>
              .
            </p>
          </>
        )}
      </Container>
    </section>
  );
}
