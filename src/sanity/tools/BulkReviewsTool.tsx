import { useState } from "react";
import { useClient } from "sanity";
import { apiVersion } from "../env";
import { reviewDuplicateKey } from "@/lib/testimonials/normalize";
import { parseReviewInput } from "@/lib/testimonials/importParse";

const PLACEHOLDER = `Paste a CSV export (with a header row), or type blocks:

Name: Sarah M.
Quote: The photographer kept showing us the back of the camera so we knew exactly what we were getting.
Context: Exclusive Pyramids Photoshoot
Source: tripadvisor
Url: https://www.tripadvisor.com/...
Date: 2026-03-14
Score: 5
---
Name: James & Emma
Quote: From the airport pickup to the last night's dinner cruise, it felt like traveling with friends.
Context: 6 Days: Cairo, Giza & Luxor
Source: direct
Score: 5`;

// A custom Studio pane (registered in structure.ts, right under
// "Testimonials") for pasting many real reviews at once instead of
// creating them one document at a time. Uses the Studio's own logged-in
// session for write access — no separate API token needed.

export default function BulkReviewsTool() {
  const client = useClient({ apiVersion });
  const [raw, setRaw] = useState("");
  const [fallbackUrl, setFallbackUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "importing" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [importedCount, setImportedCount] = useState(0);
  const [skippedDuplicateCount, setSkippedDuplicateCount] = useState(0);

  const { reviews, issues, format } = parseReviewInput(raw, { defaultUrl: fallbackUrl });

  async function handleImport() {
    if (reviews.length === 0) return;
    setStatus("importing");
    setErrorMessage("");
    try {
      const existing = await client.fetch<{ order: number | null; name?: string; quote?: string }[]>(
        `*[_type == "testimonial"]{order, name, quote}`
      );
      let nextOrder = existing.reduce((max, t) => Math.max(max, t.order ?? 0), 0) + 1;

      // Skip anything that's already a testimonial in Sanity, or a repeat
      // within this same paste — same reviewer name + same quote text,
      // ignoring case/punctuation/whitespace. This is what actually stops
      // duplicates from piling up (re-pasting the same batch, or a source
      // list that already had repeats), rather than just cleaning them up
      // after the fact.
      const seenKeys = new Set(existing.map((t) => reviewDuplicateKey(t.name, t.quote)));
      const toImport: typeof reviews = [];
      let skipped = 0;
      for (const r of reviews) {
        const key = reviewDuplicateKey(r.name, r.quote);
        if (seenKeys.has(key)) {
          skipped++;
          continue;
        }
        seenKeys.add(key);
        toImport.push(r);
      }

      const tx = client.transaction();
      for (const r of toImport) {
        tx.create({
          _type: "testimonial",
          name: r.name,
          quote: r.quote,
          context: r.context,
          title: r.title,
          score: r.score,
          source: {
            platform: r.source ?? "direct",
            url: r.url,
            reviewedAt: r.date,
          },
          order: nextOrder++,
        });
      }
      await tx.commit();

      setImportedCount(toImport.length);
      setSkippedDuplicateCount(skipped);
      setStatus("done");
      setRaw("");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong while importing.");
    }
  }

  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "40px 24px", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Bulk Add Reviews</h1>
      <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
        Paste a <strong>CSV export</strong> (with a header row — columns are matched by name: Name, Quote,
        Context, Source, Url, Date, Score) or type <strong>blocks</strong> separated by a line containing
        just <code>---</code>. Either way, Name and Quote are the only required fields. Cells reading
        &ldquo;Not provided&rdquo;, &ldquo;N/A&rdquo; or blank are treated as missing rather than imported
        as text, and dates like &ldquo;August 2026&rdquo; or &ldquo;3 weeks ago&rdquo; are normalised to the
        month they were written in — which is the precision the site displays.
      </p>
      <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
        <strong>Copy each quote exactly.</strong> Don&rsquo;t tidy the wording, shorten for punch, merge two
        people&rsquo;s reviews, or translate — a review is evidence, and edited evidence isn&rsquo;t evidence.
        Anything from another platform needs a link to the original: the site shows those as a linked excerpt
        rather than republishing them in full, and leaves them out of search-engine rating markup, which is
        what Google&rsquo;s policy on aggregating other sites&rsquo; reviews requires.
      </p>

      <label style={{ display: "block", marginBottom: 20 }}>
        <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
          Fallback link for reviews with no Url
        </span>
        <input
          value={fallbackUrl}
          onChange={(e) => setFallbackUrl(e.target.value)}
          placeholder="https://www.tripadvisor.com/Attraction_Review-..."
          style={{
            width: "100%",
            padding: "8px 12px",
            fontSize: 13,
            border: "1px solid #d1d5db",
            borderRadius: 8,
            boxSizing: "border-box",
          }}
        />
        <span style={{ display: "block", fontSize: 12, color: "#6b7280", marginTop: 6, lineHeight: 1.5 }}>
          Platform exports rarely include a per-review link. Paste the listing page these reviews were left
          on and it covers every row that has none — the reader still lands where the review can be read.
          Leave blank for reviews collected directly.
        </span>
      </label>

      <textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        placeholder={PLACEHOLDER}
        rows={16}
        style={{
          width: "100%",
          padding: 12,
          fontFamily: "ui-monospace, monospace",
          fontSize: 13,
          lineHeight: 1.6,
          border: "1px solid #d1d5db",
          borderRadius: 8,
          resize: "vertical",
          boxSizing: "border-box",
        }}
      />

      {raw.trim().length > 0 && (
        <div style={{ marginTop: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
            {reviews.length} review{reviews.length === 1 ? "" : "s"} ready to import
            {issues.length > 0 ? `, ${issues.length} skipped` : ""} · read as {format === "csv" ? "CSV" : "blocks"}
          </p>

          {reviews.length > 0 && (
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden", marginBottom: 12 }}>
              {reviews.slice(0, 20).map((r, i) => (
                <div
                  key={i}
                  style={{
                    padding: "10px 14px",
                    borderTop: i > 0 ? "1px solid #f3f4f6" : "none",
                    fontSize: 13,
                  }}
                >
                  <strong>{r.name}</strong>
                  {r.context && <span style={{ color: "#9ca3af" }}> · {r.context}</span>}
                  <div style={{ color: "#4b5563", marginTop: 2 }}>{r.quote}</div>
                </div>
              ))}
            </div>
          )}

          {issues.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              {issues.slice(0, 20).map((iss, i) => (
                <p key={i} style={{ fontSize: 12, color: "#b45309" }}>
                  Skipped &ldquo;{iss.block}&rdquo; — {iss.reason}
                </p>
              ))}
            </div>
          )}

          <button
            onClick={handleImport}
            disabled={reviews.length === 0 || status === "importing"}
            style={{
              background: "#111827",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 600,
              cursor: reviews.length === 0 || status === "importing" ? "not-allowed" : "pointer",
              opacity: reviews.length === 0 || status === "importing" ? 0.5 : 1,
            }}
          >
            {status === "importing" ? "Importing…" : `Import ${reviews.length} Review${reviews.length === 1 ? "" : "s"}`}
          </button>
        </div>
      )}

      {status === "done" && (
        <p style={{ marginTop: 16, color: "#15803d", fontSize: 14 }}>
          ✓ Imported {importedCount} review{importedCount === 1 ? "" : "s"}
          {skippedDuplicateCount > 0
            ? ` (skipped ${skippedDuplicateCount} as duplicate${skippedDuplicateCount === 1 ? "" : "s"} of an existing review).`
            : "."}{" "}
          They&rsquo;ll appear in the Testimonials list, and on the site&rsquo;s homepage Reviews section within a
          minute.
        </p>
      )}
      {status === "error" && <p style={{ marginTop: 16, color: "#b91c1c", fontSize: 14 }}>{errorMessage}</p>}
    </div>
  );
}
