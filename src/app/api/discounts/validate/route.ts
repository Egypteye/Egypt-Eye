import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { validateDiscountCode } from "@/lib/discounts/validate";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

// Lets the reservation flow preview a discount before submitting — read
// only, never marks anything redeemed (see src/lib/discounts/validate.ts).
// The reservation submission route re-validates and redeems independently,
// so nothing here is trusted as the final word on the discount amount.
export async function POST(request: NextRequest) {
  if (!supabaseAdminConfigured) {
    return NextResponse.json({ valid: false, reason: "Discounts aren't set up on this deployment yet." });
  }

  // Generous but real limit — mainly to blunt brute-forcing the 6-character
  // code space, not to get in a genuine shopper's way.
  const { allowed } = await checkRateLimit({ bucket: "discount-validate", key: getClientIp(request), max: 30, windowSeconds: 600 });
  if (!allowed) {
    return NextResponse.json({ valid: false, reason: "Too many attempts — please wait a few minutes and try again." }, { status: 429 });
  }

  let body: { code?: unknown; tourSlugs?: unknown; experienceSlugs?: unknown; subtotal?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ valid: false, reason: "Invalid request." }, { status: 400 });
  }

  const code = typeof body.code === "string" ? body.code : "";
  const tourSlugs = Array.isArray(body.tourSlugs) ? body.tourSlugs.filter((s): s is string => typeof s === "string") : [];
  const experienceSlugs = Array.isArray(body.experienceSlugs)
    ? body.experienceSlugs.filter((s): s is string => typeof s === "string")
    : [];
  const subtotal = typeof body.subtotal === "number" && Number.isFinite(body.subtotal) ? body.subtotal : 0;

  const user = await getCurrentUser();
  const result = await validateDiscountCode({
    code,
    customerId: user?.id ?? null,
    tourSlugs,
    experienceSlugs,
    subtotal,
  });

  return NextResponse.json(result);
}
