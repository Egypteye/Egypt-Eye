import { T, trAll } from "@/i18n/T";

export async function AccountBenefits({ compact = false }: { compact?: boolean }) {
  const ui = await trAll([
    "Save your favorite journeys",
    "Keep your trip plans",
    "Manage your reservation",
    "Access your personalized trip",
    "Receive your travel information",
    "Keep your Egypt experiences in one place",
  ]);
  const benefits = Object.values(ui);

  return (
    <div className={compact ? "" : "rounded-2xl border border-gold/15 bg-sand-dim p-6"}>
      {!compact && (
        <h3 className="font-display text-lg font-semibold text-ink"><T>Create your Egypt Eye account</T></h3>
      )}
      <ul className="mt-3 flex flex-col gap-2">
        {benefits.map((b) => (
          <li key={b} className="flex items-start gap-2 text-sm text-ink-soft/80">
            <span aria-hidden="true" className="mt-0.5 text-gold-dark">✓</span>
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}
