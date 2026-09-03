import Link from "next/link";
import type { ReactNode } from "react";

// ---------------------------------------------------------------------------
// The Egypt Eye OS component kit.
//
// Small, boring, and used everywhere. The goal is that a new screen is
// assembled from these rather than styled from scratch, so the whole product
// stays coherent as it grows — which is the thing that actually separates a
// serious internal tool from a folder of dashboards.
// ---------------------------------------------------------------------------

export function Card({
  children, className = "", padded = true, as: Tag = "div",
}: { children: ReactNode; className?: string; padded?: boolean; as?: "div" | "section" | "article" }) {
  return (
    <Tag className={`rounded-xl border border-os-line bg-os-card ${padded ? "p-4 sm:p-5" : ""} ${className}`}>
      {children}
    </Tag>
  );
}

export function CardHeader({
  title, subtitle, action, className = "",
}: { title: ReactNode; subtitle?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={`flex flex-wrap items-start justify-between gap-3 ${className}`}>
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold text-os-text">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-[13px] leading-snug text-os-muted">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function PageHeader({
  eyebrow, title, description, actions, meta,
}: { eyebrow?: string; title: string; description?: ReactNode; actions?: ReactNode; meta?: ReactNode }) {
  return (
    <header className="mb-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-os-faint">{eyebrow}</p>
          ) : null}
          <h1 className="mt-1 text-[22px] font-semibold leading-tight text-os-text sm:text-[26px]">{title}</h1>
          {description ? <div className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-os-muted">{description}</div> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2 os-no-print">{actions}</div> : null}
      </div>
      {meta ? <div className="mt-3">{meta}</div> : null}
    </header>
  );
}

const TONES = {
  neutral: "bg-black/[0.05] text-os-muted",
  gold: "bg-os-gold-soft text-[#7a6415]",
  green: "bg-os-green-soft text-os-green",
  amber: "bg-os-amber-soft text-os-amber",
  red: "bg-os-red-soft text-os-red",
  blue: "bg-os-blue-soft text-os-blue",
  ink: "bg-os-ink text-white",
} as const;

export type Tone = keyof typeof TONES;

export function Badge({
  children, tone = "neutral", className = "", title,
}: { children: ReactNode; tone?: Tone; className?: string; title?: string }) {
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium leading-5 ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/** Trip status, coloured by the status row's own colour so admins control it. */
export function StatusPill({ label, color }: { label: string; color?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md bg-black/[0.04] px-1.5 py-0.5 text-[11px] font-medium capitalize text-os-text"
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color ?? "#8d9791" }} />
      {label.replace(/_/g, " ")}
    </span>
  );
}

/**
 * The readiness dial. Deliberately a ring rather than a bar: it reads as a
 * single "is this trip alright" glyph at a glance on a phone in the sun,
 * which is where operations actually looks at it.
 */
export function ReadinessRing({
  score, state, size = 44, showLabel = true,
}: { score: number; state: "green" | "yellow" | "red"; size?: number; showLabel?: boolean }) {
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (Math.max(0, Math.min(100, score)) / 100) * circumference;
  const color = state === "green" ? "var(--color-os-green)" : state === "yellow" ? "var(--color-os-amber)" : "var(--color-os-red)";

  return (
    <span className="inline-flex items-center gap-2" title={`${score}% ready`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${score} percent ready`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circumference}`} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        {showLabel ? (
          <text
            x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
            className="os-nums" fontSize={size * 0.3} fontWeight={600} fill="var(--color-os-text)"
          >
            {score}
          </text>
        ) : null}
      </svg>
    </span>
  );
}

export function Stat({
  label, value, sub, tone, href, icon,
}: { label: string; value: ReactNode; sub?: ReactNode; tone?: Tone; href?: string; icon?: ReactNode }) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11.5px] font-medium uppercase tracking-[0.08em] text-os-faint">{label}</p>
        {icon}
      </div>
      <p className={`os-nums mt-1.5 text-[26px] font-semibold leading-none ${tone === "red" ? "text-os-red" : tone === "amber" ? "text-os-amber" : tone === "green" ? "text-os-green" : "text-os-text"}`}>
        {value}
      </p>
      {sub ? <p className="mt-1.5 text-[12.5px] leading-snug text-os-muted">{sub}</p> : null}
    </>
  );

  if (href) {
    return (
      <Link href={href} className="block rounded-xl border border-os-line bg-os-card p-4 transition hover:border-os-line-strong hover:shadow-sm">
        {body}
      </Link>
    );
  }
  return <div className="rounded-xl border border-os-line bg-os-card p-4">{body}</div>;
}

/**
 * Every empty screen says what to do next. "No trips tomorrow yet" with a
 * Create Trip button is a working product; a blank panel is a bug report.
 */
