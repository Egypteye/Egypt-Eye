import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { photoCutoff } from "./policy";

// Deleting commission photographs on a timer.
//
// The privacy policy states that a photograph sent for a papyrus commission
// is deleted automatically after COMMISSION_PHOTO_DAYS. Nothing else in this
// codebase would make that true: a treasure request writes no database row,
// it emails the team a signed link, and the file then sits in the private
// bucket with nothing to say it is finished with. Before this, every photo
// ever sent was still there.
//
// Storage objects cannot be swept from SQL the way the rest of the retention
// job works — removing a row from storage.objects does not reliably remove
// the underlying file — so this goes through the storage API and runs beside
// the SQL sweep in the nightly job.
//
// The bucket is laid out as `<category-slug>/<uuid>.<ext>`, so listing is two
// levels: folders, then files inside each.

const BUCKET = "treasure-uploads";
/** Supabase caps a storage list at 100 by default; ask for the maximum. */
const PAGE = 1000;

export type PhotoSweepReport = {
  ok: boolean;
  scanned: number;
  deleted: number;
  /** Set when the sweep could not complete; the job logs it and carries on. */
  error?: string;
  /**
   * The bucket is not there at all.
   *
   * Separated from a general error because it is not a sweep problem, it is
   * a live product defect: the papyrus form requires a photograph, the route
   * uploads it here, and with no bucket the upload throws, is caught, and
   * the team is emailed "ask the customer to reply with it". The customer
   * believes they sent it. Nothing else reports this — the route's only
   * other record is a console.error, which reaches nobody.
   *
   * /admin renders it as a warning for exactly that reason.
   */
  bucketMissing?: boolean;
};

/**
 * Removes commission photographs older than the published retention period.
 *
 * Swallows its own errors, like the rest of the nightly work: failing to
 * delete an old photo must not take down reconciliation of a live payment.
 * It reports what it did so /admin can show it.
 */
export async function deleteExpiredCommissionPhotos(
  now: Date = new Date(),
): Promise<PhotoSweepReport> {
  if (!supabaseAdminConfigured) return { ok: false, scanned: 0, deleted: 0, error: "not configured" };

  const cutoff = photoCutoff(now);
  let scanned = 0;
  let deleted = 0;

  try {
    const supabase = createAdminSupabaseClient();

    // Level one: the category folders. A folder comes back with a null id.
    const { data: folders, error: folderError } = await supabase.storage
      .from(BUCKET)
      .list("", { limit: PAGE });
    if (folderError) {
      const missing = /bucket not found|does not exist/i.test(folderError.message);
      return { ok: false, scanned, deleted, error: folderError.message, bucketMissing: missing };
    }

    for (const folder of folders ?? []) {
      if (folder.id !== null) continue; // a file at the root, not a folder

      const { data: files, error: fileError } = await supabase.storage
        .from(BUCKET)
        .list(folder.name, { limit: PAGE });
      if (fileError) return { ok: false, scanned, deleted, error: fileError.message };

      const expired: string[] = [];
      for (const file of files ?? []) {
        if (file.id === null) continue; // a nested folder; not expected, skipped safely
        scanned += 1;
        // created_at is what Supabase records on upload. If it is missing we
        // leave the file alone: deleting something whose age is unknown is
        // the wrong way to resolve the doubt.
        const created = file.created_at ? new Date(file.created_at) : null;
        if (created && created < cutoff) expired.push(`${folder.name}/${file.name}`);
      }

      if (expired.length > 0) {
        const { error: removeError } = await supabase.storage.from(BUCKET).remove(expired);
        if (removeError) return { ok: false, scanned, deleted, error: removeError.message };
        deleted += expired.length;
      }
    }

    return { ok: true, scanned, deleted };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("commission photo sweep threw:", message);
    return { ok: false, scanned, deleted, error: message };
  }
}
