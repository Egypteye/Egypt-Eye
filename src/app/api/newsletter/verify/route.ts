import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { mintDiscountCode } from "@/lib/discounts/mint";
import { sendIdempotentEmail } from "@/lib/email/idempotent";
import { discountCodeEmail } from "@/lib/email/templates";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://egypteyetravel.com";

// The actual "double" in double opt-in: this is where a subscription
// becomes real. Verifying mints the customer's unique discount code (if the
// newsletter campaign is active) and sends it — both steps are idempotent,
// so re-clicking an already-used link just re-shows the same result instead
// of minting a second code or sending a second email.
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token || !supabaseAdminConfigured) {
    return NextResponse.redirect(`${SITE_URL}/newsletter/confirmed?status=invalid`);
  }

  const supabase = createAdminSupabaseClient();
  const { data: subscriber } = await supabase
    .from("newsletter_subscribers")
    .select("id, email, first_name, verified, unsubscribed, unsubscribe_token")
    .eq("verify_token", token)
    .maybeSingle();

  if (!subscriber) {
    return NextResponse.redirect(`${SITE_URL}/newsletter/confirmed?status=invalid`);
  }
  if (subscriber.unsubscribed) {
    return NextResponse.redirect(`${SITE_URL}/newsletter/confirmed?status=unsubscribed`);
  }

  if (!subscriber.verified) {
    await supabase
      .from("newsletter_subscribers")
      .update({ verified: true, verified_at: new Date().toISOString() })
      .eq("id", subscriber.id);
  }

  const code = await mintDiscountCode({ campaignSlug: "newsletter-4-off", subscriberId: subscriber.id });

  if (code) {
    const unsubscribeUrl = `${SITE_URL}/api/newsletter/unsubscribe?token=${subscriber.unsubscribe_token}`;
    const { subject, html, text } = discountCodeEmail({
      firstName: subscriber.first_name,
      code: code.code,
      expiresAt: code.expires_at,
      unsubscribeUrl,
    });
    await sendIdempotentEmail({
      idempotencyKey: `discount-email:${code.id}`,
      notificationType: "discount_code",
      to: subscriber.email,
      subject,
      html,
      text,
      subscriberId: subscriber.id,
    });
  }

  return NextResponse.redirect(`${SITE_URL}/newsletter/confirmed?status=ok`);
}
