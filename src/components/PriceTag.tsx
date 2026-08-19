import type { Price } from "@/content/types";

export function PriceTag({ price }: { price: Price }) {
  if (price.amount == null) {
    return (
      <span className="text-sm font-semibold uppercase tracking-wide text-nile">
        {price.note ?? "Get a Quote"}
      </span>
    );
  }
  return (
    <span className="inline-flex items-baseline gap-2">
      <span className="text-2xl font-semibold text-ink">${price.amount}</span>
      {price.originalAmount && (
        <span className="text-sm text-ink-soft/50 line-through">
          ${price.originalAmount}
        </span>
      )}
    </span>
  );
}
