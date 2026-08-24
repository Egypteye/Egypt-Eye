import { useState } from "react";
import { useClient } from "sanity";
import { apiVersion } from "../env";

// A custom Studio pane (registered in structure.ts, right under
// "Testimonials") for pasting many real reviews at once instead of
// creating them one document at a time. Uses the Studio's own logged-in
// session for write access — no separate API token needed.

type ParsedReview = { name: string; quote: string; context?: string };
type ParseIssue = { block: string; reason: string };

const PLACEHOLDER = `Name: Sarah M.
Quote: The photos genuinely look like they belong in a magazine — our guide knew exactly how to pose us.
Context: Exclusive Pyramids Photoshoot
---
Name: James & Emma
Quote: From the airport pickup to the last night's dinner cruise, it felt like traveling with friends.
Context: 6 Days: Cairo, Giza & Luxor
---
Name: Priya K.
Quote: I've never felt so looked after on a solo trip.`;

function parseReviews(raw: string): { reviews: ParsedReview[]; issues: ParseIssue[] } {
  const blocks = raw
    .split(/\n\s*---\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  const reviews: ParsedReview[] = [];
  const issues: ParseIssue[] = [];

  for (const block of blocks) {
    const fields: Record<string, string> = {};
    let currentKey: string | null = null;

    for (const line of block.split("\n")) {
      const match = line.match(/^\s*(name|quote|review|context|tour)\s*:\s*(.*)$/i);
      if (match) {
        currentKey = match[1].toLowerCase() === "review" ? "quote" : match[1].toLowerCase() === "tour" ? "context" : match[1].toLowerCase();
        fields[currentKey] = match[2].trim();
      } else if (currentKey && line.trim()) {
        fields[currentKey] = `${fields[currentKey]}\n${line.trim()}`.trim();
      }
    }

    if (!fields.name || !fields.quote) {
      issues.push({
        block: block.length > 60 ? block.slice(0, 60) + "…" : block,
        reason: !fields.name ? "Missing a Name: line" : "Missing a Quote: line",
      });
      continue;
    }

    reviews.push({ name: fields.name, quote: fields.quote, context: fields.context || undefined });
  }

  return { reviews, issues };
}

export default function BulkReviewsTool() {
  const client = useClient({ apiVersion });
  const [raw, setRaw] = useState("");
  const [status, setStatus] = useState<"idle" | "importing" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [importedCount, setImportedCount] = useState(0);

  const { reviews, issues } = parseReviews(raw);

  async function handleImport() {
    if (reviews.length === 0) return;
    setStatus("importing");
    setErrorMessage("");
    try {
      const existing = await client.fetch<{ order: number | null }[]>(`*[_type == "testimonial"]{order}`);
      let nextOrder = existing.reduce((max, t) => Math.max(max, t.order ?? 0), 0) + 1;

      const tx = client.transaction();
      for (const r of reviews) {
        tx.create({
          _type: "testimonial",
          name: r.name,
          quote: r.quote,
          context: r.context,
          order: nextOrder++,
        });
      }
      await tx.commit();

      setImportedCount(reviews.length);
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
        Paste as many real, genuinely collected reviews as you have below, one per block, separated by a line
        containing just <code>---</code>. Each block needs a <code>Name:</code> and a <code>Quote:</code> line;{" "}
        <code>Context:</code> (which tour it was) is optional. Only use real customer reviews here — this feeds
        directly into the public Reviews section on the site.
      </p>

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
            {issues.length > 0 ? `, ${issues.length} skipped` : ""}
          </p>

          {reviews.length > 0 && (
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden", marginBottom: 12 }}>
              {reviews.map((r, i) => (
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
              {issues.map((iss, i) => (
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
          ✓ Imported {importedCount} review{importedCount === 1 ? "" : "s"}. They&rsquo;ll appear in the
          Testimonials list, and on the site&rsquo;s homepage Reviews section within a minute.
        </p>
      )}
      {status === "error" && <p style={{ marginTop: 16, color: "#b91c1c", fontSize: 14 }}>{errorMessage}</p>}
    </div>
  );
}
