"use client";

import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { useMemo, useState } from "react";
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
import type { AreaOption } from "@/features/grid/area-options";
import { cn } from "@/lib/utils";

type AreaComboboxProps = {
  id?: string;
  areas: AreaOption[];
  value: string | undefined;
  onChange: (areaId: string) => void;
  onBlur?: () => void;
  invalid?: boolean;
  describedBy?: string;
  disabled?: boolean;
};

/** A searchable list of every area on the grid, grouped by zone. */
export function AreaCombobox({
  id,
  areas,
  value,
  onChange,
  onBlur,
  invalid,
  describedBy,
  disabled,
}: AreaComboboxProps) {
  const [open, setOpen] = useState(false);
  const selected = areas.find((area) => area.id === value);

  const zones = useMemo(() => {
    const byZone = new Map<string, AreaOption[]>();

    for (const area of areas) {
      byZone.set(area.zoneName, [...(byZone.get(area.zoneName) ?? []), area]);
    }

    return [...byZone.entries()].map(([zoneName, zoneAreas]) => ({
      zoneName,
      areas: zoneAreas.sort((a, b) => a.name.localeCompare(b.name)),
    }));
  }, [areas]);

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
          aria-describedby={describedBy}
          disabled={disabled}
          className="h-9 w-full justify-between px-3 font-normal"
        >
          {selected ? (
            <span className="flex min-w-0 items-center gap-2">
              <MapPin className="text-muted-foreground" aria-hidden />
              <span className="truncate">
                {selected.name}
                <span className="text-muted-foreground"> · {selected.zoneName}</span>
              </span>
            </span>
          ) : (
            <span className="text-muted-foreground">Search for your area…</span>
          )}
          <ChevronsUpDown className="text-muted-foreground" aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) min-w-64 p-0" align="start">
        <Command>
          <CommandInput placeholder="Type an area name…" />
          <CommandList>
            <CommandEmpty>No area by that name is on the grid yet.</CommandEmpty>
            {zones.map((zone) => (
              <CommandGroup key={zone.zoneName} heading={zone.zoneName}>
                {zone.areas.map((area) => (
                  <CommandItem
                    key={area.id}
                    // cmdk filters on this text, so the feeder name is searchable too.
                    value={`${area.name} ${area.feederName}`}
                    onSelect={() => {
                      onChange(area.id);
                      setOpen(false);
                    }}
                  >
                    <div className="flex min-w-0 flex-col">
                      <span>{area.name}</span>
                      <span className="text-muted-foreground truncate text-xs">
                        {area.feederName}
                      </span>
                    </div>
                    <Check
                      className={cn("ml-auto", area.id === value ? "opacity-100" : "opacity-0")}
                      aria-hidden
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
