"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function setConciergeStatus(requestId: string, status: "sent" | "resolved") {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();
  await supabase.from("concierge_requests").update({ staff_status: status }).eq("id", requestId);
  revalidatePath("/admin/concierge");
}
