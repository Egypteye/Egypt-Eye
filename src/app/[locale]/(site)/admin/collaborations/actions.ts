"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { CollaborationStatus } from "./constants";

export async function updateCollaborationStatus(applicationId: string, status: CollaborationStatus) {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();
  await supabase
    .from("collaboration_applications")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", applicationId);
  revalidatePath("/admin/collaborations");
  revalidatePath(`/admin/collaborations/${applicationId}`);
}

export async function updateCollaborationNotes(applicationId: string, formData: FormData) {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();
  const notes = String(formData.get("adminNotes") ?? "").trim();
  await supabase
    .from("collaboration_applications")
    .update({ admin_notes: notes || null, updated_at: new Date().toISOString() })
    .eq("id", applicationId);
  revalidatePath(`/admin/collaborations/${applicationId}`);
}
