import type { ConnectionType } from "@/types/api";

// The same tariff the API bills with (its bill.constant.ts), so the estimator
// on the tariff page and the preview in "Issue a bill" always agree with the
// bill that is actually issued. Rates are in integer paisa (1 taka = 100
// paisa) to keep the arithmetic exact.
//
// Illustrative rates, not an official BERC schedule.

export const RESIDENTIAL_SLABS = [
  { upTo: 75, paisa: 526 },
  { upTo: 200, paisa: 720 },
  { upTo: 300, paisa: 759 },
  { upTo: 400, paisa: 802 },
  { upTo: 600, paisa: 1267 },
  { upTo: Number.POSITIVE_INFINITY, paisa: 1461 },
] as const;

export const COMMERCIAL_FLAT_PAISA = 1200;
export const DEMAND_CHARGE_PAISA_PER_KW = 4200;
export const VAT_PERCENT = 5;
export const BILL_DUE_DAYS = 14;

export type TariffLine = {
  /** "76 – 200 units" */
  label: string;
  units: number;
  ratePaisa: number;
  amountPaisa: number;
};

export type BillEstimate = {
  lines: TariffLine[];
  energyPaisa: number;
  demandPaisa: number;
  vatPaisa: number;
  totalPaisa: number;
};

type BillInput = {
  unitsConsumed: number;
  connectionType: ConnectionType;
  sanctionedLoadKW: number;
};

/** "0 – 75", "76 – 200", "601 and above" */
export const slabRangeLabel = (index: number) => {
  const from = index === 0 ? 0 : RESIDENTIAL_SLABS[index - 1].upTo + 1;
  const { upTo } = RESIDENTIAL_SLABS[index];

  return Number.isFinite(upTo) ? `${from} – ${upTo}` : `${from} and above`;
};

const energyLines = (unitsConsumed: number, connectionType: ConnectionType): TariffLine[] => {
  if (connectionType === "COMMERCIAL") {
    return [
      {
        label: "Flat commercial rate",
        units: unitsConsumed,
        ratePaisa: COMMERCIAL_FLAT_PAISA,
        amountPaisa: unitsConsumed * COMMERCIAL_FLAT_PAISA,
      },
    ];
  }

  // Incremental slabs: 250 units = 75 @ slab 1 + 125 @ slab 2 + 50 @ slab 3.
  const lines: TariffLine[] = [];
  let remaining = unitsConsumed;
  let previousCap = 0;

  RESIDENTIAL_SLABS.forEach((slab, index) => {
    if (remaining <= 0) {
      return;
    }

    const units = Math.min(remaining, slab.upTo - previousCap);

    lines.push({
      label: `${slabRangeLabel(index)} units`,
      units,
      ratePaisa: slab.paisa,
      amountPaisa: units * slab.paisa,
    });
    remaining -= units;
    previousCap = slab.upTo;
  });

  return lines;
};

export const calculateBill = ({
  unitsConsumed,
  connectionType,
  sanctionedLoadKW,
}: BillInput): BillEstimate => {
  const lines = energyLines(Math.max(0, Math.floor(unitsConsumed)), connectionType);
  const energyPaisa = lines.reduce((total, line) => total + line.amountPaisa, 0);
  const demandPaisa = Math.round(sanctionedLoadKW * DEMAND_CHARGE_PAISA_PER_KW);
  const vatPaisa = Math.round(((energyPaisa + demandPaisa) * VAT_PERCENT) / 100);

  return {
    lines,
    energyPaisa,
    demandPaisa,
    vatPaisa,
    totalPaisa: energyPaisa + demandPaisa + vatPaisa,
  };
};

export const paisaToTaka = (paisa: number) => paisa / 100;
