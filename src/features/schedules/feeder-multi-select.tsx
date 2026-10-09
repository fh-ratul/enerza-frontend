"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatMW } from "@/lib/format";
import { FEEDER_PRIORITY } from "@/lib/status";
import { cn } from "@/lib/utils";
import type { Feeder } from "@/types/api";

type FeederMultiSelectProps = {
  id?: string;
  feeders: Feeder[];
  value: string[];
  onChange: (feederIds: string[]) => void;
  onBlur?: () => void;
  max: number;
  invalid?: boolean;
  /** Why a feeder cannot be chosen, or null when it can. */
  disabledReason?: (feeder: Feeder) => string | null;
};

/** A searchable list of feeders to tick, grouped by zone. */
export function FeederMultiSelect({
  id,
  feeders,
  value,
  onChange,
  onBlur,
  max,
  invalid,
  disabledReason,
}: FeederMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const selected = new Set(value);
  const zones = Map.groupBy(feeders, (feeder) => feeder.substation.zone.name);

  const toggle = (feederId: string) => {
    if (selected.has(feederId)) {
      onChange(value.filter((item) => item !== feederId));
    } else if (value.length < max) {
      onChange([...value, feederId]);
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);

        if (!next) {
          onBlur?.();
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid}
          className="h-9 w-full justify-between px-3 font-normal"
        >
          {value.length === 0 ? (
            <span className="text-muted-foreground">Choose feeders…</span>
          ) : (
            <span className="truncate">
              {value.length === 1
                ? (feeders.find((feeder) => feeder.id === value[0])?.name ?? "1 feeder")
                : `${value.length} feeders selected`}
            </span>
          )}
          <ChevronsUpDown className="text-muted-foreground" aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) min-w-72 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search a feeder…" />
          <CommandList>
            <CommandEmpty>No feeder by that name.</CommandEmpty>
            {[...zones.entries()].map(([zoneName, zoneFeeders]) => (
              <CommandGroup key={zoneName} heading={zoneName}>
                {zoneFeeders.map((feeder) => {
                  const reason = disabledReason?.(feeder) ?? null;
                  const isSelected = selected.has(feeder.id);

                  return (
                    <CommandItem
                      key={feeder.id}
                      value={`${feeder.name} ${feeder.code}`}
                      disabled={reason !== null || (!isSelected && value.length >= max)}
                      onSelect={() => toggle(feeder.id)}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "grid size-4 shrink-0 place-items-center rounded-sm border",
                          isSelected && "border-primary bg-primary text-primary-foreground",
                        )}
                      >
                        {isSelected ? <Check className="size-3" /> : null}
                      </span>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate">{feeder.name}</span>
                        <span className="text-muted-foreground truncate text-xs">
                          {reason ??
                            `${feeder.code} · ${formatMW(feeder.loadMW)} · ${FEEDER_PRIORITY[feeder.priority].label}`}
                        </span>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
