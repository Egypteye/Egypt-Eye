"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/Container";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-5 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-dark">Error</p>
      <h1 className="max-w-lg text-balance font-display text-3xl font-semibold text-ink sm:text-4xl">
        Something went wrong
      </h1>
      <p className="max-w-md text-ink-soft/75">
        We hit an unexpected error loading this page. Please try again, or head back to the homepage.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-4">
        <button
          onClick={reset}
          className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink transition hover:bg-gold-light"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-ink-soft transition hover:bg-sand-dim"
        >
          Back to Home
        </Link>
      </div>
    </Container>
  );
}
