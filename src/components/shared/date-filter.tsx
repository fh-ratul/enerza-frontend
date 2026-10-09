"use client";

import { Input } from "@/components/ui/input";
import { useUrlState } from "@/hooks/use-url-state";
import { isoDate } from "@/lib/list-params";
import { cn } from "@/lib/utils";

type DateFilterProps = {
  /** The URL parameter this filter reads and writes, e.g. "from". */
  paramKey: string;
  /** Shown before the date and read by screen readers, e.g. "From". */
  label: string;
  /** Keeps a range the right way round: the other end of it. */
  min?: string;
  max?: string;
  /** "date" (a day) or "month". */
  type?: "date" | "month";
  className?: string;
};

/** A day or month filter whose value lives in the URL. */
export function DateFilter({ paramKey, label, min, max, type = "date", className }: DateFilterProps) {
  const { get, set } = useUrlState();
  const current = get(paramKey);
  const value = type === "date" ? (isoDate(current) ?? "") : (current ?? "");

  return (
    <label
      className={cn(
        "text-muted-foreground flex w-full items-center gap-2 text-sm sm:w-auto",
        className,
      )}
    >
      <span className="shrink-0">{label}</span>
      <Input
        type={type}
        value={value}
        min={min}
        max={max}
        onChange={(event) => set({ [paramKey]: event.target.value || null })}
        className="text-foreground w-full sm:w-40"
      />
    </label>
  );
}
