/**
 * Validating a campaign enquiry, away from the route.
 *
 * Pure and free of `server-only` for the usual reason (CLAUDE.md §6): the
 * route imports Supabase, Resend and Sanity, which would put these rules out
 * of reach of a check script. scripts/check-campaign.mts executes them.
 *
 * THE RULE THIS FILE EXISTS FOR. The package is not free text. A visitor can
 * only ever enquire about one of the four packages in the campaign config, and
 * the name, dates and duration that reach the team are looked up from that
 * config rather than taken from the request body. Otherwise the one number a
 * submission carries — which journey they want — is whatever the client typed,
 * and a quote gets written against an itinerary nobody is running.
 */

import { PACKAGES, PARTY_DATE, campaignDate, packageDateRange } from "@/content/shakiraCampaign";

export type CampaignEnquiryInput = {
  packageId?: unknown;
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  travellers?: unknown;
  notes?: unknown;
};

export type CampaignEnquiryResolved = {
  packageId: string;
  packageName: string;
  packageDates: string;
  packageDuration: string;
  partyDate: string;
  name: string;
  email: string;
  phone: string;
  travellers: string;
  notes?: string;
};

export type CampaignEnquiryResult =
  | { ok: true; value: CampaignEnquiryResolved }
  | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function validateCampaignEnquiry(input: CampaignEnquiryInput): CampaignEnquiryResult {
  const packageId = clean(input.packageId, 60);
  const pkg = PACKAGES.find((p) => p.id === packageId);
  // Looked up, never trusted. An unknown id is refused rather than passed
  // through as a package name of its own.
  if (!pkg) return { ok: false, error: "Choose one of the campaign experiences." };

  const name = clean(input.name, 200);
  if (!name) return { ok: false, error: "Please tell us your name." };

  const email = clean(input.email, 200);
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Please give us a valid email address." };

  const phone = clean(input.phone, 60);
  if (!phone) return { ok: false, error: "Please give us a WhatsApp number." };

  const travellers = clean(input.travellers, 60);
  if (!travellers) return { ok: false, error: "Please tell us how many are travelling." };

  const notes = clean(input.notes, 2000);

  return {
    ok: true,
    value: {
      packageId: pkg.id,
      packageName: pkg.name,
      packageDates: `${packageDateRange(pkg)} 2026`,
      packageDuration: `${pkg.durationDays} day${pkg.durationDays === 1 ? "" : "s"}`,
      partyDate: `${campaignDate(PARTY_DATE)} 2026`,
      name,
      email,
      phone,
      travellers,
      notes: notes || undefined,
    },
  };
}
