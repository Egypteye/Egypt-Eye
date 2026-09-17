"use server";

import { revalidatePath } from "next/cache";
import { requireReservationsStaff } from "@/lib/auth/session";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function updateRateRequestStatus(requestId: string, status: "new" | "contacted" | "closed") {
  await requireReservationsStaff();
  const supabase = createAdminSupabaseClient();
  await supabase.from("hotel_rate_requests").update({ status }).eq("id", requestId);
  revalidatePath("/admin/hotel-rate-requests");
}
