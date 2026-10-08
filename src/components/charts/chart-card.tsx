"use client";

import { ChartColumn, Table2 } from "lucide-react";
import { type ReactNode, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ChartTable = {
  columns: { header: string; align?: "left" | "right" }[];
  rows: (string | number)[][];
};

type ChartCardProps = {
  title: string;
  description?: string;
  /** The same data as a table: the chart's accessible, colour-free twin. */
  table: ChartTable;
  /** Shown instead of the chart when there is nothing to plot. */
  isEmpty?: boolean;
  emptyMessage?: string;
  children: ReactNode;
  className?: string;
};

/**
 * The frame around every chart. Each chart can be switched to a plain table
 * of the same numbers, so no value is reachable only by hovering or only by
 * telling colours apart.
 */
export function ChartCard({
  title,
  description,
  table,
  isEmpty = false,
  emptyMessage = "There is no data for this period yet.",
  children,
  className,
}: ChartCardProps) {
  const [view, setView] = useState<"chart" | "table">("chart");
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      className={cn("bg-card flex flex-col gap-5 rounded-2xl border p-5", className)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 id={titleId} className="font-sans text-base font-semibold tracking-normal">
            {title}
          </h2>
          {description ? <p className="text-muted-foreground text-sm">{description}</p> : null}
        </div>
        {!isEmpty ? (
          <div className="bg-muted flex shrink-0 rounded-lg p-0.5" role="group" aria-label="View as">
            {(
              [
                { id: "chart", label: "Chart", icon: ChartColumn },
                { id: "table", label: "Table", icon: Table2 },
              ] as const
            ).map((option) => (
              <Button
                key={option.id}
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Show as ${option.label.toLowerCase()}`}
                aria-pressed={view === option.id}
                onClick={() => setView(option.id)}
                className={cn(
                  "text-muted-foreground",
                  view === option.id && "bg-background text-foreground shadow-xs hover:bg-background",
                )}
              >
                <option.icon />
              </Button>
            ))}
          </div>
        ) : null}
      </div>

      {isEmpty ? (
        <p className="text-muted-foreground grid min-h-40 place-items-center rounded-xl border border-dashed px-4 text-center text-sm">
          {emptyMessage}
        </p>
      ) : view === "chart" ? (
        children
      ) : (
        <div className="max-h-80 overflow-auto rounded-xl border">
          <table className="w-full text-sm">
            <caption className="sr-only">{title}</caption>
            <thead className="bg-muted/60 sticky top-0">
              <tr>
                {table.columns.map((column) => (
                  <th
                    key={column.header}
                    scope="col"
                    className={cn(
                      "text-muted-foreground px-3 py-2 text-xs font-medium",
                      column.align === "right" ? "text-right" : "text-left",
                    )}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-t">
                  {row.map((value, cellIndex) => (
                    <td
                      key={cellIndex}
                      className={cn(
                        "nums px-3 py-2",
                        table.columns[cellIndex]?.align === "right" && "text-right",
                      )}
                    >
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
