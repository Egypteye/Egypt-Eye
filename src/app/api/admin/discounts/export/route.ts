import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";

function csvEscape(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }
  if (!supabaseAdminConfigured) {
    return NextResponse.json({ error: "Not configured on this deployment yet." }, { status: 500 });
  }

  const supabase = createAdminSupabaseClient();
  const { data: codes } = await supabase
    .from("discount_codes")
    .select(
      "code, status, expires_at, created_at, discount_campaigns(name), profiles(email), newsletter_subscribers(email)"
    )
    .order("created_at", { ascending: false });

  const rows = (codes ?? []) as unknown as {
    code: string;
    status: string;
    expires_at: string | null;
    created_at: string;
    discount_campaigns: { name: string } | null;
    profiles: { email: string } | null;
    newsletter_subscribers: { email: string } | null;
  }[];

  const header = ["Code", "Campaign", "Status", "Owner Email", "Created", "Expires"];
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(
      [
        csvEscape(r.code),
        csvEscape(r.discount_campaigns?.name ?? ""),
        csvEscape(r.status),
        csvEscape(r.profiles?.email ?? r.newsletter_subscribers?.email ?? ""),
        csvEscape(r.created_at),
        csvEscape(r.expires_at ?? ""),
      ].join(",")
    );
  }

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="egypt-eye-discount-codes.csv"`,
    },
  });
}
