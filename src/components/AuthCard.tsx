import type { ReactNode } from "react";
import { Container } from "./Container";

export function AuthCard({
  eyebrow,
  title,
  subtitle,
  children,
  aside,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="bg-sand py-16 sm:py-24">
      <Container className="mx-auto max-w-3xl">
        <div className="flex flex-col items-stretch gap-8 lg:flex-row lg:items-start lg:justify-center">
          <div className="animate-fade-up w-full max-w-md rounded-3xl border border-gold/15 bg-cream p-6 shadow-xl shadow-black/5 sm:p-9">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-dark">{eyebrow}</p>
            <h1 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">{title}</h1>
            {subtitle && <p className="mt-2 text-sm text-ink-soft/70">{subtitle}</p>}
            <div className="mt-6">{children}</div>
          </div>
          {aside && <div className="w-full max-w-md lg:w-72">{aside}</div>}
        </div>
      </Container>
    </section>
  );
}

export function AuthInput({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
      {label}
      <input
        {...props}
        className="rounded-lg border border-black/10 bg-sand px-4 py-2.5 text-ink outline-none focus:border-gold"
      />
    </label>
  );
}
