import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { getTreasureProducts } from "@/sanity/fetchers";
import { quoteCartouche, type Fulfilment } from "@/lib/boutique/cartoucheOrder";
import { payPalDescription } from "@/lib/boutique/cartoucheOrder";
import { createAttempt } from "@/lib/booking/attempts";
import { paymentProvider } from "@/lib/booking/activeProvider";
import { siteUrl } from "@/content/seo";

// Buying a cartouche outright.
//
// The whole security argument for this route is in what it does NOT accept.
// The body carries a product slug, a name, a quantity and contact details.
// It does not carry a price, a total, a currency or a sign list, because
// every one of those is derived here from data the browser cannot reach:
//
//   * the price comes off the product the SERVER looked up in the CMS;
//   * the signs are spelled here from the submitted name, by the same
//     function the preview used, so the two cannot disagree;
//   * the total is integer arithmetic in quoteCartouche().
//
// A tampered request therefore has nothing to tamper with. The worst it can
// do is ask for a different product or a different name, both of which are
// quoted honestly at their own price.
//
// ORDERING. The order row is written BEFORE PayPal is asked for anything,
// and createAttempt writes the attempt row before that call too. A payment we
// cannot match to an order is the failure this ordering exists to prevent;
// an abandoned row costs nothing.

export const runtime = "nodejs";

type Body = {
  productSlug?: unknown;
  name?: unknown;
  /** Symbol KEYS only — "ankh", "lotus", "scarab", "eye". Never glyphs. */
  symbols?: unknown;
  quantity?: unknown;
  fulfilment?: unknown;
  customerName?: unknown;
  customerEmail?: unknown;
  customerPhone?: unknown;
  collectionNotes?: unknown;
  company?: unknown;
};

const text = (v: unknown, max: number): string =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

/** EEB-, so a boutique order can never collide with a reservation. */
function generateReference(): string {
  return `EEB-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: NextRequest) {
  if (!supabaseAdminConfigured) {
    return NextResponse.json({ error: "Ordering is not configured." }, { status: 503 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Could not read that request." }, { status: 400 });
  }

  // Same honeypot name as every other form here.
  if (text(body.company, 100)) {
    return NextResponse.json({ ok: true, reference: null });
  }

  const { allowed } = await checkRateLimit({
    bucket: "boutique-order",
    key: getClientIp(request),
    max: 10,
    windowSeconds: 600,
  });
  if (!allowed) {
    return NextResponse.json({ error: "Too many attempts. Please wait a few minutes." }, { status: 429 });
  }

  const productSlug = text(body.productSlug, 120);
  const engraved = text(body.name, 40);
  const customerName = text(body.customerName, 120);
  const customerEmail = text(body.customerEmail, 200).toLowerCase();
  const customerPhone = text(body.customerPhone, 40) || null;
  const collectionNotes = text(body.collectionNotes, 1000) || null;
  const quantity = Number(body.quantity ?? 1);
  const fulfilment = (text(body.fulfilment, 40) || "collect-in-egypt") as Fulfilment;

  if (!customerName) return NextResponse.json({ error: "Please tell us your name." }, { status: 400 });
  if (!EMAIL.test(customerEmail)) {
    return NextResponse.json({ error: "Please give us an email we can reach you on." }, { status: 400 });
  }

  // The product as the SERVER sees it. Nothing about money is taken from the
  // request, so a browser that posts its own price is quoted the real one.
  const products = await getTreasureProducts();
  const product = products.find((p) => p.slug === productSlug);
  if (!product) {
    return NextResponse.json({ error: "That piece is no longer listed." }, { status: 404 });
  }

  const quoted = quoteCartouche({
    product: { slug: product.slug, name: product.name, status: product.status, price: product.price },
    name: engraved,
    // Capped before it reaches the quote, which filters unknown keys anyway —
    // a request cannot make the list long enough to be worth iterating.
    symbols: Array.isArray(body.symbols) ? body.symbols.slice(0, 8).map((v) => String(v)) : [],
    quantity,
    fulfilment,
  });

  if (!quoted.ok) {
    // Every refusal is something the customer can act on, and every one of
    // them leaves the enquiry form as the way through — which is why none of
    // these is a dead end.
    return NextResponse.json({ error: quoted.message, reason: quoted.reason }, { status: 400 });
  }
  const quote = quoted.quote;

  const supabase = createAdminSupabaseClient();
  const reference = generateReference();

  const { data: order, error } = await supabase
    .from("boutique_orders")
    .insert({
      reference,
      product_slug: quote.productSlug,
      product_name: quote.productName,
      category_slug: product.category,
      engraved_name: quote.engravedName,
      sign_codes: quote.signCodes,
      symbols: quote.symbols,
      glyphs: quote.glyphs,
      sign_count: quote.signCount,
      quantity: quote.quantity,
      unit_cents: quote.unitCents,
      total_cents: quote.totalCents,
      currency: quote.currency,
      fulfilment: quote.fulfilment,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      collection_notes: collectionNotes,
      status: "pending",
      quote,
    })
    .select("id, reference")
    .single();

  if (error || !order) {
    console.error("boutique order insert failed:", error);
    return NextResponse.json({ error: "Could not start that order. Please try again." }, { status: 500 });
  }

  const provider = paymentProvider();
  if (!provider.enabled) {
    // Honest: we have the order, not the money. Nothing here may imply a
    // piece is being made.
    return NextResponse.json({
      ok: true,
      reference: order.reference,
      payment: null,
      next: "awaitingTeam" as const,
      notice: "We have your order. Online payment is not available just now, so our team will be in touch to arrange it.",
    });
  }

  const opened = await createAttempt({
    parent: { kind: "boutiqueOrder", id: order.id as string },
    reference: order.reference as string,
    // The quote is stored verbatim on the attempt. It is the agreed figures,
    // and nothing afterwards recomputes them.
    quote: quote as unknown as Parameters<typeof createAttempt>[0]["quote"],
    description: payPalDescription(quote),
    returnUrl: `${siteUrl}/secure/return?ref=${order.reference}`,
    cancelUrl: `${siteUrl}/boutique/${product.category}?ref=${order.reference}`,
  });

  if (!opened.ok) {
    console.error("boutique createAttempt failed:", opened.message);
    return NextResponse.json({
      ok: true,
      reference: order.reference,
      payment: null,
      next: "awaitingTeam" as const,
      notice: "We have your order. We could not open the payment page just now, so our team will follow up directly.",
    });
  }

  return NextResponse.json({
    ok: true,
    reference: order.reference,
    next: "pay" as const,
    payment: {
      orderId: opened.orderId,
      // Public by design: it identifies the merchant, it authorises nothing,
      // and the secret never leaves the server.
      clientId: opened.clientId,
      // So a test payment cannot be mistaken for a real one.
      sandbox: provider.env === "sandbox",
      totalCents: quote.totalCents,
      currency: quote.currency,
    },
    summary: {
      productName: quote.productName,
      engravedName: quote.engravedName,
      glyphs: quote.glyphs,
      signCount: quote.signCount,
      capacity: quote.capacity,
      quantity: quote.quantity,
      symbols: quote.symbols,
    },
  });
}
