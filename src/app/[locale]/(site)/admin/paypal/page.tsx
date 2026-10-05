import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { paymentProvider, paymentProviderFor } from "@/lib/booking/activeProvider";
import { describeReadiness, liveReadiness, payPalConfig } from "@/lib/booking/paypalConfig";
import { TestButton } from "./TestButton";
import { getExperiences, getPhotoshoots, getSiteSettings } from "@/sanity/fetchers";
import { depositOffer, explainOffer, quoteDeposit } from "@/lib/booking/quote";

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

  // Every product somebody has switched on, and whether a deposit can
  // actually be calculated for it.
  //
  // This exists because of a loop that cost an afternoon: a deposit was
  // changed in the Studio, the button quietly became "Request your date", and
  // the only way to find out why was to read the code. The rules now live in
  // one function, so the one function can simply say what it decided.
  const [photoshoots, experiences, settings] = await Promise.all([
    getPhotoshoots(),
    getExperiences(),
    getSiteSettings(),
  ]);
  const products = [
    ...photoshoots.map((p) => ({ kind: "photoshoot" as const, product: p })),
    ...experiences.map((p) => ({ kind: "experience" as const, product: p })),
  ]
    .filter(({ product }) => product.bookable === true)
    .map(({ kind, product }) => {
      const offer = depositOffer(product, kind, settings.defaultDepositUsd);
      const three = quoteDeposit(product, kind, { people: 3, extraLabels: [] }, settings.defaultDepositUsd);
      return {
        title: product.title,
        slug: product.slug,
        offer,
        forThree: three.ok ? three.quote.totalCents : null,
      };
    });

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
                        {row.forThree !== null
                          ? ` · three people would pay $${row.forThree / 100}`
                          : ""}
                      </p>
                    ) : (
                      <p className="mt-1 text-sm text-ink-soft">{explainOffer(row.offer.reason)}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 text-xs text-ink-soft">
              Site-wide default deposit:{" "}
              {settings.defaultDepositUsd ? `$${settings.defaultDepositUsd}` : "not set"} — used by any product
              with no amount of its own.
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
