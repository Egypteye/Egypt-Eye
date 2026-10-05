import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { paymentProvider } from "@/lib/booking/activeProvider";
import { describeReadiness, liveReadiness, payPalConfig } from "@/lib/booking/paypalConfig";
import { TestButton } from "./TestButton";

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

  const config = payPalConfig();
  const provider = paymentProvider();
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
                : "Nothing here moves real money. Customers would see a red TEST MODE panel in the booking popup."}
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
          </dl>

          <div className="rounded-2xl border border-black/10 bg-cream p-6">
            <p className="font-semibold text-ink">Check it works</p>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
              This creates a $1 test order and reads it back. Nobody approves it, so no money moves and it
              expires on its own. Safe to press at any time, including on live.
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
