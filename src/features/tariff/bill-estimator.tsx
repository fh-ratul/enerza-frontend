"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Calculator } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { SelectField, TextField } from "@/components/shared/form-fields";
import { FieldGroup } from "@/components/ui/field";
import { formatMoney } from "@/lib/format";
import { calculateBill, paisaToTaka, VAT_PERCENT } from "@/lib/tariff";
import { cn } from "@/lib/utils";

const reading = (label: string) =>
  z
    .number(`${label} is required`)
    .int(`${label} must be a whole number`)
    .min(0, `${label} cannot be negative`)
    .max(99_999_999, `${label} is too large`);

const estimatorSchema = z
  .object({
    connectionType: z.enum(["RESIDENTIAL", "COMMERCIAL"]),
    previousReading: reading("Previous reading"),
    currentReading: reading("Current reading"),
    sanctionedLoadKW: z
      .number("Sanctioned load is required")
      .min(0.5, "Sanctioned load must be at least 0.5 kW")
      .max(500, "Sanctioned load cannot exceed 500 kW"),
  })
  .refine((values) => values.currentReading >= values.previousReading, {
    path: ["currentReading"],
    message: "The current reading cannot be lower than the previous one",
  });

type EstimatorValues = z.infer<typeof estimatorSchema>;

const defaultValues: EstimatorValues = {
  connectionType: "RESIDENTIAL",
  previousReading: 1200,
  currentReading: 1450,
  sanctionedLoadKW: 2,
};

const money = (paisa: number) => formatMoney(paisaToTaka(paisa));

/**
 * Works out a bill in the browser with the same tariff and the same integer
 * arithmetic the API uses, updating as the visitor types.
 */
export function BillEstimator() {
  const form = useForm<EstimatorValues>({
    resolver: zodResolver(estimatorSchema),
    defaultValues,
    mode: "onChange",
  });
  const values = useWatch({ control: form.control });
  const parsed = estimatorSchema.safeParse(values);
  const estimate = parsed.success
    ? calculateBill({
        unitsConsumed: parsed.data.currentReading - parsed.data.previousReading,
        connectionType: parsed.data.connectionType,
        sanctionedLoadKW: parsed.data.sanctionedLoadKW,
      })
    : null;
  const units = parsed.success ? parsed.data.currentReading - parsed.data.previousReading : 0;

  return (
    <div className="bg-card grid overflow-hidden rounded-3xl border lg:grid-cols-2">
      <form className="p-6 sm:p-8" noValidate onSubmit={(event) => event.preventDefault()}>
        <div className="mb-6 flex items-center gap-3">
          <span className="bg-primary/20 dark:bg-primary/15 dark:text-primary grid size-10 place-items-center rounded-xl">
            <Calculator className="size-5" aria-hidden />
          </span>
          <div>
            <h3 className="text-lg font-semibold">Bill estimator</h3>
            <p className="text-muted-foreground text-sm">Updates as you type</p>
          </div>
        </div>
        <FieldGroup>
          <SelectField
            control={form.control}
            name="connectionType"
            label="Connection type"
            options={[
              { value: "RESIDENTIAL", label: "Residential (slab tariff)" },
              { value: "COMMERCIAL", label: "Commercial (flat rate)" },
            ]}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              control={form.control}
              name="previousReading"
              label="Previous reading (kWh)"
              type="number"
              inputMode="numeric"
              min={0}
            />
            <TextField
              control={form.control}
              name="currentReading"
              label="Current reading (kWh)"
              type="number"
              inputMode="numeric"
              min={0}
            />
          </div>
          <TextField
            control={form.control}
            name="sanctionedLoadKW"
            label="Sanctioned load (kW)"
            description="The load your connection is approved for. Most homes are 2 kW."
            type="number"
            inputMode="decimal"
            step={0.5}
            min={0.5}
          />
        </FieldGroup>
      </form>

      <div
        className="bg-ink text-ink-foreground flex flex-col p-6 sm:p-8"
        aria-live="polite"
        aria-atomic
      >
        <p className="text-sm text-white/60">Estimated bill</p>
        <p
          className={cn(
            "font-heading nums mt-1 text-4xl font-bold sm:text-5xl",
            !estimate && "text-white/40",
          )}
        >
          {estimate ? money(estimate.totalPaisa) : "৳—"}
        </p>
        <p className="mt-1 text-sm text-white/60">
          {estimate
            ? `for ${units} ${units === 1 ? "unit" : "units"} this month`
            : "Correct the readings to see an estimate"}
        </p>

        {estimate ? (
          <table className="mt-8 w-full text-sm">
            <caption className="sr-only">How the estimated bill is made up</caption>
            <tbody>
              {estimate.lines.map((line) => (
                <tr key={line.label} className="border-b border-white/10">
                  <th scope="row" className="py-2.5 pr-3 text-left font-normal text-white/75">
                    {line.label}
                    <span className="nums block text-xs text-white/45">
                      {line.units} × {money(line.ratePaisa)}
                    </span>
                  </th>
                  <td className="nums py-2.5 text-right font-mono">{money(line.amountPaisa)}</td>
                </tr>
              ))}
              <tr className="border-b border-white/10">
                <th scope="row" className="py-2.5 pr-3 text-left font-normal text-white/75">
                  Demand charge
                </th>
                <td className="nums py-2.5 text-right font-mono">{money(estimate.demandPaisa)}</td>
              </tr>
              <tr className="border-b border-white/10">
                <th scope="row" className="py-2.5 pr-3 text-left font-normal text-white/75">
                  VAT ({VAT_PERCENT}%)
                </th>
                <td className="nums py-2.5 text-right font-mono">{money(estimate.vatPaisa)}</td>
              </tr>
              <tr>
                <th scope="row" className="pt-3.5 pr-3 text-left font-semibold">
                  Total
                </th>
                <td className="nums text-primary pt-3.5 text-right font-mono font-semibold">
                  {money(estimate.totalPaisa)}
                </td>
              </tr>
            </tbody>
          </table>
        ) : null}

        <p className="mt-auto pt-8 text-xs leading-relaxed text-white/45">
          An estimate from the published tariff. Your actual bill uses the readings taken at your
          meter.
        </p>
      </div>
    </div>
  );
}
