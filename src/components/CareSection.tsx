export function CareSection({
  title,
  intro,
  items,
}: {
  title: string;
  intro?: string;
  items: string[];
}) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-3xl bg-ink px-8 py-14 sm:px-14">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl font-semibold text-cream sm:text-4xl">{title}</h2>
        {intro && <p className="mt-4 text-cream/70">{intro}</p>}
      </div>
      <div className="mx-auto mt-10 grid max-w-3xl gap-x-10 gap-y-4 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-3">
            <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-gold/50 text-[10px] text-gold-light">
              ✓
            </span>
            <span className="text-[15px] leading-relaxed text-cream/85">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
