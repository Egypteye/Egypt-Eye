export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "text-center" : "text-left"}>
      {eyebrow && (
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-gold-dark">
          {eyebrow}
        </p>
      )}
      <h2 className="text-balance text-3xl font-semibold text-ink sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p
          className={`mt-4 text-lg text-ink-soft/80 ${
            align === "center" ? "mx-auto max-w-2xl" : "max-w-2xl"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
