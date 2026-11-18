import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";

// Deleting media kits once the application they belong to has been anonymised.
//
// The retention sweep in migration 0027 anonymises a collaboration
// application by blanking the applicant's name, email, phone and message. A
// media kit undoes all of that on its own: it is a PDF with their name on the
// cover, their photograph inside, their audience figures and usually their
// rates. Leaving it in the bucket would mean the row says nothing and the
// file says everything.
//
// Why this is not done in the SQL function with the rest of the sweep:
// clearing `media_kit_path` in SQL would throw away the only pointer to the
// file, and a storage object cannot be removed by deleting a row — the file
// would survive forever with nothing left to find it by. So the path is left
// in place, this sweep uses it to delete the object, and only then clears the
// column. The pointer outlives the anonymisation by at most one night and is
// not itself personal data.
//
// Runs beside deleteExpiredCommissionPhotos in the nightly job, and reports
// to /admin for the reason CLAUDE.md gives: a console.error is not a channel
// that reaches the owner.

const BUCKET = "collaboration-media-kits";
/** One night's work. Anonymisation arrives in a trickle, not a flood. */
const BATCH = 200;

export type MediaKitSweepReport = {
  ok: boolean;
  /** Anonymised applications still holding a stored media kit. */
  scanned: number;
  /** Files removed from the bucket and unlinked from their row. */
  deleted: number;
  error?: string;
  /**
   * The bucket does not exist.
   *
   * Separated from a general error because it is a live product defect
   * rather than a sweep problem: /collaborate requires a media kit, the
   * route uploads it here, and with no bucket every upload fails. The route
   * refuses the application in that case rather than lying about it, so the
   * symptom is creators unable to apply at all. /admin shows this.
   */
  bucketMissing?: boolean;
};

/**
 * Removes media kits belonging to applications that have been anonymised.
 *
 * Swallows its own errors, like the rest of the nightly work: failing to
 * delete a PDF must not take down reconciliation of a live payment.
 */
export async function deleteAnonymisedMediaKits(): Promise<MediaKitSweepReport> {
  if (!supabaseAdminConfigured) {
    return { ok: false, scanned: 0, deleted: 0, error: "not configured" };
  }

  const supabase = createAdminSupabaseClient();

  try {
    const { data: rows, error } = await supabase
      .from("collaboration_applications")
      .select("id, media_kit_path")
      .not("anonymised_at", "is", null)
      .not("media_kit_path", "is", null)
      .limit(BATCH);

    if (error) return { ok: false, scanned: 0, deleted: 0, error: error.message };

    const targets = (rows ?? []).filter(
      (r): r is { id: string; media_kit_path: string } => typeof r.media_kit_path === "string",
    );
    if (targets.length === 0) return { ok: true, scanned: 0, deleted: 0 };

    const { error: removeError } = await supabase.storage
      .from(BUCKET)
      .remove(targets.map((t) => t.media_kit_path));

    if (removeError) {
      const missing = /bucket.*not.*found/i.test(removeError.message);
      return {
        ok: false,
        scanned: targets.length,
        deleted: 0,
        error: removeError.message,
        ...(missing ? { bucketMissing: true } : {}),
      };
    }

    // Only once the files are actually gone. If this update failed the sweep
    // would simply try the same rows again tomorrow and remove nothing,
    // which is harmless — the opposite order would orphan every file.
    const { error: clearError } = await supabase
      .from("collaboration_applications")
      .update({ media_kit_path: null, media_kit_url: null })
      .in(
        "id",
        targets.map((t) => t.id),
      );

    if (clearError) {
      return { ok: false, scanned: targets.length, deleted: targets.length, error: clearError.message };
    }

    return { ok: true, scanned: targets.length, deleted: targets.length };
  } catch (err) {
    return {
      ok: false,
      scanned: 0,
      deleted: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
