import { getActor, can } from "@/lib/os/actor";
import { osdb, getOrg, osConfigured } from "@/lib/os/db";
import { todayInCairo } from "@/lib/os/dates";

export const dynamic = "force-dynamic";

// Client export carries personal data, so it needs `clients.export` — a
// permission deliberately kept separate from being able to view clients, and
// flagged sensitive in the catalog so the Admin Centre warns before granting it.
export async function GET() {
  if (!osConfigured) return new Response("Not configured", { status: 503 });
  const actor = await getActor();
  if (!actor) return new Response("Not authorized", { status: 401 });
  if (!can(actor, "clients.export")) {
    return new Response("Exporting client data needs the clients.export permission.", { status: 403 });
  }

  const org = await getOrg();
  const { data } = await osdb()
    .from("os_clients")
    .select("code, kind, full_name, company_name, email, phone, nationality, country, language, source, vip, first_trip_on, last_trip_on, created_at")
    .eq("org_id", org.id)
    .is("archived_at", null)
    .order("code");

  const headers = ["Code", "Kind", "Name", "Company", "Email", "Phone", "Nationality", "Country", "Language", "Source", "VIP", "First trip", "Last trip", "Created"];
  const rows = (data ?? []).map((c) => [
    c.code, c.kind, c.full_name, c.company_name ?? "", c.email ?? "", c.phone ?? "",
    c.nationality ?? "", c.country ?? "", c.language ?? "", c.source ?? "", c.vip ? "yes" : "no",
    c.first_trip_on ?? "", c.last_trip_on ?? "", String(c.created_at).slice(0, 10),
  ].map((v) => String(v ?? "")));

  const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\r\n");

  return new Response("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="egypt-eye-clients-${todayInCairo()}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

function escapeCsv(value: string): string {
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}
