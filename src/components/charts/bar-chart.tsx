"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

// Series colours are the theme's chart tokens, taken strictly in this order
// (never cycled, never picked by rank): a validated colour-blind-safe set.
const SERIES_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
] as const;

type Series = { key: string; label: string };

type Datum = Record<string, string | number>;

type BarChartProps = {
  data: Datum[];
  /** The field that names each bar (a day, a month, a feeder). */
  categoryKey: string;
  series: Series[];
  /** "vertical": columns over time or categories. "horizontal": ranked bars with long names. */
  orientation?: "vertical" | "horizontal";
  /** How a value reads in the tooltip, e.g. "250 kWh". */
  formatValue?: (value: number) => string;
  /** How a value reads on the axis, where space is tight. Defaults to the plain number. */
  formatTick?: (value: number) => string;
  formatCategory?: (category: string) => string;
  /** Room for the category names of a horizontal chart. */
  categoryWidth?: number;
  /** Room for the value labels of a vertical chart; widen it for money. */
  valueAxisWidth?: number;
  className?: string;
};

/**
 * The app's one bar chart. Thin bars (24px at most) with a rounded data end
 * and a square baseline, solid hairline gridlines, one value axis, and a
 * tooltip on every bar. A legend appears only when there is more than one
 * series; a single series is already named by the card's title.
 */
export function SimpleBarChart({
  data,
  categoryKey,
  series,
  orientation = "vertical",
  formatValue = (value) => String(value),
  formatTick = (value) => new Intl.NumberFormat("en", { notation: "compact" }).format(value),
  formatCategory = (category) => category,
  categoryWidth = 96,
  valueAxisWidth = 44,
  className,
}: BarChartProps) {
  const isHorizontal = orientation === "horizontal";
  const config: ChartConfig = Object.fromEntries(
    series.map((item, index) => [item.key, { label: item.label, color: SERIES_COLORS[index] }]),
  );
  // A horizontal chart grows with its rows so every label gets a line.
  const rowHeight = Math.max(series.length * 18 + 14, 36);
  const height = isHorizontal ? Math.max(data.length * rowHeight + 32, 160) : undefined;

  return (
    <ChartContainer
      config={config}
      className={cn("w-full", !isHorizontal && "aspect-auto h-64", className)}
      style={height ? { height, aspectRatio: "auto" } : undefined}
    >
      <BarChart
        accessibilityLayer
        data={data}
        layout={isHorizontal ? "vertical" : "horizontal"}
        margin={{ top: 8, right: isHorizontal ? 16 : 8, bottom: 0, left: 0 }}
        barGap={2}
      >
        <CartesianGrid
          vertical={isHorizontal}
          horizontal={!isHorizontal}
          stroke="var(--border)"
          strokeDasharray="0"
        />
        {isHorizontal ? (
          <>
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              allowDecimals={false}
              tickFormatter={formatTick}
            />
            <YAxis
              type="category"
              dataKey={categoryKey}
              tickLine={false}
              axisLine={false}
              width={categoryWidth}
              // Every row keeps its name, however many there are.
              interval={0}
              tickFormatter={formatCategory}
            />
          </>
        ) : (
          <>
            <XAxis
              dataKey={categoryKey}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={16}
              tickFormatter={formatCategory}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={valueAxisWidth}
              allowDecimals={false}
              tickFormatter={formatTick}
            />
          </>
        )}
        <ChartTooltip
          cursor={{ fill: "var(--muted)", opacity: 0.6 }}
          content={
            <ChartTooltipContent
              indicator="line"
              labelFormatter={(label) => formatCategory(String(label))}
              formatter={(value, name) => (
                <div className="flex w-full items-center justify-between gap-6">
                  <span className="text-muted-foreground">
                    {config[String(name)]?.label ?? name}
                  </span>
                  <span className="text-foreground font-mono font-medium tabular-nums">
                    {formatValue(Number(value))}
                  </span>
                </div>
              )}
            />
          }
        />
        {series.length > 1 ? <ChartLegend content={<ChartLegendContent />} /> : null}
        {series.map((item) => (
          <Bar
            key={item.key}
            dataKey={item.key}
            fill={`var(--color-${item.key})`}
            maxBarSize={24}
            // Bars of one group sit side by side instead of spreading over the band.
            barSize={series.length > 1 ? 16 : undefined}
            // Rounded at the data end, square where the bar meets the baseline.
            radius={isHorizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
}
