import Link from "next/link";
import { Badge } from "./ui";
import { Icon } from "./icons";
import type { ScoreFactor, DealListItem, LeadListItem } from "@/lib/os/commercial/types";

// ---------------------------------------------------------------------------
// SHARED COMMERCIAL UI
// ---------------------------------------------------------------------------
// The rule these components exist to enforce: a score is never rendered
// without the reasons behind it. ScoreBreakdown is the only way a number
// reaches the screen in this module, and it always carries the factor list.
// ---------------------------------------------------------------------------

const BAND_TONE: Record<string, { bg: string; fg: string; label: string }> = {
  hot: { bg: "#5c7a5f22", fg: "#3f5c42", label: "Answer first" },
  warm: { bg: "#c9a22722", fg: "#7a6415", label: "Worth working" },
  cool: { bg: "#4a7c8c22", fg: "#345b66", label: "When you can" },
  cold: { bg: "#7c8a9122", fg: "#5a666c", label: "Low signal" },
};

/**
 * A score and, immediately beside it, every reason it is that number.
 *
 * There is deliberately no "compact" mode that drops the reasons. If the
 * space is too tight for the explanation, the number does not belong there
 * either — an unexplained score is indistinguishable from a made-up one.
 */
export function ScoreBreakdown({
  score, band, factors, title = "How this score was reached",
}: {
  score: number;
  band?: string;
  factors: ScoreFactor[];
  title?: string;
}) {
  const tone = BAND_TONE[band ?? "cold"] ?? BAND_TONE.cold;
  const positive = factors.filter((f) => f.points > 0);
  const negative = factors.filter((f) => f.points < 0);

  return (
    <div>
      <div className="flex items-center gap-3">
        <span
          className="os-nums inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[16px] font-bold"
          style={{ background: tone.bg, color: tone.fg }}
        >
          {score}
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-os-text">{tone.label}</p>
          <p className="text-[11.5px] text-os-muted">
            {factors.length
              ? `${factors.length} factor${factors.length === 1 ? "" : "s"} matched, summed below.`
              : "No scoring rule matched this record."}
          </p>
        </div>
      </div>

      {factors.length ? (
        <div className="mt-3">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-os-faint">{title}</p>
          <ul className="space-y-2">
            {[...positive, ...negative].map((factor) => (
              <li key={factor.key} className="flex gap-2.5">
                <span
                  className={`os-nums mt-0.5 w-9 shrink-0 rounded px-1 py-0.5 text-center text-[11px] font-semibold ${
                    factor.points >= 0 ? "bg-os-green-soft text-os-green" : "bg-os-red-soft text-os-red"
                  }`}
                >
                  {factor.points > 0 ? `+${factor.points}` : factor.points}
                </span>
                <span className="min-w-0">
                  <span className="block text-[12.5px] font-medium leading-snug text-os-text">{factor.label}</span>
                  {factor.detail ? (
                    <span className="block text-[11.5px] leading-snug text-os-text/70">{factor.detail}</span>
                  ) : null}
                  <span className="block text-[11px] leading-snug text-os-muted">{factor.explanation}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2.5 text-[11px] leading-relaxed text-os-faint">
            Every point above comes from a rule an administrator can edit. There is no model and no hidden weighting —
            the score is the sum of these numbers, and changing one changes it for every record.
          </p>
        </div>
      ) : null}
    </div>
  );
}

/** The score alone, for a table cell — always linking to where the reasons are. */
export function ScorePill({ score, band, href }: { score: number; band: string; href: string }) {
  const tone = BAND_TONE[band] ?? BAND_TONE.cold;
  return (
    <Link
      href={href}
      title="Open to see every factor behind this number"
      className="os-nums inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11.5px] font-semibold"
      style={{ background: tone.bg, color: tone.fg }}
    >
      {score}
      <Icon.ChevronRight size={11} />
    </Link>
  );
}

export function StagePill({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ background: `${color}22`, color: "#16211c" }}
    >
      {label}
    </span>
  );
}

export function DealCard({ deal, href }: { deal: DealListItem; href: string }) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-os-line bg-white p-3 transition hover:border-os-gold"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="os-nums text-[11px] font-medium text-os-faint">{deal.ref}</span>
        {deal.stalled ? (
          <span className="rounded bg-os-amber-soft px-1.5 py-0.5 text-[10.5px] font-medium text-os-amber">
            {deal.daysInStage}d
          </span>
        ) : (
          <span className="os-nums text-[10.5px] text-os-faint">{deal.daysInStage}d</span>
        )}
      </div>
      <p className="mt-1 text-[13px] font-medium leading-snug text-os-text">{deal.title}</p>
      <p className="mt-0.5 truncate text-[11.5px] text-os-muted">
        {deal.companyName ?? deal.clientName ?? "No counterparty"}
      </p>
      {deal.money ? (
        <p className="os-nums mt-1.5 text-[12.5px] font-semibold text-os-text">
          {deal.money.currency} {Math.round(deal.money.value).toLocaleString()}
          <span className="ml-1.5 text-[11px] font-normal text-os-faint">
            {deal.money.probabilityPct}%
            {deal.money.probabilitySource === "owner" ? " (owner)" : ""}
          </span>
        </p>
      ) : null}
      {deal.nextStep ? (
        <p className="mt-1.5 flex items-start gap-1 text-[11px] leading-snug text-os-muted">
          <span className="mt-[3px] text-os-faint"><Icon.Flag size={10} /></span>
          <span className="min-w-0">{deal.nextStep}</span>
        </p>
      ) : null}
    </Link>
  );
}

