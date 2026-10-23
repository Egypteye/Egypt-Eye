import Link from "next/link";

// /os needs its own not-found, because it has its own root layout. Without
// one, a missing booking reference would fall through to the site's 404 and
// render under a layout that expects a locale this segment does not have.

export const metadata = { title: "Not found — Egypt Eye OS", robots: { index: false, follow: false } };

export default function OsNotFound() {
  return (
    <div className="rounded-xl border border-dashed border-black/15 bg-cream px-5 py-12 text-center">
      <p className="text-base font-semibold text-ink">That isn&rsquo;t here.</p>
      <p className="mt-1 text-sm text-ink-soft">
        The booking reference may be wrong, or the booking may have been created under a different one.
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm font-semibold">
        <Link href="/os" className="text-gold-dark underline">
          Today
        </Link>
        <Link href="/os/bookings" className="text-gold-dark underline">
          All bookings
        </Link>
      </div>
    </div>
  );
}
