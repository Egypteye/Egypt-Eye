import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

// The ONLY function allowed to consume a discount code — called once, at
// the moment a reservation is successfully created (never on validation,
// never on form submission alone). Race-condition-safe by construction:
// discount_redemptions.code_id is UNIQUE, so if two requests somehow tried
// to redeem the same code at once, only the first insert succeeds and the
// second gets a unique_violation back — no row lock or extra logic needed.
export async function redeemDiscountCode({
  codeId,
  reservationId,
  discountAmount,
}: {
  codeId: string;
  reservationId: string;
  discountAmount: number;
}): Promise<boolean> {
  const supabase = createAdminSupabaseClient();

  const { error } = await supabase
    .from("discount_redemptions")
    .insert({ code_id: codeId, reservation_id: reservationId, discount_amount: discountAmount });

  if (error) {
    if (error.code !== "23505") console.error("discount redemption insert failed:", error);
    return false; // already redeemed (or a real failure) — either way, not consumed here
  }

  await supabase.from("discount_codes").update({ status: "redeemed" }).eq("id", codeId);
  return true;
}
