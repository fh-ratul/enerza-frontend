"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUrlState } from "@/hooks/use-url-state";
import { cn } from "@/lib/utils";

// Radix Select has no empty value, so "no filter" needs a value of its own.
const ALL = "__all__";

export type FilterOption = { value: string; label: string };

type FilterSelectProps = {
  /** The URL parameter this filter reads and writes. */
  paramKey: string;
  /** Accessible name, e.g. "Zone". */
  label: string;
  /** What the "no filter" choice is called, e.g. "All zones". */
  allLabel: string;
  options: FilterOption[];
  className?: string;
};

/** A dropdown filter whose value lives in the URL. */
export function FilterSelect({ paramKey, label, allLabel, options, className }: FilterSelectProps) {
  const { get, set } = useUrlState();
  const current = get(paramKey);
  // A value that is no longer offered (a stale link) falls back to "all".
  const value = options.some((option) => option.value === current) ? (current as string) : ALL;

  return (
    <Select value={value} onValueChange={(next) => set({ [paramKey]: next === ALL ? null : next })}>
      <SelectTrigger aria-label={label} className={cn("w-full sm:w-44", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