export function LeadRow({ lead, href }: { lead: LeadListItem; href: string }) {
  return (
    <tr>
      <td className="px-3 py-2.5 align-top sm:px-4">
        <Link href={href} className="block">
          <span className="block text-[13px] font-medium leading-snug text-os-text">
            {lead.contactName ?? "No name given"}
          </span>
          <span className="os-nums block text-[11px] text-os-faint">
            {lead.ref} · {lead.source}
            {lead.companyName ? ` · ${lead.companyName}` : ""}
          </span>
        </Link>
      </td>
      <td className="px-3 py-2.5 align-top text-[12px] text-os-muted sm:px-4">
        <span className="block">{lead.interest ?? lead.typeName ?? "Not stated"}</span>
        <span className="block text-[11px] text-os-faint">
          {lead.requestedDate ?? "No date"}
          {lead.guests ? ` · ${lead.guests} guests` : ""}
        </span>
      </td>
      <td className="px-3 py-2.5 align-top sm:px-4">
        <ScorePill score={lead.score} band={lead.scoreBand} href={href} />
      </td>
      <td className="px-3 py-2.5 align-top text-[11.5px] sm:px-4">
        {lead.firstResponseMinutes != null ? (
          <span className="text-os-muted">{formatMinutes(lead.firstResponseMinutes)}</span>
        ) : lead.responseOverdue ? (
          <Badge tone="red">Not answered</Badge>
        ) : (
          <span className="text-os-faint">Waiting</span>
        )}
      </td>
      <td className="px-3 py-2.5 align-top text-[11.5px] text-os-muted sm:px-4">{lead.ownerName ?? "Unassigned"}</td>
      <td className="px-3 py-2.5 align-top sm:px-4">
        <Badge tone={statusTone(lead.status)}>{lead.status.replace(/_/g, " ")}</Badge>
      </td>
    </tr>
  );
}

function statusTone(status: string): "green" | "amber" | "red" | "neutral" | "blue" {
  if (status === "converted" || status === "qualified") return "green";
  if (status === "new") return "amber";
  if (status === "lost" || status === "unqualified") return "neutral";
  return "blue";
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 1440) return `${Math.round(minutes / 60)} hr`;
  return `${Math.round(minutes / 1440)} d`;
}

/** The health score, always with its factors. Same rule as ScoreBreakdown. */
export function HealthBreakdown({ score, state, factors }: { score: number; state: string; factors: ScoreFactor[] }) {
  const tone =
    state === "strong" ? { bg: "#5c7a5f22", fg: "#3f5c42" } :
    state === "steady" ? { bg: "#4a7c8c22", fg: "#345b66" } :
    state === "slipping" ? { bg: "#c9a22722", fg: "#7a6415" } :
    state === "dormant" ? { bg: "#7c8a9122", fg: "#5a666c" } :
    { bg: "#b91c1c22", fg: "#9a2020" };

  return (
    <div>
      <div className="flex items-center gap-3">
        <span
          className="os-nums inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[16px] font-bold"
          style={{ background: tone.bg, color: tone.fg }}
        >
          {score}
        </span>
        <div>
          <p className="text-[13px] font-semibold capitalize text-os-text">{state.replace(/_/g, " ")}</p>
          <p className="text-[11.5px] text-os-muted">Recomputed from what is on file, not typed in.</p>
        </div>
      </div>
      <ul className="mt-3 space-y-2">
        {factors.map((factor) => (
          <li key={factor.key} className="flex gap-2.5">
            <span
              className={`os-nums mt-0.5 w-9 shrink-0 rounded px-1 py-0.5 text-center text-[11px] font-semibold ${
                factor.points >= 0 ? "bg-os-green-soft text-os-green" : "bg-os-red-soft text-os-red"
              }`}
            >
              {factor.points > 0 ? `+${factor.points}` : factor.points}
            </span>
            <span className="min-w-0">
              <span className="block text-[12.5px] font-medium leading-snug text-os-text">{factor.label}</span>
              {factor.detail ? <span className="block text-[11.5px] leading-snug text-os-text/70">{factor.detail}</span> : null}
              <span className="block text-[11px] leading-snug text-os-muted">{factor.explanation}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
