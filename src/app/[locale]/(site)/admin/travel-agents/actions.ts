"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/resend";
import { travelAgentApprovedEmail, travelAgentRejectedEmail } from "@/lib/email/templates";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://egypteyetravel.com";

function clampPercent(raw: FormDataEntryValue | null): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 10;
  return Math.min(100, Math.max(0, n));
}

function revalidate(applicationId: string) {
  revalidatePath("/admin/travel-agents");
  revalidatePath(`/admin/travel-agents/${applicationId}`);
}

// Approving does three things: marks the application approved, creates (or
// updates) the linked travel_agents partner row with the chosen discount
// rate, and — if an Egypt Eye account with that email already exists —
// links it immediately. A brand-new account gets linked automatically by
// the handle_new_user() trigger the moment the applicant signs up (see
// 0011_travel_agents.sql), so nothing else needs to happen here for that
// case; the applicant just needs the email below telling them to sign in.
export async function approveApplication(applicationId: string, formData: FormData) {
  await requireAdmin();
  const discountPercent = clampPercent(formData.get("discountPercent"));

  const supabase = createAdminSupabaseClient();
  const { data: application } = await supabase
    .from("travel_agent_applications")
    .select("*")
    .eq("id", applicationId)
    .single();
  if (!application) return;

  await supabase
    .from("travel_agent_applications")
    .update({ status: "approved", reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", applicationId);

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", application.email)
    .maybeSingle();

  await supabase.from("travel_agents").upsert(
    {
      application_id: applicationId,
      user_id: existingProfile?.id ?? null,
      email: application.email,
      company_name: application.company_name,
      contact_name: application.contact_name,
      country: application.country,
      website: application.website,
      phone: application.phone,
      services: application.services,
      partner_discount_percent: discountPercent,
      status: "active",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "application_id" }
  );

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    const { subject, html, text } = travelAgentApprovedEmail({
      contactName: application.contact_name,
      companyName: application.company_name,
      discountPercent,
      loginUrl: `${SITE_URL}/agent-portal`,
    });
    await sendEmail({ to: application.email, subject, html, text });
  }

  revalidate(applicationId);
}

export async function rejectApplication(applicationId: string) {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();
  const { data: application } = await supabase
    .from("travel_agent_applications")
    .select("contact_name, company_name, email")
    .eq("id", applicationId)
    .single();
  if (!application) return;

  await supabase
    .from("travel_agent_applications")
    .update({ status: "rejected", reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", applicationId);

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    const { subject, html, text } = travelAgentRejectedEmail({
      contactName: application.contact_name,
      companyName: application.company_name,
    });
    await sendEmail({ to: application.email, subject, html, text });
  }

  revalidate(applicationId);
}

export async function updateAgentRate(applicationId: string, formData: FormData) {
  await requireAdmin();
  const discountPercent = clampPercent(formData.get("discountPercent"));
  const supabase = createAdminSupabaseClient();
  await supabase
    .from("travel_agents")
    .update({ partner_discount_percent: discountPercent, updated_at: new Date().toISOString() })
    .eq("application_id", applicationId);
  revalidate(applicationId);
}

export async function setAgentStatus(applicationId: string, status: "active" | "suspended") {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();
  await supabase
    .from("travel_agents")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("application_id", applicationId);
  revalidate(applicationId);
}

export async function updateApplicationNotes(applicationId: string, formData: FormData) {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();
  const notes = String(formData.get("adminNotes") ?? "").trim();
  await supabase
    .from("travel_agent_applications")
    .update({ admin_notes: notes || null, updated_at: new Date().toISOString() })
    .eq("id", applicationId);
  revalidatePath(`/admin/travel-agents/${applicationId}`);
}
