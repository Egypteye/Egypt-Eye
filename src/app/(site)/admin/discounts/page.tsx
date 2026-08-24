import { getCampaignStats } from "./stats";
import { createCampaign, toggleCampaignActive, updateCampaign } from "./actions";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { NotConfiguredNotice } from "../NotConfiguredNotice";

export const metadata = { title: "Discount Campaigns", robots: { index: false, follow: false } };

export default async function AdminDiscountsPage() {
  if (!supabaseAdminConfigured) return <NotConfiguredNotice />;
  const stats = await getCampaignStats();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-ink">Discount Campaigns</h1>
        <a
          href="/api/admin/discounts/export"
          className="rounded-full border border-black/10 bg-cream px-4 py-2 text-sm font-semibold text-ink-soft transition hover:border-gold/40 hover:text-ink"
        >
          Export Data (CSV)
        </a>
      </div>

      <div className="flex flex-col gap-6">
        {stats.map((s) => (
          <div key={s.campaign.id} className="rounded-2xl border border-black/5 bg-cream p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-display text-lg font-semibold text-ink">{s.campaign.name}</p>
                <p className="text-sm text-ink-soft/60">
                  {s.campaign.discount_type === "percentage" ? `${s.campaign.value}%` : `$${s.campaign.value}`} off
                  {s.campaign.min_booking_value ? ` · min $${s.campaign.min_booking_value}` : ""}
                </p>
              </div>
              <form action={toggleCampaignActive.bind(null, s.campaign.id, !s.campaign.active)}>
                <button
                  type="submit"
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
                    s.campaign.active ? "bg-nile/10 text-nile" : "bg-black/5 text-ink-soft/60"
                  }`}
                >
                  {s.campaign.active ? "Active — click to pause" : "Paused — click to activate"}
                </button>
              </form>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-black/5 pt-5 sm:grid-cols-5">
              <Stat label="Codes Generated" value={s.codesGenerated} />
              <Stat label="Codes Redeemed" value={s.codesRedeemed} />
              <Stat label="Redemption Rate" value={`${s.redemptionRate}%`} />
              <Stat label="Revenue Generated" value={`$${s.revenueGenerated.toLocaleString()}`} />
              <Stat label="Discount Given" value={`$${s.discountValueGiven.toLocaleString()}`} />
            </dl>

            <details className="mt-5 border-t border-black/5 pt-4">
              <summary className="cursor-pointer text-sm font-semibold text-gold-dark">Edit rules</summary>
              <form action={updateCampaign.bind(null, s.campaign.id)} className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Discount type">
                  <select name="discountType" defaultValue={s.campaign.discount_type} className={inputClass}>
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed amount</option>
                  </select>
                </Field>
                <Field label="Value">
                  <input name="value" type="number" step="0.01" defaultValue={s.campaign.value} className={inputClass} />
                </Field>
                <Field label="Minimum booking value ($)">
                  <input name="minBookingValue" type="number" step="0.01" defaultValue={s.campaign.min_booking_value ?? ""} className={inputClass} />
                </Field>
                <Field label="Maximum discount amount ($)">
                  <input name="maxDiscountAmount" type="number" step="0.01" defaultValue={s.campaign.max_discount_amount ?? ""} className={inputClass} />
                </Field>
                <Field label="Code validity (days after issue)">
                  <input name="codeValidityDays" type="number" defaultValue={s.campaign.code_validity_days ?? ""} className={inputClass} />
                </Field>
                <Field label="Campaign end date">
                  <input name="endsAt" type="date" defaultValue={s.campaign.ends_at?.slice(0, 10) ?? ""} className={inputClass} />
                </Field>
                <Field label="Eligible tour slugs (comma-separated, blank = all)">
                  <input name="eligibleTours" type="text" defaultValue={s.campaign.eligible_tour_slugs?.join(", ") ?? ""} className={inputClass} />
                </Field>
                <Field label="Excluded tour slugs">
                  <input name="excludedTours" type="text" defaultValue={s.campaign.excluded_tour_slugs?.join(", ") ?? ""} className={inputClass} />
                </Field>
                <Field label="Eligible experience slugs (blank = all)">
                  <input name="eligibleExperiences" type="text" defaultValue={s.campaign.eligible_experience_slugs?.join(", ") ?? ""} className={inputClass} />
                </Field>
                <Field label="Excluded experience slugs">
                  <input name="excludedExperiences" type="text" defaultValue={s.campaign.excluded_experience_slugs?.join(", ") ?? ""} className={inputClass} />
                </Field>
                <label className="flex items-center gap-2 text-sm text-ink-soft/70">
                  <input type="checkbox" name="oneTimeUse" defaultChecked={s.campaign.one_time_use} className="h-4 w-4 accent-gold-dark" />
                  One-time use per customer
                </label>
                <label className="flex items-center gap-2 text-sm text-ink-soft/70">
                  <input type="checkbox" name="newCustomersOnly" defaultChecked={s.campaign.new_customers_only} className="h-4 w-4 accent-gold-dark" />
                  New customers only
                </label>
                <button type="submit" className="self-start rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-gold-dark sm:col-span-2">
                  Save Rules
                </button>
              </form>
            </details>
          </div>
        ))}
      </div>

      <details className="rounded-2xl border border-dashed border-black/15 bg-cream/50 p-6">
        <summary className="cursor-pointer font-semibold text-ink">+ Create Campaign</summary>
        <form action={createCampaign} className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <input name="name" required type="text" className={inputClass} />
          </Field>
          <Field label="Slug (unique, e.g. 'summer-sale')">
            <input name="slug" required type="text" className={inputClass} />
          </Field>
          <Field label="Discount type">
            <select name="discountType" defaultValue="percentage" className={inputClass}>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed amount</option>
            </select>
          </Field>
          <Field label="Value">
            <input name="value" type="number" step="0.01" required className={inputClass} />
          </Field>
          <Field label="Minimum booking value ($)">
            <input name="minBookingValue" type="number" step="0.01" className={inputClass} />
          </Field>
          <Field label="Code validity (days)">
            <input name="codeValidityDays" type="number" className={inputClass} />
          </Field>
          <label className="flex items-center gap-2 text-sm text-ink-soft/70">
            <input type="checkbox" name="oneTimeUse" defaultChecked className="h-4 w-4 accent-gold-dark" />
            One-time use
          </label>
          <label className="flex items-center gap-2 text-sm text-ink-soft/70">
            <input type="checkbox" name="active" defaultChecked className="h-4 w-4 accent-gold-dark" />
            Active immediately
          </label>
          <button type="submit" className="self-start rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-gold-dark sm:col-span-2">
            Create Campaign
          </button>
        </form>
      </details>
    </div>
  );
}

const inputClass = "rounded-lg border border-black/10 bg-sand px-3 py-2 text-sm text-ink outline-none focus:border-gold w-full";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-semibold text-ink-soft/70">
      {label}
      {children}
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-lg font-bold text-ink">{value}</p>
      <p className="text-xs text-ink-soft/50">{label}</p>
    </div>
  );
}
