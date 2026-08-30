"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { AffiliateStatus } from "./constants";

export async function updateAffiliateStatus(applicationId: string, status: AffiliateStatus) {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();
  await supabase
    .from("affiliate_applications")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", applicationId);
  revalidatePath("/admin/affiliates");
  revalidatePath(`/admin/affiliates/${applicationId}`);
}

export async function updateAffiliateNotes(applicationId: string, formData: FormData) {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();
  const notes = String(formData.get("adminNotes") ?? "").trim();
  await supabase
    .from("affiliate_applications")
    .update({ admin_notes: notes || null, updated_at: new Date().toISOString() })
    .eq("id", applicationId);
  revalidatePath(`/admin/affiliates/${applicationId}`);
}
