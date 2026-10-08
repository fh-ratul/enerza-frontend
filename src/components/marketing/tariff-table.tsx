import {
  COMMERCIAL_FLAT_PAISA,
  DEMAND_CHARGE_PAISA_PER_KW,
  paisaToTaka,
  RESIDENTIAL_SLABS,
  slabRangeLabel,
  VAT_PERCENT,
} from "@/lib/tariff";
import { cn } from "@/lib/utils";

const rate = (paisa: number) => `৳${paisaToTaka(paisa).toFixed(2)}`;

/** The residential slabs as a table, with the other charges underneath. */
export function TariffTable({ className }: { className?: string }) {
  return (
    <div className={cn("bg-card overflow-hidden rounded-3xl border", className)}>
      <table className="w-full text-sm">
        <caption className="sr-only">Residential electricity tariff by consumption slab</caption>
        <thead>
          <tr className="bg-muted/60 text-muted-foreground text-left">
            <th scope="col" className="px-5 py-3.5 font-medium sm:px-6">
              Units in the month (kWh)
            </th>
            <th scope="col" className="px-5 py-3.5 text-right font-medium sm:px-6">
              Rate per unit
            </th>
          </tr>
        </thead>
        <tbody>
          {RESIDENTIAL_SLABS.map((slab, index) => (
            <tr key={slab.upTo} className="border-t">
              <th scope="row" className="nums px-5 py-3.5 text-left font-medium sm:px-6">
                {slabRangeLabel(index)}
              </th>
              <td className="nums px-5 py-3.5 text-right font-mono sm:px-6">{rate(slab.paisa)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <dl className="bg-muted/40 grid gap-px border-t sm:grid-cols-3">
        {[
          { term: "Commercial, flat", detail: `${rate(COMMERCIAL_FLAT_PAISA)} per unit` },
          { term: "Demand charge", detail: `${rate(DEMAND_CHARGE_PAISA_PER_KW)} per kW` },
          { term: "VAT", detail: `${VAT_PERCENT}% of energy + demand` },
        ].map((item) => (
          <div key={item.term} className="bg-card flex flex-col gap-0.5 px-5 py-4 sm:px-6">
            <dt className="text-muted-foreground text-xs">{item.term}</dt>
            <dd className="nums text-sm font-medium">{item.detail}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
