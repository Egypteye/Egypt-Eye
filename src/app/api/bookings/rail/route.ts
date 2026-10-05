import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getExperienceBySlug, getPhotoshootBySlug, getSiteSettings } from "@/sanity/fetchers";
import { productRail } from "@/lib/booking/productRail";

// What this visitor can actually be charged, asked at the moment the booking
// popup opens.
//
// The product pages are statically rendered, which is why they are fast, and
// a static page cannot know who is reading it. For a customer that costs
// nothing: the answer baked at build time IS the customer's answer. It costs
// exactly one person something — the admin testing PayPal's sandbox on the
// real site, who was shown "No payment now" by a page that could not see them
// and then handed PayPal buttons by a booking route that could.
//
// So the popup asks. One tiny uncached GET when the dialog opens, answered by
// the same productRail() the booking route uses, with the real viewer. If it
// fails or is slow the popup keeps the page's answer, which is correct for
// everyone it is wrong for nobody.
//
// It deliberately returns no amount. The amount depends on people and extras,
// and the browser already computes it from the same pure quote function; a
// second figure from a second place is the bug this whole module exists to
// stop. All this says is which rail the money would move on.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const type = params.get("type");
  const slug = params.get("slug");

  if ((type !== "photoshoot" && type !== "experience") || !slug) {
    return NextResponse.json({ error: "Unknown product." }, { status: 400 });
  }

  const [product, settings] = await Promise.all([
    type === "photoshoot" ? getPhotoshootBySlug(slug) : getExperienceBySlug(slug),
    getSiteSettings(),
  ]);
  if (!product) {
    return NextResponse.json({ error: "Unknown product." }, { status: 404 });
  }

  const user = await getCurrentUser();
  const { offer, rail } = productRail(product, type, settings.defaultDepositUsd, {
    isAdmin: user?.role === "admin",
  });

  return NextResponse.json(
    { available: offer.available, moneyMode: rail.moneyMode },
    { headers: { "Cache-Control": "no-store" } }
  );
}
