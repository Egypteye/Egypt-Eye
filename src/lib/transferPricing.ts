import { transfersPage } from "@/content/transfers";
import type { TransferCategory, TransferVehicleId } from "@/content/types";

export type TransferQuote = { kind: "priced"; amount: number } | { kind: "quote" };

// Turns a category + route (or duration, for private-driver) + vehicle into
// either an instant price or "quote" — the two outcomes the booking form
// renders as "Request This Transfer — $N" vs. "Request a Quote". Kept as a
// pure function (no fetch, no state) so the form can recompute it on every
// keystroke.
export function getTransferQuote({
  category,
  fromZoneId,
  toZoneId,
  vehicleId,
  durationHours,
  isDailyRate,
}: {
  category: TransferCategory;
  fromZoneId?: string;
  toZoneId?: string;
  vehicleId: TransferVehicleId;
  durationHours?: number;
  isDailyRate?: boolean;
}): TransferQuote {
  if (category === "custom") return { kind: "quote" };

  if (category === "private-driver") {
    const rate = transfersPage.privateDriverRates.find((r) => r.vehicle === vehicleId);
    if (!rate) return { kind: "quote" };
    if (isDailyRate) return { kind: "priced", amount: rate.daily };
    if (durationHours && durationHours > 0) return { kind: "priced", amount: rate.hourly * durationHours };
    return { kind: "quote" };
  }

  if (!fromZoneId || !toZoneId) return { kind: "quote" };
  const fromZone = transfersPage.zones.find((z) => z.id === fromZoneId);
  const toZone = transfersPage.zones.find((z) => z.id === toZoneId);
  if (!fromZone || !toZone || fromZone.isCustom || toZone.isCustom || fromZone.id === toZone.id) {
    return { kind: "quote" };
  }

  const intercityZone = [fromZone, toZone].find((z) => z.group === "Intercity");
  if (intercityZone) {
    const pricing = transfersPage.intercityPricing.find((p) => p.zoneId === intercityZone.id);
    const amount = pricing?.prices[vehicleId];
    return amount != null ? { kind: "priced", amount } : { kind: "quote" };
  }

  const tier = fromZone.id === "cairo-airport" || toZone.id === "cairo-airport" ? "airport" : "hotel";
  const amount = transfersPage.tierPricing[tier][vehicleId];
  return amount != null ? { kind: "priced", amount } : { kind: "quote" };
}
