import { getActor, can } from "@/lib/os/actor";
import { getPriceItems, getTiers } from "@/lib/os/pricing";
import { todayInCairo } from "@/lib/os/dates";
import { PageHeader, NoAccess, Card, CardHeader } from "@/components/os/ui";
import { Calculator } from "./Calculator";

export const dynamic = "force-dynamic";
export const metadata = { title: "Trip calculator" };

// ---------------------------------------------------------------------------
// THE TRIP CALCULATOR
// ---------------------------------------------------------------------------
// The reservation desk's answer to "how much for two people at the pyramids on
// the 14th". Every number it produces is resolved from the price book for THAT
// DATE and THAT TIER — nothing is typed from memory, and nothing is averaged.
//
// Margins are a separate permission from using the calculator, so a
// reservation agent who should quote but not see cost gets the selling price
// and nothing else.
// ---------------------------------------------------------------------------

export default async function CalculatorPage() {
  const actor = await getActor();
  if (!actor) return null;
  if (!can(actor, "pricing.calculate")) return <NoAccess what="the calculator" permission="pricing.calculate" />;

  const [items, tiers] = await Promise.all([getPriceItems(), getTiers()]);

  return (
    <>
      <PageHeader
        eyebrow="Commercial"
        title="Trip calculator"
        description="Build a costed quote in under a minute, from the rates actually in force on the trip's date."
      />

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Calculator
          items={items.map((i) => ({ id: i.id, key: i.key, name: i.name, category: i.category, unitLabel: i.unitLabel }))}
          tiers={tiers.map((t) => ({ key: t.key, label: t.label, markupPct: t.markupPct, minMarginPct: t.minMarginPct, description: t.description }))}
          today={todayInCairo()}
          showMargins={can(actor, "pricing.margins")}
        />

        <Card>
          <CardHeader title="How this prices" />
          <ul className="mt-2.5 space-y-2.5 text-[12.5px] leading-relaxed text-os-muted">
            <li>
              <span className="font-medium text-os-text">Rates are dated.</span> Each line resolves the price valid on the trip
              date you enter. A trip in March and the same trip in May can legitimately cost different amounts, and the
              calculator will show that rather than average it away.
            </li>
            <li>
              <span className="font-medium text-os-text">Tiers are multipliers, not opinions.</span> Standard adds 45%, Premium
              65%, Luxury 90%, VIP 120% — and each has a margin floor the calculator warns below.
            </li>
            <li>
              <span className="font-medium text-os-text">A missing rate is an error, not a zero.</span> If something has no
              price effective on that date, the calculator says so instead of quietly pricing it at nothing.
            </li>
            <li>
              <span className="font-medium text-os-text">Nothing is saved until you say so.</span> This is a scratchpad. When
              the client agrees, create the trip and its cost lines carry the rate ids from here.
            </li>
          </ul>
        </Card>
      </div>
    </>
  );
}
