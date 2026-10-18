import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { sendEmail } from "@/lib/email/resend";
import {
  FLYING_DRESSES_FROM,
  flyingDressesCollaborationReceipt,
  flyingDressesTeamEmail,
} from "@/lib/email/flyingDresses";
import { brand, contact } from "@/content/flyingDresses";
import {
  COLLABORATION_NO_PROMISE,
  collaborationCategoryById,
  collaborationModelById,
} from "@/content/flyingDressCollaborations";

/**
 * A collaboration proposal for Flying Dresses Egypt.
 *
 * =========================================================================
 * WHY THIS REUSES collaboration_applications RATHER THAN ADDING A TABLE
 * =========================================================================
 * Egypt Eye already has the whole pipeline: the table, a status workflow
 * ('new' through 'confirmed'), and an admin review UI at
 * /admin/collaborations that reads it. A second table for this brand would
 * mean a second review page nobody opens, and proposals quietly rotting in it.
 *
 * So brand proposals land in the SAME table, and `collaboration_type` carries
 * the brand prefix ("Flying Dresses — DJs, producers and musicians"). That
 * column is rendered as free text in both admin views, so the existing
 * workflow picks these up with no schema change and no migration against a
 * live database.
 *
 * The brand's extra questions — what they want, what they offer, deliverables,
 * timeline, commercial model — are composed into `message`, which is the
 * column the admin detail page already shows in full. A reviewer sees the
 * whole proposal; nothing is lost to a column that does not exist yet.
 *
 * =========================================================================
 * EMAIL IS THE CONTRACT; THE DATABASE IS THE CONVENIENCE
 * =========================================================================
 * The team notification is what actually has to happen, so the ORDER matters:
 * the row is written first (best effort), then the email is sent, and the
 * response reports the EMAIL's outcome. A proposal that is filed but never
 * read is a lost proposal, and telling somebody their message arrived when
 * nobody will see it is the failure this route exists to avoid.
 *
 * If the database is unconfigured or the insert fails, that is logged and the
 * request continues. If the email fails, the submitter is told it failed and
 * pointed at WhatsApp. Nothing ever reports success it did not have.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: unknown, max = 300): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: NextRequest) {
  const { allowed } = await checkRateLimit({
    bucket: "fd-collaborate",
    key: getClientIp(request),
    max: 5,
    windowSeconds: 3600,
  });
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Honeypot, same shape as every other form on this site: off-screen rather
  // than display:none, because some bots fill positioned fields and skip
  // hidden ones. A hit is answered with a cheerful 200 so the bot stops.
  if (clean(body.company, 100)) {
    return NextResponse.json({ ok: true });
  }

  const name = clean(body.name, 200);
  const email = clean(body.email, 200);
  if (!name) return NextResponse.json({ error: "Please tell us your name." }, { status: 400 });
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "That email address does not look right." }, { status: 400 });
  }

  // Resolved against the catalogue, never echoed back. Whatever arrives here
  // ends up in an email and a database row the business reads as fact.
  const category = collaborationCategoryById(clean(body.category, 60));
  const model = collaborationModelById(clean(body.model, 40));

  const organisation = clean(body.organisation, 200);
  const country = clean(body.country, 120);
  const whatsapp = clean(body.whatsapp, 60);
  const website = clean(body.website, 500);
  const links = clean(body.links, 800);
  const proposal = clean(body.proposal, 4000);
  const offering = clean(body.offering, 2000);
  const timeline = clean(body.timeline, 300);
  const budget = clean(body.budget, 200);

  if (!proposal) {
    return NextResponse.json(
      { error: "Please tell us what you are proposing." },
      { status: 400 }
    );
  }

  const typeLabel = `${brand.name} — ${category?.name ?? "General"}`;

  const rows: [string, string][] = [];
  const push = (label: string, value: string) => {
    if (value) rows.push([label, value]);
  };
  push("Category", category?.name ?? "Not given");
  push("Proposing", model?.label ?? "Not given");
  push("Name", name);
  push("Organisation", organisation);
  push("Country", country);
  push("Email", email);
  push("WhatsApp", whatsapp);
  push("Website", website);
  push("Links", links);
  push("What they want", proposal);
  push("What they offer", offering);
  push("Timeline", timeline);
  push("Budget or arrangement", budget);

  // The whole proposal as one readable block, for the admin detail page.
  const messageForRecord = rows.map(([k, v]) => `${k}: ${v}`).join("\n");

  // ---- Best effort: file it so the review workflow sees it ----------------
  if (supabaseAdminConfigured) {
    try {
      const supabase = createAdminSupabaseClient();
      const { error } = await supabase.from("collaboration_applications").insert({
        full_name: name,
        email,
        phone: whatsapp || null,
        portfolio_url: website || null,
        collaboration_type: typeLabel,
        message: messageForRecord,
      });
      if (error) {
        console.error("Flying Dresses collaboration: could not file the proposal", error);
      }
    } catch (err) {
      console.error("Flying Dresses collaboration: could not file the proposal", err);
    }
  }

  // ---- The part that actually has to happen -------------------------------
  const pageUrl = `${brand.url}/flying-dresses/collaborate`;
  const team = flyingDressesTeamEmail({
    subject: `Collaboration: ${category?.name ?? "General"}`,
    rows,
    message: proposal,
    pageUrl,
  });

  // `.ok`, NOT the object. sendEmail resolves to { ok, error } and an object
  // is always truthy, so `if (!sentToTeam)` can never be true: the first
  // version of this route returned {"ok":true} on a deployment with no
  // RESEND_API_KEY, telling every sender their proposal had arrived when
  // nothing had been sent at all. That is the one failure this whole route is
  // written to avoid, and it shipped in the first draft of it.
  const sentToTeam = await sendEmail({
    from: FLYING_DRESSES_FROM,
    to: contact.email,
    replyTo: email,
    subject: team.subject,
    html: team.html,
    text: team.text,
  });

  if (!sentToTeam.ok) {
    return NextResponse.json(
      { error: "We could not send that. Please message us on WhatsApp instead." },
      { status: 502 }
    );
  }

  // The submitter's receipt. It says plainly that this is a proposal, in the
  // same words the page used, so nobody comes away thinking a form was a yes.
  const receipt = flyingDressesCollaborationReceipt({
    name,
    category: category?.name ?? "General",
    noPromise: COLLABORATION_NO_PROMISE,
  });
  await sendEmail({
    from: FLYING_DRESSES_FROM,
    to: email,
    subject: receipt.subject,
    html: receipt.html,
    text: receipt.text,
  });

  return NextResponse.json({ ok: true });
}
