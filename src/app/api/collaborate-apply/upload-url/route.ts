import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { MEDIA_KIT_BUCKET, newMediaKitPath } from "@/lib/collaborations/mediaKit";

// Mints a one-shot upload URL for a collaboration media kit.
//
// WHY THIS EXISTS AT ALL. A media kit is a design-heavy PDF and routinely
// runs to several megabytes. Vercel caps a serverless function's request
// body at 4.5 MB, which is below that — and the cap is enforced by the
// platform before any of our code runs, so the applicant gets a raw
// "FUNCTION_PAYLOAD_TOO_LARGE" page rather than anything we wrote. Routing
// the file through /api/collaborate-apply therefore cannot work for the
// files this feature exists to collect. The browser uploads straight to
// storage instead, and the application submits only the resulting path.
//
// WHAT STOPS THIS BEING AN OPEN UPLOAD ENDPOINT:
//
//   - The token is bound to ONE path that this route chooses. A caller
//     cannot pick where the bytes land, overwrite an existing object, or
//     reach another bucket.
//   - The bucket is private, accepts only application/pdf, and caps the
//     object size. Those are enforced by storage, not by the caller.
//   - Rate limited per IP, because minting URLs is the only thing here an
//     abuser would want.
//   - An orphaned upload — a URL minted and used but the application never
//     submitted — is swept by the nightly job, which deletes stored objects
//     no row points at.
//
// It deliberately returns no information about any existing object.

export const maxDuration = 15;

export async function POST(request: NextRequest) {
  if (!supabaseAdminConfigured) {
    return NextResponse.json({ error: "Uploads are not configured on this deployment" }, { status: 503 });
  }

  // Tighter than the application form itself: a handful of attempts is all a
  // genuine applicant needs, including retries after a dropped connection.
  const { allowed } = await checkRateLimit({
    bucket: "collaborate-media-kit-url",
    key: getClientIp(request),
    max: 12,
    windowSeconds: 3600,
  });
  if (!allowed) {
    return NextResponse.json({ error: "Too many upload attempts. Please try again later." }, { status: 429 });
  }

  const path = newMediaKitPath(crypto.randomUUID());

  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase.storage.from(MEDIA_KIT_BUCKET).createSignedUploadUrl(path);
    if (error || !data) throw error ?? new Error("no signed upload url returned");
    return NextResponse.json({ path: data.path, token: data.token });
  } catch (err) {
    console.error("media kit upload url failed:", err);
    return NextResponse.json(
      { error: "We could not start that upload. Please try again, or paste a link to your media kit instead." },
      { status: 503 },
    );
  }
}
