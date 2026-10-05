import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { paymentProvider, paymentProviderFor } from "@/lib/booking/activeProvider";
import { describeReadiness, liveReadiness, payPalConfig } from "@/lib/booking/paypalConfig";
import { TestButton } from "./TestButton";
import { explainOffer } from "@/lib/booking/quote";
import { depositDiagnostics } from "./deposits";
import { RefreshContentButton } from "./TestButton";

export const metadata = { title: "PayPal", robots: { index: false, follow: false } };

// What PayPal is doing on this deployment, and a button that proves it.
//
// It exists because the person who sets PayPal up does not have a terminal,
// and the alternative was asking them to install Node and clone a repository
// in order to check that two environment variables are correct. Every setting
// that decides whether real money moves is on one screen, in the words the
// decision is actually made in.

export default async function AdminPayPalPage() {
  const user = await getCurrentUser();
  if (user?.role !== "admin") redirect("/admin/reservations");

  // Read fresh from Sanity, never through the hour-long cache every other
  // page uses. A diagnostic that reports what the Studio contained an hour ago
  // is worse than no diagnostic: it tells somebody who just fixed the problem
  // that the problem is still there.
  const diagnostics = await depositDiagnostics();
  const products = diagnostics.rows;
  const siteDefaultUsd = diagnostics.siteDefaultUsd;

  const config = payPalConfig();
  const provider = paymentProvider();
  // What a customer — not an admin — would be offered right now.
  const customerProvider = paymentProviderFor({ isAdmin: false });
  const warnings = liveReadiness(config).filter((warning) => warning !== "sandbox");

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">PayPal</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
          Deposits taken in the booking popup. These settings come from the environment variables on this
          deployment — change them in Vercel, then redeploy, because the product pages are built ahead of time.
        </p>
      </div>

      {!config ? (
        <div className="rounded-2xl border border-black/10 bg-cream p-6">
          <p className="font-semibold text-ink">PayPal is not connected</p>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
            Set <code className="rounded bg-black/5 px-1.5 py-0.5">PAYPAL_CLIENT_ID</code> and{" "}
            <code className="rounded bg-black/5 px-1.5 py-0.5">PAYPAL_CLIENT_SECRET</code> in Vercel and
            redeploy. Until then, bookings fall back to the PayPal payment links set on each product in the
            Studio, and with none of those to a request with no payment. Nothing is broken meanwhile.
          </p>
        </div>
      ) : (
        <>
          {/* The sandbox banner is the loud one: a sandbox deployment takes no
              real money, and anybody reading this screen needs to know that
              before they read anything else on it. */}
          <div
            className={`rounded-2xl border-2 p-5 ${
              config.env === "live" ? "border-emerald-400 bg-emerald-50" : "border-terracotta bg-terracotta/10"
            }`}
          >
            <p className="font-display text-lg font-semibold text-ink">
              {config.env === "live" ? "LIVE — real money" : "SANDBOX — test money only"}
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              {config.env === "live"
                ? "Customers are paying real deposits into your PayPal Business account."
                : "Nothing here moves real money. On a public site the test buttons are shown to signed-in admins only, so you can test the whole booking on the real site while customers carry on with the payment links."}
            </p>
          </div>

          {warnings.length > 0 && (
            <div className="space-y-3">
              {warnings.map((warning) => (
                <div key={warning} className="rounded-2xl border border-terracotta/40 bg-terracotta/10 p-5">
                  <p className="text-sm leading-relaxed text-ink">{describeReadiness(warning)}</p>
                </div>
              ))}
            </div>
          )}

          <dl className="grid gap-px overflow-hidden rounded-2xl border border-black/10 bg-black/10 sm:grid-cols-2">
            <Row label="Environment" value={config.env === "live" ? "Live" : "Sandbox"} />
            <Row
              label="When the money moves"
              value={
                config.intent === "CAPTURE"
                  ? "On payment (CAPTURE). Declining refunds it."
                  : "Held until you confirm (AUTHORIZE). Declining releases it."
              }
            />
            <Row label="Client ID" value={`…${config.clientId.slice(-8)}`} />
            <Row label="Secret" value="Set — never shown" />
            <Row
              label="Webhook"
              value={config.webhookId ? `…${config.webhookId.slice(-8)}` : "NOT SET — every delivery is refused"}
            />
            <Row label="Customers are told" value={provider.moneyMode === "hold" ? "Held, not charged" : "Paid, refunded if we cannot confirm"} />
            <Row
              label="Who sees the PayPal buttons"
              value={customerProvider.enabled ? "Everyone" : "Admins only — customers get the payment links"}
            />
          </dl>

          <div className="rounded-2xl border border-black/10 bg-cream p-6">
            <p className="font-semibold text-ink">Deposits by product</p>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
              Everything with the deposit switch turned on. A product that cannot be quoted shows no booking
              button at all — the reason is below, and it is always something in the Studio.
            </p>
            {products.length === 0 ? (
              <p className="mt-4 text-sm text-ink-soft">
                No product has the deposit switch on yet. Turn on &ldquo;Offer Secure your date&rdquo; on a
                photoshoot or experience in the Studio.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {products.map((row) => (
                  <li
                    key={`${row.slug}`}
                    className={`rounded-xl border p-4 ${
                      row.offer.available ? "border-black/10 bg-white/60" : "border-terracotta/40 bg-terracotta/10"
                    }`}
                  >
                    <p className="text-sm font-semibold text-ink">
                      {row.offer.available ? "✓" : "✗"} {row.title}
                    </p>
                    {row.offer.available ? (
                      <p className="mt-1 text-sm text-ink-soft">
                        {row.offer.headline}
                        {row.offer.perPerson ? " per person" : " per booking"}
                        {row.forThreeCents !== null
                          ? ` · three people would pay $${row.forThreeCents / 100}`
                          : ""}
                      </p>
                    ) : (
                      <p className="mt-1 text-sm text-ink-soft">{explainOffer(row.offer.reason)}</p>
                    )}
                    {/* What was actually read, rather than a conclusion drawn
                        from it. Four rounds of this went "I set it" / "it says
                        not set" with no way to tell which was wrong. */}
                    <p className="mt-2 font-mono text-xs text-ink-soft">
                      read from Sanity: depositUsd={JSON.stringify(row.raw.depositUsd)} · depositBasis=
                      {JSON.stringify(row.raw.depositBasis)} · depositMaxUsd=
                      {JSON.stringify(row.raw.depositMaxUsd)} · bookable={JSON.stringify(row.raw.bookable)}
                      {row.isDraft ? " · UNPUBLISHED DRAFT" : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 rounded-xl border border-black/10 bg-white/60 p-4">
              <p className="text-sm text-ink-soft">
                Read from Sanity&rsquo;s live API — past both the hour-long cache this site uses and
                Sanity&rsquo;s own CDN. This is what the Studio contains right now. The product pages still
                serve the cached copy; press below to refresh them.
              </p>
              {!diagnostics.canSeeDrafts && (
                <p className="mt-2 text-sm text-ink-soft">
                  <strong className="text-ink">This can only see PUBLISHED documents.</strong> Sanity saves your
                  typing as a draft automatically, and a draft is invisible here and to the website. If you set a
                  deposit and this still says it is missing, the likeliest reason by far is that the document was
                  never published — open it in the Studio and look for the{" "}
                  <strong className="text-ink">Publish</strong> button at the bottom. It is only enabled when
                  there are unpublished changes, so if it is greyed out, the document really is as shown above.
                </p>
              )}
              <div className="mt-3">
                <RefreshContentButton />
              </div>
            </div>
            <p className="mt-4 text-xs text-ink-soft">
              Site-wide default deposit: {siteDefaultUsd ? `$${siteDefaultUsd}` : "not set"} (read as{" "}
              {JSON.stringify(diagnostics.rawSiteDefault)}) — used by any product with no amount of its own.
            </p>
          </div>

          <div className="rounded-2xl border border-black/10 bg-cream p-6">
            <p className="font-semibold text-ink">Check it works</p>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
              The first button creates a $1 test order at PayPal and reads it back — nobody approves it, so no
              money moves and it expires on its own. The second proves the guarantees that stop a customer being
              charged twice, using a throwaway booking it deletes afterwards; it never contacts PayPal and never
              sends an email. The third looks for payments PayPal took that nobody told us about. All three are
              safe to press at any time, including on live.
            </p>
            <div className="mt-4">
              <TestButton />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-cream p-4">
      <dt className="text-xs font-semibold uppercase tracking-wider text-ink-soft">{label}</dt>
      <dd className="mt-1 text-sm text-ink">{value}</dd>
    </div>
  );
}