export function EmptyState({
  title, description, action, icon,
}: { title: string; description?: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-os-line-strong bg-os-card/60 px-6 py-12 text-center">
      {icon ? <div className="mb-3 text-os-faint">{icon}</div> : null}
      <p className="text-[15px] font-semibold text-os-text">{title}</p>
      {description ? <p className="mt-1.5 max-w-md text-[13px] leading-relaxed text-os-muted">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

/** Shown when a screen exists but this person's permissions do not reach it. */
export function NoAccess({ what, permission }: { what: string; permission?: string }) {
  return (
    <EmptyState
      title={`You do not have access to ${what}`}
      description={
        permission
          ? `This needs the "${permission}" permission. If you think you should have it, ask an administrator — they can grant it against your role or as a personal exception.`
          : "If you think you should have access, ask an administrator."
      }
    />
  );
}

export function Section({
  title, description, action, children, className = "",
}: { title?: string; description?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={className}>
      {title ? (
        <div className="mb-2.5 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-[15px] font-semibold text-os-text">{title}</h2>
            {description ? <p className="mt-0.5 text-[12.5px] text-os-muted">{description}</p> : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function Table({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-x-auto rounded-xl border border-os-line bg-os-card ${className}`}>
      <table className="w-full min-w-[640px] border-collapse text-left text-[13px]">{children}</table>
    </div>
  );
}

export function Th({ children, className = "", align = "left" }: { children?: ReactNode; className?: string; align?: "left" | "right" | "center" }) {
  return (
    <th className={`whitespace-nowrap border-b border-os-line px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.07em] text-os-faint text-${align} ${className}`}>
      {children}
    </th>
  );
}

export function Td({ children, className = "", align = "left" }: { children?: ReactNode; className?: string; align?: "left" | "right" | "center" }) {
  return <td className={`border-b border-os-line/70 px-3 py-2.5 align-middle text-${align} ${className}`}>{children}</td>;
}

export function Field({
  label, hint, children, required,
}: { label: string; hint?: string; children: ReactNode; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-medium text-os-text">
        {label}
        {required ? <span className="text-os-red"> *</span> : null}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-[11.5px] leading-snug text-os-muted">{hint}</span> : null}
    </label>
  );
}

export const inputClass =
  "w-full rounded-lg border border-os-line-strong bg-white px-3 py-2 text-[13.5px] text-os-text " +
  "placeholder:text-os-faint focus:border-os-gold focus:outline-none focus:ring-2 focus:ring-os-gold/25";

export const selectClass = inputClass + " pr-8";

export function Divider({ className = "" }: { className?: string }) {
  return <hr className={`border-0 border-t border-os-line ${className}`} />;
}

/** A callout that never looks like a decorative box — it always says what to do. */
export function Notice({
  tone = "blue", title, children, action,
}: { tone?: "blue" | "amber" | "red" | "green"; title: string; children?: ReactNode; action?: ReactNode }) {
  const styles = {
    blue: "border-os-blue/25 bg-os-blue-soft text-os-blue",
    amber: "border-os-amber/25 bg-os-amber-soft text-os-amber",
    red: "border-os-red/25 bg-os-red-soft text-os-red",
    green: "border-os-green/25 bg-os-green-soft text-os-green",
  }[tone];
  return (
    <div className={`rounded-lg border px-3.5 py-3 ${styles}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold">{title}</p>
          {children ? <div className="mt-1 text-[12.5px] leading-relaxed opacity-90">{children}</div> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}

export function Avatar({ name, url, size = 28 }: { name: string; url?: string | null; size?: number }) {
  const initials = name.split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
  if (url) {
    // Employee avatars come from Supabase storage; next/image is not worth the
    // configuration for a 28px circle that changes per row.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt="" width={size} height={size} className="rounded-full object-cover" style={{ width: size, height: size }} />;
  }
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-os-ink-3 font-semibold text-white"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      aria-hidden
    >
      {initials}
    </span>
  );
}

export const buttonClass = {
  primary:
    "inline-flex items-center justify-center gap-1.5 rounded-lg bg-os-ink px-3 py-2 text-[13px] font-semibold text-white transition hover:bg-os-ink-2 disabled:opacity-50",
  gold:
    "inline-flex items-center justify-center gap-1.5 rounded-lg bg-os-gold px-3 py-2 text-[13px] font-semibold text-os-ink transition hover:brightness-105 disabled:opacity-50",
  secondary:
    "inline-flex items-center justify-center gap-1.5 rounded-lg border border-os-line-strong bg-white px-3 py-2 text-[13px] font-medium text-os-text transition hover:bg-black/[0.03] disabled:opacity-50",
  ghost:
    "inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-os-muted transition hover:bg-black/[0.04] hover:text-os-text disabled:opacity-50",
  danger:
    "inline-flex items-center justify-center gap-1.5 rounded-lg border border-os-red/30 bg-os-red-soft px-3 py-2 text-[13px] font-semibold text-os-red transition hover:bg-os-red/10 disabled:opacity-50",
};
